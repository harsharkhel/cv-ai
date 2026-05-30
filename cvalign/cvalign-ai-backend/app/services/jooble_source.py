"""Jooble official job search API integration."""

from datetime import datetime, timezone
from typing import List

import httpx

from app.config import get_settings
from app.models.job import JobType
from app.services.resume_analyzer import extract_skills

settings = get_settings()


def search_jooble_jobs(query: str, location: str = "", num: int = 10) -> List[dict]:
    if not settings.JOOBLE_API_KEY:
        return []
    if not settings.JOB_LIVE_SEARCH_ENABLED:
        return []

    url = f"https://jooble.org/api/{settings.JOOBLE_API_KEY}"
    payload = {
        "keywords": query or "developer",
        "location": location or "",
        "page": 1,
    }

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.post(url, json=payload)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return []

    results = []
    for item in data.get("jobs", [])[:num]:
        description = item.get("snippet") or item.get("description") or ""
        title = item.get("title") or "Job Listing"
        job_type_raw = (item.get("type") or "").lower()
        if "intern" in job_type_raw:
            job_type = JobType.internship.value
        elif "part" in job_type_raw:
            job_type = JobType.part_time.value
        elif "contract" in job_type_raw:
            job_type = JobType.contract.value
        else:
            job_type = JobType.unknown.value

        apply_url = item.get("link")
        results.append(
            {
                "source": "jooble",
                "source_job_id": apply_url[:250] if apply_url else None,
                "title": title[:255],
                "company": (item.get("company") or item.get("source") or "Unknown")[:255],
                "location": (item.get("location") or location or "Unknown")[:255],
                "job_type": job_type,
                "remote_type": "unknown",
                "description": description[:5000],
                "skills": extract_skills(description),
                "salary": item.get("salary"),
                "apply_url": apply_url,
                "source_url": apply_url,
                "fetched_at": datetime.now(timezone.utc),
                "raw_data_json": {
                    "confidence": "high",
                    "source_name": "jooble",
                },
            }
        )
    return results
