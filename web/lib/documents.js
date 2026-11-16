/**
 * Документы заказа: ссылки из карточки, разложенные по видам.
 *
 * Сами файлы лежат на Google Drive, сайт хранит только ссылку, её название
 * и вид документа. Вид можно указать в карточке; если не указан, он
 * угадывается по названию — у старых ссылок названием служит имя файла
 * («спец дог 1084 айзада.pdf», «отправка 399.pdf»).
 */

export const DOC_KINDS = [
  ["договор", "Договор"],
  ["спецификация", "Спецификация"],
  ["заказ", "Заказ"],
  ["учёт", "Учёт"],
  ["отправка", "Отправка"],
  ["папка", "Папка"],
  ["прочее", "Прочее"],
];

const ORDER = DOC_KINDS.map(([key]) => key);
export const kindName = (kind) => DOC_KINDS.find(([key]) => key === kind)?.[1] || "Прочее";

/**
 * Вид по названию. Порядок проверок важен: «спец дог 1084» — спецификация,
 * а не договор; «513 дог_Учет Бишкек» — учёт.
 */
export function guessKind(title, url = "") {
  if (/\/folders\//.test(url)) return "папка";
  const t = String(title || "").toLowerCase().replace(/ё/g, "е");
  // ТЗ подписывают вместе с договором («ТЗ дог 818 подписанный»), но это не договор.
  if (/(^|[\s_.-])тз([\s_.-]|$)/.test(t)) return "прочее";
  if (/спец/.test(t)) return "спецификация";
  if (/учет/.test(t)) return "учёт";
  if (/отправ|cmr|смр|ттн|инвойс|упаков|накладн/.test(t)) return "отправка";
  if (/дог/.test(t)) return "договор";
  if (/заказ/.test(t)) return "заказ";
  if (/папк/.test(t)) return "папка";
  return "прочее";
}

export const kindOf = (link) =>
  (ORDER.includes(link?.kind) ? link.kind : guessKind(link?.title, link?.url));

/** Номер файла или папки на Google Drive; null — ссылка не на Drive. */
export function driveId(url) {
  const s = String(url || "");
  if (!/(^|\.)google\.com\//.test(s.replace(/^https?:\/\//, ""))) return null;
  const m = s.match(/\/(?:file\/d|d|folders)\/([\w-]{10,})/) || s.match(/[?&]id=([\w-]{10,})/);
  return m ? m[1] : null;
}

const isFolderUrl = (url) => /\/folders\//.test(String(url || ""));

/** Документы заказа по порядку видов: договор, спецификация, заказ, учёт, отправка. */
export function docsOf(order) {
  return (order.links || []).filter((l) => l?.url).map((l, i) => {
    const id = driveId(l.url);
    const folder = isFolderUrl(l.url);
    return {
      title: l.title || "Документ", url: l.url, kind: kindOf(l), index: i, folder,
      preview: !id ? null : folder ? `https://drive.google.com/embeddedfolderview?id=${id}#list`
        : `https://drive.google.com/file/d/${id}/preview`,
      // Файл с Drive по этому адресу сразу отдаётся на скачивание, страница
      // остаётся на месте. Папку Drive скачивает архивом сам — из неё.
      download: id && !folder ? `https://drive.google.com/uc?export=download&id=${id}` : null,
    };
  }).sort((a, b) => ORDER.indexOf(a.kind) - ORDER.indexOf(b.kind) || a.index - b.index);
}

/** По чему ищется договор: номера, изделие и названия его документов. */
export function haystack(order, docs = docsOf(order)) {
  return [order.contract_no, order.key, order.get?.("order_no"), order.get?.("item"),
          ...docs.map((d) => d.title)].join(" ").toLowerCase().replace(/ё/g, "е");
}
