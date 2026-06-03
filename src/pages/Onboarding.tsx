import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleZoneSelect = (z: 'junior' | 'innovator') => {
    navigate('/auth', { state: { mode: 'signup', zone: z } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden bg-game">
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
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                className="text-8xl mb-5"
              >
                🤖
              </motion.div>
              <h1 className="font-pixel text-[14px] tracking-wider grad-text-primary">
                QUEST AI
              </h1>
              <p className="font-body text-white/50 text-sm mt-3">Your AI Learning Adventure Awaits!</p>
            </div>

            {/* Pixel divider */}
            <div className="pixel-divider w-full" />

            <p className="font-game text-white text-xl text-center">How old are you?</p>

            <div className="w-full flex flex-col gap-4">
              {ZONES.map((z) => (
                <motion.button
                  key={z.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleZoneSelect(z.id as 'junior' | 'innovator')}
                  className="w-full p-5 flex items-center gap-4 text-left cursor-pointer transition-all"
                  style={{
                    background: '#1E1B4B',
                    border: '3px solid #000000',
                    boxShadow: '6px 6px 0px 0px #000000',
                  }}
                >
                  <div
                    className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${z.gradFrom}, ${z.gradTo})`,
                      border: '2px solid #000000',
                      boxShadow: '2px 2px 0px #000000',
                    }}
                  >
                    {z.emoji}
                  </div>
                  <div>
                    <div className="text-white font-game text-lg">{z.title}</div>
                    <div className="text-white/45 font-pixel text-[6px] mt-0.5 tracking-wide">AGES {z.age}</div>
                    <div className="text-white/65 font-body text-sm mt-1">{z.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col gap-3 items-center mt-2">
              <button
                onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                className="font-body text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#F59E0B' }}
              >
                ⭐ New to Quest AI? Sign Up
              </button>
              <button
                onClick={() => navigate('/auth', { state: { mode: 'login' } })}
                className="text-white/50 font-body text-sm font-semibold hover:text-white transition-colors"
              >
                🔑 Already have an account? Sign In
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
