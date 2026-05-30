import React from 'react';
import { PageId, AnalysisResult } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Layers, TrendingUp, Award, ShieldAlert, Sparkles, Filter, Trash2 } from 'lucide-react';

interface HistoryProps {
  onNavigate: (page: PageId) => void;
  records: AnalysisResult[];
  onClearHistory: () => void;
}

export default function HistoryAnalytics({ onNavigate, records, onClearHistory }: HistoryProps) {
  // Compute metrics from real state
  const totalAnalyses = records.length;
  const avgScore = totalAnalyses > 0 
    ? Math.round(records.reduce((accum, val) => accum + val.finalScore, 0) / totalAnalyses)
    : 0;

  const bestScore = totalAnalyses > 0
    ? Math.max(...records.map(r => r.finalScore))
    : 0;

  const lowestScore = totalAnalyses > 0
    ? Math.min(...records.map(r => r.finalScore))
    : 0;

  // Chart 1: Trend over sequence order
  const trendData = [...records]
    .reverse()
    .map((r, idx) => ({
      index: `Audit #${idx + 1}`,
      Score: r.finalScore,
      title: r.targetRole
    }));

  // Chart 2: Count by role category (dynamically aggregated)
  const categoryCounts = records.reduce((accum: { [key: string]: number }, val) => {
    accum[val.roleCategory] = (accum[val.roleCategory] || 0) + 1;
    return accum;
  }, {});

  const categoryChartData = Object.keys(categoryCounts).map(cat => ({
    category: cat.split('/')[0].trim(), // shorten label names for responsiveness
    Count: categoryCounts[cat]
  }));

  // Group 3: Most repeated missing keywords (aggregated)
  const repeatedKeywords = records.reduce((accum: { [key: string]: number }, val) => {
    val.missingKeywords.forEach(mk => {
      accum[mk.keyword] = (accum[mk.keyword] || 0) + 1;
    });
    return accum;
  }, {});

  const sortedRepeatedKeywords = Object.keys(repeatedKeywords)
    .map(kw => ({ keyword: kw, count: repeatedKeywords[kw] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5 repeated gaps

  return (
    <div id="history-analytics-container" className="space-y-8 pb-12 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="w-12 h-[1px] bg-white mb-3"></div>
          <h2 className="font-serif text-3xl font-light tracking-tight text-white mb-2">
            History <span className="italic font-normal">Analytics</span>
          </h2>
          <p className="text-sm text-[#A3A3A3]">
            Track score timelines, recurring keywords deficiencies, and candidate progress indices.
          </p>
        </div>
        
        {totalAnalyses > 0 && (
          <button
            onClick={() => {
              if (confirm('Are you sure you want to purge all alignment history?')) {
                onClearHistory();
              }
            }}
            className="text-xs bg-transparent hover:bg-[#EF4444]/15 border border-[#EF4444]/20 hover:border-[#EF4444]/50 text-[#EF4444]/80 hover:text-[#EF4444] px-4 py-2.5 rounded-lg transition-all font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <Trash2 size={13} />
            <span className="font-mono">Purge History</span>
          </button>
        )}
      </div>

      {/* Bento grid metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5">
          <span className="text-[10px] font-sans font-semibold text-[#737373] uppercase tracking-wider block mb-2">
            Total Alignments Run
          </span>
          <h3 className="text-3xl font-serif font-bold text-white mb-1">{totalAnalyses}</h3>
          <p className="text-[10px] text-[#A3A3A3]">Complete operational cycles</p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5">
          <span className="text-[10px] font-sans font-semibold text-[#737373] uppercase tracking-wider block mb-2">
            Average ATS Index
          </span>
          <h3 className="text-3xl font-serif font-bold text-white mb-1">{avgScore}%</h3>
          <p className="text-[10px] text-[#A3A3A3]">Global match mean density</p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5">
          <span className="text-[10px] font-sans font-semibold text-[#737373] uppercase tracking-wider block mb-2">
            Highest Score
          </span>
          <h3 className="text-3xl font-serif font-bold text-[#22C55E] mb-1">{bestScore}%</h3>
          <p className="text-[10px] text-[#A3A3A3]">Peak matching optimization</p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5">
          <span className="text-[10px] font-sans font-semibold text-[#737373] uppercase tracking-wider block mb-2">
            Lowest Match Score
          </span>
          <h3 className="text-3xl font-serif font-bold text-[#EF4444] mb-1">{lowestScore}%</h3>
          <p className="text-[10px] text-[#A3A3A3]">Critical baseline index</p>
        </div>
      </div>

      {/* Analytics Charts layout row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Trend line */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6">
          <h4 className="font-serif text-base text-white font-semibold mb-1">Score Trend over sequences</h4>
          <p className="text-xs text-[#A3A3A3] mb-6">Chronological match progress scores</p>
          
          <div className="h-60 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ left: -25, right: 10 }}>
                  <XAxis dataKey="index" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#737373" fontSize={10} domain={[0, 100]} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#050505',
                      borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      color: '#F5F5F5',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    cursor={{ stroke: '#FFFFFF', strokeWidth: 0.5 }}
                  />
                  <Line type="monotone" dataKey="Score" stroke="#FFFFFF" strokeWidth={1.5} dot={{ fill: '#FFFFFF', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#737373]">
                Execute audits to populate trend charts.
              </div>
            )}
          </div>
        </div>

        {/* Roles Distribution bar chart */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6">
          <h4 className="font-serif text-base text-white font-semibold mb-1">Analysis Count by Role Category</h4>
          <p className="text-xs text-[#A3A3A3] mb-6">Distribution matches analyzed per domain segment</p>

          <div className="h-60 w-full">
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ left: -25, right: 10 }}>
                  <XAxis dataKey="category" stroke="#737373" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#737373" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#050505',
                      borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      color: '#F5F5F5',
                      fontSize: '11px',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="Count" fill="#FFFFFF" fillOpacity={0.8} radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[#737373]">
                Provide categories to calculate metrics.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Repeated missing trends and metrics rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Repeating Gap list (3 cols on desktop) */}
        <div className="lg:col-span-1 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h4 className="font-serif text-base text-white font-semibold mb-1">Recurrent Keywords Gaps</h4>
            <p className="text-xs text-[#A3A3A3] mb-4">Most identified deficiencies in history logs</p>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            {sortedRepeatedKeywords.length > 0 ? (
              sortedRepeatedKeywords.map((kw, kIdx) => (
                <div key={kIdx} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl">
                  <span className="text-xs text-white font-sans font-medium">{kw.keyword}</span>
                  <span className="text-[10px] font-mono text-[#EF4444] uppercase tracking-wider bg-[#EF4444]/15 px-2 py-1 rounded-lg leading-none font-bold">
                    {kw.count} matches
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-[#737373] py-4">
                No deficiencies found in records.
              </div>
            )}
          </div>
        </div>

        {/* Detailed history matrices table (9 columns width equivalent) */}
        <div className="lg:col-span-2 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 overflow-hidden">
          <h4 className="font-serif text-base text-white font-semibold mb-1">All-Time Alignment Audit Logs</h4>
          <p className="text-xs text-[#A3A3A3] mb-4">Granular matrix scoreboards from past simulations</p>

          <div className="overflow-x-auto">
            {records.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[10px] text-[#A3A3A3] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-semibold font-sans">ID</th>
                    <th className="py-2.5 px-3 font-semibold font-sans">Role / Target Company</th>
                    <th className="py-2.5 px-3 font-semibold font-sans text-center">JD %</th>
                    <th className="py-2.5 px-3 font-semibold font-sans text-center">CV %</th>
                    <th className="py-2.5 px-3 font-semibold font-sans text-center">MKT %</th>
                    <th className="py-2.5 px-3 font-semibold font-sans text-center">Final Score</th>
                    <th className="py-2.5 px-3 font-semibold font-sans text-right">Qualitative Match</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-[#F5F5F5] divide-y divide-white/5 font-mono">
                  {records.map((r, rIdx) => (
                    <tr key={rIdx} className="hover:bg-white/[0.012] cursor-pointer" onClick={() => onNavigate('results')}>
                      <td className="py-3 px-3 text-[#A3A3A3]">{r.id}</td>
                      <td className="py-3 px-3 text-xs font-sans">
                        <strong className="text-white block font-semibold">{r.targetRole}</strong>
                        <span className="text-[#A3A3A3] text-[10px]">{r.companyName} ({r.roleCategory})</span>
                      </td>
                      <td className="py-3 px-3 text-center text-[#A3A3A3]">{r.jdMatchScore}%</td>
                      <td className="py-3 px-3 text-center text-[#A3A3A3]">{r.currentSourceScore}%</td>
                      <td className="py-3 px-3 text-center text-[#A3A3A3]">{r.historicalDataScore}%</td>
                      <td className="py-3 px-3 text-center font-bold">
                        <span
                          className={`inline-block px-2 py-1.5 rounded-lg leading-none ${
                            r.finalScore >= 75
                              ? 'text-[#22C55E] bg-[#22C55E]/10 border border-[#22C55E]/20'
                              : r.finalScore >= 50
                              ? 'text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20'
                              : 'text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20'
                          }`}
                        >
                          {r.finalScore}%
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-sans text-[11px] text-[#A3A3A3]">
                        {r.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-[#737373] text-xs">
                Provide metrics history lists to calculate logs.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
