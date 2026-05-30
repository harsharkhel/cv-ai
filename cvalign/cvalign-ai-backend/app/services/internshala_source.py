"""
Internshala job source — DISABLED by default.

Supports:
- Manual admin-added jobs (source=internshala in DB)
- Optional third-party API when INTERNSHALA_API_KEY is set

No direct HTML scraping in default code path.
"""

from datetime import datetime, timezone
from typing import List

import httpx

from app.config import get_settings

settings = get_settings()


def is_enabled() -> bool:
    return settings.INTERNSHALA_SOURCE_ENABLED


def fetch_internshala_jobs(query: str, location: str = "") -> List[dict]:
    """
    Returns jobs only when explicitly enabled and API key is configured.
    Never scrapes Internshala HTML without compliance.
    """
    if not is_enabled():
        return []

    if not settings.INTERNSHALA_API_KEY:
        return []

    # Placeholder for compliant third-party API integration
    api_url = "https://api.example-internshala-partner.com/v1/internships"
    try:
        with httpx.Client(timeout=15.0) as client:
            resp = client.get(
                api_url,
                params={"q": query, "location": location},
                headers={"Authorization": f"Bearer {settings.INTERNSHALA_API_KEY}"},
            )
            if resp.status_code != 200:
                return []
            data = resp.json()
    except Exception:
        return []

    results = []
    for item in data.get("results", []):
        results.append(
            {
                "source": "internshala",
                "source_job_id": str(item.get("id", "")),
                "title": item.get("title", ""),
                "company": item.get("company", "Unknown"),
                "location": item.get("location", location),
                "description": item.get("description", ""),
                "apply_url": item.get("url"),
                "source_url": item.get("url"),
                "fetched_at": datetime.now(timezone.utc),
                "raw_data_json": {"confidence": "high", "via": "api"},
            }
        )
    return results
