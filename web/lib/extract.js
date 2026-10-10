/**
 * Вызов модели прямо из браузера.
 *
 * Ключ хранится в этом браузере и уходит только на api.anthropic.com; ни один
 * документ при этом не попадает ни на какой наш сервер — его попросту нет.
 * Заголовок anthropic-dangerous-direct-browser-access включает CORS; без него
 * запрос из браузера отлетает с 401.
 */
import { EXTRACTION_SCHEMA, SYSTEM_PROMPT, userPrefix } from "./schema.js";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
export const DEFAULT_MODEL = "claude-opus-5-5";
const MAX_TOKENS = 16000;
const MAX_TEXT_CHARS = 120_000;
// Лимит запроса — 32 МБ; держим запас и режем по границам страниц.
const MAX_IMAGE_B64_CHARS = 20_000_000;

export class ExtractionError extends Error {}

export class Extractor {
  /**
   * @param {string} apiKey ключ пользователя
   * @param {{model?: string, fetchImpl?: Function}} [options] fetchImpl — для тестов
   */
  constructor(apiKey, { model = DEFAULT_MODEL, fetchImpl = globalThis.fetch.bind(globalThis) } = {}) {
    this.apiKey = apiKey;
    this.model = model;
    this.fetchImpl = fetchImpl;
  }

  async extract(doc) {
    if (doc.error && !doc.pages.length) return empty(doc, doc.error);
    const content = buildContent(doc);
    if (content.length < 2) return empty(doc, "в файле нечего разбирать");

    const body = {
      model: this.model,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
      output_config: {
        effort: "high",
        format: { type: "json_schema", schema: EXTRACTION_SCHEMA },
      },
    };

    let response;
    try {
      response = await this.fetchImpl(ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": this.apiKey,
          "anthropic-version": API_VERSION,
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new ExtractionError(`сеть недоступна: ${err.message}`);
    }

    if (!response.ok) throw new ExtractionError(await describeFailure(response));

    const data = await response.json();
    if (data.stop_reason === "refusal") throw new ExtractionError("модель отказалась разбирать документ");
    if (data.stop_reason === "max_tokens") throw new ExtractionError("ответ не поместился в лимит токенов");

    const text = (data.content || []).find((b) => b.type === "text")?.text;
    if (!text) throw new ExtractionError("пустой ответ модели");

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new ExtractionError("модель вернула не JSON");
    }
    parsed._source_file = doc.filename;
    parsed._source_kind = doc.kind;
    parsed._usage = data.usage
      ? { input: data.usage.input_tokens, output: data.usage.output_tokens }
      : null;
    return parsed;
  }
}

async function describeFailure(response) {
  let detail = "";
  try {
    const body = await response.json();
    detail = body?.error?.message || "";
  } catch { /* тело может быть и не JSON */ }
  const known = {
    401: "ключ не принят — проверьте его",
    403: "ключу не хватает прав",
    429: "лимит запросов исчерпан, попробуйте позже",
    529: "сервис перегружен, попробуйте позже",
  };
  const head = known[response.status] || `API вернул ${response.status}`;
  return detail ? `${head}: ${detail}` : head;
}

function buildContent(doc) {
  const content = [{ type: "text", text: userPrefix(doc.filename) }];
  let imageChars = 0;
  let textChars = 0;
  for (const page of doc.pages) {
    if (page.image_b64) {
      if (imageChars + page.image_b64.length > MAX_IMAGE_B64_CHARS) {
        content.push({ type: "text", text: `[страницы с ${page.number} не поместились в запрос]` });
        break;
      }
      imageChars += page.image_b64.length;
      content.push({
        type: "image",
        source: { type: "base64", media_type: page.image_media_type, data: page.image_b64 },
      });
    } else if (page.text && page.text.trim()) {
      const chunk = `--- страница ${page.number} ---\n${page.text}`;
      if (textChars + chunk.length > MAX_TEXT_CHARS) {
        const room = MAX_TEXT_CHARS - textChars;
        if (room > 500) content.push({ type: "text", text: chunk.slice(0, room) + "\n[…документ обрезан…]" });
        break;
      }
      textChars += chunk.length;
      content.push({ type: "text", text: chunk });
    }
  }
  return content;
}

/** Заглушка той же формы, что ответ модели: дальше по конвейеру не нужно
 *  проверять null на каждом шаге. */
function empty(doc, note) {
  return {
    doc_type: "other", confidence: 0, contract_no: null, order_no: null,
    doc_number: null, doc_date: null,
    parties: { supplier: null, buyer: null },
    item: { name: null, color: null, composition: null, article: null, size_range: null },
    ordered: { qty: null, unit_price: null, stated_total: null },
    shipment: {
      date: null, qty: null, places: null, weight_gross: null, weight_net: null,
      stated_amount: null, driver: null, vehicle: null, vehicle_plate: null,
      route_from: null, route_to: null,
    },
    payments: [], orders: [],
    terms: { prepay_percent: null, lead_time_days: null, penalty_percent_per_day: null, postpay_days: null },
    unreadable: true, notes: note,
    _source_file: doc.filename, _source_kind: doc.kind,
  };
}
