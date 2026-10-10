/**
 * Файл → страницы, пригодные для модели. Браузерный аналог tool/pipeline/docs.py.
 *
 * Та же развилка, что и на сервере: если в PDF есть текстовый слой — отдаём
 * текст, он точнее и дешевле; если скан — рисуем страницы картинками. Решение
 * принимается по количеству извлечённого текста, а не по расширению.
 */

const PDFJS_VERSION = "4.10.38";
const PDFJS_BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}`;

export const TEXT_LAYER_MIN_CHARS = 120;
// Длинная сторона страницы. Модель всё равно ужимает картинку примерно до
// 1568 px: рисовать крупнее — платить за выброшенное. На сервере тот же
// переход уменьшил семистраничную накладную с 97 МБ до 1,9 МБ.
export const RENDER_MAX_SIDE = 1600;
export const JPEG_QUALITY = 0.8;
export const MAX_IMAGE_PAGES = 12;

const IMAGE_TYPES = /\.(png|jpe?g|webp|gif|bmp|tiff?|heic)$/i;

let pdfjsPromise = null;

/** pdf.js тянем один раз и лениво: 1,7 МБ не нужны, пока не открыт PDF. */
async function pdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(`${PDFJS_BASE}/pdf.min.mjs`).then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = `${PDFJS_BASE}/pdf.worker.min.mjs`;
      return lib;
    });
  }
  return pdfjsPromise;
}

/**
 * Разобрать файл на страницы.
 * @returns {Promise<{filename: string, kind: string, pages: Array, error: ?string}>}
 * Исключения не пробрасываются: ошибка одного файла не должна ронять пачку.
 */
export async function load(file) {
  const name = file.name || "файл";
  try {
    if (/\.pdf$/i.test(name)) return await loadPdf(file, name);
    if (IMAGE_TYPES.test(name)) return await loadImage(file, name);
    if (/\.xlsx?$/i.test(name)) return await loadXlsx(file, name);
    if (/\.(txt|csv|md|json)$/i.test(name)) {
      return doc(name, "text", [{ number: 1, text: await file.text() }]);
    }
    if (/\.docx$/i.test(name)) {
      return doc(name, "unsupported", [], "DOCX в браузерной версии не читается — " +
        "сохраните в PDF или воспользуйтесь версией для командной строки");
    }
    return doc(name, "unsupported", [], `формат не поддерживается`);
  } catch (err) {
    return doc(name, "unsupported", [], `${err.name}: ${err.message}`);
  }
}

async function loadPdf(file, name) {
  const lib = await pdfjs();
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await lib.getDocument({ data, isEvalSupported: false }).promise;

  const texts = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    texts.push(layoutText(await page.getTextContent()));
  }

  const solid = texts.filter((t) => t.length >= TEXT_LAYER_MIN_CHARS);
  if (texts.length && solid.length >= Math.max(1, Math.floor(texts.length / 2))) {
    const pages = texts
      .map((text, i) => ({ number: i + 1, text }))
      .filter((p) => p.text);
    return doc(name, "pdf_text", pages);
  }

  const pages = [];
  const limit = Math.min(pdf.numPages, MAX_IMAGE_PAGES);
  for (let n = 1; n <= limit; n++) {
    pages.push(await renderPage(await pdf.getPage(n), n));
  }
  return doc(name, "pdf_scan", pages,
    pages.length < pdf.numPages ? `показаны первые ${limit} страниц из ${pdf.numPages}` : null);
}

/**
 * Собрать текст страницы построчно по координатам фрагментов.
 *
 * Простая склейка через пробел превращает таблицу в одну строку, и модель
 * начинает путать, какое количество к какому размеру относится. У каждого
 * фрагмента есть координаты, поэтому строки восстанавливаются: группируем по
 * вертикали, внутри строки сортируем по горизонтали.
 */
function layoutText(content) {
  const lines = new Map();
  for (const item of content.items) {
    if (!item.str || !item.str.trim()) continue;
    const x = item.transform[4];
    const y = item.transform[5];
    // Округление до 3 пунктов склеивает фрагменты одной строки, которые
    // из-за шрифта стоят на долю пункта выше или ниже соседей.
    const key = Math.round(y / 3);
    if (!lines.has(key)) lines.set(key, []);
    lines.get(key).push({ x, str: item.str });
  }
  return [...lines.entries()]
    .sort((a, b) => b[0] - a[0])                       // сверху вниз
    .map(([, parts]) => parts.sort((a, b) => a.x - b.x)
      .map((p) => p.str).join(" ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .join("\n");
}

async function renderPage(page, number) {
  const base = page.getViewport({ scale: 1 });
  const scale = RENDER_MAX_SIDE / Math.max(base.width, base.height);
  const viewport = page.getViewport({ scale: Math.min(scale, 4) });
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  await page.render({ canvasContext: canvas.getContext("2d", { alpha: false }), viewport }).promise;
  return { number, image_b64: await canvasToBase64(canvas), image_media_type: "image/jpeg" };
}

async function loadImage(file, name) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, RENDER_MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return doc(name, "image", [{
    number: 1, image_b64: await canvasToBase64(canvas), image_media_type: "image/jpeg",
  }]);
}

async function loadXlsx(file, name) {
  const ExcelJS = await import("./vendor-exceljs.js").then((m) => m.load());
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await file.arrayBuffer());
  const pages = [];
  wb.eachSheet((sheet, id) => {
    const rows = [];
    sheet.eachRow((row) => {
      const cells = [];
      row.eachCell({ includeEmpty: true }, (cell) => {
        const v = cell.value;
        cells.push(v === null || v === undefined ? ""
          : typeof v === "object" ? String(v.result ?? v.text ?? "") : String(v));
      });
      if (cells.some((c) => c)) rows.push(cells.join(" | "));
    });
    pages.push({ number: id, text: `# Лист: ${sheet.name}\n${rows.join("\n")}` });
  });
  return doc(name, "xlsx", pages);
}

function canvasToBase64(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error("не удалось сжать страницу"));
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      // dataURL вида "data:image/jpeg;base64,XXXX" — нам нужен только хвост.
      reader.onload = () => resolve(String(reader.result).split(",", 2)[1]);
      reader.readAsDataURL(blob);
    }, "image/jpeg", JPEG_QUALITY);
  });
}

const doc = (filename, kind, pages, error = null) => ({ filename, kind, pages, error });
