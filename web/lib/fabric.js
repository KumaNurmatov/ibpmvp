/**
 * Закупка ткани: таблица расцветок заказа — фото, цвет, материал, размеры,
 * штуки — и сколько ткани купить. Расход на одно изделие вписывают руками:
 * он один на модель, поэтому вписанный в любую строку встаёт во все.
 * Метраж к закупке = штуки × расход.
 *
 * Расход в карточку не записывается: это прикидка перед закупкой, как
 * поля бланка перед печатью.
 */
import { mm, pdf } from "./pdf.js";

/** Строки таблицы: только цвета, у которых указано, сколько штук шить. */
export function fabricRows(order) {
  const material = order.get?.("material") || "";
  return (order.colors || [])
    .filter((c) => Number.isFinite(c.qty))
    .map((c) => ({ name: c.name, qty: c.qty, sizes: c.sizes || "", photo: c.photo || "", material }));
}

/**
 * Сколько штук на каждый размер: размеры идут через 2 («40–64» — 13 штук),
 * и если количество делится поровну — «по 25 на размер». Не делится или
 * ряд записан иначе — null, строку не пишем.
 */
export function perSize(qty, sizes) {
  const m = String(sizes || "").match(/^\s*(\d{2})\s*[–-]\s*(\d{2})\s*$/);
  if (!m) return null;
  const n = (Number(m[2]) - Number(m[1])) / 2 + 1;
  if (!Number.isInteger(n) || n < 1 || qty % n) return null;
  return qty / n;
}

/** Есть ли что показывать: хотя бы у одного цвета известны штуки. */
export const hasFabric = (order) => fabricRows(order).length > 0;

/** Расход из поля ввода: «0,75», «0.75», « 1 » → число; пусто или мусор → null. */
export function parseRate(value) {
  const s = String(value ?? "").trim().replace(",", ".");
  if (!s) return null;
  const v = Number(s);
  return Number.isFinite(v) && v >= 0 ? v : null;
}

/** Метры с точностью до сантиметра — чтобы 130 × 0,7 было 91, а не 90,99999. */
export const meters = (qty, rate) => (rate === null ? 0 : Math.round(qty * rate * 100) / 100);

/** «2 912», «227,5», «0» — как пишут метраж в таблице. */
export function fmtMeters(v) {
  const [int, frac] = (Math.round(v * 100) / 100).toFixed(2).split(".");
  const tail = frac.replace(/0+$/, "");
  return int.replace(/\B(?=(\d{3})+(?!\d))/g, " ") + (tail ? `,${tail}` : "");
}

export function totals(rows, rate) {
  return {
    qty: rows.reduce((s, r) => s + r.qty, 0),
    meters: Math.round(rows.reduce((s, r) => s + meters(r.qty, rate), 0) * 100) / 100,
  };
}

export const fabricName = (order) =>
  `Закупка ткани ${(order.contract_no || order.key).replace(/[\\/]/g, "-")}.pdf`;

/**
 * PDF: A4, сверху договор и модель, ниже таблица; шапка таблицы повторяется
 * на каждой странице. photos — JPEG по адресу фото (что не загрузилось,
 * остаётся пустой клеткой).
 */
export function fabricPdf(order, fonts, rate, photos = new Map(), skip = new Set()) {
  const W = mm(210), H = mm(297), M = mm(11);
  const doc = pdf({ width: W, height: H, fonts });
  const rows = fabricRows(order).filter((r) => !skip.has(r.name));
  const grid = [0.75, 0.75, 0.75];
  const cols = [["Фото", 52], ["Цвет", 118], ["Материал", 112], ["Размеры", 56], ["Кол-во", 70],
    ["Расход", 58]];
  cols.push(["Метраж к закупке", W - 2 * M - cols.reduce((s, [, w]) => s + w, 0)]);
  const RH = 58, HH = 28;
  const rateText = rate === null ? "—" : `${fmtMeters(rate)} м`;

  const header = (y) => {
    doc.fill(M, y, W - 2 * M, HH);
    doc.rect(M, y, W - 2 * M, HH, { color: grid });
    let x = M;
    for (const [name, w] of cols) {
      const lines = name === "Метраж к закупке" ? ["Метраж", "к закупке"] : [name];
      lines.forEach((l, k) => doc.text(l, x + 5, y + HH / 2 + 3 - (lines.length - 1) * 5 + k * 10,
        { size: 9, style: "bold" }));
      x += w;
    }
    return y + HH;
  };

  let y = M;
  doc.text(`Договор № ${order.contract_no || order.key}${order.get("order_date")
    ? ` от ${order.get("order_date").split("-").reverse().join(".")}` : ""}`, M, y + 14, { size: 14, style: "bold" });
  doc.text(`${order.get("item") || "изделие не указано"}${rate === null ? "" : `, расход ткани ${rateText} на изделие`}`,
    M, y + 32, { size: 11.5 });
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
    const name = wrap(doc, r.name.charAt(0).toUpperCase() + r.name.slice(1), cols[1][1] - 10, 10, "bold");
    name.forEach((l, k) => doc.text(l, x + 5, mid + (k - (name.length - 1) / 2) * 12, { size: 10, style: "bold" }));
    x += cols[1][1];
    const lines = wrap(doc, r.material || "—", cols[2][1] - 10, 9);
    lines.forEach((l, k) => doc.text(l, x + 5, mid + (k - (lines.length - 1) / 2) * 11, { size: 9 }));
    x += cols[2][1];
    doc.text(r.sizes || "—", x + 5, mid, { size: 10 }); x += cols[3][1];
    const each = perSize(r.qty, r.sizes);
    doc.text(`${r.qty} шт`, x + 5, each ? mid - 5 : mid, { size: 10.5, style: "bold" });
    if (each) doc.text(`по ${each} на размер`, x + 5, mid + 8, { size: 7.5, color: [0.4, 0.4, 0.4] });
    x += cols[4][1];
    doc.text(rateText, x + 5, mid, { size: 10 }); x += cols[5][1];
    doc.text(`${fmtMeters(meters(r.qty, rate))} м`, x + 5, mid, { size: 10.5, style: "bold" });
    y += RH;
  }

  const t = totals(rows, rate);
  doc.fill(M, y, W - 2 * M, 22);
  doc.rect(M, y, W - 2 * M, 22, { color: grid });
  doc.text("Итого", M + 5, y + 15, { size: 10, style: "bold" });
  const xq = M + cols.slice(0, 4).reduce((s, [, w]) => s + w, 0);
  doc.text(`${t.qty} шт`, xq + 5, y + 15, { size: 10.5, style: "bold" });
  doc.text(`${fmtMeters(t.meters)} м`, W - M - cols[cols.length - 1][1] + 5, y + 15, { size: 10.5, style: "bold" });
  return doc.bytes();
}

/** Разбить текст по словам на строки не шире width — не больше трёх. */
function wrap(doc, value, width, size, style = "regular") {
  const out = [];
  let line = "";
  for (const word of String(value).split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && doc.widthOf(next, { size, style }) > width) { out.push(line); line = word; } else line = next;
  }
  if (line) out.push(line);
  return out.slice(0, 3);
}
