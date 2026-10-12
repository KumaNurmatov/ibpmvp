#!/usr/bin/env python3
"""Оплаты за доставку из выписки банка в data/orders.json.

Доставку оплачивает заказчик по акту об оказании услуг от карго: одна сумма
на всю машину, назначение платежа вида «договору перевозки груза 08.07/26 от
08.07.26, за услуги доставки товара, Акт 11 от 09.10.2026». Такие платежи
легко отличить от оплат за изделия — по виду операции VO21200 и словам «за
услуги доставки».

Скрипт складывает их в раздел carriage: это ещё не разнесённые по отгрузкам
оплаты. Разносит их человек в карточке отгрузки — один акт бывает сразу на
несколько машин, и угадывать здесь нечего.

    python3 tool/import_carriage.py выписка.pdf [ещё.pdf] web/data/orders.json
    python3 tool/import_carriage.py выписка.pdf web/data/orders.json --dry-run
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import subprocess
import sys
from pathlib import Path

# Строка операции начинается с номера документа и двух дат.
HEAD = re.compile(r"^(\d+)\s+(\d{2}\.\d{2}\.\d{4})\s+(\d{2}\.\d{2}\.\d{4})")
# Сумма стоит перед словом «Перевод», разрядами по три через пробел. Слева от
# неё в строке стоит счёт-корреспондент — 16 цифр без пробелов, и без отбивки
# в два пробела его хвост читался как часть суммы.
AMOUNT = re.compile(r"(?:^|\s{2,})(\d{1,3}(?: \d{3})*,\d\d)\s+Перевод")
ACT = re.compile(r"Акт\s*([^\s,]+)\s*от\s*(\d{2}\.\d{2}\.\d{2,4})")
MARK = "за услуги доставки"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sources", type=Path, nargs="+", help="выписки PDF, последний путь — цель")
    ap.add_argument("--dry-run", action="store_true", help="только показать, ничего не писать")
    args = ap.parse_args(argv)

    *pdfs, target = args.sources
    if not pdfs:
        print("нужны и выписка, и файл данных", file=sys.stderr)
        return 2

    found: dict[str, dict] = {}
    for pdf in pdfs:
        for pay in read_statement(pdf):
            found[key(pay)] = pay          # одна и та же операция в двух выписках
    rows = sorted(found.values(), key=lambda p: p["date"])
    print(f"Найдено оплат за доставку: {len(rows)}")
    for pay in rows:
        print(f"  · {pay['date']} {pay['amount']:>12,.2f} "
              f"акт {pay['act_no'] or '—'} от {pay['act_date'] or '—'}".replace(",", " "))
    print(f"Итого {sum(p['amount'] for p in rows):,.2f} ₽".replace(",", " "))

    data = json.loads(target.read_text("utf-8")) if target.exists() else {}
    before = {key(p): p for p in data.get("carriage", [])}
    merged = {**before, **found}
    print(f"Было: {len(before)} · стало: {len(merged)}")

    if args.dry_run:
        print("Пробный прогон: файл не тронут.")
        return 0

    data["carriage"] = sorted(merged.values(), key=lambda p: p["date"])
    data["updated"] = dt.date.today().isoformat()
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"Записано в {target}")
    return 0


def read_statement(path: Path) -> list[dict]:
    text = pdf_text(path)
    out = []
    for doc, when, raw in operations(text):
        # Сумму ищем по исходной строке, остальное — по слитому тексту: в
        # выписке назначение платежа разнесено по строкам и переносится на
        # полуслове, а колонки держатся только пробелами.
        body = " ".join(" ".join(raw).split())
        if MARK not in body:
            continue
        amount = next((m for line in raw for m in [AMOUNT.search(line)] if m), None)
        if not amount:
            continue
        act = ACT.search(body)
        out.append({
            "date": iso(when),
            "amount": number(amount.group(1)),
            "act_no": act.group(1) if act else "",
            "act_date": iso(act.group(2)) if act else "",
            "doc_number": doc,
            "purpose": purpose(body),
        })
    return out


def operations(text: str):
    """Операция занимает несколько строк: первая с номером, остальные — текст."""
    doc = when = None
    body: list[str] = []
    for line in text.splitlines():
        head = HEAD.match(line)
        if head:
            if doc:
                yield doc, when, body
            doc, when = head.group(1), head.group(2)
            body = [line]
        elif doc:
            body.append(line)
    if doc:
        yield doc, when, body


def purpose(body: str) -> str:
    """Короткое назначение: от «договору перевозки» до конца акта."""
    start = body.find("договору перевозки")
    if start < 0:
        start = body.find(MARK)
    tail = body[start:]
    # Дальше идут реквизиты получателя и НДС — в назначении они не нужны.
    cuts = [tail.find(mark) for mark in ("НДС", "ОсОО", "S.W.I.F.T")]
    cut = min([c for c in cuts if c > 0], default=-1)
    return (tail[:cut] if cut > 0 else tail).strip(" ,")


def pdf_text(path: Path) -> str:
    done = subprocess.run(["pdftotext", "-layout", str(path), "-"],
                          capture_output=True, text=True, check=True)
    return done.stdout


def number(raw: str) -> float:
    return round(float(raw.replace(" ", "").replace(" ", "").replace(",", ".")), 2)


def iso(ru: str) -> str:
    day, month, year = ru.split(".")
    if len(year) == 2:
        year = f"20{year}"
    return dt.date(int(year), int(month), int(day)).isoformat()


def key(pay: dict) -> str:
    return f"{pay['date']}|{pay['amount']}|{pay.get('doc_number', '')}"


if __name__ == "__main__":
    sys.exit(main())
