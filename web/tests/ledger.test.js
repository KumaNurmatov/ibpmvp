/**
 * Те же проверки, что в tool/tests/test_ledger.py, на тех же цифрах.
 *
 * Смысл дублирования: расчёты теперь живут в двух реализациях, и разойтись
 * они могут молча. Пока оба набора зелёные на одних данных, порт верен.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { build, money, normalizeContract, num, round } from "../lib/ledger.js";
import * as fx from "./fixtures.js";

function build666(extra = []) {
  const { orders, orphans } = build([...fx.ORDER_666, ...extra]);
  assert.deepEqual(orphans, [], "неприкаянных быть не должно");
  assert.equal(orders.length, 1);
  return orders[0];
}

const codes = (order) => new Set(order.flags.map((f) => f.code));
const messageOf = (order, code) => order.flags.find((f) => f.code === code).message;

describe("сборка заказа", () => {
  it("собирает один заказ из пяти документов", () => {
    const order = build666();
    assert.equal(order.key, "666");
    assert.equal(order.contract_no, "666/1-1");
    assert.equal(order.documents.length, 5);
    assert.equal(order.get("order_no"), "Аи 13.04.26/4");
  });

  it("суммы считаются, а не берутся из документа", () => {
    const c = build666().computed;
    assert.equal(c.order_sum, 300000.0);      // 750 × 400
    assert.equal(c.shipment_sum, 324800.0);   // 812 × 400
    assert.equal(c.paid, 150000.0);
    assert.equal(c.remainder, 174800.0);
    assert.equal(c.remainder_units, 437.0);
  });

  it("постоплата закрывает заказ в ноль", () => {
    const c = build666([fx.POSTPAY]).computed;
    assert.equal(c.paid, 324800.0);
    assert.equal(c.remainder, 0.0);
  });

  it("цена берётся из спецификации, а не из накладной", () => {
    const order = build666();
    assert.equal(order.get("unit_price"), 400.0);
    assert.equal(order.sourceOf("unit_price"), "спец дог 666 подписанная айзада.pdf");
  });

  it("водитель приходит из накладной", () => {
    const order = build666();
    assert.equal(order.get("driver"), "Ташыкулов Элмир Койчубаевич");
    assert.equal(order.get("vehicle_plate"), "04KG227AON");
  });
});

describe("проверки", () => {
  it("видит перепоставку 62 штук", () => {
    const order = build666();
    assert.ok(codes(order).has("overdelivery"));
    const text = messageOf(order, "overdelivery");
    assert.match(text, /62/);
    assert.match(text, /24 800,00/);
  });

  it("считает просрочку 43 дня и неустойку", () => {
    const c = build666().computed;
    assert.equal(c.due_date, "2026-04-23");   // 16.04 + 7 дней
    assert.equal(c.overdue_days, 43);
    assert.equal(c.penalty, 129000.0);        // 1% × 300 000 × 43
  });

  it("аванс ровно 50 процентов замечаний не даёт", () => {
    assert.ok(!codes(build666()).has("prepay_deviation"));
  });

  it("аванс мимо 50 процентов помечается", () => {
    const bent = { ...fx.PAYMENT, payments: [{ ...fx.PAYMENT.payments[0], amount: 120000.0 }] };
    const { orders } = build([fx.SPECIFICATION, bent, fx.SHIPMENT]);
    assert.ok(codes(orders[0]).has("prepay_deviation"));
  });

  it("конфликт названий изделия остаётся видимым", () => {
    const order = build666();
    assert.ok(order.conflicts.has("item"));
    assert.ok(codes(order).has("conflict"));
  });

  it("ошибка суммы в реестре всплывает", () => {
    const { orders } = build([fx.REGISTRY_662]);
    const order = orders[0];
    assert.equal(order.computed.shipment_sum, 389760.0);   // 812 × 480
    assert.ok(codes(order).has("shipment_sum_mismatch"));
    assert.match(messageOf(order, "shipment_sum_mismatch"), /88 320,00/);
  });

  it("нехватка данных помечается ошибкой", () => {
    const { orders } = build([fx.PAYMENT]);
    assert.ok(codes(orders[0]).has("missing_fields"));
    assert.equal(orders[0].computed.remainder, null);
  });
});

describe("маршрутизация", () => {
  it("выписка разносит платежи по договорам", () => {
    const { orders, orphans } = build([fx.SPECIFICATION, fx.SHIPMENT, fx.STATEMENT]);
    const byKey = Object.fromEntries(orders.map((o) => [o.key, o]));
    assert.deepEqual(Object.keys(byKey).sort(), ["666", "706"]);
    assert.equal(byKey["666"].computed.paid, 174800.0);
    assert.equal(byKey["706"].computed.paid, 1498881.45);
    assert.deepEqual(orphans, []);
  });

  it("один платёж из двух источников не задваивается", () => {
    const { orders } = build([fx.SPECIFICATION, fx.SHIPMENT, fx.POSTPAY, fx.STATEMENT]);
    const order = orders.find((o) => o.key === "666");
    assert.equal(order.payments.length, 1);
    assert.equal(order.computed.paid, 174800.0);
  });

  it("документ без договора уходит в неприкаянные", () => {
    const stray = { ...fx.SHIPMENT, contract_no: null, order_no: null };
    const { orders, orphans } = build([stray]);
    assert.equal(orders.length, 0);
    assert.equal(orphans.length, 1);
  });

  it("лист заказа без договора привязывается по совпадениям", () => {
    const order = build666();
    assert.ok(codes(order).has("linked_by_match"));
  });
});

describe("мелочи", () => {
  it("нормализация номера договора", () => {
    assert.equal(normalizeContract("666/1-1"), "666");
    assert.equal(normalizeContract("дог.666/1-1 от 13.04.2026"), "666");
    assert.equal(normalizeContract("№ 942"), "942");
    assert.equal(normalizeContract(null), null);
  });

  it("деньги печатаются как в книге", () => {
    assert.equal(money(324800), "324 800,00 ₽");
    assert.equal(money(0), "0,00 ₽");
    assert.equal(money(null), "—");
    assert.equal(money(-137840.88), "-137 840,88 ₽");
  });

  it("округление не оставляет двоичного хвоста", () => {
    assert.equal(round(324800 - 150000 - 0), 174800);
    assert.equal(round(0.1 + 0.2), 0.3);
  });
});

describe("числа из бумаги", () => {
  it("копейки через дефис, как в платёжке", () => {
    // 150000-00 в платёжном поручении раньше давало null, и предоплата
    // на 150 тысяч молча пропадала из расчёта.
    assert.equal(num("150000-00"), 150000);
    assert.equal(num("1234-56"), 1234.56);
  });

  it("пробелы, запятые и знак валюты", () => {
    assert.equal(num("324 800,00 ₽"), 324800);
    assert.equal(num("1 234,56"), 1234.56);
  });

  it("оба разделителя: десятичный тот, что правее", () => {
    assert.equal(num("1.234,56"), 1234.56);
    assert.equal(num("1,234.56"), 1234.56);
  });

  it("минус сохраняется", () => {
    assert.equal(num("-137840,88"), -137840.88);
  });

  it("не число остаётся ничем", () => {
    for (const s of ["", "нет оплаты", "abc", "-", ","]) assert.equal(num(s), null);
  });
});

describe("нечитаемый платёж", () => {
  const broken = {
    ...fx.PAYMENT,
    payments: [{ ...fx.PAYMENT.payments[0], amount: "сто пятьдесят тысяч" }],
  };

  it("не исчезает молча, а поднимает ошибку", () => {
    const { orders } = build([fx.SPECIFICATION, fx.SHIPMENT, broken]);
    const order = orders[0];
    assert.ok(codes(order).has("payment_unparsed"));
    assert.match(messageOf(order, "payment_unparsed"), /сто пятьдесят тысяч/);
  });

  it("остаток считается без него и это видно", () => {
    const { orders } = build([fx.SPECIFICATION, fx.SHIPMENT, broken]);
    assert.equal(orders[0].computed.paid, 0);
    assert.equal(orders[0].payments.length, 0);
  });
});

describe("вид платежа не назван в документе", () => {
  // Платёжное поручение по заказу 666: назначение есть, слова «предоплата» нет.
  const unnamed = {
    ...fx.PAYMENT,
    payments: [{ ...fx.PAYMENT.payments[0], kind: "неизвестно" }],
  };

  it("определяется по дате, когда известна отгрузка", () => {
    const { orders } = build([fx.SPECIFICATION, fx.SHIPMENT, unnamed]);
    const pay = orders[0].payments[0];
    assert.equal(pay.kind, "предоплата");
    assert.match(pay.inferred_from, /по дате/);
    assert.ok(codes(orders[0]).has("kind_inferred"));
  });

  it("определяется по доле, когда отгрузки ещё нет", () => {
    // Ровно тот случай, что вышел у пользователя: спецификация и платёжка.
    const { orders } = build([fx.SPECIFICATION, unnamed]);
    const pay = orders[0].payments[0];
    assert.equal(pay.kind, "предоплата");          // 150 000 = 50% от 300 000
    assert.match(pay.inferred_from, /по доле/);
  });

  it("после отгрузки это постоплата", () => {
    const late = { ...unnamed, payments: [{ ...unnamed.payments[0], date: "2026-07-01", amount: 174800 }] };
    const { orders } = build([fx.SPECIFICATION, fx.SHIPMENT, late]);
    assert.equal(orders[0].payments[0].kind, "постоплата");
  });

  it("непохожий платёж остаётся неизвестным, а не угадывается", () => {
    const odd = { ...unnamed, payments: [{ ...unnamed.payments[0], date: "", amount: 7777 }] };
    const { orders } = build([fx.SPECIFICATION, odd]);
    assert.equal(orders[0].payments[0].kind, "неизвестно");
    assert.ok(!codes(orders[0]).has("kind_inferred"));
  });

  it("названный вид не переписывается", () => {
    const { orders } = build([fx.SPECIFICATION, fx.SHIPMENT, fx.PAYMENT]);
    assert.equal(orders[0].payments[0].kind, "предоплата");
    assert.equal(orders[0].payments[0].inferred_from, null);
    assert.ok(!codes(orders[0]).has("kind_inferred"));
  });

  it("определённый аванс включает проверку срока", () => {
    const { orders } = build([fx.SPECIFICATION, fx.SHIPMENT, unnamed]);
    assert.equal(orders[0].computed.overdue_days, 43);
    assert.ok(!codes(orders[0]).has("no_prepay_doc"));
  });
});
