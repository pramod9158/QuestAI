import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useThemeStyles } from '@/lib/useThemeStyles';
import { Mascot } from '@/components/ui/Mascot';

const ZONES = [
  {
    id: 'junior',
    age: '6–11',
    emoji: '🚀',
    title: 'Junior Explorer',
    desc: 'Discover AI magic through games, stories & fun!',
    gradFrom: '#3B82F6',
    gradTo: '#8B5CF6',
    border: '#3B82F6',
    shadow: '#1D4ED8',
  },
  {
    id: 'innovator',
    age: '12–16',
    emoji: '🧠',
    title: 'Future Innovator',
    desc: 'Dive into AI ethics, prompts, and real-world problem solving!',
    gradFrom: '#7C3AED',
    gradTo: '#3B82F6',
    border: '#7C3AED',
    shadow: '#5B21B6',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user, isGuest, updateProfile } = useAuth();
  const ts = useThemeStyles();
  const D = ts.duo;

  const handleZoneSelect = async (z: 'junior' | 'innovator') => {
    if (user || isGuest) {
      await updateProfile({ zone: z });
      if (user) {
        await supabase.auth.updateUser({ data: { zone: z } });
      }
      navigate('/');
    } else {
      navigate('/auth', { state: { mode: 'signup', zone: z } });
    }
  };

  return (
    <div
      className={D ? 'min-h-screen flex items-center justify-center p-5 relative overflow-hidden' : 'min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-game'}
      style={D ? ts.page : {}}
    >
      <div className="w-full max-w-sm relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key="zone"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="flex flex-col items-center gap-7"
          >
            {/* Header */}
            <div className="text-center">
              <div className="mb-5 flex justify-center">
                <Mascot type="onboarding" size={120} />
              </div>
              <h1 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 950 : undefined, fontSize: D ? 28 : undefined }} className={D ? '' : 'font-pixel text-[14px] tracking-wider grad-text-primary'}>
                {D ? 'Quest AI' : 'QUEST AI'}
              </h1>
              <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 14 : undefined }} className={D ? '' : 'font-body text-white/50 text-sm mt-3'}>Your AI Learning Adventure Awaits!</p>
            </div>

            {/* Divider */}
            <div style={{ height: 1, width: '100%', background: ts.divider }} className={D ? 'my-1' : 'pixel-divider w-full'} />

            <p style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 18 : undefined }} className={D ? '' : 'font-game text-white text-xl text-center'}>How old are you?</p>

            <div className="w-full flex flex-col gap-4">
              {ZONES.map((z) => (
                <motion.button
                  key={z.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleZoneSelect(z.id as 'junior' | 'innovator')}
                  className="w-full p-5 flex items-center gap-4 text-left cursor-pointer transition-all"
                  style={D ? {
                    background: '#FFFFFF',
                    border: '1.5px solid #E0E0E0',
                    borderRadius: 20,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  } : {
                    background: '#1E1B4B',
                    border: '3px solid #000000',
                    boxShadow: '6px 6px 0px 0px #000000',
                  }}
                >
                  <div
                    className={D ? '' : 'w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0'}
                    style={D ? {
                      width: 56,
                      height: 56,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      background: z.gradFrom,
                      borderRadius: 14,
                      border: '1.5px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                      flexShrink: 0,
                    } : {
                      background: z.gradFrom,
                      border: '2px solid #000000',
                      boxShadow: '2px 2px 0px #000000',
                    }}
                  >
                    {z.emoji}
                  </div>
                  <div>
                    <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 16 : undefined }} className={D ? '' : 'text-white font-game text-lg'}>{z.title}</div>
                    <div style={D ? { color: z.gradFrom, fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10, marginTop: 2 } : {}} className={D ? '' : 'text-white/45 font-pixel text-[6px] mt-0.5 tracking-wide'}>AGES {z.age}</div>
                    <div style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 13 : undefined }} className={D ? '' : 'text-white/65 font-body text-sm mt-1'}>{z.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col gap-3 items-center mt-2">
              <button
                onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                className="font-body text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: D ? '#8B5CF6' : '#F59E0B', fontFamily: D ? '"Nunito", sans-serif' : undefined }}
              >
                {D ? 'New to Quest AI? Sign Up' : '⭐ New to Quest AI? Sign Up'}
              </button>
              <button
                onClick={() => navigate('/auth', { state: { mode: 'login' } })}
                className={D ? 'text-[#8B5CF6] font-body text-sm font-semibold hover:opacity-80 transition-opacity cursor-pointer' : "text-white/50 font-body text-sm font-semibold hover:text-white transition-colors cursor-pointer"}
                style={D ? { fontFamily: '"Nunito", sans-serif' } : {}}
              >
                {D ? 'Already have an account? Sign In' : '🔑 Already have an account? Sign In'}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
