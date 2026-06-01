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

  // Redirect if already logged in
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
        setSuccess('✅ Account created! Please check your email to confirm your account, then sign in below.');
        setTab('login');
        setEmail(email);
        setPassword('');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-pixel-darker bg-pixel-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
          {/* Back */}
          <button onClick={() => navigate('/onboarding')} className="flex items-center gap-2 text-white/50 hover:text-white font-body text-sm w-fit">
            <ArrowLeft className="w-4 h-4" /> Back to Start
          </button>

          {/* Logo */}
          <div className="text-center">
            <div className="text-7xl mb-3">🤖</div>
            <h1 className="font-pixel text-white text-lg">AI EXPLORER</h1>
          </div>

          {/* Tabs */}
          <div className="flex border-4 border-black">
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-3 font-game text-sm transition-colors ${tab === t ? 'bg-primary text-white' : 'bg-pixel-dark text-white/50 hover:text-white'}`}
              >
                {t === 'login' ? '🔑 Sign In' : '⭐ Sign Up'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {tab === 'signup' && (
              <div>
                <label className="text-white/70 font-body text-sm mb-1 block flex items-center gap-2">
                  <User className="w-4 h-4" /> Username
                </label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                  placeholder="SuperCoder123" className="pixel-input" maxLength={20} required />
              </div>
            )}
            <div>
              <label className="text-white/70 font-body text-sm mb-1 block flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="explorer@school.com" className="pixel-input" required />
            </div>
            <div>
              <label className="text-white/70 font-body text-sm mb-1 block flex items-center gap-2">
                <Lock className="w-4 h-4" /> Password
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="pixel-input" required minLength={6} />
            </div>

            {error && (
              <div className="bg-pixel-red/20 border-2 border-pixel-red px-4 py-2 text-red-300 font-body text-sm">{error}</div>
            )}
            {success && (
              <div className="bg-success/20 border-2 border-success px-4 py-2 text-green-300 font-body text-sm">{success}</div>
            )}

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {tab === 'login' ? 'SIGN IN 🔑' : 'CREATE ACCOUNT ⭐'}
            </Button>

            <div className="text-center">
              {tab === 'login' ? (
                <button
                  type="button"
                  onClick={() => setTab('signup')}
                  className="text-warning font-body text-sm font-bold hover:opacity-80 underline"
                >
                  ⭐ New to Quest AI? Sign Up
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTab('login')}
                  className="text-white font-body text-sm font-bold hover:opacity-80 underline"
                >
                  🔑 Already have an account? Sign In
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
