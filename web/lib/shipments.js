/**
 * Отгрузки: одна машина — несколько заказов.
 *
 * В один день уезжает сразу несколько договоров. Документы на каждый свои
 * (спецификация, учёт, отправка), а акт об оказании услуг карго и оплата по
 * нему — одни на всю машину. В таблице этого разреза не было вовсе: отгрузка
 * существовала только строкой внутри заказа, и чтобы понять, сколько весила
 * машина 5 июня и заплачено ли за неё, приходилось собирать строки глазами.
 *
 * Поэтому отгрузка здесь — отдельная запись, но хранит она только то, чего
 * нет в заказах: состав, водителя, ставку, акт, оплаты. Вес, места,
 * количество, сумма отгрузки и ссылки на документы берутся из самих заказов —
 * второй раз их никто не вводит, и разойтись они не могут.
 *
 * Заказ, не попавший ни в одну запись, всё равно виден: по дате отправки из
 * своей же карточки собирается отгрузка «по датам». Так старые 28 отгрузок
 * появились на сайте сами, без ручного ввода.
 */
import { round } from "./ledger.js";
import { DEFAULT_RATE_PER_KG } from "./store.js";

const EPS = 0.5;

/** Ключ отгрузки — её дата: в один день уезжает одна машина. */
export const shipmentKey = (date) => String(date || "").slice(0, 10);

/**
 * Все отгрузки: сохранённые записи и собранные по датам отправки заказов.
 * Сверху свежие — к ним и возвращаются.
 */
export function shipmentsOf(data, orders) {
  const byKey = new Map();
  const taken = new Set();

  for (const record of data?.shipments || []) {
    const key = record.id || shipmentKey(record.date);
    if (!key) continue;
    byKey.set(key, { record, orders: [], stored: true });
    for (const id of record.orders || []) taken.add(String(id));
  }

  // Заказ может лежать в записи с другой датой — это и есть несостыковка,
  // о которой карточка предупредит. Поэтому сначала разбираем состав записей.
  const byId = new Map(orders.map((o) => [String(o.key), o]));
  for (const slot of byKey.values()) {
    slot.orders = (slot.record.orders || [])
      .map((id) => byId.get(String(id)))
      .filter(Boolean);
  }

  // Остальные заказы с датой отправки собираются в отгрузки по этой дате.
  for (const order of orders) {
    if (taken.has(String(order.key))) continue;
    const key = shipmentKey(order.get("shipment_date"));
    if (!key) continue;
    if (!byKey.has(key)) {
      byKey.set(key, {
        record: { id: key, date: key, rate_per_kg: DEFAULT_RATE_PER_KG },
        orders: [], stored: false,
      });
    }
    byKey.get(key).orders.push(order);
  }

  return [...byKey.values()]
    .map(({ record, orders: own, stored }) => shipment(record, own, stored))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/** Одна отгрузка со всем, что о ней можно посчитать. */
export function shipment(record, orders, stored = false) {
  const rate = record.rate_per_kg ?? DEFAULT_RATE_PER_KG;
  const totals = totalsOf(orders);
  const payments = record.payments || [];
  const paid = round(payments.reduce((sum, p) => sum + (p.amount || 0), 0));
  const cost = totals.weight === null ? null : round(totals.weight * rate);

  return {
    id: record.id || shipmentKey(record.date),
    date: record.date || "",
    stored,
    // Водителя обычно знает только CMR, и он один на машину: если в записи
    // его не вписали, берём из заказов — он там один и тот же.
    driver: record.driver || common(orders, "driver"),
    driver_phone: record.driver_phone || common(orders, "driver_phone"),
    rate_per_kg: rate,
    act_no: record.act_no || "",
    act_date: record.act_date || "",
    links: record.links || [],
    payments,
    note: record.note || "",
    orders,
    contracts: orders.map((o) => o.contract_no || o.key),
    totals,
    cost,
    paid,
    // Остаток по доставке: сколько ещё причитается карго по этой машине.
    due: cost === null ? null : round(cost - paid),
    docs: docsOf(orders),
    warnings: warningsOf(record, orders, cost, paid),
    record,
  };
}

/** Вес, места, количество и деньги — сумма по заказам машины. */
export function totalsOf(orders) {
  const sum = (name) => {
    const values = orders.map((o) => o.get(name)).filter((v) => v !== null && v !== undefined);
    return values.length ? round(values.reduce((a, b) => a + b, 0)) : null;
  };
  const money = orders
    .map((o) => o.computed.shipment_sum)
    .filter((v) => v !== null && v !== undefined);

  return {
    orders: orders.length,
    weight: sum("weight_gross"),
    places: sum("places"),
    qty: sum("shipped_qty"),
    sum: money.length ? round(money.reduce((a, b) => a + b, 0)) : null,
  };
}

/**
 * Документы машины — ссылки из карточек заказов. Прикреплённое к заказу
 * (спецификация, учёт, отправка) здесь просто показывается: вставлять те же
 * адреса второй раз, в отгрузку, незачем.
 */
export function docsOf(orders) {
  return orders.flatMap((o) => (o.links || []).map((link) => ({
    order: o.key,
    contract: o.contract_no || o.key,
    title: link.title,
    url: link.url,
  })));
}

/**
 * Что в отгрузке не сходится. Главное — даты: если у заказа в его карточке
 * стоит другая дата отправки, значит либо он попал не в ту машину, либо дату
 * забыли поправить. Молча складывать такое в одну отгрузку нельзя.
 */
export function warningsOf(record, orders, cost = null, paid = 0) {
  const out = [];
  const key = shipmentKey(record.date);

  for (const order of orders) {
    const own = shipmentKey(order.get("shipment_date"));
    if (!own) {
      out.push({
        level: "warn", order: order.key,
        message: `${order.contract_no || order.key}: в карточке заказа нет даты отправки`,
      });
    } else if (key && own !== key) {
      out.push({
        level: "error", order: order.key,
        message: `${order.contract_no || order.key}: в карточке заказа отправка ${ru(own)}, ` +
          `а эта отгрузка от ${ru(key)}`,
      });
    }
    if (order.get("weight_gross") === null) {
      out.push({
        level: "warn", order: order.key,
        message: `${order.contract_no || order.key}: нет веса брутто — доставка по этой машине ` +
          "посчитана не полностью",
      });
    }
  }

  if (!orders.length) {
    out.push({ level: "warn", order: null, message: "В отгрузке нет заказов" });
  }
  if (cost !== null && paid - cost > EPS) {
    out.push({
      level: "warn", order: null,
      message: `За доставку пришло больше, чем по весу: ${rub(paid)} против ${rub(cost)}`,
    });
  }
  return out;
}

/** Отгрузки, в которые заказ попал: обычно одна, две — это ошибка состава. */
export function shipmentsWith(list, orderKey) {
  return list.filter((s) => s.orders.some((o) => String(o.key) === String(orderKey)));
}

/** Оплаты за доставку, ещё не разнесённые ни по одной отгрузке. */
export function freeCarriage(data) {
  const used = new Set();
  for (const s of data?.shipments || []) {
    for (const p of s.payments || []) used.add(carriageKey(p));
  }
  return (data?.carriage || []).filter((p) => !used.has(carriageKey(p)));
}

export const carriageKey = (p) => `${p.date}|${p.amount}|${p.doc_number || ""}`;

const common = (orders, name) => {
  const values = [...new Set(orders.map((o) => o.get(name)).filter(Boolean))];
  return values.length === 1 ? values[0] : "";
};

const ru = (iso) => (iso ? iso.split("-").reverse().join(".") : "—");

const rub = (v) => `${(v ?? 0).toLocaleString("ru-RU", { minimumFractionDigits: 2,
  maximumFractionDigits: 2 })} ₽`;
