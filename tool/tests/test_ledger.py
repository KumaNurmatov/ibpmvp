"""Проверки сведения и расчётов на настоящих цифрах заказа 666."""
from __future__ import annotations

from tool.pipeline import ledger
from tool.tests import fixtures as fx


def build_666(extra=()):
    orders, orphans = ledger.build(list(fx.ORDER_666) + list(extra))
    assert not orphans, orphans
    assert len(orders) == 1
    return orders[0]


def codes(order) -> set[str]:
    return {f.code for f in order.flags}


def test_собирает_один_заказ_из_пяти_документов():
    order = build_666()
    assert order.key == "666"
    assert order.contract_no == "666/1-1"
    assert len(order.documents) == 5
    assert order.get("order_no") == "Аи 13.04.26/4"


def test_суммы_считаются_а_не_берутся_из_документа():
    order = build_666()
    c = order.computed
    assert c["order_sum"] == 300000.0          # 750 × 400
    assert c["shipment_sum"] == 324800.0       # 812 × 400
    assert c["paid"] == 150000.0               # только предоплата
    assert c["remainder"] == 174800.0
    assert c["remainder_units"] == 437.0


def test_постоплата_закрывает_заказ_в_ноль():
    order = build_666([fx.POSTPAY])
    assert order.computed["paid"] == 324800.0
    assert order.computed["remainder"] == 0.0


def test_цена_берётся_из_спецификации_а_не_из_накладной():
    order = build_666()
    assert order.get("unit_price") == 400.0
    assert order.source_of("unit_price") == "спец дог 666 подписанная айзада.pdf"


def test_видит_перепоставку_62_штук():
    order = build_666()
    assert "overdelivery" in codes(order)
    text = next(f.message for f in order.flags if f.code == "overdelivery")
    assert "62" in text and "24 800,00" in text


def test_считает_просрочку_43_дня_и_неустойку():
    order = build_666()
    c = order.computed
    assert c["due_date"] == "2026-04-23"        # 16.04 + 7 дней
    assert c["overdue_days"] == 43
    assert c["penalty"] == 129000.0             # 1% × 300 000 × 43
    assert "late_shipment" in codes(order)


def test_аванс_ровно_50_процентов_замечаний_не_даёт():
    order = build_666()
    assert "prepay_deviation" not in codes(order)


def test_аванс_мимо_50_процентов_помечается():
    bent = dict(fx.PAYMENT)
    bent["payments"] = [{**fx.PAYMENT["payments"][0], "amount": 120000.0}]
    order = build_666()
    orders, _ = ledger.build([fx.SPECIFICATION, bent, fx.SHIPMENT])
    assert "prepay_deviation" in codes(orders[0])
    assert "prepay_deviation" not in codes(order)


def test_конфликт_названий_изделия_остаётся_видимым():
    order = build_666()
    assert "item" in order.conflicts
    assert "conflict" in codes(order)


def test_водитель_приходит_из_накладной():
    order = build_666()
    assert order.get("driver") == "Ташыкулов Элмир Койчубаевич"
    assert order.get("vehicle_plate") == "04KG227AON"


def test_выписка_разносит_платежи_по_договорам():
    orders, orphans = ledger.build([fx.SPECIFICATION, fx.SHIPMENT, fx.STATEMENT])
    by_key = {o.key: o for o in orders}
    assert set(by_key) == {"666", "706"}
    assert by_key["666"].computed["paid"] == 174800.0
    assert by_key["706"].computed["paid"] == 1498881.45
    assert not orphans


def test_один_платёж_из_двух_источников_не_задваивается():
    orders, _ = ledger.build([fx.SPECIFICATION, fx.SHIPMENT, fx.POSTPAY, fx.STATEMENT])
    order = next(o for o in orders if o.key == "666")
    assert len(order.payments) == 1
    assert order.computed["paid"] == 174800.0


def test_ошибка_суммы_в_реестре_всплывает():
    orders, _ = ledger.build([fx.REGISTRY_662])
    order = orders[0]
    assert order.computed["shipment_sum"] == 389760.0      # 812 × 480
    assert "shipment_sum_mismatch" in codes(order)
    text = next(f.message for f in order.flags if f.code == "shipment_sum_mismatch")
    assert "88 320,00" in text


def test_документ_без_договора_уходит_в_неприкаянные():
    stray = dict(fx.SHIPMENT)
    stray["contract_no"] = None
    stray["order_no"] = None
    orders, orphans = ledger.build([stray])
    assert not orders and len(orphans) == 1


def test_нехватка_данных_помечается_ошибкой():
    orders, _ = ledger.build([fx.PAYMENT])
    assert "missing_fields" in codes(orders[0])
    assert orders[0].computed["remainder"] is None


def test_нормализация_номера_договора():
    assert ledger.normalize_contract("666/1-1") == "666"
    assert ledger.normalize_contract("дог.666/1-1 от 13.04.2026") == "666"
    assert ledger.normalize_contract("№ 942") == "942"
    assert ledger.normalize_contract(None) is None


def test_копейки_через_дефис_как_в_платёжке():
    # 150000-00 в платёжном поручении раньше давало None, и предоплата
    # на 150 тысяч молча пропадала из расчёта.
    assert ledger._num("150000-00") == 150000.0
    assert ledger._num("1234-56") == 1234.56


def test_числа_с_пробелами_и_валютой():
    assert ledger._num("324 800,00 ₽") == 324800.0
    assert ledger._num("1 234,56") == 1234.56
    assert ledger._num("1.234,56") == 1234.56
    assert ledger._num("1,234.56") == 1234.56
    assert ledger._num("-137840,88") == -137840.88


def test_не_число_остаётся_ничем():
    for s in ("", "нет оплаты", "abc", "-", ","):
        assert ledger._num(s) is None


def test_нечитаемый_платёж_не_исчезает_молча():
    broken = dict(fx.PAYMENT)
    broken["payments"] = [{**fx.PAYMENT["payments"][0], "amount": "сто пятьдесят тысяч"}]
    orders, _ = ledger.build([fx.SPECIFICATION, fx.SHIPMENT, broken])
    order = orders[0]
    assert "payment_unparsed" in codes(order)
    assert order.computed["paid"] == 0
    assert not order.payments


def test_привязка_по_совпадению_переживает_пересчёт():
    # Замечание поднимается при сборке, а compute() раньше стирал все флаги.
    order = build_666()
    assert "linked_by_match" in codes(order)


def _unnamed_payment():
    """Платёжка по заказу 666: назначение есть, слова «предоплата» нет."""
    pay = dict(fx.PAYMENT)
    pay["payments"] = [{**fx.PAYMENT["payments"][0], "kind": "неизвестно"}]
    return pay


def test_вид_платежа_определяется_по_дате():
    orders, _ = ledger.build([fx.SPECIFICATION, fx.SHIPMENT, _unnamed_payment()])
    pay = orders[0].payments[0]
    assert pay.kind == "предоплата"
    assert "по дате" in pay.inferred_from
    assert "kind_inferred" in codes(orders[0])


def test_вид_платежа_определяется_по_доле_без_отгрузки():
    orders, _ = ledger.build([fx.SPECIFICATION, _unnamed_payment()])
    pay = orders[0].payments[0]
    assert pay.kind == "предоплата"          # 150 000 = 50% от 300 000
    assert "по доле" in pay.inferred_from


def test_непохожий_платёж_не_угадывается():
    odd = _unnamed_payment()
    odd["payments"] = [{**odd["payments"][0], "date": "", "amount": 7777}]
    orders, _ = ledger.build([fx.SPECIFICATION, odd])
    assert orders[0].payments[0].kind == "неизвестно"
    assert "kind_inferred" not in codes(orders[0])


def test_названный_вид_не_переписывается():
    order = build_666()
    assert order.payments[0].kind == "предоплата"
    assert order.payments[0].inferred_from is None
    assert "kind_inferred" not in codes(order)
