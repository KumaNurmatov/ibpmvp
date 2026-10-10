/**
 * Схема извлечения и промпт. Перенос tool/pipeline/schema.py.
 *
 * Модели разрешено вернуть только это. Полей «остаток» и «недоплата» здесь
 * нет и быть не должно: их нельзя извлечь, их можно только посчитать.
 */

export const DOC_TYPES = [
  "order_sheet", "contract", "specification", "payment_order", "bank_statement",
  "invoice", "waybill", "cmr", "packing_list", "tax_invoice", "registry", "other",
];

export const PAYMENT_KINDS = ["предоплата", "постоплата", "доп. постоплата", "перенос", "неизвестно"];

// Все поля — строки, а пустое значение это пустая строка.
//
// Напрашивается `["string", "null"]`, но структурированный вывод считает это
// объединением типов и разрешает их не больше шестнадцати на схему; у нас
// полей вчетверо больше, и API отвечал 400 на каждый документ. Числа
// разбираются в ledger.js (num() умеет и «324 800,00 ₽»), пустая строка там
// же превращается в отсутствие значения — ровно то, чем был null.
const NUM = { type: "string", description: "число как в документе; пусто, если его нет" };
const STR = { type: "string", description: "пусто, если в документе нет" };

const obj = (properties, description) => ({
  type: "object", properties, required: Object.keys(properties),
  additionalProperties: false, ...(description ? { description } : {}),
});

const PAYMENT = obj({
  kind: { type: "string", enum: PAYMENT_KINDS },
  date: { ...STR, description: "ISO YYYY-MM-DD" },
  amount: NUM,
  currency: { ...STR, description: "RUB, KGS, USD — как в документе" },
  contract_no: { ...STR, description: "номер договора из назначения платежа, напр. 666/1-1" },
  purpose: { ...STR, description: "назначение платежа дословно" },
  doc_number: STR,
});

const ORDER_ROW = obj({
  order_no: STR, contract_no: STR, item: STR, ordered_qty: NUM, unit_price: NUM,
  shipped_qty: NUM, shipment_date: STR, stated_order_sum: NUM, stated_shipment_sum: NUM,
});

export const EXTRACTION_SCHEMA = obj({
  doc_type: { type: "string", enum: DOC_TYPES },
  confidence: { type: "number", description: "0..1 — насколько уверенно определён тип" },
  contract_no: { ...STR, description: "номер договора целиком, как в документе: 666/1-1" },
  order_no: { ...STR, description: "внутренний номер заказа, напр. Аи 13.04.26/4" },
  doc_number: { ...STR, description: "номер самого документа: 05/06-1, 291" },
  doc_date: { ...STR, description: "ISO YYYY-MM-DD, пусто если нет" },
  parties: obj({ supplier: STR, buyer: STR }),
  item: obj({ name: STR, color: STR, composition: STR, article: STR, size_range: STR }),
  ordered: obj({ qty: NUM, unit_price: NUM, stated_total: NUM },
    "что заказано по спецификации или листу заказа"),
  shipment: obj({
    date: STR, qty: NUM, places: NUM, weight_gross: NUM, weight_net: NUM,
    stated_amount: NUM, driver: STR, vehicle: STR, vehicle_plate: STR,
    route_from: STR, route_to: STR,
  }, "фактическая отгрузка по накладной / CMR / упаковочному листу"),
  payments: {
    type: "array", items: PAYMENT,
    description: "платёжка — один элемент; выписка — все строки по этому контрагенту",
  },
  orders: {
    type: "array", items: ORDER_ROW,
    description: "только для сводного реестра: по строке на заказ",
  },
  terms: obj({
    prepay_percent: NUM, lead_time_days: NUM,
    penalty_percent_per_day: NUM, postpay_days: NUM,
  }, "условия из договора или спецификации"),
  unreadable: { type: "boolean", description: "документ нечитаем или это не деловой документ" },
  notes: { ...STR, description: "что показалось странным: правки от руки, незаполненные графы" },
});

export const SYSTEM_PROMPT = `\
Ты разбираешь первичные документы швейного производства: заказы, договоры,
спецификации, платёжные поручения, накладные, CMR, инвойсы, счета-фактуры,
банковские выписки и сводные реестры. Документы на русском, встречаются
кыргызские реквизиты, суммы в рублях и сомах.

Твоя задача — только прочитать и разложить по полям. Ничего не вычисляй:
не складывай платежи, не выводи остаток, не пересчитывай сумму как
количество × цену. Если в документе написана итоговая сумма — клади её в
stated_* как написано, даже если она противоречит произведению. Расхождения
находит программа, а не ты: подменив цифру «правильной», ты скроешь ошибку,
ради поиска которой всё и затевалось.

Правила:
- Чего в документе нет — пустая строка "". Не 0, не слово "null", не выдумка.
  Пустая графа в бланке — это именно пустая строка.
- Числа пиши строкой, как в документе: "812", "324800.00". Разделители
  разрядов и знак валюты допустимы, их разберут за тебя.
- Номер договора пиши целиком, как напечатано: «666/1-1», не «666».
- Даты в ISO (YYYY-MM-DD). «13» апреля 2026 г → 2026-04-13.
- Суммы не округляй и не пересчитывай: переписывай ровно как в бумаге.
- Количество мест, вес нетто и брутто не путай между собой.
- ФИО водителя и госномер бери из CMR или путевого листа, из граф 23 и 25.
- В выписке клади в payments только строки по этому контрагенту; номер
  договора ищи в назначении платежа.
- Фото и скриншот разбирай так же, как скан: читай, что видно, остальное null.
- unreadable=true ставь, только если прочитать нечего — тогда остальные поля пустые.
`;

export const userPrefix = (filename) => `\
Разбери документ и верни JSON по схеме. Имя файла: ${filename}
Имя файла — подсказка, но не истина: тип определяй по содержимому.
`;
