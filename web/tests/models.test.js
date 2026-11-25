/**
 * База моделей: ткань и фурнитура модели, привязка заказов, заказ фурнитуры.
 *
 * Главное, что проверяется, — модели переживают загрузку и сохранение:
 * страница пропускает данные через normalize, и всё, чего он не знает,
 * при первой же правке заказа на сайте стёрлось бы.
 */
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { orderFromRecord } from "../lib/ledger.js";
import { accessoriesPdf, accessoryRows, fabricText, hasAccessories, modelOf, newId, normalizeModel,
  normalizeModels, normalizeSuppliers, orderQty, ordersOf, supplierName } from "../lib/models.js";
import { fabricRows } from "../lib/fabric.js";
import { load } from "../lib/store.js";

const metrics = JSON.parse(readFileSync(new URL("../assets/blank/metrics.json", import.meta.url)));
const fonts = Object.fromEntries(Object.entries(metrics).map(([style, info]) =>
  [style, { ...info, bytes: readFileSync(new URL(`../assets/blank/${info.file}`, import.meta.url)) }]));

const bomber = normalizeModel({
  id: "m4", name: "БОМБЕР_ЛИНИНГ",
  fabric: { name: "Лининг", composition: "полиэстер 62%, хлопок 36%, эластан 2%", supplier: "s1" },
  rate: "1,9",
  accessories: [
    { id: "f1", name: "Молния разъёмная", size: "60 см", per_item: 1, unit: "шт", supplier: "s1" },
    { id: "f2", name: "Резинка", size: "40 мм", per_item: 1.2, unit: "м" },
    { name: "" },
  ],
});

describe("модели", () => {
  it("пустые позиции фурнитуры отбрасываются, числа читаются и через запятую", () => {
    assert.equal(bomber.rate, 1.9);
    assert.equal(bomber.accessories.length, 2);
    assert.equal(bomber.accessories[1].per_item, 1.2);
    assert.equal(hasAccessories(bomber), true);
    assert.equal(hasAccessories(normalizeModel({ name: "X" })), false);
  });

  it("модели и поставщики без названия не сохраняются", () => {
    assert.equal(normalizeModels([{ name: "" }, { name: "ФОБУС" }]).length, 1);
    assert.equal(normalizeSuppliers([{ name: " " }, { name: "Рынок Дордой", phone: "+996" }]).length, 1);
  });

  it("материал — ткань и состав одной строкой", () => {
    assert.equal(fabricText(bomber), "Лининг: полиэстер 62%, хлопок 36%, эластан 2%");
    assert.equal(fabricText(null), "");
  });

  it("новый ключ не занимает существующий", () => {
    assert.equal(newId("m", ["m1", "m2", "m4"]), "m3");
    assert.equal(newId("s", []), "s1");
  });

  it("заказ находит свою модель, модель — свои договоры", () => {
    const orders = [{ id: "1127", model: "m4" }, { id: "1150", model: "m4" }, { id: "1084", model: "m1" }]
      .map(orderFromRecord);
    assert.equal(modelOf([bomber], orders[0]).name, "БОМБЕР_ЛИНИНГ");
    assert.equal(modelOf([bomber], orders[2]), null);
    assert.deepEqual(ordersOf(orders, bomber).map((o) => o.key), ["1127", "1150"]);
  });

  it("фурнитура на заказ — норма × штуки", () => {
    const order = orderFromRecord({ id: "1199", ordered_qty: 800, model: "m4" });
    assert.equal(orderQty(order), 800);
    const rows = accessoryRows(bomber, orderQty(order));
    assert.equal(rows[0].total, 800);
    assert.equal(rows[1].total, 960);
    assert.equal(supplierName([{ id: "s1", name: "Дордой" }], rows[0].supplier), "Дордой");
  });

  it("в закупке ткани материал берётся из модели, если в заказе пусто", () => {
    const order = orderFromRecord({ id: "1199", colors: [{ name: "графит", hex: "", qty: 200 }] });
    assert.equal(fabricRows(order, fabricText(bomber))[0].material, fabricText(bomber));
  });

  it("PDF заказа фурнитуры собирается", () => {
    const order = orderFromRecord({ id: "1199", contract_no: "1199/1-1", ordered_qty: 800 });
    const text = new TextDecoder("latin1").decode(accessoriesPdf(order, bomber, [], fonts));
    assert.match(text, /^%PDF-1\.4/);
  });

  it("модели, поставщики и модель заказа переживают загрузку страницы", async () => {
    const raw = {
      orders: [{ id: "1127", model: "m4" }],
      models: [bomber], suppliers: [{ id: "s1", name: "Дордой", container: "А-12" }],
    };
    const was = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: true, json: async () => structuredClone(raw) });
    try {
      const data = await load();
      assert.equal(data.orders[0].model, "m4");
      assert.equal(data.models[0].accessories.length, 2);
      assert.equal(data.suppliers[0].container, "А-12");
    } finally {
      globalThis.fetch = was;
    }
  });
});
