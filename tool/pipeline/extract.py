"""Вызов модели: документ → заполненная схема.

Один документ — один вызов. Результат кэшируется по хэшу файла: повторная
загрузка того же скана ничего не стоит, а при отладке конвейера можно гонять
расчёты сколько угодно, не платя за распознавание заново.
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
from pathlib import Path

from . import docs
from .schema import EXTRACTION_SCHEMA, SYSTEM_PROMPT, USER_PREFIX

log = logging.getLogger(__name__)

MODEL = os.environ.get("IBP_MODEL", "claude-opus-5-5")
MAX_TOKENS = 16000
# Текста шлём не больше этого: накладная на 7 страниц укладывается с запасом,
# а 500-страничный реестр не должен съесть контекст целиком.
MAX_TEXT_CHARS = 120_000
# Лимит запроса — 32 МБ вместе со служебным; держим запас и режем по страницам,
# а не посреди документа, чтобы обрыв был виден в логе, а не в цифрах.
MAX_IMAGE_B64_CHARS = 20_000_000


class ExtractionError(RuntimeError):
    pass


class Extractor:
    """Обёртка над Messages API со структурированным выводом и файловым кэшем."""

    def __init__(self, cache_dir: Path | str, client=None, model: str = MODEL):
        self.cache_dir = Path(cache_dir)
        self.cache_dir.mkdir(parents=True, exist_ok=True)
        self.model = model
        self._client = client

    @property
    def client(self):
        if self._client is None:
            import anthropic

            self._client = anthropic.Anthropic()
        return self._client

    def extract(self, doc: docs.SourceDoc, *, use_cache: bool = True) -> dict:
        if doc.error and not doc.pages:
            return _empty(doc, note=doc.error)

        key = self._cache_key(doc)
        cached = self._read_cache(key) if use_cache else None
        if cached is not None:
            cached["_cached"] = True
            return cached

        content = self._build_content(doc)
        if not content:
            return _empty(doc, note="в файле нечего разбирать")

        data = self._call(content)
        data["_source_file"] = doc.filename
        data["_source_kind"] = doc.kind
        data["_cached"] = False
        self._write_cache(key, data)
        return data

    def _call(self, content: list[dict]) -> dict:
        import anthropic

        try:
            response = self.client.messages.create(
                model=self.model,
                max_tokens=MAX_TOKENS,
                system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": content}],
                output_config={
                    "effort": "high",
                    "format": {"type": "json_schema", "schema": EXTRACTION_SCHEMA},
                },
            )
        except anthropic.AuthenticationError as exc:
            raise ExtractionError("нет доступа к API: проверьте ANTHROPIC_API_KEY") from exc
        except anthropic.RateLimitError as exc:
            raise ExtractionError("лимит запросов исчерпан, попробуйте позже") from exc
        except anthropic.APIStatusError as exc:
            raise ExtractionError(f"API вернул {exc.status_code}: {exc.message}") from exc
        except anthropic.APIConnectionError as exc:
            raise ExtractionError("нет сети до API") from exc

        if response.stop_reason == "refusal":
            raise ExtractionError("модель отказалась разбирать документ")
        if response.stop_reason == "max_tokens":
            raise ExtractionError("ответ не поместился в лимит токенов")

        text = next((b.text for b in response.content if b.type == "text"), None)
        if not text:
            raise ExtractionError("пустой ответ модели")
        data = json.loads(text)
        data["_usage"] = {
            "input": response.usage.input_tokens,
            "output": response.usage.output_tokens,
        }
        return data

    def _build_content(self, doc: docs.SourceDoc) -> list[dict]:
        content: list[dict] = [{"type": "text", "text": USER_PREFIX.format(filename=doc.filename)}]
        image_chars = 0
        for page in doc.pages:
            if page.is_image:
                if image_chars + len(page.image_b64) > MAX_IMAGE_B64_CHARS:
                    log.warning("%s: страницы с %d не влезли в лимит запроса",
                                doc.filename, page.number)
                    content.append({"type": "text",
                                    "text": f"[страницы с {page.number} не поместились в запрос]"})
                    break
                image_chars += len(page.image_b64)
                content.append({
                    "type": "image",
                    "source": {"type": "base64", "media_type": page.image_media_type,
                               "data": page.image_b64},
                })
            elif page.text and page.text.strip():
                content.append({"type": "text", "text": f"--- страница {page.number} ---\n{page.text}"})
        total = sum(len(b.get("text", "")) for b in content if b["type"] == "text")
        if total > MAX_TEXT_CHARS:
            content = _truncate_text_blocks(content, MAX_TEXT_CHARS)
        return content if len(content) > 1 else []

    def _cache_key(self, doc: docs.SourceDoc) -> str:
        digest = hashlib.sha256(doc.path.read_bytes()).hexdigest()[:32]
        return f"{digest}-{self.model}"

    def _read_cache(self, key: str) -> dict | None:
        path = self.cache_dir / f"{key}.json"
        if not path.exists():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None

    def _write_cache(self, key: str, data: dict) -> None:
        (self.cache_dir / f"{key}.json").write_text(
            json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
        )


def _truncate_text_blocks(content: list[dict], limit: int) -> list[dict]:
    """Режем ровно по границе страниц, чтобы не оборвать таблицу посередине."""
    out, used = [], 0
    for block in content:
        if block["type"] != "text":
            out.append(block)
            continue
        text = block["text"]
        if used + len(text) <= limit:
            out.append(block)
            used += len(text)
        else:
            room = limit - used
            if room > 500:
                out.append({"type": "text", "text": text[:room] + "\n[…документ обрезан…]"})
            break
    return out


def _empty(doc: docs.SourceDoc, note: str) -> dict:
    """Заглушка с той же формой, что и ответ модели, — чтобы дальше по конвейеру
    не приходилось проверять None на каждом шаге."""
    return {
        "doc_type": "other", "confidence": 0.0, "contract_no": None, "order_no": None,
        "doc_number": None, "doc_date": None,
        "parties": {"supplier": None, "buyer": None},
        "item": {"name": None, "color": None, "composition": None, "article": None, "size_range": None},
        "ordered": {"qty": None, "unit_price": None, "stated_total": None},
        "shipment": {k: None for k in ("date", "qty", "places", "weight_gross", "weight_net",
                                       "stated_amount", "driver", "vehicle", "vehicle_plate",
                                       "route_from", "route_to")},
        "payments": [], "orders": [],
        "terms": {"prepay_percent": None, "lead_time_days": None,
                  "penalty_percent_per_day": None, "postpay_days": None},
        "unreadable": True, "notes": note,
        "_source_file": doc.filename, "_source_kind": doc.kind, "_cached": False,
    }
