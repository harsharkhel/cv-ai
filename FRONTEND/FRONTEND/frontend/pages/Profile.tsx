import React, { useState } from 'react';
import { PageId, AnalysisResult } from '../types';
import {
  User,
  Shield,
  Clock,
  Briefcase,
  Layers,
  Award,
  TrendingUp,
  Mail,
  Edit3,
  Lock,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ProfileProps {
  onNavigate: (page: PageId) => void;
  records: AnalysisResult[];
  onLogout: () => void;
}

export default function Profile({ onNavigate, records, onLogout }: ProfileProps) {
  // Session details simulated from localStorage
  const sessionData = JSON.parse(localStorage.getItem('cvalign_session') || '{"name":"Harsh Arkhel","email":"harsharkhel123@gmail.com"}');
  
  // Profile settings forms state
  const [displayName, setDisplayName] = useState(sessionData.name);
  const [userEmail, setUserEmail] = useState(sessionData.email);
  const [prefCategory, setPrefCategory] = useState('UI/UX Design');
  const [successMsg, setSuccessMsg] = useState('');

  // Password fields state
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  // Delete account placeholder trigger
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Stats
  const totalAnalyses = records.length;
  const bestScore = totalAnalyses > 0 ? Math.max(...records.map(r => r.finalScore)) : 0;
  const avgScore = totalAnalyses > 0 ? Math.round(records.reduce((accum, val) => accum + val.finalScore, 0) / totalAnalyses) : 0;

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('cvalign_session', JSON.stringify({ name: displayName, email: userEmail }));
    setSuccessMsg('Administrative settings profile saved and synced successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currPassword || !newPassword || !confirmPass) {
      alert('Password updates require all fields complete.');
      return;
    }
    if (newPassword !== confirmPass) {
      alert('Encryption confirmation strings mismatch.');
      return;
    }
    setSuccessMsg('Operational passkey updated successfully. Clean sessions cached.');
    setCurrPassword('');
    setNewPassword('');
    setConfirmPass('');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

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

  return (
    <div id="user-profile-container" className="space-y-8 pb-12 font-sans relative">
      
      {/* Title */}
      <div>
        <div className="w-12 h-[1px] bg-white mb-3"></div>
        <h2 className="font-serif text-3xl font-light tracking-tight text-white mb-2">
          User Settings & <span className="italic font-normal">Profile</span>
        </h2>
        <p className="text-sm text-[#A3A3A3]">
          Manage diagnostic credentials, operational preferences, and session logs.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-[#22C55E]/15 border border-[#22C55E]/30 rounded-xl text-xs text-[#22C55E] flex items-center gap-3">
          <CheckCircle size={15} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Row 1: Profile card banner and quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Card Summary Banner (4 cols) */}
        <div className="lg:col-span-4 bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 flex flex-col items-center justify-between text-center min-h-[350px]">
          
          <div className="space-y-4">
            {/* Avatar using precise pixel source */}
            <div className="relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD_VeqDCSnYtfXofLWcXWzdMviDdm_QK-AWGCXm77jxVVdExZ_2QbciyKxvw-zO60OEjQW4yPq4Mpj4W4Hgw8tPSokD4xRR3hq_8zNf6urFPxmsMTHdX7f6_LChHQ0v7N4D5vybFCdIOxrMg31UJV-hjbH-tMUBdgJRVfRpikjhX5d4OtCFOWZs-gvjEdBbBQGfCgg-5P_UABgbqZs5BFZmdr_N4mpWaMLBzBd6hjvAoWV1rVd9i85rL01fkx_Y7sbRAFOIeOpZB5Iq"
                alt="user avatar profile"
                className="w-24 h-24 rounded-full border-2 border-white/20 object-cover grayscale mx-auto shadow-xl"
              />
              <span className="absolute bottom-1 right-8 w-4 h-4 bg-[#22C55E] border-2 border-[#121212] rounded-full" />
            </div>

            <div>
              <h3 className="font-serif text-xl font-bold text-white">{displayName}</h3>
              <p className="text-xs text-[#A3A3A3] font-mono mt-1">{userEmail}</p>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold bg-white/10 text-[#94A3B8] px-2.5 py-1 rounded-lg">
                <Shield size={10} />
                <span>AI Career Tool</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] px-2.5 py-1 rounded-lg">
                <span>ACTIVE PRO</span>
              </span>
            </div>
          </div>

          <div className="border-t border-white/5 pt-4 w-full text-xs text-[#737373] flex items-center justify-center gap-2">
            <Clock size={12} />
            <span>Operational since: May 2026</span>
          </div>
        </div>

        {/* Bento statistical aggregates (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-sans font-semibold text-[#737373] uppercase tracking-wider">
                Total Analyses
              </span>
              <Layers size={14} className="text-[#94A3B8]" />
            </div>
            <div>
              <h3 className="text-4xl font-serif font-bold text-white mb-2">{totalAnalyses}</h3>
              <p className="text-xs text-[#A3A3A3]">Matches tested in workspace</p>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-sans font-semibold text-[#737373] uppercase tracking-wider">
                Best Aligned Index
              </span>
              <Award size={14} className="text-[#22C55E]" />
            </div>
            <div>
              <h3 className="text-4xl font-serif font-bold text-[#22C55E] mb-2">{bestScore}%</h3>
              <p className="text-xs text-[#A3A3A3]">Peak matching optimization score achieved</p>
            </div>
          </div>

          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-sans font-semibold text-[#737373] uppercase tracking-wider">
                Average Match Density
              </span>
              <TrendingUp size={14} className="text-[#94A3B8]" />
            </div>
            <div>
              <h3 className="text-4xl font-serif font-bold text-white mb-2">{avgScore}%</h3>
              <p className="text-xs text-[#A3A3A3]">Mid-point correlation indexes</p>
            </div>
          </div>

          {/* Guidelines notes */}
          <div className="col-span-1 sm:col-span-3 bg-white/5 border border-white/10 rounded-xl p-4 flex gap-3 text-xs text-[#A3A3A3] items-center font-mono">
            <Briefcase size={16} className="text-[#94A3B8]" />
            <span>Preferred career track targeted: <strong className="text-white font-medium font-sans">{prefCategory}</strong></span>
          </div>
        </div>

      </div>

      {/* Row 2: Settings panels forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Settings 1: Edit Profile details */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 space-y-4">
          <h4 className="font-serif text-base text-white font-semibold flex items-center gap-2 border-b border-white/5 pb-2">
            <Edit3 size={15} className="text-[#94A3B8]" />
            <span>Administrative Profile Identity</span>
          </h4>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] pl-0.5 mb-1">
                Operational Display Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] pl-0.5 mb-1">
                Administrative Email Address
              </label>
              <input
                type="email"
                required
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] pl-0.5 mb-1">
                Preferred Career target Category
              </label>
              <select
                value={prefCategory}
                onChange={(e) => setPrefCategory(e.target.value)}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
              >
                {categories.map((c, i) => (
                  <option key={i} value={c} className="bg-neutral-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-black hover:bg-[#F5F5F5] transition-all text-xs font-bold py-3 rounded-lg uppercase tracking-wider cursor-pointer font-sans"
            >
              Update Profile Details
            </button>
          </form>
        </div>

        {/* Settings 2: Change Password & Security options */}
        <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.08] rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h4 className="font-serif text-base text-white font-semibold flex items-center gap-2 border-b border-white/5 pb-2">
              <Lock size={15} className="text-[#94A3B8]" />
              <span>Security Passkeys</span>
            </h4>

            <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] pl-0.5 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] pl-0.5 mb-1">
                    New Passkey
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[9px] uppercase tracking-wider text-[#A3A3A3] pl-0.5 mb-1">
                    Confirm Passkey
                  </label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-white placeholder-[#737373] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-transparent border border-white/10 hover:border-white/30 text-white text-xs font-bold py-3 rounded-lg uppercase tracking-wider transition-all cursor-pointer font-sans"
              >
                Change Operational Password
              </button>
            </form>
          </div>

          {/* Delete account */}
          <div className="border-t border-white/5 pt-4">
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs text-[#EF4444] hover:underline flex items-center gap-1.5 cursor-pointer font-sans"
              >
                <Trash2 size={13} />
                <span>Delete Account Placeholder</span>
              </button>
            ) : (
              <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/20 rounded-xl flex items-center justify-between text-xs text-[#EF4444]">
                <span className="flex items-center gap-1.5 font-medium leading-none font-sans">
                  <AlertTriangle size={14} className="animate-bounce" />
                  <span>Permanent Account Purge?</span>
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      alert('Account node deleted in simulated memory instances.');
                      onLogout();
                    }}
                    className="bg-[#EF4444] text-white font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-white/5 border border-white/10 font-bold px-3 py-1.5 rounded-lg text-white cursor-pointer"
                  >
                    No
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
