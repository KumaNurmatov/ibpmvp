/**
 * Маленький сборщик PDF — ровно столько, сколько нужно бланку: текст двумя
 * начертаниями, линии и прямоугольники.
 *
 * Своё, а не библиотека с CDN, по той же причине, что и остальное здесь:
 * страница работает без интернета и без чужих скриптов, а кириллица в PDF
 * требует вшитого шрифта в любом случае — значит, библиотека избавила бы
 * только от сборки файла, а это полторы сотни строк.
 *
 * Шрифт вшивается как CIDFontType2 с Identity-H: текст пишется номерами
 * глифов, поэтому к TTF нужны метрики (lib/../assets/blank/metrics.json) —
 * их готовит tool/build_blank_font.py.
 */

const PT_PER_MM = 72 / 25.4;
export const mm = (v) => v * PT_PER_MM;

/** Загрузить начертания один раз на страницу. */
export async function loadFonts(base = "./assets/blank") {
  const metrics = await (await fetch(`${base}/metrics.json`)).json();
  const out = {};
  for (const [style, info] of Object.entries(metrics)) {
    const bytes = new Uint8Array(await (await fetch(`${base}/${info.file}`)).arrayBuffer());
    out[style] = { ...info, bytes };
  }
  return out;
}

/**
 * Новый документ. Размер страницы в пунктах; начало координат — левый
 * нижний угол, как принято в PDF, но y в наших методах считается сверху:
 * так ближе к тому, как размечают бланк.
 */
export function pdf({ width, height, fonts }) {
  const ops = [];
  const used = { regular: new Set(), bold: new Set() };

  const esc = (v) => v.toFixed(2);

  const api = {
    /** Текст. x, y — левый край и базовая линия, считая сверху. */
    text(value, x, y, { size = 10, style = "regular", color = [0, 0, 0] } = {}) {
      const font = fonts[style];
      const glyphs = [];
      for (const ch of String(value)) {
        const code = ch.codePointAt(0);
        const g = font.glyphs[code] || font.glyphs[32];
        glyphs.push(g[0]);
        used[style].add(code);
      }
      if (!glyphs.length) return api;
      const hex = glyphs.map((g) => g.toString(16).padStart(4, "0")).join("");
      ops.push(`q ${color.join(" ")} rg BT /${style === "bold" ? "F2" : "F1"} ${esc(size)} Tf ` +
               `1 0 0 1 ${esc(x)} ${esc(height - y)} Tm <${hex}> Tj ET Q`);
      return api;
    },

    /** Ширина строки в пунктах — чтобы класть текст по центру или справа. */
    widthOf(value, { size = 10, style = "regular" } = {}) {
      const font = fonts[style];
      let total = 0;
      for (const ch of String(value)) {
        const g = font.glyphs[ch.codePointAt(0)] || font.glyphs[32];
        total += g[1];
      }
      return (total * size) / 1000;
    },

    line(x1, y1, x2, y2, { width = 0.5, color = [0, 0, 0], dash = null } = {}) {
      ops.push(`q ${color.join(" ")} RG ${esc(width)} w ${dash ? `[${dash.join(" ")}] 0 d` : ""} ` +
               `${esc(x1)} ${esc(height - y1)} m ${esc(x2)} ${esc(height - y2)} l S Q`);
      return api;
    },

    rect(x, y, w, h, { width = 0.5, color = [0, 0, 0] } = {}) {
      ops.push(`q ${color.join(" ")} RG ${esc(width)} w ` +
               `${esc(x)} ${esc(height - y - h)} ${esc(w)} ${esc(h)} re S Q`);
      return api;
    },

    /** Собрать файл. */
    bytes() {
      return build({ width, height, fonts, used, content: ops.join("\n") });
    },
  };
  return api;
}

// ── сборка файла ────────────────────────────────────────────────────────

function build({ width, height, fonts, used, content }) {
  const objects = [];                       // тела объектов по порядку
  const add = (body) => objects.push(body) && objects.length;   // → номер

  const catalog = add(null);                // заполним позже, номера нужны вперёд
  const pages = add(null);
  const page = add(null);
  const stream = add(null);

  const fontRefs = {};
  for (const style of ["regular", "bold"]) {
    const f = fonts[style];
    const codes = [...used[style]].sort((a, b) => a - b);
    const file = add(null);
    const descriptor = add(null);
    const descendant = add(null);
    const toUnicode = add(null);
    const type0 = add(null);

    objects[file - 1] = raw(`<</Length ${f.bytes.length}/Length1 ${f.bytes.length}>>`, f.bytes);
    objects[descriptor - 1] = text(`<</Type/FontDescriptor/FontName/Blank${style}` +
      `/Flags 32/FontBBox[${f.bbox.join(" ")}]/ItalicAngle 0/Ascent ${f.ascent}` +
      `/Descent ${f.descent}/CapHeight ${f.capHeight}/StemV 80/FontFile2 ${file} 0 R>>`);
    objects[descendant - 1] = text(`<</Type/Font/Subtype/CIDFontType2/BaseFont/Blank${style}` +
      `/CIDSystemInfo<</Registry(Adobe)/Ordering(Identity)/Supplement 0>>` +
      `/FontDescriptor ${descriptor} 0 R/DW 1000/W[${widths(f, codes)}]/CIDToGIDMap/Identity>>`);
    objects[toUnicode - 1] = stream_(cmap(f, codes));
    objects[type0 - 1] = text(`<</Type/Font/Subtype/Type0/BaseFont/Blank${style}` +
      `/Encoding/Identity-H/DescendantFonts[${descendant} 0 R]/ToUnicode ${toUnicode} 0 R>>`);
    fontRefs[style === "bold" ? "F2" : "F1"] = type0;
  }

  objects[catalog - 1] = text(`<</Type/Catalog/Pages ${pages} 0 R>>`);
  objects[pages - 1] = text(`<</Type/Pages/Kids[${page} 0 R]/Count 1>>`);
  objects[page - 1] = text(`<</Type/Page/Parent ${pages} 0 R/MediaBox[0 0 ${width.toFixed(2)} ` +
    `${height.toFixed(2)}]/Resources<</Font<<` +
    Object.entries(fontRefs).map(([name, id]) => `/${name} ${id} 0 R`).join("") +
    `>>>>/Contents ${stream} 0 R>>`);
  objects[stream - 1] = stream_(content);

  return assemble(objects);
}

const encoder = new TextEncoder();
const text = (body) => ({ head: body, data: null });
const raw = (head, data) => ({ head, data });
const stream_ = (body) => {
  const data = encoder.encode(body);
  return { head: `<</Length ${data.length}>>`, data };
};

/** Массив ширин /W: [код ширина код ширина …] по номерам глифов. */
function widths(font, codes) {
  return codes.map((code) => {
    const [gid, w] = font.glyphs[code] || font.glyphs[32];
    return `${gid} [${w}]`;
  }).join(" ");
}

/** ToUnicode: чтобы текст из бланка копировался и искался, а не был картинкой. */
function cmap(font, codes) {
  const rows = codes.map((code) => {
    const [gid] = font.glyphs[code] || font.glyphs[32];
    return `<${gid.toString(16).padStart(4, "0")}> <${code.toString(16).padStart(4, "0")}>`;
  });
  const chunks = [];
  for (let i = 0; i < rows.length; i += 100) {
    const part = rows.slice(i, i + 100);
    chunks.push(`${part.length} beginbfchar\n${part.join("\n")}\nendbfchar`);
  }
  return `/CIDInit /ProcSet findresource begin
12 dict begin begincmap
/CIDSystemInfo <</Registry (Adobe)/Ordering (UCS)/Supplement 0>> def
/CMapName /Adobe-Identity-UCS def /CMapType 2 def
1 begincodespacerange <0000> <FFFF> endcodespacerange
${chunks.join("\n")}
endcmap CMapName currentdict /CMap defineresource pop end end`;
}

/** Склейка: тела объектов, таблица xref по смещениям, трейлер. */
function assemble(objects) {
  const parts = [];
  let length = 0;
  const push = (chunk) => {
    const bytes = chunk instanceof Uint8Array ? chunk : encoder.encode(chunk);
    parts.push(bytes);
    length += bytes.length;
  };

  push("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(length);
    push(`${i + 1} 0 obj\n${obj.head}\n`);
    if (obj.data) {
      push("stream\n");
      push(obj.data);
      push("\nendstream\n");
    }
    push("endobj\n");
  });

  const xref = length;
  let table = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) table += `${String(offset).padStart(10, "0")} 00000 n \n`;
  push(table);
  push(`trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let at = 0;
  for (const part of parts) { out.set(part, at); at += part.length; }
  return out;
}
