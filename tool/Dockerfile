# poppler-utils обязателен: pdftotext читает текстовый слой, pdftoppm рисует
# сканы. Без него PDF-сканы молча превращаются в пустые документы.
FROM python:3.12-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends poppler-utils \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY tool/requirements.txt /app/tool/requirements.txt
RUN pip install --no-cache-dir -r /app/tool/requirements.txt

COPY tool /app/tool

# 7860 — порт по умолчанию у Hugging Face Spaces; на других хостингах
# слушаем то, что пришло в PORT.
ENV PORT=7860 \
    PYTHONUNBUFFERED=1 \
    IBP_DATA=/data

EXPOSE 7860

# Хостинги с эфемерным диском монтируют /data не всегда — создаём на старте.
CMD ["sh", "-c", "mkdir -p \"$IBP_DATA\" && exec uvicorn tool.app:app --host 0.0.0.0 --port ${PORT}"]
