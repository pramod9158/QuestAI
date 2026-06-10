/**
 * QuestAI — Celebration Overlay
 *
 * Fires when a student completes a module, lesson, or quiz.
 * Features: confetti burst, star particles, XP reward animation, success pulse ring.
 * Lightweight canvas-free implementation using Framer Motion.
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  badge,
  onDone,
  autoDismissMs = 4000,
}: CelebrationOverlayProps) {
  const confettiRef = useRef(generateConfetti(32));
  const starAngles = Array.from({ length: 12 }, (_, i) => i * 30);

  useEffect(() => {
    if (show) {
      confettiRef.current = generateConfetti(32);
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
            style={{
              background: '#1E1B4B',
              border: '4px solid #FFD60A',
              boxShadow: '6px 6px 0px #000, 0 0 40px rgba(255,214,10,0.5)',
            }}
          >
            {/* Pulse Ring */}
            <motion.div
              className="absolute inset-0 border-4 border-yellow-400 pointer-events-none"
              animate={{ scale: [1, 1.1, 1], opacity: [0.8, 0, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />

            {/* Star Particles */}
            <div className="absolute top-1/2 left-1/2 pointer-events-none">
              {starAngles.map((angle, i) => (
                <StarParticle key={i} angle={angle} delay={0.15 + i * 0.04} />
              ))}
            </div>

            <div className="p-6 text-center space-y-4">
              {/* Trophy icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 350, damping: 15 }}
                className="text-6xl"
              >
                🏆
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <h2 className="font-game text-2xl" style={{ color: '#FFD60A' }}>
                  {title}
                </h2>
                <p className="text-white/70 font-body text-sm mt-1">{subtitle}</p>
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
                      className="px-2.5 py-1.5 flex items-center gap-1 font-game text-[11px]"
                      style={{
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
                      className="px-2.5 py-1.5 flex items-center gap-1 font-game text-[11px]"
                      style={{
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
                {gemsGained && gemsGained > 0 && (
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, delay: 0.4 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div
                      className="px-2.5 py-1.5 flex items-center gap-1 font-game text-[11px]"
                      style={{
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
                  className="font-pixel text-[6px] tracking-wider text-orange-400 bg-orange-950/20 border border-orange-800/40 py-1"
                >
                  🔥 ACTIVE STREAK MULTIPLIER BONUS: +{streakBonus} XP!
                </motion.div>
              )}

              {/* Next Mission Preview */}
              {nextMission && (
                <div
                  className="p-2 flex items-center gap-2 text-left"
                  style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1.5px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <span className="text-sm">🚀</span>
                  <div>
                    <span className="font-pixel text-[5px] text-white/40 tracking-wider block">UPCOMING MISSION:</span>
                    <h4 className="font-game text-[8px] text-white/90 truncate max-w-[200px]">
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
                    className="w-16 h-16 flex items-center justify-center text-3xl"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                      border: '3px solid #000',
                      boxShadow: '3px 3px 0px #000, 0 0 20px rgba(124,58,237,0.6)',
                    }}
                  >
                    {badge.emoji}
                  </div>
                  <div>
                    <div className="font-pixel text-[6px] text-primary-light text-center">BADGE UNLOCKED!</div>
                    <div className="font-game text-sm text-white text-center">{badge.name}</div>
                  </div>
                </motion.div>
              )}

              {/* Progress increase bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.75 }}
                className="w-full h-3 bg-[#0F0A2E] border-2 border-black"
              >
                <motion.div
                  className="h-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                  style={{ background: 'linear-gradient(90deg, #10B981, #3B82F6)' }}
                />
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onDone}
                className="w-full py-3 font-game text-sm cursor-pointer"
                style={{
                  background: '#FFD60A',
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0px #000',
                  color: '#000',
                }}
              >
                Continue! 🚀
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
