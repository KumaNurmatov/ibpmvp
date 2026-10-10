/**
 * Выгрузка заказов в книгу. Браузерный аналог tool/pipeline/export_xlsx.py:
 * та же карточка в 15 строк и те же формулы на тех же местах.
 *
 * Каждая формула пишется вместе с посчитанным значением. Без этого ячейка
 * выглядит пустой везде, где файл открывают без пересчёта, — на этом мы уже
 * обожглись на первой выгрузке.
 */
import { parseDate } from "./ledger.js";
import { load as loadExcelJS } from "./vendor-exceljs.js";

export const BLOCK_ROWS = 15;
const PAYMENT_SLOTS = 5;
const TRANSFER_LABEL = "Перенос подтверждён";
const CLOSED_EPS = 0.5;

const SHEETS = [
  ["недоплата", "К сверке"],
  ["нет постоплат", "Нет постоплаты"],
  ["закрытые", "Закрыт"],
];

// Форматы пишем канонически: xlsx хранит их в американской записи, а
// разделители подставляет Excel по локали. Русское «# ##0,00» он читает
// буквально и группирует разряды по две цифры — 300000 превращается в
// «3 00 000».
const MONEY = "#,##0.00";
const NUMBER = "#,##0.##";
const DATE = "dd.mm.yyyy";

/** На какой лист попадёт заказ. */
export function classify(order) {
  const remainder = order.computed.remainder;
  if (remainder === null || remainder === undefined) return "К сверке";
  const hasPostpay = order.payments.some((p) => p.kind.startsWith("постоплата") || p.kind.startsWith("доп"));
  if (Math.abs(remainder) <= CLOSED_EPS) return "Закрыт";
  return hasPostpay ? "К сверке" : "Нет постоплаты";
}

/** @returns {Promise<Blob>} готовая книга */
export async function build(orders, orphans = []) {
  const ExcelJS = await loadExcelJS();
  const wb = new ExcelJS.Workbook();
  wb.created = new Date();

  const byStatus = new Map(SHEETS.map(([, label]) => [label, []]));
  for (const order of orders) byStatus.get(classify(order)).push(order);

  for (const [sheetName, label] of SHEETS) {
    const ws = wb.addWorksheet(sheetName);
    setupColumns(ws);
    let row = 4;
    for (const order of byStatus.get(label)) {
      card(ws, row, order, label);
      row += BLOCK_ROWS;
    }
  }
  checksSheet(wb, orders, orphans);

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function setupColumns(ws) {
  [24, 14, 10, 12, 16, 3, 3, 28, 13, 15, 34].forEach((width, i) => {
    ws.getColumn(i + 1).width = width;
  });
}

/** Одна карточка заказа. r — номер первой строки блока, 1-based. */
function card(ws, r, order, label) {
  const c = order.computed;
  const price = order.get("unit_price");

  text(ws, r, 1, `Заказ ${order.get("order_no") || order.key}`, { bold: true, size: 12 });
  text(ws, r, 4, order.contract_no || "", { bold: true });
  head(ws, r, 8, "ОПЛАТЫ И ПОДТВЕРЖДЕНИЯ");
  text(ws, r, 12, label, { bold: true, color: statusColor(label) });

  text(ws, r + 1, 1, order.get("item") || "");
  head(ws, r + 1, 8, "Вид операции");
  head(ws, r + 1, 9, "Дата");
  head(ws, r + 1, 10, "Сумма, ₽");

  text(ws, r + 2, 1, "Заказано:", { bold: true });
  numberCell(ws, r + 2, 2, order.get("ordered_qty"), NUMBER, order.sourceOf("ordered_qty"));
  text(ws, r + 3, 1, "Цена пошива:", { bold: true });
  numberCell(ws, r + 3, 2, price, MONEY, order.sourceOf("unit_price"));
  text(ws, r + 4, 1, "Сумма заказа:", { bold: true });
  formula(ws, r + 4, 2, `ROUND(B${r + 2}*B${r + 3},2)`, c.order_sum, MONEY, true);

  // Платежей ровно PAYMENT_SLOTS строк, чтобы формулы ниже всегда били в тот
  // же диапазон независимо от того, сколько платежей пришло.
  for (let i = 0; i < PAYMENT_SLOTS; i++) {
    const rr = r + 2 + i;
    const pay = order.payments[i];
    if (!pay) continue;
    text(ws, rr, 8, pay.kind === "перенос" ? TRANSFER_LABEL : capitalize(pay.kind));
    if (pay.date) {
      const cell = ws.getCell(rr, 9);
      cell.value = pay.date;
      cell.numFmt = DATE;
    }
    const amount = ws.getCell(rr, 10);
    amount.value = pay.amount;
    amount.numFmt = MONEY;
    amount.note = [`Источник: ${pay.source}`,
                   pay.doc_number ? `Документ № ${pay.doc_number}` : null,
                   pay.purpose ? `Назначение: ${pay.purpose}` : null]
      .filter(Boolean).join("\n");
  }

  const first = r + 2, last = r + 1 + PAYMENT_SLOTS;
  text(ws, r + 7, 8, "Оплачено", { bold: true });
  formula(ws, r + 7, 10,
    `SUM(J${first}:J${last})-SUMIF(H${first}:H${last},"${TRANSFER_LABEL}",J${first}:J${last})`,
    c.paid ?? 0, MONEY);

  text(ws, r + 6, 1, "Отправка", { bold: true });
  ["Дата отправки", "Кол-во", "Мест", "Вес", "Сумма"].forEach((name, i) => head(ws, r + 7, i + 1, name));

  const shipDate = parseDate(order.get("shipment_date"));
  if (shipDate) {
    const cell = ws.getCell(r + 8, 1);
    cell.value = shipDate;
    cell.numFmt = DATE;
  }
  numberCell(ws, r + 8, 2, order.get("shipped_qty"), NUMBER, order.sourceOf("shipped_qty"));
  numberCell(ws, r + 8, 3, order.get("places"), NUMBER, order.sourceOf("places"));
  numberCell(ws, r + 8, 4, order.get("weight_gross"), NUMBER, order.sourceOf("weight_gross"));
  formula(ws, r + 8, 5, `ROUND(B${r + 3}*B${r + 8},2)`, c.shipment_sum, MONEY, true);

  text(ws, r + 8, 8, "Подтвержденные переносы", { bold: true });
  formula(ws, r + 8, 10,
    `SUMIF(H${first}:H${last},"${TRANSFER_LABEL}",J${first}:J${last})`, c.transfers ?? 0, MONEY);
  text(ws, r + 8, 11, "Со знаком + в этот заказ, − из него", { italic: true, color: "FF808080" });

  text(ws, r + 10, 1, "Учет", { bold: true });
  text(ws, r + 10, 8, "РАСЧЁТНЫЙ ОСТАТОК", { bold: true });
  formula(ws, r + 10, 10,
    `IF(E${r + 8}="","",ROUND(E${r + 8}-J${r + 7}-J${r + 8},2))`, c.remainder, MONEY, true);

  text(ws, r + 11, 1, "Документы", { bold: true });
  const docs = ws.getCell(r + 11, 2);
  docs.value = order.documents.map((d) => d.file).slice(0, 4).join(", ") || "—";
  if (order.documents.length) {
    docs.note = order.documents.map((d) => `${d.doc_type}: ${d.file}`).join("\n");
  }
  text(ws, r + 11, 8, "Предположительно не принято / не оплачено", { bold: true });
  formula(ws, r + 11, 10, `IFERROR(J${r + 10}/B${r + 3},"")`, c.remainder_units, NUMBER);

  const worst = worstFlag(order);
  if (worst) {
    text(ws, r + 12, 8, worst,
      { color: order.flags.some((f) => f.level === "error") ? "FFB00020" : "FFB35C00" });
  }
}

function checksSheet(wb, orders, orphans) {
  const ws = wb.addWorksheet("проверки");
  [["Заказ", 20], ["Договор", 12], ["Уровень", 10], ["Код", 22], ["Что не так", 95]]
    .forEach(([name, width], i) => {
      head(ws, 1, i + 1, name);
      ws.getColumn(i + 1).width = width;
    });
  ws.views = [{ state: "frozen", ySplit: 1 }];

  let row = 2;
  for (const order of orders) {
    for (const flag of order.flags) {
      text(ws, row, 1, order.get("order_no") || order.key);
      text(ws, row, 2, order.contract_no || "");
      text(ws, row, 3, flag.level, { color: flag.level === "error" ? "FFB00020" : "FFB35C00" });
      text(ws, row, 4, flag.code);
      text(ws, row, 5, flag.message);
      row++;
    }
  }
  for (const orphan of orphans) {
    text(ws, row, 1, "—");
    text(ws, row, 3, "error", { color: "FFB00020" });
    text(ws, row, 4, "unrouted");
    text(ws, row, 5, `${orphan.file}: ${orphan.reason}`);
    row++;
  }
  if (row === 2) text(ws, 2, 5, "Замечаний нет.");
}

function text(ws, row, col, value, font) {
  const cell = ws.getCell(row, col);
  cell.value = value;
  if (font) cell.font = font;
  return cell;
}

function head(ws, row, col, value) {
  const cell = text(ws, row, col, value, { bold: true });
  cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD9D9D9" } };
  cell.alignment = { wrapText: true, vertical: "middle", horizontal: "center" };
  return cell;
}

function numberCell(ws, row, col, value, numFmt, source) {
  const cell = ws.getCell(row, col);
  if (value === null || value === undefined) return cell;
  cell.value = value;
  cell.numFmt = numFmt;
  if (source) cell.note = `Источник: ${source}`;
  return cell;
}

/** Формула вместе с результатом: иначе ячейка пуста до пересчёта. */
function formula(ws, row, col, expr, result, numFmt, bold = false) {
  const cell = ws.getCell(row, col);
  cell.value = { formula: expr, result: result === null || result === undefined ? "" : result };
  cell.numFmt = numFmt;
  if (bold) cell.font = { bold: true };
  return cell;
}

const statusColor = (label) =>
  ({ "Закрыт": "FF1E7B34", "Нет постоплаты": "FFB00020" }[label] || "FFB35C00");

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function worstFlag(order) {
  for (const level of ["error", "warn"]) {
    const flag = order.flags.find((f) => f.level === level);
    if (flag) {
      const more = order.flags.length - 1;
      return flag.message + (more > 0 ? ` (ещё замечаний: ${more})` : "");
    }
  }
  return null;
}
