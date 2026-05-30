import React, { useState } from 'react';
import { PageId } from '../types';
import { ShieldAlert, Sparkles, User, Mail, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { registerUser } from '../lib/api';
import { validatePassword } from '../lib/authValidation';

interface SignupProps {
  onNavigate: (page: PageId) => void;
  onSignupSuccess: () => void;
}

export default function Signup({ onNavigate, onSignupSuccess }: SignupProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('All administrative credentials are strictly required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Confirmation match failed. Review your encryption password string.');
      return;
    }
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      await registerUser(name, email, password);
      onSignupSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed. Is the API running?';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="signup-viewport" className="relative min-h-screen w-full bg-[#050505] text-[#F5F5F5] font-sans selection:bg-white selection:text-black overflow-hidden flex flex-col justify-between">
      
      {/* Cinematic Background Architecture Mockup */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute right-0 bottom-0 w-[60%] h-full bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
        <div className="absolute right-[-10%] top-[-20%] w-[800px] h-[1200px] bg-gradient-to-br from-[#1A1A1A] to-transparent transform -rotate-12 blur-3xl opacity-30"></div>
        {/* Mock Skyscraper Geometry */}
        <div className="absolute right-[10%] bottom-0 w-[1px] h-full bg-white/10"></div>
        <div className="absolute right-[30%] bottom-0 w-[1px] h-[80%] bg-white/5"></div>
        <div className="absolute right-[50%] bottom-0 w-[1px] h-[60%] bg-white/5"></div>
        <div className="absolute bottom-[20%] right-0 w-full h-[1px] bg-white/10"></div>
      </div>

      {/* Large Background Text (Cinematic) */}
      <div className="absolute inset-0 flex items-center justify-center z-0">
        <h1 className="text-[22vw] font-black text-white/[0.012] tracking-tighter select-none whitespace-nowrap">ALIGN CV</h1>
      </div>

      {/* Global Grain Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 bg-image-grain opacity-[0.03]" />

      {/* Header Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-8 max-w-7xl w-full mx-auto">
        <div className="flex flex-col cursor-pointer" onClick={() => onNavigate('login')}>
          <span className="text-2xl font-serif tracking-tight leading-none flex items-center gap-1">CVAlign</span>
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-white/40 ml-0.5">Intelligence</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <span className="text-[11px] uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-default hidden sm:inline">ATS scoring</span>
          <span className="text-[11px] uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-default hidden sm:inline">Refinement</span>
          <div className="h-4 w-[1px] bg-white/20 hidden sm:inline"></div>
          <button
            onClick={() => onNavigate('login')}
            className="text-[11px] uppercase tracking-widest font-bold text-white/80 hover:text-white transition-colors"
          >
            Login Instead
          </button>
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 items-center px-6 md:px-12 max-w-7xl w-full mx-auto py-12 gap-12">
        
        {/* Left Branding/Hero Column */}
        <div className="lg:col-span-6 lg:pr-12 text-left">
          <div className="max-w-md">
            <div className="w-12 h-[1px] bg-white mb-8"></div>
            <h2 className="text-4xl md:text-5xl font-serif leading-[1.1] mb-6 italic text-white font-light">
              Build your ATS-grade resume profiles.
            </h2>
            <p className="text-[#A3A3A3] text-sm md:text-base leading-relaxed mb-8">
              Analyze your resume with ATS-grade intelligence. Turn your documents into high-performance career assets through precision alignment.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-[9px] uppercase tracking-[0.2em] font-medium text-white/40">
              <span>ATS SCORING</span>
              <span className="w-1 h-1 bg-white/40 rounded-full"></span>
              <span>KEYWORD EXTRACTION</span>
              <span className="w-1 h-1 bg-white/40 rounded-full"></span>
              <span>JOB-FIT INDEX</span>
            </div>
          </div>
        </div>

        {/* Right Signup Column (Integrated Style) */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[420px] backdrop-blur-3xl bg-white/[0.03] border border-white/[0.08] p-8 md:p-10 rounded-2xl shadow-2xl relative">
            
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-white/80 mb-1">Create Account</h3>
              <p className="text-xs text-white/40">Join our predictive recruitment workspace.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-lg text-xs text-[#EF4444] text-center flex items-center gap-2 justify-center">
                <ShieldAlert size={14} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-1 relative">
                <label className="text-[9px] uppercase tracking-[0.25em] text-white/50 ml-1 block">Full Name</label>
                <div className="relative font-sans">
                  <User className="absolute left-3.5 top-3 text-white/25" size={14} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/10"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-[9px] uppercase tracking-[0.25em] text-white/50 ml-1 block">Email Address</label>
                <div className="relative font-sans">
                  <Mail className="absolute left-3.5 top-3 text-white/25" size={14} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/10"
                    placeholder="name@firm.com"
                  />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-[9px] uppercase tracking-[0.25em] text-white/50 ml-1 block">Password</label>
                <div className="relative font-sans">
                  <Lock className="absolute left-3.5 top-3 text-white/25" size={14} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-[9px] uppercase tracking-[0.25em] text-white/50 ml-1 block">Confirm Password</label>
                <div className="relative font-sans">
                  <Lock className="absolute left-3.5 top-3 text-white/25" size={14} />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-white text-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold py-3.5 rounded-lg hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] mt-2 ${
                  isSubmitting ? 'opacity-50 cursor-wait' : 'cursor-pointer'
                }`}
              >
                {isSubmitting ? 'Connecting...' : 'Register Credentials'}
              </button>

              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]"></div>
                </div>
                <span className="relative z-10 px-4 bg-[#080808]/80 text-[8px] tracking-[0.15em] uppercase text-white/30">Or connect via</span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full border border-white/10 rounded-lg py-2.5 flex items-center justify-center gap-3 hover:bg-white/[0.05] transition-all cursor-pointer text-white"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-[10px] uppercase tracking-widest font-semibold">Google Account</span>
              </button>
            </form>

            <div className="mt-4 text-center text-xs text-white/40">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-white hover:underline hover:text-white font-medium ml-1 transition-all cursor-pointer"
              >
                Login
              </button>
            </div>

          </div>
        </div>
      </main>

      {/* Footer Micro-Metrics */}
      <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center max-w-7xl w-full mx-auto">
        <div className="flex gap-12">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[9px] uppercase tracking-widest text-white/30">Current Version</span>
            <span className="text-[10px] font-mono text-white/70">v2.4.0-STABLE</span>
          </div>
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[9px] uppercase tracking-widest text-[#737373]">Security Node</span>
            <span className="text-[10px] font-mono text-white/70">ENC-SHA-512</span>
          </div>
        </div>
        <div className="flex gap-6 text-[9px] uppercase tracking-widest text-[#737373]">
          <span className="hover:text-white cursor-pointer">Privacy Protocol</span>
          <span className="hover:text-white cursor-pointer">Terms of Access</span>
          <span>&copy; {new Date().getFullYear()} CVALIGN LTD</span>
        </div>
      </footer>

      {/* Subliminal Horizontal Title (Simulating Animation) */}
      <div className="absolute bottom-24 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.06] pointer-events-none z-0">
        <div className="text-[80px] font-black uppercase tracking-[1em] text-white flex gap-12">
          <span className="animate-pulse">CVALIGN AI</span>
        </div>
      </div>
    </div>
  );
}
