/**
 * Схема должна оставаться в рамках, которые принимает структурированный вывод.
 *
 * Поводом стал живой 400: поля вида ["string","null"] считаются объединением
 * типов, их разрешено не больше шестнадцати, а у нас вышло 45 — и API отверг
 * каждый документ. Проверка сторожит, чтобы объединения не завелись снова.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { EXTRACTION_SCHEMA, SYSTEM_PROMPT } from "../lib/schema.js";
import { build } from "../lib/ledger.js";

const UNION_LIMIT = 16;

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  visit(node);
  for (const value of Object.values(node)) {
    if (Array.isArray(value)) value.forEach((v) => walk(v, visit));
    else walk(value, visit);
  }
}

function countUnions(schema) {
  let unions = 0;
  walk(schema, (node) => {
    if (Array.isArray(node.type) || node.anyOf || node.oneOf) unions++;
  });
  return unions;
}

describe("схема извлечения", () => {
  it("не содержит объединений типов", () => {
    assert.equal(countUnions(EXTRACTION_SCHEMA), 0);
  });

  it("укладывается в лимит API с запасом", () => {
    assert.ok(countUnions(EXTRACTION_SCHEMA) <= UNION_LIMIT);
  });

  it("каждый объект закрыт и перечисляет свои поля в required", () => {
    walk(EXTRACTION_SCHEMA, (node) => {
      if (node.type !== "object") return;
      assert.equal(node.additionalProperties, false, "объект должен быть закрыт");
      assert.deepEqual(
        [...(node.required || [])].sort(),
        Object.keys(node.properties || {}).sort(),
        "required должен перечислять все поля",
      );
    });
  });

  it("промпт велит писать пустую строку, а не слово null", () => {
    assert.match(SYSTEM_PROMPT, /пустая строка/);
    assert.ok(!/—\s*null\./.test(SYSTEM_PROMPT), "в промпте не должно остаться null");
  });
});

describe("расчёты принимают строки, как их теперь отдаёт модель", () => {
  // То же, что фикстура спецификации и накладной, но все значения строками
  // и с пустыми строками вместо отсутствующих — форма нового ответа модели.
  const asStrings = (over) => ({
    doc_type: "other", confidence: 1, contract_no: "", order_no: "",
    doc_number: "", doc_date: "", parties: { supplier: "", buyer: "" },
    item: { name: "", color: "", composition: "", article: "", size_range: "" },
    ordered: { qty: "", unit_price: "", stated_total: "" },
    shipment: {
      date: "", qty: "", places: "", weight_gross: "", weight_net: "",
      stated_amount: "", driver: "", vehicle: "", vehicle_plate: "",
      route_from: "", route_to: "",
    },
    payments: [], orders: [],
    terms: { prepay_percent: "", lead_time_days: "", penalty_percent_per_day: "", postpay_days: "" },
    unreadable: false, notes: "", _source_file: "?",
    ...over,
  });

  const spec = asStrings({
    doc_type: "specification", contract_no: "666/1-1", doc_date: "2026-04-13",
    item: { name: "Костюм летний с шортами сингапур", color: "", composition: "", article: "", size_range: "" },
    ordered: { qty: "750", unit_price: "400.00", stated_total: "300 000,00" },
    terms: { prepay_percent: "50", lead_time_days: "7", penalty_percent_per_day: "1", postpay_days: "20" },
    payments: [{ kind: "предоплата", date: "2026-04-16", amount: "150 000,00 ₽",
                 currency: "RUB", contract_no: "666/1-1", purpose: "", doc_number: "291" }],
    _source_file: "спец.pdf",
  });

  const ship = asStrings({
    doc_type: "waybill", contract_no: "666/1-1", doc_date: "2026-06-05",
    ordered: { qty: "", unit_price: "400", stated_total: "" },
    shipment: {
      date: "2026-06-05", qty: "812", places: "8", weight_gross: "282,00", weight_net: "280,4",
      stated_amount: "324 800,00", driver: "Ташыкулов Элмир Койчубаевич",
      vehicle: "", vehicle_plate: "04KG227AON", route_from: "Бишкек", route_to: "Иваново",
    },
    _source_file: "отправка.pdf",
  });

  it("строки с пробелами и запятыми считаются как числа", () => {
    const { orders } = build([spec, ship]);
    const c = orders[0].computed;
    assert.equal(c.order_sum, 300000);
    assert.equal(c.shipment_sum, 324800);
    assert.equal(c.paid, 150000);
    assert.equal(c.remainder, 174800);
  });

  it("пустые строки означают отсутствие значения, а не ноль", () => {
    const { orders } = build([spec, ship]);
    // weight_net пришёл только из накладной, vehicle пуст в обоих документах.
    assert.equal(orders[0].get("vehicle"), null);
    assert.equal(orders[0].get("weight_net"), 280.4);
  });

  it("условия из строк доходят до расчёта просрочки", () => {
    const { orders } = build([spec, ship]);
    const c = orders[0].computed;
    assert.equal(c.overdue_days, 43);
    assert.equal(c.penalty, 129000);
  });

  it("документ, где всё пусто, уходит в неприкаянные", () => {
    const { orders, orphans } = build([asStrings({ _source_file: "мусор.pdf" })]);
    assert.equal(orders.length, 0);
    assert.equal(orphans.length, 1);
  });
});
