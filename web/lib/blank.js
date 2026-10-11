/**
 * Бланк заказа: четыре копии на листе A4, как в исходном шаблоне.
 *
 * Размеры взяты из самого шаблона (web/assets/blank/template.docx): страница
 * 210×297, поля 8, копия 89,03 в ширину, строка 14,57 в высоту, колонка
 * подписи и колонка значения по 44,5 — всё в миллиметрах. Поэтому
 * распечатка ложится в те же клетки, что и привычный бланк.
 *
 * Подставляются только четыре поля: договор, номер заказа, дата заказа и
 * артикул. Остальные строки остаются пустыми — их заполняют на месте.
 */
import { mm, pdf } from "./pdf.js";

export const PAGE = { width: 210, height: 297 };

const LAYOUT = {
  margin: 8.0,
  copyWidth: 89.03,
  gap: 16.0,
  halfHeight: 148.5,      // половина листа: по две копии сверху и снизу
  rowHeight: 14.57,     // как в выгрузке шаблона: 9 строк на 131 мм
  labelWidth: 44.5,
  padLeft: 3.0,
  labelSize: 8,
  valueSize: 11.5,
  minValueSize: 6,        // длинный артикул ужимается, но не бесконечно
  border: [0.35, 0.35, 0.35],
  borderWidth: 0.8,
  cut: [0.75, 0.75, 0.75],
};

/** Строки бланка: подпись и поле записи заказа, из которого берётся значение. */
export const ROWS = [
  ["№ ДОГОВОРА:", "contract_no"],
  ["НОМЕР ЗАКАЗА:", "order_no"],
  ["ДАТА ЗАКАЗА:", "order_date"],
  ["ДАТА ОТПРАВКИ:", null],
  ["АРТИКУЛ ИЗДЕЛИЯ:", "item_article"],
  ["РАЗМЕР:", null],
  ["КОЛИЧЕСТВО:", null],
  ["ЦВЕТ:", null],
  ["ВЕС:", null],
];

/** Что печатается в четырёх копиях. Пустое поле — пустая строка в бланке. */
export function fields(order) {
  const date = order.get("order_date");
  return {
    contract_no: order.contract_no || "",
    order_no: order.get("order_no") || "",
    order_date: date ? date.split("-").reverse().join(".") : "",
    item_article: order.get("item_article") || "",
  };
}

/** Левые верхние углы четырёх копий. */
export function corners() {
  const { margin, copyWidth, gap, halfHeight } = LAYOUT;
  const xs = [margin, margin + copyWidth + gap];
  const ys = [margin, margin + halfHeight];
  return ys.flatMap((y) => xs.map((x) => ({ x, y })));
}

/**
 * Подобрать кегль, при котором строка влезает в колонку значения.
 * Артикулы бывают длинные («КОСТЛЕТШ01сингапур/олива»), и обрезать их
 * нельзя — по ним ищут изделие.
 */
export function fitSize(doc, value, width, { from = LAYOUT.valueSize, min = LAYOUT.minValueSize } = {}) {
  let size = from;
  while (size > min && doc.widthOf(value, { size }) > width) size -= 0.25;
  return size;
}

/** Собрать PDF бланка. Возвращает байты файла. */
export function blankPdf(order, fonts) {
  const doc = pdf({ width: mm(PAGE.width), height: mm(PAGE.height), fonts });
  const data = fields(order);
  const { rowHeight, labelWidth, copyWidth, padLeft, labelSize, border, borderWidth } = LAYOUT;
  const valueRoom = copyWidth - labelWidth - padLeft * 2;

  for (const { x, y } of corners()) {
    const height = rowHeight * ROWS.length;
    doc.rect(mm(x), mm(y), mm(copyWidth), mm(height), { color: border, width: borderWidth });
    doc.line(mm(x + labelWidth), mm(y), mm(x + labelWidth), mm(y + height),
             { color: border, width: borderWidth });

    ROWS.forEach(([label, key], i) => {
      const top = y + rowHeight * i;
      if (i) doc.line(mm(x), mm(top), mm(x + copyWidth), mm(top), { color: border, width: borderWidth });

      // Текст ставится по середине строки: + треть кегля от центра даёт
      // базовую линию, на которой буквы выглядят по центру клетки.
      const baseline = top + rowHeight / 2;
      doc.text(label, mm(x + padLeft), mm(baseline) + labelSize / 3,
               { size: labelSize, style: "bold" });

      const value = key ? data[key] : "";
      if (!value) return;
      const size = fitSize(doc, value, mm(valueRoom));
      doc.text(value, mm(x + labelWidth + padLeft), mm(baseline) + size / 3, { size });
    });
  }

  // Линии реза: по ним лист делят на четыре бланка.
  const dash = [3, 3];
  const fold = LAYOUT.margin + LAYOUT.halfHeight - 0.7;   // ровно между копиями
  doc.line(0, mm(fold), mm(PAGE.width), mm(fold), { color: LAYOUT.cut, width: 0.5, dash });
  doc.line(mm(PAGE.width / 2), 0, mm(PAGE.width / 2), mm(PAGE.height),
           { color: LAYOUT.cut, width: 0.5, dash });

  return doc.bytes();
}

/**
 * Тот же бланк разметкой — для предпросмотра на экране.
 *
 * Не встроенный просмотрщик PDF: в мобильных браузерах его часто нет, и
 * вместо листа человек видит пустой прямоугольник. Разметка рисуется из тех
 * же констант, что и PDF, поэтому показывает ровно то, что напечатается.
 */
export function blankHtml(order) {
  const data = fields(order);
  const { rowHeight, labelWidth, copyWidth, padLeft, labelSize, valueSize } = LAYOUT;

  const copy = ({ x, y }) => `<div class="bl-copy" style="
      left:${x}mm; top:${y}mm; width:${copyWidth}mm; height:${rowHeight * ROWS.length}mm">
    ${ROWS.map(([label, key]) => `<div class="bl-row" style="height:${rowHeight}mm">
        <div class="bl-label" style="width:${labelWidth}mm; padding-left:${padLeft}mm;
             font-size:${labelSize}pt">${escape(label)}</div>
        <div class="bl-value" style="padding-left:${padLeft}mm; font-size:${valueSize}pt"
             >${escape(key ? data[key] : "")}</div>
      </div>`).join("")}
  </div>`;

  return `<div class="bl-sheet" style="width:${PAGE.width}mm; height:${PAGE.height}mm">
    ${corners().map(copy).join("")}
    <div class="bl-fold" style="top:${LAYOUT.margin + LAYOUT.halfHeight - 0.7}mm"></div>
    <div class="bl-fold v" style="left:${PAGE.width / 2}mm"></div>
  </div>`;
}

/**
 * Ужать в предпросмотре те значения, что не влезли, — ровно как это делает
 * PDF. Иначе на экране артикул обрезан, а в печати он целый (или наоборот),
 * и предпросмотру нельзя верить.
 */
export function fitPreview(root) {
  for (const cell of root.querySelectorAll(".bl-value")) {
    let size = LAYOUT.valueSize;
    cell.style.fontSize = `${size}pt`;
    while (size > LAYOUT.minValueSize && cell.scrollWidth > cell.clientWidth + 1) {
      size -= 0.25;
      cell.style.fontSize = `${size}pt`;
    }
  }
}

const escape = (v) => String(v ?? "").replace(/[&<>"]/g, (ch) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

/** Имя файла: по нему потом находят, к какому заказу бланк. */
export const blankName = (order) =>
  `Бланк ${(order.contract_no || order.key).replace(/[\\/]/g, "-")}.pdf`;
