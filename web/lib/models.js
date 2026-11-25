/**
 * База моделей: что мы шьём, из какой ткани и с какой фурнитурой.
 *
 * Модель — один фасон в одном исполнении: если что-то меняется постоянно,
 * это уже другая модель. Разовые отступления (в партии забыли карманы)
 * отмечаются в самом заказе, а не заводят вариант модели.
 *
 * Заказ ссылается на модель полем `model` (ключ модели). Список договоров
 * модели не хранится — он собирается из заказов, иначе разойдётся с ними
 * при первой правке.
 *
 * Поставщики — отдельный справочник: ткань и фурнитура ссылаются на него
 * ключом, телефон и адрес пишутся один раз.
 */
import { fmtMeters, wrap } from "./fabric.js";
import { mm, pdf } from "./pdf.js";

const str = (v) => (v === null || v === undefined ? "" : String(v).trim());
const numOrNull = (v) => {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(String(v).replace(",", "."));
  return Number.isFinite(n) ? n : null;
};

/** Короткий ключ для новой записи: в адресе страницы и в пути к фото. */
export function newId(prefix, taken = []) {
  const used = new Set(taken);
  for (let i = 1; ; i++) {
    const id = `${prefix}${i}`;
    if (!used.has(id)) return id;
  }
}

export function normalizeAccessory(a, i = 0) {
  return {
    id: str(a?.id) || `f${i + 1}`,
    name: str(a?.name),
    // Размер — то, без чего позицию не купить: длина молнии, ширина резинки.
    size: str(a?.size),
    per_item: numOrNull(a?.per_item),
    unit: str(a?.unit) || "шт",
    photo: str(a?.photo),
    supplier: str(a?.supplier),
  };
}

export function normalizeModel(m, i = 0) {
  const f = m?.fabric || {};
  return {
    id: str(m?.id) || `m${i + 1}`,
    name: str(m?.name),
    photo: str(m?.photo),
    fabric: {
      name: str(f.name),
      composition: str(f.composition),
      price_per_m: numOrNull(f.price_per_m),
      width: str(f.width),
      supplier: str(f.supplier),
    },
    // Примерный расход на одно изделие. В закупке ткани его можно поменять:
    // у разных цехов он разный.
    rate: numOrNull(m?.rate),
    accessories: (Array.isArray(m?.accessories) ? m.accessories : [])
      .map(normalizeAccessory).filter((a) => a.name),
    note: str(m?.note),
  };
}

export function normalizeSupplier(s, i = 0) {
  return {
    id: str(s?.id) || `s${i + 1}`,
    name: str(s?.name),
    container: str(s?.container),
    address: str(s?.address),
    phone: str(s?.phone),
  };
}

export const normalizeModels = (raw) =>
  (Array.isArray(raw) ? raw : []).map(normalizeModel).filter((m) => m.name);

export const normalizeSuppliers = (raw) =>
  (Array.isArray(raw) ? raw : []).map(normalizeSupplier).filter((s) => s.name);

/** Модель заказа; запись заказа или посчитанный заказ — без разницы. */
export function modelOf(models, order) {
  const key = order?.model ?? order?.get?.("model");
  return key ? (models || []).find((m) => m.id === key) || null : null;
}

/** Договоры модели — по заказам, у которых она выбрана. */
export const ordersOf = (orders, model) =>
  (orders || []).filter((o) => (o.model ?? o.get?.("model")) === model.id);

/** «Фукра: хлопок 35%, полиэстер 65%» — как пишем материал в таблицах. */
export function fabricText(model) {
  const f = model?.fabric || {};
  return [f.name, f.composition].filter(Boolean).join(": ");
}

/** Есть ли что заказывать: у модели заведена хотя бы одна позиция фурнитуры. */
export const hasAccessories = (model) => Boolean(model?.accessories?.length);

/** Сколько штук в заказе: заказанное, а если его нет — сумма по цветам. */
export function orderQty(order) {
  const q = order?.get?.("ordered_qty") ?? order?.ordered_qty;
  if (Number.isFinite(q)) return q;
  const byColor = (order?.colors || []).reduce((s, c) => s + (Number.isFinite(c.qty) ? c.qty : 0), 0);
  return byColor || 0;
}

/** Позиции фурнитуры на заказ: норма на изделие × штуки. */
export function accessoryRows(model, qty) {
  return (model?.accessories || []).map((a) => ({
    ...a,
    total: a.per_item === null ? null : Math.round(a.per_item * qty * 100) / 100,
  }));
}

export const supplierName = (suppliers, id) =>
  (suppliers || []).find((s) => s.id === id)?.name || "";

export const accessoriesName = (order) =>
  `Заказ фурнитуры ${(order.contract_no || order.key).replace(/[\\/]/g, "-")}.pdf`;

/**
 * PDF заказа фурнитуры: A4, сверху договор, модель и количество, ниже
 * таблица — фото, позиция, размер, на 1 шт, всего, поставщик.
 */
export function accessoriesPdf(order, model, suppliers, fonts, photos = new Map()) {
  const W = mm(210), H = mm(297), M = mm(11);
  const doc = pdf({ width: W, height: H, fonts });
  const qty = orderQty(order);
  const rows = accessoryRows(model, qty);
  const grid = [0.75, 0.75, 0.75];
  const cols = [["Фото", 52], ["Фурнитура", 150], ["Размер", 80], ["На 1 шт", 62], ["Всего", 80]];
  cols.push(["Поставщик", W - 2 * M - cols.reduce((s, [, w]) => s + w, 0)]);
  const RH = 58, HH = 24;

  const header = (y) => {
    doc.fill(M, y, W - 2 * M, HH);
    doc.rect(M, y, W - 2 * M, HH, { color: grid });
    let x = M;
    for (const [name, w] of cols) { doc.text(name, x + 5, y + HH / 2 + 3, { size: 9, style: "bold" }); x += w; }
    return y + HH;
  };

  let y = M;
  const date = order.get?.("order_date");
  doc.text(`Договор № ${order.contract_no || order.key}${date ? ` от ${date.split("-").reverse().join(".")}` : ""}`,
    M, y + 14, { size: 14, style: "bold" });
  doc.text(`Модель ${model.name}, ${qty} шт`, M, y + 32, { size: 11.5 });
  y = header(y + 44);

  for (const r of rows) {
    if (y + RH > H - M - 24) { doc.addPage(); y = header(M); }
    doc.rect(M, y, W - 2 * M, RH, { color: grid });
    let x = M;
    for (const [, w] of cols.slice(0, -1)) { x += w; doc.line(x, y, x, y + RH, { color: grid }); }
    const jpeg = photos.get(r.photo);
    if (jpeg) doc.image(jpeg, M + 3, y + 3, cols[0][1] - 6, RH - 6);
    const mid = y + RH / 2 + 3.5;
    x = M + cols[0][1];
    const name = wrap(doc, r.name, cols[1][1] - 10, 10, "bold");
    name.forEach((l, k) => doc.text(l, x + 5, mid + (k - (name.length - 1) / 2) * 12, { size: 10, style: "bold" }));
    x += cols[1][1];
    const size = wrap(doc, r.size || "—", cols[2][1] - 10, 9.5);
    size.forEach((l, k) => doc.text(l, x + 5, mid + (k - (size.length - 1) / 2) * 11, { size: 9.5 }));
    x += cols[2][1];
    doc.text(r.per_item === null ? "—" : `${fmtMeters(r.per_item)} ${r.unit}`, x + 5, mid, { size: 10 });
    x += cols[3][1];
    doc.text(r.total === null ? "—" : `${fmtMeters(r.total)} ${r.unit}`, x + 5, mid, { size: 10.5, style: "bold" });
    x += cols[4][1];
    const sup = wrap(doc, supplierName(suppliers, r.supplier) || "—", cols[5][1] - 10, 9);
    sup.forEach((l, k) => doc.text(l, x + 5, mid + (k - (sup.length - 1) / 2) * 11, { size: 9 }));
    y += RH;
  }
  return doc.bytes();
}
