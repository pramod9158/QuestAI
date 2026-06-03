import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, ArrowLeft } from 'lucide-react';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp, profile } = useAuth();
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
    if (tab === 'login') {
      const { error } = await signIn(email, password, selectedZone);
      if (error) setError(error);
      else navigate('/');
    } else {
      if (!username.trim()) { setError('Please enter a username'); setLoading(false); return; }
      const { error } = await signUp(email, password, username, selectedZone);
      if (error) setError(error);
      else {
        setSuccess('✅ Account created! Please check your email to confirm, then sign in.');
        setTab('login');
        setPassword('');
      }
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-game"
    >
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
            className="flex items-center gap-2 text-white/40 hover:text-white/70 font-body text-sm w-fit transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Start
          </button>

          {/* Logo */}
          <div className="text-center">
            <motion.div
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="text-7xl mb-4"
            >
              🤖
            </motion.div>
            <h1 className="font-pixel text-[12px] tracking-wider grad-text-primary">
              QUEST AI
            </h1>
            <p className="text-white/40 font-body text-sm mt-2">Your AI Learning Adventure</p>
          </div>

          {/* Card */}
          <div
            className="p-6"
            style={{
              background: '#1E1B4B',
              border: '3px solid #000000',
              boxShadow: '6px 6px 0px 0px #000000',
            }}
          >
            {/* Category Indicator */}
            <div 
              className="p-3 mb-4 flex flex-col items-center gap-2 border-2 border-black"
              style={{ background: '#16103A' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedZone === 'junior' ? '🚀' : '🧠'}</span>
                <span className="font-game text-xs text-white uppercase tracking-wider">
                  {selectedZone === 'junior' ? 'Junior Explorer' : 'Future Innovator'}
                </span>
                <span className="text-white/40 font-body text-[10px]">
                  ({selectedZone === 'junior' ? 'Ages 6–11' : 'Ages 12–16'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedZone(z => z === 'junior' ? 'innovator' : 'junior')}
                className="text-[#FFD60A] hover:opacity-80 font-body text-[11px] underline cursor-pointer"
              >
                Switch to {selectedZone === 'junior' ? 'Future Innovator' : 'Junior Explorer'}
              </button>
            </div>

            {/* Tabs */}
            <div
              className="flex p-1 mb-6"
              style={{ background: '#16103A', border: '2px solid #000000' }}
            >
              {(['login', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2.5 font-pixel text-[7px] transition-all duration-150 tracking-wide"
                  style={tab === t ? {
                    background: '#7C3AED',
                    color: 'white',
                    border: '1.5px solid #000000',
                    boxShadow: '2px 2px 0px #000000',
                  } : { color: 'rgba(255,255,255,0.4)' }}
                >
                  {t === 'login' ? '🔑 SIGN IN' : '⭐ SIGN UP'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {tab === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/55 font-pixel text-[6px] flex items-center gap-2 tracking-wide">
                    <User className="w-4 h-4" /> USERNAME
                  </label>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="SuperCoder123" className="pixel-input" maxLength={20} required
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-white/55 font-pixel text-[6px] flex items-center gap-2 tracking-wide">
                  <Mail className="w-4 h-4" /> EMAIL
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="explorer@school.com" className="pixel-input" required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-white/55 font-pixel text-[6px] flex items-center gap-2 tracking-wide">
                  <Lock className="w-4 h-4" /> PASSWORD
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="pixel-input" required minLength={6}
                />
              </div>

              {error && (
                <div
                  className="px-4 py-3 font-body text-sm text-red-300"
                  style={{ background: '#3B1414', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="px-4 py-3 font-body text-sm text-green-300"
                  style={{ background: '#0D3B2E', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
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
                    className="font-body text-sm font-semibold hover:opacity-80 transition-opacity"
                    style={{ color: '#F59E0B' }}
                  >
                    ⭐ New to Quest AI? Sign Up
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-white/55 font-body text-sm font-semibold hover:text-white transition-colors"
                  >
                    🔑 Already have an account? Sign In
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
