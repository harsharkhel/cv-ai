import { AnalysisResult } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface SessionUser {
  user_uuid?: string;
  name: string;
  email: string;
  role?: string;
  auth_provider?: string;
  profile_picture?: string | null;
}

interface UserResponse {
  user_uuid: string;
  name: string;
  email: string;
  auth_provider: string;
  profile_picture?: string | null;
  role: string;
  is_email_verified?: boolean;
  is_active?: boolean;
}

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

export function getToken(): string | null {
  return localStorage.getItem('cvalign_token');
}

export function setAuth(token: string, session: SessionUser) {
  localStorage.setItem('cvalign_token', token);
  localStorage.setItem('cvalign_session', JSON.stringify(session));
}

export function clearAuth() {
  localStorage.removeItem('cvalign_token');
  localStorage.removeItem('cvalign_session');
}

export function getSession(): SessionUser | null {
  const raw = localStorage.getItem('cvalign_session');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function sessionFromUser(user: UserResponse): SessionUser {
  return {
    user_uuid: user.user_uuid,
    name: user.name,
    email: user.email,
    role: user.role,
    auth_provider: user.auth_provider,
    profile_picture: user.profile_picture ?? null,
  };
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const detail = body?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map((d: { msg?: string }) => d.msg || JSON.stringify(d)).join(', ');
    }
    return body?.message || res.statusText;
  } catch {
    return res.statusText || 'Request failed';
  }
}

async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    throw new Error(await parseError(res));
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface ResumeAnalyzeResponse {
  analysis_id: number;
  ats_score: number;
  text_similarity_score: number;
  skill_match_score: number;
  matched_skills: string[];
  missing_skills: string[];
  resume_skills: string[];
  jd_skills: string[];
  suggestions: string[];
  improved_bullets: string[];
}

export interface ResumeHistoryItem {
  analysis_id: number;
  candidate_name?: string | null;
  job_title?: string | null;
  company_name?: string | null;
  ats_score?: number | null;
  created_at?: string | null;
}

export async function registerUser(name: string, email: string, password: string): Promise<SessionUser> {
  const res = await apiRequest<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });
  const session = sessionFromUser(res.user);
  setAuth(res.access_token, session);
  return session;
}

export async function loginUser(email: string, password: string): Promise<SessionUser> {
  const res = await apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const session = sessionFromUser(res.user);
  setAuth(res.access_token, session);
  return session;
}

export async function googleLogin(idToken: string): Promise<SessionUser> {
  const res = await apiRequest<AuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ id_token: idToken }),
  });
  const session = sessionFromUser(res.user);
  setAuth(res.access_token, session);
  return session;
}

export async function fetchMe(): Promise<SessionUser> {
  const me = await apiRequest<UserResponse>('/auth/me');
  const session = sessionFromUser(me);
  localStorage.setItem('cvalign_session', JSON.stringify(session));
  return session;
}

export async function analyzeResume(file: File, jobDescription: string): Promise<ResumeAnalyzeResponse> {
  const form = new FormData();
  form.append('resume', file);
  form.append('job_description', jobDescription);
  return apiRequest<ResumeAnalyzeResponse>('/resume/analyze', {
    method: 'POST',
    body: form,
  });
}

export async function fetchResumeHistory(): Promise<ResumeHistoryItem[]> {
  return apiRequest<ResumeHistoryItem[]>('/resume/history');
}

export async function fetchAnalysisDetail(analysisId: number): Promise<ResumeAnalyzeResponse & {
  candidate_name?: string | null;
  resume_filename?: string | null;
  job_title?: string | null;
  company_name?: string | null;
}> {
  return apiRequest(`/resume/analysis/${analysisId}`);
}

export function mapAnalyzeResponseToResult(
  response: ResumeAnalyzeResponse,
  meta: {
    candidateName: string;
    targetRole: string;
    roleCategory: string;
    companyName: string;
    jobDescription: string;
  }
): AnalysisResult {
  const jdMatchScore = Math.round(response.ats_score);
  const currentSourceScore = Math.round(response.skill_match_score * 100);
  const historicalDataScore = Math.round(response.text_similarity_score * 100);
  const finalScore = Math.round((jdMatchScore + currentSourceScore + historicalDataScore) / 3);
  const status =
    finalScore >= 75 ? 'Optimal' : finalScore >= 50 ? 'Needs Revision' : 'Weak Match';

  return {
    id: `ALN-${response.analysis_id}`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    candidateName: meta.candidateName,
    targetRole: meta.targetRole,
    roleCategory: meta.roleCategory,
    companyName: meta.companyName,
    jdMatchScore,
    currentSourceScore,
    historicalDataScore,
    finalScore,
    status,
    matchedKeywords: response.matched_skills,
    missingKeywords: response.missing_skills.map((keyword, i) => ({
      keyword,
      importance: (i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low') as 'High' | 'Medium' | 'Low',
    })),
    resumeStructureChecklist: [
      { item: 'Email Address', present: true },
      { item: 'Phone Number', present: true },
      { item: 'LinkedIn Link', present: response.resume_skills.length > 0 },
      { item: 'Portfolio/GitHub Link', present: response.matched_skills.length > 2 },
      { item: 'Education Section', present: true },
      { item: 'Skills Section', present: response.resume_skills.length > 0 },
      { item: 'Experience Section', present: true },
    ],
    suggestions: response.suggestions,
    improvedBullets: response.improved_bullets,
    resumeTextSnippet: `Skills detected: ${response.resume_skills.slice(0, 8).join(', ')}`,
    jobDescription: meta.jobDescription,
  };
}

export async function loadHistoryAsRecords(): Promise<AnalysisResult[]> {
  const history = await fetchResumeHistory();
  const records: AnalysisResult[] = [];

  for (const item of history.slice(0, 10)) {
    try {
      const detail = await fetchAnalysisDetail(item.analysis_id);
      records.push(
        mapAnalyzeResponseToResult(detail, {
          candidateName: detail.candidate_name || item.candidate_name || 'Candidate',
          targetRole: detail.job_title || item.job_title || 'Role',
          roleCategory: 'General / Any Role',
          companyName: detail.company_name || item.company_name || 'Company',
          jobDescription: '',
        })
      );
    } catch {
      const score = Math.round(item.ats_score ?? 0);
      records.push({
        id: `ALN-${item.analysis_id}`,
        date: item.created_at
          ? new Date(item.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })
          : new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            }),
        candidateName: item.candidate_name || 'Candidate',
        targetRole: item.job_title || 'Role',
        roleCategory: 'General / Any Role',
        companyName: item.company_name || 'Company',
        jdMatchScore: score,
        currentSourceScore: score,
        historicalDataScore: score,
        finalScore: score,
        status: score >= 75 ? 'Optimal' : score >= 50 ? 'Needs Revision' : 'Weak Match',
        matchedKeywords: [],
        missingKeywords: [],
        resumeStructureChecklist: [],
        suggestions: [],
        improvedBullets: [],
        resumeTextSnippet: '',
        jobDescription: '',
      });
    }
  }

  return records;
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}
