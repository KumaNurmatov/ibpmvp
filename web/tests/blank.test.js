/**
 * Проверки бланка: что подставляется, куда и что не вылезает за клетку.
 *
 * Сам PDF собирается из тех же констант, что и предпросмотр, поэтому
 * проверять есть смысл именно их: четыре копии, их углы, подстановку
 * четырёх полей и подбор кегля под ширину колонки.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { readFileSync } from "node:fs";

import { FOLD, PAGE, ROWS, blankHtml, blankName, blankPdf, corners, fields, fitSize, rowValues } from "../lib/blank.js";
import { orderFromRecord } from "../lib/ledger.js";

const order = (over = {}) => orderFromRecord({
  id: "666", contract_no: "666/1-1", order_no: "Аи 13.04.26/4",
  order_date: "2026-04-13", item: "Костюм", item_article: "КОСТЛЕТШ01",
  ordered_qty: 750, unit_price: 400, ...over,
});

describe("что печатается в бланке", () => {
  it("четыре поля из заказа, дата по-русски", () => {
    assert.deepEqual(fields(order()), {
      contract_no: "666/1-1",
      order_no: "Аи 13.04.26/4",
      order_date: "13.04.2026",
      item_article: "КОСТЛЕТШ01",
    });
  });

  it("пустые поля остаются пустыми, а не «—»", () => {
    const bare = fields(order({ order_date: "", item_article: "" }));
    assert.equal(bare.order_date, "");
    assert.equal(bare.item_article, "");
  });

  it("в бланке девять строк, и заполняются только четыре", () => {
    assert.equal(ROWS.length, 9);
    assert.deepEqual(ROWS.filter(([, key]) => key).map(([, key]) => key),
      ["contract_no", "order_no", "order_date", "item_article"]);
  });
});

describe("правка перед скачиванием", () => {
  const dir = new URL("../assets/blank/", import.meta.url);
  const fonts = Object.fromEntries(Object.entries(JSON.parse(readFileSync(new URL("metrics.json", dir))))
    .map(([style, info]) => [style, { ...info, bytes: new Uint8Array(readFileSync(new URL(info.file, dir))) }]));
  const texts = (bytes) => Buffer.from(bytes).toString("latin1").match(/ Tj ET/g).length;

  it("значения строк идут по порядку бланка", () => {
    assert.deepEqual(rowValues(order()),
      ["666/1-1", "Аи 13.04.26/4", "13.04.2026", "", "КОСТЛЕТШ01", "", "", "", ""]);
  });

  it("без правок в PDF только четыре поля в четырёх копиях", () => {
    assert.equal(texts(blankPdf(order(), fonts)), (ROWS.length + 4) * 4);
  });

  it("вписанная строка печатается во всех четырёх копиях", () => {
    const values = rowValues(order());
    values[3] = "12.11.2026";
    assert.equal(texts(blankPdf(order(), fonts, values)), (ROWS.length + 5) * 4);
  });

  it("предпросмотр показывает правку в каждой копии", () => {
    const values = rowValues(order());
    values[4] = "АРТ \"1\"";
    const html = blankHtml(order(), values);
    assert.equal(html.split('value="АРТ &quot;1&quot;"').length - 1, 4);
  });

  it("запись заказа правки не трогают", () => {
    const o = order();
    rowValues(o)[4] = "другой";
    assert.equal(fields(o).item_article, "КОСТЛЕТШ01");
  });
});

describe("раскладка листа", () => {
  it("четыре копии: две сверху, две снизу", () => {
    const at = corners();
    assert.equal(at.length, 4);
    assert.equal(new Set(at.map((c) => c.x)).size, 2);
    assert.equal(new Set(at.map((c) => c.y)).size, 2);
  });

  it("копии не вылезают за лист", () => {
    for (const { x, y } of corners()) {
      assert.ok(x + 89.03 <= PAGE.width, `копия справа вылезает: ${x}`);
      assert.ok(y + 14.57 * ROWS.length <= PAGE.height, `копия снизу вылезает: ${y}`);
    }
  });

  it("линия реза поперёк листа — посередине между копиями", () => {
    const ys = [...new Set(corners().map((c) => c.y))].sort((a, b) => a - b);
    const above = FOLD - (ys[0] + 14.57 * ROWS.length);
    const below = ys[1] - FOLD;
    assert.ok(above > 1 && below > 1, "линия не должна липнуть к копиям");
    assert.ok(Math.abs(above - below) < 0.01, `сверху ${above} мм, снизу ${below} мм`);
  });
});

describe("подбор кегля", () => {
  // Ширину меряет сам документ; для проверки хватает простой линейки:
  // каждый знак условно по 6 единиц на кегль 10.
  const ruler = { widthOf: (value, { size }) => value.length * 0.6 * size };

  it("короткое значение печатается полным кеглем", () => {
    assert.equal(fitSize(ruler, "1042", 100), 11.5);
  });

  it("длинный артикул ужимается, чтобы влезть", () => {
    const long = "КОСТЛЕТШ01сингапур/олива";
    const size = fitSize(ruler, long, 100);
    assert.ok(size < 11.5, "кегль не уменьшился");
    assert.ok(ruler.widthOf(long, { size }) <= 100, "всё равно не влезает");
  });

  it("но не бесконечно: ниже шести пунктов не читается", () => {
    assert.equal(fitSize(ruler, "о".repeat(300), 100), 6);
  });
});

describe("имя файла", () => {
  it("из номера договора, без дроби", () => {
    assert.equal(blankName(order()), "Бланк 666-1-1.pdf");
  });
});
