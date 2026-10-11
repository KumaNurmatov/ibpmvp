#!/usr/bin/env python3
"""Сборка шрифта для бланка: подмножество Liberation Sans + метрики к нему.

Бланк печатается из браузера без единой внешней библиотеки — PDF собирает
`web/lib/pdf.js`. Чтобы в нём была кириллица, шрифт нужно вшить в файл, а
для раскладки текста — знать ширины глифов. Отсюда два артефакта на каждое
начертание: сам TTF (урезанный до нужных знаков, иначе 400 КБ на каждое) и
JSON с номерами глифов и ширинами.

    python3 tool/build_blank_font.py

Шрифт метрически совместим с Arial, которым набран исходный бланк, поэтому
распечатка совпадает с привычной.
"""
from __future__ import annotations

import json
import pathlib

from fontTools import subset
from fontTools.ttLib import TTFont

SOURCES = {
    "regular": "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "bold": "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
}
OUT = pathlib.Path("web/assets/blank")

# Что должно печататься: кириллица с «ё», латиница, цифры, знаки из номеров
# договоров и артикулов, рубль и номер.
CHARS = (
    "".join(chr(c) for c in range(0x0410, 0x0450)) + "ЁёІіЇїЄєҢңӨөҮү"
    + "".join(chr(c) for c in range(0x0041, 0x005B))
    + "".join(chr(c) for c in range(0x0061, 0x007B))
    + "0123456789"
    + " .,:;!?-–—_/\\()[]{}«»\"'`+=*%№#@&$₽°"
)


def build() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    report = {}

    for style, source in SOURCES.items():
        font = TTFont(source)
        options = subset.Options(layout_features=[], notdef_outline=True,
                                 recalc_bounds=True, drop_tables=["DSIG"])
        subsetter = subset.Subsetter(options=options)
        subsetter.populate(text=CHARS)
        subsetter.subset(font)

        path = OUT / f"{style}.ttf"
        font.save(path)

        # Метрики: номер глифа и ширина на 1000 единиц — ровно то, что нужно
        # писать в PDF и чем мерить строку при раскладке.
        upm = font["head"].unitsPerEm
        cmap = font.getBestCmap()
        order = font.getGlyphOrder()
        gid = {name: i for i, name in enumerate(order)}
        hmtx = font["hmtx"]

        glyphs = {}
        for code, name in cmap.items():
            if name in gid:
                glyphs[code] = [gid[name], round(hmtx[name][0] * 1000 / upm)]

        os2 = font["OS/2"]
        head = font["head"]
        report[style] = {
            "file": f"{style}.ttf",
            "unitsPerEm": upm,
            "ascent": round(os2.sTypoAscender * 1000 / upm),
            "descent": round(os2.sTypoDescender * 1000 / upm),
            "capHeight": round(getattr(os2, "sCapHeight", 716) * 1000 / upm),
            "bbox": [round(v * 1000 / upm) for v in
                     (head.xMin, head.yMin, head.xMax, head.yMax)],
            "glyphs": glyphs,
        }
        print(f"{style}: {len(glyphs)} знаков, {path.stat().st_size // 1024} КБ")

    (OUT / "metrics.json").write_text(
        json.dumps(report, ensure_ascii=False, separators=(",", ":")) + "\n", "utf-8")
    print("метрики:", (OUT / "metrics.json").stat().st_size // 1024, "КБ")


if __name__ == "__main__":
    build()
