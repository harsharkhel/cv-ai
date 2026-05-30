"""Adzuna official job search API integration."""

from datetime import datetime, timezone
from typing import List

import httpx

from app.config import get_settings
from app.models.job import JobType
from app.services.resume_analyzer import extract_skills

settings = get_settings()


def _map_contract_type(contract: str) -> str:
    contract = (contract or "").lower()
    if "intern" in contract:
        return JobType.internship.value
    if "part" in contract:
        return JobType.part_time.value
    if "contract" in contract:
        return JobType.contract.value
    if "permanent" in contract or "full" in contract:
        return JobType.full_time.value
    return JobType.unknown.value


def search_adzuna_jobs(query: str, location: str = "", num: int = 10) -> List[dict]:
    if not settings.ADZUNA_APP_ID or not settings.ADZUNA_APP_KEY:
        return []
    if not settings.JOB_LIVE_SEARCH_ENABLED:
        return []

    country = settings.ADZUNA_COUNTRY or "gb"
    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    params = {
        "app_id": settings.ADZUNA_APP_ID,
        "app_key": settings.ADZUNA_APP_KEY,
        "results_per_page": min(num, 20),
        "what": query or "developer",
        "content-type": "application/json",
    }
    if location:
        params["where"] = location

    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(url, params=params)
            resp.raise_for_status()
            data = resp.json()
    except Exception:
        return []

    results = []
    for item in data.get("results", []):
        description = item.get("description", "")
        company = item.get("company", {}) or {}
        location_obj = item.get("location", {}) or {}
        loc_display = location_obj.get("display_name", location or "Unknown")

        salary_min = item.get("salary_min")
        salary_max = item.get("salary_max")
        salary = None
        if salary_min or salary_max:
            salary = f"{salary_min or ''}-{salary_max or ''}".strip("-")

        apply_url = item.get("redirect_url") or item.get("url")
        results.append(
            {
                "source": "adzuna",
                "source_job_id": str(item.get("id", "")),
                "title": (item.get("title") or "Job Listing")[:255],
                "company": (company.get("display_name") or "Unknown")[:255],
                "location": loc_display[:255],
                "job_type": _map_contract_type(item.get("contract_type", "")),
                "remote_type": "unknown",
                "description": description[:5000],
                "skills": extract_skills(description),
                "salary": salary,
                "apply_url": apply_url,
                "source_url": apply_url,
                "fetched_at": datetime.now(timezone.utc),
                "raw_data_json": {
                    "confidence": "high",
                    "source_name": "adzuna",
                    "category": item.get("category", {}).get("label"),
                },
            }
        )
    return results
