import React, { useState, useRef } from 'react';
import { PageId, AnalysisResult } from '../types';
import { analyzeResume, mapAnalyzeResponseToResult } from '../lib/api';
import {
  UploadCloud,
  FileText,
  Trash2,
  Cpu,
  Bookmark,
  ToggleLeft,
  ToggleRight,
  Sparkles,
  RefreshCw,
  Info,
  ShieldCheck,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

interface AnalyzeProps {
  onNavigate: (page: PageId) => void;
  onAnalysisComplete: (newResult: AnalysisResult) => void;
}

export default function AnalyzeResume({ onNavigate, onAnalysisComplete }: AnalyzeProps) {
  // Form State
  const [candidateName, setCandidateName] = useState('Harsh Arkhel');
  const [targetRole, setTargetRole] = useState('UI/UX Intern');
  const [companyName, setCompanyName] = useState('Linear');
  const [roleCategory, setRoleCategory] = useState('UI/UX Design');

  // File Upload State
  const [file, setFile] = useState<{ name: string; size: string } | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Job Description State
  const [jdText, setJdText] = useState(
    'We are looking for a UI/UX Intern to assist in building modern workflows. Must be proficient in Figma, creating interactive prototypes, constructing wireframes, mapping out user journeys, and documenting case studies. Ideal candidates demonstrate a crisp visual portfolio.'
  );

  // Extra Source State
  const [extraSource, setExtraSource] = useState('');
  const [publicUrl, setPublicUrl] = useState('');
  const [addedUrls, setAddedUrls] = useState<string[]>([]);
  const [useStoredMarketData, setUseStoredMarketData] = useState(true);
  const [storeThisSource, setStoreThisSource] = useState(true);

  // Loading Screen State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [analyzeError, setAnalyzeError] = useState('');

  const steps = [
    'Extracting resume text layout...',
    'Parsing target job description criteria...',
    'Matching keyword taxonomy & gaps...',
    'Synthesizing competitive ATS values...',
    'Generating granular suggestions...'
  ];

  // Role Category Options
  const categories = [
    'Software / Web Development',
    'AI / ML / Data',
    'UI/UX Design',
    'Digital Marketing / SEO',
    'Content Writing / Copywriting',
    'Video Editing / Motion Graphics',
    'Business / Sales / HR / Finance',
    'General / Any Role'
  ];

  // Drag and Drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const sizeKb = Math.round(droppedFile.size / 1024);
      setResumeFile(droppedFile);
      setFile({
        name: droppedFile.name,
        size: sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`,
      });
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const sizeKb = Math.round(selectedFile.size / 1024);
      setResumeFile(selectedFile);
      setFile({
        name: selectedFile.name,
        size: sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`,
      });
    }
  };

  const removeFile = () => {
    setFile(null);
    setResumeFile(null);
  };

  // Add Public URL Source
  const addUrl = () => {
    if (publicUrl.trim()) {
      setAddedUrls([...addedUrls, publicUrl.trim()]);
      setPublicUrl('');
    }
  };

  const removeUrl = (index: number) => {
    setAddedUrls(addedUrls.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    const draft = { candidateName, targetRole, companyName, roleCategory, jdText };
    localStorage.setItem('cvalign_draft', JSON.stringify(draft));
    alert('Draft submitted and written successfully to local cache.');
  };

  // Run backend analysis with loader increments
  const handleAnalyze = async () => {
    if (!file || !resumeFile) {
      alert('Please provide a PDF or DOCX resume document to inspect.');
      return;
    }
    if (!jdText.trim()) {
      alert('A target Job Description is required to run the alignment audits.');
      return;
    }

    const lower = resumeFile.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.docx')) {
      alert('Only PDF and DOCX files are supported by the analysis API.');
      return;
    }

    setAnalyzeError('');
    setIsAnalyzing(true);
    setCurrentStepIndex(0);

    const fullJd =
      jdText.trim() +
      (extraSource ? `\n\n${extraSource}` : '') +
      (addedUrls.length ? `\n\n${addedUrls.join('\n')}` : '');

    const scheduleNextStep = (stepIdx: number) => {
      if (stepIdx < steps.length) {
        setTimeout(() => {
          setCurrentStepIndex(stepIdx);
          scheduleNextStep(stepIdx + 1);
        }, 900);
      }
    };

    scheduleNextStep(1);

    try {
      const response = await analyzeResume(resumeFile, fullJd, {
        jobTitle: targetRole,
        companyName: companyName,
      });
      setCurrentStepIndex(steps.length);
      const result = mapAnalyzeResponseToResult(response, {
        candidateName,
        targetRole,
        roleCategory,
        companyName,
        jobDescription: fullJd,
      });
      setIsAnalyzing(false);
      onAnalysisComplete(result);
    } catch (err: any) {
      setIsAnalyzing(false);
      setAnalyzeError(err.message || 'Analysis failed. Ensure you are logged in and the API is running.');
    }
  };

  return (
    <div id="analyze-resume-container" className="space-y-8 pb-12 relative font-sans">
      
      {/* Loading/Analyzing animation portal */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-xl z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-12 flex justify-center items-center">
            {/* Pulsing ring */}
            <div className="w-24 h-24 border border-white/10 rounded-full absolute animate-ping opacity-25" />
            <div className="w-16 h-16 bg-white/5 border border-white/20 rounded-full flex items-center justify-center relative">
              <RefreshCw className="text-white animate-spin" size={24} />
            </div>
          </div>
          <h3 className="font-serif text-2xl font-bold text-white mb-3">CVAlign Engineering Core</h3>
          <p className="text-xs text-[#94A3B8] font-semibold tracking-wider uppercase mb-8">
            Compiling Predictive Audit Metrics
          </p>

          <div className="w-full max-w-sm space-y-4">
            {steps.map((st, sIdx) => {
              const isPassed = sIdx < currentStepIndex;
              const isCurrent = sIdx === currentStepIndex;
              return (
                <div
                  key={sIdx}
                  className={`flex items-center gap-3 p-3 rounded text-left transition-all ${
                    isCurrent
                      ? 'bg-white/5 border border-white/10'
                      : 'opacity-40'
                  }`}
                >
                  {isPassed ? (
                    <span className="w-4 h-4 rounded-full bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-[10px] font-bold">
                      ✓
                    </span>
                  ) : isCurrent ? (
                    <span className="w-4 h-4 rounded-full border border-white/30 border-t-white animate-spin" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-white/5" />
                  )}
                  <span className={`text-xs ${isCurrent ? 'text-white font-medium' : 'text-[#A3A3A3]'}`}>
                    {st}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Form Title */}
      <div>
        <div className="w-12 h-[1px] bg-white mb-3"></div>
        <h2 className="font-serif text-3xl font-light tracking-tight text-white mb-2">
          Align <span className="italic">New Resume</span>
        </h2>
        <p className="text-sm text-[#A3A3A3]">
          Audit documents against exact job description parameters and local market structures.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN - Forms Grid (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Candidate Details */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 md:p-8 space-y-4">
            <h4 className="font-serif text-base text-white font-semibold border-b border-white/5 pb-2">
              Candidate Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A3A3A3] ml-0.5">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={candidateName}
                  onChange={(e) => setCandidateName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
                />
              </div>
              
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A3A3A3] ml-0.5">
                  Target Role Title
                </label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A3A3A3] ml-0.5">
                  Target Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-[0.2em] text-[#A3A3A3] ml-0.5">
                  Role Category
                </label>
                <select
                  value={roleCategory}
                  onChange={(e) => setRoleCategory(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat} className="bg-neutral-900 text-white">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Resume Upload */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 md:p-8 space-y-4 font-sans">
            <h4 className="font-serif text-base text-white font-semibold border-b border-white/5 pb-2">
              Resume Document
            </h4>
            
            {/* Upload Area */}
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`border border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-4 ${
                  dragActive
                    ? 'border-white bg-white/5'
                    : 'border-white/[0.08] hover:border-white/30 hover:bg-white/[0.01]'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.docx"
                  className="hidden"
                />
                <div className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-[#A3A3A3]">
                  <UploadCloud size={20} className="text-[#94A3B8]" />
                </div>
                <div>
                  <p className="text-xs text-white font-medium mb-1">
                    Drag and drop your file here, or click to browse
                  </p>
                  <p className="text-[10px] text-[#737373]">
                    Accepted formats: PDF, DOCX. Max file size: 10MB
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/[0.08] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/5 rounded flex items-center justify-center text-white">
                    <FileText size={18} className="text-[#94A3B8]" />
                  </div>
                  <div>
                    <p className="text-xs text-white font-medium truncate max-w-xs">{file.name}</p>
                    <p className="text-[10px] text-[#737373]">{file.size}</p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="text-[#EF4444] hover:bg-[#EF4444]/15 p-2 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Section 3: Job Description */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 md:p-8 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h4 className="font-serif text-base text-white font-semibold">
                Job Description Parameters
              </h4>
              <button
                onClick={() => setJdText('')}
                className="text-[10px] font-sans uppercase font-bold text-[#737373] hover:text-white transition-colors cursor-pointer"
              >
                Clear text
              </button>
            </div>
            
            <div className="relative">
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                rows={6}
                placeholder="Paste the complete job description here..."
                className="w-full bg-white/[0.04] border border-white/[0.04] rounded-xl p-4 text-xs text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all font-sans leading-relaxed"
              />
              <div className="absolute bottom-3 right-3 text-[10px] font-mono text-[#737373]">
                {jdText.length} characters
              </div>
            </div>
          </div>

          {/* Section 4: Extra Source Data */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 md:p-8 space-y-6">
            <h4 className="font-serif text-base text-white font-semibold border-b border-white/5 pb-2">
              Supplementary Analysis Context
            </h4>

            {/* Manual context field */}
            <div className="space-y-1">
              <label className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Custom Manual Context / Guidelines Notes (Optional)
              </label>
              <textarea
                value={extraSource}
                onChange={(e) => setExtraSource(e.target.value)}
                rows={3}
                placeholder="Add other constraints like grading scales, core projects references..."
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg p-3 text-xs text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all font-sans"
              />
            </div>

            {/* URL input */}
            <div className="space-y-1">
              <label className="block text-[10px] font-sans font-semibold uppercase tracking-wider text-[#A3A3A3] mb-1">
                Reference Public JD URLs
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={publicUrl}
                  onChange={(e) => setPublicUrl(e.target.value)}
                  placeholder="https://company.com/job-post-url"
                  className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-[#F5F5F5] focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
                />
                <button
                  type="button"
                  onClick={addUrl}
                  className="bg-white text-black hover:bg-[#F5F5F5] px-4 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Added URLs */}
              {addedUrls.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {addedUrls.map((url, uidx) => (
                    <span
                      key={uidx}
                      className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-white"
                    >
                      <span className="truncate max-w-[150px]">{url}</span>
                      <button
                        type="button"
                        onClick={() => removeUrl(uidx)}
                        className="text-[#EF4444] hover:text-white cursor-pointer font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between p-3 bg-[#050505]/20 border border-white/5 rounded-xl">
                <div className="pr-4">
                  <span className="block text-xs font-medium text-white mb-0.5">
                    Utilize Stored Market Data
                  </span>
                  <span className="block text-[10px] text-[#737373]">
                    Cross-match references against historical listings
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setUseStoredMarketData(!useStoredMarketData)}
                  className="text-white hover:text-[#94A3B8] cursor-pointer"
                >
                  {useStoredMarketData ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="opacity-50" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-[#050505]/20 border border-white/5 rounded-xl">
                <div className="pr-4">
                  <span className="block text-xs font-medium text-white mb-0.5">
                    Persist Context to Database
                  </span>
                  <span className="block text-[10px] text-[#737373]">
                    Save inputs to Supplementary market dataset
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setStoreThisSource(!storeThisSource)}
                  className="text-white hover:text-[#94A3B8] cursor-pointer"
                >
                  {storeThisSource ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="opacity-50" />}
                </button>
              </div>
            </div>
          </div>

          {analyzeError && (
            <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-lg text-xs text-[#EF4444]">
              {analyzeError}
            </div>
          )}

          {/* Action buttons footer */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={handleAnalyze}
              className="flex-1 bg-white hover:bg-[#F5F5F5] text-black text-[11px] font-bold py-4 rounded-lg uppercase tracking-[0.15em] font-sans flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-white/5"
            >
              <Cpu size={14} />
              <span>Analyze Resume</span>
            </button>
            <button
              onClick={handleSaveDraft}
              className="bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white text-[11px] font-bold px-6 rounded-lg uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
            >
              <Bookmark size={14} className="text-[#94A3B8]" />
              <span className="hidden sm:inline">Save Draft</span>
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN - Info side columns (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card: How analysis works */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6">
            <h4 className="font-serif text-base text-white font-semibold mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-[#94A3B8]" />
              <span>Core Audit Pipeline</span>
            </h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className="text-xs font-mono font-bold text-[#737373]">[01]</span>
                <p className="text-xs text-[#A3A3A3]">
                  <strong>Text Extraction:</strong> CVAlign segments document tags, links, credentials blocks, and formats.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-xs font-mono font-bold text-[#737373]">[02]</span>
                <p className="text-xs text-[#A3A3A3]">
                  <strong>Taxonomy Matching:</strong> It cross-references the targets metadata tags with historical JD clusters.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="text-xs font-mono font-bold text-[#737373]">[03]</span>
                <p className="text-xs text-[#A3A3A3]">
                  <strong>Deficiency Mapping:</strong> Identifies keyword anomalies and syntax gaps for instantaneous corrections.
                </p>
              </div>
            </div>
          </div>

          {/* Card: Supported Roles */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6">
            <h4 className="font-serif text-base text-white font-semibold mb-3">Supported Role Sectors</h4>
            <ul className="text-xs text-[#A3A3A3] space-y-2 list-disc list-inside">
              <li>Product Management & Design Systems</li>
              <li>Frontend & Infrastructure Engineering</li>
              <li>Artificial Intelligence & Regression Models</li>
              <li>Digital Growth Marketing & Content SEO</li>
            </ul>
          </div>

          {/* Card: Pro Tip */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6">
            <h4 className="font-serif text-base text-white font-semibold mb-3 flex items-center gap-2">
              <Info size={14} className="text-[#94A3B8]" />
              <span>Pro Optimization Tips</span>
            </h4>
            <p className="text-xs text-[#A3A3A3] leading-relaxed">
              Always copy the full responsibilities section of a JD rather than just bullet lists. The engine matches context hierarchies, not simple raw words.
            </p>
          </div>

          {/* Privacy Note */}
          <div className="bg-white/[0.01] border border-white/[0.04] rounded-2xl p-6 flex gap-3 text-xs text-[#737373] items-start">
            <ShieldCheck size={18} className="text-[#22C55E]/60 flex-shrink-0" />
            <p>
              <strong>Data Integrity Guarantee:</strong> Document segments and text arrays remain fully isolated cache models within local instances. No analytical records are saved long-term without administrative privilege flags.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
