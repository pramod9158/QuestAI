import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { useThemeStyles } from '@/lib/useThemeStyles';
import { Mascot } from '@/components/ui/Mascot';
import { ThemeToggle } from '@/components/ui/ThemeToggle';


export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, profile } = useAuth();
  const ts = useThemeStyles();
  const D = ts.duo;
  const [tab, setTab] = useState<'login' | 'signup'>(() => {
    return location.state?.mode === 'signup' ? 'signup' : 'login';
  });
  const [selectedZone, setSelectedZone] = useState<'junior' | 'innovator'>(location.state?.zone || 'junior');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (profile) navigate('/', { replace: true });
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    // Validate email format
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address (e.g. explorer@school.com)');
      setLoading(false);
      return;
    }

    try {
      if (tab === 'login') {
        const { error } = await signIn(email, password, selectedZone);
        if (error) {
          setError(error);
          setLoading(false);
        } else {
          // The useEffect hook below automatically navigates to '/' once profile is non-null.
          // We set a backup timeout to reset the loading state if the redirect takes time.
          setTimeout(() => setLoading(false), 3500);
        }
      } else {
        if (!username.trim()) { setError('Please enter a username'); setLoading(false); return; }
        const { error } = await signUp(email, password, username, selectedZone);
        if (error) {
          setError(error);
          setLoading(false);
        } else {
          setSuccess('✅ Account created! Please check your email to confirm, then sign in.');
          setTab('login');
          setPassword('');
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error("Auth submit error:", err);
      setError(err?.message || 'An unexpected error occurred. Please try again!');
      setLoading(false);
    }
  };

  return (
    <div
      className={D ? 'min-h-screen flex items-center justify-center p-5 relative overflow-hidden' : 'min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-game'}
      style={D ? ts.page : {}}
    >
      {/* Floating Theme Toggle top-right */}
      <div className="absolute top-5 right-5 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col gap-6"
        >
          {/* Back */}
          <button
            onClick={() => navigate('/onboarding')}
            className={D ? 'flex items-center gap-2 mb-4 font-body text-sm font-bold transition-colors cursor-pointer w-fit' : 'flex items-center gap-2 text-white/40 hover:text-white/70 font-body text-sm w-fit transition-colors'}
            style={D ? { color: '#8B5CF6' } : {}}
          >
            <ArrowLeft className="w-4 h-4" /> {D ? 'Back to Start' : 'Back to Start'}
          </button>

          {/* Logo */}
          <div className="text-center">
            <div className="mb-4 flex justify-center">
              <Mascot type="onboarding" size={100} />
            </div>
            <h1 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 950 : undefined, fontSize: D ? 26 : undefined }} className={D ? '' : 'font-pixel text-[12px] tracking-wider grad-text-primary'}>
              {D ? 'Quest AI' : 'QUEST AI'}
            </h1>
            <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 14 : undefined }} className={D ? '' : 'text-white/40 font-body text-sm mt-2'}>Your AI Learning Adventure</p>
          </div>

          {/* Card */}
          <div
            className="p-6"
            style={ts.card}
          >
            {/* Category Indicator */}
            <div 
              className={D ? 'p-3.5 mb-4 flex flex-col items-center gap-2' : 'p-3 mb-4 flex flex-col items-center gap-2 border-2 border-black'}
              style={D ? {
                background: '#F9F9F9',
                border: '1.5px solid #E0E0E0',
                borderRadius: 12,
              } : { background: '#16103A' }}
            >
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-xl">{selectedZone === 'junior' ? '🚀' : '🧠'}</span>
                <span style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 12 : undefined }} className={D ? '' : 'font-game text-xs text-white uppercase tracking-wider'}>
                  {selectedZone === 'junior' ? 'Junior Explorer' : 'Future Innovator'}
                </span>
                <span style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 10 : undefined }} className={D ? '' : 'text-white/40 font-body text-[10px]'}>
                  ({selectedZone === 'junior' ? 'Ages 6–11' : 'Ages 12–16'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedZone(z => z === 'junior' ? 'innovator' : 'junior')}
                style={D ? { color: '#8B5CF6', fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 11 } : {}}
                className={D ? 'underline cursor-pointer' : 'text-[#FFD60A] hover:opacity-80 font-body text-[11px] underline cursor-pointer'}
              >
                Switch to {selectedZone === 'junior' ? 'Future Innovator' : 'Junior Explorer'}
              </button>
            </div>

            {/* Tabs */}
            <div
              className={D ? '' : 'flex p-1 mb-6'}
              style={D ? {
                display: 'flex',
                background: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                borderRadius: 12,
                padding: 4,
                marginBottom: 24,
                gap: 4,
              } : { background: '#16103A', border: '2px solid #000000' }}
            >
              {(['login', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={D ? 'flex-1 py-2 font-body text-xs font-bold transition-all duration-150 rounded-lg cursor-pointer' : 'flex-1 py-2.5 font-pixel text-[7px] transition-all duration-150 tracking-wide'}
                  style={tab === t ? (D ? {
                    background: '#F0FAF0',
                    color: '#5FCC5F',
                  } : {
                    background: '#7C3AED',
                    color: 'white',
                    border: '1.5px solid #000000',
                    boxShadow: '2px 2px 0px #000000',
                  }) : (D ? { color: '#999999' } : { color: 'rgba(255,255,255,0.4)' })}
                >
                  {t === 'login' ? (D ? 'Sign In' : '🔑 SIGN IN') : (D ? 'Sign Up' : '⭐ SIGN UP')}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {tab === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <label style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 700 : undefined, fontSize: D ? 11 : undefined }} className={D ? 'flex items-center gap-1.5' : 'text-white/55 font-pixel text-[6px] flex items-center gap-2 tracking-wide'}>
                    <User className="w-4 h-4" /> {D ? 'Username' : 'USERNAME'}
                  </label>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="SuperCoder123" className="pixel-input bg-transparent" maxLength={20} required
                    style={D ? {
                      border: '1.5px solid #E0E0E0',
                      borderRadius: 12,
                      padding: 10,
                      fontSize: 13,
                      fontFamily: '"Nunito", sans-serif',
                      color: '#000000',
                    } : {}}
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 700 : undefined, fontSize: D ? 11 : undefined }} className={D ? 'flex items-center gap-1.5' : 'text-white/55 font-pixel text-[6px] flex items-center gap-2 tracking-wide'}>
                  <Mail className="w-4 h-4" /> {D ? 'Email' : 'EMAIL'}
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="explorer@school.com" className="pixel-input bg-transparent" required
                  style={D ? {
                    border: '1.5px solid #E0E0E0',
                    borderRadius: 12,
                    padding: 10,
                    fontSize: 13,
                    fontFamily: '"Nunito", sans-serif',
                    color: '#000000',
                  } : {}}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 700 : undefined, fontSize: D ? 11 : undefined }} className={D ? 'flex items-center gap-1.5' : 'text-white/55 font-pixel text-[6px] flex items-center gap-2 tracking-wide'}>
                  <Lock className="w-4 h-4" /> {D ? 'Password' : 'PASSWORD'}
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="pixel-input bg-transparent" required minLength={6}
                  style={D ? {
                    border: '1.5px solid #E0E0E0',
                    borderRadius: 12,
                    padding: 10,
                    fontSize: 13,
                    fontFamily: '"Nunito", sans-serif',
                    color: '#000000',
                  } : {}}
                />
              </div>

              {error && (
                <div
                  className="px-4 py-3 font-body text-sm"
                  style={D ? {
                    background: '#FFF5F5',
                    border: '1.5px solid #FCA5A5',
                    borderRadius: 12,
                    color: '#EF4444',
                    fontFamily: '"Nunito", sans-serif',
                  } : { background: '#3B1414', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000', color: '#FECACA' }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="px-4 py-3 font-body text-sm"
                  style={D ? {
                    background: '#F0FAF0',
                    border: '1.5px solid #BBF7D0',
                    borderRadius: 12,
                    color: '#5FCC5F',
                    fontFamily: '"Nunito", sans-serif',
                  } : { background: '#0D3B2E', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000', color: '#A7F3D0' }}
                >
                  {success}
                </div>
              )}

              <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                {tab === 'login' ? 'Sign In 🔑' : 'Create Account ⭐'}
              </Button>

              <div className="text-center pt-1">
                {tab === 'login' ? (
                  <button
                    type="button"
                    onClick={() => setTab('signup')}
                    className="font-body text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                    style={{ color: D ? '#8B5CF6' : '#F59E0B', fontFamily: D ? '"Nunito", sans-serif' : undefined }}
                  >
                    {D ? 'New to Quest AI? Sign Up' : '⭐ New to Quest AI? Sign Up'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className={D ? 'text-[#8B5CF6] font-body text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer' : "text-white/55 font-body text-sm font-semibold hover:text-white transition-colors cursor-pointer"}
                    style={D ? { fontFamily: '"Nunito", sans-serif' } : {}}
                  >
                    {D ? 'Already have an account? Sign In' : '🔑 Already have an account? Sign In'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
