/**
 * QuestAI — Daily Login Reward Modal
 *
 * Auto-shows on first visit of the day if unclaimed.
 * Animated modal with reward reveal, coin burst, and streak milestones.
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getDailyReward, claimDailyReward, hasUnclaimedDailyReward,
  getRewardRarityColor, getRewardRarityGlow,
  type DailyReward,
} from '@/lib/loginRewards';

interface DailyRewardModalProps {
  username: string;
  streak: number;
  onClaim: (coins: number, xp: number) => void;
}

const STREAK_DAYS = [1, 2, 3, 7, 14, 30];

// Confetti Particle component
function ConfettiPiece({ color, delay }: { color: string; delay: number }) {
  const x = (Math.random() - 0.5) * 200;
  const rotation = Math.random() * 720;
  return (
    <motion.div
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0, scale: 1 }}
      animate={{
        y: [0, -80, 120],
        x: [0, x],
        opacity: [1, 1, 0],
        rotate: rotation,
        scale: [1, 1, 0.5],
      }}
      transition={{ duration: 1.5, delay, ease: 'easeOut' }}
      className="absolute w-2.5 h-2.5 top-1/2 left-1/2"
      style={{ background: color, borderRadius: Math.random() > 0.5 ? '50%' : '0' }}
    />
  );
}

const CONFETTI_COLORS = ['#FFD60A', '#7C3AED', '#3B82F6', '#10B981', '#EF4444', '#EC4899'];

export function DailyRewardModal({ username, streak, onClaim }: DailyRewardModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reward, setReward] = useState<DailyReward | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Small delay to let the page load first
    const timer = setTimeout(() => {
      if (hasUnclaimedDailyReward(username)) {
        setReward(getDailyReward(streak));
        setIsOpen(true);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [streak, username]);

  function handleClaim() {
    if (!reward) return;
    claimDailyReward(username);
    setShowConfetti(true);
    setTimeout(() => {
      onClaim(reward.coins, reward.xp);
      setIsOpen(false);
    }, 1800);
  }

  function handleReveal() {
    setRevealed(true);
    if (reward?.isMilestone) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    }
  }

  if (!reward) return null;

  const rarityColor = getRewardRarityColor(reward.rarity);
  const rarityGlow = getRewardRarityGlow(reward.rarity);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          {/* Confetti */}
          {showConfetti && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 20 }).map((_, i) => (
                <ConfettiPiece
                  key={i}
                  color={CONFETTI_COLORS[i % CONFETTI_COLORS.length]}
                  delay={i * 0.06}
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-full max-w-sm relative"
            style={{
              background: '#1E1B4B',
              border: `4px solid ${rarityColor}`,
              boxShadow: `6px 6px 0px #000, ${rarityGlow}`,
            }}
          >
            {/* Header */}
            <div
              className="p-4 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #16103A, #1E1B4B)' }}
            >
              {/* Rarity label */}
              <div
                className="inline-flex items-center gap-1 px-2 py-0.5 mb-2 font-pixel text-[6px]"
                style={{
                  background: rarityColor,
                  border: '2px solid #000',
                  color: reward.rarity === 'legendary' ? '#000' : 'white',
                }}
              >
                {reward.rarity.toUpperCase()} REWARD
              </div>
              <h2 className="font-game text-xl text-white">Daily Login Reward!</h2>
              <p className="text-white/50 font-body text-xs mt-1">
                🔥 Day {streak} Streak
              </p>
            </div>

            {/* Streak progress row */}
            <div className="px-5 pt-4 pb-2">
              <div className="flex items-center justify-between">
                {STREAK_DAYS.map(day => {
                  const isDone = streak >= day;
                  const isCurrent = streak === day;
                  return (
                    <div key={day} className="flex flex-col items-center gap-1">
                      <motion.div
                        animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-7 h-7 flex items-center justify-center font-pixel text-[5px]"
                        style={{
                          background: isDone ? rarityColor : '#16103A',
                          border: `2px solid ${isCurrent ? rarityColor : '#000'}`,
                          boxShadow: isDone ? '2px 2px 0px #000' : 'none',
                          color: isDone ? (reward.rarity === 'legendary' ? '#000' : 'white') : 'rgba(255,255,255,0.3)',
                        }}
                      >
                        {isDone ? '✓' : day}
                      </motion.div>
                      <span className="font-pixel text-[5px] text-white/30">{day}d</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reward Box */}
            <div className="px-5 pb-5 space-y-4">
              <AnimatePresence mode="wait">
                {!revealed ? (
                  <motion.button
                    key="mystery"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleReveal}
                    animate={{
                      boxShadow: [
                        `4px 4px 0px #000, 0 0 10px ${rarityColor}44`,
                        `4px 4px 0px #000, 0 0 25px ${rarityColor}88`,
                        `4px 4px 0px #000, 0 0 10px ${rarityColor}44`,
                      ]
                    }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-full p-8 flex flex-col items-center gap-3 cursor-pointer"
                    style={{
                      background: `${rarityColor}15`,
                      border: `3px solid ${rarityColor}`,
                    }}
                  >
                    <motion.div
                      animate={{ rotate: [0, -8, 8, -5, 5, 0], y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className="text-5xl"
                    >
                      🎁
                    </motion.div>
                    <span className="font-game text-white text-sm">Tap to Reveal!</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="revealed"
                    initial={{ rotateY: 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="p-6 flex flex-col items-center gap-3"
                    style={{
                      background: `${rarityColor}15`,
                      border: `3px solid ${rarityColor}`,
                      boxShadow: rarityGlow,
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.3, 1] }}
                      transition={{ delay: 0.1, duration: 0.5, type: 'spring' }}
                      className="text-5xl"
                    >
                      {reward.emoji}
                    </motion.div>
                    <div className="text-center">
                      <div
                        className="font-game text-lg"
                        style={{ color: rarityColor }}
                      >
                        {reward.title}
                      </div>
                      <p className="text-white/60 font-body text-xs mt-1">
                        {reward.description}
                      </p>
                      <div className="flex items-center justify-center gap-3 mt-3">
                        <span className="font-pixel text-[8px] text-yellow-300">+{reward.coins} 🪙</span>
                        <span className="font-pixel text-[8px] text-purple-300">+{reward.xp} XP ⚡</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={revealed ? handleClaim : handleReveal}
                className="w-full py-3 font-game text-sm cursor-pointer transition-all"
                style={{
                  background: rarityColor,
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0px #000',
                  color: reward.rarity === 'legendary' ? '#000' : 'white',
                }}
              >
                {!revealed ? '🎁 Open Reward!' : '✅ Claim Reward!'}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-white/30 font-body text-xs hover:text-white/60 transition-colors cursor-pointer"
              >
                Remind me later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
