/**
 * Склейка: файлы → разбор → заказы → книга. Всё в браузере пользователя.
 */
import { load } from "./lib/docs.js";
import { ExtractionError, Extractor } from "./lib/extract.js";
import { build as buildOrders, money } from "./lib/ledger.js";
import { build as buildWorkbook, classify } from "./lib/workbook.js";

const KEY_STORAGE = "ibp.apiKey";
const $ = (sel) => document.querySelector(sel);

let files = [];
let lastResult = null;

// --------------------------------------------------------------------- ключ

function storedKey() {
  try {
    return localStorage.getItem(KEY_STORAGE) || "";
  } catch {
    return ""; // приватное окно или запрет на хранилище — работаем без памяти
  }
}

function showKeyState() {
  const key = $("#key").value.trim();
  $("#key-state").textContent = key
    ? (storedKey() === key ? "сохранён в этом браузере" : "не сохранён")
    : "не задан";
}

$("#save-key").onclick = () => {
  const key = $("#key").value.trim();
  try {
    if (key) localStorage.setItem(KEY_STORAGE, key);
    else localStorage.removeItem(KEY_STORAGE);
  } catch {
    alert("Браузер не разрешает сохранение — ключ будет действовать до перезагрузки.");
  }
  showKeyState();
};
$("#key").oninput = showKeyState;

// -------------------------------------------------------------------- выбор

const drop = $("#drop");
drop.onclick = () => $("#file").click();
drop.ondragover = (e) => { e.preventDefault(); drop.classList.add("over"); };
drop.ondragleave = () => drop.classList.remove("over");
drop.ondrop = (e) => {
  e.preventDefault();
  drop.classList.remove("over");
  pick([...e.dataTransfer.files]);
};
$("#file").onchange = (e) => pick([...e.target.files]);

function pick(list) {
  files = list;
  $("#picked").textContent = files.length ? `выбрано файлов: ${files.length}` : "";
  $("#go").disabled = !files.length;
}

// ------------------------------------------------------------------- разбор

$("#go").onclick = () => run();

export async function run({ extractor = null, fileList = null } = {}) {
  const chosen = fileList || files;
  const key = $("#key").value.trim();
  if (!extractor && !key) {
    alert("Сначала укажите ключ к API.");
    return null;
  }
  const worker = extractor || new Extractor(key);

  $("#go").disabled = true;
  $("#progress").classList.remove("hide");
  $("#result").classList.add("hide");

  const extractions = [];
  const failed = [];
  for (const [i, file] of chosen.entries()) {
    setProgress(i, chosen.length, file.name);
    const doc = await load(file);
    if (doc.error && !doc.pages.length) {
      failed.push({ file: doc.filename, error: doc.error });
      continue;
    }
    try {
      extractions.push(await worker.extract(doc));
    } catch (err) {
      failed.push({
        file: doc.filename,
        error: err instanceof ExtractionError ? err.message : `${err.name}: ${err.message}`,
      });
    }
  }
  setProgress(chosen.length, chosen.length, "сводим заказы");

  const { orders, orphans } = buildOrders(extractions);
  lastResult = { orders, orphans, failed };

  $("#progress").classList.add("hide");
  $("#go").disabled = false;
  render(lastResult);
  return lastResult;
}

function setProgress(done, total, text) {
  $(".bar i").style.width = `${Math.round((done / Math.max(total, 1)) * 100)}%`;
  $("#progress-text").textContent = `${text} (${done} из ${total})`;
}

// --------------------------------------------------------------------- вывод

function render({ orders, orphans, failed }) {
  $("#result").classList.remove("hide");

  const remainder = orders.reduce((s, o) => s + (o.computed.remainder || 0), 0);
  const count = (level) => orders.reduce(
    (s, o) => s + o.flags.filter((f) => f.level === level).length, 0);
  $("#tiles").innerHTML = [
    ["Заказов", orders.length],
    ["Остаток к перечислению", money(remainder)],
    ["Ошибок", count("error")],
    ["Предупреждений", count("warn")],
  ].map(([k, v]) => `<div class="tile"><span>${k}</span><b>${v}</b></div>`).join("");

  $("#orders").innerHTML = orders.map(card).join("");

  const bad = [...failed.map((f) => `${f.file}: ${f.error}`),
               ...orphans.map((o) => `${o.file}: ${o.reason}`)];
  $("#problems").innerHTML = bad.length
    ? `<div class="card"><h3>Не разобрано</h3>${
        bad.map((b) => `<div class="flag error">${esc(b)}</div>`).join("")}</div>`
    : "";
}

function card(order) {
  const f = (name) => order.get(name);
  const src = (name) => order.sourceOf(name)
    ? `<div class="src">${esc(order.sourceOf(name))}</div>` : "";
  const status = classify(order);
  const pill = { "Закрыт": "ok", "К сверке": "warn", "Нет постоплаты": "bad" }[status] || "";
  const c = order.computed;
  const n = (v) => v === null || v === undefined ? "—" : v.toLocaleString("ru-RU");

  return `<div class="card">
    <h3>${esc(f("order_no") || order.key)}
      <span class="pill">договор ${esc(order.contract_no || "—")}</span>
      <span class="pill ${pill}">${esc(status)}</span></h3>
    <table>
      <tr><th>Изделие</th><td colspan="3">${esc(f("item") || "—")}</td></tr>
      <tr><th>Заказано</th><td class="num">${n(f("ordered_qty"))} шт ${src("ordered_qty")}</td>
          <th>Цена</th><td class="num">${money(f("unit_price"))} ${src("unit_price")}</td></tr>
      <tr><th>Отгружено</th><td class="num">${n(f("shipped_qty"))} шт ${src("shipped_qty")}</td>
          <th>Сумма отгрузки</th><td class="num">${money(c.shipment_sum)}</td></tr>
      <tr><th>Оплачено</th><td class="num">${money(c.paid)}</td>
          <th>Остаток</th><td class="num"><b>${money(c.remainder)}</b>${
            c.remainder_units != null ? ` <span class="src">≈ ${n(c.remainder_units)} шт</span>` : ""
          }</td></tr>
      ${f("driver") ? `<tr><th>Водитель</th><td colspan="3">${esc(f("driver"))}${
        f("vehicle_plate") ? esc(` · ${f("vehicle_plate")}`) : ""} ${src("driver")}</td></tr>` : ""}
    </table>
    ${order.payments.length ? `<table>
      <tr><th>Платёж</th><th>Дата</th><th class="num">Сумма</th><th>Источник</th></tr>
      ${order.payments.map((p) => `<tr><td>${esc(p.kind)}</td>
        <td>${p.date ? p.date.toISOString().slice(0, 10) : "—"}</td>
        <td class="num">${money(p.amount)}</td>
        <td class="src">${esc(p.source)}</td></tr>`).join("")}</table>` : ""}
    ${order.flags.map((fl) => `<div class="flag ${fl.level}">${esc(fl.message)}</div>`).join("")}
    <details style="margin-top:10px"><summary>Документы: ${order.documents.length}</summary>
      <div class="src">${order.documents.map((d) =>
        esc(`${d.file} — ${d.doc_type}`)).join("<br>")}</div></details>
  </div>`;
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

// --------------------------------------------------------------------- книга

$("#export").onclick = async () => {
  if (!lastResult) return;
  const button = $("#export");
  button.disabled = true;
  button.textContent = "Собираю…";
  try {
    const blob = await buildWorkbook(lastResult.orders, lastResult.orphans);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Заказы.xlsx";
    a.click();
    // Освобождаем после того, как браузер успел начать скачивание.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  } catch (err) {
    alert(`Не удалось собрать книгу: ${err.message}`);
  } finally {
    button.disabled = false;
    button.textContent = "Скачать книгу Excel";
  }
};

$("#again").onclick = () => location.reload();

// Доступ для браузерных тестов: подменить распознавание и забрать результат.
window.__ibp = { run, buildWorkbook, buildOrders, getResult: () => lastResult };

$("#key").value = storedKey();
showKeyState();
