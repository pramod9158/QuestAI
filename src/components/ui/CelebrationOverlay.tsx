/**
 * QuestAI — Celebration Overlay
 *
 * Fires when a student completes a module, lesson, or quiz.
 * Features: confetti burst, star particles, XP reward animation, success pulse ring.
 * Lightweight canvas-free implementation using Framer Motion.
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStyles } from '@/lib/useThemeStyles';

interface CelebrationOverlayProps {
  show: boolean;
  title?: string;
  subtitle?: string;
  xpGained?: number;
  coinsGained?: number;
  gemsGained?: number;
  streakBonus?: number;
  badge?: { emoji: string; name: string };
  nextMission?: string;
  onDone?: () => void;
  autoDismissMs?: number;
}

const CONFETTI_COLORS = [
  '#FFD60A', '#7C3AED', '#3B82F6', '#10B981',
  '#EF4444', '#EC4899', '#F59E0B', '#A78BFA',
];

const SHAPES = ['round', 'square', 'triangle'] as const;

interface ConfettiItem {
  id: number;
  x: number;
  y: number;
  color: string;
  shape: typeof SHAPES[number];
  size: number;
  delay: number;
  duration: number;
  rotateEnd: number;
  xDrift: number;
}

function generateConfetti(count = 30): ConfettiItem[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -(Math.random() * 20 + 10),
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    shape: SHAPES[i % SHAPES.length],
    size: Math.random() * 8 + 6,
    delay: Math.random() * 0.6,
    duration: Math.random() * 1.5 + 1.5,
    rotateEnd: (Math.random() - 0.5) * 720,
    xDrift: (Math.random() - 0.5) * 40,
  }));
}

function StarParticle({ angle, delay }: { angle: number; delay: number }) {
  const r = 80 + Math.random() * 60;
  const x = Math.cos((angle * Math.PI) / 180) * r;
  const y = Math.sin((angle * Math.PI) / 180) * r;
  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
      animate={{ x, y, opacity: 0, scale: 0 }}
      transition={{ duration: 1, delay, ease: 'easeOut' }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg pointer-events-none"
    >
      ⭐
    </motion.div>
  );
}

export function CelebrationOverlay({
  show,
  title = 'Amazing!',
  subtitle = 'You completed this!',
  xpGained = 0,
  coinsGained = 0,
  gemsGained = 0,
  streakBonus = 0,
  badge,
  nextMission,
  onDone,
  autoDismissMs = 4000,
}: CelebrationOverlayProps) {
  const ts = useThemeStyles();
  const D = ts.duo;
  const confettiRef = useRef(generateConfetti(32));
  const starAngles = Array.from({ length: 12 }, (_, i) => i * 30);

  useEffect(() => {
    if (show) {
      confettiRef.current = generateConfetti(32);
      playCelebrationSound();
      const timer = setTimeout(() => onDone?.(), autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [show, onDone, autoDismissMs]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.7)' }}
        >
          {/* Confetti Rain */}
          <div className="absolute inset-0 overflow-hidden">
            {confettiRef.current.map(c => (
              <motion.div
                key={c.id}
                initial={{
                  left: `${c.x}%`,
                  top: `${c.y}%`,
                  opacity: 1,
                  rotate: 0,
                  x: 0,
                }}
                animate={{
                  top: '110%',
                  opacity: [1, 1, 0],
                  rotate: c.rotateEnd,
                  x: c.xDrift,
                }}
                transition={{
                  duration: c.duration,
                  delay: c.delay,
                  ease: 'easeIn',
                }}
                className="absolute"
                style={{
                  width: c.size,
                  height: c.size,
                  background: c.color,
                  borderRadius: c.shape === 'round' ? '50%' : '0',
                  clipPath: c.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
                }}
              />
            ))}
          </div>

          {/* Main Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22, delay: 0.1 }}
            className="relative w-full max-w-xs pointer-events-auto"
            style={D ? {
              background: '#FFFFFF',
              border: '2.5px solid #5FCC5F',
              borderRadius: 24,
              boxShadow: '0 8px 32px rgba(95,204,95,0.3)',
            } : {
              background: '#1E1B4B',
              border: '4px solid #FFD60A',
              boxShadow: '6px 6px 0px #000, 0 0 40px rgba(255,214,10,0.5)',
            }}
          >
            {/* Pulse Ring */}
            {!D && (
              <motion.div
                className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
                animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}

            {/* Star Particles */}
            <div className="absolute top-1/2 left-1/2 pointer-events-none">
              {starAngles.map((angle, i) => (
                <StarParticle key={i} angle={angle} delay={0.15 + i * 0.04} />
              ))}
            </div>

            <div className="p-6 text-center space-y-4">
              {/* Happy Waving Robot Mascot */}
              <HappyRobot />

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h2 style={{ color: D ? '#5FCC5F' : '#FFD60A', fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 24 : undefined }} className={D ? '' : 'font-game text-2xl'}>
                  {title}
                </h2>
                <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 14 : undefined }} className={D ? 'mt-1' : 'text-white/70 font-body text-sm mt-1'}>{subtitle}</p>
              </motion.div>

              {/* Rewards Row */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center justify-center gap-3"
              >
                {xpGained > 0 && (
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.1 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={D ? '' : 'px-2.5 py-1.5 flex items-center gap-1 font-game text-[11px]'}
                      style={D ? {
                        background: '#FFF8E1',
                        border: '1.5px solid #FFB84D',
                        borderRadius: 12,
                        padding: '6px 12px',
                        color: '#C8960C',
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 900,
                        fontSize: 12,
                      } : {
                        background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                        border: '2.5px solid #000',
                        boxShadow: '2.5px 2.5px 0px #000',
                        color: '#000',
                      }}
                    >
                      ⚡ +{xpGained} XP
                    </div>
                  </motion.div>
                )}
                {coinsGained > 0 && (
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.3 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={D ? '' : 'px-2.5 py-1.5 flex items-center gap-1 font-game text-[11px]'}
                      style={D ? {
                        background: '#FFF8E1',
                        border: '1.5px solid #FFB84D',
                        borderRadius: 12,
                        padding: '6px 12px',
                        color: '#C8960C',
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 900,
                        fontSize: 12,
                      } : {
                        background: 'linear-gradient(135deg, #F59E0B, #FCD34D)',
                        border: '2.5px solid #000',
                        boxShadow: '2.5px 2.5px 0px #000',
                        color: '#000',
                      }}
                    >
                      🪙 +{coinsGained} Coins
                    </div>
                  </motion.div>
                )}
                {gemsGained > 0 && (
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.4 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className={D ? '' : 'px-2.5 py-1.5 flex items-center gap-1 font-game text-[11px]'}
                      style={D ? {
                        background: '#E0F2FE',
                        border: '1.5px solid #7DD3FC',
                        borderRadius: 12,
                        padding: '6px 12px',
                        color: '#0369A1',
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 900,
                        fontSize: 12,
                      } : {
                        background: 'linear-gradient(135deg, #3B82F6, #60A5FA)',
                        border: '2.5px solid #000',
                        boxShadow: '2.5px 2.5px 0px #000',
                        color: '#fff',
                      }}
                    >
                      💎 +{gemsGained} Gems
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Streak Bonus Alert */}
              {streakBonus && streakBonus > 0 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={D ? 'text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 py-1.5 rounded-lg' : 'font-pixel text-[6px] tracking-wider text-orange-400 bg-orange-950/20 border border-orange-800/40 py-1'}
                  style={D ? { fontFamily: '"Nunito", sans-serif' } : {}}
                >
                  🔥 ACTIVE STREAK MULTIPLIER BONUS: +{streakBonus} XP!
                </motion.div>
              )}

              {/* Next Mission Preview */}
              {nextMission && (
                <div
                  className="p-2 flex items-center gap-2 text-left"
                  style={D ? {
                    background: '#F9F9F9',
                    border: '1.5px solid #E0E0E0',
                    borderRadius: 12,
                  } : {
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span className="text-sm">🚀</span>
                  <div>
                    <span style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 8, color: '#999999' } : {}} className={D ? 'block' : 'font-pixel text-[5px] text-white/40 tracking-wider block'}>UPCOMING MISSION:</span>
                    <h4 style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 11, color: '#000000' } : {}} className={D ? 'truncate max-w-[200px]' : 'font-game text-[8px] text-white/90 truncate max-w-[200px]'}>
                      {nextMission}
                    </h4>
                  </div>
                </div>
              )}

              {/* Badge unlock */}
              {badge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.65, type: 'spring', stiffness: 350, damping: 15 }}
                  className="flex flex-col items-center gap-2"
                >
                  <div
                    className={D ? '' : 'w-16 h-16 flex items-center justify-center text-3xl'}
                    style={D ? {
                      width: 56,
                      height: 56,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      background: 'linear-gradient(135deg, #8B5CF6, #B366FF)',
                      borderRadius: 14,
                      border: '1.5px solid rgba(255,255,255,0.4)',
                      boxShadow: '0 4px 12px rgba(139,92,246,0.2)',
                    } : {
                      background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                      border: '3px solid #000',
                      boxShadow: '3px 3px 0px #000, 0 0 20px rgba(124,58,237,0.6)',
                    }}
                  >
                    {badge.emoji}
                  </div>
                  <div>
                    <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10, color: '#8B5CF6' } : {}} className={D ? '' : 'font-pixel text-[6px] text-primary-light text-center'}>BADGE UNLOCKED!</div>
                    <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 14 : undefined }} className={D ? 'text-center' : 'font-game text-sm text-white text-center'}>{badge.name}</div>
                  </div>
                </motion.div>
              )}

              {/* Progress increase bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
                className={D ? '' : 'w-full h-3 bg-[#0F0A2E] border-2 border-black'}
                style={D ? {
                  width: '100%',
                  height: 10,
                  background: '#E0E0E0',
                  borderRadius: 999,
                  overflow: 'hidden',
                } : {}}
              >
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                  style={{
                    background: D ? 'linear-gradient(90deg, #5FCC5F, #1EBC6B)' : 'linear-gradient(90deg, #10B981, #3B82F6)',
                    borderRadius: D ? 999 : 0,
                  }}
                />
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onDone}
                className={D ? 'w-full py-3 text-center cursor-pointer font-bold text-sm text-white bg-[#5FCC5F]' : 'w-full py-3 font-game text-sm cursor-pointer'}
                style={D ? {
                  borderRadius: 12,
                  boxShadow: '0 4px 0px rgba(0,0,0,0.15)',
                  fontFamily: '"Nunito", sans-serif',
                } : {
                  background: '#FFD60A',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0px #000',
                  color: '#000',
                }}
              >
                {D ? 'Continue 🚀' : 'Continue! 🚀'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
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
