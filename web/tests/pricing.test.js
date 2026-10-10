/** Проверки подсчёта стоимости: цена должна быть либо верной, либо никакой. */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { cost, formatTokens, formatUsd, PRICES, totalUsage } from "../lib/pricing.js";

const withUsage = (input, output) => ({ _usage: { input, output } });

describe("подсчёт токенов", () => {
  it("складывает по всем документам", () => {
    const usage = totalUsage([withUsage(1000, 200), withUsage(500, 100)]);
    assert.deepEqual(usage, { input: 1500, output: 300, documents: 2 });
  });

  it("пропускает документы без счётчика", () => {
    const usage = totalUsage([withUsage(1000, 200), { _usage: null }, {}]);
    assert.deepEqual(usage, { input: 1000, output: 200, documents: 1 });
  });

  it("пустой список не ломает подсчёт", () => {
    assert.deepEqual(totalUsage([]), { input: 0, output: 0, documents: 0 });
  });
});

describe("стоимость", () => {
  it("считает по прейскуранту модели", () => {
    // 1 млн входных по $4 и 1 млн ответа по $20.
    const spent = cost({ input: 1e6, output: 1e6 }, "claude-opus-5-5");
    assert.equal(spent.input, 4);
    assert.equal(spent.output, 20);
    assert.equal(spent.total, 24);
  });

  it("порядок величины совпадает с прикидкой по заказу 666", () => {
    // Пять документов, из них 13 страниц сканов: около 36 тыс. входных.
    const spent = cost({ input: 36_000, output: 5_000 }, "claude-opus-5-5");
    assert.ok(spent.total > 0.2 && spent.total < 0.3, `вышло ${spent.total}`);
  });

  it("на Haiku дешевле почти в сорок раз", () => {
    const usage = { input: 36_000, output: 5_000 };
    const opus = cost(usage, "claude-opus-5-5").total;
    const haiku = cost(usage, "claude-haiku-5-5").total;
    assert.ok(opus / haiku > 35, `соотношение ${opus / haiku}`);
  });

  it("незнакомая модель даёт null, а не выдуманную цену", () => {
    assert.equal(cost({ input: 1000, output: 100 }, "claude-будущая-модель"), null);
  });

  it("у всех моделей ответ дороже запроса", () => {
    for (const [name, p] of Object.entries(PRICES)) {
      assert.ok(p.output > p.input, `${name}: ответ должен быть дороже`);
    }
  });
});

describe("печать", () => {
  it("доллары с запятой", () => {
    assert.equal(formatUsd(0.24), "$0,24");
    assert.equal(formatUsd(14.5), "$14,50");
  });

  it("совсем мелкие суммы не округляются в ноль", () => {
    assert.equal(formatUsd(0.004), "<$0,01");
    assert.equal(formatUsd(0), "$0,00");
  });

  it("неизвестная цена печатается прочерком", () => {
    assert.equal(formatUsd(null), "—");
    assert.equal(formatUsd(undefined), "—");
  });

  it("токены в тысячах", () => {
    assert.equal(formatTokens(36_000), "36,0 тыс.");
    assert.equal(formatTokens(512), "512");
  });
});
