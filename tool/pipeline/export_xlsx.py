"""Выгрузка заказов в книгу той же раскладки, что ведётся вручную.

Карточка на заказ в 15 строк, формулы на тех же местах — файл открывается
поверх привычного процесса, а не вместо него. Каждое число несёт примечание
с именем файла, из которого взято: так же, как это сделано в ручной книге.
"""
from __future__ import annotations

from pathlib import Path

import xlsxwriter

from .ledger import Order, _date, _num

BLOCK_ROWS = 15
PAYMENT_SLOTS = 5
TRANSFER_LABEL = "Перенос подтверждён"
CLOSED_EPS = 0.5          # меньше рубля остатка — заказ считаем закрытым

# Форматы пишем канонически: xlsx хранит их в американской записи, а
# разделители подставляет Excel по локали. Русское «# ##0,00» он читает
# буквально и группирует разряды по две цифры — 300000 превращается в
# «3 00 000».
MONEY_FORMAT = "#,##0.00"
NUMBER_FORMAT = "#,##0.##"

SHEETS = [
    ("недоплата", "К сверке"),
    ("нет постоплат", "Нет постоплаты"),
    ("закрытые", "Закрыт"),
]


def classify(order: Order) -> str:
    """На какой лист попадёт заказ."""
    remainder = order.computed.get("remainder")
    if remainder is None:
        return "К сверке"
    has_postpay = any(p.kind.startswith("постоплата") or p.kind.startswith("доп")
                      for p in order.payments)
    if abs(remainder) <= CLOSED_EPS:
        return "Закрыт"
    if not has_postpay:
        return "Нет постоплаты"
    return "К сверке"


def write(orders: list[Order], path: str | Path, *, orphans: list[dict] | None = None) -> Path:
    path = Path(path)
    wb = xlsxwriter.Workbook(str(path))
    fmt = _formats(wb)

    by_status: dict[str, list[Order]] = {label: [] for _, label in SHEETS}
    for order in orders:
        by_status[classify(order)].append(order)

    for sheet_name, label in SHEETS:
        ws = wb.add_worksheet(sheet_name)
        _setup(ws)
        row = 3
        for order in by_status[label]:
            _card(ws, wb, fmt, row, order, label)
            row += BLOCK_ROWS

    _checks_sheet(wb, fmt, orders, orphans or [])
    wb.close()
    return path


def _formats(wb) -> dict:
    return {
        "title": wb.add_format({"bold": True, "font_size": 12}),
        "head": wb.add_format({"bold": True, "bg_color": "#D9D9D9", "border": 1}),
        "label": wb.add_format({"bold": True}),
        "money": wb.add_format({"num_format": MONEY_FORMAT}),
        "money_bold": wb.add_format({"num_format": MONEY_FORMAT, "bold": True}),
        "date": wb.add_format({"num_format": "dd.mm.yyyy"}),
        "num": wb.add_format({"num_format": NUMBER_FORMAT}),
        "hint": wb.add_format({"font_color": "#808080", "italic": True}),
        "status_ok": wb.add_format({"bold": True, "font_color": "#1E7B34"}),
        "status_warn": wb.add_format({"bold": True, "font_color": "#B35C00"}),
        "status_bad": wb.add_format({"bold": True, "font_color": "#B00020"}),
        "err": wb.add_format({"font_color": "#B00020"}),
        "warn": wb.add_format({"font_color": "#B35C00"}),
    }


def _setup(ws) -> None:
    for col, width in enumerate([24, 14, 10, 12, 16, 3, 3, 28, 13, 15, 34]):
        ws.set_column(col, col, width)


def _card(ws, wb, fmt, r: int, order: Order, label: str) -> None:
    """Одна карточка заказа. r — индекс первой строки блока, 0-based."""
    c = order.computed
    price = _num(order.get("unit_price"))
    status_fmt = {"Закрыт": fmt["status_ok"], "Нет постоплаты": fmt["status_bad"]}.get(
        label, fmt["status_warn"])

    ws.write(r, 0, f"Заказ {order.get('order_no') or order.key}", fmt["title"])
    ws.write(r, 3, order.contract_no or "", fmt["label"])
    ws.write(r, 7, "ОПЛАТЫ И ПОДТВЕРЖДЕНИЯ", fmt["head"])
    ws.write(r, 11, label, status_fmt)

    ws.write(r + 1, 0, order.get("item") or "")
    ws.write(r + 1, 7, "Вид операции", fmt["head"])
    ws.write(r + 1, 8, "Дата", fmt["head"])
    ws.write(r + 1, 9, "Сумма, ₽", fmt["head"])

    ws.write(r + 2, 0, "Заказано:", fmt["label"])
    _write_num(ws, r + 2, 1, order.get("ordered_qty"), fmt["num"], order.source_of("ordered_qty"))
    ws.write(r + 3, 0, "Цена пошива:", fmt["label"])
    _write_num(ws, r + 3, 1, price, fmt["money"], order.source_of("unit_price"))
    ws.write(r + 4, 0, "Сумма заказа:", fmt["label"])
    ws.write_formula(r + 4, 1, f"=ROUND(B{r + 3}*B{r + 4},2)", fmt["money_bold"],
                     c.get("order_sum") if c.get("order_sum") is not None else "")

    # Платежи: ровно PAYMENT_SLOTS строк, чтобы формулы ниже всегда били в тот же диапазон.
    for i in range(PAYMENT_SLOTS):
        rr = r + 2 + i
        if i < len(order.payments):
            pay = order.payments[i]
            kind = TRANSFER_LABEL if pay.kind == "перенос" else pay.kind.capitalize()
            ws.write(rr, 7, kind)
            if pay.date:
                ws.write_datetime(rr, 8, pay.date, fmt["date"])
            ws.write_number(rr, 9, pay.amount, fmt["money"])
            note = f"Источник: {pay.source}"
            if pay.doc_number:
                note += f"\nДокумент № {pay.doc_number}"
            if pay.purpose:
                note += f"\nНазначение: {pay.purpose}"
            ws.write_comment(rr, 9, note, {"width": 320, "height": 120})
        else:
            ws.write_blank(rr, 7, None)

    first, last = r + 3, r + 2 + PAYMENT_SLOTS
    ws.write(r + 7, 7, "Оплачено", fmt["label"])
    ws.write_formula(
        r + 7, 9,
        f'=SUM(J{first}:J{last})-SUMIF(H{first}:H{last},"{TRANSFER_LABEL}",J{first}:J{last})',
        fmt["money"], c.get("paid") or 0)

    ws.write(r + 6, 0, "Отправка", fmt["label"])
    for col, name in enumerate(["Дата отправки", "Кол-во", "Мест", "Вес", "Сумма"]):
        ws.write(r + 7, col, name, fmt["head"])

    ship_date = _date(order.get("shipment_date"))
    if ship_date:
        ws.write_datetime(r + 8, 0, ship_date, fmt["date"])
    _write_num(ws, r + 8, 1, order.get("shipped_qty"), fmt["num"], order.source_of("shipped_qty"))
    _write_num(ws, r + 8, 2, order.get("places"), fmt["num"], order.source_of("places"))
    _write_num(ws, r + 8, 3, order.get("weight_gross"), fmt["num"], order.source_of("weight_gross"))
    ws.write_formula(r + 8, 4, f"=ROUND(B{r + 4}*B{r + 9},2)", fmt["money_bold"],
                     c.get("shipment_sum") if c.get("shipment_sum") is not None else "")

    ws.write(r + 8, 7, "Подтвержденные переносы", fmt["label"])
    ws.write_formula(
        r + 8, 9,
        f'=SUMIF(H{first}:H{last},"{TRANSFER_LABEL}",J{first}:J{last})',
        fmt["money"], c.get("transfers") or 0)
    ws.write(r + 8, 10, "Со знаком + в этот заказ, − из него", fmt["hint"])

    ws.write(r + 10, 0, "Учет", fmt["label"])
    ws.write(r + 10, 7, "РАСЧЁТНЫЙ ОСТАТОК", fmt["label"])
    ws.write_formula(r + 10, 9, f'=IF(E{r + 9}="","",ROUND(E{r + 9}-J{r + 8}-J{r + 9},2))',
                     fmt["money_bold"], c.get("remainder") if c.get("remainder") is not None else "")

    ws.write(r + 11, 0, "Документы", fmt["label"])
    ws.write(r + 11, 1, ", ".join(d["file"] for d in order.documents[:4]) or "—")
    if order.documents:
        ws.write_comment(r + 11, 1, "\n".join(
            f"{d['doc_type']}: {d['file']}" for d in order.documents),
            {"width": 360, "height": 160})
    ws.write(r + 11, 7, "Предположительно не принято / не оплачено", fmt["label"])
    ws.write_formula(r + 11, 9, f"=IFERROR(J{r + 11}/B{r + 4},\"\")", fmt["num"],
                     c.get("remainder_units") if c.get("remainder_units") is not None else "")

    worst = _worst(order)
    if worst:
        ws.write(r + 12, 7, worst, fmt["err" if _has_error(order) else "warn"])


def _write_num(ws, row: int, col: int, value, cell_fmt, source: str | None) -> None:
    v = _num(value)
    if v is None:
        ws.write_blank(row, col, None, cell_fmt)
        return
    ws.write_number(row, col, v, cell_fmt)
    if source:
        ws.write_comment(row, col, f"Источник: {source}", {"width": 260, "height": 70})


def _checks_sheet(wb, fmt, orders: list[Order], orphans: list[dict]) -> None:
    """Отдельный лист со всем, что требует человека."""
    ws = wb.add_worksheet("проверки")
    for col, (name, width) in enumerate([("Заказ", 20), ("Договор", 12), ("Уровень", 10),
                                         ("Код", 22), ("Что не так", 95)]):
        ws.write(0, col, name, fmt["head"])
        ws.set_column(col, col, width)
    ws.freeze_panes(1, 0)

    row = 1
    for order in orders:
        for flag in order.flags:
            ws.write(row, 0, order.get("order_no") or order.key)
            ws.write(row, 1, order.contract_no or "")
            ws.write(row, 2, flag.level, fmt["err"] if flag.level == "error" else fmt["warn"])
            ws.write(row, 3, flag.code)
            ws.write(row, 4, flag.message)
            row += 1
    for orphan in orphans:
        ws.write(row, 0, "—")
        ws.write(row, 2, "error", fmt["err"])
        ws.write(row, 3, "unrouted")
        ws.write(row, 4, f"{orphan.get('file')}: {orphan.get('reason')}")
        row += 1
    if row == 1:
        ws.write(1, 4, "Замечаний нет.")


def _has_error(order: Order) -> bool:
    return any(f.level == "error" for f in order.flags)


def _worst(order: Order) -> str | None:
    for level in ("error", "warn"):
        for flag in order.flags:
            if flag.level == level:
                more = len(order.flags) - 1
                return flag.message + (f" (ещё замечаний: {more})" if more > 0 else "")
    return None
