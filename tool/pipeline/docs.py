"""Первый слой конвейера: любой входной файл → страницы, пригодные для модели.

PDF с текстовым слоем отдаётся текстом (дёшево и точно), скан — картинками.
Решение принимается по количеству извлечённого текста, а не по расширению:
в папке заказа лежат и те, и другие, причём с одинаковыми именами.
"""
from __future__ import annotations

import base64
import mimetypes
import shutil
import subprocess
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

# Меньше этого на странице — считаем, что текстового слоя нет и нужен скан.
TEXT_LAYER_MIN_CHARS = 120
# Длинная сторона страницы в пикселях. Модель всё равно ужимает картинку
# примерно до 1568 px, поэтому рисовать крупнее — платить за выброшенное:
# семь страниц накладной при 150 dpi давали 97 МБ base64 при лимите в 32 МБ.
RENDER_MAX_SIDE = 1600
RENDER_JPEG_QUALITY = 80
MAX_IMAGE_PAGES = 12
IMAGE_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp", ".tif", ".tiff", ".heic"}
TEXT_SUFFIXES = {".txt", ".csv", ".md", ".json"}


@dataclass
class Page:
    """Одна страница документа — либо текстом, либо картинкой в base64."""

    number: int
    text: str | None = None
    image_b64: str | None = None
    image_media_type: str = "image/png"

    @property
    def is_image(self) -> bool:
        return self.image_b64 is not None


@dataclass
class SourceDoc:
    """Входной файл, разложенный на страницы."""

    path: Path
    filename: str
    kind: str  # pdf_text | pdf_scan | image | docx | xlsx | text | unsupported
    pages: list[Page] = field(default_factory=list)
    error: str | None = None

    @property
    def text(self) -> str:
        return "\n\n".join(p.text for p in self.pages if p.text)

    @property
    def has_images(self) -> bool:
        return any(p.is_image for p in self.pages)


def load(path: str | Path) -> SourceDoc:
    """Разобрать файл. Исключения не пробрасываются — ошибка едет в SourceDoc.error."""
    path = Path(path)
    suffix = path.suffix.lower()
    try:
        if suffix == ".pdf":
            return _load_pdf(path)
        if suffix in IMAGE_SUFFIXES:
            return _load_image(path)
        if suffix == ".docx":
            return _load_docx(path)
        if suffix in {".xlsx", ".xlsm"}:
            return _load_xlsx(path)
        if suffix in TEXT_SUFFIXES:
            return SourceDoc(path, path.name, "text",
                             [Page(1, text=path.read_text(encoding="utf-8", errors="replace"))])
        return SourceDoc(path, path.name, "unsupported", error=f"формат {suffix or '?'} не поддерживается")
    except Exception as exc:  # noqa: BLE001 — одна битая страница не должна ронять пакет
        return SourceDoc(path, path.name, "unsupported", error=f"{type(exc).__name__}: {exc}")


def _load_pdf(path: Path) -> SourceDoc:
    texts = _pdf_page_texts(path)
    solid = [t for t in texts if len(t.strip()) >= TEXT_LAYER_MIN_CHARS]
    if texts and len(solid) >= max(1, len(texts) // 2):
        pages = [Page(i, text=t) for i, t in enumerate(texts, 1) if t.strip()]
        return SourceDoc(path, path.name, "pdf_text", pages)
    pages = _pdf_page_images(path)
    return SourceDoc(path, path.name, "pdf_scan", pages,
                     error=None if pages else "не удалось отрисовать страницы")


def _pdf_page_texts(path: Path) -> list[str]:
    """Текстовый слой постранично. pdftotext быстрее и лучше держит вёрстку таблиц."""
    if shutil.which("pdftotext"):
        out: list[str] = []
        for page in range(1, _pdf_page_count(path) + 1):
            res = subprocess.run(
                ["pdftotext", "-layout", "-f", str(page), "-l", str(page), str(path), "-"],
                capture_output=True, text=True, timeout=60,
            )
            out.append(res.stdout if res.returncode == 0 else "")
        return out
    from pypdf import PdfReader

    return [(p.extract_text() or "") for p in PdfReader(str(path)).pages]


def _pdf_page_count(path: Path) -> int:
    from pypdf import PdfReader

    return len(PdfReader(str(path)).pages)


def _pdf_page_images(path: Path) -> list[Page]:
    if not shutil.which("pdftoppm"):
        return []
    pages: list[Page] = []
    with tempfile.TemporaryDirectory() as tmp:
        subprocess.run(
            ["pdftoppm", "-jpeg", "-jpegopt", f"quality={RENDER_JPEG_QUALITY}",
             "-scale-to", str(RENDER_MAX_SIDE), "-l", str(MAX_IMAGE_PAGES),
             str(path), str(Path(tmp) / "p")],
            capture_output=True, timeout=300,
        )
        for i, jpg in enumerate(sorted(Path(tmp).glob("p-*.jpg")), 1):
            pages.append(Page(i, image_b64=_b64(jpg), image_media_type="image/jpeg"))
    return pages


def _load_image(path: Path) -> SourceDoc:
    """Картинку приводим к PNG/JPEG: HEIC и экзотику модель не примет."""
    media = mimetypes.guess_type(path.name)[0] or ""
    if media in {"image/png", "image/jpeg", "image/webp", "image/gif"} and path.stat().st_size < 1_500_000:
        return SourceDoc(path, path.name, "image", [Page(1, image_b64=_b64(path), image_media_type=media)])
    from PIL import Image

    with Image.open(path) as im:
        im = im.convert("RGB")
        im.thumbnail((RENDER_MAX_SIDE, RENDER_MAX_SIDE))
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            im.save(tmp.name, "JPEG", quality=RENDER_JPEG_QUALITY)
            page = Page(1, image_b64=_b64(Path(tmp.name)), image_media_type="image/jpeg")
    Path(tmp.name).unlink(missing_ok=True)
    return SourceDoc(path, path.name, "image", [page])


def _load_docx(path: Path) -> SourceDoc:
    import docx

    doc = docx.Document(str(path))
    chunks = [p.text for p in doc.paragraphs if p.text.strip()]
    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells]
            if any(cells):
                chunks.append(" | ".join(cells))
    return SourceDoc(path, path.name, "docx", [Page(1, text="\n".join(chunks))])


def _load_xlsx(path: Path) -> SourceDoc:
    from openpyxl import load_workbook

    wb = load_workbook(str(path), data_only=True, read_only=True)
    pages: list[Page] = []
    for n, ws in enumerate(wb.worksheets, 1):
        rows = []
        for row in ws.iter_rows(values_only=True):
            cells = ["" if c is None else str(c) for c in row]
            if any(cells):
                rows.append(" | ".join(cells))
        pages.append(Page(n, text=f"# Лист: {ws.title}\n" + "\n".join(rows)))
    wb.close()
    return SourceDoc(path, path.name, "xlsx", pages)


def _b64(path: Path) -> str:
    return base64.standard_b64encode(path.read_bytes()).decode("ascii")
