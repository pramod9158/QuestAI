import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

const ZONES = [
  {
    id: 'junior',
    age: '6–11',
    emoji: '🚀',
    title: 'Junior Explorer',
    desc: 'Discover AI magic through games, stories & fun!',
  },
  {
    id: 'innovator',
    age: '12–16',
    emoji: '🧠',
    title: 'Future Innovator',
    desc: 'Dive into AI ethics, prompts, and real-world problem solving!',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();

  const handleZoneSelect = (z: 'junior' | 'innovator') => {
    navigate('/auth', { state: { mode: 'signup', zone: z } });
  };

  return (
    <div className="min-h-screen bg-pixel-darker bg-pixel-grid flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Starry Particles Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDuration: '3s' }} />
        <div className="absolute top-1/4 right-20 w-3 h-3 bg-warning rounded-full animate-ping" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-blue-light rounded-full animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute top-1/3 left-1/4 w-2.5 h-2.5 bg-primary-light rounded-full animate-ping" style={{ animationDuration: '5s' }} />
        <div className="absolute bottom-10 right-10 w-2 h-2 bg-success rounded-full animate-ping" style={{ animationDuration: '3.5s' }} />
      </div>

      <div className="w-full max-w-md z-10 relative">
        <AnimatePresence mode="wait">
          {/* Zone Selection */}
          <motion.div
            key="zone"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -30 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Mascot & Header */}
            <div className="text-center">
              {/* Cute Floating Vector Robot SVG */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="mb-4 relative w-[130px] h-[130px] mx-auto flex items-center justify-center"
              >
                {/* Glowing neon halo portal behind robot */}
                <div className="absolute inset-0 bg-primary/20 rounded-full filter blur-xl animate-pulse" />
                <svg width="120" height="120" viewBox="0 0 120 120" className="relative z-10 select-none">
                  {/* Robot Head */}
                  <rect x="35" y="35" width="50" height="40" rx="15" fill="#A78BFA" stroke="black" strokeWidth="4" />
                  {/* Face Screen */}
                  <rect x="42" y="42" width="36" height="26" rx="8" fill="#1E1B4B" stroke="black" strokeWidth="3" />
                  {/* Glowing Eyes */}
                  <circle cx="51" cy="55" r="4" fill="#3B82F6" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                  <circle cx="51" cy="55" r="4" fill="#60A5FA" />
                  <circle cx="69" cy="55" r="4" fill="#3B82F6" className="animate-ping" style={{ animationDuration: '1.5s' }} />
                  <circle cx="69" cy="55" r="4" fill="#60A5FA" />
                  {/* Cute smile */}
                  <path d="M 55 62 Q 60 66 65 62" stroke="#60A5FA" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                  
                  {/* Antenna */}
                  <line x1="60" y1="35" x2="60" y2="20" stroke="black" strokeWidth="4" />
                  <circle cx="60" cy="18" r="6" fill="#F59E0B" stroke="black" strokeWidth="3" className="animate-bounce" />
                  
                  {/* Ears */}
                  <rect x="30" y="47" width="6" height="16" rx="3" fill="#F59E0B" stroke="black" strokeWidth="3" />
                  <rect x="84" y="47" width="6" height="16" rx="3" fill="#F59E0B" stroke="black" strokeWidth="3" />
                </svg>
              </motion.div>

              <h1 className="font-pixel text-transparent bg-clip-text bg-gradient-to-r from-warning via-white to-blue-game text-xl tracking-wider drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] filter">
                AI EXPLORER
              </h1>
              <p className="font-body text-white/50 text-xs mt-2 uppercase tracking-widest font-bold">
                Your AI Learning Adventure Awaits!
              </p>
            </div>

            {/* Neon laser divider */}
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent relative">
              <div className="absolute inset-0 bg-primary filter blur-sm" />
            </div>

            <p className="font-game text-white text-lg tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              How old are you? 🤔
            </p>

            {/* Zone Selection Buttons */}
            <div className="w-full flex flex-col gap-5">
              {ZONES.map((z) => (
                <motion.button
                  key={z.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleZoneSelect(z.id as 'junior' | 'innovator')}
                  className={`w-full border-4 border-black p-6 rounded-3xl flex items-center gap-5 text-left transition-all cursor-pointer select-none ${
                    z.id === 'junior'
                      ? 'bg-gradient-to-br from-blue-game to-blue-light shadow-[0px_8px_0px_0px_#000000,inset_0px_4px_0px_0px_rgba(255,255,255,0.4),0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0px_10px_0px_0px_#000000,0_0_30px_rgba(59,130,246,0.55)]'
                      : 'bg-gradient-to-br from-primary to-primary-light shadow-[0px_8px_0px_0px_#000000,inset_0px_4px_0px_0px_rgba(255,255,255,0.4),0_0_20px_rgba(124,58,237,0.35)] hover:shadow-[0px_10px_0px_0px_#000000,0_0_30px_rgba(124,58,237,0.55)]'
                  }`}
                >
                  <span className="text-6xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)]">{z.emoji}</span>
                  <div>
                    <div className="text-white font-game text-xl leading-none flex items-center gap-2.5">
                      {z.title}
                      <span className="font-pixel text-[10px] bg-black px-2.5 py-1 rounded-lg border-2 border-black uppercase tracking-wider text-warning shadow-[0px_2px_0px_0px_rgba(0,0,0,0.5)] flex-shrink-0">
                        {z.age} Yrs
                      </span>
                    </div>
                    <div className="text-white/90 font-body text-sm mt-2 font-semibold leading-relaxed">{z.desc}</div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Bottom Actions styled as high-quality retro buttons */}
            <div className="w-full flex flex-col gap-3.5 mt-3">
              <Button
                variant="ghost"
                onClick={() => navigate('/auth', { state: { mode: 'signup' } })}
                className="text-warning border-warning/20 hover:border-warning/60 hover:text-warning w-full rounded-2xl shadow-[0px_4px_0px_0px_rgba(0,0,0,0.5)] py-3.5 text-xs font-bold"
              >
                ⭐ New to Quest AI? Sign Up
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate('/auth', { state: { mode: 'login' } })}
                className="text-white/80 border-white/10 hover:border-white/30 hover:text-white w-full rounded-2xl shadow-[0px_4px_0px_0px_rgba(0,0,0,0.5)] py-3.5 text-xs font-bold"
              >
                🔑 Already have an account? Sign In
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
