#!/usr/bin/env python3
"""Даты и номера платёжек к оплатам — из выписки банка.

В реестре у оплат стоят только суммы: когда пришли деньги и каким
поручением, в книге не писали. В выписке это есть, и там же назначение
платежа с номером договора — по нему оплата и ложится на свой заказ.

Правило: сумма из выписки не спорит с реестром, а дополняет его. Совпала с
оплатой в карточке — проставляем ей дату, номер документа и назначение.
Не совпала ни с одной — это оплата, которой в реестре нет: добавляем
отдельной строкой. Оплата из реестра, которой нет в выписке, остаётся как
есть и показывается отдельно: может, она прошла другим счётом, а может, в
книге опечатка — решать человеку.

Вид оплаты ставится по дате отгрузки: пришедшее до отгрузки — предоплата,
после — постоплата. Другого признака в выписке нет, выдумывать нечего.

    python3 tool/import_payments.py выписка.pdf [ещё.pdf] web/data/orders.json --dry-run
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import subprocess
import sys
from pathlib import Path

HEAD = re.compile(r"^(\d+)\s+(\d{2}\.\d{2}\.\d{4})\s+(\d{2}\.\d{2}\.\d{4})")
AMOUNT = re.compile(r"(?:^|\s{2,})(\d{1,3}(?: \d{3})*,\d\d)\s+Перевод")
CONTRACT = re.compile(r"дог(?:овор)?\w*\.?\s*№?\s*(\d{3,5})/1-1")
ORDER = re.compile(r"п\.п\.\s*\+?\s*([\w/]+)\s+от")
PAYER = "АЙЛУКХОУМ"
CARRIAGE = "услуги доставки"
EPS = 1.0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("sources", type=Path, nargs="+", help="выписки PDF, последний путь — цель")
    ap.add_argument("--create", action="store_true",
                    help="заводить карточку, если договор в выписке есть, а заказа нет: "
                         "деньги по нему уже прошли, значит заказ существует")
    ap.add_argument("--dry-run", action="store_true", help="только показать, ничего не писать")
    args = ap.parse_args(argv)

    *pdfs, target = args.sources
    if not pdfs:
        print("нужны и выписка, и файл данных", file=sys.stderr)
        return 2

    found: dict[str, dict] = {}
    for pdf in pdfs:
        for pay in read_statement(pdf):
            found[key(pay)] = pay
    print(f"Поступлений от заказчика в выписке: {len(found)}")

    data = json.loads(target.read_text("utf-8"))
    orders = data.get("orders", [])
    by_contract: dict[str, list[dict]] = {}
    for pay in sorted(found.values(), key=lambda p: p["date"]):
        by_contract.setdefault(pay["contract"], []).append(pay)

    dated, added, missing, orphan = [], [], [], []
    for contract, pays in by_contract.items():
        order = find(orders, contract)
        if order is None and args.create:
            order = blank(contract, pays)
            orders.append(order)
            orphan.append(f"договор {contract}: заказа не было — заведена карточка "
                          f"по оплатам из выписки")
        if order is None:
            total = sum(p["amount"] for p in pays)
            orphan.append(f"договор {contract}: {len(pays)} оплат на {total:,.2f} — "
                          f"заказа с таким номером нет".replace(",", " "))
            continue
        match(order, pays, dated, added, missing)

    print(f"Проставлено дат: {len(dated)} · добавлено оплат: {len(added)}")
    for line in dated:
        print("  ·", line)
    for line in added:
        print("  +", line)
    if missing:
        print("Есть в реестре, нет в выписке:")
        for line in missing:
            print("  !", line)
    if orphan:
        print("Оплаты без заказа:")
        for line in orphan:
            print("  ?", line)

    if args.dry_run:
        print("Пробный прогон: файл не тронут.")
        return 0

    data["updated"] = dt.date.today().isoformat()
    target.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", "utf-8")
    print(f"Записано в {target}")
    return 0


def match(order: dict, pays: list[dict], dated: list[str], added: list[str],
          missing: list[str]) -> None:
    """Сводим оплаты карточки с выпиской по сумме."""
    name = order.get("contract_no") or order.get("id")
    own = order.setdefault("payments", [])
    free = list(pays)

    for pay in own:
        amount = pay.get("amount")
        if amount is None:
            continue
        same = next((p for p in free if abs(p["amount"] - amount) <= EPS), None)
        if same is None:
            missing.append(f"{name}: оплата {amount:,.2f} в выписке не нашлась".replace(",", " "))
            continue
        free.remove(same)
        if not pay.get("date"):
            pay["date"] = same["date"]
        pay["doc_number"] = pay.get("doc_number") or same["doc_number"]
        pay["purpose"] = pay.get("purpose") or same["purpose"]
        dated.append(f"{name}: {amount:,.2f} → {same['date']}, п/п {same['doc_number']}"
                     .replace(",", " "))

    for pay in free:
        own.append({
            "kind": kind(order, pay),
            "date": pay["date"], "amount": pay["amount"],
            "doc_number": pay["doc_number"], "purpose": pay["purpose"],
        })
        added.append(f"{name}: {pay['amount']:,.2f} от {pay['date']} — в реестре её не было"
                     .replace(",", " "))


def blank(contract: str, pays: list[dict]) -> dict:
    """Карточка по одним оплатам: договор, дата договора и вид изделия.

    Больше в выписке ничего нет — ни количества, ни цены. Пусть будет
    пустым: заказ, о котором известно только «деньги ушли», это тоже факт,
    и прятать его хуже, чем показать неполным.
    """
    first = pays[0]
    return {
        "id": contract,
        "order_no": "",
        "contract_no": f"{contract}/1-1",
        "order_date": contract_date(first["purpose"]),
        "item": item(first["purpose"]),
        "item_article": "", "tnved": "",
        "ordered_qty": None, "unit_price": None,
        "workshops": [], "photo": "",
        "shipment": {"date": "", "qty": None, "places": None,
                     "weight_gross": None, "driver": "", "driver_phone": ""},
        "acceptance": {"accepted_qty": None, "rejected_qty": None, "date": "", "reason": ""},
        "payments": [],
        "terms": {"prepay_percent": 50, "lead_time_days": None, "postpay_days": None},
        "links": [], "status": "",
        "note": "Карточка заведена по выписке банка: в реестре этого договора не было.",
    }


def contract_date(purpose: str) -> str:
    m = re.search(r"от\s*(\d{2})\.(\d{2})\.(\d{4})", purpose or "")
    return f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else ""


def item(purpose: str) -> str:
    """В назначении платежа вид изделия стоит в скобках: «за текст.изд.(костюм)»."""
    m = re.search(r"\(([а-яё ]{3,30})\)", purpose or "")
    return m.group(1).strip().capitalize() if m else ""


def kind(order: dict, pay: dict) -> str:
    """До отгрузки — предоплата, после — постоплата. Третьего признака нет."""
    shipped = (order.get("shipment") or {}).get("date") or ""
    if shipped and pay["date"] >= shipped:
        return "постоплата"
    if not shipped and any(p.get("kind") == "предоплата" for p in order.get("payments", [])):
        return "постоплата"
    return "предоплата"


def find(orders: list[dict], contract: str) -> dict | None:
    for order in orders:
        if digits(order.get("contract_no") or "") == contract or str(order.get("id")) == contract:
            return order
    return None


def read_statement(path: Path) -> list[dict]:
    text = subprocess.run(["pdftotext", "-layout", str(path), "-"],
                          capture_output=True, text=True, check=True).stdout
    out = []
    for when, lines in operations(text):
        flat = " ".join(" ".join(lines).split())
        # Нас интересуют только деньги от заказчика за изделия: доставка
        # считается отдельно, она идёт на отгрузку, а не на заказ.
        if PAYER not in flat or CARRIAGE in flat:
            continue
        contract = CONTRACT.search(flat)
        amount = next((m for line in lines for m in [AMOUNT.search(line)] if m), None)
        if not contract or not amount:
            continue
        out.append({
            "date": iso(when),
            "amount": number(amount.group(1)),
            "contract": contract.group(1),
            "doc_number": (ORDER.search(flat).group(1) if ORDER.search(flat) else ""),
            "purpose": purpose(flat),
        })
    return out


def operations(text: str):
    when = None
    body: list[str] = []
    for line in text.splitlines():
        head = HEAD.match(line)
        if head:
            if when:
                yield when, body
            when, body = head.group(2), [line]
        elif when:
            body.append(line)
    if when:
        yield when, body


def purpose(flat: str) -> str:
    start = flat.find("дог")
    if start < 0:
        return ""
    tail = flat[start:]
    cuts = [tail.find(mark) for mark in ("ОсОО", "НДС", "S.W.I.F.T")]
    cut = min([c for c in cuts if c > 0], default=-1)
    return (tail[:cut] if cut > 0 else tail).strip(" ,")


def number(raw: str) -> float:
    return round(float(raw.replace(" ", "").replace(" ", "").replace(",", ".")), 2)


def iso(ru: str) -> str:
    day, month, year = ru.split(".")
    return f"{year}-{month}-{day}"


def digits(value: str) -> str:
    m = re.search(r"\d{2,6}", value or "")
    return m.group(0) if m else ""


def key(pay: dict) -> str:
    return f"{pay['date']}|{pay['amount']}|{pay['contract']}|{pay['doc_number']}"


if __name__ == "__main__":
    sys.exit(main())
