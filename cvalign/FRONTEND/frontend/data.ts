import { AnalysisResult, MarketDataSource } from './types';

export const INITIAL_ALIGNED_RECORDS: AnalysisResult[] = [
  {
    id: 'ALN-104',
    date: 'May 27, 2026',
    candidateName: 'Harsh Arkhel',
    targetRole: 'UI/UX Intern',
    roleCategory: 'UI/UX Design',
    companyName: 'Linear',
    jdMatchScore: 84,
    currentSourceScore: 88,
    historicalDataScore: 82,
    finalScore: 85,
    status: 'Optimal',
    matchedKeywords: ['Figma', 'Case Study', 'Portfolio', 'Wireframes', 'User Flows'],
    missingKeywords: [
      { keyword: 'Design System', importance: 'High' },
      { keyword: 'Interactive Prototype', importance: 'Medium' },
      { keyword: 'A/B Testing', importance: 'Medium' }
    ],
    resumeStructureChecklist: [
      { item: 'Email Address', present: true },
      { item: 'Phone Number', present: true },
      { item: 'LinkedIn Link', present: true },
      { item: 'Portfolio/GitHub Link', present: true },
      { item: 'Education Section', present: true },
      { item: 'Skills Section', present: true },
      { item: 'Experience Section', present: true }
    ],
    suggestions: [
      'Detail your work with design systems in Figma.',
      'Document a clear problem-solving process for your prominent Case Study.',
      'Quantify the results of your responsive prototypes.'
    ],
    improvedBullets: [
      'Designed a responsive UI/UX case study using Figma, wireframes, and prototypes to improve user flow clarity by 30%.',
      'Developed and maintained design system components, accelerating prototype turnaround by 25%.'
    ],
    resumeTextSnippet: 'Harsh Arkhel - UI/UX Designer\nFigma, wireframes, prototypes, case studies, user research, wireframing...',
    jobDescription: 'Create high fidelity wireframes and interactive prototypes in Figma for a modern career portal. Understand user flows...'
  },
  {
    id: 'ALN-103',
    date: 'May 12, 2026',
    candidateName: 'Harsh Arkhel',
    targetRole: 'Data Scientist Intern',
    roleCategory: 'AI / ML / Data',
    companyName: 'Pinecone',
    jdMatchScore: 78,
    currentSourceScore: 80,
    historicalDataScore: 75,
    finalScore: 78,
    status: 'Optimal',
    matchedKeywords: ['Python', 'SQL', 'Regression', 'Data Wrangling'],
    missingKeywords: [
      { keyword: 'Scikit-Learn', importance: 'High' },
      { keyword: 'Feature Engineering', importance: 'High' },
      { keyword: 'PyTorch', importance: 'Low' }
    ],
    resumeStructureChecklist: [
      { item: 'Email Address', present: true },
      { item: 'Phone Number', present: true },
      { item: 'LinkedIn Link', present: true },
      { item: 'Portfolio/GitHub Link', present: false },
      { item: 'Education Section', present: true },
      { item: 'Skills Section', present: true },
      { item: 'Experience Section', present: true }
    ],
    suggestions: [
      'Add a dedicated link to your GitHub or interactive notebooks.',
      'Highlight specific predictive models built with Scikit-Learn.',
      'Outline your approach to Feature Engineering for structured tabular data.'
    ],
    improvedBullets: [
      'Engineered machine learning pipelines utilizing Python and SQL, leading to a 15% increase in regression accuracy.',
      'Extracted key features from complex datasets, optimizing analytical outputs.'
    ],
    resumeTextSnippet: 'Harsh Arkhel - Data & AI Analyst\nProficient in Python, SQL, database systems, linear models...',
    jobDescription: 'Looking for a Data Science Intern specialized in statistical models, feature engineering, and analytics pipelines...'
  },
  {
    id: 'ALN-102',
    date: 'Apr 28, 2026',
    candidateName: 'Harsh Arkhel',
    targetRole: 'Frontend Developer',
    roleCategory: 'Software / Web Development',
    companyName: 'Stripe',
    jdMatchScore: 92,
    currentSourceScore: 95,
    historicalDataScore: 89,
    finalScore: 92,
    status: 'Optimal',
    matchedKeywords: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'APIs'],
    missingKeywords: [
      { keyword: 'Next.js', importance: 'Medium' },
      { keyword: 'Web Accessibility (a11y)', importance: 'Low' }
    ],
    resumeStructureChecklist: [
      { item: 'Email Address', present: true },
      { item: 'Phone Number', present: true },
      { item: 'LinkedIn Link', present: true },
      { item: 'Portfolio/GitHub Link', present: true },
      { item: 'Education Section', present: true },
      { item: 'Skills Section', present: true },
      { item: 'Experience Section', present: true }
    ],
    suggestions: [
      'Emphasize your command over typed TypeScript models and component lifecycles.',
      'Incorporate performance optimization milestones achieved with Vite.'
    ],
    improvedBullets: [
      'Architected pixel-perfect dashboards with React, TypeScript, and Tailwind, minimizing bundle sizes by 18%.'
    ],
    resumeTextSnippet: 'Harsh Arkhel - Frontend Engineer\nExpert in HTML, CSS, JavaScript, React, TypeScript, state structures...',
    jobDescription: 'Develop stellar high-performance checkout experience pages using React, TypeScript, CSS platforms...'
  },
  {
    id: 'ALN-101',
    date: 'Mar 15, 2026',
    candidateName: 'Harsh Arkhel',
    targetRole: 'Marketing Associate',
    roleCategory: 'Digital Marketing / SEO',
    companyName: 'HubSpot',
    jdMatchScore: 48,
    currentSourceScore: 54,
    historicalDataScore: 50,
    finalScore: 51,
    status: 'Weak Match',
    matchedKeywords: ['SEO', 'Content Strategy'],
    missingKeywords: [
      { keyword: 'Google Analytics', importance: 'High' },
      { keyword: 'Campaign Planning', importance: 'High' },
      { keyword: 'SEO Writing', importance: 'Medium' },
      { keyword: 'A/B Testing', importance: 'Medium' }
    ],
    resumeStructureChecklist: [
      { item: 'Email Address', present: true },
      { item: 'Phone Number', present: true },
      { item: 'LinkedIn Link', present: false },
      { item: 'Portfolio/GitHub Link', present: false },
      { item: 'Education Section', present: true },
      { item: 'Skills Section', present: true },
      { item: 'Experience Section', present: true }
    ],
    suggestions: [
      'Introduce metric-focused details regarding campaigns aligned with marketing models.',
      'Explicitly call out search engine ranking gains using data analytics.'
    ],
    improvedBullets: [
      'Pioneered search optimization initiatives generating 20% consistent organic web traffic boost.',
      'Supervised monthly metrics reports integrating SEO campaign logs.'
    ],
    resumeTextSnippet: 'Harsh Arkhel - Creative Designer and Copywriter\nFocused on brand layouts, general marketing, basic SEO concepts...',
    jobDescription: 'Drive acquisition via quantitative channels. Set up analytics dashboards, coordinate A/B testing campaigns, grow search keywords...'
  }
];

export const INITIAL_MARKET_SOURCES: MarketDataSource[] = [
  {
    id: 'MKT-001',
    sourceType: 'Google Jobs',
    sourceName: 'Senior Product Designer',
    roleCategory: 'UI/UX Design',
    targetRole: 'Product Designer',
    company: 'Figma',
    dateAdded: 'May 18, 2026',
    textLength: 4850,
    extractedKeywords: ['Design Systems', 'Design Tokens', 'Prototyping', 'Variables', 'Autolayout']
  },
  {
    id: 'MKT-002',
    sourceType: 'Company Page',
    sourceName: 'Machine Learning Specialist',
    roleCategory: 'AI / ML / Data',
    targetRole: 'ML Engineer',
    company: 'Mistral AI',
    dateAdded: 'May 14, 2026',
    textLength: 3900,
    extractedKeywords: ['Transformers', 'LLM Tuning', 'PyTorch', 'Model Quantization', 'GPU Kernels']
  },
  {
    id: 'MKT-003',
    sourceType: 'Manual',
    sourceName: 'Fullstack Engineer Technical Brief',
    roleCategory: 'Software / Web Development',
    targetRole: 'Fullstack Dev',
    company: 'Supabase',
    dateAdded: 'Apr 30, 2026',
    textLength: 5200,
    extractedKeywords: ['Postgres', 'RLS Rules', 'TypeScript', 'Docker', 'GraphQL']
  },
  {
    id: 'MKT-004',
    sourceType: 'Google Jobs',
    sourceName: 'Growth Marketing Lead',
    roleCategory: 'Digital Marketing / SEO',
    targetRole: 'Growth Marketer',
    company: 'Airbyte',
    dateAdded: 'Apr 20, 2026',
    textLength: 4500,
    extractedKeywords: ['CAC LTV Modeling', 'Google Ads', 'SEO Sprints', 'Analytics tracking', 'Attribution']
  }
];

export function getStoredRecords(): AnalysisResult[] {
  const data = localStorage.getItem('cvalign_records');
  if (!data) return [];
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveStoredRecords(records: AnalysisResult[]) {
  localStorage.setItem('cvalign_records', JSON.stringify(records));
}

export function getStoredMarketSources(): MarketDataSource[] {
  const data = localStorage.getItem('cvalign_market_sources');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return INITIAL_MARKET_SOURCES;
    }
  }
  localStorage.setItem('cvalign_market_sources', JSON.stringify(INITIAL_MARKET_SOURCES));
  return INITIAL_MARKET_SOURCES;
}

export function saveStoredMarketSources(sources: MarketDataSource[]) {
  localStorage.setItem('cvalign_market_sources', JSON.stringify(sources));
}

export function simulateAnalysis(
  name: string,
  targetRole: string,
  roleCategory: string,
  companyName: string,
  resumeTitle: string,
  resumeSize: string,
  jdText: string
): AnalysisResult {
  // Generate slightly dynamic but highly realistic content based on inputs
  const jdLength = jdText.length;
  // Dynamic matching score based on a simulated comparison
  const jdWords = jdText.toLowerCase().split(/\s+/).filter(Boolean);
  const commonKeywords = ['figma', 'react', 'typescript', 'seo', 'ml', 'ai', 'data', 'design', 'development', 'product', 'marketing', 'python', 'sql', 'system'];
  const matchedWords = commonKeywords.filter(w => w === 'ai' || jdText.toLowerCase().includes(w));
  
  // Custom keyword gap estimation
  const jdMatchScore = jdText ? Math.min(96, Math.max(55, 60 + matchedWords.length * 4 + (jdLength % 12))) : 70;
  const currentSourceScore = Math.min(98, Math.max(60, jdMatchScore + 4));
  const historicalDataScore = Math.min(94, Math.max(50, jdMatchScore - 5));
  const finalScore = Math.round((jdMatchScore + currentSourceScore + historicalDataScore) / 3);

  const status = finalScore >= 75 ? 'Optimal' : finalScore >= 50 ? 'Needs Revision' : 'Weak Match';

  // Specific role-wise suggestions to keep the demo dynamic
  let rolesFound: string[] = [];
  let keywordGapList: { keyword: string; importance: 'High' | 'Medium' | 'Low' }[] = [];
  let checklist = [
    { item: 'Email Address', present: true },
    { item: 'Phone Number', present: true },
    { item: 'LinkedIn Link', present: Math.random() > 0.3 },
    { item: 'Portfolio/GitHub Link', present: Math.random() > 0.4 },
    { item: 'Education Section', present: true },
    { item: 'Skills Section', present: true },
    { item: 'Experience Section', present: true }
  ];

  if (roleCategory === 'UI/UX Design') {
    rolesFound = ['Figma', 'Wireframes', 'User Flows'];
    keywordGapList = [
      { keyword: 'Design System', importance: 'High' },
      { keyword: 'Interactive Prototype', importance: 'High' },
      { keyword: 'A/B Testing', importance: 'Medium' }
    ];
  } else if (roleCategory === 'AI / ML / Data') {
    rolesFound = ['Python', 'SQL', 'Regression', 'Pandas'];
    keywordGapList = [
      { keyword: 'Scikit-Learn', importance: 'High' },
      { keyword: 'Feature Engineering', importance: 'High' },
      { keyword: 'PyTorch', importance: 'Medium' }
    ];
  } else if (roleCategory === 'Software / Web Development') {
    rolesFound = ['Javascript', 'React', 'CSS'];
    keywordGapList = [
      { keyword: 'TypeScript', importance: 'High' },
      { keyword: 'Vite', importance: 'Medium' },
      { keyword: 'Next.js', importance: 'High' }
    ];
  } else {
    rolesFound = ['Strategy', 'Project Alignment'];
    keywordGapList = [
      { keyword: 'Google Analytics', importance: 'High' },
      { keyword: 'Campaign Planning', importance: 'Medium' }
    ];
  }

  return {
    id: `ALN-${Math.floor(105 + Math.random() * 899)}`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    candidateName: name || 'Harsh Arkhel',
    targetRole: targetRole || 'Target Role Developer',
    roleCategory: roleCategory,
    companyName: companyName || 'Innovations Corp',
    jdMatchScore,
    currentSourceScore,
    historicalDataScore,
    finalScore,
    status,
    matchedKeywords: rolesFound,
    missingKeywords: keywordGapList,
    resumeStructureChecklist: checklist,
    suggestions: [
      `Integrate key vocabulary matching the targeted job category: "${roleCategory}".`,
      `Structure bullet items to show explicit numerical gains/outcomes.`,
      `Introduce credentials such as project portfolios and certifications.`
    ],
    improvedBullets: [
      `Engineered optimized project implementations generating structured outcomes matching targets at ${companyName || 'the firm'}.`,
      `Collaborated on cross-functional alignment matrices to advance integration strategies.`
    ],
    resumeTextSnippet: `Simulated CV Content for ${name || 'Harsh'}. Focused on ${roleCategory}. Key assets: ${rolesFound.join(', ')}.`,
    jobDescription: jdText || 'Simulation job description...'
  };
}
