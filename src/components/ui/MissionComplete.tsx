import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AICompanion } from './AICompanion';
import type { Lesson } from '@/data/curriculum';
import { useThemeStyles } from '@/lib/useThemeStyles';

interface MissionCompleteProps {
  show: boolean;
  lesson: Lesson;
  nextLesson?: Lesson;
  rewards: {
    videoXp: number;
    labXp: number;
    projectXp: number;
    streakBonus: number;
    totalXp: number;
    coins: number;
    badgeUnlocked?: { name: string; emoji: string };
  };
  onContinue: () => void;
}

export function MissionComplete({ show, lesson, nextLesson, rewards, onContinue }: MissionCompleteProps) {
  const ts = useThemeStyles();
  const D = ts.duo;

  useEffect(() => {
    if (show) {
      playCelebrationSound();
    }
  }, [show]);

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{
          background: D
            ? 'rgba(0, 0, 0, 0.6)'
            : 'radial-gradient(circle at center, rgba(15, 10, 46, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {/* Confetti Rain Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 40 }).map((_, i) => {
            const size = Math.random() * 8 + 6;
            const colors = ['#FFD60A', '#7C3AED', '#3B82F6', '#10B981', '#EF4444', '#EC4899'];
            const color = colors[i % colors.length];
            return (
              <motion.div
                key={i}
                initial={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  opacity: 1,
                  rotate: 0,
                  scale: Math.random() * 0.5 + 0.5,
                }}
                animate={{
                  top: '110%',
                  opacity: [1, 1, 0],
                  rotate: Math.random() * 720 - 360,
                }}
                transition={{
                  duration: Math.random() * 2 + 2,
                  delay: Math.random() * 1.5,
                  repeat: Infinity,
                  ease: 'easeIn',
                }}
                className="absolute"
                style={{
                  width: size,
                  height: size,
                  background: color,
                  borderRadius: i % 2 === 0 ? '50%' : '0px',
                }}
              />
            );
          })}
        </div>

        <motion.div
          initial={{ scale: 0.9, y: 50, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 50, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className={D ? "relative w-full max-w-md my-auto p-6 text-center" : "relative w-full max-w-md my-auto bg-[#1E1B4B] border-4 border-[#FFD60A] p-6 text-center shadow-[0_0_50px_rgba(255,214,10,0.3)]"}
          style={D ? {
            background: '#FFFFFF',
            border: '2.5px solid #5FCC5F',
            borderRadius: 24,
            boxShadow: '0 8px 32px rgba(95,204,95,0.25)',
          } : {
            boxShadow: '6px 6px 0px #000, 0 0 40px rgba(255,214,10,0.25)',
          }}
        >
          {/* Header Title */}
          <div className="mb-6">
            {/* Happy Waving Robot Mascot */}
            <div className="mb-3">
              <HappyRobot />
            </div>
            <h1 
              className={D ? "" : "font-game text-xl text-[#FFD60A] tracking-wider uppercase"}
              style={D ? {
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 900,
                fontSize: 24,
                color: '#5FCC5F',
                textTransform: 'uppercase',
              } : {}}
            >
              Mission Complete!
            </h1>
            <p 
              className={D ? "mt-1" : "font-body text-xs text-white/50 mt-1"}
              style={D ? {
                fontFamily: '"Nunito", sans-serif',
                fontSize: 13,
                color: '#555555',
                fontWeight: 700,
              } : {}}
            >
              You crushed {lesson.missionTitle || lesson.title}
            </p>
          </div>

          {/* Companion Celebration message */}
          <div className="mb-6 flex justify-center text-left">
            <AICompanion
              state="celebrating"
              message={`Incredible job, Agent! You unlocked new AI wisdom and completed the mission. You're becoming a true AI pioneer!`}
              name="SPARKY"
              size="sm"
            />
          </div>

          {/* Reward Breakdown Details */}
          <div
            className="p-4 mb-6 text-left space-y-3"
            style={D ? {
              background: '#F8FFF8',
              border: '1.5px solid #E0E0E0',
              borderRadius: 16,
            } : {
              background: '#16103A',
              border: '2.5px solid #000',
              boxShadow: '3px 3px 0px #000',
            }}
          >
            <div 
              className={D ? "border-b border-black/5 pb-1.5 mb-2 flex justify-between" : "font-pixel text-[7px] text-[#A78BFA] tracking-wider uppercase border-b border-white/10 pb-1.5 mb-2 flex justify-between"}
              style={D ? {
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 800,
                fontSize: 10,
                color: '#8B5CF6',
                textTransform: 'uppercase',
              } : {}}
            >
              <span>Mission Adventure Rewards</span>
              <span>XP Breakdown</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className={D ? "" : "font-body text-white/70"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 700, color: '#333333' } : {}}>🎥 Video Intel & Checkpoints</span>
              <span className={D ? "" : "font-game text-[#10B981]"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, color: '#5FCC5F' } : {}}>+{rewards.videoXp} XP</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className={D ? "" : "font-body text-white/70"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 700, color: '#333333' } : {}}>🧪 Interactive AI Lab Challenges</span>
              <span className={D ? "" : "font-game text-[#10B981]"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, color: '#5FCC5F' } : {}}>+{rewards.labXp} XP</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className={D ? "" : "font-body text-white/70"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 700, color: '#333333' } : {}}>🛠️ Creative Micro Project Deliverable</span>
              <span className={D ? "" : "font-game text-[#10B981]"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, color: '#5FCC5F' } : {}}>+{rewards.projectXp} XP</span>
            </div>

            {rewards.streakBonus > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className={D ? "" : "font-body text-orange-400"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 700, color: '#FF6B35' } : {}}>🔥 Active Streak Multiplier Bonus</span>
                <span className={D ? "" : "font-game text-orange-400"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, color: '#FF6B35' } : {}}>+{rewards.streakBonus} XP</span>
              </div>
            )}

            <div className={D ? "border-t border-black/5 pt-2 flex justify-between items-center" : "border-t border-white/10 pt-2 flex justify-between items-center"}>
              <span className={D ? "" : "font-game text-sm text-[#FFD60A]"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 13, color: '#000000' } : {}}>Total Loot Earned</span>
              <div className={D ? "flex gap-3" : "flex gap-3 font-game text-sm text-white"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 13 } : {}}>
                <span style={D ? { color: '#5FCC5F' } : {}} className={D ? "" : "text-[#FFD60A]"}>⚡ {rewards.totalXp} XP</span>
                <span style={D ? { color: '#C8960C' } : {}} className={D ? "" : "text-yellow-400"}>🪙 {rewards.coins}</span>
              </div>
            </div>
          </div>

          {/* Badge Reveal */}
          {rewards.badgeUnlocked && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-6 p-3 flex items-center gap-3"
              style={D ? {
                background: 'linear-gradient(135deg, #F5EEFF 0%, #E8D3FF 100%)',
                border: '1.5px dashed #B366FF',
                borderRadius: 16,
              } : {
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '2px dashed #7C3AED',
              }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
                style={D ? {
                  background: 'linear-gradient(135deg, #B366FF, #8B5CF6)',
                  borderRadius: 12,
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  boxShadow: '0 4px 12px rgba(139,92,246,0.15)',
                } : {
                  background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                  border: '2.5px solid #000',
                  boxShadow: '2px 2px 0px #000',
                }}
              >
                {rewards.badgeUnlocked.emoji}
              </div>
              <div className="text-left">
                <span className={D ? "" : "font-pixel text-[6px] tracking-wide text-purple-300"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 9, color: '#8B5CF6', display: 'block' } : {}}>NEW BADGE UNLOCKED</span>
                <h3 className={D ? "" : "font-game text-xs text-white uppercase"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 13, color: '#000000', textTransform: 'uppercase' } : {}}>{rewards.badgeUnlocked.name}</h3>
              </div>
            </motion.div>
          )}

          {/* Next Mission Preview */}
          {nextLesson && (
            <div
              className="p-3 mb-6 flex items-center gap-3 text-left"
              style={D ? {
                background: '#F9F9F9',
                border: '1.5px solid #E0E0E0',
                borderRadius: 16,
              } : {
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div 
                className={D ? "w-9 h-9 flex items-center justify-center text-xl" : "w-9 h-9 flex items-center justify-center text-xl bg-[#0F0A2E] border border-white/20"}
                style={D ? {
                  background: '#FFFFFF',
                  border: '1.5px solid #D0D0D0',
                  borderRadius: 8,
                } : {}}
              >
                {nextLesson.missionEmoji || '🚀'}
              </div>
              <div>
                <span className={D ? "" : "font-pixel text-[6px] text-white/40 tracking-wider"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 8, color: '#999999', display: 'block' } : {}}>UPCOMING MISSION:</span>
                <h4 className={D ? "" : "font-game text-[10px] text-white/90 truncate max-w-[280px]"} style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 11, color: '#000000' } : {}}>
                  {nextLesson.missionTitle || nextLesson.title}
                </h4>
              </div>
            </div>
          )}

          {/* Continue button */}
          <motion.button
            whileHover={D ? { scale: 1.02 } : { scale: 1.02, boxShadow: '6px 6px 0px #000, 0 0 15px rgba(255, 214, 10, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className={D ? "w-full py-3.5 text-center cursor-pointer font-bold text-sm text-white bg-[#5FCC5F]" : "w-full py-3.5 font-game text-sm text-black cursor-pointer bg-gradient-to-r from-[#FFD60A] to-[#F59E0B]"}
            style={D ? {
              borderRadius: 12,
              boxShadow: '0 4px 0px rgba(0,0,0,0.15)',
              fontFamily: '"Nunito", sans-serif',
            } : {
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000',
            }}
          >
            {D ? 'Continue 🚀' : '⚡ CONTINUE ADVENTURE ⚡'}
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Web Audio API celebration sound synthesis ──────────────────────────────
function playCelebrationSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;
    
    // Ascending arpeggio of C major scale to high C6 (fanfare sound)
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle'; // round, warm tone
      osc.frequency.setValueAtTime(freq, now + index * 0.08);
      
      // Quick envelope for each note
      gain.gain.setValueAtTime(0, now + index * 0.08);
      gain.gain.linearRampToValueAtTime(0.2, now + index * 0.08 + 0.01);
      
      const decay = index === notes.length - 1 ? 1.0 : 0.16;
      gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + decay);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + index * 0.08);
      osc.stop(now + index * 0.08 + decay + 0.05);
    });
  } catch (e) {
    console.error('Audio synthesis failed:', e);
  }
}

// ─── Happy Animated Waving Robot Mascot Component (mascot.jpg style) ──────────────
function HappyRobot() {
  const [displayText, setDisplayText] = useState('HELLO');
  useEffect(() => {
    const sequence = ['HELLO', 'YEAH!', '^ _ ^', 'AWESOME'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % sequence.length;
      setDisplayText(sequence[idx]);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      animate={{
        y: [0, -10, 0],
        rotate: [0, -3, 3, 0],
        scale: [1, 1.04, 0.96, 1],
      }}
      transition={{
        repeat: Infinity,
        duration: 1.4,
        ease: 'easeInOut',
      }}
      style={{
        width: 100,
        height: 100,
        margin: '0 auto',
        position: 'relative',
      }}
    >
      {/* Party Hat */}
      <motion.svg
        animate={{ rotate: [-6, 6, -6], y: [0, -2, 0] }}
        transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
        width="28"
        height="28"
        viewBox="0 0 40 40"
        style={{
          position: 'absolute',
          top: -12,
          left: 36,
          zIndex: 10,
        }}
      >
        <polygon points="20,5 5,35 35,35" fill="#00E5FF" stroke="#000" strokeWidth="2" />
        <path d="M 12,20 L 28,20 M 8,28 L 32,28" stroke="#FFD60A" strokeWidth="3" />
        <circle cx="20" cy="5" r="4" fill="#FFD60A" stroke="#000" strokeWidth="1.5" />
      </motion.svg>

      {/* Robot Mascot SVG */}
      <svg width="100" height="100" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        {/* Glow Filter */}
        <defs>
          <filter id="cyanGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Feet */}
        <rect x="30" y="86" width="14" height="7" rx="3.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="56" y="86" width="14" height="7" rx="3.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />

        {/* Legs */}
        <rect x="34" y="76" width="6" height="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="60" y="76" width="6" height="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />

        {/* Left Arm (Waving) */}
        <motion.g
          animate={{ rotate: [0, -40, 0] }}
          transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut' }}
          style={{ originX: '26px', originY: '58px' }}
        >
          <circle cx="26" cy="58" r="3.5" fill="#0F172A" />
          <rect x="14" y="50" width="12" height="16" rx="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="20" cy="66" r="4.5" fill="#0F172A" />
        </motion.g>

        {/* Right Arm (Waving) */}
        <motion.g
          animate={{ rotate: [0, 40, 0] }}
          transition={{ repeat: Infinity, duration: 0.7, ease: 'easeInOut', delay: 0.1 }}
          style={{ originX: '74px', originY: '58px' }}
        >
          <circle cx="74" cy="58" r="3.5" fill="#0F172A" />
          <rect x="74" y="50" width="12" height="16" rx="6" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="80" cy="66" r="4.5" fill="#0F172A" />
        </motion.g>

        {/* Body */}
        <rect x="28" y="52" width="44" height="30" rx="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
        {/* Chest Screen */}
        <rect x="35" y="58" width="30" height="18" rx="6" fill="#F8FAFC" stroke="#00E5FF" strokeWidth="1.5" filter="url(#cyanGlow)" />
        <text x="50" y="72" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="bold" fontFamily="monospace">D</text>

        {/* Headphones (Left/Right) */}
        <rect x="10" y="26" width="8" height="20" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="12" y="31" width="4" height="10" rx="1.5" fill="#00E5FF" filter="url(#cyanGlow)" />
        
        <rect x="82" y="26" width="8" height="20" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="84" y="31" width="4" height="10" rx="1.5" fill="#00E5FF" filter="url(#cyanGlow)" />

        {/* Neck */}
        <rect x="44" y="46" width="12" height="8" fill="#1E293B" />

        {/* Head */}
        <rect x="18" y="12" width="64" height="38" rx="19" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
        
        {/* Visor Screen */}
        <rect x="22" y="16" width="56" height="28" rx="12" fill="#0B132B" stroke="#00E5FF" strokeWidth="1.8" filter="url(#cyanGlow)" />

        {/* Visor Text */}
        <text 
          x="50" 
          y="34" 
          textAnchor="middle" 
          fill="#00E5FF" 
          fontSize="10" 
          fontWeight="bold" 
          fontFamily="monospace"
          style={{ textShadow: '0 0 3px #00E5FF' }}
        >
          {displayText}
        </text>
      </svg>
    </motion.div>
  );
}
