/**
 * Разбор пяти настоящих документов заказа Аи 13.04.26/4 (договор 666/1-1).
 *
 * Перенос tool/tests/fixtures.py один в один, включая несообразности самих
 * бумаг: в листе заказа изделие названо иначе, чем в спецификации, а водитель
 * из CMR в ручном реестре приписан другому заказу.
 */

function blank(over = {}) {
  const base = {
    doc_type: "other", confidence: 0.9, contract_no: null, order_no: null,
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
    terms: { prepay_percent: null, lead_time_days: null,
             penalty_percent_per_day: null, postpay_days: null },
    unreadable: false, notes: null,
    _source_file: "?", _source_kind: "pdf_text",
  };
  const out = { ...base };
  for (const [key, val] of Object.entries(over)) {
    out[key] = (val && typeof val === "object" && !Array.isArray(val) && base[key] &&
                typeof base[key] === "object" && !Array.isArray(base[key]))
      ? { ...base[key], ...val } : val;
  }
  return out;
}

export const ORDER_SHEET = blank({
  doc_type: "order_sheet", order_no: "Аи 13.04.26/4", doc_date: "2026-04-13",
  item: { name: "Костюм летний с шортами оливковый сингапур", color: "оливковый",
          composition: "хлопок 80%, вискоза 15%, эластан 5%",
          article: "КОСТЛЕТШ01сингапур/олива", size_range: "38-40…54-56" },
  ordered: { qty: 750, unit_price: null, stated_total: null },
  _source_file: "Костюм_руб_с_кор_рук_и_шорт_Учет_Бишкек_NEW_Айзада_Az.pdf",
  notes: "5 ростовок по 150 шт, пять штрихкодов",
});

export const SPECIFICATION = blank({
  doc_type: "specification", contract_no: "666/1-1", doc_date: "2026-04-13", doc_number: "1",
  parties: { supplier: 'ОсОО "Мокси Кло"', buyer: "ООО «Айлукхоум»" },
  item: { name: "Костюм летний с шортами сингапур", color: "оливковый",
          composition: "хлопок 80%, вискоза 15%, эластан 5%", size_range: "38-40…54-56" },
  ordered: { qty: 750, unit_price: 400.0, stated_total: 300000.0 },
  terms: { prepay_percent: 50, lead_time_days: 7, penalty_percent_per_day: 1.0, postpay_days: 20 },
  _source_file: "спец дог 666 подписанная айзада.pdf",
});

export const CONTRACT = blank({
  doc_type: "contract", contract_no: "666/1-1", doc_date: "2026-04-13",
  parties: { supplier: 'ОсОО "Мокси Кло"', buyer: "ООО «Айлукхоум»" },
  terms: { prepay_percent: 50, lead_time_days: 7, penalty_percent_per_day: 0.01, postpay_days: 20 },
  _source_file: "договор 666 подписанный айзада.pdf",
  notes: "п.7.1 говорит 0,01% в день, спецификация — 1% в день",
});

export const PAYMENT = blank({
  doc_type: "payment_order", contract_no: "666/1-1", doc_number: "291", doc_date: "2026-04-16",
  payments: [{ kind: "предоплата", date: "2026-04-16", amount: 150000.0, currency: "RUB",
               contract_no: "666/1-1",
               purpose: "дог.666/1-1 от 13.04.2026, по спец.1 от 13.04.26, за текст.изд.(костюм)",
               doc_number: "291" }],
  _source_file: "предоплата 666.pdf",
});

export const SHIPMENT = blank({
  doc_type: "waybill", contract_no: "666/1-1", doc_number: "05/06-1", doc_date: "2026-06-05",
  parties: { supplier: 'ОсОО "Мокси Кло"', buyer: "ООО «Айлукхоум»" },
  item: { name: "Костюм оливковый р.38-56" },
  shipment: { date: "2026-06-05", qty: 812, places: 8, weight_gross: 282.0, weight_net: 280.4,
              stated_amount: 324800.0, driver: "Ташыкулов Элмир Койчубаевич",
              vehicle: "MERCEDES-BENZ SPRINTER 413", vehicle_plate: "04KG227AON",
              route_from: "Бишкек", route_to: "Иваново" },
  ordered: { qty: null, unit_price: 400.0, stated_total: null },
  _source_file: "отправка 666.pdf", _source_kind: "pdf_scan",
  notes: "графа 24 CMR (груз получен) не заполнена",
});

export const ORDER_666 = [ORDER_SHEET, SPECIFICATION, CONTRACT, PAYMENT, SHIPMENT];

export const POSTPAY = blank({
  doc_type: "payment_order", contract_no: "666/1-1", doc_number: "—", doc_date: "2026-06-25",
  payments: [{ kind: "постоплата", date: "2026-06-25", amount: 174800.0, currency: "RUB",
               contract_no: "666/1-1", purpose: "постоплата по дог.666/1-1", doc_number: null }],
  _source_file: "постоплата 666.pdf",
});

export const STATEMENT = blank({
  doc_type: "bank_statement", contract_no: null, doc_date: "2026-06-30",
  payments: [
    { kind: "предоплата", date: "2026-05-11", amount: 1114410.0, currency: "RUB",
      contract_no: "706/1-1", purpose: "дог.706/1-1 предоплата", doc_number: "512" },
    { kind: "постоплата", date: "2026-07-02", amount: 384471.45, currency: "RUB",
      contract_no: "706/1-1", purpose: "дог.706/1-1 постоплата", doc_number: "688" },
    { kind: "постоплата", date: "2026-06-25", amount: 174800.0, currency: "RUB",
      contract_no: "666/1-1", purpose: "дог.666/1-1 постоплата", doc_number: "640" },
  ],
  _source_file: "выписка июнь.pdf",
});

export const REGISTRY_662 = blank({
  doc_type: "registry", doc_date: "2026-08-31",
  orders: [{ order_no: "Аи 13.04.26/2", contract_no: "662/1-1", item: "двойные шорты",
             ordered_qty: 1000, unit_price: 480.0, shipped_qty: 812,
             shipment_date: "2026-06-05", stated_order_sum: 480000.0,
             stated_shipment_sum: 478080.0 }],
  _source_file: "Реестр постоплат январь-август 2026.docx", _source_kind: "docx",
});
