"""Схема извлечения: единственное, что модели разрешено отдавать.

Модель только читает документ и раскладывает увиденное по полям. Ни одной
арифметики здесь нет — всё считает ledger.py. Поэтому в схеме нет ни остатка,
ни недоплаты: их нельзя «извлечь», их можно только посчитать.
"""
from __future__ import annotations

DOC_TYPES = [
    "order_sheet",     # заказ/учёт: артикулы, размерный ряд, баркоды
    "contract",        # договор поставки
    "specification",   # спецификация (приложение к договору)
    "payment_order",   # платёжное поручение
    "bank_statement",  # выписка: много платежей разом
    "invoice",         # инвойс
    "waybill",         # товарная / товарно-транспортная накладная
    "cmr",             # международная накладная
    "packing_list",    # упаковочный лист
    "tax_invoice",     # счёт-фактура, ЭСФ
    "registry",        # сводный реестр: много заказов разом
    "other",
]

PAYMENT_KINDS = ["предоплата", "постоплата", "доп. постоплата", "перенос", "неизвестно"]

_NUM = {"type": ["number", "null"]}
_STR = {"type": ["string", "null"]}

_PAYMENT = {
    "type": "object",
    "properties": {
        "kind": {"type": "string", "enum": PAYMENT_KINDS},
        "date": {**_STR, "description": "ISO YYYY-MM-DD"},
        "amount": _NUM,
        "currency": {**_STR, "description": "RUB, KGS, USD — как в документе"},
        "contract_no": {**_STR, "description": "номер договора из назначения платежа, напр. 666/1-1"},
        "purpose": {**_STR, "description": "назначение платежа дословно"},
        "doc_number": _STR,
    },
    "required": ["kind", "date", "amount", "currency", "contract_no", "purpose", "doc_number"],
    "additionalProperties": False,
}

_ORDER_ROW = {
    "type": "object",
    "properties": {
        "order_no": _STR,
        "contract_no": _STR,
        "item": _STR,
        "ordered_qty": _NUM,
        "unit_price": _NUM,
        "shipped_qty": _NUM,
        "shipment_date": _STR,
        "stated_order_sum": _NUM,
        "stated_shipment_sum": _NUM,
    },
    "required": ["order_no", "contract_no", "item", "ordered_qty", "unit_price",
                 "shipped_qty", "shipment_date", "stated_order_sum", "stated_shipment_sum"],
    "additionalProperties": False,
}

EXTRACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "doc_type": {"type": "string", "enum": DOC_TYPES},
        "confidence": {"type": "number", "description": "0..1 — насколько уверенно определён тип"},
        "contract_no": {**_STR, "description": "номер договора целиком, как в документе: 666/1-1"},
        "order_no": {**_STR, "description": "внутренний номер заказа, напр. Аи 13.04.26/4"},
        "doc_number": {**_STR, "description": "номер самого документа: 05/06-1, 291"},
        "doc_date": {**_STR, "description": "ISO YYYY-MM-DD"},
        "parties": {
            "type": "object",
            "properties": {"supplier": _STR, "buyer": _STR},
            "required": ["supplier", "buyer"],
            "additionalProperties": False,
        },
        "item": {
            "type": "object",
            "properties": {
                "name": _STR, "color": _STR, "composition": _STR,
                "article": _STR, "size_range": _STR,
            },
            "required": ["name", "color", "composition", "article", "size_range"],
            "additionalProperties": False,
        },
        "ordered": {
            "type": "object",
            "properties": {"qty": _NUM, "unit_price": _NUM, "stated_total": _NUM},
            "required": ["qty", "unit_price", "stated_total"],
            "additionalProperties": False,
            "description": "что заказано по спецификации или листу заказа",
        },
        "shipment": {
            "type": "object",
            "properties": {
                "date": _STR, "qty": _NUM, "places": _NUM,
                "weight_gross": _NUM, "weight_net": _NUM, "stated_amount": _NUM,
                "driver": _STR, "vehicle": _STR, "vehicle_plate": _STR,
                "route_from": _STR, "route_to": _STR,
            },
            "required": ["date", "qty", "places", "weight_gross", "weight_net",
                         "stated_amount", "driver", "vehicle", "vehicle_plate",
                         "route_from", "route_to"],
            "additionalProperties": False,
            "description": "фактическая отгрузка по накладной / CMR / упаковочному листу",
        },
        "payments": {"type": "array", "items": _PAYMENT,
                     "description": "платёжка — один элемент; выписка — все строки, относящиеся к этому контрагенту"},
        "orders": {"type": "array", "items": _ORDER_ROW,
                   "description": "только для сводного реестра: по строке на заказ"},
        "terms": {
            "type": "object",
            "properties": {
                "prepay_percent": _NUM,
                "lead_time_days": _NUM,
                "penalty_percent_per_day": _NUM,
                "postpay_days": _NUM,
            },
            "required": ["prepay_percent", "lead_time_days", "penalty_percent_per_day", "postpay_days"],
            "additionalProperties": False,
            "description": "условия из договора или спецификации",
        },
        "unreadable": {"type": "boolean", "description": "документ нечитаем или это не деловой документ"},
        "notes": {**_STR, "description": "что показалось странным: правки от руки, незаполненные графы, печати"},
    },
    "required": ["doc_type", "confidence", "contract_no", "order_no", "doc_number",
                 "doc_date", "parties", "item", "ordered", "shipment", "payments",
                 "orders", "terms", "unreadable", "notes"],
    "additionalProperties": False,
}

SYSTEM_PROMPT = """\
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
- Чего в документе нет — null. Пустая графа это null, а не 0 и не выдумка.
- Номер договора пиши целиком, как напечатано: «666/1-1», не «666».
- Даты в ISO (YYYY-MM-DD). «13» апреля 2026 г → 2026-04-13.
- Суммы — числом, без пробелов и знака валюты: «324 800,00 ₽» → 324800.0.
- Количество мест, вес нетто и брутто не путай между собой.
- ФИО водителя и госномер бери из CMR или путевого листа, из граф 23 и 25.
- В выписке клади в payments только строки по этому контрагенту; номер
  договора ищи в назначении платежа.
- Фото и скриншот разбирай так же, как скан: читай, что видно, остальное null.
- unreadable=true ставь, только если прочитать нечего — тогда остальные поля null.
"""

USER_PREFIX = """\
Разбери документ и верни JSON по схеме. Имя файла: {filename}
Имя файла — подсказка, но не истина: тип определяй по содержимому.
"""
