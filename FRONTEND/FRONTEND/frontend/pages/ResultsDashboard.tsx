import React, { useState } from 'react';
import { PageId, AnalysisResult } from '../types';
import {
  Sparkles,
  Award,
  BookOpen,
  ClipboardList,
  Flame,
  FileCheck2,
  Download,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Check,
  X,
  FileText
} from 'lucide-react';

interface ResultsProps {
  onNavigate: (page: PageId) => void;
  result: AnalysisResult | null;
  onSaveToHistory: (record: AnalysisResult) => void;
}

type TabId = 'skills' | 'missing' | 'gap' | 'structure' | 'suggestions' | 'text';

export default function ResultsDashboard({ onNavigate, result, onSaveToHistory }: ResultsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('skills');
  const [hasSaved, setHasSaved] = useState(false);

  // If no analysis is active, load a default placeholder or redirect
  if (!result) {
    return (
      <div className="bg-[#121212]/50 backdrop-blur-md border border-white/10 rounded-xl p-12 text-center max-w-xl mx-auto space-y-6">
        <div className="w-12 h-12 bg-white/5 border border-white/20 rounded-full flex items-center justify-center mx-auto text-[#737373]">
          <LoaderPulse />
        </div>
        <h3 className="font-serif text-xl font-bold text-white">No active alignment sequence found</h3>
        <p className="text-xs text-[#A3A3A3]">
          In order to view high-fidelity ATS match recommendations, we first need to compare your CV text against a target job description.
        </p>
        <button
          onClick={() => onNavigate('analyze')}
          className="bg-white text-black text-xs font-bold px-6 py-3 rounded uppercase tracking-wider hover:opacity-90 transition-all font-sans"
        >
          Begin Audit Session
        </button>
      </div>
    );
  }

  const handleDownloadReport = () => {
    const reportData = `
========================================
CVALIGN AI - ALIGNMENT AUDIT REPORT
========================================
ID: ${result.id}
Date: ${result.date}
Candidate: ${result.candidateName}
Role: ${result.targetRole}
Category: ${result.roleCategory}
Company Target: ${result.companyName}

----------------------------------------
SCORE REVIEWS
----------------------------------------
Job Description Match: ${result.jdMatchScore}%
Current Source Match: ${result.currentSourceScore}%
Historical Model Match: ${result.historicalDataScore}%
FINAL INTEGRATION SCORE: ${result.finalScore}%
STATUS: ${result.status.toUpperCase()}

----------------------------------------
MISSING REQUIREMENTS
----------------------------------------
${result.missingKeywords.map(m => `- [ ] ${m.keyword} (${m.importance} Priority)`).join('\n')}

----------------------------------------
IMPROVED PROJECT BULLETS
----------------------------------------
${result.improvedBullets.join('\n')}
    `;
    const blob = new Blob([reportData], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CVAlign-Report-${result.id}.txt`;
    link.click();
  };

  const handleSaveResult = () => {
    onSaveToHistory(result);
    setHasSaved(true);
  };

  // SVG parameters for matching progress ring
  const circleRadius = 55;
  const circumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circumference - (result.finalScore / 100) * circumference;

  const scoreColorClass =
    result.finalScore >= 75
      ? 'stroke-[#22C55E]'
      : result.finalScore >= 50
      ? 'stroke-[#F59E0B]'
      : 'stroke-[#EF4444]';

  const scoreTextClass =
    result.finalScore >= 75
      ? 'text-[#22C55E]'
      : result.finalScore >= 50
      ? 'text-[#F59E0B]'
      : 'text-[#EF4444]';

  const scoreBgClass =
    result.finalScore >= 75
      ? 'bg-[#22C55E]/10'
      : result.finalScore >= 50
      ? 'bg-[#F59E0B]/10'
      : 'bg-[#EF4444]/10';

  return (
    <div id="results-dashboard-container" className="space-y-8 pb-12">
      
      {/* Blurred grayscale architecture banner texture at the top */}
      <div className="relative overflow-hidden bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        
        {/* Grayscale overlay backdrop */}
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none select-none overflow-hidden hidden md:block">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_VeqDCSnYtfXofLWcXWzdMviDdm_QK-AWGCXm77jxVVdExZ_2QbciyKxvw-zO60OEjQW4yPq4Mpj4W4Hgw8tPSokD4xRR3hq_8zNf6urFPxmsMTHdX7f6_LChHQ0v7N4D5vybFCdIOxrMg31UJV-hjbH-tMUBdgJRVfRpikjhX5d4OtCFOWZs-gvjEdBbBQGfCgg-5P_UABgbqZs5BFZmdr_N4mpWaMLBzBd6hjvAoWV1rVd9i85rL01fkx_Y7sbRAFOIeOpZB5Iq"
            alt="Skyscraper Corner"
            className="w-full h-full object-cover grayscale object-top"
          />
        </div>

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="w-12 h-[1px] bg-white mb-2"></div>
          <span className="text-[10px] uppercase font-mono tracking-[0.2em] text-[#94A3B8] font-bold">
            Alignment Match Synthesizer Log
          </span>
          <h2 className="font-serif text-2xl md:text-3xl font-light tracking-tight text-white mb-2">
            Resume <span className="italic font-normal">Analysis Result</span>
          </h2>
          <p className="text-xs text-[#A3A3A3] leading-relaxed">
            Your uploaded document has been analyzed against specified role details, matching keywords, and scraped target parameters to determine overall matching density indexes.
          </p>
        </div>

        <div className="flex gap-2 relative z-10">
          <button
            onClick={handleDownloadReport}
            className="bg-transparent hover:bg-white/5 border border-white/10 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download size={14} className="text-[#94A3B8]" />
            <span className="hidden sm:inline font-mono">Export Report</span>
          </button>
          
          <button
            onClick={handleSaveResult}
            disabled={hasSaved}
            className={`text-xs font-bold px-4 py-2.5 rounded-lg transition-all uppercase tracking-wider cursor-pointer ${
              hasSaved
                ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30'
                : 'bg-white text-black hover:bg-[#F5F5F5]'
            }`}
          >
            {hasSaved ? 'Saved to Logs' : 'Save Analysis'}
          </button>
        </div>
      </div>

      {/* Score Grid & Circular Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Circular Progress Ring Card (4 cols) */}
        <div className="lg:col-span-4 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <h4 className="font-serif text-xs text-white font-semibold uppercase tracking-wider mb-6 text-center w-full">
            Calculated Metric Density
          </h4>

          <div className="relative w-44 h-44 flex items-center justify-center mb-6">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r={circleRadius}
                className="stroke-white/5 fill-none"
                strokeWidth="8"
              />
              <circle
                cx="88"
                cy="88"
                r={circleRadius}
                className={`fill-none ${scoreColorClass}`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1s ease-out' }}
              />
            </svg>
            
            <div className="absolute flex flex-col items-center animate-fade-in">
              <span className={`text-4xl font-serif font-bold ${scoreTextClass}`}>
                {result.finalScore}%
              </span>
              <span className="text-[10px] text-[#A3A3A3] uppercase font-sans tracking-widest mt-1">
                Match Index
              </span>
            </div>
          </div>

          <div className={`px-4 py-1.5 rounded-lg text-xs font-sans tracking-wide ${scoreBgClass} ${scoreTextClass} font-semibold border border-white/5`}>
            {result.finalScore >= 75
              ? 'Optimal Matching density'
              : result.finalScore >= 50
              ? 'Deficiencies Found / Needs revision'
              : 'Sub-Optimal match density profile'}
          </div>
        </div>

        {/* Bento Scores Grid (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] font-sans text-[#737373] uppercase tracking-wider font-semibold">
              JD Parameter Score
            </span>
            <div>
              <h3 className="text-3xl font-serif font-bold text-white mb-1">
                {result.jdMatchScore}%
              </h3>
              <p className="text-[10px] text-[#A3A3A3]">JD vocabulary match density index</p>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] font-sans text-[#737373] uppercase tracking-wider font-semibold">
              Primary Source Score
            </span>
            <div>
              <h3 className="text-3xl font-serif font-bold text-white mb-1">
                {result.currentSourceScore}%
              </h3>
              <p className="text-[10px] text-[#A3A3A3]">Dynamic resume content scores</p>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] font-sans text-[#737373] uppercase tracking-wider font-semibold">
              Historical Baselines Score
            </span>
            <div>
              <h3 className="text-3xl font-serif font-bold text-white mb-1">
                {result.historicalDataScore}%
              </h3>
              <p className="text-[10px] text-[#A3A3A3]">Market compliance correlation values</p>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
            <span className="text-[10px] font-sans text-[#737373] uppercase tracking-wider font-semibold">
              Deficient Keywords
            </span>
            <div>
              <h3 className="text-3xl font-serif font-bold text-[#EF4444] mb-1">
                {result.missingKeywords.length}
              </h3>
              <p className="text-[10px] text-[#A3A3A3]">Structural parameters omitted</p>
            </div>
          </div>

          {/* Quick specs item card (Across columns) */}
          <div className="col-span-2 sm:col-span-4 bg-[#121212]/20 border border-white/5 p-4 rounded-xl flex items-center justify-between text-xs text-[#A3A3A3] font-mono">
            <span>Target Role: <strong className="text-white font-sans">{result.targetRole}</strong></span>
            <span>Target Company: <strong className="text-white font-sans">{result.companyName}</strong></span>
            <span>Auditor Level: <strong className="text-white font-sans">AI Advanced Model v4</strong></span>
          </div>
        </div>

      </div>

      {/* Tabs and Data matrices */}
      <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl overflow-hidden flex flex-col">
        
        {/* Tab Headers bar */}
        <div className="flex border-b border-white/[0.08] overflow-x-auto select-none">
          {[
            { id: 'skills', label: 'Skills Found', icon: Award },
            { id: 'missing', label: 'Missing Keywords', icon: Flame },
            { id: 'gap', label: 'Keyword Gap Matrix', icon: TrendingUp },
            { id: 'structure', label: 'Resume Structure', icon: ClipboardList },
            { id: 'suggestions', label: 'AI Bullet Suggestions', icon: Sparkles },
            { id: 'text', label: 'Extracted CV text', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex items-center gap-2 px-6 py-4 text-xs font-semibold tracking-wide font-sans border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-white text-white bg-white/5'
                    : 'border-transparent text-[#737373] hover:text-white hover:bg-white/[0.01]'
                }`}
              >
                <Icon size={12} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content bodies */}
        <div className="p-6">
          
          {/* Tab 1: Skills Found */}
          {activeTab === 'skills' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-xl">
                <h5 className="text-xs font-semibold uppercase font-sans tracking-wider text-white mb-4">
                  Confirmed Skills Detected
                </h5>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.length > 0 ? (
                    result.matchedKeywords.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] flex items-center gap-1"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                        <span>{tag}</span>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#737373]">No skills matched our target indices.</span>
                  )}
                </div>
              </div>

              <div className="bg-white/[0.01] border border-white/[0.04] p-5 rounded-xl">
                <h5 className="text-xs font-semibold uppercase font-sans tracking-wider text-white mb-4">
                  Target Domain Capabilities
                </h5>
                <div className="flex flex-wrap gap-2">
                  {result.matchedKeywords.concat(result.missingKeywords.map(m => m.keyword)).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-1 rounded-lg bg-[#94A3B8]/10 border border-white/10 text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Missing Keywords */}
          {activeTab === 'missing' && (
            <div className="space-y-4">
              <p className="text-xs text-[#A3A3A3] max-w-xl">
                The target JD utilizes these high-frequency vocabulary keywords which are omitted in your document sequence:
              </p>
              <div className="flex flex-wrap gap-3">
                {result.missingKeywords.map((missing, idx) => {
                  const labelColor =
                    missing.importance === 'High'
                      ? 'bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]'
                      : missing.importance === 'Medium'
                      ? 'bg-[#F59E0B]/10 border-[#F59E0B]/20 text-[#F59E0B]'
                      : 'bg-white/5 border-white/10 text-[#A3A3A3]';

                  return (
                    <span
                      key={idx}
                      className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-2 ${labelColor}`}
                    >
                      <span>{missing.keyword}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider opacity-75">
                        • {missing.importance}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Keyword Gap Matrix */}
          {activeTab === 'gap' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-[#A3A3A3] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold">Priority Requirement</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Audit Importance</th>
                    <th className="py-2.5 px-3 font-semibold text-center">Resume Status</th>
                    <th className="py-2.5 px-3 font-semibold text-right">Optimization recommendation</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-[#F5F5F5] divide-y divide-white/5">
                  {result.missingKeywords.map((missing, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01]">
                      <td className="py-3 px-3 font-medium text-white">{missing.keyword}</td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            missing.importance === 'High'
                              ? 'text-[#EF4444] bg-[#EF4444]/10'
                              : 'text-[#F59E0B] bg-[#F59E0B]/10'
                          }`}
                        >
                          {missing.importance}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center text-[#EF4444] font-medium flex items-center justify-center gap-1.5">
                        <X size={12} />
                        <span>Omitted</span>
                      </td>
                      <td className="py-3 px-3 text-right text-[#A3A3A3]">
                        Integrate context-specific details displaying numerical works under criteria: "{missing.keyword}".
                      </td>
                    </tr>
                  ))}
                  {result.matchedKeywords.map((matched, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.01]">
                      <td className="py-3 px-3 font-medium text-white">{matched}</td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-white/40 text-[10px]">Standard</span>
                      </td>
                      <td className="py-3 px-3 text-center text-[#22C55E] font-medium flex items-center justify-center gap-1.5">
                        <Check size={12} />
                        <span>Aligned</span>
                      </td>
                      <td className="py-3 px-3 text-right text-[#A3A3A3]">
                        Matched. Ensure context demonstrates corresponding results.
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tab 4: Resume Structure Checklist */}
          {activeTab === 'structure' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {result.resumeStructureChecklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 bg-[#050505]/20 border border-white/5 rounded-xl"
                >
                  <span className="text-xs text-[#A3A3A3] font-sans">{item.item}</span>
                  {item.present ? (
                    <span className="text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1">
                      <Check size={10} />
                      <span>PRESENT</span>
                    </span>
                  ) : (
                    <span className="text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 animate-pulse">
                      <X size={10} />
                      <span>MISSING</span>
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Tab 5: AI Bullet Suggestions */}
          {activeTab === 'suggestions' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-[#94A3B8]" />
                <h5 className="text-xs font-semibold uppercase font-sans tracking-wider text-white">
                  Engineered Sentence Re-writes (Before / After alignment comparisons)
                </h5>
              </div>

              <div className="space-y-4">
                {result.improvedBullets.map((bullet, idx) => (
                  <div key={idx} className="bg-white/[0.01] border border-white/[0.04] rounded-xl p-4 space-y-3">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-mono text-[#EF4444] font-bold block">
                        Original Sub-optimal format:
                      </span>
                      <p className="text-xs text-[#737373] italic">
                        {idx === 0
                          ? '"Maintained company responsive designs, crafted pages and UI flows, supported layout portfolios."'
                          : '"Collaborated across various alignment sheets to optimize criteria indicators and data tracks."'}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-3 space-y-1">
                      <span className="text-[10px] uppercase font-mono text-[#22C55E] font-bold block">
                        CVAlign Optimization (75+ ATS score compliant):
                      </span>
                      <p className="text-xs text-white leading-relaxed">
                        {bullet}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Extra suggestions summary cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {result.suggestions.map((sug, idx) => (
                  <div key={idx} className="p-3 bg-white/[0.01] border border-white/[0.04] rounded-xl flex items-start gap-3">
                    <span className="text-xs font-mono font-bold text-white/50 pt-0.5">[{idx + 1}]</span>
                    <p className="text-xs text-[#A3A3A3] leading-relaxed">{sug}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 6: Extracted Text */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <p className="text-xs text-[#A3A3A3]">
                Extracted metadata and parsing raw text snippets from resume document segments:
              </p>
              <pre className="p-4 bg-[#050505] border border-white/[0.08] rounded-xl overflow-x-auto text-[10px] font-mono text-[#737373] leading-relaxed select-text whitespace-pre-wrap max-h-64">
                {result.resumeTextSnippet}
              </pre>
            </div>
          )}

        </div>
      </div>

      {/* Button footer actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/[0.01] p-4 border border-white/[0.04] rounded-xl">
        <span className="text-xs text-[#737373]">
          Audit Session ID: <strong className="text-white font-mono">{result.id}</strong>
        </span>
        <div className="flex gap-4">
          <button
            onClick={() => onNavigate('analyze')}
            className="bg-white hover:bg-[#F5F5F5] text-black font-sans font-bold text-xs px-6 py-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
          >
            Analyze another resume
          </button>
          
          <button
            onClick={() => onNavigate('dashboard')}
            className="bg-transparent hover:bg-white/5 border border-white/10 text-white font-sans text-xs px-6 py-3 rounded-lg hover:border-white/30 transition-all font-semibold uppercase tracking-wide cursor-pointer"
          >
            Dashboard
          </button>
        </div>
      </div>

    </div>
  );
}

// Small UI loader component
function LoaderPulse() {
  return (
    <span className="relative flex h-3 w-3">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
    </span>
  );
}
