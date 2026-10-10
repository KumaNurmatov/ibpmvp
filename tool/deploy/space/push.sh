#!/usr/bin/env bash
# Выкладка на Hugging Face Spaces.
#
#   1. huggingface.co → New Space → SDK: Docker → Blank → Private
#   2. tool/deploy/space/push.sh <логин> <имя-space>
#   3. В Settings → Secrets задать ANTHROPIC_API_KEY и IBP_ACCESS_TOKEN
#
# Space — отдельный git-репозиторий, и ему нужен свой README с frontmatter в
# корне. Поэтому мы не пушим проект целиком, а собираем во временной папке
# ровно то, что нужно образу: README, Dockerfile и tool/.
set -euo pipefail

USER_NAME="${1:-}"
SPACE_NAME="${2:-}"
if [ -z "$USER_NAME" ] || [ -z "$SPACE_NAME" ]; then
  echo "Использование: $0 <логин на huggingface> <имя space>" >&2
  exit 2
fi

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
REMOTE="https://huggingface.co/spaces/${USER_NAME}/${SPACE_NAME}"
STAGE="$(mktemp -d)"
trap 'rm -rf "$STAGE"' EXIT

echo "Собираю выкладку в $STAGE"
cp "$HERE/README.md" "$STAGE/README.md"
cp "$ROOT/tool/Dockerfile" "$STAGE/Dockerfile"
mkdir -p "$STAGE/tool"
# Код и статика — без тестов, данных и кэша: в образе им делать нечего.
(cd "$ROOT" && tar -c \
    --exclude='__pycache__' --exclude='*.pyc' \
    --exclude='tool/data' --exclude='tool/tests' --exclude='tool/deploy' \
    tool) | tar -x -C "$STAGE"

cd "$STAGE"
git init -q -b main
git add -A
git -c user.email=deploy@local -c user.name=deploy commit -q -m "Выложить инструмент разбора документов"

echo
echo "Пушу в $REMOTE"
echo "Логин: ваш логин на huggingface, пароль: access token с правом write"
echo "(создаётся на huggingface.co/settings/tokens)"
echo
git push --force "$REMOTE" main

echo
echo "Готово. Адрес: https://${USER_NAME}-${SPACE_NAME}.hf.space"
echo "Не забудьте задать секреты ANTHROPIC_API_KEY и IBP_ACCESS_TOKEN,"
echo "иначе разбор не заработает, а страница будет открыта всем."
