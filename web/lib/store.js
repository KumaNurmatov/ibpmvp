/**
 * Хранилище: данные лежат файлом в репозитории.
 *
 * Читают все — файл раздаётся вместе со страницей. Пишет только тот, у кого
 * есть токен GitHub: он хранится в его браузере, страница коммитит через API.
 * Отсюда и разделение прав — смотрящий не «лишён кнопок», он физически не
 * может записать. И у каждой правки остаётся история: видно, кто и когда
 * поменял цифру, чего в таблице не было.
 */
// Файл один, но адресуется он по-разному, и это легко перепутать: страница
// лежит внутри web/, поэтому читает соседний data/orders.json, а GitHub API
// знает только путь в репозитории — web/data/orders.json. Пока здесь было
// одно значение на оба случая, запись уходила в корень репозитория, в файл,
// которого сайт не видит: правки «сохранялись» и пропадали.
export const SITE_PATH = "data/orders.json";       // рядом со страницей
export const REPO_PATH = "web/data/orders.json";   // в дереве репозитория
const TOKEN_KEY = "ibp.githubToken";
const REPO_KEY = "ibp.repo";
const DEFAULT_REPO = "KumaNurmatov/ibpmvp";
const API = "https://api.github.com";

export function repo() {
  return readLocal(REPO_KEY) || DEFAULT_REPO;
}

export function setRepo(value) {
  writeLocal(REPO_KEY, (value || "").trim());
}

export function token() {
  return readLocal(TOKEN_KEY);
}

export function setToken(value) {
  writeLocal(TOKEN_KEY, (value || "").trim());
}

export const canEdit = () => Boolean(token());

/**
 * Версия файла, которую страница видела при открытии. Нужна, чтобы при
 * сохранении отличить «я правлю то, что читал» от «пока я возился, файл
 * изменился». Без неё страница, открытая час назад, молча затирала всё,
 * что успели записать за это время.
 */
let baseline = null;

/** Прочитать данные. Без токена — как обычный файл рядом со страницей. */
export async function load() {
  const response = await fetch(`./${SITE_PATH}?t=${Date.now()}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`не удалось прочитать данные (${response.status})`);
  const data = await response.json();
  // Запоминаем версию в репозитории — она может быть свежее выложенной.
  if (token()) baseline = (await head(token()).catch(() => ({}))).sha ?? null;
  return normalize(data);
}

/**
 * Сохранить. Нужен sha текущего файла, иначе GitHub откажет — это и есть
 * защита от затирания чужой правки, сделанной параллельно.
 */
export async function save(data, message) {
  const auth = token();
  if (!auth) throw new Error("нет токена — сохранять некуда");

  const current = await head(auth);
  // Кто-то записал файл после того, как мы его прочитали: продолжать —
  // значит стереть чужую правку. Лучше сказать и попросить обновиться.
  if (baseline !== null && current.sha && current.sha !== baseline) {
    throw new Error("данные изменились после открытия страницы — обновите её (F5) " +
                    "и внесите правку заново, иначе чужая запись потеряется");
  }
  const body = {
    message: message || `Обновить данные заказов (${new Date().toISOString().slice(0, 16)})`,
    content: toBase64(JSON.stringify({ ...data, updated: today() }, null, 2) + "\n"),
    ...(current.sha ? { sha: current.sha } : {}),
  };

  const response = await fetch(contentsUrl(), {
    method: "PUT",
    headers: headers(auth),
    body: JSON.stringify(body),
  });
  if (response.status === 409) {
    throw new Error("файл изменился с момента загрузки — обновите страницу и повторите");
  }
  if (!response.ok) throw new Error(await describe(response));
  const result = await response.json();
  baseline = result.content?.sha ?? null;      // дальше правим уже от своей записи
  return { sha: baseline, commit: result.commit?.html_url };
}

/** Текущая версия файла в репозитории: нужен её sha и дата последней правки. */
async function head(auth) {
  const response = await fetch(contentsUrl(), { headers: headers(auth) });
  if (response.status === 404) return { sha: null };
  if (!response.ok) throw new Error(await describe(response));
  const json = await response.json();
  return { sha: json.sha };
}

/** Кто и когда правил данные — для подписи «обновлено». */
export async function lastCommit() {
  const url = `${API}/repos/${repo()}/commits?path=${encodeURIComponent(REPO_PATH)}&per_page=1`;
  const response = await fetch(url, { headers: headers(token()) });
  if (!response.ok) return null;
  const [commit] = await response.json();
  if (!commit) return null;
  return {
    date: commit.commit?.author?.date || null,
    author: commit.commit?.author?.name || null,
    url: commit.html_url,
  };
}

const contentsUrl = () => `${API}/repos/${repo()}/contents/${REPO_PATH}`;

function headers(auth) {
  const out = { accept: "application/vnd.github+json" };
  if (auth) out.authorization = `Bearer ${auth}`;
  return out;
}

async function describe(response) {
  const known = {
    401: "токен не принят — проверьте его",
    403: "токену не хватает прав: нужен доступ на запись содержимого репозитория",
    404: "репозиторий или файл не найден — проверьте имя репозитория",
  };
  let detail = "";
  try {
    detail = (await response.json())?.message || "";
  } catch { /* тело может быть пустым */ }
  return known[response.status] || `GitHub вернул ${response.status}${detail ? `: ${detail}` : ""}`;
}

/** Данные могут прийти от старой версии страницы — приводим к одной форме. */
function normalize(data) {
  const orders = Array.isArray(data?.orders) ? data.orders : [];
  return {
    version: data?.version ?? 1,
    updated: data?.updated ?? null,
    contractor: data?.contractor ?? "",
    workshops: normalizeWorkshops(data?.workshops),
    orders: orders.map((o, i) => ({
      id: String(o.id ?? o.contract_no ?? i + 1),
      order_no: o.order_no ?? "",
      contract_no: o.contract_no ?? "",
      order_date: o.order_date ?? "",
      item: o.item ?? "",
      item_article: o.item_article ?? "",
      tnved: o.tnved ?? "",
      ordered_qty: o.ordered_qty ?? null,
      unit_price: o.unit_price ?? null,
      // Цехов у заказа бывает несколько: раньше это было одно текстовое поле.
      workshops: toList(o.workshops ?? o.workshop),
      photo: o.photo ?? "",
      shipment: {
        date: o.shipment?.date ?? "", qty: o.shipment?.qty ?? null,
        places: o.shipment?.places ?? null, weight_gross: o.shipment?.weight_gross ?? null,
        driver: o.shipment?.driver ?? "", driver_phone: o.shipment?.driver_phone ?? "",
      },
      // Приёмка: сколько заказчик принял, сколько завернул и почему. От неё
      // зависит, можно ли считать сделку закрытой при ненулевом остатке.
      acceptance: {
        accepted_qty: o.acceptance?.accepted_qty ?? null,
        rejected_qty: o.acceptance?.rejected_qty ?? null,
        date: o.acceptance?.date ?? "",
        reason: o.acceptance?.reason ?? "",
      },
      payments: (o.payments || []).map((p) => ({
        kind: p.kind ?? "неизвестно", date: p.date ?? "", amount: p.amount ?? null,
        doc_number: p.doc_number ?? "", purpose: p.purpose ?? "",
      })),
      terms: {
        prepay_percent: o.terms?.prepay_percent ?? 50,
        // Срок не подставляется: без него просрочка просто не считается, а
        // подставленный «обычный» срок означал бы выдуманную претензию.
        lead_time_days: o.terms?.lead_time_days ?? null,
        postpay_days: o.terms?.postpay_days ?? null,
      },
      links: (o.links || []).filter((l) => l?.url).map((l) => ({
        title: l.title || "Ссылка", url: l.url,
      })),
      note: o.note ?? "",
    })),
  };
}

/** Справочник цехов: список правится в админке, цвет — у каждого свой. */
function normalizeWorkshops(raw) {
  const list = Array.isArray(raw) ? raw : [];
  return list
    .map((w) => (typeof w === "string" ? { name: w, color: "" } : w))
    .filter((w) => w?.name)
    .map((w) => ({ name: String(w.name).trim(), color: w.color || WORKSHOP_COLORS[0] }));
}

/** Палитра справочника: проверенные цвета, различимые и в тёмной теме. */
export const WORKSHOP_COLORS = [
  "#2a78d6", "#eb6834", "#0ca30c", "#8b5cf6", "#b35c00", "#0f9b9b", "#d03b3b", "#6b7280",
];

const toList = (value) =>
  (Array.isArray(value) ? value : String(value || "").split(","))
    .map((v) => String(v).trim()).filter(Boolean);

export function blankOrder() {
  return normalize({ orders: [{ id: "", terms: {} }] }).orders[0];
}

// Браузер может запретить хранилище (приватное окно) — это не повод падать.
function readLocal(key) {
  try {
    return localStorage.getItem(key) || "";
  } catch {
    return "";
  }
}

function writeLocal(key, value) {
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch { /* ничего не поделать, поработаем без памяти */ }
}

/** btoa не умеет кириллицу: сперва в UTF-8, потом в base64. */
function toBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

const today = () => new Date().toISOString().slice(0, 10);
