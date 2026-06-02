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
      const { error } = await signIn(email, password);
      if (error) setError(error);
      else navigate('/');
    } else {
      if (!username.trim()) { setError('Please enter a username'); setLoading(false); return; }
      const zone = location.state?.zone || 'junior';
      const { error } = await signUp(email, password, username, zone);
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
      className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A1040 50%, #0D1A2E 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="gradient-orb gradient-orb-primary" style={{ width: 280, height: 280, top: -80, left: -60, opacity: 0.5 }} />
      <div className="gradient-orb gradient-orb-mission" style={{ width: 200, height: 200, bottom: -40, right: -40, opacity: 0.4, animationDelay: '-5s' }} />
      <div className="gradient-orb gradient-orb-xp" style={{ width: 160, height: 160, top: '40%', right: '5%', opacity: 0.25, animationDelay: '-9s' }} />

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
            <h1
              className="font-heading font-bold text-2xl"
              style={{
                background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              QUEST AI
            </h1>
            <p className="text-white/40 font-body text-sm mt-1">Your AI Learning Adventure</p>
          </div>

          {/* Card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(127,90,240,0.25)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
            }}
          >
            {/* Tabs */}
            <div
              className="flex rounded-xl p-1 mb-6"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              {(['login', 'signup'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2.5 rounded-xl font-heading font-semibold text-sm transition-all duration-200"
                  style={tab === t ? {
                    background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(127,90,240,0.4)',
                  } : { color: 'rgba(255,255,255,0.45)' }}
                >
                  {t === 'login' ? '🔑 Sign In' : '⭐ Sign Up'}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {tab === 'signup' && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-white/60 font-body text-sm flex items-center gap-2">
                    <User className="w-4 h-4" /> Username
                  </label>
                  <input
                    type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="SuperCoder123" className="pixel-input" maxLength={20} required
                  />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 font-body text-sm flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email
                </label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="explorer@school.com" className="pixel-input" required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 font-body text-sm flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Password
                </label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" className="pixel-input" required minLength={6}
                />
              </div>

              {error && (
                <div
                  className="px-4 py-3 rounded-xl font-body text-sm text-red-300"
                  style={{ background: 'rgba(242,95,76,0.15)', border: '1px solid rgba(242,95,76,0.4)' }}
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="px-4 py-3 rounded-xl font-body text-sm text-green-300"
                  style={{ background: 'rgba(44,182,125,0.15)', border: '1px solid rgba(44,182,125,0.4)' }}
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
                    style={{ color: '#FFD60A' }}
                  >
                    ⭐ New to Quest AI? Sign Up
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="text-white/60 font-body text-sm font-semibold hover:text-white transition-colors"
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
