/**
 * Проверки месячных срезов — того, что ложится в оба графика дашборда.
 *
 * Отдельно про знак: долг бывает отрицательным, если заплатили вперёд. На
 * этом график и споткнулся в первый раз — точка улетела далеко за пределы
 * области, и линия прочертила всю страницу насквозь.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { byMonth, shortMoney } from "../lib/charts.js";
import { orderFromRecord } from "../lib/ledger.js";

const order = (over = {}) => orderFromRecord({
  id: "666", order_no: "Аи 13.04.26/4", contract_no: "666/1-1",
  item: "Костюм", ordered_qty: 750, unit_price: 400,
  shipment: { date: "2026-06-05", qty: 812 },
  payments: [{ kind: "предоплата", date: "2026-04-16", amount: 150000 },
             { kind: "постоплата", date: "2026-06-25", amount: 174800 }],
  terms: { prepay_percent: 50, lead_time_days: 7 },
  ...over,
});

describe("месячные срезы", () => {
  it("раскладывает отгрузки и платежи по своим месяцам", () => {
    const rows = byMonth([order()]);
    assert.deepEqual(rows.map((r) => r.key), ["2026-04", "2026-06"]);
    assert.equal(rows[0].shipped, 0);
    assert.equal(rows[0].paid, 150000);
    assert.equal(rows[1].shipped, 324800);   // 812 × 400
    assert.equal(rows[1].paid, 174800);
  });

  it("долг накапливается и бывает отрицательным", () => {
    const rows = byMonth([order()]);
    assert.equal(rows[0].debt, -150000);     // заплатили до отгрузки
    assert.equal(rows[1].debt, 0);           // к июню сошлось
  });

  it("месяцы идут по порядку независимо от порядка заказов", () => {
    const late = order({ id: "700", contract_no: "700/1-1",
      shipment: { date: "2026-02-10", qty: 100 }, payments: [] });
    const rows = byMonth([order(), late]);
    assert.deepEqual(rows.map((r) => r.key), ["2026-02", "2026-04", "2026-06"]);
  });

  it("заказ без дат не создаёт пустых месяцев", () => {
    const rows = byMonth([order({ shipment: {}, payments: [] })]);
    assert.deepEqual(rows, []);
  });

  it("несколько заказов складываются в одном месяце", () => {
    const second = order({ id: "667", contract_no: "667/1-1", payments: [],
                           shipment: { date: "2026-06-20", qty: 100 } });
    const rows = byMonth([order(), second]);
    const june = rows.find((r) => r.key === "2026-06");
    assert.equal(june.shipped, 324800 + 40000);
  });
});

describe("короткие суммы на оси", () => {
  it("миллионы и тысячи", () => {
    assert.equal(shortMoney(1_500_000), "1,5 млн");
    assert.equal(shortMoney(324_800), "324,8 тыс.");
    assert.equal(shortMoney(0), "0");
  });

  it("знак сохраняется", () => {
    assert.equal(shortMoney(-150_000), "-150 тыс.");
  });
});
