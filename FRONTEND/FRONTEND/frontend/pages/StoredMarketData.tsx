import React, { useState } from 'react';
import { PageId, MarketDataSource } from '../types';
import {
  Database,
  Search,
  Filter,
  Trash2,
  Download,
  AlertOctagon,
  Calendar,
  Layers,
  Sparkles,
  Plus
} from 'lucide-react';

interface MarketDataProps {
  onNavigate: (page: PageId) => void;
  sources: MarketDataSource[];
  onClearSources: () => void;
  onAddSource: (src: MarketDataSource) => void;
}

export default function StoredMarketData({
  onNavigate,
  sources,
  onClearSources,
  onAddSource
}: MarketDataProps) {
  // Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedType, setSelectedType] = useState('All Types');
  const [dateRange, setDateRange] = useState('All Date Ranges');

  // Confirmation Modal State
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // New Source form modal (simple inline toggle to test adding!)
  const [showAddSourceForm, setShowAddSourceForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newCat, setNewCat] = useState('UI/UX Design');
  const [newType, setNewType] = useState<'Google Jobs' | 'Manual' | 'Company Page'>('Google Jobs');
  const [newKeywordsText, setNewKeywordsText] = useState('');

  // Dropdown option sets
  const categories = [
    'All Categories',
    'Software / Web Development',
    'AI / ML / Data',
    'UI/UX Design',
    'Digital Marketing / SEO'
  ];

  const types = ['All Types', 'Google Jobs', 'Manual', 'Company Page'];
  const dateRanges = ['All Date Ranges', 'Last 7 Days', 'Last 30 Days'];

  // Global counts
  const totalSources = sources.length;
  const googleJobsCount = sources.filter(s => s.sourceType === 'Google Jobs').length;
  const manualCount = sources.filter(s => s.sourceType === 'Manual').length;
  const companyPageCount = sources.filter(s => s.sourceType === 'Company Page').length;

  // Filter core list
  const filteredSources = sources.filter(src => {
    const matchesSearch =
      src.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      src.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      src.targetRole.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All Categories' || src.roleCategory === selectedCategory;

    const matchesType = selectedType === 'All Types' || src.sourceType === selectedType;

    // Date simulation: inside demo, let's treat "Date Added" text matches
    const matchesDate = true; // Simulating matches for simpleness

    return matchesSearch && matchesCategory && matchesType && matchesDate;
  });

  const handleExportCSV = () => {
    // CSV builder
    const headers = ['ID', 'Source Type', 'Source Name', 'Category', 'Target', 'Company', 'Date Added', 'Keywords'];
    const rows = filteredSources.map(s => [
      s.id,
      s.sourceType,
      s.sourceName,
      s.roleCategory,
      s.targetRole,
      s.company,
      s.dateAdded,
      s.extractedKeywords.join('|')
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `CVAlign-MarketData-${Date.now()}.csv`;
    link.click();
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newCompany || !newRole) {
      alert('All source fields are required to append records.');
      return;
    }
    const kwList = newKeywordsText
      ? newKeywordsText.split(',').map(s => s.trim()).filter(Boolean)
      : ['Synergy', 'Implementation', 'Metrics'];

    const newSourceItem: MarketDataSource = {
      id: `MKT-00${sources.length + 1}`,
      sourceType: newType,
      sourceName: newTitle,
      roleCategory: newCat,
      targetRole: newRole,
      company: newCompany,
      dateAdded: 'Today',
      textLength: 3200 + Math.floor(Math.random() * 2000),
      extractedKeywords: kwList
    };

    onAddSource(newSourceItem);
    setShowAddSourceForm(false);
    // Reset forms
    setNewTitle('');
    setNewCompany('');
    setNewRole('');
    setNewKeywordsText('');
  };

  return (
    <div id="stored-market-data-container" className="space-y-8 pb-12 relative font-sans">
      
      {/* Absolute Clear Confirmation Glass Overlay modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-[#050505]/90 backdrop-blur-md z-50 flex items-center justify-center p-6 text-center">
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 max-w-md w-full space-y-6">
            <div className="w-12 h-12 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-full flex items-center justify-center mx-auto text-[#EF4444]">
              <AlertOctagon size={24} />
            </div>
            
            <div>
              <h3 className="font-serif text-xl font-bold text-white mb-2">Clear Market Databases?</h3>
              <p className="text-xs text-[#A3A3A3] leading-relaxed">
                This process purges all local repository records, third-party URLs, and scraped listings completely. Files cannot be recovered afterwards. Let's confirm selection sequence.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => {
                  onClearSources();
                  setShowClearConfirm(false);
                }}
                className="flex-1 bg-[#EF4444] hover:bg-[#EF4444]/90 text-white text-xs font-bold py-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
              >
                Yes, Purge Database
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 bg-transparent hover:bg-white/5 border border-white/10 text-white text-xs font-bold py-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header section with buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="w-12 h-[1px] bg-white mb-3"></div>
          <h2 className="font-serif text-3xl font-light tracking-tight text-white mb-2">
            Stored <span className="italic font-normal">Market Data</span>
          </h2>
          <p className="text-sm text-[#A3A3A3]">
            Curate scraping guidelines, reference JD definitions, and database structures.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowAddSourceForm(!showAddSourceForm)}
            className="bg-white text-black hover:bg-[#F5F5F5] font-sans font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Source</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-transparent hover:bg-white/5 border border-white/10 text-white font-sans font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all uppercase tracking-wider cursor-pointer"
          >
            <Download size={14} className="text-[#94A3B8]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bento grid metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-sans text-[#737373] uppercase tracking-wider font-semibold">
            Total Database Items
          </span>
          <h3 className="text-3xl font-serif font-bold text-white my-1">{totalSources}</h3>
          <p className="text-[10px] text-[#A3A3A3]">All stored metadata nodes</p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-sans text-[#737373] uppercase tracking-wider font-semibold">
            Google Jobs sources
          </span>
          <h3 className="text-3xl font-serif font-bold text-[#22C55E] my-1">{googleJobsCount}</h3>
          <p className="text-[10px] text-[#A3A3A3]">Continuous API scraping channels</p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-sans text-[#737373] uppercase tracking-wider font-semibold">
            Manual Upload Entries
          </span>
          <h3 className="text-3xl font-serif font-bold text-[#94A3B8] my-1">{manualCount}</h3>
          <p className="text-[10px] text-[#A3A3A3]">Custom written benchmarks</p>
        </div>

        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-5 flex flex-col justify-between">
          <span className="text-[10px] font-sans text-[#737373] uppercase tracking-wider font-semibold">
            Company Pages Sources
          </span>
          <h3 className="text-3xl font-serif font-bold text-[#F59E0B] my-1">{companyPageCount}</h3>
          <p className="text-[10px] text-[#A3A3A3]">Target web index endpoints</p>
        </div>
      </div>

      {/* Inline Add Source Form Modal drawer */}
      {showAddSourceForm && (
        <form
          onSubmit={handleCreateSource}
          className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 space-y-4 max-w-xl mx-auto"
        >
          <div className="flex justify-between items-center border-b border-white/5 pb-2">
            <h4 className="font-serif text-base text-white font-semibold">Append New Source Node</h4>
            <button
              type="button"
              onClick={() => setShowAddSourceForm(false)}
              className="text-xs text-[#737373] hover:text-white cursor-pointer font-sans"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] mb-1 pl-0.5">
                Source Title
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Senior Engineering Brief"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] mb-1 pl-0.5">
                Company Target
              </label>
              <input
                type="text"
                required
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                placeholder="OpenAI"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] mb-1 pl-0.5">
                Target Role
              </label>
              <input
                type="text"
                required
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                placeholder="SRE Engineer"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] mb-1 pl-0.5">
                Source Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
              >
                <option value="Google Jobs" className="bg-neutral-900 text-white">Google Jobs</option>
                <option value="Manual" className="bg-neutral-900 text-white">Manual</option>
                <option value="Company Page" className="bg-neutral-900 text-white">Company Page</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] mb-1 pl-0.5">
              Role Category
            </label>
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
            >
              {categories.slice(1).map((cat, i) => (
                <option key={i} value={cat} className="bg-neutral-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] mb-1 pl-0.5">
              Extracted Keywords (separate with commas)
            </label>
            <input
              type="text"
              value={newKeywordsText}
              onChange={(e) => setNewKeywordsText(e.target.value)}
              placeholder="Kubernetes, Terraform, PromQL"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-white/30"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-white hover:bg-[#F5F5F5] text-black text-xs font-bold py-3 rounded-lg uppercase tracking-wider cursor-pointer"
          >
            Append Source Node
          </button>
        </form>
      )}

      {/* Filter Options box */}
      <div className="bg-[#121212]/30 border border-white/[0.04] rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search input field */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" size={15} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search company, job titles..."
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-10 pr-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-white/30"
          />
        </div>

        {/* Dropdowns filters */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto justify-end">
          
          {/* Category filter dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-[#121212] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#A3A3A3] focus:outline-none focus:border-white"
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat} className="bg-neutral-900 text-white">
                {cat}
              </option>
            ))}
          </select>

          {/* Type filter dropdown */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-[#121212] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#A3A3A3] focus:outline-none focus:border-white"
          >
            {types.map((ty, idx) => (
              <option key={idx} value={ty} className="bg-neutral-900 text-white">
                {ty}
              </option>
            ))}
          </select>

          {/* Date range dropdown */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-[#121212] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#A3A3A3] focus:outline-none focus:border-white"
          >
            {dateRanges.map((dr, idx) => (
              <option key={idx} value={dr} className="bg-neutral-900 text-white">
                {dr}
              </option>
            ))}
          </select>
        </div>

      </div>

      {/* Database elements table list */}
      <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h4 className="font-serif text-lg text-white font-semibold">Local Benchmark Sources</h4>
            <p className="text-xs text-[#A3A3A3]">Dynamic source points mapping candidate filters</p>
          </div>

          {sources.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="text-xs text-[#EF4444] hover:underline cursor-pointer font-sans"
            >
              Clear Database
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          {filteredSources.length > 0 ? (
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead>
                <tr className="border-b border-white/[0.08] text-[10px] text-[#A3A3A3] uppercase tracking-wider">
                  <th className="py-2.5 px-3 font-semibold">Source Type</th>
                  <th className="py-2.5 px-3 font-semibold">Name / company name</th>
                  <th className="py-2.5 px-3 font-semibold">Industry Category</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Analyzed date</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Length (chars)</th>
                  <th className="py-2.5 px-3 font-bold text-right">Extracted Keywords</th>
                </tr>
              </thead>
              <tbody className="text-xs text-[#F5F5F5] divide-y divide-white/5">
                {filteredSources.map((src, idx) => {
                  let badgeStyle = '';
                  if (src.sourceType === 'Google Jobs') {
                    badgeStyle = 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/20';
                  } else if (src.sourceType === 'Manual') {
                    badgeStyle = 'text-[#94A3B8] bg-[#94A3B8]/10 border-[#94A3B8]/20';
                  } else {
                    badgeStyle = 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/20';
                  }

                  return (
                    <tr key={idx} className="hover:bg-white/[0.012] transition-colors">
                      <td className="py-4 px-3">
                        <span className={`inline-block px-2 py-1 rounded-lg border text-[10px] font-bold ${badgeStyle}`}>
                          {src.sourceType}
                        </span>
                      </td>
                      <td className="py-4 px-3">
                        <strong className="text-white block font-semibold">{src.sourceName}</strong>
                        <span className="text-[#A3A3A3] text-[10px]">{src.company} ({src.targetRole})</span>
                      </td>
                      <td className="py-4 px-3 text-[#A3A3A3] text-xs">
                        {src.roleCategory}
                      </td>
                      <td className="py-4 px-3 text-center text-[#737373]">
                        {src.dateAdded}
                      </td>
                      <td className="py-4 px-3 text-center text-[#737373] font-mono">
                        {src.textLength.toLocaleString()}
                      </td>
                      <td className="py-4 px-3 text-right">
                        <div className="flex flex-wrap gap-1 justify-end max-w-xs ml-auto">
                          {src.extractedKeywords.slice(0, 3).map((kw, kwIdx) => (
                            <span
                              key={kwIdx}
                              className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-[#A3A3A3]"
                            >
                              {kw}
                            </span>
                          ))}
                          {src.extractedKeywords.length > 3 && (
                            <span className="text-[9px] px-1 w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center font-mono">
                              +{src.extractedKeywords.length - 3}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-[#737373] leading-relaxed text-xs">
              No local sources matching filter parameters found. <br />
              <button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All Categories');
                setSelectedType('All Types');
              }} className="text-white hover:underline mt-2 cursor-pointer font-semibold">
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
