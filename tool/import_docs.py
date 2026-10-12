#!/usr/bin/env python3
"""Перенос вычитанных документов в data/orders.json.

На вход идёт то, что напечатал read_docs.py. Правило простое и одно:
пустое поле заполняем, заполненное не трогаем, расхождение показываем.
Документ не главнее реестра и не наоборот — расхождение между ними это
находка, и решает её человек, а не скрипт.

Чего в заказах не было совсем — заводится новой карточкой: отгрузочная
пачка даёт договор, дату, товар, код ТН ВЭД, места, вес и водителя, бланк
«Учет» — артикул, заказанное количество и цену пошива.

    python3 tool/read_docs.py доки/*.pdf > вычитано.json
    python3 tool/import_docs.py вычитано.json web/data/orders.json --dry-run
    python3 tool/import_docs.py вычитано.json web/data/orders.json
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

# Поля отгрузки: что куда ложится в карточке заказа.
SHIPMENT = {
    "date": "date", "qty": "qty", "places": "places",
    "weight_gross": "weight_gross", "driver": "driver",
}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("read", type=Path, help="JSON от read_docs.py")
    ap.add_argument("target", type=Path, help="файл data/orders.json")
    ap.add_argument("--links", type=Path, default=None,
                    help="файл «имя файла <таб> адрес»: документы лежат на Диске, "
                         "и в карточке нужна ссылка на них, а не название")
    ap.add_argument("--dry-run", action="store_true", help="только показать, ничего не писать")
    args = ap.parse_args(argv)

    docs = json.loads(args.read.read_text("utf-8"))
    links = read_links(args.links) if args.links else {}
    data = json.loads(args.target.read_text("utf-8"))
    orders = data.setdefault("orders", [])

    filled, conflicts, created = [], [], []
    for doc in docs:
        if not doc.get("read"):
            # Прочитать скан нечем, но ссылка на него в карточке всё равно
            # нужна: документ есть, и открывают его оттуда.
            conflicts.append(f"{doc['file']}: скан без текстового слоя — "
                             "перенесена только ссылка")
            known = find(orders, doc)
            if known is not None:
                attach(known, doc, links, filled)
            continue
        order = find(orders, doc)
        if order is None:
            order = blank(doc)
            orders.append(order)
            created.append(f"{doc['file']} → новая карточка {order['contract_no'] or order['id']}")
            # Имя файла — тоже свидетельство: если в нём другой номер, это
            # либо опечатка в документе, либо файл не от того заказа.
            own = digits(doc.get("contract_no") or "") or digits(doc.get("order_no") or "")
            if own and own != order["id"]:
                conflicts.append(f"{doc['file']}: в шапке документа договор {own}, "
                                 f"а файл назван {order['id']} — карточка заведена по имени файла")
                order["note"] = (f"В бланке набран договор {own}, "
                                 f"в имени файла {order['id']}.").strip()
        apply(order, doc, filled, conflicts)
        attach(order, doc, links, filled)

    print(f"Документов: {len(docs)} · заведено карточек: {len(created)} · "
          f"заполнено полей: {len(filled)}")
    for line in created:
        print("  +", line)
    for line in filled:
        print("  ·", line)
    if conflicts:
        print("Расхождения — решать руками:")
        for line in conflicts:
            print("  !", line)

    if args.dry_run:
        print("Пробный прогон: файл не тронут.")
        return 0

    data["updated"] = dt.date.today().isoformat()
    args.target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"Записано в {args.target}")
    return 0


def contract_key(doc: dict) -> str:
    """Номер договора. Если документ и имя файла расходятся — верим имени.

    Так вышло с бланком «Учет» на 1003: в шапке набран договор 1002, а файл
    назван 1003, и оплата в выписке пришла тоже по 1003. Две записи против
    одной, и ошибка в шапке объяснимее, чем ошибка в двух других местах.
    Расхождение при этом не прячется: оно попадает в отчёт.
    """
    own = digits(doc.get("contract_no") or "") or digits(doc.get("order_no") or "")
    named = digits(doc.get("file") or "")
    if own and named and own != named:
        return named
    # У нечитаемого скана номера в шапке просто нет — остаётся имя файла.
    return own or named


def find(orders: list[dict], doc: dict) -> dict | None:
    key = contract_key(doc)
    if not key:
        return None
    for order in orders:
        if digits(order.get("contract_no") or "") == key or str(order.get("id")) == key:
            return order
    return None


def blank(doc: dict) -> dict:
    key = contract_key(doc)
    return {
        "id": key,
        "order_no": doc.get("order_no") or "",
        "contract_no": doc.get("contract_no") if digits(doc.get("contract_no") or "") == key else key,
        "order_date": doc.get("contract_date") or doc.get("order_date") or "",
        "item": "", "item_article": "", "tnved": "",
        "ordered_qty": None, "unit_price": None,
        "workshops": [], "photo": "",
        "shipment": {"date": "", "qty": None, "places": None, "weight_gross": None,
                     "driver": "", "driver_phone": ""},
        "acceptance": {"accepted_qty": None, "rejected_qty": None, "date": "", "reason": ""},
        "payments": [],
        "terms": {"prepay_percent": 50, "lead_time_days": None, "postpay_days": None},
        "links": [], "status": "", "note": "",
    }


def apply(order: dict, doc: dict, filled: list[str], conflicts: list[str]) -> None:
    name = order.get("contract_no") or order.get("id")

    def put(where: dict, key: str, value, label: str, quiet: bool = False) -> None:
        if value in (None, ""):
            return
        was = where.get(key)
        if was in (None, "", []):
            where[key] = value
            filled.append(f"{name}: {label} = {value}")
        elif different(was, value) and not quiet:
            conflicts.append(f"{name}: {label} в данных {was}, в документе {value} ({doc['file']})")

    if doc.get("kind") == "order":
        put(order, "order_no", doc.get("order_no"), "номер заказа")
        put(order, "order_date", doc.get("order_date"), "дата заказа")
        put(order, "item", doc.get("item"), "изделие")
        put(order, "item_article", doc.get("item_article"), "артикул")
        put(order, "ordered_qty", doc.get("ordered_qty"), "заказано")
        put(order, "unit_price", doc.get("unit_price"), "цена пошива")
        return

    put(order, "order_date", doc.get("contract_date"), "дата заказа")
    # В CMR товар назван по-таможенному — «Костюм», «Рубашка». Это не то же
    # самое, что название в реестре («Рубашка женская Y2K в клетку»): оно
    # грубее, и спорить с реестром ему незачем. Поэтому только заполняем
    # пустое и молчим о расхождении — само различие несёт код ТН ВЭД.
    put(order, "item", doc.get("item"), "изделие", quiet=True)
    put(order, "tnved", doc.get("tnved"), "ТН ВЭД")
    put(order, "unit_price", doc.get("unit_price"), "цена пошива")
    for field, source in SHIPMENT.items():
        put(order["shipment"], field, doc.get(source), f"отправка: {field}")

    # Вес брутто в пачке стоит в двух местах; разойтись они не должны.
    if doc.get("weight_other") and doc.get("weight_gross") \
            and different(doc["weight_other"], doc["weight_gross"]):
        conflicts.append(f"{name}: в CMR вес {doc['weight_gross']}, "
                         f"в упаковочном {doc['weight_other']} ({doc['file']})")

    note = f"Документы отправки: {doc['file']}"
    if doc.get("doc_no"):
        note += f", ТТН № {doc['doc_no']}"
    if doc.get("plate"):
        note += f", машина {doc['plate']}"
    if note not in (order.get("note") or ""):
        order["note"] = f"{order.get('note', '')} {note}.".strip()


def read_links(path: Path) -> dict[str, str]:
    out = {}
    for line in path.read_text("utf-8").splitlines():
        name, _, url = line.partition("\t")
        if name.strip() and url.strip():
            out[name.strip()] = url.strip()
    return out


def attach(order: dict, doc: dict, links: dict[str, str], filled: list[str]) -> None:
    """Ссылка на сам документ: в карточке её открывают, а не читают название."""
    url = links.get(doc["file"])
    if not url:
        return
    own = order.setdefault("links", [])
    if any(l.get("url") == url for l in own):
        return
    own.append({"title": title(doc["file"]), "url": url})
    filled.append(f"{order.get('contract_no') or order['id']}: ссылка на {doc['file']}")


def title(name: str) -> str:
    """«942 отправка(2) (1).pdf» → «Отправка 942»: в карточке читают это."""
    stem = re.sub(r"\.pdf$", "", name, flags=re.I)
    stem = re.sub(r"\s*\(\d+\)", "", stem).strip()
    number = digits(stem)
    for word, label in (("отправк", "Отправка"), ("учет", "Учёт"), ("учёт", "Учёт"),
                        ("спец", "Спецификация"), ("подп", "Спецификация подписанная")):
        if word in stem.lower():
            return f"{label} {number}".strip()
    return stem


def different(was, now) -> bool:
    if isinstance(was, (int, float)) and isinstance(now, (int, float)):
        return abs(float(was) - float(now)) > 0.5
    return str(was).strip().lower() != str(now).strip().lower()


def digits(value: str) -> str:
    m = re.search(r"\d{2,6}", value or "")
    return m.group(0) if m else ""


if __name__ == "__main__":
    sys.exit(main())
