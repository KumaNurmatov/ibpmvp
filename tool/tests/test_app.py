"""Проверки веб-слоя: загрузка, опрос состояния, выгрузка книги."""
from __future__ import annotations

import io

import pytest

pytest.importorskip("httpx", reason="TestClient требует httpx")
from fastapi.testclient import TestClient  # noqa: E402

from tool import app as app_module  # noqa: E402
from tool.pipeline import ledger  # noqa: E402
from tool.tests import fixtures as fx  # noqa: E402


@pytest.fixture
def client(tmp_path, monkeypatch):
    """Подменяем хранилище на временное и распознавание на фикстуры."""
    monkeypatch.setattr(app_module, "DATA", tmp_path / "data")
    monkeypatch.setattr(app_module, "CACHE", tmp_path / "cache")
    app_module.DATA.mkdir(parents=True)
    app_module.CACHE.mkdir(parents=True)

    def fake_process(paths, *, cache_dir, progress=None, **kw):
        if progress:
            for i, p in enumerate(paths, 1):
                progress(p.name, i, len(paths))
        orders, orphans = ledger.build(list(fx.ORDER_666))
        return {"orders": orders, "orphans": orphans, "failed": [], "extractions": []}

    monkeypatch.setattr(app_module, "process", fake_process)
    return TestClient(app_module.app)


def upload(client, names=("спец.pdf", "отправка.pdf")):
    files = [("files", (n, io.BytesIO(b"%PDF-1.4 test"), "application/pdf")) for n in names]
    res = client.post("/api/batches", files=files)
    assert res.status_code == 200, res.text
    return res.json()["batch_id"]


def wait(client, batch_id, tries=60):
    for _ in range(tries):
        state = client.get(f"/api/batches/{batch_id}").json()
        if state.get("status") in {"done", "error"}:
            return state
    raise AssertionError("разбор не закончился")


def test_страница_отдаётся(client):
    res = client.get("/")
    assert res.status_code == 200
    assert "Разбор документов" in res.text


def test_пустая_загрузка_отклоняется(client):
    assert client.post("/api/batches", files=[]).status_code in {400, 422}


def test_полный_путь_от_загрузки_до_книги(client):
    batch_id = upload(client)
    state = wait(client, batch_id)
    assert state["status"] == "done"
    assert state["totals"]["orders"] == 1
    order = state["orders"][0]
    assert order["contract_no"] == "666/1-1"
    assert order["computed"]["remainder"] == 174800.0
    assert order["fields"]["unit_price"]["source"] == "спец дог 666 подписанная айзада.pdf"

    book = client.get(f"/api/batches/{batch_id}/export.xlsx")
    assert book.status_code == 200
    assert book.content[:2] == b"PK"


def test_одинаковые_имена_не_затирают_друг_друга(client):
    batch_id = upload(client, names=("отправка.pdf", "отправка.pdf"))
    wait(client, batch_id)
    saved = sorted(p.name for p in (app_module.DATA / batch_id / "input").iterdir())
    assert saved == ["отправка (2).pdf", "отправка.pdf"]


def test_неизвестный_пакет_даёт_404(client):
    assert client.get("/api/batches/нет-такого").status_code == 404


def test_выход_за_пределы_хранилища_не_проходит(client):
    assert client.get("/api/batches/..%2F..%2Fetc").status_code in {400, 404}


def test_пакет_можно_удалить(client):
    batch_id = upload(client)
    wait(client, batch_id)
    assert client.delete(f"/api/batches/{batch_id}").status_code == 200
    assert client.get(f"/api/batches/{batch_id}").status_code == 404
