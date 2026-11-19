/**
 * Закупка ткани: строки по цветам, разбор вписанного расхода, метраж и
 * сборка PDF с фото расцветок.
 */
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { normalizeColors } from "../lib/colors.js";
import { fabricPdf, fabricRows, fmtMeters, hasFabric, meters, parseRate, totals } from "../lib/fabric.js";
import { orderFromRecord } from "../lib/ledger.js";
import { jpegSize } from "../lib/pdf.js";

const metrics = JSON.parse(readFileSync(new URL("../assets/blank/metrics.json", import.meta.url)));
const fonts = Object.fromEntries(Object.entries(metrics).map(([style, info]) =>
  [style, { ...info, bytes: readFileSync(new URL(`../assets/blank/${info.file}`, import.meta.url)) }]));

const order = (colors, extra = {}) => orderFromRecord({ id: "1196", contract_no: "1196/1-1",
  order_date: "2026-11-06", item: "Блузка", material: "Прада, полиэстер 100%", colors, ...extra });

describe("закупка ткани", () => {
  it("в таблицу идут только цвета со штуками", () => {
    const o = order([{ name: "белый", hex: "", qty: 325, sizes: "40–64", photo: "a.jpg" }, { name: "красный", hex: "" }]);
    assert.deepEqual(fabricRows(o), [{ name: "белый", qty: 325, sizes: "40–64", photo: "a.jpg",
      material: "Прада, полиэстер 100%" }]);
    assert.equal(hasFabric(o), true);
    assert.equal(hasFabric(order([{ name: "красный", hex: "" }])), false);
  });

  it("расход пишут и через запятую, пустое — ноль метров", () => {
    assert.equal(parseRate("0,7"), 0.7);
    assert.equal(parseRate(" 1 "), 1);
    assert.equal(parseRate(""), null);
    assert.equal(parseRate("abc"), null);
    assert.equal(meters(325, null), 0);
  });

  it("метраж = штуки × расход, без хвостов округления", () => {
    assert.equal(meters(325, 0.7), 227.5);
    assert.equal(meters(130, 0.7), 91);
    const rows = [{ qty: 325 }, { qty: 130 }, { qty: 390 }];
    assert.deepEqual(totals(rows, 0.8), { qty: 845, meters: 676 });
    assert.equal(fmtMeters(2912), "2 912");
    assert.equal(fmtMeters(227.5), "227,5");
    assert.equal(fmtMeters(0), "0");
  });

  it("штуки, размеры и фото цвета сохраняются, пустые — нет", () => {
    assert.deepEqual(normalizeColors([{ name: "белый", hex: "", qty: "325", sizes: " 40–64 ", photo: "" }]),
      [{ name: "белый", hex: "", qty: 325, sizes: "40–64" }]);
    assert.deepEqual(normalizeColors([{ name: "белый", hex: "", qty: "" }]), [{ name: "белый", hex: "" }]);
  });

  it("PDF собирается на нескольких страницах и с фото", () => {
    const jpeg = new Uint8Array(readFileSync(new URL("../assets/photos/1196/01.jpg", import.meta.url)));
    assert.ok(jpegSize(jpeg).w > 0);
    const colors = Array.from({ length: 17 }, (_, i) => ({ name: `цвет ${i}`, hex: "", qty: 130, photo: "p.jpg" }));
    const bytes = fabricPdf(order(colors), fonts, 0.7, new Map([["p.jpg", jpeg]]));
    const text = new TextDecoder("latin1").decode(bytes);
    assert.match(text, /^%PDF-1\.4/);
    assert.match(text, /\/Count 2>>/);
    assert.equal((text.match(/\/Subtype\/Image/g) || []).length, 1);   // одно фото — один объект
  });

  it("убранные цвета в PDF не попадают", () => {
    const colors = [{ name: "белый", hex: "", qty: 100 }, { name: "черный", hex: "", qty: 50 }];
    const all = new TextDecoder("latin1").decode(fabricPdf(order(colors), fonts, 1));
    const one = new TextDecoder("latin1").decode(fabricPdf(order(colors), fonts, 1, new Map(), new Set(["черный"])));
    assert.ok(one.length < all.length);
  });
});
