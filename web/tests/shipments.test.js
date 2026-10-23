/**
 * Проверки отгрузок: что складывается из заказов, а что хранится отдельно.
 *
 * Главное правило раздела — ничего не вводить второй раз. Вес, места,
 * количество, сумма отгрузки и ссылки на документы берутся из заказов; в
 * записи отгрузки живут только состав, водитель, ставка, акт и оплаты. Если
 * это правило сломать, цифры на двух страницах разойдутся, и верить будет
 * нечему — поэтому проверяется именно оно.
 *
 * Второе правило: заказ, не попавший ни в одну запись, не исчезает — он
 * собирается в отгрузку по дате отправки из своей же карточки.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { orderFromRecord } from "../lib/ledger.js";
import { docsOf, freeCarriage, shipmentsOf, totalsOf, warningsOf } from "../lib/shipments.js";

const order = (over = {}) => orderFromRecord({
  id: "666", contract_no: "666/1-1", order_no: "Аи 13.04.26/4",
  item: "Костюм", ordered_qty: 750, unit_price: 400,
  shipment: { date: "2026-06-05", qty: 812, places: 8, weight_gross: 282 },
  ...over,
});

const second = (over = {}) => order({
  id: "662", contract_no: "662/1-1", order_no: "Аи 13.04.26/2",
  shipment: { date: "2026-06-05", qty: 100, places: 2, weight_gross: 376 },
  ...over,
});

describe("отгрузки собираются по датам", () => {
  it("заказы одного дня попадают в одну машину", () => {
    const [ship] = shipmentsOf({}, [order(), second()]);
    assert.equal(ship.date, "2026-06-05");
    assert.deepEqual(ship.contracts, ["666/1-1", "662/1-1"]);
    assert.equal(ship.stored, false, "такая отгрузка нигде не записана");
  });

  it("разные дни — разные машины, свежая сверху", () => {
    const list = shipmentsOf({}, [order(), second({ shipment: { date: "2026-07-01", qty: 5 } })]);
    assert.deepEqual(list.map((s) => s.date), ["2026-07-01", "2026-06-05"]);
  });

  it("заказ без даты отправки ни в одну машину не попадает", () => {
    assert.deepEqual(shipmentsOf({}, [order({ shipment: {} })]), []);
  });

  it("записанная отгрузка забирает свои заказы себе", () => {
    const data = { shipments: [{ id: "2026-06-05", date: "2026-06-05", orders: ["666", "662"] }] };
    const list = shipmentsOf(data, [order(), second()]);
    assert.equal(list.length, 1);
    assert.equal(list[0].stored, true);
    assert.equal(list[0].totals.orders, 2);
  });

  it("заказ из записи не дублируется отгрузкой по дате", () => {
    // Он лежит в машине 7 июля, хотя в карточке стоит 5 июня: второй раз, по
    // своей дате, он появляться не должен — иначе вес посчитается дважды.
    const data = { shipments: [{ id: "2026-07-07", date: "2026-07-07", orders: ["666"] }] };
    const list = shipmentsOf(data, [order()]);
    assert.equal(list.length, 1);
    assert.deepEqual(list[0].contracts, ["666/1-1"]);
  });
});

describe("цифры машины складываются из заказов", () => {
  it("вес, места, количество и деньги", () => {
    const totals = totalsOf([order(), second()]);
    assert.equal(totals.weight, 658);
    assert.equal(totals.places, 10);
    assert.equal(totals.qty, 912);
    assert.equal(totals.sum, (812 + 100) * 400);
  });

  it("нет ни одного веса — нет и общего, а не ноль", () => {
    const totals = totalsOf([order({ shipment: { date: "2026-06-05" } })]);
    assert.equal(totals.weight, null);
  });

  it("доставка считается по весу и ставке", () => {
    const data = { shipments: [{ id: "a", date: "2026-06-05", orders: ["666"], rate_per_kg: 80 }] };
    const [ship] = shipmentsOf(data, [order()]);
    assert.equal(ship.cost, 282 * 80);
    assert.equal(ship.paid, 0);
    assert.equal(ship.due, 282 * 80);
  });

  it("оплаты за доставку уменьшают остаток", () => {
    const data = { shipments: [{
      id: "a", date: "2026-06-05", orders: ["666"], rate_per_kg: 80,
      payments: [{ date: "2026-06-18", amount: 20000 }, { date: "2026-07-01", amount: 2560 }],
    }] };
    const [ship] = shipmentsOf(data, [order()]);
    assert.equal(ship.paid, 22560);
    assert.equal(ship.due, 282 * 80 - 22560);
  });

  it("вес по приёмке заменяет брутто в расчёте доставки", () => {
    // На приёмке намерили 290 кг вместо 282 по документам, акт выставлен
    // на 290 × 80. Оплата по акту не должна выглядеть переплатой.
    const data = { shipments: [{
      id: "a", date: "2026-06-05", orders: ["666"], rate_per_kg: 80, weight_accepted: 290,
      payments: [{ date: "2026-06-18", amount: 290 * 80 }],
    }] };
    const [ship] = shipmentsOf(data, [order()]);
    assert.equal(ship.totals.weight, 282, "брутто по документам остаётся как было");
    assert.equal(ship.weight_billed, 290);
    assert.equal(ship.cost, 290 * 80);
    assert.equal(ship.due, 0);
    assert.equal(ship.warnings.length, 0);
  });

  it("без веса остаток по доставке неизвестен, а не ноль", () => {
    const data = { shipments: [{ id: "a", date: "2026-06-05", orders: ["666"] }] };
    const [ship] = shipmentsOf(data, [order({ shipment: { date: "2026-06-05", qty: 10 } })]);
    assert.equal(ship.cost, null);
    assert.equal(ship.due, null);
  });
});

describe("документы не вводятся второй раз", () => {
  it("ссылки машины — это ссылки её заказов", () => {
    const links = [{ title: "Отправка 666.pdf", url: "https://drive/1" }];
    const docs = docsOf([order({ links })]);
    assert.deepEqual(docs, [{
      order: "666", contract: "666/1-1", title: "Отправка 666.pdf", url: "https://drive/1",
    }]);
  });

  it("водитель берётся из заказов, если в записи его не вписали", () => {
    const data = { shipments: [{ id: "a", date: "2026-06-05", orders: ["666", "662"] }] };
    const driver = { date: "2026-06-05", qty: 1, weight_gross: 1, driver: "Ташыкулов Элмир" };
    const [ship] = shipmentsOf(data, [order({ shipment: driver }), second({ shipment: driver })]);
    assert.equal(ship.driver, "Ташыкулов Элмир");
  });

  it("но не придумывается, когда водители разные", () => {
    const data = { shipments: [{ id: "a", date: "2026-06-05", orders: ["666", "662"] }] };
    const [ship] = shipmentsOf(data, [
      order({ shipment: { date: "2026-06-05", driver: "Один" } }),
      second({ shipment: { date: "2026-06-05", driver: "Другой" } }),
    ]);
    assert.equal(ship.driver, "");
  });
});

describe("несостыковки видны, а не замолчаны", () => {
  it("дата отправки заказа расходится с датой отгрузки", () => {
    const warns = warningsOf({ date: "2026-06-05" }, [order({
      shipment: { date: "2026-07-01", qty: 1, weight_gross: 1 },
    })]);
    assert.equal(warns.filter((w) => w.level === "error").length, 1);
    assert.match(warns[0].message, /отправка 01\.07\.2026/);
  });

  it("совпадающие даты не ругаются", () => {
    const warns = warningsOf({ date: "2026-06-05" }, [order()]);
    assert.deepEqual(warns, []);
  });

  it("нет веса — предупреждение, но не ошибка", () => {
    const warns = warningsOf({ date: "2026-06-05" }, [order({
      shipment: { date: "2026-06-05", qty: 1 },
    })]);
    assert.equal(warns.length, 1);
    assert.equal(warns[0].level, "warn");
  });

  it("пустая машина — тоже находка", () => {
    assert.match(warningsOf({ date: "2026-06-05" }, [])[0].message, /нет заказов/);
  });

  it("за доставку пришло больше, чем по весу", () => {
    const warns = warningsOf({ date: "2026-06-05" }, [order()], 22560, 30000);
    assert.equal(warns.length, 1);
    assert.match(warns[0].message, /больше/);
  });
});

describe("оплаты за доставку из выписки", () => {
  const carriage = [
    { date: "2026-10-12", amount: 85000, doc_number: "14480", act_no: "12" },
    { date: "2026-10-12", amount: 72046.4, doc_number: "14476", act_no: "11" },
  ];

  it("пока не разнесены — все свободны", () => {
    assert.equal(freeCarriage({ carriage }).length, 2);
  });

  it("разнесённая по отгрузке больше не предлагается", () => {
    const data = {
      carriage,
      shipments: [{ id: "a", date: "2026-10-09",
                    payments: [{ date: "2026-10-12", amount: 85000, doc_number: "14480" }] }],
    };
    const free = freeCarriage(data);
    assert.equal(free.length, 1);
    assert.equal(free[0].doc_number, "14476");
  });
});
