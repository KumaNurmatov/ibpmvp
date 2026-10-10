/**
 * Сведение документов в заказы и все расчёты.
 *
 * Построчный перенос tool/pipeline/ledger.py. Структура namеренно повторяет
 * питоновскую, включая имена: расхождение между двумя реализациями должно
 * бросаться в глаза при чтении, а не всплывать на чужих цифрах. Тесты в
 * web/tests/ledger.test.js повторяют tool/tests/test_ledger.py один в один.
 *
 * Считает только этот файл. Модель приносит то, что написано в бумаге.
 */

// Чем ниже в списке тип документа, тем меньше ему веры по этому полю.
export const TRUST = {
  unit_price: ["specification", "tax_invoice", "invoice", "waybill", "packing_list", "order_sheet", "cmr", "registry"],
  ordered_qty: ["specification", "order_sheet", "registry"],
  item: ["specification", "order_sheet", "invoice", "waybill", "cmr", "registry"],
  shipped_qty: ["waybill", "tax_invoice", "invoice", "packing_list", "cmr", "registry"],
  shipment_date: ["cmr", "waybill", "invoice", "packing_list", "tax_invoice", "registry"],
  places: ["cmr", "packing_list", "waybill", "registry"],
  weight_gross: ["cmr", "packing_list", "waybill", "registry"],
  weight_net: ["packing_list", "waybill", "cmr"],
  driver: ["cmr", "waybill"],
  vehicle_plate: ["cmr", "waybill"],
  order_no: ["order_sheet", "specification", "registry"],
  item_article: ["order_sheet", "specification"],
};
const DEFAULT_TRUST = ["specification", "contract", "waybill", "invoice", "cmr", "order_sheet", "registry", "other"];

const MONEY_EPS = 0.05;
const PREPAY_EPS = 1.0;
const NON_PAYMENT_KINDS = new Set(["перенос"]);
const DAY_MS = 86_400_000;

/** Значение поля вместе с тем, откуда оно взято. */
class Value {
  constructor(value, source, docType) {
    this.value = value;
    this.source = source;
    this.doc_type = docType;
  }
}

/** Заказ, собранный из всех документов, которые на него сослались. */
export class Order {
  constructor(key) {
    this.key = key;
    this.contract_no = null;
    this.fields = new Map();
    this.conflicts = new Map();
    this.payments = [];
    this.documents = [];
    this.terms = {};
    this.flags = [];
    this.computed = {};
    this.raw = [];
  }

  get(name) {
    const v = this.fields.get(name);
    return v ? v.value : null;
  }

  sourceOf(name) {
    const v = this.fields.get(name);
    return v ? v.source : null;
  }
}

// --------------------------------------------------------------------- сборка

/**
 * Разложить пачку разобранных документов по заказам.
 * @returns {{orders: Order[], orphans: object[]}} orphans — документы, которые
 * не удалось отнести ни к одному заказу.
 */
export function build(extractions) {
  const orders = new Map();
  const orphans = [];

  // Сводный реестр разворачиваем в псевдодокументы: по одному на строку.
  const expanded = [];
  for (const ex of extractions) {
    expanded.push(ex);
    for (const row of ex.orders || []) expanded.push(rowAsDoc(row, ex));
  }

  for (const ex of expanded) {
    if (ex.unreadable && !(ex.payments || []).length) {
      orphans.push(orphan(ex, "документ не распознан"));
      continue;
    }
    const targets = targetsOf(ex);
    if (!targets.length) {
      orphans.push(orphan(ex, "не указан номер договора — некуда отнести"));
      continue;
    }
    for (const [key, contractNo] of targets) {
      if (!orders.has(key)) orders.set(key, new Order(key));
      const order = orders.get(key);
      order.contract_no = order.contract_no || contractNo;
      absorb(order, ex, contractNo);
    }
  }

  reconcileOrderOnly(orders);
  for (const order of orders.values()) compute(order);
  return { orders: [...orders.values()].sort(bySortKey), orphans };
}

function targetsOf(ex) {
  const own = normalizeContract(ex.contract_no);
  const out = [];
  if (own) out.push([own, ex.contract_no]);
  for (const pay of ex.payments || []) {
    const key = normalizeContract(pay.contract_no);
    if (key && !out.some(([k]) => k === key)) out.push([key, pay.contract_no]);
  }
  if (!out.length && ex.order_no) out.push([`order:${normOrderNo(ex.order_no)}`, null]);
  return out;
}

function absorb(order, ex, onlyContract) {
  const docType = ex.doc_type || "other";
  const src = ex._source_file || "?";

  order.raw.push(ex);
  order.documents.push({
    file: src, doc_type: docType, doc_number: ex.doc_number ?? null,
    doc_date: ex.doc_date ?? null, confidence: ex.confidence ?? null,
    notes: ex.notes ?? null, kind: ex._source_kind ?? null,
  });

  put(order, "order_no", ex.order_no, src, docType);
  const item = ex.item || {};
  put(order, "item", item.name, src, docType);
  put(order, "item_color", item.color, src, docType);
  put(order, "item_article", item.article, src, docType);
  put(order, "item_composition", item.composition, src, docType);

  // Числовые поля приводим к числам прямо здесь. Модель отдаёт их строками
  // («324 800,00 ₽»), и если оставить как есть, строка доедет до money() и до
  // ячейки Excel, где превратится в текст или в NaN.
  const ordered = ex.ordered || {};
  put(order, "ordered_qty", num(ordered.qty), src, docType);
  put(order, "unit_price", num(ordered.unit_price), src, docType);
  put(order, "stated_order_sum", num(ordered.stated_total), src, docType);

  const sh = ex.shipment || {};
  put(order, "shipment_date", sh.date, src, docType);
  put(order, "shipped_qty", num(sh.qty), src, docType);
  put(order, "places", num(sh.places), src, docType);
  put(order, "weight_gross", num(sh.weight_gross), src, docType);
  put(order, "weight_net", num(sh.weight_net), src, docType);
  put(order, "stated_shipment_sum", num(sh.stated_amount), src, docType);
  put(order, "driver", sh.driver, src, docType);
  put(order, "vehicle_plate", sh.vehicle_plate, src, docType);
  put(order, "route_from", sh.route_from, src, docType);
  put(order, "route_to", sh.route_to, src, docType);

  for (const [name, val] of Object.entries(ex.terms || {})) {
    const parsed = num(val);
    if (parsed !== null && !(name in order.terms)) order.terms[name] = parsed;
  }

  for (const pay of ex.payments || []) {
    if (onlyContract && pay.contract_no &&
        normalizeContract(pay.contract_no) !== normalizeContract(onlyContract)) continue;
    const amount = num(pay.amount);
    if (amount === null) continue;
    const candidate = {
      kind: (pay.kind || "неизвестно").toLowerCase(),
      date: parseDate(pay.date), amount, source: src,
      purpose: pay.purpose ?? null, doc_number: pay.doc_number ?? null,
    };
    if (!isDuplicate(order.payments, candidate)) order.payments.push(candidate);
  }
}

/** Положить значение, разрешив конфликт по доверию к типу документа. */
function put(order, name, value, src, docType) {
  if (value === null || value === undefined) return;
  if (typeof value === "string") {
    value = value.trim();
    if (!value) return;
  }
  const incoming = new Value(value, src, docType);
  const current = order.fields.get(name);
  if (!current) {
    order.fields.set(name, incoming);
    return;
  }
  if (sameValue(current.value, value)) return;
  if (!order.conflicts.has(name)) order.conflicts.set(name, [current]);
  order.conflicts.get(name).push(incoming);
  if (rank(name, docType) < rank(name, current.doc_type)) order.fields.set(name, incoming);
}

function rank(fieldName, docType) {
  const order = TRUST[fieldName] || DEFAULT_TRUST;
  const i = order.indexOf(docType);
  return i >= 0 ? i : order.length + 1;
}

function sameValue(a, b) {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) < 0.005;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

/** Один платёж часто приходит дважды: платёжкой и строкой выписки. */
function isDuplicate(existing, candidate) {
  return existing.some((p) =>
    Math.abs(p.amount - candidate.amount) < 0.01 && sameDate(p.date, candidate.date));
}

function sameDate(a, b) {
  if (a === null && b === null) return true;
  if (!a || !b) return false;
  return a.getTime() === b.getTime();
}

/**
 * Пришить документы без номера договора к их заказу.
 *
 * Лист заказа номера договора не несёт — в бумаге его просто нет. Склеиваем,
 * лишь когда совпало минимум два признака и кандидат единственный.
 */
function reconcileOrderOnly(orders) {
  const loose = [...orders.values()].filter((o) => o.key.startsWith("order:"));
  const known = [...orders.values()].filter((o) => !o.key.startsWith("order:"));
  for (const stray of loose) {
    const scored = known
      .map((o) => [affinity(stray, o), o])
      .filter(([s]) => s >= 2)
      .sort((a, b) => b[0] - a[0]);
    if (!scored.length || (scored.length > 1 && scored[0][0] === scored[1][0])) continue;
    const target = scored[0][1];
    for (const ex of stray.raw) absorb(target, ex, null);
    target.flags.push({
      level: "info", code: "linked_by_match",
      message: `Документы без номера договора привязаны по совпадению: ` +
               `${stray.documents.map((d) => d.file).join(", ")}.`,
    });
    orders.delete(stray.key);
  }
}

function affinity(stray, candidate) {
  let score = 0;
  const a = stray.get("order_no"), b = candidate.get("order_no");
  if (a && b && normOrderNo(a) === normOrderNo(b)) score += 3;
  if (eqNum(stray.get("ordered_qty"), candidate.get("ordered_qty"))) score += 1;
  if (eqNum(stray.get("unit_price"), candidate.get("unit_price"))) score += 1;
  const strayDates = new Set(stray.documents.map((d) => d.doc_date).filter(Boolean));
  const candDates = new Set(candidate.documents.map((d) => d.doc_date).filter(Boolean));
  if ([...strayDates].some((d) => candDates.has(d))) score += 1;
  if (sameText(stray.get("item"), candidate.get("item"))) score += 1;
  return score;
}

function eqNum(a, b) {
  const x = num(a), y = num(b);
  return x !== null && y !== null && Math.abs(x - y) < 0.005;
}

/** Нестрогое сравнение названий: одно изделие пишут по-разному. */
function sameText(a, b) {
  if (!a || !b) return false;
  const words = (s) => new Set((String(s).toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) || []));
  const wa = words(a), wb = words(b);
  const common = [...wa].filter((w) => wb.has(w));
  return common.length > 0 && common.length >= Math.min(2, wa.size, wb.size);
}

// -------------------------------------------------------------------- расчёты

export function compute(order) {
  order.flags = order.flags.filter((f) => f.code === "linked_by_match");
  const c = {};

  const qty = num(order.get("ordered_qty"));
  const price = num(order.get("unit_price"));
  const shipped = num(order.get("shipped_qty"));

  c.order_sum = qty !== null && price !== null ? round(qty * price) : null;
  c.shipment_sum = shipped !== null && price !== null ? round(shipped * price) : null;

  const paid = order.payments.filter(countsAsPaid).reduce((s, p) => s + p.amount, 0);
  const transfers = order.payments.filter((p) => !countsAsPaid(p)).reduce((s, p) => s + p.amount, 0);
  c.paid = round(paid);
  c.transfers = round(transfers);

  if (c.shipment_sum !== null) {
    c.remainder = round(c.shipment_sum - paid - transfers);
    c.remainder_units = price ? round(c.remainder / price, 1) : null;
  } else {
    c.remainder = null;
    c.remainder_units = null;
  }

  const prepay = order.payments.find((p) => p.kind === "предоплата") || null;
  c.prepay = prepay ? prepay.amount : null;
  c.prepay_date = prepay && prepay.date ? iso(prepay.date) : null;

  order.computed = c;
  checkSums(order, c);
  checkPrepay(order, c, prepay);
  checkQuantities(order, qty, shipped);
  checkDeadline(order, c, prepay);
  checkCompleteness(order);
  checkConflicts(order);
  return order;
}

const countsAsPaid = (p) => !NON_PAYMENT_KINDS.has(p.kind);

function checkSums(order, c) {
  const stated = num(order.get("stated_order_sum"));
  if (stated !== null && c.order_sum !== null && Math.abs(stated - c.order_sum) > MONEY_EPS) {
    order.flags.push({
      level: "warn", code: "order_sum_mismatch",
      message: `Сумма заказа в документе ${money(stated)} ≠ количество × цена ` +
               `${money(c.order_sum)}. Требуется сверка ` +
               `(источник: ${order.sourceOf("stated_order_sum")}).`,
    });
  }
  const statedShip = num(order.get("stated_shipment_sum"));
  if (statedShip !== null && c.shipment_sum !== null && Math.abs(statedShip - c.shipment_sum) > MONEY_EPS) {
    order.flags.push({
      level: "error", code: "shipment_sum_mismatch",
      message: `Сумма отправки в документе ${money(statedShip)} ≠ отгружено × цена ` +
               `${money(c.shipment_sum)}. Разница ${money(Math.abs(statedShip - c.shipment_sum))} — ` +
               `проверьте накладную (${order.sourceOf("stated_shipment_sum")}).`,
    });
  }
}

function checkPrepay(order, c, prepay) {
  if (!prepay || c.order_sum === null) return;
  const percent = order.terms.prepay_percent ?? 50.0;
  const expected = round(c.order_sum * percent / 100);
  if (Math.abs(prepay.amount - expected) > PREPAY_EPS) {
    order.flags.push({
      level: "warn", code: "prepay_deviation",
      message: `Предоплата ${money(prepay.amount)} вместо ${fmt(percent)}% = ${money(expected)} ` +
               `(разница ${money(prepay.amount - expected)}).`,
    });
  }
}

function checkQuantities(order, qty, shipped) {
  if (qty === null || shipped === null) return;
  const delta = shipped - qty;
  if (delta > 0) {
    const price = num(order.get("unit_price")) || 0;
    order.flags.push({
      level: "warn", code: "overdelivery",
      message: `Отгружено на ${fmt(delta)} шт больше заказа (${fmt(shipped)} против ${fmt(qty)}, ` +
               `+${(delta / qty * 100).toFixed(1)}%) на ${money(delta * price)}. ` +
               `Нужно допсоглашение к спецификации.`,
    });
  } else if (delta < 0) {
    order.flags.push({
      level: "info", code: "underdelivery",
      message: `Недопоставка ${fmt(Math.abs(delta))} шт: отгружено ${fmt(shipped)} из ${fmt(qty)}.`,
    });
  }
}

function checkDeadline(order, c, prepay) {
  const shipDate = parseDate(order.get("shipment_date"));
  if (!prepay || !prepay.date || !shipDate) return;
  const lead = Math.trunc(order.terms.lead_time_days ?? 7);
  const due = new Date(prepay.date.getTime() + lead * DAY_MS);
  const overdue = Math.round((shipDate - due) / DAY_MS);
  c.due_date = iso(due);
  c.overdue_days = overdue;
  if (overdue <= 0) return;
  const rate = order.terms.penalty_percent_per_day;
  const penalty = rate && c.order_sum ? round(c.order_sum * rate / 100 * overdue) : null;
  c.penalty = penalty;
  const tail = penalty ? ` Неустойка по условиям ${fmt(rate)}%/день: ${money(penalty)}.` : "";
  order.flags.push({
    level: "warn", code: "late_shipment",
    message: `Отгрузка ${iso(shipDate)} при сроке до ${iso(due)} — просрочка ${overdue} дн.${tail}`,
  });
}

function checkCompleteness(order) {
  const missing = [["unit_price", "цена"], ["ordered_qty", "заказанное количество"],
                   ["shipped_qty", "отгруженное количество"]]
    .filter(([name]) => order.get(name) === null).map(([, label]) => label);
  if (missing.length) {
    order.flags.push({ level: "error", code: "missing_fields",
      message: `Не найдено в документах: ${missing.join(", ")}.` });
  }
  const types = new Set(order.documents.map((d) => d.doc_type));
  if (order.get("shipped_qty") !== null &&
      !["waybill", "cmr", "invoice"].some((t) => types.has(t))) {
    order.flags.push({ level: "info", code: "no_shipping_doc",
      message: "Отгрузка есть, но накладной или CMR среди документов нет." });
  }
  if (order.payments.length && !order.payments.some((p) => p.kind === "предоплата")) {
    order.flags.push({ level: "info", code: "no_prepay_doc",
      message: "Платежи есть, но предоплата среди них не найдена." });
  }
}

function checkConflicts(order) {
  for (const [name, values] of order.conflicts) {
    const chosen = order.fields.get(name);
    const variants = values.map((v) => `${repr(v.value)} (${v.source})`).join(" / ");
    order.flags.push({
      level: "warn", code: "conflict",
      message: chosen
        ? `Поле «${name}» расходится между документами: ${variants}. ` +
          `Принято ${repr(chosen.value)} из ${chosen.source}.`
        : `Поле «${name}» расходится: ${variants}.`,
    });
  }
}

// --------------------------------------------------------------------- мелочи

/** «666/1-1», «дог. 666/1-1 от 13.04.2026», «№666» → «666». */
export function normalizeContract(raw) {
  if (!raw) return null;
  const m = String(raw).match(/\d{2,6}/);
  return m ? m[0] : null;
}

const normOrderNo = (raw) => String(raw).replace(/\s+/g, "").toLowerCase();

function rowAsDoc(row, parent) {
  return {
    doc_type: "registry", confidence: parent.confidence ?? 0.5,
    contract_no: row.contract_no ?? null, order_no: row.order_no ?? null,
    doc_number: null, doc_date: parent.doc_date ?? null,
    parties: parent.parties || {},
    item: { name: row.item ?? null, color: null, composition: null, article: null, size_range: null },
    ordered: { qty: row.ordered_qty ?? null, unit_price: row.unit_price ?? null,
               stated_total: row.stated_order_sum ?? null },
    shipment: { date: row.shipment_date ?? null, qty: row.shipped_qty ?? null,
                places: null, weight_gross: null, weight_net: null,
                stated_amount: row.stated_shipment_sum ?? null, driver: null,
                vehicle: null, vehicle_plate: null, route_from: null, route_to: null },
    payments: [], orders: [], terms: {},
    unreadable: false, notes: null,
    _source_file: parent._source_file, _source_kind: "registry_row",
  };
}

const orphan = (ex, reason) => ({
  file: ex._source_file ?? null, doc_type: ex.doc_type ?? null,
  reason, notes: ex.notes ?? null,
});

export function num(v) {
  if (v === null || v === undefined || typeof v === "boolean") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/[^\d,.\-]/g, "").replace(",", ".");
  if (!s || !/^-?\d+(\.\d+)?$/.test(s)) return null;
  return parseFloat(s);
}

/** Даты держим в UTC: иначе часовой пояс сдвигает срок поставки на сутки. */
export function parseDate(v) {
  if (v instanceof Date) return v;
  if (!v) return null;
  const s = String(v).trim();
  let m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) return utc(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (m) return utc(+m[3], +m[2], +m[1]);
  m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (m) return utc(2000 + +m[3], +m[2], +m[1]);
  return null;
}

const utc = (y, mo, d) => new Date(Date.UTC(y, mo - 1, d));
export const iso = (d) => d.toISOString().slice(0, 10);

export function round(v, digits = 2) {
  if (v === null || v === undefined) return null;
  const f = 10 ** digits;
  // Умножение до округления убирает двоичный хвост вида 174799.99999999997.
  return Math.round((v + Number.EPSILON) * f) / f;
}

/** Число без хвостовых нулей: 62 вместо 62.0, как в питоновском %g. */
const fmt = (v) => String(round(v, 6));

export function money(v) {
  if (v === null || v === undefined) return "—";
  const [whole, frac] = Math.abs(round(v)).toFixed(2).split(".");
  const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${v < 0 ? "-" : ""}${spaced},${frac} ₽`;
}

const repr = (v) => (typeof v === "string" ? `'${v}'` : String(v));

function bySortKey(a, b) {
  const da = parseDate(a.get("shipment_date")) || new Date(Date.UTC(2100, 0, 1));
  const db = parseDate(b.get("shipment_date")) || new Date(Date.UTC(2100, 0, 1));
  return da - db || a.key.localeCompare(b.key);
}
