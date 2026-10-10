"""Сведение извлечённого в заказы и все расчёты.

Два принципа, ради которых это отдельный модуль:

1. Считает только Python. Модель приносит то, что написано в бумаге; суммы,
   остатки и просрочки выводятся здесь, детерминированно и воспроизводимо.
2. Противоречие между документами не разрешается молча. Если спецификация
   говорит одну цену, а накладная другую — берётся более доверенный источник,
   а расхождение остаётся видимым: именно в таких местах и прячутся деньги.
"""
from __future__ import annotations

import re
from dataclasses import dataclass, field
from datetime import date, datetime, timedelta

# Чем ниже в списке тип документа, тем меньше ему веры по этому полю.
# Подписанная спецификация важнее листа заказа, накладная важнее CMR,
# а сводный реестр — последний в очереди: он сам собран руками.
TRUST: dict[str, list[str]] = {
    "unit_price":   ["specification", "tax_invoice", "invoice", "waybill", "packing_list", "order_sheet", "cmr", "registry"],
    "ordered_qty":  ["specification", "order_sheet", "registry"],
    "item":         ["specification", "order_sheet", "invoice", "waybill", "cmr", "registry"],
    "shipped_qty":  ["waybill", "tax_invoice", "invoice", "packing_list", "cmr", "registry"],
    "shipment_date": ["cmr", "waybill", "invoice", "packing_list", "tax_invoice", "registry"],
    "places":       ["cmr", "packing_list", "waybill", "registry"],
    "weight_gross": ["cmr", "packing_list", "waybill", "registry"],
    "weight_net":   ["packing_list", "waybill", "cmr"],
    "driver":       ["cmr", "waybill"],
    "vehicle_plate": ["cmr", "waybill"],
    "order_no":     ["order_sheet", "specification", "registry"],
    "item_article": ["order_sheet", "specification"],
}
DEFAULT_TRUST = ["specification", "contract", "waybill", "invoice", "cmr", "order_sheet", "registry", "other"]

MONEY_EPS = 0.05        # меньше копейки расхождения — округление, а не ошибка
PREPAY_EPS = 1.0        # аванс сходится с точностью до рубля
NON_PAYMENT_KINDS = {"перенос"}   # переносы не являются оплатой, считаются отдельно


@dataclass
class Value:
    """Значение поля вместе с тем, откуда оно взято."""

    value: object
    source: str          # имя файла
    doc_type: str

    def __repr__(self) -> str:  # для читаемых диффов в тестах
        return f"{self.value!r}←{self.source}"


@dataclass
class Flag:
    level: str           # error | warn | info
    code: str
    message: str


@dataclass
class Payment:
    kind: str
    date: date | None
    amount: float
    source: str
    purpose: str | None = None
    doc_number: str | None = None

    @property
    def counts_as_paid(self) -> bool:
        return self.kind not in NON_PAYMENT_KINDS


@dataclass
class Order:
    """Заказ, собранный из всех документов, которые на него сослались."""

    key: str
    contract_no: str | None = None
    fields: dict[str, Value] = field(default_factory=dict)
    conflicts: dict[str, list[Value]] = field(default_factory=dict)
    payments: list[Payment] = field(default_factory=list)
    documents: list[dict] = field(default_factory=list)
    terms: dict[str, float] = field(default_factory=dict)
    flags: list[Flag] = field(default_factory=list)
    computed: dict[str, float | int | None] = field(default_factory=dict)
    raw: list[dict] = field(default_factory=list, repr=False)

    def get(self, name: str):
        v = self.fields.get(name)
        return v.value if v else None

    def source_of(self, name: str) -> str | None:
        v = self.fields.get(name)
        return v.source if v else None


# --------------------------------------------------------------------------- сборка

def build(extractions: list[dict]) -> tuple[list[Order], list[dict]]:
    """Разложить пачку разобранных документов по заказам.

    Возвращает (заказы, неприкаянные) — второе это документы, которые не удалось
    отнести ни к одному заказу: без номера договора их некуда класть.
    """
    orders: dict[str, Order] = {}
    orphans: list[dict] = []

    # Сводный реестр разворачиваем в псевдодокументы: по одному на строку.
    expanded: list[dict] = []
    for ex in extractions:
        expanded.append(ex)
        for row in ex.get("orders") or []:
            expanded.append(_row_as_doc(row, ex))

    for ex in expanded:
        if ex.get("unreadable") and not ex.get("payments"):
            orphans.append(_orphan(ex, "документ не распознан"))
            continue
        targets = _targets(ex)
        if not targets:
            orphans.append(_orphan(ex, "не указан номер договора — некуда отнести"))
            continue
        for key, contract_no in targets:
            order = orders.setdefault(key, Order(key=key))
            order.contract_no = order.contract_no or contract_no
            _absorb(order, ex, only_contract=contract_no)

    _reconcile_order_only(orders)
    for order in orders.values():
        compute(order)
    return sorted(orders.values(), key=_sort_key), orphans


def _reconcile_order_only(orders: dict[str, Order]) -> None:
    """Пришить документы без номера договора к их заказу.

    Лист заказа номера договора не несёт — в бумаге его просто нет. Связать
    такой документ можно только по совпадениям: внутренний номер заказа,
    заказанное количество, дата. Склеиваем, лишь когда совпало минимум два
    признака и кандидат единственный, иначе ошибка будет тихой и хуже пропажи.
    """
    loose = [o for k, o in orders.items() if k.startswith("order:")]
    known = [o for k, o in orders.items() if not k.startswith("order:")]
    for stray in loose:
        scored = [(s, o) for o in known if (s := _affinity(stray, o)) >= 2]
        scored.sort(key=lambda p: -p[0])
        if not scored or (len(scored) > 1 and scored[0][0] == scored[1][0]):
            continue
        target = scored[0][1]
        for ex in stray.raw:
            _absorb(target, ex, only_contract=None)
        target.flags.append(Flag(
            "info", "linked_by_match",
            f"Документы без номера договора привязаны по совпадению: "
            f"{', '.join(d['file'] for d in stray.documents)}."))
        del orders[stray.key]


def _affinity(stray: Order, candidate: Order) -> int:
    score = 0
    a, b = stray.get("order_no"), candidate.get("order_no")
    if a and b and _norm_order_no(a) == _norm_order_no(b):
        score += 3
    if _eq_num(stray.get("ordered_qty"), candidate.get("ordered_qty")):
        score += 1
    if _eq_num(stray.get("unit_price"), candidate.get("unit_price")):
        score += 1
    stray_dates = {d.get("doc_date") for d in stray.documents if d.get("doc_date")}
    cand_dates = {d.get("doc_date") for d in candidate.documents if d.get("doc_date")}
    if stray_dates & cand_dates:
        score += 1
    if _same_text(stray.get("item"), candidate.get("item")):
        score += 1
    return score


def _eq_num(a, b) -> bool:
    a, b = _num(a), _num(b)
    return a is not None and b is not None and abs(a - b) < 0.005


def _same_text(a, b) -> bool:
    """Нестрогое сравнение названий: «костюм летний с шортами» в разных бумагах
    пишут по-разному, но общие слова выдают одно и то же изделие."""
    if not a or not b:
        return False
    wa = {w for w in re.findall(r"\w{4,}", str(a).casefold())}
    wb = {w for w in re.findall(r"\w{4,}", str(b).casefold())}
    return bool(wa & wb) and len(wa & wb) >= min(2, len(wa), len(wb))


def _targets(ex: dict) -> list[tuple[str, str | None]]:
    """К каким заказам относится документ. Выписка — сразу к нескольким."""
    own = normalize_contract(ex.get("contract_no"))
    out: list[tuple[str, str | None]] = []
    if own:
        out.append((own, ex.get("contract_no")))
    for pay in ex.get("payments") or []:
        key = normalize_contract(pay.get("contract_no"))
        if key and key not in {k for k, _ in out}:
            out.append((key, pay.get("contract_no")))
    if not out and ex.get("order_no"):
        out.append((f"order:{_norm_order_no(ex['order_no'])}", None))
    return out


def _absorb(order: Order, ex: dict, only_contract: str | None) -> None:
    doc_type = ex.get("doc_type") or "other"
    src = ex.get("_source_file") or "?"

    order.raw.append(ex)
    order.documents.append({
        "file": src, "doc_type": doc_type, "doc_number": ex.get("doc_number"),
        "doc_date": ex.get("doc_date"), "confidence": ex.get("confidence"),
        "notes": ex.get("notes"), "kind": ex.get("_source_kind"),
    })

    _put(order, "order_no", ex.get("order_no"), src, doc_type)
    item = ex.get("item") or {}
    _put(order, "item", item.get("name"), src, doc_type)
    _put(order, "item_color", item.get("color"), src, doc_type)
    _put(order, "item_article", item.get("article"), src, doc_type)
    _put(order, "item_composition", item.get("composition"), src, doc_type)

    ordered = ex.get("ordered") or {}
    _put(order, "ordered_qty", ordered.get("qty"), src, doc_type)
    _put(order, "unit_price", ordered.get("unit_price"), src, doc_type)
    _put(order, "stated_order_sum", ordered.get("stated_total"), src, doc_type)

    sh = ex.get("shipment") or {}
    _put(order, "shipment_date", sh.get("date"), src, doc_type)
    _put(order, "shipped_qty", sh.get("qty"), src, doc_type)
    _put(order, "places", sh.get("places"), src, doc_type)
    _put(order, "weight_gross", sh.get("weight_gross"), src, doc_type)
    _put(order, "weight_net", sh.get("weight_net"), src, doc_type)
    _put(order, "stated_shipment_sum", sh.get("stated_amount"), src, doc_type)
    _put(order, "driver", sh.get("driver"), src, doc_type)
    _put(order, "vehicle_plate", sh.get("vehicle_plate"), src, doc_type)
    _put(order, "route_from", sh.get("route_from"), src, doc_type)
    _put(order, "route_to", sh.get("route_to"), src, doc_type)

    for name, val in (ex.get("terms") or {}).items():
        if val is not None and name not in order.terms:
            order.terms[name] = val

    for pay in ex.get("payments") or []:
        if only_contract and pay.get("contract_no"):
            if normalize_contract(pay["contract_no"]) != normalize_contract(only_contract):
                continue
        amount = _num(pay.get("amount"))
        if amount is None:
            continue
        candidate = Payment(
            kind=(pay.get("kind") or "неизвестно").lower(),
            date=_date(pay.get("date")), amount=amount, source=src,
            purpose=pay.get("purpose"), doc_number=pay.get("doc_number"),
        )
        if not _duplicate(order.payments, candidate):
            order.payments.append(candidate)


def _put(order: Order, name: str, value, src: str, doc_type: str) -> None:
    """Положить значение, разрешив конфликт по доверию к типу документа."""
    if value is None or (isinstance(value, str) and not value.strip()):
        return
    if isinstance(value, str):
        value = value.strip()
    incoming = Value(value, src, doc_type)
    current = order.fields.get(name)
    if current is None:
        order.fields[name] = incoming
        return
    if _same(current.value, value):
        return
    order.conflicts.setdefault(name, [current]).append(incoming)
    if _rank(name, doc_type) < _rank(name, current.doc_type):
        order.fields[name] = incoming


def _rank(field_name: str, doc_type: str) -> int:
    order = TRUST.get(field_name, DEFAULT_TRUST)
    return order.index(doc_type) if doc_type in order else len(order) + 1


def _same(a, b) -> bool:
    if isinstance(a, (int, float)) and isinstance(b, (int, float)):
        return abs(float(a) - float(b)) < 0.005
    return str(a).strip().casefold() == str(b).strip().casefold()


def _duplicate(existing: list[Payment], new: Payment) -> bool:
    """Один платёж часто приходит дважды: платёжкой и строкой выписки."""
    for p in existing:
        if abs(p.amount - new.amount) < 0.01 and p.date == new.date:
            return True
    return False


# --------------------------------------------------------------------------- расчёты

def compute(order: Order) -> Order:
    """Все производные величины и проверки. Чистая функция по отношению к входу."""
    order.flags = []
    c: dict[str, float | int | None] = {}

    qty = _num(order.get("ordered_qty"))
    price = _num(order.get("unit_price"))
    shipped = _num(order.get("shipped_qty"))

    c["order_sum"] = _round(qty * price) if qty is not None and price is not None else None
    c["shipment_sum"] = _round(shipped * price) if shipped is not None and price is not None else None

    paid = sum(p.amount for p in order.payments if p.counts_as_paid)
    transfers = sum(p.amount for p in order.payments if not p.counts_as_paid)
    c["paid"] = _round(paid)
    c["transfers"] = _round(transfers)

    if c["shipment_sum"] is not None:
        c["remainder"] = _round(c["shipment_sum"] - paid - transfers)
        c["remainder_units"] = _round(c["remainder"] / price, 1) if price else None
    else:
        c["remainder"] = None
        c["remainder_units"] = None

    prepay = next((p for p in order.payments if p.kind == "предоплата"), None)
    c["prepay"] = prepay.amount if prepay else None
    c["prepay_date"] = prepay.date.isoformat() if prepay and prepay.date else None

    order.computed = c
    _check_sums(order, c)
    _check_prepay(order, c, prepay)
    _check_quantities(order, qty, shipped)
    _check_deadline(order, c, prepay)
    _check_completeness(order)
    _check_conflicts(order)
    return order


def _check_sums(order: Order, c: dict) -> None:
    stated = _num(order.get("stated_order_sum"))
    if stated is not None and c["order_sum"] is not None and abs(stated - c["order_sum"]) > MONEY_EPS:
        order.flags.append(Flag(
            "warn", "order_sum_mismatch",
            f"Сумма заказа в документе {_m(stated)} ≠ количество × цена {_m(c['order_sum'])}. "
            f"Требуется сверка (источник: {order.source_of('stated_order_sum')})."))
    stated_ship = _num(order.get("stated_shipment_sum"))
    if stated_ship is not None and c["shipment_sum"] is not None and abs(stated_ship - c["shipment_sum"]) > MONEY_EPS:
        order.flags.append(Flag(
            "error", "shipment_sum_mismatch",
            f"Сумма отправки в документе {_m(stated_ship)} ≠ отгружено × цена {_m(c['shipment_sum'])}. "
            f"Разница {_m(abs(stated_ship - c['shipment_sum']))} — проверьте накладную "
            f"({order.source_of('stated_shipment_sum')})."))


def _check_prepay(order: Order, c: dict, prepay: Payment | None) -> None:
    if prepay is None or c["order_sum"] is None:
        return
    percent = order.terms.get("prepay_percent") or 50.0
    expected = _round(c["order_sum"] * percent / 100)
    if abs(prepay.amount - expected) > PREPAY_EPS:
        order.flags.append(Flag(
            "warn", "prepay_deviation",
            f"Предоплата {_m(prepay.amount)} вместо {percent:g}% = {_m(expected)} "
            f"(разница {_m(prepay.amount - expected)})."))


def _check_quantities(order: Order, qty: float | None, shipped: float | None) -> None:
    if qty is None or shipped is None:
        return
    delta = shipped - qty
    if delta > 0:
        price = _num(order.get("unit_price")) or 0
        order.flags.append(Flag(
            "warn", "overdelivery",
            f"Отгружено на {delta:g} шт больше заказа ({shipped:g} против {qty:g}, "
            f"+{delta / qty * 100:.1f}%) на {_m(delta * price)}. Нужно допсоглашение к спецификации."))
    elif delta < 0:
        order.flags.append(Flag(
            "info", "underdelivery",
            f"Недопоставка {abs(delta):g} шт: отгружено {shipped:g} из {qty:g}."))


def _check_deadline(order: Order, c: dict, prepay: Payment | None) -> None:
    ship_date = _date(order.get("shipment_date"))
    if prepay is None or not prepay.date or not ship_date:
        return
    lead = int(order.terms.get("lead_time_days") or 7)
    due = prepay.date + timedelta(days=lead)
    overdue = (ship_date - due).days
    c["due_date"] = due.isoformat()
    c["overdue_days"] = overdue
    if overdue <= 0:
        return
    rate = order.terms.get("penalty_percent_per_day")
    penalty = _round(c["order_sum"] * rate / 100 * overdue) if rate and c["order_sum"] else None
    c["penalty"] = penalty
    tail = f" Неустойка по условиям {rate:g}%/день: {_m(penalty)}." if penalty else ""
    order.flags.append(Flag(
        "warn", "late_shipment",
        f"Отгрузка {ship_date.isoformat()} при сроке до {due.isoformat()} — просрочка {overdue} дн.{tail}"))


def _check_completeness(order: Order) -> None:
    missing = [label for name, label in (
        ("unit_price", "цена"), ("ordered_qty", "заказанное количество"),
        ("shipped_qty", "отгруженное количество"),
    ) if order.get(name) is None]
    if missing:
        order.flags.append(Flag("error", "missing_fields",
                                "Не найдено в документах: " + ", ".join(missing) + "."))
    types = {d["doc_type"] for d in order.documents}
    if order.get("shipped_qty") is not None and not ({"waybill", "cmr", "invoice"} & types):
        order.flags.append(Flag("info", "no_shipping_doc",
                                "Отгрузка есть, но накладной или CMR среди документов нет."))
    if order.payments and not any(p.kind == "предоплата" for p in order.payments):
        order.flags.append(Flag("info", "no_prepay_doc", "Платежи есть, но предоплата среди них не найдена."))


def _check_conflicts(order: Order) -> None:
    for name, values in order.conflicts.items():
        chosen = order.fields.get(name)
        variants = " / ".join(f"{v.value!r} ({v.source})" for v in values)
        order.flags.append(Flag(
            "warn", "conflict",
            f"Поле «{name}» расходится между документами: {variants}. "
            f"Принято {chosen.value!r} из {chosen.source}." if chosen else
            f"Поле «{name}» расходится: {variants}."))


# --------------------------------------------------------------------------- мелочи

def normalize_contract(raw: str | None) -> str | None:
    """«666/1-1», «дог. 666/1-1 от 13.04.2026», «№666» → «666»."""
    if not raw:
        return None
    m = re.search(r"\d{2,6}", str(raw))
    return m.group(0) if m else None


def _norm_order_no(raw: str) -> str:
    return re.sub(r"\s+", "", str(raw)).casefold()


def _row_as_doc(row: dict, parent: dict) -> dict:
    """Строку сводного реестра приводим к форме обычного документа."""
    return {
        "doc_type": "registry", "confidence": parent.get("confidence", 0.5),
        "contract_no": row.get("contract_no"), "order_no": row.get("order_no"),
        "doc_number": None, "doc_date": parent.get("doc_date"),
        "parties": parent.get("parties") or {},
        "item": {"name": row.get("item"), "color": None, "composition": None,
                 "article": None, "size_range": None},
        "ordered": {"qty": row.get("ordered_qty"), "unit_price": row.get("unit_price"),
                    "stated_total": row.get("stated_order_sum")},
        "shipment": {"date": row.get("shipment_date"), "qty": row.get("shipped_qty"),
                     "places": None, "weight_gross": None, "weight_net": None,
                     "stated_amount": row.get("stated_shipment_sum"), "driver": None,
                     "vehicle": None, "vehicle_plate": None, "route_from": None, "route_to": None},
        "payments": [], "orders": [], "terms": {},
        "unreadable": False, "notes": None,
        "_source_file": parent.get("_source_file"), "_source_kind": "registry_row",
    }


def _orphan(ex: dict, reason: str) -> dict:
    return {"file": ex.get("_source_file"), "doc_type": ex.get("doc_type"),
            "reason": reason, "notes": ex.get("notes")}


def _num(v) -> float | None:
    if v is None or isinstance(v, bool):
        return None
    if isinstance(v, (int, float)):
        return float(v)
    s = re.sub(r"[^\d,.\-]", "", str(v)).replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def _date(v) -> date | None:
    if isinstance(v, date):
        return v
    if not v:
        return None
    for fmt in ("%Y-%m-%d", "%d.%m.%Y", "%d.%m.%y"):
        try:
            return datetime.strptime(str(v).strip(), fmt).date()
        except ValueError:
            continue
    return None


def _round(v: float | None, digits: int = 2) -> float | None:
    return None if v is None else round(v + 0.0, digits)


def _m(v: float | None) -> str:
    if v is None:
        return "—"
    return f"{v:,.2f}".replace(",", " ").replace(".", ",") + " ₽"


def _sort_key(order: Order):
    d = _date(order.get("shipment_date"))
    return (d or date(2100, 1, 1), order.key)
