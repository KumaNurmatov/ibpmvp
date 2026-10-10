/** Общая обвязка страниц: шапка, роль, загрузка данных, мелкое форматирование. */
import { orderFromRecord } from "./ledger.js";
import { canEdit, lastCommit, load } from "./store.js";

const PAGES = [
  ["index.html", "Дашборд"],
  ["orders.html", "Заказы"],
  ["admin.html", "Редактирование"],
  ["parse.html", "Разбор документов"],
];

export function mountHeader(current) {
  const header = document.createElement("header");
  header.className = "top";
  const admin = canEdit();
  header.innerHTML = `<div class="inner">
    <b>Заказы Айзада (Az)</b>
    <span class="role ${admin ? "admin" : ""}">${admin ? "режим редактирования" : "только просмотр"}</span>
    <nav>${PAGES.map(([href, name]) =>
      `<a href="./${href}"${href === current ? ' aria-current="page"' : ""}>${name}</a>`).join("")}</nav>
  </div>`;
  document.body.prepend(header);

  // Отметку версии подставляет выкладка. Нужна, чтобы отличить свежую
  // страницу от той, что браузер взял из кэша: на вид они неразличимы.
  const mark = document.createElement("p");
  mark.className = "src";
  mark.style.cssText = "max-width:1180px;margin:0 auto;padding:0 16px 24px";
  mark.textContent = "версия: из исходников";
  document.body.append(mark);
}

/** Данные + посчитанные заказы. Одна точка входа для всех страниц. */
export async function loadOrders() {
  const data = await load();
  const orders = data.orders.map(orderFromRecord);
  return { data, orders };
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

/** Статус заказа — то же правило, что раскладывает книгу по листам. */
export function status(order) {
  const remainder = order.computed.remainder;
  if (remainder === null || remainder === undefined) return { name: "К сверке", cls: "warn" };
  const hasPostpay = order.payments.some((p) => p.kind.startsWith("постоплата") || p.kind.startsWith("доп"));
  if (Math.abs(remainder) <= 0.5) return { name: "Закрыт", cls: "ok" };
  return hasPostpay ? { name: "К сверке", cls: "warn" } : { name: "Нет постоплаты", cls: "bad" };
}

export const severity = (order) =>
  order.flags.some((f) => f.level === "error") ? 2
    : order.flags.some((f) => f.level === "warn") ? 1 : 0;
