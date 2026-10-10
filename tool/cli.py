"""Тот же конвейер из командной строки: папка → книга.

    python -m tool.cli ~/Загрузки/заказ-666 -o Заказы.xlsx
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from .pipeline import export_xlsx, process, to_json

SUPPORTED = {".pdf", ".png", ".jpg", ".jpeg", ".webp", ".heic", ".tif", ".tiff",
             ".docx", ".xlsx", ".xlsm", ".csv", ".txt"}


def collect(targets: list[str]) -> list[Path]:
    out: list[Path] = []
    for raw in targets:
        path = Path(raw)
        if path.is_dir():
            out += sorted(p for p in path.rglob("*")
                          if p.is_file() and p.suffix.lower() in SUPPORTED)
        elif path.is_file():
            out.append(path)
        else:
            print(f"пропущено, не найдено: {raw}", file=sys.stderr)
    return out


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Разбор документов по заказам")
    parser.add_argument("paths", nargs="+", help="файлы или папки")
    parser.add_argument("-o", "--out", default="Заказы.xlsx", help="куда записать книгу")
    parser.add_argument("--cache", default=".ibp-cache", help="папка кэша распознавания")
    parser.add_argument("--json", dest="json_out", help="дополнительно выгрузить разбор в JSON")
    args = parser.parse_args(argv)

    paths = collect(args.paths)
    if not paths:
        print("нечего разбирать", file=sys.stderr)
        return 1

    def progress(name: str, done: int, total: int) -> None:
        print(f"[{done}/{total}] {name}", file=sys.stderr)

    result = process(paths, cache_dir=args.cache, progress=progress)
    export_xlsx.write(result["orders"], args.out, orphans=result["orphans"])

    payload = to_json(result)
    if args.json_out:
        Path(args.json_out).write_text(
            json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

    t = payload["totals"]
    print(f"\nЗаказов: {t['orders']} | остаток: {t['remainder']:,.2f} ₽ "
          f"| ошибок: {t['errors']} | предупреждений: {t['warnings']}".replace(",", " "))
    for order in result["orders"]:
        c = order.computed
        print(f"  {order.get('order_no') or order.key:22} дог {order.contract_no or '—':9} "
              f"остаток {c.get('remainder')}")
    for item in payload["failed"] + payload["orphans"]:
        print(f"  ! {item.get('file')}: {item.get('error') or item.get('reason')}", file=sys.stderr)
    print(f"\nКнига: {args.out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
