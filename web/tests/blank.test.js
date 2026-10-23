/**
 * Проверки бланка: что подставляется, куда и что не вылезает за клетку.
 *
 * Сам PDF собирается из тех же констант, что и предпросмотр, поэтому
 * проверять есть смысл именно их: четыре копии, их углы, подстановку
 * четырёх полей и подбор кегля под ширину колонки.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { FOLD, PAGE, ROWS, blankName, corners, fields, fitSize } from "../lib/blank.js";
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
