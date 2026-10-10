"""Проверки защиты: публичный адрес без пароля означает чужие счета за API."""
from __future__ import annotations

import importlib

import pytest

pytest.importorskip("httpx", reason="TestClient требует httpx")
from fastapi.testclient import TestClient  # noqa: E402


def _boot(tmp_path, monkeypatch, token: str):
    monkeypatch.setenv("IBP_ACCESS_TOKEN", token)
    monkeypatch.setenv("IBP_DATA", str(tmp_path / "data"))
    from tool import app as app_module

    importlib.reload(app_module)
    return app_module, TestClient(app_module.app, follow_redirects=False)


def _reset(monkeypatch):
    from tool import app as app_module

    monkeypatch.delenv("IBP_ACCESS_TOKEN", raising=False)
    monkeypatch.delenv("IBP_DATA", raising=False)
    importlib.reload(app_module)


@pytest.fixture
def guarded(tmp_path, monkeypatch):
    """Пароль кириллицей — так его и заведут на практике."""
    _, client = _boot(tmp_path, monkeypatch, "секрет")
    yield client
    _reset(monkeypatch)


@pytest.fixture
def guarded_ascii(tmp_path, monkeypatch):
    """Для заголовка Authorization пароль обязан быть ASCII."""
    _, client = _boot(tmp_path, monkeypatch, "s3cret-token")
    yield client
    _reset(monkeypatch)


def test_без_пароля_страница_уводит_на_вход(guarded):
    res = guarded.get("/")
    assert res.status_code == 303
    assert res.headers["location"] == "/login"


def test_api_без_пароля_отвечает_401(guarded):
    res = guarded.post("/api/batches", files=[])
    assert res.status_code == 401


def test_страница_входа_открыта(guarded):
    assert guarded.get("/login").status_code == 200


def test_healthz_открыт_и_говорит_что_защита_включена(guarded):
    res = guarded.get("/healthz")
    assert res.status_code == 200
    assert res.json() == {"ok": True, "auth": True}


def test_неверный_пароль_не_пускает(guarded):
    res = guarded.post("/login", data={"token": "не тот"})
    assert res.status_code == 303
    assert res.headers["location"] == "/login?e=1"
    assert "ibp_token" not in res.cookies


def test_кириллический_пароль_работает_через_форму(guarded):
    """Заголовки обязаны быть ASCII, поэтому в куке лежит отпечаток пароля,
    а не он сам. Иначе пароль по-русски молча не пускал бы никого."""
    res = guarded.post("/login", data={"token": "секрет"})
    assert res.status_code == 303 and res.headers["location"] == "/"
    cookie = res.cookies["ibp_token"]
    assert cookie.isascii() and cookie != "секрет"

    guarded.cookies.set("ibp_token", cookie)
    assert guarded.get("/").status_code == 200


def test_чужая_кука_не_пускает(guarded):
    guarded.cookies.set("ibp_token", "0" * 64)
    assert guarded.get("/").status_code == 303


def test_можно_войти_заголовком(guarded_ascii):
    res = guarded_ascii.get("/", headers={"Authorization": "Bearer s3cret-token"})
    assert res.status_code == 200


def test_заголовок_с_чужим_токеном_не_пускает(guarded_ascii):
    res = guarded_ascii.get("/", headers={"Authorization": "Bearer wrong"})
    assert res.status_code == 303


def test_без_пароля_в_окружении_вход_свободный(tmp_path, monkeypatch):
    monkeypatch.delenv("IBP_ACCESS_TOKEN", raising=False)
    monkeypatch.setenv("IBP_DATA", str(tmp_path / "data"))
    from tool import app as app_module

    importlib.reload(app_module)
    client = TestClient(app_module.app)
    assert client.get("/").status_code == 200
    assert client.get("/healthz").json()["auth"] is False
    monkeypatch.delenv("IBP_DATA", raising=False)
    importlib.reload(app_module)
