/**
 * Проверки стадий процесса и списка дел.
 *
 * Стадия — то, по чему заказ ищут глазами: в таблице это были листы и цвет
 * строки, и две стадии из пяти там вообще не отмечались. Поэтому правило
 * проверяется на границах: ровно нулевой остаток, переплата, остаток, который
 * нечем посчитать.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { orderFromRecord } from "../lib/ledger.js";
import { funnel, stageOf, tasks } from "../lib/stages.js";

const PREPAY = { kind: "предоплата", date: "2026-04-16", amount: 150000 };
const POSTPAY = { kind: "постоплата", date: "2026-06-25", amount: 174800 };

const order = (over = {}) => orderFromRecord({
  id: "666", order_no: "Аи 13.04.26/4", contract_no: "666/1-1",
  item: "Костюм", ordered_qty: 750, unit_price: 400,
  shipment: { date: "2026-06-05", qty: 812 },
  payments: [PREPAY, POSTPAY],
  terms: { prepay_percent: 50, lead_time_days: 7 },
  ...over,
});

describe("стадия заказа", () => {
  it("без отгрузки и без предоплаты — ждёт предоплаты", () => {
    assert.equal(stageOf(order({ shipment: {}, payments: [] })), "prepay");
  });

  it("предоплата есть, отгрузки нет — в пошиве", () => {
    assert.equal(stageOf(order({ shipment: {}, payments: [PREPAY] })), "production");
  });

  it("отгружено без постоплаты — нет постоплаты", () => {
    assert.equal(stageOf(order({ payments: [PREPAY] })), "shipped");
  });

  it("постоплата прошла, остаток остался, приёмки нет — на приёмку", () => {
    const partial = { ...POSTPAY, amount: 100000 };
    assert.equal(stageOf(order({ payments: [PREPAY, partial] })), "acceptance");
  });

  it("приёмка отмечена, недоплата больше непринятого — к сверке", () => {
    const partial = { ...POSTPAY, amount: 100000 };
    const o = order({ payments: [PREPAY, partial], acceptance: { rejected_qty: 10 } });
    assert.equal(stageOf(o), "reconcile");
    assert.equal(o.computed.rejected_sum, 4000);      // 10 × 400
    assert.equal(o.computed.unexplained, 70800);      // 74 800 − 4 000
  });

  it("недоплата ровно за непринятое — сделка закрыта", () => {
    // 812 отгружено, 625 принято; 187 × 400 = 74 800 — ровно недоплата
    const partial = { ...POSTPAY, amount: 100000 };
    const o = order({ payments: [PREPAY, partial], acceptance: { accepted_qty: 625 } });
    assert.equal(o.computed.rejected_qty, 187);
    assert.equal(o.computed.unexplained, 0);
    assert.equal(stageOf(o), "closed");
  });

  it("остаток сошёлся — закрыт", () => {
    // 812 × 400 = 324 800 = 150 000 + 174 800
    assert.equal(stageOf(order()), "closed");
  });

  it("переплата закрытым заказом не считается", () => {
    assert.equal(stageOf(order({ payments: [PREPAY, { ...POSTPAY, amount: 200000 }] })), "acceptance");
  });

  it("отгрузка есть, а посчитать нечем — не «закрыт»", () => {
    const blind = order({ unit_price: null, payments: [PREPAY] });
    assert.equal(blind.computed.remainder, null);
    assert.equal(stageOf(blind), "acceptance");
  });
});

describe("остановленный заказ", () => {
  it("отменённый не числится в пошиве", () => {
    // По деньгам он от пошива не отличим: предоплата есть, отгрузки нет.
    assert.equal(stageOf(order({ shipment: {}, payments: [PREPAY], status: "отменён" })), "stopped");
  });

  it("дело по нему одно — решить судьбу предоплаты", () => {
    const [task] = tasks([order({ shipment: {}, payments: [PREPAY], status: "отменён" })]);
    assert.match(task.title, /предоплаты/);
    assert.equal(task.amount, PREPAY.amount);
  });

  it("а без предоплаты делать нечего", () => {
    assert.deepEqual(tasks([order({ shipment: {}, payments: [], status: "отменён" })]), []);
  });

  it("в воронку он не попадает: это выход из процесса, а не ступень", () => {
    const rows = funnel([order({ shipment: {}, payments: [PREPAY], status: "отменён" })]);
    assert.ok(!rows.some((r) => r.key === "stopped"));
    assert.equal(rows.reduce((s, r) => s + r.count, 0), 0, "он не должен попасть и на чужую ступень");
  });
});

describe("воронка", () => {
  it("держит все ступени, даже пустые", () => {
    const rows = funnel([order()]);
    assert.deepEqual(rows.map((r) => r.key),
      ["prepay", "production", "shipped", "acceptance", "reconcile", "closed"]);
    assert.equal(rows.find((r) => r.key === "closed").count, 1);
    assert.equal(rows.find((r) => r.key === "prepay").count, 0);
  });

  it("на ступени «ждёт предоплаты» стоят ожидаемые деньги, а не остаток", () => {
    const rows = funnel([order({ shipment: {}, payments: [] })]);
    // 750 × 400 × 50%
    assert.equal(rows.find((r) => r.key === "prepay").sum, 150000);
  });

  it("на ступени «нет постоплаты» стоит непришедший остаток", () => {
    const rows = funnel([order({ payments: [PREPAY] })]);
    assert.equal(rows.find((r) => r.key === "shipped").sum, 174800);
  });
});

describe("приёмка", () => {
  const partial = { ...POSTPAY, amount: 100000 };
  const codes = (o) => new Set(o.flags.map((f) => f.code));

  it("считает непринятое из принятого, когда завернутое не отмечено", () => {
    const o = order({ acceptance: { accepted_qty: 800 } });
    assert.equal(o.computed.rejected_qty, 12);        // 812 − 800
    assert.equal(o.computed.accepted_sum, 320000);
    assert.equal(o.computed.rejected_sum, 4800);
  });

  it("недоплата ровно за непринятое — замечание о закрытии", () => {
    const o = order({ payments: [PREPAY, partial], acceptance: { rejected_qty: 187 } });
    assert.ok(codes(o).has("acceptance_settled"));
    assert.equal(o.computed.settled, true);
  });

  it("недоплата сверх непринятого — ошибка с разницей", () => {
    const o = order({ payments: [PREPAY, partial], acceptance: { rejected_qty: 10 } });
    assert.ok(codes(o).has("underpaid_beyond_rejected"));
    assert.equal(o.computed.unexplained, 70800);      // 74 800 − 4 000
    const text = o.flags.find((f) => f.code === "underpaid_beyond_rejected").message;
    // Пробел в суммах неразрывный, поэтому сверяем по цифрам, а не по строке.
    assert.ok(/70.800,00/.test(text), text);
  });

  it("заплатили больше, чем за принятое — предупреждение", () => {
    const o = order({ payments: [PREPAY, partial], acceptance: { rejected_qty: 400 } });
    assert.ok(codes(o).has("overpaid_rejected"));
    assert.equal(o.computed.unexplained, -85200);     // 74 800 − 160 000
  });

  it("без приёмки ничего не выдумывается", () => {
    const o = order({ payments: [PREPAY, partial] });
    assert.equal(o.computed.rejected_qty, null);
    assert.equal(o.computed.unexplained, null);
    assert.equal(o.computed.settled, false);
  });
});

describe("список дел", () => {
  it("закрытые заказы в список не попадают", () => {
    assert.deepEqual(tasks([order()]), []);
  });

  it("отгружено без постоплаты — ошибка на сумму остатка", () => {
    const [task] = tasks([order({ payments: [PREPAY] })]);
    assert.equal(task.level, "error");
    assert.equal(task.amount, 174800);
    assert.equal(task.title, "Постоплаты не было");
  });

  it("срок отгрузки истёк — просрочка считается от сегодня", () => {
    const waiting = order({ shipment: {}, payments: [PREPAY] });
    // предоплата 16.04 + 7 дней = 23.04; на 03.05 это 10 дней просрочки
    const [task] = tasks([waiting], new Date("2026-05-03T00:00:00Z"));
    assert.equal(task.level, "error");
    assert.equal(task.title, "Отгрузка просрочена на 10 дн.");
  });

  it("без срока в условиях просрочки не бывает", () => {
    // Реестр сроков не хранит: заявлять по ним просрочку и неустойку значило
    // бы выдумывать претензию.
    const noTerms = order({ shipment: {}, payments: [PREPAY], terms: { prepay_percent: 50 } });
    const [task] = tasks([noTerms], new Date("2027-01-01T00:00:00Z"));
    assert.equal(task.level, "info");
    assert.equal(task.title, "Ждём отгрузку");
    assert.equal(noTerms.computed.overdue_days, undefined);
  });

  it("срок ещё не вышел — заказ просто ждёт отгрузки", () => {
    const waiting = order({ shipment: {}, payments: [PREPAY] });
    const [task] = tasks([waiting], new Date("2026-04-20T00:00:00Z"));
    assert.equal(task.level, "info");
    assert.equal(task.title, "Ждём отгрузку");
  });

  it("переплата называется переплатой", () => {
    const [task] = tasks([order({ payments: [PREPAY, { ...POSTPAY, amount: 200000 }] })]);
    assert.equal(task.title, "Переплата");
    assert.equal(task.amount, -25200);
  });

  it("срочное наверху: сначала ошибки, внутри них — крупные суммы", () => {
    const rows = tasks([
      order({ id: "a", payments: [PREPAY, { ...POSTPAY, amount: 174700 }] }),  // к сверке, 100 ₽
      order({ id: "b", payments: [PREPAY] }),                                  // нет постоплаты, 174 800 ₽
      order({ id: "c", shipment: {}, payments: [] }),                          // ждёт предоплаты
    ], new Date("2026-04-20T00:00:00Z"));
    assert.deepEqual(rows.map((r) => r.order.key), ["b", "c", "a"]);
  });
});
