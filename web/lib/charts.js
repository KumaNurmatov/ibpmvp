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

/** Сгруппированные столбцы: по две величины на месяц. */
export function groupedBars(host, { rows, series, caption, lede }) {
  const width = 640, height = 260;
  const pad = { top: 12, right: 12, bottom: 28, left: 64 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(0, ...rows.flatMap((r) => series.map((s) => r[s.key] || 0))));

  const svg = el("svg", { viewBox: `0 0 ${width} ${height}`, role: "img",
                          "aria-label": caption });
  gridAndTicks(svg, pad, plotW, plotH, max);

  const slot = plotW / Math.max(rows.length, 1);
  const barW = Math.max(6, Math.min(26, (slot - 10) / series.length - 1));

  rows.forEach((row, i) => {
    const groupX = pad.left + slot * i + slot / 2;
    series.forEach((s, j) => {
      const value = row[s.key] || 0;
      const h = max ? (value / max) * plotH : 0;
      // Зазор в 2 px между соседними столбцами: иначе две заливки слипаются.
      const x = groupX - (series.length * (barW + 2)) / 2 + j * (barW + 2);
      svg.appendChild(el("rect", {
        class: "mark", x, y: pad.top + plotH - h, width: barW, height: Math.max(h, value ? 2 : 0),
        rx: 4, fill: `var(${s.color})`,
      }));
    });
    // Наводиться нужно на месяц, а не на столбец: в месяце без отгрузок
    // столбец нулевой высоты, поймать его мышью невозможно.
    const band = el("rect", { class: "mark", x: pad.left + slot * i, y: pad.top,
                              width: slot, height: plotH, fill: "transparent" });
    bind(band, () => tipHtml(row.label, series.map((t) => [t.name, money(row[t.key] || 0)])));
    svg.appendChild(band);
    svg.appendChild(el("text", { class: "tick", x: groupX, y: height - 8,
                                 "text-anchor": "middle" }, row.label));
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
  const top = highest ? niceMax(highest) : 0;
  const bottom = lowest ? -niceMax(lowest) : 0;
  const span = top - bottom || 1;
  const stepX = rows.length > 1 ? plotW / (rows.length - 1) : 0;
  const at = (i, v) => [pad.left + stepX * i, pad.top + plotH - ((v - bottom) / span) * plotH];

  const svg = el("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": caption });
  gridAndTicks(svg, pad, plotW, plotH, top, bottom);

  const points = rows.map((r, i) => at(i, r[key] || 0));
  svg.appendChild(el("path", {
    d: points.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" "),
    fill: "none", stroke: `var(${color})`, "stroke-width": 2,
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

function gridAndTicks(svg, pad, plotW, plotH, top, bottom = 0) {
  const steps = 4;
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
    item.innerHTML = `<i style="background: var(${s.color})"></i>${escapeHtml(s.name)}`;
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
