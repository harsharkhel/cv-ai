import React, { useState, useEffect } from 'react';
import { PageId } from '../types';
import { Eye, EyeOff, Sparkles, Mail, Lock, User, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { completeGoogleRedirectIfNeeded, isFirebaseConfigured, loginWithGoogle } from '../lib/firebaseAuth';
import { googleLogin, loginUser, registerUser, getToken, checkBackendHealth, fetchMe, clearAuth } from '../lib/api';
import { validatePassword } from '../lib/authValidation';

interface LoginProps {
  onNavigate: (page: PageId) => void;
  onLoginSuccess: () => void;
}

export default function Login({ onNavigate, onLoginSuccess }: LoginProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isAttemptingLogin, setIsAttemptingLogin] = useState(false);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);

  useEffect(() => {
    checkBackendHealth().then(setApiOnline);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      setError(`Google sign-in failed (${oauthError}). Try email/password or check backend OAuth config.`);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    if (token) {
      fetchMe()
        .then(() => onLoginSuccess())
        .catch(() => clearAuth());
      return;
    }

    if (!isFirebaseConfigured()) return;

    completeGoogleRedirectIfNeeded()
      .then(async (googleResult) => {
        if (!googleResult) return;
        await googleLogin(googleResult.idToken);
        onLoginSuccess();
      })
      .catch((err: Error) => {
        if (err.message !== 'REDIRECTING') {
          setError(err.message);
        }
      });
  }, [onLoginSuccess]);

  const handleGoogleLogin = async () => {
    if (!isFirebaseConfigured()) {
      setError('Firebase is not configured. Add VITE_FIREBASE_* variables to .env and restart the dev server.');
      return;
    }

    setIsAttemptingLogin(true);
    setError('');
    try {
      const googleResult = await loginWithGoogle();
      await googleLogin(googleResult.idToken);
      onLoginSuccess();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Google sign-in failed.';
      if (message === 'REDIRECTING') {
        setError('Redirecting to Google sign-in…');
        return;
      }
      setError(message);
    } finally {
      setIsAttemptingLogin(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAttemptingLogin(true);

    try {
      if (isSignup) {
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

        await registerUser(name, email, password);
        onLoginSuccess();
      } else {
        if (!email || !password) {
          setError('Please provide both administrative credentials.');
          return;
        }
        if (!email.includes('@')) {
          setError('A valid operational email is required.');
          return;
        }

        await loginUser(email, password);
        onLoginSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Check credentials and that the API is running.');
    } finally {
      setIsAttemptingLogin(false);
    }
  };

  return (
    <div id="login-viewport" className="relative min-h-screen w-full bg-[#050505] text-[#F5F5F5] font-sans selection:bg-white selection:text-black overflow-hidden flex flex-col justify-between">
      
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
          <span className="text-2xl font-serif tracking-tight leading-none">CVAlign</span>
          <span className="text-[10px] tracking-[0.4em] uppercase font-bold text-white/40 ml-0.5">Intelligence</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8">
          <span className="text-[11px] uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-default hidden sm:inline">ATS scoring</span>
          <span className="text-[11px] uppercase tracking-widest text-white/40 hover:text-white transition-colors cursor-default hidden sm:inline">Refinement</span>
          <div className="h-4 w-[1px] bg-white/20 hidden sm:inline"></div>
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
            }}
            className="text-[11px] uppercase tracking-widest font-bold text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            {isSignup ? 'Login Instead' : 'Create Account'}
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
              {isSignup ? 'Build your ATS-grade resume profiles.' : 'Refine your impact with AI analysis.'}
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

        {/* Right Auth Column (Integrated Single-Page Style) */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[420px] backdrop-blur-3xl bg-white/[0.03] border border-white/[0.08] p-8 md:p-10 rounded-2xl shadow-2xl relative transition-all duration-300">
            
            {/* Tab switch mechanism inside the first page layout */}
            <div className="flex border-b border-white/[0.08] mb-6">
              <button
                type="button"
                onClick={() => {
                  setIsSignup(false);
                  setError('');
                }}
                className={`flex-1 pb-3 text-[10px] uppercase tracking-[0.2em] font-semibold transition-all cursor-pointer ${
                  !isSignup ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white'
                }`}
              >
                Login Auth
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignup(true);
                  setError('');
                }}
                className={`flex-1 pb-3 text-[10px] uppercase tracking-[0.2em] font-semibold transition-all cursor-pointer ${
                  isSignup ? 'text-white border-b-2 border-white' : 'text-white/40 hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Welcome messages dynamically based on type */}
            <div className="mb-6">
              {!isSignup ? (
                <>
                  <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-white/80 mb-2">Welcome Back</h3>
                  <p className="text-xs text-white/40">Access your CVAlign dashboard to continue your journey.</p>
                </>
              ) : (
                <>
                  <h3 className="text-xs uppercase tracking-[0.3em] font-semibold text-white/80 mb-2">Create Account</h3>
                  <p className="text-xs text-white/40">Join our predictive recruitment workspace.</p>
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-lg text-xs text-[#EF4444] text-center flex items-center gap-2 justify-center">
                <ShieldAlert size={14} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Extra SIGNUP input - absolutely hidden/invisible when logging in */}
              {isSignup && (
                <div className="space-y-1.5 relative">
                  <label className="text-[9px] uppercase tracking-[0.25em] text-white/50 ml-1 block">Full Name</label>
                  <div className="relative font-sans">
                    <User className="absolute left-3.5 top-3.5 text-white/25" size={14} />
                    <input
                      type="text"
                      required={isSignup}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/10"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
              )}

              {/* Shared field but styled */}
              <div className="space-y-1.5 relative">
                <label className="text-[9px] uppercase tracking-[0.25em] text-white/50 ml-1 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 text-white/25" size={14} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/10"
                    placeholder="name@firm.com"
                  />
                </div>
              </div>

              {/* Shared field */}
              <div className="space-y-1.5 relative">
                <label className="text-[9px] uppercase tracking-[0.25em] text-white/50 ml-1 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 text-white/25" size={14} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-10 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-white/25 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Extra SIGNUP input - absolutely hidden/invisible when logging in */}
              {isSignup && (
                <div className="space-y-1.5 relative">
                  <label className="text-[9px] uppercase tracking-[0.25em] text-white/50 ml-1 block">Confirm Password</label>
                  <div className="relative font-sans">
                    <Lock className="absolute left-3.5 top-3.5 text-white/25" size={14} />
                    <input
                      type="password"
                      required={isSignup}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg pl-10 pr-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isAttemptingLogin}
                className={`w-full bg-white text-black text-[10px] md:text-[11px] uppercase tracking-[0.2em] font-bold py-4 rounded-lg hover:bg-neutral-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)] mt-2 ${
                  isAttemptingLogin ? 'opacity-50 cursor-wait' : 'cursor-pointer'
                }`}
              >
                {isAttemptingLogin
                  ? 'Connecting...'
                  : isSignup
                    ? 'Register Credentials'
                    : 'Initialize Dashboard'}
              </button>

              <div className="relative py-1 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/[0.08]"></div>
                </div>
                <span className="relative z-10 px-4 bg-[#080808]/80 text-[8px] tracking-[0.15em] uppercase text-white/30">Or connect via</span>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isAttemptingLogin}
                className={`w-full border border-white/10 rounded-lg py-3 flex items-center justify-center gap-3 transition-all text-white ${isAttemptingLogin ? 'opacity-50 cursor-wait' : 'hover:bg-white/[0.05] cursor-pointer'}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span className="text-[10px] uppercase tracking-widest font-semibold">
                  {isAttemptingLogin ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-white/40">
              {isSignup ? (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setIsSignup(false);
                      setError('');
                    }}
                    className="text-white hover:underline font-medium ml-1 transition-all cursor-pointer"
                  >
                    Login
                  </button>
                </>
              ) : (
                <>
                  Don't have credentials layout?{' '}
                  <button
                    onClick={() => {
                      setIsSignup(true);
                      setError('');
                    }}
                    className="text-white hover:underline font-medium ml-1 transition-all cursor-pointer"
                  >
                    Create Account
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </main>

      {/* Footer Micro-Metrics */}
      <footer className="relative z-10 px-6 md:px-12 py-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-between items-center max-w-7xl w-full mx-auto">
        <div className="flex gap-12">
          <div className="flex flex-col gap-1 text-left">
            <span className="text-[9px] uppercase tracking-widest text-white/30">API Backend</span>
            <span
              className={`text-[10px] font-mono ${
                apiOnline === null
                  ? 'text-white/40'
                  : apiOnline
                    ? 'text-[#22C55E]'
                    : 'text-[#EF4444]'
              }`}
            >
              {apiOnline === null ? 'CHECKING...' : apiOnline ? 'ONLINE :8000' : 'OFFLINE — run backend'}
            </span>
          </div>
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

