export type PageId =
  | 'login'
  | 'signup'
  | 'dashboard'
  | 'analyze'
  | 'results'
  | 'history'
  | 'market-data'
  | 'profile';

export interface CandidateDetails {
  candidateName: string;
  targetRole: string;
  companyName: string;
  roleCategory: string;
}

export interface AnalysisResult {
  id: string;
  date: string;
  candidateName: string;
  targetRole: string;
  roleCategory: string;
  companyName: string;
  jdMatchScore: number;
  currentSourceScore: number;
  historicalDataScore: number;
  finalScore: number;
  missingKeywords: { keyword: string; importance: 'High' | 'Medium' | 'Low' }[];
  matchedKeywords: string[];
  status: 'Optimal' | 'Needs Revision' | 'Weak Match';
  resumeStructureChecklist: {
    item: string;
    present: boolean;
  }[];
  suggestions: string[];
  improvedBullets: string[];
  resumeTextSnippet: string;
  jobDescription: string;
}

export interface MarketDataSource {
  id: string;
  sourceType: 'Google Jobs' | 'Manual' | 'Company Page';
  sourceName: string;
  roleCategory: string;
  targetRole: string;
  company: string;
  dateAdded: string;
  textLength: number;
  extractedKeywords: string[];
}
