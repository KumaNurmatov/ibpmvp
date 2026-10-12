#!/usr/bin/env python3
"""Перенос плоской таблицы заказов в data/orders.json.

Вторая форма реестра: не блоки по 15 строк, а обычная таблица — строка на
заказ, столбцы подписаны в первой строке. Так ведётся свежая часть реестра,
и именно эти заказы на сайт ещё не попадали.

Берётся только написанное. Считаемые столбцы («сумма заказа»,
«предполагаемая постоплата», «недоплата») не переносятся: их считает сайт.
Скрипт сверяет свой расчёт с суммой заказа из таблицы и показывает
расхождения — расхождение это находка, а не повод переписать цифру.

Названия документов в таблице записаны без ссылок (в книге это просто текст),
поэтому попадают в заметку заказа: потерять их нельзя, а выдать за ссылку
нечего.

    python3 tool/import_table.py 15.xlsx web/data/orders.json
    python3 tool/import_table.py 15.xlsx web/data/orders.json --dry-run
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

import openpyxl

from import_registry import date, date_from_number, merge, number, text

# Подпись столбца → что это у нас. Лишние столбцы (считаемые) здесь не
# упомянуты и просто не читаются.
COLUMNS = {
    "№ заказа": "order_no",
    "договор": "contract_no",
    "модель": "item",
    "заказано": "ordered_qty",
    "цена": "unit_price",
    "цех": "workshop",
    "статус": "status",
    "дата отправки": "ship_date",
    "кол-во": "ship_qty",
    "мест": "ship_places",
    "вес": "ship_weight",
    "водитель": "driver",
    "предоплата": "prepay",
    "фактическая постоплата": "postpay",
    "доп постоплата": "extra",
    # Названия приложенных файлов: ссылок в книге нет, только имена.
    "учет": "doc_accounting",
    "документы": "doc_folder",
    "документы отправки": "doc_shipment",
    "сумма заказа": "stated_order_sum",
}

# «отменен», «заморожен, не смогли распечатать лекала» — это состояние заказа,
# а не стадия процесса: из цифр его не вывести.
STOPPED = ("отмен", "заморож", "аннулир")

DASH = {"", "—", "-", "–", "нет", "none"}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("table", type=Path, help="книга Excel с таблицей заказов")
    ap.add_argument("target", type=Path, help="файл data/orders.json")
    ap.add_argument("--dry-run", action="store_true", help="только показать, ничего не писать")
    args = ap.parse_args(argv)

    orders, problems = read_table(args.table)
    print(f"Прочитано заказов: {len(orders)}")

    existing = json.loads(args.target.read_text("utf-8")) if args.target.exists() else {"orders": []}
    merged, kept, replaced = merge(existing.get("orders", []), orders)
    print(f"Было: {len(existing.get('orders', []))} · добавлено: {len(merged) - kept} · "
          f"обновлено: {replaced} · стало: {len(merged)}")

    for line in problems:
        print("  ·", line)

    if args.dry_run:
        print("Пробный прогон: файл не тронут.")
        return 0

    existing["orders"] = merged
    existing.setdefault("version", 1)
    existing["updated"] = dt.date.today().isoformat()
    args.target.write_text(json.dumps(existing, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"Записано в {args.target}")
    return 0


def read_table(path: Path) -> tuple[list[dict], list[str]]:
    book = openpyxl.load_workbook(path, data_only=True)
    orders: list[dict] = []
    problems: list[str] = []

    for sheet in book:
        head = header(sheet)
        if "contract_no" not in head.values() and "order_no" not in head.values():
            continue
        for r in range(2, sheet.max_row + 1):
            raw = {name: sheet.cell(r, col).value for col, name in head.items()}
            if not any(clean(v) for v in raw.values()):
                continue
            order, note = read_row(raw, f"{sheet.title}, строка {r}")
            if order:
                orders.append(order)
            if note:
                problems.append(note)
    return orders, problems


def header(sheet) -> dict[int, str]:
    out = {}
    for col in range(1, sheet.max_column + 1):
        name = text(sheet.cell(1, col).value).lower().strip()
        if name in COLUMNS:
            out[col] = COLUMNS[name]
    return out


def read_row(raw: dict, where: str) -> tuple[dict | None, str | None]:
    contract = clean(raw.get("contract_no"))
    order_no = clean(raw.get("order_no"))
    key = digits(contract) or digits(order_no) or order_no
    if not key:
        return None, f"{where}: нет ни договора, ни номера заказа — пропущено"

    price = number(raw.get("unit_price"))
    order = {
        "id": key,
        "order_no": order_no,
        "contract_no": contract,
        "order_date": date_from_number(order_no),
        "item": clean(raw.get("item")),
        "ordered_qty": number(raw.get("ordered_qty")),
        "unit_price": price,
        "tnved": "",
        "item_article": "",
        "workshops": workshops(raw.get("workshop")),
        "photo": "",
        "shipment": {
            "date": date(raw.get("ship_date")),
            "qty": number(raw.get("ship_qty")),
            "places": number(raw.get("ship_places")),
            "weight_gross": number(raw.get("ship_weight")),
            "driver": clean(raw.get("driver")),
            "driver_phone": "",
        },
        "acceptance": {"accepted_qty": None, "rejected_qty": None, "date": "", "reason": ""},
        "payments": payments(raw),
        "terms": {"prepay_percent": 50, "lead_time_days": None, "postpay_days": None},
        "links": [],
        "status": status(raw.get("status")),
        "note": note(raw),
    }
    return order, mismatch(order, raw, price, where)


def payments(raw: dict) -> list[dict]:
    out = []
    for column, kind in (("prepay", "предоплата"), ("postpay", "постоплата"),
                         ("extra", "доп. постоплата")):
        for amount in amounts(raw.get(column)):
            out.append({"kind": kind, "date": "", "amount": amount,
                        "doc_number": "", "purpose": ""})
    return out


def amounts(value) -> list[float]:
    """«260 162,50 + 30 000,00» — две оплаты в одной клетке, так в книге."""
    if isinstance(value, (int, float)):
        return [round(float(value), 2)] if value else []
    parts = [p for p in re.split(r"[+;]", clean(value)) if clean(p)]
    out = []
    for part in parts:
        amount = number(part)
        if amount:
            out.append(amount)
    return out


# Справочник цехов на сайте пишется одним способом; в книге регистр гуляет
# («Дача-Суу» и «Дача-суу»). Метка должна совпасть, иначе фильтр по цеху
# разъедется на два пункта.
KNOWN_WORKSHOPS = ("Венера", "Сулайман", "Майрам", "Нурлан", "Дача-суу")


def workshops(value) -> list[str]:
    name = clean(value)
    if not name:
        return []
    for known in KNOWN_WORKSHOPS:
        if known.lower() == name.lower():
            return [known]
    return [name]


def status(value) -> str:
    """Короткое слово для карточки, причина — в заметке."""
    raw = clean(value).lower()
    if not raw:
        return ""
    if "отмен" in raw or "аннулир" in raw:
        return "отменён"
    if "заморож" in raw:
        return "заморожен"
    return ""


def note(raw: dict) -> str:
    """Что не укладывается в поля: названия файлов и причина остановки."""
    out = []
    state = clean(raw.get("status"))
    if state and state.lower() != "отправлено" and not any(
            state.lower().startswith(s) for s in ("отмен",)):
        out.append(f"Состояние по реестру: {state}.")
    elif state.lower().startswith("отмен"):
        out.append("Заказ отменён по реестру.")

    docs = [(name, clean(raw.get(key))) for name, key in
            (("учёт", "doc_accounting"), ("документы", "doc_folder"),
             ("отправка", "doc_shipment"))]
    docs = [f"{name}: {value}" for name, value in docs if value]
    if docs:
        out.append("Файлы по реестру (ссылок в книге нет) — " + "; ".join(docs) + ".")
    return " ".join(out)


def mismatch(order: dict, raw: dict, price: float | None, where: str) -> str | None:
    """Сверка с суммой заказа из таблицы: расхождение надо увидеть."""
    stated = number(raw.get("stated_order_sum"))
    qty = order["ordered_qty"]
    if stated is None or qty is None or price is None:
        return None
    ours = round(qty * price, 2)
    if abs(ours - stated) <= 1:
        return None
    return (f"{order['order_no']} (договор {order['contract_no']}): в таблице сумма заказа "
            f"{stated:,.2f}, по её же цифрам выходит {ours:,.2f} — "
            f"разница {ours - stated:,.2f}".replace(",", " "))


def clean(value) -> str:
    """Прочерк в клетке означает «нет данных», а не строку «—»."""
    # Номер договора иногда набран числом: 890 читается как 890.0, и «890.0»
    # попадало в карточку как номер договора.
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    out = text(value)
    return "" if out.lower() in DASH else out


def digits(value: str) -> str:
    match = re.search(r"\d{2,6}", value or "")
    return match.group(0) if match else ""


if __name__ == "__main__":
    sys.exit(main())
