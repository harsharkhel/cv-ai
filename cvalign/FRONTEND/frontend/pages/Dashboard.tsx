import React from 'react';
import { PageId, AnalysisResult } from '../types';
import { getSession } from '../lib/api';
import {
  FileSearch,
  History,
  TrendingUp,
  Award,
  BookOpen,
  Briefcase,
  Layers,
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

interface DashboardProps {
  onNavigate: (page: PageId) => void;
  records: AnalysisResult[];
}

export default function Dashboard({ onNavigate, records }: DashboardProps) {
  const session = getSession();
  const displayName = session?.name?.split(' ')[0] || 'there';

  // Compute metrics from real state
  const totalAnalyses = records.length;
  const avgScore = totalAnalyses > 0 
    ? Math.round(records.reduce((accum, val) => accum + val.finalScore, 0) / totalAnalyses)
    : 0;
  
  const bestScore = totalAnalyses > 0
    ? Math.max(...records.map(r => r.finalScore))
    : 0;

  const totalMissingKeywords = records.reduce((accum, val) => accum + val.missingKeywords.length, 0);
  const lastTargetRole = records[0]?.targetRole || 'N/A';
  const lastTargetCompany = records[0]?.companyName || 'N/A';

  // Prepare chart data from records (chronologically ordered for line chart)
  const chartData = [...records]
    .reverse()
    .map(r => ({
      name: r.date.split(',')[0], // Day and Month
      Score: r.finalScore
    }));

  const metrics = [
    { label: 'Total Analyses', value: totalAnalyses, icon: Layers, meta: 'All sessions' },
    { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, meta: 'Match index' },
    { label: 'Best Score', value: `${bestScore}%`, icon: Award, meta: 'Historical peak' },
    { label: 'Missing Keywords', value: totalMissingKeywords, icon: BookOpen, meta: 'Actions required' },
    { label: 'Last Target Role', value: lastTargetRole, icon: Briefcase, meta: `@ ${lastTargetCompany}` }
  ];

  const skillGapBadges =
    records.length > 0
      ? [...new Set(records.flatMap((r) => r.missingKeywords.map((k) => k.keyword)))].slice(0, 10)
      : [];

  return (
    <div id="dashboard-container" className="space-y-8 pb-12">
      {/* Header welcome banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="w-12 h-[1px] bg-white mb-3"></div>
          <h2 className="font-serif text-3xl font-light tracking-tight text-white mb-2">
            Welcome back, <span className="italic">{displayName}</span>
          </h2>
          <p className="text-sm text-[#A3A3A3] max-w-xl">
            {records.length === 0
              ? 'Upload your resume and paste a job description to start analysis.'
              : 'Track your resume performance, bridge keyword deficiencies, and optimize matching factors against competitive target jobs.'}
          </p>
        </div>
        <div className="text-right text-xs text-[#737373] hidden lg:block font-mono">
          {new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC
        </div>
      </div>

      {/* Bento-style Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5 relative overflow-hidden group hover:border-white/20 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#737373]">
                  {m.label}
                </span>
                <Icon size={14} className="text-[#94A3B8]/60" />
              </div>
              <div>
                <h3 className="text-2xl font-serif font-bold text-white mb-1 group-hover:text-[#F5F5F5] transition-colors truncate">
                  {m.value}
                </h3>
                <p className="text-[10px] text-[#A3A3A3] truncate">{m.meta}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Core Dashboard Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Score Trend Chart - 8 cols on desktop */}
        <div className="lg:col-span-8 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 md:p-8 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="font-serif text-lg text-white font-semibold">Matching Progress</h4>
              <p className="text-xs text-[#A3A3A3]">Grayscale score evolution history over sequence index</p>
            </div>
            <span className="text-[10px] font-mono tracking-wider text-white/50 uppercase bg-white/10 px-2.5 py-1.5 rounded-lg border border-white/5">
              Grayscale Area Charts
            </span>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFFFFF" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#FFFFFF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#737373"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#737373"
                    fontSize={10}
                    domain={[0, 100]}
                    tickCount={5}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#050505',
                      borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      color: '#F5F5F5',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="Score"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#scoreGlow)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-[#737373]">
                Not enough historical sequences to calculate curve.
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions & Skills - 4 cols on desktop */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Quick Actions */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 md:p-8">
            <h4 className="font-serif text-base text-white font-semibold mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button
                onClick={() => onNavigate('analyze')}
                className="w-full flex items-center justify-between p-4 bg-white hover:bg-[#F5F5F5] text-black rounded-lg transition-all text-xs font-bold uppercase tracking-wider group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <FileSearch size={14} />
                  <span>Analyze New Resume</span>
                </span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => onNavigate('history')}
                className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-white/5 border border-white/10 text-white rounded-lg transition-all text-xs font-bold uppercase tracking-wider group cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <History size={14} />
                  <span>View History logs</span>
                </span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Skill Gap Summary */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 md:p-8 flex-1 flex flex-col justify-between">
            <div>
              <h4 className="font-serif text-base text-white font-semibold mb-2">Priority Targets</h4>
              <p className="text-xs text-[#A3A3A3] mb-4">
                {skillGapBadges.length > 0
                  ? 'Skills to strengthen from your latest analyses'
                  : 'Run an analysis to see priority skill gaps'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {skillGapBadges.length > 0 ? (
                skillGapBadges.map((badge, index) => (
                  <span
                    key={index}
                    className="text-[10px] font-sans px-2.5 py-1 rounded-lg bg-white/5 text-[#A3A3A3] hover:text-white hover:bg-white/10 hover:border-white/20 border border-white/5 cursor-pointer transition-colors"
                  >
                    {badge}
                  </span>
                ))
              ) : (
                <span className="text-[10px] text-[#737373]">No skill gaps yet.</span>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Recent analyses table layout */}
      <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 md:p-8 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="font-serif text-lg text-white font-semibold">Recent Alignment Audits</h4>
            <p className="text-xs text-[#A3A3A3]">Analyses from your account</p>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          >
            Show full log
          </button>
        </div>

        <div className="overflow-x-auto">
          {records.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10px] text-[#A3A3A3] uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold font-sans">Date Tested</th>
                  <th className="py-3 px-4 font-semibold font-sans">Target Job Title</th>
                  <th className="py-3 px-4 font-semibold font-sans">Company</th>
                  <th className="py-3 px-4 font-semibold font-sans text-center">ATS Final Score</th>
                  <th className="py-3 px-4 font-semibold font-sans text-right">Alignment Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#F5F5F5] divide-y divide-white/5 font-sans">
                {records.slice(0, 4).map((record) => (
                  <tr key={record.id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => onNavigate('results')}>
                    <td className="py-4 px-4 text-xs text-[#A3A3A3] flex items-center gap-2">
                      <Clock size={12} className="text-[#737373]" />
                      <span>{record.date}</span>
                    </td>
                    <td className="py-4 px-4 font-semibold">{record.targetRole}</td>
                    <td className="py-4 px-4 text-xs text-[#A3A3A3]">{record.companyName}</td>
                    <td className="py-4 px-4 text-center font-bold font-mono">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg border ${
                          record.finalScore >= 75
                            ? 'text-[#22C55E]/90 bg-[#22C55E]/10 border-[#22C55E]/20'
                            : record.finalScore >= 50
                            ? 'text-[#F59E0B]/90 bg-[#F59E0B]/10 border-[#F59E0B]/20'
                            : 'text-[#EF4444]/90 bg-[#EF4444]/10 border-[#EF4444]/20'
                        }`}
                      >
                        {record.finalScore}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            record.status === 'Optimal'
                              ? 'bg-[#22C55E]'
                              : record.status === 'Needs Revision'
                              ? 'bg-[#F59E0B]'
                              : 'bg-[#EF4444]'
                          }`}
                        />
                        <span className="text-xs text-[#A3A3A3]">{record.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-[#737373] text-xs">
              No analyses executed yet. Tap 'Analyze New Resume' to start.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
