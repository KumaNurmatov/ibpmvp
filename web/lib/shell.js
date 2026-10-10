/** Общая обвязка страниц: шапка, роль, загрузка данных, мелкое форматирование. */
import { orderFromRecord } from "./ledger.js";
import { canEdit, lastCommit, load } from "./store.js";
import { stage, stageOf } from "./stages.js";

// Иконки рисуются здесь, а не грузятся шрифтом: одна зависимость меньше,
// и в офлайне меню не превращается в столбик квадратиков.
const ICONS = {
  dash: "M4 13h7V4H4zM13 20h7v-9h-7zM4 20h7v-5H4zM13 9h7V4h-7z",
  orders: "M5 4h10l4 4v12H5zM15 4v4h4M8 12h8M8 16h5",
  cards: "M4 5h16v14H4zM4 10h16M10 10v9",
  parse: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h4",
};

const PAGES = [
  ["index.html", "Дашборд", "dash"],
  ["orders.html", "Заказы", "orders"],
  ["admin.html", "Карточки", "cards"],
  ["parse.html", "Разбор документов", "parse"],
];

/**
 * Левое меню и каркас страницы.
 *
 * Разделы всегда на виду и всегда на одном месте: в верхней полосе они
 * разъезжались, а на телефоне переносились второй строкой. Содержимое
 * страницы (.wrap) переезжает внутрь каркаса — сами страницы об этом не
 * знают и остаются обычной разметкой.
 */
export function mountShell(current) {
  const admin = canEdit();
  const app = document.createElement("div");
  app.className = "app";
  app.innerHTML = `
    <aside class="side">
      <a class="brand" href="./index.html">
        <span class="logo">Az</span>
        <span><b>Айзада</b><span class="src">заказы и расчёты</span></span>
      </a>
      <nav>
        ${PAGES.map(([href, name, icon]) => `
          <a href="./${href}"${href === current ? ' aria-current="page"' : ""}>
            ${svgIcon(icon)}<span>${name}</span></a>`).join("")}
      </nav>
      <div class="side-foot">
        ${admin ? '<a class="btn primary new" href="./admin.html?new=1">+ Новый заказ</a>' : ""}
        <div class="role ${admin ? "admin" : ""}">${admin ? "режим редактирования" : "только просмотр"}</div>
        <p class="src mark">версия: из исходников</p>
      </div>
    </aside>
    <main class="main"></main>`;

  const wrap = document.querySelector(".wrap");
  document.body.prepend(app);
  app.querySelector(".main").append(wrap);
}

const svgIcon = (name) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${ICONS[name]}"/></svg>`;

/** Данные + посчитанные заказы. Одна точка входа для всех страниц. */
export async function loadOrders() {
  const data = await load();
  setWorkshops(data.workshops);
  const orders = data.orders.map(orderFromRecord);
  return { data, orders };
}

// ── цеха ────────────────────────────────────────────────────────────────
// Справочник общий для всех страниц: цвет метки должен быть одинаковым в
// списке, в карточке и в редакторе, иначе метка перестаёт работать как метка.
let WORKSHOPS = [];

export function setWorkshops(list) {
  WORKSHOPS = Array.isArray(list) ? list : [];
}

export const workshops = () => WORKSHOPS;

export const workshopColor = (name) =>
  WORKSHOPS.find((w) => w.name === name)?.color || "var(--faint)";

/** Метки цехов заказа. Нет цехов — ничего не рисуем, пустых мест не надо. */
export function workshopChips(order) {
  return (order.workshops || []).map((name) =>
    `<span class="chip" style="--chip:${escapeHtml(workshopColor(name))}">${escapeHtml(name)}</span>`
  ).join("");
}

export async function showUpdated(node, fallback = "") {
  // Подпись обязана смениться в любом случае: иначе «Загружаю…» висит вечно,
  // хотя данные давно на экране — запрос к истории правок лимитируется и
  // вполне может не ответить.
  node.textContent = fallback ? `Данные от ${dateRu(fallback)}` : "";
  const commit = await lastCommit().catch(() => null);
  if (!commit?.date) return;
  const when = new Date(commit.date).toLocaleString("ru-RU",
    { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
  node.innerHTML = `Данные обновлены ${when}` +
    (commit.author ? `, ${escapeHtml(commit.author)}` : "") +
    (commit.url ? ` · <a href="${commit.url}" target="_blank" rel="noopener">история правок</a>` : "");
}

export function fatal(message) {
  const box = document.createElement("div");
  box.className = "card";
  box.innerHTML = `<div class="flag error">${escapeHtml(message)}</div>`;
  (document.querySelector(".wrap") || document.body).prepend(box);
}

// ── форматирование ──────────────────────────────────────────────────────
export const qty = (v) => (v === null || v === undefined ? "—" : v.toLocaleString("ru-RU"));

export const dateRu = (v) => {
  if (!v) return "—";
  const d = v instanceof Date ? v : new Date(`${v}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? String(v)
    : d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "UTC" });
};

export const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

/**
 * Статус заказа — это его стадия в процессе. Два названия из пяти совпадают
 * с листами книги («нет постоплат», «недоплата» → «К сверке»), остальные три
 * в таблице приходилось держать в голове.
 */
export const status = (order) => stage(stageOf(order));

export const severity = (order) =>
  order.flags.some((f) => f.level === "error") ? 2
    : order.flags.some((f) => f.level === "warn") ? 1 : 0;
