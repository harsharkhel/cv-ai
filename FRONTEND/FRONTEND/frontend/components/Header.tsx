import React from 'react';
import { PageId } from '../types';
import { Search, Bell, Menu, ShieldCheck, PlusCircle } from 'lucide-react';
import { getSession } from '../lib/api';

interface HeaderProps {
  onMenuToggle: () => void;
  onNavigate: (page: PageId) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function Header({
  onMenuToggle,
  onNavigate,
  searchQuery,
  onSearchChange
}: HeaderProps) {
  const session = getSession();
  const displayName = session?.name?.split(' ')[0] || 'User';
  const avatarUrl = session?.profile_picture;

  return (
    <header className="sticky top-0 z-30 bg-[#050505]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
      {/* Mobile Menu Trigger & Search */}
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-[#A3A3A3] hover:text-white p-2"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div className="relative hidden sm:block max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#737373]" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search alignments, history, roles..."
            className="w-full bg-[#121212]/50 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs text-[#F5F5F5] placeholder-[#737373] focus:outline-none focus:border-[#94A3B8]/65 focus:ring-0 transition-all font-sans"
          />
        </div>
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-6">
        {/* Analyze Now Quick-Action */}
        <button
          onClick={() => onNavigate('analyze')}
          className="hidden md:flex items-center gap-2 bg-[#F5F5F5] text-black hover:bg-white text-xs font-bold px-4 py-2 rounded-full transition-all tracking-wider uppercase"
        >
          <PlusCircle size={14} />
          <span>Analyze Now</span>
        </button>

        {/* Notifications and Badges */}
        <div className="flex items-center gap-3">
          {/* Notifications Trigger */}
          <button className="relative text-[#A3A3A3] hover:text-white transition-colors p-1.5 rounded-full hover:bg-white/5">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#EF4444] rounded-full" />
          </button>

          <div className="h-4 w-px bg-white/10" />

          {/* User Meta Information (Harsh) */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-semibold text-[#F5F5F5] leading-none">{displayName}</span>
              <span className="inline-flex items-center gap-1 text-[9px] text-[#94A3B8] uppercase font-sans tracking-wide mt-1.5 leading-none">
                <ShieldCheck size={10} />
                <span>AI Career Tool</span>
              </span>
            </div>
            <div className="relative cursor-pointer group" onClick={() => onNavigate('profile')}>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-8 h-8 rounded-full border border-white/20 object-cover transition-transform hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-[10px] font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#22C55E] border-2 border-[#050505] rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
