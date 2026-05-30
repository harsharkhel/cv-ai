import React from 'react';
import { PageId } from '../types';
import {
  LayoutDashboard,
  FileSearch,
  CheckSquare,
  History,
  Database,
  User,
  LogOut,
  Sparkles,
  X
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export default function Sidebar({ currentPage, onNavigate, isOpen, onCloseMobile }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze Resume', icon: FileSearch },
    { id: 'results', label: 'Results', icon: CheckSquare },
    { id: 'history', label: 'History Analytics', icon: History },
    { id: 'market-data', label: 'Market Data', icon: Database },
    { id: 'profile', label: 'Profile', icon: User }
  ] as const;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-64 z-50 bg-[#050505]/90 backdrop-blur-xl border-r border-white/[0.08] flex flex-col justify-between py-8 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Sidebar Top: Logo / Close Button */}
          <div className="px-6 flex items-center justify-between mb-10">
            <div>
              <h1 className="font-serif text-2xl font-semibold text-[#F5F5F5] tracking-tight flex items-center gap-2">
                CVAlign <span className="text-xs bg-white/10 text-white px-1.5 py-0.5 rounded font-sans tracking-wide">AI</span>
              </h1>
              <p className="text-[10px] uppercase font-sans tracking-[0.2em] text-[#A3A3A3] mt-1 ml-0.5">
                Intelligence
              </p>
            </div>
            {/* Close Mobile Menu */}
            <button
              onClick={onCloseMobile}
              className="md:hidden text-[#A3A3A3] hover:text-white transition-colors p-1"
            >
              <X size={18} />
            </button>
          </div>
 
          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col gap-1 px-3">
            {menuItems.map(item => {
              const IconComp = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-md transition-all group font-sans text-sm ${
                    isActive
                      ? 'bg-white/10 text-white font-medium border-l-2 border-white'
                      : 'text-[#A3A3A3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <IconComp
                    size={16}
                    className={`transition-transform duration-200 group-hover:scale-105 ${
                      isActive ? 'text-white' : 'text-[#737373] group-hover:text-[#A3A3A3]'
                    }`}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
 
          {/* Sidebar Footer */}
        <div className="px-4">
          {/* Upgrade Banner (Premium, no separating childish blocks) */}
          <div className="mb-6 p-4 rounded-lg bg-white/[0.02] border border-white/[0.08] text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-1">
              <Sparkles size={12} className="text-[#94A3B8] animate-pulse" />
            </div>
            <div className="w-8 h-[1px] bg-white mb-2 mx-auto"></div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-1">
              CVAlign Pro
            </h4>
            <p className="text-[10px] text-[#A3A3A3] mb-3 leading-relaxed">
              Unlock unlimited ATS comparisons & deeper AI advice.
            </p>
            <button className="w-full bg-[#F5F5F5] text-black hover:bg-white text-[11px] font-bold py-2 rounded transition-all tracking-wider uppercase">
              Upgrade
            </button>
          </div>

          {/* User Signout */}
          <button
            onClick={() => onNavigate('login')}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-md text-[#EF4444]/80 hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all text-sm font-medium"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
