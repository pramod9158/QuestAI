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
    color: 'bg-blue-game',
    borderColor: 'border-blue-game',
    shadowColor: 'shadow-pixel-blue',
  },
  {
    id: 'innovator',
    age: '12–16',
    emoji: '🧠',
    title: 'Future Innovator',
    desc: 'Dive into AI ethics, prompts, and real-world problem solving!',
    color: 'bg-primary',
    borderColor: 'border-primary-dark',
    shadowColor: 'shadow-pixel-purple',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();

  const handleZoneSelect = (z: 'junior' | 'innovator') => {
    navigate('/auth', { state: { mode: 'signup', zone: z } });
  };

  return (
    <div className="min-h-screen bg-pixel-darker bg-pixel-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Zone Selection */}
          <motion.div
            key="zone"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Header */}
            <div className="text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="text-8xl mb-4"
              >
                🤖
              </motion.div>
              <h1 className="font-pixel text-white text-xl leading-relaxed">AI EXPLORER</h1>
              <p className="font-body text-white/60 text-sm mt-2">Your AI Learning Adventure Awaits!</p>
            </div>

            {/* Pixel divider */}
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

            <p className="font-game text-white text-xl text-center">How old are you?</p>

            <div className="w-full flex flex-col gap-4">
              {ZONES.map((z) => (
                <motion.button
                  key={z.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleZoneSelect(z.id as 'junior' | 'innovator')}
                  className={`w-full border-4 border-black ${z.color} p-5 flex items-center gap-4 ${z.shadowColor} shadow-pixel text-left`}
                >
                  <span className="text-5xl">{z.emoji}</span>
                  <div>
                    <div className="text-white font-game text-xl">{z.title}</div>
                    <div className="text-white/80 font-body text-xs">Ages {z.age}</div>
                    <div className="text-white/70 font-body text-sm mt-1">{z.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="flex flex-col gap-3 items-center justify-center mt-4">
              <button
                onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                className="text-warning font-body text-sm font-bold hover:opacity-80 underline flex items-center gap-1.5 transition-all"
              >
                ⭐ New to Quest AI? Sign Up
              </button>
              <button
                onClick={() => navigate('/auth', { state: { mode: 'login' } })}
                className="text-white font-body text-sm font-bold hover:opacity-80 underline flex items-center gap-1.5 transition-all"
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
