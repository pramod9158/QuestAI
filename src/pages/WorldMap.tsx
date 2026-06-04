/**
 * QuestAI — Course World Map
 *
 * Converts the curriculum into an adventure journey with 5 worlds:
 * 1. 🌍 AI Around Me (Phases 1–2)
 * 2. 👁️ Robot Vision Kingdom (Phases 3–4)
 * 3. ✨ Prompt Wizard Academy (Phases 5–8)
 * 4. 🕵️ Deepfake Detective City (Phases 9–13)
 * 5. 🚀 Future Inventors Lab (Phases 14–20)
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { CURRICULUM } from '@/data/curriculum';
import { ArrowLeft, Lock, Star, Zap, ChevronRight, Trophy } from 'lucide-react';
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay';

interface World {
  id: number;
  emoji: string;
  name: string;
  subtitle: string;
  theme: string;
  gradFrom: string;
  gradTo: string;
  borderColor: string;
  phases: number[];
  bossName: string;
  bossEmoji: string;
  completionXP: number;
  completionCoins: number;
  completionBadge: { emoji: string; name: string };
  lessons: string[]; // lesson IDs
}

const WORLDS: World[] = [
  {
    id: 1,
    emoji: '🌍',
    name: 'AI Around Me',
    subtitle: 'Discover AI in your everyday world',
    theme: '#3B82F6',
    gradFrom: '#1D4ED8',
    gradTo: '#3B82F6',
    borderColor: '#3B82F6',
    phases: [1, 2, 7],
    bossName: 'The Fake News Monster',
    bossEmoji: '👾',
    completionXP: 80,
    completionCoins: 30,
    completionBadge: { emoji: '🌍', name: 'World Explorer' },
    lessons: ['lesson-1', 'lesson-1-in', 'lesson-2', 'lesson-2-in'],
  },
  {
    id: 2,
    emoji: '👁️',
    name: 'Robot Vision Kingdom',
    subtitle: 'Train AI to see and understand',
    theme: '#10B981',
    gradFrom: '#047857',
    gradTo: '#10B981',
    borderColor: '#10B981',
    phases: [2, 5, 6],
    bossName: 'The Blind Robot Dragon',
    bossEmoji: '🐉',
    completionXP: 100,
    completionCoins: 40,
    completionBadge: { emoji: '👁️', name: 'Vision Master' },
    lessons: ['lesson-3', 'lesson-3-in', 'lesson-4', 'lesson-4-in', 'lesson-5', 'lesson-5-in'],
  },
  {
    id: 3,
    emoji: '✨',
    name: 'Prompt Wizard Academy',
    subtitle: 'Master the art of talking to AI',
    theme: '#A78BFA',
    gradFrom: '#7C3AED',
    gradTo: '#A78BFA',
    borderColor: '#A78BFA',
    phases: [3, 6, 8],
    bossName: 'The Confused Chatbot',
    bossEmoji: '🤖',
    completionXP: 120,
    completionCoins: 50,
    completionBadge: { emoji: '✨', name: 'Prompt Wizard' },
    lessons: ['lesson-8', 'lesson-6', 'lesson-7-jr', 'lesson-7'],
  },
  {
    id: 4,
    emoji: '🕵️',
    name: 'Deepfake Detective City',
    subtitle: 'Unmask AI deception and bias',
    theme: '#F59E0B',
    gradFrom: '#D97706',
    gradTo: '#F59E0B',
    borderColor: '#F59E0B',
    phases: [4, 9, 11, 17, 18],
    bossName: 'The Deepfake Villain',
    bossEmoji: '🦹',
    completionXP: 150,
    completionCoins: 60,
    completionBadge: { emoji: '🕵️', name: 'AI Detective' },
    lessons: ['lesson-12', 'lesson-9', 'lesson-10-jr', 'lesson-10', 'lesson-13-jr', 'lesson-13-in'],
  },
  {
    id: 5,
    emoji: '🚀',
    name: 'Future Inventors Lab',
    subtitle: 'Build AI solutions for tomorrow',
    theme: '#EC4899',
    gradFrom: '#BE185D',
    gradTo: '#EC4899',
    borderColor: '#EC4899',
    phases: [12, 13, 14, 15, 16, 19, 20],
    bossName: 'The Robot Overlord',
    bossEmoji: '🤖',
    completionXP: 200,
    completionCoins: 80,
    completionBadge: { emoji: '🚀', name: 'Future Inventor' },
    lessons: [
      'lesson-11', 'lesson-11-in', 'lesson-14-jr', 'lesson-14-in',
      'lesson-15-jr', 'lesson-15-in', 'lesson-16-jr', 'lesson-16-in',
      'lesson-17-jr', 'lesson-17-in', 'lesson-18-jr', 'lesson-18-in',
      'lesson-21-jr', 'lesson-21-in', 'lesson-22-jr', 'lesson-22-in',
    ],
  },
];

function getWorldProgress(world: World, completedLessons: string[]) {
  const total = world.lessons.length;
  const done = world.lessons.filter(id => completedLessons.includes(id)).length;
  return { done, total, percent: total > 0 ? Math.round((done / total) * 100) : 0 };
}

function WorldCard({
  world,
  index,
  isUnlocked,
  progress,
  isCurrent,
  onClick,
}: {
  world: World;
  index: number;
  isUnlocked: boolean;
  progress: { done: number; total: number; percent: number };
  isCurrent: boolean;
  onClick: () => void;
}) {
  const isComplete = progress.percent === 100;

  return (
    <motion.div
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4, ease: 'easeOut' }}
      className="relative"
    >
      {/* World connector line (except last) */}
      {index < WORLDS.length - 1 && (
        <div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-1.5 h-6 z-0"
          style={{ background: isComplete ? world.theme : '#374151' }}
        />
      )}

      <motion.button
        whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
        whileTap={isUnlocked ? { scale: 0.98 } : {}}
        onClick={isUnlocked ? onClick : undefined}
        className="relative w-full text-left cursor-pointer z-10"
        style={{
          background: isUnlocked ? '#1E1B4B' : '#16103A',
          border: `3px solid ${isUnlocked ? world.borderColor : '#374151'}`,
          boxShadow: isUnlocked
            ? isCurrent
              ? `4px 4px 0px #000, 0 0 20px ${world.theme}66`
              : '4px 4px 0px #000'
            : '2px 2px 0px #000',
          opacity: isUnlocked ? 1 : 0.5,
          cursor: isUnlocked ? 'pointer' : 'not-allowed',
        }}
      >
        {/* Completed ribbon */}
        {isComplete && (
          <div className="completed-ribbon-container">
            <div className="completed-ribbon">DONE</div>
          </div>
        )}

        {/* Active glow pulse */}
        {isCurrent && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              background: `radial-gradient(circle at center, ${world.theme}44, transparent 70%)`,
            }}
          />
        )}

        <div className="p-4 flex items-start gap-4">
          {/* World emoji + number */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div
              className="w-14 h-14 flex items-center justify-center text-3xl"
              style={{
                background: isUnlocked
                  ? `linear-gradient(135deg, ${world.gradFrom}, ${world.gradTo})`
                  : '#2D1B69',
                border: '3px solid #000',
                boxShadow: '3px 3px 0px #000',
              }}
            >
              {isUnlocked ? world.emoji : '🔒'}
            </div>
            <span
              className="font-pixel text-[5px]"
              style={{ color: isUnlocked ? world.theme : '#374151' }}
            >
              WORLD {world.id}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-game text-sm text-white">{world.name}</span>
              {isCurrent && !isComplete && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="font-pixel text-[5px] px-1.5 py-0.5"
                  style={{ background: world.theme, border: '1.5px solid #000', color: 'white' }}
                >
                  ACTIVE
                </motion.span>
              )}
              {isComplete && (
                <span className="font-pixel text-[5px] px-1.5 py-0.5 bg-emerald-700 border border-black text-white">
                  ✓ COMPLETE
                </span>
              )}
            </div>
            <p className="text-white/50 font-body text-xs mt-0.5">{world.subtitle}</p>

            {/* Progress bar */}
            {isUnlocked && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-body text-[10px] text-white/40">
                    {progress.done}/{progress.total} lessons
                  </span>
                  <span
                    className="font-pixel text-[6px]"
                    style={{ color: world.theme }}
                  >
                    {progress.percent}%
                  </span>
                </div>
                <div
                  className="w-full h-2.5 p-[1px] flex items-center"
                  style={{ background: '#0F0A2E', border: '2px solid #000' }}
                >
                  <motion.div
                    className="h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: index * 0.15 }}
                    style={{ background: `linear-gradient(90deg, ${world.gradFrom}, ${world.gradTo})` }}
                  />
                </div>
              </div>
            )}

            {/* Rewards preview */}
            <div className="flex items-center gap-3 mt-2">
              <span className="font-pixel text-[5px] text-white/30 flex items-center gap-0.5">
                <Zap className="w-2.5 h-2.5" /> +{world.completionXP} XP
              </span>
              <span className="font-pixel text-[5px] text-white/30">
                🪙 +{world.completionCoins}
              </span>
              <span className="font-pixel text-[5px] text-white/30">
                {world.completionBadge.emoji} Badge
              </span>
            </div>
          </div>

          {isUnlocked && (
            <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0 mt-1" />
          )}
          {!isUnlocked && (
            <Lock className="w-4 h-4 text-white/20 flex-shrink-0 mt-1" />
          )}
        </div>

        {/* Boss teaser at bottom */}
        {isUnlocked && progress.percent >= 80 && !isComplete && (
          <div
            className="mx-4 mb-3 px-3 py-2 flex items-center gap-2"
            style={{ background: '#0F0A2E', border: '2px solid #EF4444', boxShadow: '2px 2px 0px #000' }}
          >
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-lg"
            >
              {world.bossEmoji}
            </motion.span>
            <div>
              <div className="font-pixel text-[5px] text-red-400">BOSS CHALLENGE UNLOCKED!</div>
              <div className="font-game text-[10px] text-white/80">
                Face: {world.bossName}
              </div>
            </div>
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}

export default function WorldMap() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    title: string; xp: number; coins: number; badge: { emoji: string; name: string };
  } | null>(null);

  const completedLessons = profile?.completed_lessons || [];

  // Calculate world unlock state
  const worldStates = WORLDS.map((world, i) => {
    const progress = getWorldProgress(world, completedLessons);
    const prevWorld = i > 0 ? WORLDS[i - 1] : null;
    const prevProgress = prevWorld ? getWorldProgress(prevWorld, completedLessons) : null;
    const isUnlocked = i === 0 || (prevProgress?.percent ?? 0) >= 50;
    const isCurrent = isUnlocked && progress.percent < 100 &&
      (i === 0 || (WORLDS[i - 1] && getWorldProgress(WORLDS[i - 1], completedLessons).percent >= 50));
    return { world, progress, isUnlocked, isCurrent };
  });

  const totalPercent = Math.round(
    worldStates.reduce((sum, ws) => sum + ws.progress.percent, 0) / WORLDS.length
  );

  function handleWorldClick(world: World) {
    setSelectedWorld(world);
  }

  function navigateToLesson(lessonId: string) {
    navigate(`/learn/${lessonId}`);
    setSelectedWorld(null);
  }

  return (
    <div className="min-h-full" style={{ background: '#0F0A2E' }}>
      {/* Celebration Overlay */}
      {showCelebration && celebrationData && (
        <CelebrationOverlay
          show={showCelebration}
          title={celebrationData.title}
          subtitle="World Complete!"
          xpGained={celebrationData.xp}
          coinsGained={celebrationData.coins}
          badge={celebrationData.badge}
          onDone={() => setShowCelebration(false)}
        />
      )}

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-5 pt-5 pb-4"
      >
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/40 hover:text-white mb-4 font-body text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-game text-xl text-white flex items-center gap-2">
              🗺️ AI Adventure Map
            </h1>
            <p className="text-white/40 font-body text-xs mt-0.5">
              Your epic learning journey through 5 worlds
            </p>
          </div>
          <div
            className="px-3 py-2 text-center"
            style={{ background: '#1E1B4B', border: '3px solid #FFD60A', boxShadow: '3px 3px 0px #000' }}
          >
            <div className="font-pixel text-[6px] text-yellow-300">OVERALL</div>
            <div className="font-game text-lg text-white">{totalPercent}%</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-3 w-full h-3 p-[1px] flex items-center" style={{ background: '#0F0A2E', border: '2px solid #000' }}>
          <motion.div
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{ background: 'linear-gradient(90deg, #7C3AED, #3B82F6, #10B981)' }}
          />
        </div>
      </motion.div>

      {/* World Cards */}
      <div className="px-5 pb-8 space-y-5">
        {worldStates.map(({ world, progress, isUnlocked, isCurrent }, i) => (
          <WorldCard
            key={world.id}
            world={world}
            index={i}
            isUnlocked={isUnlocked}
            progress={progress}
            isCurrent={isCurrent}
            onClick={() => handleWorldClick(world)}
          />
        ))}

        {/* Hall of Fame CTA */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/leaderboard')}
          className="w-full p-4 flex items-center gap-3 cursor-pointer"
          style={{
            background: '#1E1B4B',
            border: '3px solid #F59E0B',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          <Trophy className="w-6 h-6 text-yellow-400" />
          <div className="flex-1 text-left">
            <div className="font-game text-sm text-white">🏛️ Student Hall of Fame</div>
            <div className="text-white/40 font-body text-xs">See top adventurers &amp; highest streaks</div>
          </div>
          <ChevronRight className="w-4 h-4 text-white/30" />
        </motion.button>
      </div>

      {/* World Detail Drawer */}
      <AnimatePresence>
        {selectedWorld && (() => {
          const ws = worldStates.find(w => w.world.id === selectedWorld.id);
          const worldLessons = selectedWorld.lessons.map(id =>
            CURRICULUM.find(l => l.id === id)
          ).filter(Boolean);

          return (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm">
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="w-full max-w-md max-h-[80vh] overflow-y-auto"
                style={{
                  background: '#1E1B4B',
                  border: `3px solid ${selectedWorld.borderColor}`,
                  boxShadow: `0 -4px 0px #000, 0 0 30px ${selectedWorld.theme}44`,
                }}
              >
                {/* Drawer header */}
                <div
                  className="sticky top-0 px-5 py-4 flex items-center justify-between"
                  style={{ background: '#1E1B4B', borderBottom: '3px solid #000' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedWorld.emoji}</span>
                    <div>
                      <div className="font-game text-sm text-white">{selectedWorld.name}</div>
                      <div className="font-pixel text-[5px]" style={{ color: selectedWorld.theme }}>
                        {ws?.progress.done}/{ws?.progress.total} lessons • {ws?.progress.percent}%
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedWorld(null)}
                    className="text-white/40 hover:text-white transition-colors font-body text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  {/* Lessons list */}
                  <div className="font-pixel text-[6px] text-white/40 mb-2">LESSONS IN THIS WORLD</div>
                  {worldLessons.map((lesson) => {
                    if (!lesson) return null;
                    const isDone = completedLessons.includes(lesson.id);
                    return (
                      <motion.button
                        key={lesson.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigateToLesson(lesson.id)}
                        className="w-full p-3 flex items-center gap-3 cursor-pointer text-left"
                        style={{
                          background: isDone ? `${selectedWorld.theme}18` : '#16103A',
                          border: `2px solid ${isDone ? selectedWorld.theme : '#000'}`,
                          boxShadow: '2px 2px 0px #000',
                        }}
                      >
                        <div
                          className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
                          style={{
                            background: isDone ? selectedWorld.theme : '#0F0A2E',
                            border: '2px solid #000',
                          }}
                        >
                          {isDone ? '✅' : lesson.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-game text-xs text-white truncate">{lesson.title}</div>
                          <div className="text-white/40 font-body text-[10px] truncate">{lesson.subtitle}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-pixel text-[5px] text-yellow-300">
                              +{lesson.xpReward} XP
                            </span>
                            <span className="font-pixel text-[5px] text-white/30">
                              🪙 +{lesson.coinsReward}
                            </span>
                          </div>
                        </div>
                        {isDone ? (
                          <Star className="w-4 h-4 flex-shrink-0" style={{ color: selectedWorld.theme }} />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0" />
                        )}
                      </motion.button>
                    );
                  })}

                  {/* Boss Challenge */}
                  <div
                    className="p-4 mt-2"
                    style={{
                      background: ws && ws.progress.percent >= 80 ? '#16103A' : '#0F0A2E',
                      border: `2px solid ${ws && ws.progress.percent >= 80 ? '#EF4444' : '#374151'}`,
                      boxShadow: '2px 2px 0px #000',
                      opacity: ws && ws.progress.percent >= 80 ? 1 : 0.5,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.span
                        animate={ws && ws.progress.percent >= 80 ? { scale: [1, 1.1, 1] } : {}}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="text-3xl"
                      >
                        {selectedWorld.bossEmoji}
                      </motion.span>
                      <div>
                        <div className="font-pixel text-[6px] text-red-400">BOSS CHALLENGE</div>
                        <div className="font-game text-sm text-white">{selectedWorld.bossName}</div>
                        <div className="text-white/40 font-body text-[10px]">
                          {ws && ws.progress.percent >= 80
                            ? 'Complete lessons to unlock!'
                            : 'Complete 80% of lessons to unlock'}
                        </div>
                      </div>
                    </div>
                    {ws && ws.progress.percent >= 80 && (
                      <button
                        onClick={() => navigate('/play/quiz')}
                        className="w-full mt-3 py-2 font-game text-xs cursor-pointer"
                        style={{
                          background: '#EF4444',
                          border: '2px solid #000',
                          boxShadow: '2px 2px 0px #000',
                          color: 'white',
                        }}
                      >
                        ⚔️ Face the Boss!
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
