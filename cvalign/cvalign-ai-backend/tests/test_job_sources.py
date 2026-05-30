from unittest.mock import patch

from app.services.adzuna_source import search_adzuna_jobs
from app.services.jooble_source import search_jooble_jobs


def test_adzuna_returns_empty_without_keys():
    with patch("app.services.adzuna_source.settings") as mock_settings:
        mock_settings.ADZUNA_APP_ID = ""
        mock_settings.ADZUNA_APP_KEY = ""
        mock_settings.JOB_LIVE_SEARCH_ENABLED = True
        assert search_adzuna_jobs("python") == []


def test_adzuna_parses_results():
    mock_response = {
        "results": [
            {
                "id": "123",
                "title": "Python Developer",
                "description": "Python FastAPI SQL developer role",
                "company": {"display_name": "Tech Corp"},
                "location": {"display_name": "London"},
                "redirect_url": "https://example.com/job/123",
                "contract_type": "permanent",
            }
        ]
    }
    with patch("app.services.adzuna_source.settings") as mock_settings:
        mock_settings.ADZUNA_APP_ID = "test_id"
        mock_settings.ADZUNA_APP_KEY = "test_key"
        mock_settings.ADZUNA_COUNTRY = "gb"
        mock_settings.JOB_LIVE_SEARCH_ENABLED = True
        with patch("httpx.Client") as mock_client:
            instance = mock_client.return_value.__enter__.return_value
            instance.get.return_value.json.return_value = mock_response
            instance.get.return_value.raise_for_status = lambda: None
            results = search_adzuna_jobs("python", "London", num=5)
    assert len(results) == 1
    assert results[0]["source"] == "adzuna"
    assert results[0]["title"] == "Python Developer"
    assert "python" in results[0]["skills"]


def test_jooble_returns_empty_without_key():
    with patch("app.services.jooble_source.settings") as mock_settings:
        mock_settings.JOOBLE_API_KEY = ""
        mock_settings.JOB_LIVE_SEARCH_ENABLED = True
        assert search_jooble_jobs("python") == []


def test_jooble_parses_results():
    mock_response = {
        "jobs": [
            {
                "title": "Backend Intern",
                "snippet": "Python internship with FastAPI",
                "company": "Startup Inc",
                "location": "Remote",
                "link": "https://example.com/intern",
                "type": "Internship",
            }
        ]
    }
    with patch("app.services.jooble_source.settings") as mock_settings:
        mock_settings.JOOBLE_API_KEY = "test_key"
        mock_settings.JOB_LIVE_SEARCH_ENABLED = True
        with patch("httpx.Client") as mock_client:
            instance = mock_client.return_value.__enter__.return_value
            instance.post.return_value.json.return_value = mock_response
            instance.post.return_value.raise_for_status = lambda: None
            results = search_jooble_jobs("python intern", num=5)
    assert len(results) == 1
    assert results[0]["source"] == "jooble"
    assert results[0]["job_type"] == "internship"
