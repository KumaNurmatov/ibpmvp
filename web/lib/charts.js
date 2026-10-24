/**
 * Графики: рисуем сами, чтобы не тащить библиотеку ради двух форм.
 *
 * Обе формы выбраны по работе данных: отгрузки и оплаты — две величины одной
 * природы по месяцам, это сгруппированные столбцы; долг нарастающим итогом —
 * одна величина во времени, это линия. Две оси никогда: величины разного
 * масштаба идут разными графиками.
 */
import { money } from "./ledger.js";

const NS = "http://www.w3.org/2000/svg";
const MONTHS = ["янв", "фев", "мар", "апр", "май", "июн",
                "июл", "авг", "сен", "окт", "ноя", "дек"];

let tooltip = null;
let chartSeq = 0;

/** Сгруппированные столбцы: по две величины на месяц. */
export function groupedBars(host, { rows, series, caption, lede }) {
  const width = 640, height = 260;
  const pad = { top: 12, right: 12, bottom: 28, left: 64 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const peak = Math.max(0, ...rows.flatMap((r) => series.map((s) => r[s.key] || 0)));
  // Круглый шаг, а не круглый верх: иначе подписи шли «3,8 млн, 7,5 млн».
  const step = niceMax(peak / 4);
  const max = peak ? Math.ceil(peak / step) * step : 1;

  const svg = el("svg", { viewBox: `0 0 ${width} ${height}`, role: "img",
                          "aria-label": caption });
  gridAndTicks(svg, pad, plotW, plotH, max, 0, Math.max(1, Math.round(max / step)));

  const slot = plotW / Math.max(rows.length, 1);
  const barW = Math.max(6, Math.min(26, (slot - 10) / series.length - 1));

  // Штриховка — для величины «сколько должно прийти» (отгружено), сплошная
  // заливка — для того, что уже пришло. Так пара читается без легенды.
  const hatchId = `hatch${(chartSeq += 1)}`;
  if (series.some((s) => s.hatch)) {
    const defs = el("defs", {});
    const pattern = el("pattern", { id: hatchId, width: 6, height: 6,
                                    patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" });
    pattern.appendChild(el("rect", { width: 6, height: 6, class: "hatch-bg" }));
    pattern.appendChild(el("line", { x1: 0, y1: 0, x2: 0, y2: 6, class: "hatch-line" }));
    defs.appendChild(pattern);
    svg.appendChild(defs);
  }

  rows.forEach((row, i) => {
    const groupX = pad.left + slot * i + slot / 2;
    // Месяц — группа: при наведении подсвечивается весь месяц, остальные гаснут.
    const group = el("g", { class: `month${i === rows.length - 1 ? " now" : ""}` });
    series.forEach((s, j) => {
      const value = row[s.key] || 0;
      const h = max ? (value / max) * plotH : 0;
      // Зазор в 3 px между соседними столбцами: иначе две заливки слипаются.
      const x = groupX - (series.length * (barW + 3)) / 2 + j * (barW + 3);
      // Столбец — пилюля: скругление в полширины, как у кнопок и табов.
      group.appendChild(el("rect", {
        class: `col${s.hatch ? " hatched" : ""}`, x, y: pad.top + plotH - h, width: barW,
        height: Math.max(h, value ? 2 : 0), rx: Math.min(barW / 2, h / 2),
        fill: s.hatch ? `url(#${hatchId})` : `var(${s.color})`,
        ...(s.hatch ? { stroke: `var(${s.color})` } : {}),
      }));
    });
    // Наводиться нужно на месяц, а не на столбец: в месяце без отгрузок
    // столбец нулевой высоты, поймать его мышью невозможно.
    const band = el("rect", { class: "mark", x: pad.left + slot * i, y: pad.top,
                              width: slot, height: plotH, fill: "transparent" });
    bind(band, () => tipHtml(row.label, series.map((t) => [t.name, money(row[t.key] || 0)])));
    group.appendChild(band);
    group.appendChild(el("text", { class: "tick", x: groupX, y: height - 8,
                                   "text-anchor": "middle" }, row.label));
    svg.appendChild(group);
  });

  host.replaceChildren(figure(caption, lede, legend(series), svg));
}

/** Линия: одна величина во времени. Легенда не нужна — её называет заголовок. */
export function lineChart(host, { rows, key, caption, lede, color = "--series-1" }) {
  const width = 640, height = 260;
  const pad = { top: 12, right: 14, bottom: 28, left: 64 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  // Долг бывает отрицательным — это переплата, и она реальна. Шкала с нулём
  // в основании уносила такую точку далеко за пределы графика, линия уходила
  // через всю страницу. Поэтому область значений считается по обоим концам.
  const values = rows.map((r) => r[key] || 0);
  const highest = Math.max(0, ...values);
  const lowest = Math.max(0, ...values.map((v) => -v));
  // Если положительных значений нет вовсе, верх шкалы — ровно ноль, иначе
  // над графиком висит бессмысленная подпись «1».
  // Шаг шкалы круглый и общий для обеих сторон: тогда ноль всегда стоит на
  // линии сетки, а подписи идут ровно (1 млн, 0, −1 млн), а не «−875 тыс.».
  const step = niceMax((highest + lowest) / 4 || highest || 1);
  const top = highest ? Math.ceil(highest / step) * step : 0;
  const bottom = lowest ? -Math.ceil(lowest / step) * step : 0;
  const span = top - bottom || 1;
  const stepX = rows.length > 1 ? plotW / (rows.length - 1) : 0;
  const at = (i, v) => [pad.left + stepX * i, pad.top + plotH - ((v - bottom) / span) * plotH];

  const svg = el("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": caption });
  gridAndTicks(svg, pad, plotW, plotH, top, bottom, Math.max(1, Math.round(span / step)));

  const points = rows.map((r, i) => at(i, r[key] || 0));
  const line = smooth(points);
  // Под линией — мягкая заливка до низа графика: так линия читается как
  // рельеф, а нулевая линия сетки остаётся видна поверх заливки.
  const base = pad.top + plotH;
  const fadeId = `fade${(chartSeq += 1)}`;
  const defs = el("defs", {});
  const grad = el("linearGradient", { id: fadeId, x1: 0, y1: 0, x2: 0, y2: 1 });
  grad.appendChild(el("stop", { offset: "0%", "stop-color": `var(${color})`, "stop-opacity": 0.22 }));
  grad.appendChild(el("stop", { offset: "100%", "stop-color": `var(${color})`, "stop-opacity": 0 }));
  defs.appendChild(grad);
  svg.appendChild(defs);
  if (points.length > 1) {
    const [first, last] = [points[0], points[points.length - 1]];
    svg.appendChild(el("path", { class: "area", fill: `url(#${fadeId})`,
      d: `${line} L${last[0].toFixed(1)},${base.toFixed(1)} L${first[0].toFixed(1)},${base.toFixed(1)} Z` }));
  }
  svg.appendChild(el("path", {
    class: "line", d: line, fill: "none", stroke: `var(${color})`, "stroke-width": 2,
    "stroke-linejoin": "round", "stroke-linecap": "round",
  }));

  rows.forEach((row, i) => {
    const [x, y] = points[i];
    // Кольцо цвета поверхности: точки на пересечении не сливаются в пятно.
    svg.appendChild(el("circle", { cx: x, cy: y, r: 4.5, fill: `var(${color})`,
                                   stroke: "var(--card)", "stroke-width": 2 }));
    const hit = el("circle", { class: "mark", cx: x, cy: pad.top + plotH / 2, r: 0,
                               fill: "transparent" });
    // Зона наведения шире точки: попасть в 9 px мышью неудобно.
    // Зону наведения прижимаем к области графика: иначе у крайних точек она
    // вылезает за рамку и ловит мышь там, где ничего не нарисовано.
    const half = (stepX || 24) / 2;
    const left = Math.max(pad.left, x - half);
    const right = Math.min(pad.left + plotW, x + half);
    const band = el("rect", { class: "mark", x: left, y: pad.top,
                              width: Math.max(right - left, 1), height: plotH, fill: "transparent" });
    bind(band, () => tipHtml(row.label, [[caption, money(row[key] || 0)]]));
    svg.appendChild(hit);
    svg.appendChild(band);
    if (i === rows.length - 1 || i === 0) {
      svg.appendChild(el("text", { class: "tick", x, y: Math.max(y - 10, pad.top + 10), "text-anchor": i ? "end" : "start" },
                         shortMoney(row[key] || 0)));
    }
    svg.appendChild(el("text", { class: "tick", x, y: height - 8, "text-anchor": "middle" }, row.label));
  });

  host.replaceChildren(figure(caption, lede, null, svg));
}

/** Месячные срезы: отгружено, оплачено и долг нарастающим итогом. */
export function byMonth(orders) {
  const buckets = new Map();
  const touch = (date) => {
    if (!date) return null;
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
    if (!buckets.has(key)) {
      buckets.set(key, { key, label: `${MONTHS[date.getUTCMonth()]} ${String(date.getUTCFullYear()).slice(2)}`,
                         shipped: 0, paid: 0 });
    }
    return buckets.get(key);
  };

  for (const order of orders) {
    const ship = touch(dateOf(order.get("shipment_date")));
    if (ship) ship.shipped += order.computed.shipment_sum || 0;
    for (const pay of order.payments) {
      const bucket = touch(pay.date);
      if (bucket) bucket.paid += pay.amount;
    }
  }

  const rows = [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
  let running = 0;
  for (const row of rows) {
    running += row.shipped - row.paid;
    row.debt = Math.round(running * 100) / 100;
  }
  return rows;
}

// ────────────────────────────────────────────────────────────── внутреннее

/**
 * Плавная линия через все точки (кривая Катмулла — Рома в кубических
 * Безье). Проходит ровно через значения месяцев, только без изломов.
 */
function smooth(points) {
  if (points.length < 3) {
    return points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  }
  const f = (v) => v.toFixed(1);
  let d = `M${f(points[0][0])},${f(points[0][1])}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] || points[i];
    const [p1, p2] = [points[i], points[i + 1]];
    const p3 = points[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${f(c1[0])},${f(c1[1])} ${f(c2[0])},${f(c2[1])} ${f(p2[0])},${f(p2[1])}`;
  }
  return d;
}

function gridAndTicks(svg, pad, plotW, plotH, top, bottom = 0, steps = 4) {
  const span = top - bottom || 1;
  for (let i = 0; i <= steps; i++) {
    const y = pad.top + (plotH / steps) * i;
    const value = top - (span / steps) * i;
    // Нулевая линия заметнее прочих: по ней читается знак.
    const isZero = Math.abs(value) < span / 1000;
    svg.appendChild(el("line", { class: isZero || i === steps ? "axis" : "gridline",
                                 x1: pad.left, x2: pad.left + plotW, y1: y, y2: y }));
    svg.appendChild(el("text", { class: "tick", x: pad.left - 8, y: y + 4,
                                 "text-anchor": "end" }, shortMoney(value)));
  }
}

function figure(caption, lede, legendNode, svg) {
  const fig = document.createElement("figure");
  fig.className = "chart card";
  const cap = document.createElement("figcaption");
  cap.textContent = caption;
  fig.append(cap);
  if (lede) {
    const p = document.createElement("p");
    p.className = "lede";
    p.textContent = lede;
    fig.append(p);
  }
  if (legendNode) fig.append(legendNode);
  fig.append(svg);
  return fig;
}

function legend(series) {
  const box = document.createElement("div");
  box.className = "legend";
  for (const s of series) {
    const item = document.createElement("span");
    item.innerHTML = `<i class="${s.hatch ? "hatched" : ""}" style="--c: var(${s.color})"></i>${
      escapeHtml(s.name)}`;
    box.append(item);
  }
  return box;
}

function bind(node, html) {
  node.addEventListener("pointerenter", (e) => showTip(e, html()));
  node.addEventListener("pointermove", (e) => moveTip(e));
  node.addEventListener("pointerleave", hideTip);
}

function showTip(event, html) {
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    document.body.append(tooltip);
  }
  tooltip.innerHTML = html;
  tooltip.style.display = "block";
  moveTip(event);
}

function moveTip(event) {
  if (!tooltip) return;
  const pad = 14;
  const box = tooltip.getBoundingClientRect();
  const x = Math.min(event.clientX + pad, window.innerWidth - box.width - 8);
  const y = Math.max(8, event.clientY - box.height - pad);
  tooltip.style.left = `${x}px`;
  tooltip.style.top = `${y}px`;
}

function hideTip() {
  if (tooltip) tooltip.style.display = "none";
}

const tipHtml = (title, rows) =>
  `<b>${escapeHtml(title)}</b>` +
  rows.map(([k, v]) => `<div class="r"><span>${escapeHtml(k)}</span>${escapeHtml(v)}</div>`).join("");

function el(name, attrs, text) {
  const node = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
  if (text !== undefined) node.textContent = text;
  return node;
}

/** Круглый верх шкалы: 1 234 567 → 1 500 000. */
function niceMax(value) {
  if (!value || !Number.isFinite(value)) return 1;
  const pow = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 1.5, 2, 2.5, 3, 4, 5, 7.5, 10]) {
    if (value <= step * pow) return step * pow;
  }
  return 10 * pow;
}

export function shortMoney(value) {
  const v = Math.abs(value);
  if (v >= 1e6) return `${trim(value / 1e6)} млн`;
  if (v >= 1e3) return `${trim(value / 1e3)} тыс.`;
  return String(Math.round(value));
}

const trim = (v) => String(Math.round(v * 10) / 10).replace(".", ",");

const dateOf = (v) => (v ? new Date(`${v}T00:00:00Z`) : null);

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
