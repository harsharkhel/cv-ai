from datetime import datetime, timezone
from typing import List

import httpx

from app.config import get_settings
from app.models.job import Job, JobType, RemoteType
from app.services.resume_analyzer import extract_skills

settings = get_settings()


def search_jobs_via_google(query: str, location: str = "", num: int = 10) -> List[dict]:
    if not settings.GOOGLE_SEARCH_API_KEY or not settings.GOOGLE_SEARCH_ENGINE_ID:
        return []
    if not settings.JOB_LIVE_SEARCH_ENABLED:
        return []

    search_q = f"{query} jobs {location}".strip()
    url = "https://www.googleapis.com/customsearch/v1"
    params = {
        "key": settings.GOOGLE_SEARCH_API_KEY,
        "cx": settings.GOOGLE_SEARCH_ENGINE_ID,
        "q": search_q,
        "num": min(num, 10),
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return []

    results = []
    for item in data.get("items", []):
        title = item.get("title", "Job Listing")
        snippet = item.get("snippet", "")
        link = item.get("link", "")
        results.append(
            {
                "source": "google",
                "source_job_id": link[:250] if link else None,
                "title": title[:255],
                "company": _extract_company(title),
                "location": location or "Unknown",
                "job_type": JobType.unknown.value,
                "remote_type": RemoteType.unknown.value,
                "description": snippet,
                "skills": extract_skills(snippet),
                "apply_url": link,
                "source_url": link,
                "fetched_at": datetime.now(timezone.utc),
                "raw_data_json": {"confidence": "medium", "source_name": "google_search"},
            }
        )
    return results


def _extract_company(title: str) -> str:
    if " - " in title:
        parts = title.split(" - ")
        if len(parts) >= 2:
            return parts[-1][:255]
    return "Unknown Company"
