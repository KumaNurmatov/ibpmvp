/**
 * Проверки элементов интерфейса — на числах, а не на снимках экрана.
 *
 * Снимок показывает, что элемент нарисовался; эти проверки — что он
 * нарисовал именно то число. Кольцо на 150% и маркер, уехавший за край
 * шкалы, выглядят правдоподобно и врут.
 */
import { strict as assert } from "node:assert";
import { describe, it } from "node:test";

import { balanceScale, pills, ring, sparkline } from "../lib/ui.js";

const dash = (svg) => svg.match(/stroke-dasharray="([\d.]+) ([\d.]+)"/).slice(1).map(Number);

describe("кольцо прогресса", () => {
  it("половина — половина окружности", () => {
    const [filled, whole] = dash(ring({ value: 0.5 }));
    assert.ok(Math.abs(filled / whole - 0.5) < 0.001);
  });

  it("доля больше единицы не делает полтора круга", () => {
    const [filled, whole] = dash(ring({ value: 1.6 }));
    assert.equal(filled, whole);
  });

  it("отрицательная доля не уходит в минус", () => {
    const [filled] = dash(ring({ value: -0.3 }));
    assert.equal(filled, 0);
  });

  it("по умолчанию в центре проценты, но подпись можно задать свою", () => {
    assert.match(ring({ value: 0.42 }), />42%</);
    assert.match(ring({ value: 0.42, label: "9 из 44" }), />9 из 44</);
  });

  it("подпись в центре экранируется", () => {
    assert.ok(!ring({ value: 1, label: '<b>"x"' }).includes("<b>"));
  });
});

describe("спарклайн", () => {
  it("одной точки мало — рисовать нечего", () => {
    assert.equal(sparkline([5]), "");
    assert.equal(sparkline([]), "");
  });

  it("растущий ряд идёт снизу вверх", () => {
    const svg = sparkline([0, 10], { width: 100, height: 40 });
    const [, y1, , y2] = svg.match(/M([\d.]+) ([\d.]+) L([\d.]+) ([\d.]+)/).slice(1).map(Number);
    assert.ok(y2 < y1, `${y2} должен быть выше ${y1}`);
  });

  it("ровный ряд не делит на ноль", () => {
    const svg = sparkline([7, 7, 7]);
    assert.ok(!svg.includes("NaN"));
  });
});

describe("расходящаяся шкала", () => {
  const at = (svg) => Number(svg.match(/left:([\d.-]+)%/)[1]);

  it("ноль — ровно посередине", () => {
    assert.equal(at(balanceScale({ value: 0, span: 1000 })), 50);
  });

  it("крайние значения упираются в края, но не вылезают", () => {
    assert.equal(at(balanceScale({ value: 5000, span: 1000 })), 100);
    assert.equal(at(balanceScale({ value: -5000, span: 1000 })), 0);
  });

  it("половина размаха — четверть от середины", () => {
    assert.equal(at(balanceScale({ value: 500, span: 1000 })), 75);
  });

  it("подписи краёв показывают сам размах", () => {
    const svg = balanceScale({ value: 100, span: 1000, format: (v) => `${v} ₽` });
    assert.ok(svg.includes("−1000 ₽") && svg.includes("1000 ₽"));
  });
});

describe("пилюли", () => {
  it("отмечают выбранную и показывают счётчики", () => {
    const html = pills([{ key: "all", name: "Все", count: 44 },
                        { key: "shipped", name: "Нет постоплаты", count: 8 }], { current: "shipped" });
    assert.match(html, /data-pill="shipped"[\s\S]*?aria-pressed="true"/);
    assert.match(html, /data-pill="all"[\s\S]*?aria-pressed="false"/);
    assert.ok(html.includes("<i>44</i>") && html.includes("<i>8</i>"));
  });

  it("счётчик можно не давать", () => {
    assert.ok(!pills([{ key: "a", name: "A" }]).includes("<i>"));
  });
});
