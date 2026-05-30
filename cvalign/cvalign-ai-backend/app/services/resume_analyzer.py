import re
from typing import List, Set, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

SKILL_DICTIONARY = [
    "python", "java", "javascript", "typescript", "react", "node", "nodejs", "fastapi",
    "django", "flask", "sql", "postgresql", "mysql", "mongodb", "redis", "docker",
    "kubernetes", "aws", "azure", "gcp", "git", "github", "ci/cd", "linux", "html",
    "css", "tailwind", "vue", "angular", "spring", "hibernate", "rest", "api",
    "graphql", "machine learning", "deep learning", "nlp", "data analysis",
    "pandas", "numpy", "scikit-learn", "tensorflow", "pytorch", "excel", "power bi",
    "tableau", "communication", "leadership", "teamwork", "problem solving",
    "agile", "scrum", "jira", "figma", "ui/ux", "c++", "c#", "go", "golang", "rust",
    "ruby", "php", "laravel", "next.js", "nextjs", "express", "selenium", "pytest",
    "unit testing", "microservices", "oauth", "jwt", "security", "cloud",
    "devops", "terraform", "ansible", "kafka", "spark", "hadoop", "etl",
    "statistics", "r", "matlab", "blockchain", "solidity", "ios", "android",
    "swift", "kotlin", "flutter", "dart", "salesforce", "sap", "oracle",
]


def _normalize_skill(skill: str) -> str:
    return skill.strip().lower()


def extract_skills(text: str) -> List[str]:
    text_lower = text.lower()
    found: Set[str] = set()
    for skill in SKILL_DICTIONARY:
        pattern = r"\b" + re.escape(skill.lower()) + r"\b"
        if re.search(pattern, text_lower):
            found.add(_normalize_skill(skill))
    return sorted(found)


def calculate_text_similarity(resume_text: str, job_description: str) -> float:
    corpus = [resume_text, job_description]
    try:
        vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
        matrix = vectorizer.fit_transform(corpus)
        if matrix.shape[1] == 0:
            return 0.0
        sim = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
        return round(max(0.0, min(100.0, sim * 100)), 2)
    except ValueError:
        return 0.0


def calculate_skill_match(resume_skills: List[str], jd_skills: List[str]) -> Tuple[float, List[str], List[str]]:
    resume_set = set(resume_skills)
    jd_set = set(jd_skills)
    if not jd_set:
        return 0.0, [], list(resume_set)
    matched = sorted(resume_set & jd_set)
    missing = sorted(jd_set - resume_set)
    score = round((len(matched) / len(jd_set)) * 100, 2)
    return score, matched, missing


def calculate_ats_score(text_similarity: float, skill_match: float) -> float:
    return round(0.6 * text_similarity + 0.4 * skill_match, 2)


def analyze_resume_local(resume_text: str, job_description: str) -> dict:
    resume_clean = resume_text.strip()
    jd_clean = job_description.strip()

    resume_skills = extract_skills(resume_clean)
    jd_skills = extract_skills(jd_clean)
    text_sim = calculate_text_similarity(resume_clean, jd_clean)
    skill_score, matched, missing = calculate_skill_match(resume_skills, jd_skills)
    ats_score = calculate_ats_score(text_sim, skill_score)

    return {
        "ats_score": ats_score,
        "text_similarity_score": text_sim,
        "skill_match_score": skill_score,
        "matched_skills": matched,
        "missing_skills": missing,
        "resume_skills": resume_skills,
        "jd_skills": jd_skills,
    }
