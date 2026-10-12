"""Проверки чтения документов и выписки.

Разбор держится на нескольких узких местах, где легко прочитать соседнее
число вместо нужного: в выписке слева от суммы стоит шестнадцатизначный
счёт, в CMR рядом с весом — десятизначный код ТН ВЭД, а десятизначный ИНН
покупателя выглядит точно так же, как этот код. Каждое из этих мест уже
один раз дало неверную цифру, поэтому проверяется именно оно.
"""
from __future__ import annotations

import importlib.util
import sys
from pathlib import Path

TOOL = Path(__file__).resolve().parents[1]


def module(name: str):
    """Импортеры лежат скриптами рядом, не пакетом: грузим по пути."""
    spec = importlib.util.spec_from_file_location(name, TOOL / f"{name}.py")
    mod = importlib.util.module_from_spec(spec)
    sys.modules.setdefault(name, mod)
    spec.loader.exec_module(mod)
    return mod


read_docs = module("read_docs")
import_docs = module("import_docs")
import_payments = module("import_payments")
import_carriage = module("import_carriage")


# ── CMR и упаковочный лист ────────────────────────────────────────────────

CMR = ("7 Количествомест 8 Родупаковки 9 Наименованиегруза 10 Статист. № 11 Вес брутто, кг "
       "42 Мешки Костюм 6104130000 1230 кг Класс Цифра Буква")


def test_строка_груза_разбирается_целиком():
    found = read_docs.cmr_line(CMR)
    assert found == {"places": 42, "item": "Костюм", "tnved": "6104130000", "weight": 1230}


def test_код_тн_вэд_не_путается_с_инн():
    # ИНН покупателя тоже десять цифр и стоит выше по документу.
    flat = "Получатель ООО «Айлукхоум» ИНН 3702223885 " + CMR
    assert read_docs.cmr_line(flat)["tnved"] == "6104130000"


def test_вес_не_слипается_с_кодом():
    # Было: «6104130000 1230» читалось одним числом 61041300001230.
    assert read_docs.cmr_line(CMR)["weight"] == 1230


def test_итог_упаковочного_листа_с_суммой_и_без():
    with_sum = read_docs.packing_totals("ИТОГО 2 462,00 1 083 280,00 586,90 589,90 Директор")
    assert with_sum == {"qty": 2462, "sum": 1083280, "net": 586.9, "gross": 589.9}

    without = read_docs.packing_totals("ИТОГО 1 244,00 1221,60 1230,00 Директор")
    assert without == {"qty": 1244, "sum": None, "net": 1221.6, "gross": 1230}


def test_договор_и_его_дата_словами():
    flat = "К договору поставки №942/1-1 от «13» августа 2026 г"
    assert read_docs.contract(flat) == "942/1-1"
    assert read_docs.contract_date(flat) == "2026-08-13"


# ── бланк «Учет» ──────────────────────────────────────────────────────────

ORDER_DOC = ("ОсОО Мокси Кло ЗАКАЗ № 1041 от 10.09.2026 Заказчик ОБЩЕСТВО "
             "№ Код Артикул Изображение Наименование товара Цена шт Кол-во Ед. изм. Сумма "
             "РЖТВИЛ01клетка/зел_кор/44 1 Рубашка в клетку оверсайз теплая 440,00 40 17600,00 "
             "РЖТВИЛ01клетка/зел_кор/46 2 Рубашка в клетку оверсайз теплая 440,00 40 17600,00 "
             "РЖТВИЛ01клетка/зел_кор/48 3 Рубашка в клетку оверсайз теплая 440,00 40 17600,00 "
             "Итого: 2105 926200,00")


def test_бланк_учета_узнаётся_по_шапке():
    assert read_docs.is_order_doc(ORDER_DOC)
    assert not read_docs.is_order_doc("Упаковочный лист №07/09-3 ЗАКАЗ № 1")


def test_из_бланка_берутся_заказ_артикул_и_цена():
    found = read_docs.read_order(ORDER_DOC)
    assert found["order_no"] == "1041"
    assert found["order_date"] == "2026-09-10"
    assert found["item_article"] == "РЖТВИЛ01"
    assert found["ordered_qty"] == 2105
    assert found["order_sum"] == 926200
    # Цена считается из итога: в колонке её ломает перенос строк.
    assert found["unit_price"] == 440


# ── перенос в карточки ────────────────────────────────────────────────────

def order(**over):
    base = {"id": "942", "contract_no": "942/1-1", "item": "Спортивный костюм",
            "tnved": "", "unit_price": None, "note": "",
            "shipment": {"date": "", "qty": None, "places": None,
                         "weight_gross": None, "driver": ""}}
    return {**base, **over}


def test_пустое_заполняется_заполненное_нет():
    card = order()
    filled, conflicts = [], []
    import_docs.apply(card, {"kind": "shipping", "file": "942.pdf", "tnved": "6104130000",
                             "item": "Костюм", "places": 42, "weight_gross": 1230}, filled, conflicts)
    assert card["tnved"] == "6104130000"
    assert card["shipment"]["places"] == 42
    # Название в CMR грубее реестрового — спорить с ним оно не должно.
    assert card["item"] == "Спортивный костюм"
    assert conflicts == []


def test_расхождение_не_переписывает_а_показывается():
    card = order(shipment={"date": "", "qty": None, "places": 40,
                           "weight_gross": None, "driver": ""})
    filled, conflicts = [], []
    import_docs.apply(card, {"kind": "shipping", "file": "942.pdf", "places": 42},
                      filled, conflicts)
    assert card["shipment"]["places"] == 40
    assert len(conflicts) == 1 and "42" in conflicts[0]


def test_номер_договора_берётся_из_имени_файла_при_расхождении():
    doc = {"contract_no": "1002", "file": "учет_1003_Айзада.pdf"}
    assert import_docs.contract_key(doc) == "1003"
    # А когда они согласны, спорить не о чем.
    assert import_docs.contract_key({"contract_no": "1005", "file": "учет 1005.pdf"}) == "1005"


# ── выписка ───────────────────────────────────────────────────────────────

LINE = ("                     1150000010101834                        323 672,00 "
        "Перевод СПФС, Отпр. ООО \"АЙЛУКХОУМ\"")


def test_сумма_не_прихватывает_счёт_корреспондента():
    # Было: из «1150000010101834 323 672,00» читалось число в триллионах.
    assert import_carriage.AMOUNT.search(LINE).group(1) == "323 672,00"
    assert import_payments.AMOUNT.search(LINE).group(1) == "323 672,00"


def test_оплата_из_выписки_проставляет_дату_своей_строке():
    card = {"contract_no": "666/1-1", "shipment": {"date": "2026-06-05"},
            "payments": [{"kind": "предоплата", "date": "", "amount": 150000,
                          "doc_number": "", "purpose": ""}]}
    dated, added, missing = [], [], []
    import_payments.match(card, [{"date": "2026-04-17", "amount": 150000,
                                  "doc_number": "291", "purpose": "дог.666/1-1"}],
                          dated, added, missing)
    assert card["payments"][0]["date"] == "2026-04-17"
    assert card["payments"][0]["doc_number"] == "291"
    assert len(dated) == 1 and not added and not missing


def test_оплаты_которой_нет_в_реестре_добавляется_строка():
    card = {"contract_no": "666/1-1", "shipment": {"date": "2026-06-05"}, "payments": []}
    dated, added, missing = [], [], []
    import_payments.match(card, [{"date": "2026-07-02", "amount": 174800,
                                  "doc_number": "360/1", "purpose": ""}],
                          dated, added, missing)
    assert len(card["payments"]) == 1
    # Пришло после отгрузки — значит постоплата, другого признака нет.
    assert card["payments"][0]["kind"] == "постоплата"
    assert len(added) == 1


def test_оплата_реестра_без_пары_остаётся_и_попадает_в_отчёт():
    card = {"contract_no": "666/1-1", "shipment": {"date": ""},
            "payments": [{"kind": "предоплата", "date": "", "amount": 999,
                          "doc_number": "", "purpose": ""}]}
    dated, added, missing = [], [], []
    import_payments.match(card, [], dated, added, missing)
    assert card["payments"][0]["amount"] == 999
    assert len(missing) == 1
