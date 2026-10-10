"""Схема должна оставаться в рамках, которые принимает структурированный вывод.

Поводом стал живой 400: поля вида ["string", "null"] считаются объединением
типов, их разрешено не больше шестнадцати, а у нас вышло 45 — и API отверг
каждый документ. Проверка сторожит, чтобы объединения не завелись снова.
"""
from __future__ import annotations

from tool.pipeline.schema import EXTRACTION_SCHEMA, SYSTEM_PROMPT

UNION_LIMIT = 16


def walk(node):
    if isinstance(node, dict):
        yield node
        for value in node.values():
            yield from walk(value)
    elif isinstance(node, list):
        for value in node:
            yield from walk(value)


def count_unions(schema) -> int:
    return sum(1 for n in walk(schema)
               if isinstance(n.get("type"), list) or "anyOf" in n or "oneOf" in n)


def test_объединений_типов_нет():
    assert count_unions(EXTRACTION_SCHEMA) == 0


def test_укладываемся_в_лимит_api():
    assert count_unions(EXTRACTION_SCHEMA) <= UNION_LIMIT


def test_каждый_объект_закрыт_и_перечисляет_поля():
    for node in walk(EXTRACTION_SCHEMA):
        if node.get("type") != "object":
            continue
        assert node.get("additionalProperties") is False
        assert sorted(node.get("required", [])) == sorted(node.get("properties", {}))


def test_промпт_велит_писать_пустую_строку():
    assert "пустая строка" in SYSTEM_PROMPT
    assert "— null." not in SYSTEM_PROMPT
