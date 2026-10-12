/**
 * Бизнес-процесс заказа: где заказ стоит сейчас и что по нему надо сделать.
 *
 * В таблице это жило листами и цветом строки: «нет постоплат» — отдельный
 * лист, «недоплата» — другой, а «ждём отгрузку» нигде, это надо было помнить.
 * Здесь стадия считается из тех же цифр, что и остаток, поэтому не может с
 * ними разойтись.
 *
 * Стадии идут по порядку денег, а не по порядку бумаг:
 * предоплата → пошив → отгрузка → постоплата → сверка.
 */
import { money, parseDate, round } from "./ledger.js";

const DAY_MS = 86_400_000;
const EPS = 0.5;

export const STAGES = [
  { key: "prepay", name: "Ждёт предоплаты", cls: "warn", hint: "заказ оформлен, денег не было" },
  { key: "production", name: "В пошиве", cls: "", hint: "предоплата внесена, отгрузки ещё нет" },
  { key: "shipped", name: "Нет постоплаты", cls: "bad", hint: "отгружено, постоплата не приходила" },
  { key: "acceptance", name: "Приёмка", cls: "warn", hint: "постоплата прошла, приёмка не отмечена" },
  { key: "reconcile", name: "К сверке", cls: "bad", hint: "недоплата больше, чем непринятое" },
  { key: "closed", name: "Закрыт", cls: "ok", hint: "за принятое заплачено полностью" },
  // Остановленный заказ по цифрам не отличим от шьющегося: предоплата есть,
  // отгрузки нет. Поэтому стадия берётся из поля «состояние», а не из денег,
  // и стоит в конце — это не ступень процесса, а выход из него.
  { key: "stopped", name: "Остановлен", cls: "", hint: "отменён или заморожен — отгрузки не будет" },
];

const BY_KEY = new Map(STAGES.map((s) => [s.key, s]));
export const stage = (key) => BY_KEY.get(key) || STAGES[0];

const isPrepay = (p) => p.kind === "предоплата";
const isPostpay = (p) => p.kind.startsWith("постоплата") || p.kind.startsWith("доп");

/**
 * Ключ стадии. Одно правило на дашборд, таблицу и карточку.
 *
 * Сделка закрыта не тогда, когда остаток ноль, а когда заплачено за всё
 * принятое: если заказчик завернул 120 штук и ровно на них недоплатил,
 * перечислять больше нечего — остаток ненулевой, а спора нет.
 */
export function stageOf(order) {
  const c = order.computed;
  // Отменённый или замороженный заказ дальше не идёт: показывать его «в
  // пошиве» и требовать по нему отгрузку — врать про работу, которой нет.
  if (order.status) return "stopped";
  const shipped = Boolean(order.get("shipment_date")) || order.get("shipped_qty") !== null;

  if (!shipped) return order.payments.some(isPrepay) ? "production" : "prepay";
  // Отгрузка есть, но посчитать нечем — цены или количества не хватает.
  if (c.remainder === null || c.remainder === undefined) return "acceptance";
  if (Math.abs(c.remainder) <= EPS || c.settled) return "closed";
  if (!order.payments.some(isPostpay)) return "shipped";
  // Постоплата прошла, но остаток остался: без приёмки непонятно, спор это
  // или просто непринятый товар.
  return c.rejected_qty === null ? "acceptance" : "reconcile";
}

/** Ступени процесса — без выхода из него: остановленный заказ никуда не идёт. */
export const FLOW = STAGES.filter((s) => s.key !== "stopped");

/**
 * Воронка: сколько заказов и денег стоит на каждой стадии.
 * Стадии остаются в списке даже пустыми — пустая ступень тоже факт.
 */
export function funnel(orders) {
  return FLOW.map((s) => {
    const own = orders.filter((o) => stageOf(o) === s.key);
    return {
      ...s,
      count: own.length,
      sum: round(own.reduce((acc, o) => acc + moneyAtStake(o, s.key), 0)),
      orders: own,
    };
  });
}

/**
 * Деньги, которые стоят за заказом на его стадии: до отгрузки это ожидаемая
 * предоплата, после — непришедший остаток. Складывать их в одну сумму нельзя,
 * поэтому воронка держит их по ступеням.
 */
function moneyAtStake(order, key) {
  const c = order.computed;
  if (key === "prepay") return expectedPrepay(order) ?? 0;
  if (key === "production") return 0;
  // За остановленным заказом стоят уже перечисленные деньги: их придётся
  // вернуть или зачесть в другой заказ.
  if (key === "stopped") return c.paid || 0;
  return c.remainder || 0;
}

function expectedPrepay(order) {
  const c = order.computed;
  if (c.order_sum === null || c.order_sum === undefined) return null;
  return round(c.order_sum * (order.terms.prepay_percent ?? 50) / 100);
}

/**
 * Что требует действия — по одной строке на заказ, самое срочное сверху.
 *
 * Уровень ставится по деньгам и срокам, а не по тому, сколько замечаний
 * набралось: заказ с одной просрочкой на 129 000 ₽ важнее трёх незаполненных
 * полей.
 */
export function tasks(orders, today = new Date()) {
  const out = [];
  for (const order of orders) {
    const key = stageOf(order);
    if (key === "closed") continue;
    if (key === "stopped") {
      // Делать по нему нечего, кроме одного: решить судьбу предоплаты.
      const paid = order.computed.paid || 0;
      if (paid > EPS) {
        out.push({
          order, stage: key, level: "warn", amount: paid,
          title: `Заказ ${order.status}: решить судьбу предоплаты`,
          detail: `Перечислено ${money(paid)}, отгрузки не будет — вернуть или зачесть в другой заказ.`,
        });
      }
      continue;
    }
    const task = taskFor(order, key, today);
    if (task) out.push(task);
  }
  const rank = { error: 0, warn: 1, info: 2 };
  return out.sort((a, b) =>
    rank[a.level] - rank[b.level] || Math.abs(b.amount || 0) - Math.abs(a.amount || 0));
}

function taskFor(order, key, today) {
  const c = order.computed;
  const base = { order, stage: key, level: "info", amount: 0 };
  const errors = order.flags.filter((f) => f.level === "error");

  if (key === "prepay") {
    const want = expectedPrepay(order);
    return {
      ...base,
      level: "warn",
      amount: want ?? 0,
      title: "Получить предоплату",
      detail: want === null
        ? "Сумма заказа не посчитана: не хватает количества или цены."
        : `${order.terms.prepay_percent ?? 50}% от суммы заказа — ${money(want)}.`,
    };
  }

  if (key === "production") {
    const late = lateness(order, today);
    if (late > 0) {
      return {
        ...base,
        level: "error",
        title: `Отгрузка просрочена на ${late} дн.`,
        detail: `Срок по условиям — до ${ru(c.due_date)}. Предоплата уже у цеха.`,
      };
    }
    return {
      ...base,
      title: "Ждём отгрузку",
      detail: c.due_date ? `Срок по условиям — до ${ru(c.due_date)}.` : "Срок не рассчитан: нет даты предоплаты.",
    };
  }

  if (key === "shipped") {
    return {
      ...base,
      level: "error",
      amount: c.remainder || 0,
      title: "Постоплаты не было",
      detail: `Отгружено на ${money(c.shipment_sum)}, пришло ${money(c.paid)}. ` +
        `Не хватает ${money(c.remainder)}${c.remainder_units != null ? ` (≈ ${c.remainder_units} шт)` : ""}.`,
    };
  }

  if (c.remainder === null || c.remainder === undefined) {
    return {
      ...base,
      level: errors.length ? "error" : "warn",
      title: "Нечем посчитать остаток",
      detail: errors.length ? errors[0].message : "Не хватает цены или количества отгрузки.",
    };
  }

  if (c.remainder < 0) {
    return {
      ...base,
      level: errors.length ? "error" : "warn",
      amount: c.remainder,
      title: "Переплата",
      detail: `Пришло на ${money(-c.remainder)} больше отгруженного — проверьте, за какой заказ.`,
    };
  }

  // Приёмка не отмечена: пока неизвестно, сколько приняли, недоплату не с чем
  // сравнивать — это первый шаг, а не «сверка вообще».
  if (key === "acceptance") {
    return {
      ...base,
      level: "warn",
      amount: c.remainder,
      title: "Отметить приёмку",
      detail: `Недоплата ${money(c.remainder)} (≈ ${c.remainder_units ?? "—"} шт). ` +
        "Сколько заказчик принял и сколько завернул — тогда будет видно, спор это или нет.",
    };
  }

  // reconcile: приёмка отмечена, и недоплата оказалась больше непринятого.
  return {
    ...base,
    level: "error",
    amount: c.unexplained ?? c.remainder,
    title: "Недоплата сверх непринятого",
    detail: `Непринятое — ${money(c.rejected_sum)}, не хватает ${money(c.remainder)}. ` +
      `Разница ${money(c.unexplained)} ничем не объяснена.`,
  };
}

/** Просрочка отгрузки на сегодня: срок истёк, а отгрузки всё нет. */
function lateness(order, today) {
  const prepay = order.payments.find(isPrepay);
  if (!prepay?.date) return 0;
  // Без срока из условий заказа просрочки нет: см. checkDeadline в ledger.js.
  if (order.terms.lead_time_days === null || order.terms.lead_time_days === undefined) return 0;
  const lead = Math.trunc(order.terms.lead_time_days);
  const due = new Date(prepay.date.getTime() + lead * DAY_MS);
  order.computed.due_date = due.toISOString().slice(0, 10);
  return Math.max(0, Math.round((startOfDay(today) - due) / DAY_MS));
}

/** 2026-09-09 → 09.09.2026: ISO-дата в тексте читается как машинная. */
const ru = (iso) => (iso ? iso.split("-").reverse().join(".") : "—");

const startOfDay = (d) => {
  const date = d instanceof Date ? d : parseDate(d) || new Date();
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
};
