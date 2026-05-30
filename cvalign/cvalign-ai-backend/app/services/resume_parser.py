import re
import uuid
from pathlib import Path

import fitz
from docx import Document
from fastapi import HTTPException, UploadFile, status

from app.config import get_settings

settings = get_settings()

ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def clean_text(text: str) -> str:
    text = text.replace("\x00", "")
    text = re.sub(r"\s+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def extract_pdf_text(file_path: Path) -> str:
    doc = fitz.open(file_path)
    try:
        parts = [page.get_text() for page in doc]
        return clean_text("\n".join(parts))
    finally:
        doc.close()


def extract_docx_text(file_path: Path) -> str:
    doc = Document(file_path)
    parts = [p.text for p in doc.paragraphs if p.text.strip()]
    return clean_text("\n".join(parts))


async def save_and_parse_resume(file: UploadFile, user_uuid: str) -> tuple[str, str]:
    if not file.filename:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Filename required")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF and DOCX files are allowed",
        )

    content = await file.read()
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds {settings.MAX_UPLOAD_SIZE_MB}MB limit",
        )
    if len(content) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")

    upload_root = Path(settings.UPLOAD_DIR) / user_uuid
    upload_root.mkdir(parents=True, exist_ok=True)

    safe_name = f"{uuid.uuid4().hex}{ext}"
    file_path = upload_root / safe_name
    file_path.write_bytes(content)

    if ext == ".pdf":
        text = extract_pdf_text(file_path)
    else:
        text = extract_docx_text(file_path)

    if not text or len(text) < 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Could not extract sufficient text from resume",
        )

    return safe_name, text
