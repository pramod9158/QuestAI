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
    gradFrom: '#00C2FF',
    gradTo: '#5B5FFF',
    glowColor: 'rgba(0,194,255,0.35)',
    borderColor: 'rgba(0,194,255,0.4)',
  },
  {
    id: 'innovator',
    age: '12–16',
    emoji: '🧠',
    title: 'Future Innovator',
    desc: 'Dive into AI ethics, prompts, and real-world problem solving!',
    gradFrom: '#7F5AF0',
    gradTo: '#2CB67D',
    glowColor: 'rgba(127,90,240,0.35)',
    borderColor: 'rgba(127,90,240,0.4)',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();

  const handleZoneSelect = (z: 'junior' | 'innovator') => {
    navigate('/auth', { state: { mode: 'signup', zone: z } });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A1040 50%, #0D1A2E 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="gradient-orb gradient-orb-primary" style={{ width: 300, height: 300, top: -80, left: -60, opacity: 0.5 }} />
      <div className="gradient-orb gradient-orb-mission" style={{ width: 220, height: 220, bottom: -60, right: -50, opacity: 0.4, animationDelay: '-6s' }} />
      <div className="gradient-orb gradient-orb-xp" style={{ width: 150, height: 150, top: '30%', right: '0%', opacity: 0.2, animationDelay: '-3s' }} />

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
              <h1
                className="font-heading font-bold text-3xl"
                style={{
                  background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                QUEST AI
              </h1>
              <p className="font-body text-white/50 text-sm mt-2">Your AI Learning Adventure Awaits!</p>
            </div>

            {/* Gradient divider */}
            <div
              className="w-full h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(127,90,240,0.6), rgba(44,182,125,0.6), transparent)' }}
            />

            <p className="font-heading font-bold text-white text-xl text-center">How old are you?</p>

            <div className="w-full flex flex-col gap-4">
              {ZONES.map((z) => (
                <motion.button
                  key={z.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleZoneSelect(z.id as 'junior' | 'innovator')}
                  className="w-full p-5 rounded-2xl flex items-center gap-4 text-left cursor-pointer transition-all"
                  style={{
                    background: `linear-gradient(135deg, rgba(${z.gradFrom === '#00C2FF' ? '0,194,255' : '127,90,240'},0.18) 0%, rgba(${z.gradTo === '#5B5FFF' ? '91,95,255' : '44,182,125'},0.10) 100%)`,
                    border: `1px solid ${z.borderColor}`,
                    boxShadow: `0 8px 30px ${z.glowColor}, inset 0 1px 0 rgba(255,255,255,0.08)`,
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${z.gradFrom}, ${z.gradTo})`,
                      boxShadow: `0 4px 16px ${z.glowColor}`,
                    }}
                  >
                    {z.emoji}
                  </div>
                  <div>
                    <div className="text-white font-heading font-bold text-lg">{z.title}</div>
                    <div className="text-white/50 font-body text-xs mt-0.5">Ages {z.age}</div>
                    <div className="text-white/70 font-body text-sm mt-1">{z.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col gap-3 items-center mt-2">
              <button
                onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                className="font-body text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ color: '#FFD60A' }}
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
