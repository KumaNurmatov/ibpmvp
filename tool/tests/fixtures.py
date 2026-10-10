"""Разбор пяти настоящих документов заказа Аи 13.04.26/4 (договор 666/1-1).

Это то, что модель должна вернуть по каждому файлу из папки Google Drive.
Поля переписаны с самих бумаг, включая их несообразности: в листе заказа
изделие названо иначе, чем в спецификации, а в CMR проставлен водитель,
которого нет в ручном реестре. Фикстуры дают прогонять всё, что идёт после
распознавания, не обращаясь к модели.
"""


def _blank(**over):
    base = {
        "doc_type": "other", "confidence": 0.9, "contract_no": None, "order_no": None,
        "doc_number": None, "doc_date": None,
        "parties": {"supplier": None, "buyer": None},
        "item": {"name": None, "color": None, "composition": None,
                 "article": None, "size_range": None},
        "ordered": {"qty": None, "unit_price": None, "stated_total": None},
        "shipment": {k: None for k in ("date", "qty", "places", "weight_gross", "weight_net",
                                       "stated_amount", "driver", "vehicle", "vehicle_plate",
                                       "route_from", "route_to")},
        "payments": [], "orders": [],
        "terms": {"prepay_percent": None, "lead_time_days": None,
                  "penalty_percent_per_day": None, "postpay_days": None},
        "unreadable": False, "notes": None,
        "_source_file": "?", "_source_kind": "pdf_text",
    }
    for key, val in over.items():
        if isinstance(val, dict) and isinstance(base.get(key), dict):
            base[key] = {**base[key], **val}
        else:
            base[key] = val
    return base


ORDER_SHEET = _blank(
    doc_type="order_sheet", order_no="Аи 13.04.26/4", doc_date="2026-04-13",
    item={"name": "Костюм летний с шортами оливковый сингапур",
          "color": "оливковый", "composition": "хлопок 80%, вискоза 15%, эластан 5%",
          "article": "КОСТЛЕТШ01сингапур/олива", "size_range": "38-40…54-56"},
    ordered={"qty": 750, "unit_price": None, "stated_total": None},
    contract_no=None,
    _source_file="Костюм_руб_с_кор_рук_и_шорт_Учет_Бишкек_NEW_Айзада_Az.pdf",
    notes="5 ростовок по 150 шт, пять штрихкодов",
)

SPECIFICATION = _blank(
    doc_type="specification", contract_no="666/1-1", doc_date="2026-04-13", doc_number="1",
    parties={"supplier": 'ОсОО "Мокси Кло"', "buyer": 'ООО «Айлукхоум»'},
    item={"name": "Костюм летний с шортами сингапур", "color": "оливковый",
          "composition": "хлопок 80%, вискоза 15%, эластан 5%", "size_range": "38-40…54-56"},
    ordered={"qty": 750, "unit_price": 400.0, "stated_total": 300000.0},
    terms={"prepay_percent": 50, "lead_time_days": 7,
           "penalty_percent_per_day": 1.0, "postpay_days": 20},
    _source_file="спец дог 666 подписанная айзада.pdf",
)

CONTRACT = _blank(
    doc_type="contract", contract_no="666/1-1", doc_date="2026-04-13",
    parties={"supplier": 'ОсОО "Мокси Кло"', "buyer": 'ООО «Айлукхоум»'},
    terms={"prepay_percent": 50, "lead_time_days": 7,
           "penalty_percent_per_day": 0.01, "postpay_days": 20},
    _source_file="договор 666 подписанный айзада.pdf",
    notes="п.7.1 говорит 0,01% в день, спецификация — 1% в день",
)

PAYMENT = _blank(
    doc_type="payment_order", contract_no="666/1-1", doc_number="291", doc_date="2026-04-16",
    payments=[{"kind": "предоплата", "date": "2026-04-16", "amount": 150000.0,
               "currency": "RUB", "contract_no": "666/1-1",
               "purpose": "дог.666/1-1 от 13.04.2026, по спец.1 от 13.04.26, за текст.изд.(костюм)",
               "doc_number": "291"}],
    _source_file="предоплата 666.pdf",
)

SHIPMENT = _blank(
    doc_type="waybill", contract_no="666/1-1", doc_number="05/06-1", doc_date="2026-06-05",
    parties={"supplier": 'ОсОО "Мокси Кло"', "buyer": 'ООО «Айлукхоум»'},
    item={"name": "Костюм оливковый р.38-56"},
    shipment={"date": "2026-06-05", "qty": 812, "places": 8, "weight_gross": 282.0,
              "weight_net": 280.4, "stated_amount": 324800.0,
              "driver": "Ташыкулов Элмир Койчубаевич", "vehicle": "MERCEDES-BENZ SPRINTER 413",
              "vehicle_plate": "04KG227AON", "route_from": "Бишкек", "route_to": "Иваново"},
    ordered={"qty": None, "unit_price": 400.0, "stated_total": None},
    _source_file="отправка 666.pdf",
    _source_kind="pdf_scan",
    notes="графа 24 CMR (груз получен) не заполнена",
)

ORDER_666 = [ORDER_SHEET, SPECIFICATION, CONTRACT, PAYMENT, SHIPMENT]

# Постоплата пришла отдельной платёжкой; в папке её нет, но в реестре она учтена.
POSTPAY = _blank(
    doc_type="payment_order", contract_no="666/1-1", doc_number="—", doc_date="2026-06-25",
    payments=[{"kind": "постоплата", "date": "2026-06-25", "amount": 174800.0,
               "currency": "RUB", "contract_no": "666/1-1",
               "purpose": "постоплата по дог.666/1-1", "doc_number": None}],
    _source_file="постоплата 666.pdf",
)

# Выписка на два заказа сразу — проверяет разнесение платежей по договорам.
STATEMENT = _blank(
    doc_type="bank_statement", contract_no=None, doc_date="2026-06-30",
    payments=[
        {"kind": "предоплата", "date": "2026-05-11", "amount": 1114410.0, "currency": "RUB",
         "contract_no": "706/1-1", "purpose": "дог.706/1-1 предоплата", "doc_number": "512"},
        {"kind": "постоплата", "date": "2026-07-02", "amount": 384471.45, "currency": "RUB",
         "contract_no": "706/1-1", "purpose": "дог.706/1-1 постоплата", "doc_number": "688"},
        {"kind": "постоплата", "date": "2026-06-25", "amount": 174800.0, "currency": "RUB",
         "contract_no": "666/1-1", "purpose": "дог.666/1-1 постоплата", "doc_number": "640"},
    ],
    _source_file="выписка июнь.pdf",
)

# Строка сводного реестра с ошибочной суммой отправки — та самая, что нашлась у 662.
REGISTRY_662 = _blank(
    doc_type="registry", doc_date="2026-08-31",
    orders=[{"order_no": "Аи 13.04.26/2", "contract_no": "662/1-1", "item": "двойные шорты",
             "ordered_qty": 1000, "unit_price": 480.0, "shipped_qty": 812,
             "shipment_date": "2026-06-05", "stated_order_sum": 480000.0,
             "stated_shipment_sum": 478080.0}],
    _source_file="Реестр постоплат январь-август 2026.docx",
    _source_kind="docx",
)
