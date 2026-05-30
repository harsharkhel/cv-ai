import json
import re
from typing import Any, Optional

from app.config import get_settings

settings = get_settings()

RESUME_ANALYSIS_PROMPT = """Analyze this resume against the given job description. Do not use fake assumptions. Only use the provided resume text and job description. If information is missing, say it is missing. Do not guarantee selection. Return an ATS-style analysis with matched skills, missing skills, required improvements, improved bullet points, and learning roadmap.

Resume Text:
{resume_text}

Job Description:
{job_description}

Return structured JSON:
{{
  "ats_score": 0-100,
  "fit_level": "strong/moderate/weak",
  "matched_skills": [],
  "missing_skills": [],
  "missing_keywords": [],
  "resume_strengths": [],
  "resume_weaknesses": [],
  "required_improvements": [],
  "improved_bullets": [],
  "learning_roadmap": [],
  "final_summary": ""
}}"""


def _extract_json(text: str) -> Optional[dict]:
    text = text.strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group())
        except json.JSONDecodeError:
            return None
    return None


def _local_only_result(local: dict) -> dict:
    """Local parser scores only — no fabricated AI suggestions."""
    return {
        "ats_score": local.get("ats_score", 0),
        "fit_level": None,
        "matched_skills": local.get("matched_skills", []),
        "missing_skills": local.get("missing_skills", []),
        "missing_keywords": [],
        "resume_strengths": [],
        "resume_weaknesses": [],
        "suggestions": [],
        "required_improvements": [],
        "improved_bullets": [],
        "learning_roadmap": [],
        "final_summary": "",
        "ai_available": False,
    }


def _call_openai(prompt: str) -> Optional[str]:
    if not settings.OPENAI_API_KEY:
        return None
    try:
        from openai import OpenAI

        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a resume analyst. Use only the provided resume and job description. "
                        "Respond with valid JSON only. Do not guarantee selection."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
        )
        return response.choices[0].message.content
    except Exception:
        return None


def run_ai_resume_analysis(resume_text: str, job_description: str, local: dict) -> dict:
    prompt = RESUME_ANALYSIS_PROMPT.format(
        resume_text=resume_text[:8000],
        job_description=job_description[:8000],
    )

    raw = _call_openai(prompt)
    if not raw:
        return _local_only_result(local)

    parsed = _extract_json(raw)
    if not parsed:
        result = _local_only_result(local)
        result["ai_available"] = False
        return result

    suggestions = parsed.get("required_improvements") or parsed.get("suggestions") or []
    return {
        "ats_score": local.get("ats_score", 0),
        "fit_level": parsed.get("fit_level"),
        "matched_skills": parsed.get("matched_skills") or local.get("matched_skills", []),
        "missing_skills": parsed.get("missing_skills") or local.get("missing_skills", []),
        "missing_keywords": parsed.get("missing_keywords", []),
        "resume_strengths": parsed.get("resume_strengths", []),
        "resume_weaknesses": parsed.get("resume_weaknesses", []),
        "suggestions": suggestions,
        "required_improvements": suggestions,
        "improved_bullets": parsed.get("improved_bullets", []),
        "learning_roadmap": parsed.get("learning_roadmap", []),
        "final_summary": parsed.get("final_summary") or "",
        "ai_available": True,
        "ai_estimated_score": parsed.get("ats_score"),
    }


def merge_analysis(local: dict, ai: dict) -> dict[str, Any]:
    return {
        "ats_score": local["ats_score"],
        "text_similarity_score": local["text_similarity_score"],
        "skill_match_score": local["skill_match_score"],
        "matched_skills": ai.get("matched_skills", local["matched_skills"]),
        "missing_skills": ai.get("missing_skills", local["missing_skills"]),
        "resume_skills": local["resume_skills"],
        "jd_skills": local["jd_skills"],
        "suggestions": ai.get("suggestions", []),
        "improved_bullets": ai.get("improved_bullets", []),
        "learning_roadmap": ai.get("learning_roadmap", []),
        "final_summary": ai.get("final_summary", ""),
        "fit_level": ai.get("fit_level"),
        "ai_estimated_score": ai.get("ai_estimated_score"),
        "missing_keywords": ai.get("missing_keywords", []),
        "resume_strengths": ai.get("resume_strengths", []),
        "resume_weaknesses": ai.get("resume_weaknesses", []),
        "ai_analysis_json": ai,
    }
