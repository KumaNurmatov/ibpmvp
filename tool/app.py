"""Веб-приложение: кидаешь пачку файлов — получаешь разложенные заказы и книгу.

Состояние пакета лежит на диске в data/<batch>/, поэтому перезапуск сервера
не теряет уже разобранное, а кэш распознавания общий для всех пакетов.
"""
from __future__ import annotations

import json
import logging
import shutil
import threading
import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from .pipeline import export_xlsx, process, to_json

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("ibp")

ROOT = Path(__file__).parent
DATA = Path(__file__).parent / "data"
CACHE = DATA / "_cache"
MAX_FILE_BYTES = 64 * 1024 * 1024
MAX_FILES = 200

app = FastAPI(title="Разбор документов по заказам")
_lock = threading.Lock()


@app.get("/", response_class=HTMLResponse)
def index() -> str:
    return (ROOT / "static" / "index.html").read_text(encoding="utf-8")


@app.post("/api/batches")
async def create_batch(files: list[UploadFile]) -> dict:
    if not files:
        raise HTTPException(400, "не передано ни одного файла")
    if len(files) > MAX_FILES:
        raise HTTPException(400, f"за раз принимаем не больше {MAX_FILES} файлов")

    batch_id = datetime.now(timezone.utc).strftime("%Y%m%d-%H%M%S-") + uuid.uuid4().hex[:6]
    folder = DATA / batch_id / "input"
    folder.mkdir(parents=True, exist_ok=True)

    saved: list[Path] = []
    for upload in files:
        name = Path(upload.filename or "файл").name
        target = _unique(folder / name)
        size = 0
        with target.open("wb") as fh:
            while chunk := await upload.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_FILE_BYTES:
                    fh.close()
                    target.unlink(missing_ok=True)
                    raise HTTPException(400, f"{name}: файл больше {MAX_FILE_BYTES // 1024 // 1024} МБ")
                fh.write(chunk)
        saved.append(target)

    _save_state(batch_id, {"status": "running", "done": 0, "total": len(saved),
                           "current": None, "created": _now()})
    threading.Thread(target=_run, args=(batch_id, saved), daemon=True).start()
    return {"batch_id": batch_id, "files": len(saved)}


@app.get("/api/batches/{batch_id}")
def get_batch(batch_id: str) -> dict:
    return _load_state(batch_id)


@app.get("/api/batches/{batch_id}/export.xlsx")
def export(batch_id: str) -> FileResponse:
    state = _load_state(batch_id)
    if state.get("status") != "done":
        raise HTTPException(409, "разбор ещё не закончен")
    path = _dir(batch_id) / "Заказы.xlsx"
    if not path.exists():
        raise HTTPException(404, "книга не найдена — перезапустите разбор")
    return FileResponse(path, filename="Заказы.xlsx",
                        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@app.delete("/api/batches/{batch_id}")
def drop_batch(batch_id: str) -> dict:
    folder = _dir(batch_id)
    if not folder.exists():
        raise HTTPException(404, "пакет не найден")
    shutil.rmtree(folder)
    return {"deleted": batch_id}


def _run(batch_id: str, paths: list[Path]) -> None:
    """Фоновый разбор одного пакета."""
    def progress(name: str, done: int, total: int) -> None:
        state = _load_state(batch_id, quiet=True)
        state.update({"current": name, "done": done - 1, "total": total})
        _save_state(batch_id, state)

    try:
        result = process(paths, cache_dir=CACHE, progress=progress)
        payload = to_json(result)
        export_xlsx.write(result["orders"], _dir(batch_id) / "Заказы.xlsx",
                          orphans=result["orphans"])
        payload.update({"status": "done", "done": len(paths), "total": len(paths),
                        "current": None, "finished": _now()})
        _save_state(batch_id, payload)
        log.info("пакет %s: %d заказов, %d файлов", batch_id,
                 len(payload["orders"]), len(paths))
    except Exception as exc:  # noqa: BLE001 — иначе поток умрёт молча
        log.exception("пакет %s упал", batch_id)
        _save_state(batch_id, {"status": "error", "error": f"{type(exc).__name__}: {exc}",
                               "finished": _now()})


def _dir(batch_id: str) -> Path:
    """Путь пакета, защищённый от «../» в идентификаторе."""
    folder = (DATA / batch_id).resolve()
    if DATA.resolve() not in folder.parents:
        raise HTTPException(400, "неверный идентификатор пакета")
    return folder


def _state_path(batch_id: str) -> Path:
    return _dir(batch_id) / "state.json"


def _load_state(batch_id: str, *, quiet: bool = False) -> dict:
    path = _state_path(batch_id)
    if not path.exists():
        if quiet:
            return {}
        raise HTTPException(404, "пакет не найден")
    with _lock:
        return json.loads(path.read_text(encoding="utf-8"))


def _save_state(batch_id: str, state: dict) -> None:
    path = _state_path(batch_id)
    path.parent.mkdir(parents=True, exist_ok=True)
    with _lock:
        path.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def _unique(path: Path) -> Path:
    """Два «отправка.pdf» в одной пачке не должны затирать друг друга."""
    if not path.exists():
        return path
    for n in range(2, 1000):
        candidate = path.with_name(f"{path.stem} ({n}){path.suffix}")
        if not candidate.exists():
            return candidate
    return path.with_name(f"{path.stem}-{uuid.uuid4().hex[:6]}{path.suffix}")


def _now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


DATA.mkdir(exist_ok=True)
CACHE.mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=ROOT / "static"), name="static")
