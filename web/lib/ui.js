/**
 * Мелкие элементы интерфейса, которые повторяются на нескольких страницах:
 * кольцо прогресса, спарклайн, расходящаяся шкала и ряд таб-пилюль.
 *
 * Все они рисуются строками SVG/HTML и ничего не знают про заказы — им дают
 * числа. Так их видно в тестах на числах, а не на снимках экрана.
 */
import { escapeHtml } from "./shell.js";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

// Градиенты в SVG живут по id, а колец на странице много.
let gradientSeq = 0;

/**
 * Кольцо прогресса. Доля 0…1, подпись в центре.
 * Нужен не процент сам по себе, а мгновенное «много/мало» — кольцо читается
 * быстрее цифры и не занимает строку.
 */
export function ring({ value = 0, size = 62, stroke = 7, tone = "var(--ok)", tone2 = "",
                       track = "var(--ring-track)", label = "", title = "" } = {}) {
  const share = clamp(Number(value) || 0, 0, 1);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const text = label === null ? "" : (label || `${Math.round(share * 100)}%`);
  // Градиент по дуге: у заполненной части появляется направление, и кольцо
  // перестаёт выглядеть наклейкой.
  const id = `g${(gradientSeq += 1)}`;
  const paint = tone2 ? `url(#${id})` : tone;

  return `<svg class="ring" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"
       role="img" aria-label="${escapeHtml(title || text)}">
    ${tone2 ? `<defs><linearGradient id="${id}" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="${tone}"/><stop offset="100%" stop-color="${tone2}"/>
    </linearGradient></defs>` : ""}
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${track}" stroke-width="${stroke}"/>
    <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${paint}" stroke-width="${stroke}"
      stroke-linecap="round" stroke-dasharray="${round(c * share)} ${round(c)}"
      transform="rotate(-90 ${size / 2} ${size / 2})"/>
    ${text ? `<text class="ring-label" x="${size / 2}" y="${size / 2}" text-anchor="middle"
        dominant-baseline="central" font-size="${labelSize(size, stroke, text)}"
        >${escapeHtml(text)}</text>` : ""}
  </svg>`;
}

/**
 * Спарклайн: ход величины без осей и подписей. Он отвечает на один вопрос —
 * растёт или падает, — и для этого осей не нужно.
 */
export function sparkline(values, { width = 132, height = 34, tone = "var(--accent)" } = {}) {
  const points = (values || []).filter((v) => Number.isFinite(v));
  if (points.length < 2) return "";

  const lo = Math.min(...points, 0);
  const hi = Math.max(...points, 0);
  const span = hi - lo || 1;
  const pad = 3;
  const x = (i) => round(pad + (i * (width - pad * 2)) / (points.length - 1));
  const y = (v) => round(height - pad - ((v - lo) / span) * (height - pad * 2));

  const line = points.map((v, i) => `${i ? "L" : "M"}${x(i)} ${y(v)}`).join(" ");
  const area = `${line} L${x(points.length - 1)} ${height} L${x(0)} ${height} Z`;
  const last = points[points.length - 1];

  const id = `s${(gradientSeq += 1)}`;

  return `<svg class="spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${tone}" stop-opacity=".28"/>
      <stop offset="100%" stop-color="${tone}" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#${id})"/>
    <path d="${line}" fill="none" stroke="${tone}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${x(points.length - 1)}" cy="${y(last)}" r="3" fill="${tone}"/>
  </svg>`;
}

/**
 * Расходящаяся шкала: ноль посередине, отклонение в обе стороны.
 *
 * Для остатка это единственная честная форма: недоплата и переплата — не
 * «больше» и «меньше» одного и того же, а две разные стороны нуля, и
 * расстояние до нуля важнее самого значения.
 */
export function balanceScale({ value = 0, span = 0, left = "", right = "",
                               zero = "в ноль", format = (v) => String(v) } = {}) {
  const size = Math.max(Math.abs(Number(value) || 0), Math.abs(span) || 0) || 1;
  const share = clamp((Number(value) || 0) / size, -1, 1);
  const pos = round(50 + share * 50, 1);

  return `<div class="scale">
    <div class="track"><span class="mark" style="left:${pos}%"></span></div>
    <div class="ends">
      <span>${escapeHtml(left)}<b>−${escapeHtml(format(size))}</b></span>
      <span class="mid">${escapeHtml(zero)}</span>
      <span>${escapeHtml(right)}<b>${escapeHtml(format(size))}</b></span>
    </div>
  </div>`;
}

/**
 * Ряд пилюль-табов со счётчиками. Выбор стадии списком был спрятан в
 * выпадающем меню — здесь видно и сами стадии, и сколько в каждой.
 */
export function pills(items, { current = "", attr = "data-pill" } = {}) {
  return `<div class="pills">${items.map((it) => `
    <button type="button" class="pilltab ${it.cls || ""}" ${attr}="${escapeHtml(it.key)}"
      aria-pressed="${it.key === current}">
      ${escapeHtml(it.name)}${it.count === undefined ? "" : `<i>${it.count}</i>`}
    </button>`).join("")}</div>`;
}

/**
 * Размер подписи считается от самого кольца, а не берётся постоянным: в
 * маленьком кольце «91%» фиксированным кеглем упиралось в дугу и выглядело
 * сдвинутым, хотя стояло по центру.
 */
function labelSize(size, stroke, text) {
  const inner = size - stroke * 2 - 6;          // свободный круг внутри дуги
  const perChar = inner / Math.max(3, text.length) * 1.4;
  return round(Math.min(size * 0.27, perChar), 2);
}

function round(v, digits = 1) {
  const k = 10 ** digits;
  return Math.round(v * k) / k;
}
