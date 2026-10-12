#!/usr/bin/env python3
"""Чтение документов по заказу: отгрузочной пачки и бланка «Учет».

На каждую отгрузку карго отдаёт один PDF на 7–9 страниц: CMR, счёт-фактура,
товарно-транспортная накладная, упаковочный лист, инвойс, товарная накладная.
Все цифры там повторяются по нескольку раз, и это полезно: читаем из того
места, где значение подписано однозначно, а совпадение с другими страницами
служит проверкой.

Часть пачек — сканы без текстового слоя. Для них включается распознавание
(tesseract, русский), но только по требованию: оно медленное и ошибается в
цифрах, поэтому распознанное помечается как менее надёжное.

Второй вид документа — «Учет»: это сам заказ, по позициям. Из него берутся
артикул, цена пошива, заказанное количество и сумма заказа; отгрузочная
пачка про заказ ничего этого не знает, она про то, что уехало.

Скрипт ничего не записывает: он печатает JSON, который дальше разбирает
import_docs.py. Так видно, что именно вычитано, прежде чем это попадёт
в данные.

    python3 tool/read_docs.py доки/*.pdf > вычитано.json
    python3 tool/read_docs.py --ocr "доки/1003 отправка.pdf"
"""
from __future__ import annotations

import argparse
import datetime as dt
import difflib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

MONTHS = {
    "января": 1, "февраля": 2, "марта": 3, "апреля": 4, "мая": 5, "июня": 6,
    "июля": 7, "августа": 8, "сентября": 9, "октября": 10, "ноября": 11, "декабря": 12,
}


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", type=Path, nargs="+", help="PDF с отгрузочными документами")
    ap.add_argument("--ocr", action="store_true", help="распознавать сканы без текстового слоя")
    ap.add_argument("--dpi", type=int, default=200, help="разрешение для распознавания")
    ap.add_argument("--save-text", type=Path, default=None,
                    help="куда складывать распознанный текст: распознавание долгое, "
                         "и перечитывать его потом надо без повторного прогона")
    args = ap.parse_args(argv)

    out = []
    for path in args.files:
        # .txt — это уже распознанный текст: распознавание долгое, и
        # перечитывать его после правки разбора надо без повторного прогона.
        # .txt сюда попадает только из --save-text, то есть это распознанный
        # скан: признак надо сохранить, по нему в карточке ставится оговорка.
        recognised = path.suffix.lower() == ".txt"
        text = path.read_text("utf-8") if recognised else pdf_text(path)
        # Текста нет — значит скан, и читать его нечем без распознавания.
        # Уже распознанный .txt текстом как раз богат, просто он машинный.
        needs_ocr = not recognised and len(text.strip()) < 200
        scanned = recognised or needs_ocr
        if needs_ocr and args.ocr:
            text = ocr(path, args.dpi)
            if args.save_text:
                args.save_text.mkdir(parents=True, exist_ok=True)
                (args.save_text / f"{path.stem}.txt").write_text(text, "utf-8")
        elif needs_ocr:
            out.append({"file": path.name, "scanned": True, "read": False})
            continue
        found = read_order(text) if is_order_doc(text) else read(text)
        found["file"] = path.name
        found["scanned"] = scanned
        found["read"] = True
        out.append(found)

    json.dump(out, sys.stdout, ensure_ascii=False, indent=2)
    print()
    return 0


def is_order_doc(text: str) -> bool:
    """Бланк «Учет» узнаётся по шапке: это заказ, а не отгрузка."""
    flat = " ".join(text.split())
    return bool(re.search(r"ЗАКАЗ\s*№", flat)) and "Упаковочный лист" not in flat


def read_order(text: str) -> dict:
    """Бланк «Учет»: заказ по позициям. Берём то, что одинаково во всех строках."""
    flat = " ".join(text.split())
    totals = re.search(r"Итого:\s*([\d \u00a0]+)\s+([\d \u00a0]+(?:,\d{2})?)", flat)
    qty = number(totals.group(1)) if totals else None
    total = number(totals.group(2)) if totals else None
    return {
        "kind": "order",
        "order_no": first(r"ЗАКАЗ\s*№\s*([\w/-]+)", flat),
        "contract_no": first(r"Договор\s*(\d{3,5}(?:/[\d-]+)?)\s*от", flat),
        "order_date": date(first(r"ЗАКАЗ[^»]{0,40}?от\s*(\d{2}\.\d{2}\.\d{4})", flat)
                           or first(r"Договор\s*\d{3,5}[^\d]{0,8}от\s*(\d{2}\.\d{2}\.\d{4})", flat)),
        "item": item_name(flat),
        "item_article": article(flat),
        "ordered_qty": qty,
        "order_sum": total,
        # Цена одна на весь заказ, и надёжнее всего она получается из итога:
        # в колонке её путает перенос строк, а итог стоит одним числом.
        "unit_price": round(total / qty, 2) if qty and total else None,
    }


def item_name(flat: str) -> str:
    """Название изделия — то, что повторяется в каждой строке заказа."""
    names = re.findall(r"[А-ЯЁ][а-яё]+(?:\s+[а-яё]+){1,7}", flat)
    names = [n.strip() for n in names if len(n) > 10]
    if not names:
        return ""
    best = max(set(names), key=names.count)
    return best if names.count(best) >= 3 else ""


def article(flat: str) -> str:
    """Артикул без цвета и размера: «РЖТВИЛ01клетка/зел_кор/44» → «РЖТВИЛ01»."""
    found = re.findall(r"\b([А-ЯЁ]{4,}\d{2})(?=[а-яё_/])", flat)
    return max(set(found), key=found.count) if found else ""


def read(text: str) -> dict:
    """Что удалось вычитать из пачки. Чего нет — того нет, без догадок."""
    flat = " ".join(text.split())
    cmr = cmr_line(flat)
    totals = packing_totals(flat)
    return {
        "kind": "shipping",
        "contract_no": contract(flat),
        "contract_date": contract_date(flat),
        "doc_no": first(r"ТОВАРНО-ТРАНСПОРТНАЯ НАКЛАДНАЯ\s*№\s*([\w/.-]+)", flat)
                  or first(r"Упаковочный лист\s*№\s*([\w/.-]+)", flat)
                  or first(r"Инвойс\s*№\s*([\w/.-]+)", flat),
        # Дата отгрузки написана в пачке несколько раз; берём первое, что
        # нашлось, — в распознанном тексте уцелевает не всякое место.
        "date": date(first(r"Дата составления\s*(\d{2}\.\d{2}\.\d{4})", flat)
                     or first(r"Дата поставки:?\s*(\d{2}\.\d{2}\.\d{4})", flat)
                     or first(r"Инвойс\s*№?\s*[\w/.-]*\s*о[тг]\s*(\d{2}\.\d{2}\.\d{4})", flat)
                     or first(r"Счет-фактура:?\s*№?\s*[\w/.-]*\s*о[тг]\s*(\d{2}\.\d{2}\.\d{4})", flat)),
        "item": cmr["item"],
        "tnved": cmr["tnved"],
        "qty": totals["qty"],
        "weight_net": totals["net"],
        # Вес брутто написан в пачке четырежды; берём из CMR, а расхождение с
        # упаковочным листом возвращаем отдельно — молчать о нём нельзя.
        "weight_gross": cmr["weight"] if cmr["weight"] is not None else totals["gross"],
        "weight_other": totals["gross"],
        "places": cmr["places"] if cmr["places"] is not None else places(flat),
        "unit_price": unit_price(flat),
        "sum": number(first(r"Вceгo на сумму:?\s*([\d \u00a0]+,\d{2})", flat)
                      or first(r"Всего на сумму:?\s*([\d \u00a0]+,\d{2})", flat)) or totals["sum"],
        "driver": driver(flat),
        "plate": first(r"Государственный номерной знак\s*(\d{2}[A-Z]{2}\d{3}[A-Z]{3})", flat),
    }


# ── отдельные поля ────────────────────────────────────────────────────────

def month_number(word: str) -> int | None:
    """Месяц словом. В распознанном тексте он рвётся пробелами: «авт уста»."""
    plain = re.sub(r"[^а-яё]", "", (word or "").lower())
    if plain in MONTHS:
        return MONTHS[plain]
    # «авт уста» вместо «августа»: буквы распознались неточно, но название
    # месяца всё равно узнаваемо.
    close = difflib.get_close_matches(plain, list(MONTHS), n=1, cutoff=0.6)
    return MONTHS[close[0]] if close else None


def cmr_line(flat: str) -> dict:
    """Строка груза в CMR: мест, род упаковки, товар, код ТН ВЭД, вес брутто.

    Всё это стоит там в одну строку и в одном порядке, поэтому читается
    вместе: по отдельности код ТН ВЭД путался с ИНН покупателя, а вес
    слипался с кодом.

    В распознанном скане строка рвётся мусором («Костюм _ `|>6104192000 |
    649,90 кг»), поэтому между полями допускается что угодно неразрядное, а
    если строка не собралась целиком — читаются хотя бы код с весом: они
    стоят рядом и в развале.
    """
    pack = r"(?:Мешк\w*|Коробк\w*|Пакет\w*)"
    junk = r"[\s_`'|>!.,:;~-]*"
    whole = re.search(rf"(\d{{1,4}}){junk}{pack}{junk}"
                      rf"([А-ЯЁа-яё][А-ЯЁа-яё \-]{{2,40}}?){junk}"
                      rf"(6\d{{9}}){junk}([\d \u00a0]+(?:,\d+)?)\s*кг", flat)
    if whole:
        return {
            "places": number(whole.group(1)),
            "item": whole.group(2).strip(" -_"),
            "tnved": whole.group(3),
            "weight": number(whole.group(4)),
        }

    pair = re.search(rf"\b(6\d{{9}})\b{junk}([\d \u00a0]+(?:,\d+)?)\s*кг", flat)
    places = re.search(rf"(\d{{1,4}}){junk}{pack}", flat)
    item = re.search(rf"{pack}{junk}([А-ЯЁа-яё][А-ЯЁа-яё \-]{{2,40}}?){junk}6\d{{9}}", flat)
    return {
        "places": number(places.group(1)) if places else None,
        "item": item.group(1).strip(" -_") if item else "",
        "tnved": pair.group(1) if pair else "",
        "weight": number(pair.group(2)) if pair else None,
    }


def packing_totals(flat: str) -> dict:
    """Итог упаковочного листа: количество, сумма, вес нетто и брутто.

    Строка бывает двух видов — с суммой между количеством и весами и без
    неё, поэтому разбираем по числам, а не по жёсткому шаблону.
    """
    m = re.search(r"ИТОГО\s+((?:[\d \u00a0]+(?:,\d+)?\s+){2,4}[\d \u00a0]+(?:,\d+)?)(?=\s)", flat)
    empty = {"qty": None, "sum": None, "net": None, "gross": None}
    if not m:
        return empty
    values = [number(v) for v in re.findall(r"[\d \u00a0]+(?:,\d+)?", m.group(1))]
    values = [v for v in values if v is not None]
    if len(values) == 4:
        return {"qty": values[0], "sum": values[1], "net": values[2], "gross": values[3]}
    if len(values) == 3:
        return {"qty": values[0], "sum": None, "net": values[1], "gross": values[2]}
    return empty


def contract(flat: str) -> str:
    # «Договор поставки №942/1-1 от …», «Договор поставки № 942/1-1 от …»
    return first(r"[Дд]оговор(?:у)?\s+поставки\s*№\s*([\d/-]+)", flat) or ""


def contract_date(flat: str) -> str:
    m = re.search(r"[Дд]оговор(?:у)?\s+поставки\s*№\s*[\d/-]+\s*от\s*[«<]?(\d{1,2})[»>]?\s*"
                  r"([а-яё]+(?:\s[а-яё]+)?)\s*(\d{4})", flat)
    if not m:
        return ""
    day, month, year = m.group(1), month_number(m.group(2)), m.group(3)
    if not month:
        return ""
    try:
        return dt.date(int(year), month, int(day)).isoformat()
    except ValueError:
        return ""


def places(flat: str) -> float | None:
    """Запасной способ: «Всего мест Тридцать три» словами не берём, берём цифрой."""
    return number(first(r"Масса груза \(брутто\)[^\d]{0,20}[\d \u00a0]+,\d{2}", flat)) and None \
        or number(first(r"7 Количествомест.{0,400}?(\d{1,4})\s+(?:Мешки|мешки)", flat))


def unit_price(flat: str) -> float | None:
    """Цена за единицу — она одна на весь заказ и повторяется в каждой строке."""
    column = [number(p) for p in re.findall(r"шт\s+[\d \u00a0]+,\d{2}\s+([\d \u00a0]+,\d{2})", flat)]
    column = [c for c in column if c]
    if column:
        return max(set(column), key=column.count)
    return None


def driver(flat: str) -> str:
    raw = first(r"Водитель\s+([А-ЯЁ][А-Яа-яЁё]+(?:\s+[А-Яа-яЁё]+){1,3}?)\s+(?:Удостоверение|Лиценз)",
                flat)
    return (raw or "").strip()


# ── мелочи ────────────────────────────────────────────────────────────────

def first(pattern: str, text: str) -> str:
    m = re.search(pattern, text)
    return m.group(1) if m else ""


def number(raw) -> float | None:
    if not raw:
        return None
    cleaned = str(raw).replace(" ", "").replace(" ", "").replace(",", ".")
    try:
        return round(float(cleaned), 2)
    except ValueError:
        return None


def date(ru: str) -> str:
    if not ru:
        return ""
    day, month, year = ru.split(".")
    return f"{year}-{month}-{day}"


def pdf_text(path: Path) -> str:
    done = subprocess.run(["pdftotext", "-layout", str(path), "-"],
                          capture_output=True, text=True)
    return done.stdout


def ocr(path: Path, dpi: int) -> str:
    """Распознавание скана постранично: целиком tesseract на такое не хватает."""
    out = []
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(["pdftoppm", "-r", str(dpi), "-png", str(path), f"{tmp}/p"],
                       check=True, capture_output=True)
        for page in sorted(Path(tmp).glob("p*.png")):
            done = subprocess.run(["tesseract", str(page), "stdout", "-l", "rus+eng", "--psm", "6"],
                                  capture_output=True, text=True)
            out.append(done.stdout)
    return "\n".join(out)


if __name__ == "__main__":
    sys.exit(main())
