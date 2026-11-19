/**
 * Список документов и окно просмотра — одни и те же в разделе «Документы»
 * и внизу карточки заказа: документ по видам, у каждого «смотреть» и
 * «скачать», в конце папка договора, которую целиком отдаёт только Drive.
 */
import { kindName } from "./documents.js";

const escapeHtml = (s) => String(s ?? "").replace(/[&<>"']/g, (ch) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));

const EYE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zM12 15a3 3 0 100-6 3 3 0 000 6"/></svg>`;
const FOLDER = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h6l2 2h10v11H3zM3 11h18"/></svg>`;
const DOWN = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>`;

/**
 * Документы и папка одного договора. `i` — номер договора в списке
 * страницы: по нему кнопки «смотреть» находят свой документ.
 */
export function docsHtml(docs, folder, i = 0) {
  return `${docs.length ? `<ul class="dlist">${docs.map((d, j) => `<li>
      <span class="kind">${kindName(d.kind)}</span>
      ${d.preview
        ? `<button type="button" class="name" data-view="${i}:${j}" title="${escapeHtml(d.title)}">${escapeHtml(d.title)}</button>`
        : `<a class="name" href="${escapeHtml(d.url)}" target="_blank" rel="noopener" title="${escapeHtml(d.title)}">${escapeHtml(d.title)} ↗</a>`}
      <span class="acts">
        ${d.preview ? `<button type="button" class="icon" data-view="${i}:${j}" title="Смотреть" aria-label="Смотреть">${EYE}</button>` : ""}
        ${d.download ? `<a class="btn icon" href="${escapeHtml(d.download)}" title="Скачать" aria-label="Скачать">${DOWN}</a>` : ""}
      </span>
    </li>`).join("")}</ul>` : '<p class="src" style="margin:0">Документов нет — ссылки добавляются в карточке заказа.</p>'}
  ${folder ? `<div class="dfolder">
    <span class="fname">${FOLDER}<span>Папка договора</span></span>
    <span class="acts">
      ${folder.preview ? `<button type="button" class="icon" data-folder="${i}" title="Смотреть папку" aria-label="Смотреть папку">${EYE}</button>` : ""}
      <a class="btn" href="${escapeHtml(folder.url)}" target="_blank" rel="noopener"
         title="Откроется папка в Google Drive — там «Скачать» отдаёт её архивом">Скачать ↗</a>
    </span>
  </div>` : ""}`;
}

let box = null;

/** Окно просмотра: одно на страницу, создаётся при первом открытии. */
function viewer() {
  if (box) return box;
  box = document.createElement("div");
  box.className = "overlay hide";
  box.innerHTML = `<div class="sheet-view">
      <div class="row-line">
        <b class="v-title"></b>
        <a class="btn primary v-save" style="margin-left:auto">Скачать</a>
        <a class="btn v-open" target="_blank" rel="noopener">Открыть в Drive ↗</a>
        <button type="button" class="v-close">Закрыть</button>
      </div>
      <iframe class="v-frame" title="Просмотр документа" allow="autoplay"></iframe>
    </div>`;
  document.body.append(box);
  const close = () => {
    box.classList.add("hide");
    box.querySelector(".v-frame").src = "about:blank";
  };
  box.querySelector(".v-close").onclick = close;
  box.addEventListener("click", (e) => { if (e.target === box) close(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !box.classList.contains("hide")) close(); });
  return box;
}

export function openDoc(d) {
  const v = viewer();
  v.querySelector(".v-title").textContent = d.folder ? "Папка договора" : `${kindName(d.kind)}: ${d.title}`;
  v.querySelector(".v-frame").src = d.preview;
  v.querySelector(".v-open").href = d.url;
  const save = v.querySelector(".v-save");
  save.classList.toggle("hide", !d.download);
  if (d.download) save.href = d.download;
  v.classList.remove("hide");
}

/** Оживляет кнопки «смотреть»: rows[i] — { docs, folder } i-го договора. */
export function bindDocs(root, rows) {
  for (const b of root.querySelectorAll("[data-view]")) {
    const [i, j] = b.dataset.view.split(":").map(Number);
    b.onclick = () => openDoc(rows[i].docs[j]);
  }
  for (const b of root.querySelectorAll("[data-folder]")) {
    b.onclick = () => openDoc(rows[+b.dataset.folder].folder);
  }
}
