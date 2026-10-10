"""Конвейер: файлы → разбор → заказы → книга.

Один вход, которым пользуются и CLI, и веб-приложение, чтобы не разъехались.
"""
from __future__ import annotations

import logging
from dataclasses import asdict
from pathlib import Path
from typing import Callable, Iterable

from . import docs, export_xlsx, ledger
from .extract import ExtractionError, Extractor

log = logging.getLogger(__name__)

Progress = Callable[[str, int, int], None]


def process(
    paths: Iterable[str | Path],
    *,
    cache_dir: str | Path,
    extractor: Extractor | None = None,
    progress: Progress | None = None,
) -> dict:
    """Разобрать файлы и свести их в заказы.

    Ошибка на одном файле не роняет пакет: документ уезжает в `failed`,
    остальные считаются. Для пачки сканов это важнее, чем строгость.
    """
    paths = [Path(p) for p in paths]
    extractor = extractor or Extractor(cache_dir)
    extractions: list[dict] = []
    failed: list[dict] = []

    for i, path in enumerate(paths, 1):
        if progress:
            progress(path.name, i, len(paths))
        doc = docs.load(path)
        if doc.error and not doc.pages:
            failed.append({"file": doc.filename, "error": doc.error})
            continue
        try:
            extractions.append(extractor.extract(doc))
        except ExtractionError as exc:
            failed.append({"file": doc.filename, "error": str(exc)})
        except Exception as exc:  # noqa: BLE001
            log.exception("разбор %s упал", doc.filename)
            failed.append({"file": doc.filename, "error": f"{type(exc).__name__}: {exc}"})

    orders, orphans = ledger.build(extractions)
    return {"orders": orders, "orphans": orphans, "failed": failed, "extractions": extractions}


def to_json(result: dict) -> dict:
    """Представление для веба и для тестов: без объектов, только данные."""
    return {
        "orders": [order_to_json(o) for o in result["orders"]],
        "orphans": result["orphans"],
        "failed": result["failed"],
        "totals": totals(result["orders"]),
    }


def order_to_json(order: ledger.Order) -> dict:
    return {
        "key": order.key,
        "contract_no": order.contract_no,
        "status": export_xlsx.classify(order),
        "fields": {name: {"value": v.value, "source": v.source, "doc_type": v.doc_type}
                   for name, v in order.fields.items()},
        "payments": [{**asdict(p), "date": p.date.isoformat() if p.date else None}
                     for p in order.payments],
        "documents": order.documents,
        "terms": order.terms,
        "computed": order.computed,
        "flags": [asdict(f) for f in order.flags],
        "conflicts": {name: [{"value": v.value, "source": v.source} for v in vals]
                      for name, vals in order.conflicts.items()},
    }


def totals(orders: list[ledger.Order]) -> dict:
    remainder = sum(o.computed.get("remainder") or 0 for o in orders)
    return {
        "orders": len(orders),
        "remainder": round(remainder, 2),
        "errors": sum(1 for o in orders for f in o.flags if f.level == "error"),
        "warnings": sum(1 for o in orders for f in o.flags if f.level == "warn"),
    }


__all__ = ["process", "to_json", "order_to_json", "totals",
           "docs", "ledger", "export_xlsx", "Extractor", "ExtractionError"]
