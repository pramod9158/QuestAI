import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AICompanion } from './AICompanion';
import type { Lesson } from '@/data/curriculum';

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
  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
        style={{
          background: 'radial-gradient(circle at center, rgba(15, 10, 46, 0.95) 0%, rgba(0, 0, 0, 0.98) 100%)',
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
          className="relative w-full max-w-md my-auto bg-[#1E1B4B] border-4 border-[#FFD60A] p-6 text-center shadow-[0_0_50px_rgba(255,214,10,0.3)]"
          style={{
            boxShadow: '6px 6px 0px #000, 0 0 40px rgba(255,214,10,0.25)',
          }}
        >
          {/* Header Title */}
          <div className="mb-6">
            <motion.div
              animate={{ rotate: [0, -5, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-16 h-16 mx-auto mb-3 flex items-center justify-center text-4xl"
              style={{
                background: 'linear-gradient(135deg, #FFD60A, #F59E0B)',
                border: '3px solid #000',
                boxShadow: '4px 4px 0px #000',
              }}
            >
              🎉
            </motion.div>
            <h1 className="font-game text-xl text-[#FFD60A] tracking-wider uppercase">
              Mission Complete!
            </h1>
            <p className="font-body text-xs text-white/50 mt-1">
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
            style={{
              background: '#16103A',
              border: '2.5px solid #000',
              boxShadow: '3px 3px 0px #000',
            }}
          >
            <div className="font-pixel text-[7px] text-[#A78BFA] tracking-wider uppercase border-b border-white/10 pb-1.5 mb-2 flex justify-between">
              <span>Mission Adventure Rewards</span>
              <span>XP Breakdown</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-body text-white/70">🎥 Video Intel & Checkpoints</span>
              <span className="font-game text-[#10B981]">+{rewards.videoXp} XP</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-body text-white/70">🧪 Interactive AI Lab Challenges</span>
              <span className="font-game text-[#10B981]">+{rewards.labXp} XP</span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-body text-white/70">🛠️ Creative Micro Project Deliverable</span>
              <span className="font-game text-[#10B981]">+{rewards.projectXp} XP</span>
            </div>

            {rewards.streakBonus > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="font-body text-orange-400">🔥 Active Streak Multiplier Bonus</span>
                <span className="font-game text-orange-400">+{rewards.streakBonus} XP</span>
              </div>
            )}

            <div className="border-t border-white/10 pt-2 flex justify-between items-center">
              <span className="font-game text-sm text-[#FFD60A]">Total Loot Earned</span>
              <div className="flex gap-3 font-game text-sm text-white">
                <span className="text-[#FFD60A]">⚡ {rewards.totalXp} XP</span>
                <span className="text-yellow-400">🪙 {rewards.coins}</span>
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
              style={{
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%)',
                border: '2px dashed #7C3AED',
              }}
            >
              <div
                className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                  border: '2.5px solid #000',
                  boxShadow: '2px 2px 0px #000',
                }}
              >
                {rewards.badgeUnlocked.emoji}
              </div>
              <div className="text-left">
                <span className="font-pixel text-[6px] tracking-wide text-purple-300">NEW BADGE UNLOCKED</span>
                <h3 className="font-game text-xs text-white uppercase">{rewards.badgeUnlocked.name}</h3>
              </div>
            </motion.div>
          )}

          {/* Next Mission Preview */}
          {nextLesson && (
            <div
              className="p-3 mb-6 flex items-center gap-3 text-left"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1.5px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div className="w-9 h-9 flex items-center justify-center text-xl bg-[#0F0A2E] border border-white/20">
                {nextLesson.missionEmoji || '🚀'}
              </div>
              <div>
                <span className="font-pixel text-[6px] text-white/40 tracking-wider">UPCOMING MISSION:</span>
                <h4 className="font-game text-[10px] text-white/90 truncate max-w-[280px]">
                  {nextLesson.missionTitle || nextLesson.title}
                </h4>
              </div>
            </div>
          )}

          {/* Continue button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '6px 6px 0px #000, 0 0 15px rgba(255, 214, 10, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="w-full py-3.5 font-game text-sm text-black cursor-pointer bg-gradient-to-r from-[#FFD60A] to-[#F59E0B]"
            style={{
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000',
            }}
          >
            ⚡ CONTINUE ADVENTURE ⚡
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
