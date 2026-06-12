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
import { CURRICULUM, PHASES } from '@/data/curriculum';
import { ArrowLeft, Lock, Star, Zap, ChevronRight, Trophy } from 'lucide-react';
import { useThemeStyles } from '@/lib/useThemeStyles';
import { useFeedbackEngine } from '@/contexts/FeedbackEngineContext';

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

function getWorldProgress(world: World, completedLessons: string[], userZone: 'junior' | 'innovator') {
  const activeLessons = world.lessons.map(id =>
    CURRICULUM.find(l => l.id === id)
  ).filter((l): l is typeof CURRICULUM[0] => !!l && (l.zone === userZone || l.zone === 'both') && l.phase !== 3 && l.phase !== 8 && l.phase !== 2);

  const total = activeLessons.length;
  const done = activeLessons.filter(l => completedLessons.includes(l.id)).length;
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
  const ts = useThemeStyles();
  const D = ts.duo;
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
          style={{
            background: isComplete ? world.theme : (D ? '#E0E0E0' : '#374151'),
            width: D ? 3 : 6,
          }}
        />
      )}

      <motion.button
        whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
        whileTap={isUnlocked ? { scale: 0.98 } : {}}
        onClick={isUnlocked ? onClick : undefined}
        className="relative w-full text-left cursor-pointer z-10"
        style={D ? {
          background: isUnlocked ? '#FFFFFF' : '#F5F5F5',
          border: isUnlocked
            ? isCurrent
              ? `2px solid ${world.borderColor}`
              : `1.5px solid #E0E0E0`
            : `1.5px solid #E5E7EB`,
          borderRadius: 16,
          boxShadow: isUnlocked
            ? isCurrent
              ? `0 4px 12px rgba(0,0,0,0.06), 0 0 16px ${world.theme}25`
              : '0 2px 8px rgba(0,0,0,0.04)'
            : 'none',
          opacity: isUnlocked ? 1 : 0.6,
          cursor: isUnlocked ? 'pointer' : 'not-allowed',
        } : {
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
        {isComplete && !D && (
          <div className="completed-ribbon-container">
            <div className="completed-ribbon">DONE</div>
          </div>
        )}

        {/* Active glow pulse */}
        {isCurrent && !D && (
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
              className={D ? '' : 'w-14 h-14 flex items-center justify-center text-3xl'}
              style={D ? {
                width: 56,
                height: 56,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                background: isUnlocked
                  ? `linear-gradient(135deg, ${world.gradFrom}, ${world.gradTo})`
                  : '#E0E0E0',
                borderRadius: 14,
                border: '1.5px solid rgba(255,255,255,0.4)',
                boxShadow: isUnlocked ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
              } : {
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
              className={D ? '' : 'font-pixel text-[5px]'}
              style={D ? {
                color: isUnlocked ? world.theme : '#999999',
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 800,
                fontSize: 9,
                marginTop: 4,
                textTransform: 'uppercase',
              } : { color: isUnlocked ? world.theme : '#374151' }}
            >
              WORLD {world.id}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 15 : undefined }} className={D ? '' : 'font-game text-sm text-white'}>{world.name}</span>
              {isCurrent && !isComplete && (
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className={D ? '' : 'font-pixel text-[5px] px-1.5 py-0.5'}
                  style={D ? {
                    background: world.theme,
                    borderRadius: 6,
                    padding: '2px 8px',
                    color: 'white',
                    fontFamily: '"Nunito", sans-serif',
                    fontWeight: 800,
                    fontSize: 9,
                  } : { background: world.theme, border: '1.5px solid #000', color: 'white' }}
                >
                  {D ? 'Active' : 'ACTIVE'}
                </motion.span>
              )}
              {isComplete && (
                <span
                  style={D ? {
                    background: '#FFFBEB',
                    color: '#C8960C',
                    border: '1px solid #FFB84D',
                    borderRadius: 6,
                    padding: '2px 8px',
                    fontFamily: '"Nunito", sans-serif',
                    fontWeight: 800,
                    fontSize: 9
                  } : {}}
                  className={D ? '' : 'font-pixel text-[5px] px-1.5 py-0.5 bg-emerald-700 border border-black text-white'}
                >
                  {D ? '✓ Done' : '✓ COMPLETE'}
                </span>
              )}
            </div>
            <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined, fontWeight: D ? 600 : undefined }} className={D ? '' : 'text-white/50 font-body text-xs mt-0.5'}>{world.subtitle}</p>

            {/* Progress bar */}
            {isUnlocked && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined, fontWeight: D ? 700 : undefined }} className={D ? '' : 'font-body text-[10px] text-white/40'}>
                    {progress.done}/{progress.total} lessons
                  </span>
                  <span
                    className={D ? '' : 'font-pixel text-[6px]'}
                    style={D ? {
                      color: world.theme,
                      fontFamily: '"Nunito", sans-serif',
                      fontWeight: 800,
                      fontSize: 11,
                    } : { color: world.theme }}
                  >
                    {progress.percent}%
                  </span>
                </div>
                <div
                  className={D ? '' : 'w-full h-2.5 p-[1px] flex items-center'}
                  style={D ? {
                    width: '100%',
                    height: 8,
                    background: '#E0E0E0',
                    borderRadius: 999,
                    overflow: 'hidden',
                  } : { background: '#0F0A2E', border: '2px solid #000', padding: 1, display: 'flex', alignItems: 'center' }}
                >
                  <motion.div
                    className="h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.percent}%` }}
                    transition={{ duration: 1, ease: 'easeOut', delay: index * 0.15 }}
                    style={{
                      height: '100%',
                      background: `linear-gradient(90deg, ${world.gradFrom}, ${world.gradTo})`,
                      borderRadius: D ? 999 : 0,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Rewards preview */}
            <div className="flex items-center gap-3 mt-2">
              <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 10 : undefined, fontWeight: D ? 700 : undefined }} className={D ? 'flex items-center gap-0.5' : 'font-pixel text-[5px] text-white/30 flex items-center gap-0.5'}>
                ⚡ +{world.completionXP} XP
              </span>
              <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 10 : undefined, fontWeight: D ? 700 : undefined }} className={D ? '' : 'font-pixel text-[5px] text-white/30'}>
                🪙 +{world.completionCoins}
              </span>
              <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 10 : undefined, fontWeight: D ? 700 : undefined }} className={D ? '' : 'font-pixel text-[5px] text-white/30'}>
                {world.completionBadge.emoji} Badge
              </span>
            </div>
          </div>

          {isUnlocked && (
            <ChevronRight className="w-4 h-4 text-white/30 flex-shrink-0 mt-1" style={{ color: ts.textMuted }} />
          )}
          {!isUnlocked && (
            <Lock className="w-4 h-4 text-white/20 flex-shrink-0 mt-1" style={{ color: ts.textMuted }} />
          )}
        </div>

        {/* Boss teaser at bottom */}
        {isUnlocked && progress.percent >= 80 && !isComplete && (
          <div
            className={D ? '' : 'mx-4 mb-3 px-3 py-2 flex items-center gap-2'}
            style={D ? {
              margin: '0 16px 12px 16px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#FFF5F5',
              border: '1.5px solid #FCA5A5',
              borderRadius: 12,
            } : { background: '#0F0A2E', border: '2px solid #EF4444', boxShadow: '2px 2px 0px #000' }}
          >
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="text-lg"
            >
              {world.bossEmoji}
            </motion.span>
            <div>
              <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, color: '#EF4444', fontSize: 10 } : {}} className={D ? '' : 'font-pixel text-[5px] text-red-400'}>BOSS CHALLENGE UNLOCKED!</div>
              <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, color: '#000000', fontSize: 12 } : {}} className={D ? '' : 'font-game text-[10px] text-white/80'}>
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
  const ts = useThemeStyles();
  const D = ts.duo;
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const { showChapterCompletionCelebration } = useFeedbackEngine();

  const completedLessons = profile?.completed_lessons || [];
  const userZone = profile?.zone || 'junior';

  const dynamicWorlds = WORLDS.map(w => {
    if (D && w.id === 3) {
      return {
        ...w,
        theme: '#8B5CF6',
        gradFrom: '#8B5CF6',
        gradTo: '#C4B5FD',
        borderColor: '#8B5CF6',
      };
    }
    return w;
  });

  // Calculate world unlock state
  const worldStates = dynamicWorlds.map((world, i) => {
    const progress = getWorldProgress(world, completedLessons, userZone);
    const prevWorld = i > 0 ? dynamicWorlds[i - 1] : null;
    const prevProgress = prevWorld ? getWorldProgress(prevWorld, completedLessons, userZone) : null;
    const isUnlocked = i === 0 || (prevProgress?.percent ?? 0) >= 50;
    const isCurrent = isUnlocked && progress.percent < 100 &&
      (i === 0 || (dynamicWorlds[i - 1] && getWorldProgress(dynamicWorlds[i - 1], completedLessons, userZone).percent >= 50));
    return { world, progress, isUnlocked, isCurrent };
  });

  const totalPercent = Math.round(
    worldStates.reduce((sum, ws) => sum + ws.progress.percent, 0) / dynamicWorlds.length
  );

  React.useEffect(() => {
    worldStates.forEach(({ world, progress }) => {
      if (progress.percent === 100) {
        const key = `world_celebrated_${world.id}`;
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, 'true');
          showChapterCompletionCelebration({
            title: `WORLD ${world.id} CONQUERED!`,
            subtitle: `You completed all lessons in ${world.name}!`,
            xpGained: world.completionXP,
            coinsGained: world.completionCoins,
            badge: world.completionBadge,
          });
        }
      }
    });
  }, [completedLessons, userZone, showChapterCompletionCelebration]);

  function handleWorldClick(world: World) {
    setSelectedWorld(world);
  }

  function navigateToLesson(lessonId: string) {
    navigate(`/learn/${lessonId}`);
    setSelectedWorld(null);
  }

  return (
    <div
      className={D ? '' : 'min-h-full'}
      style={D ? ts.page : { background: '#0F0A2E' }}
    >

      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="px-5 pt-5 pb-4"
      >
        <button
          onClick={() => navigate('/')}
          className={D ? 'flex items-center gap-2 mb-4 font-body text-sm transition-colors cursor-pointer' : 'flex items-center gap-2 text-white/40 hover:text-white mb-4 font-body text-sm transition-colors'}
          style={D ? { color: '#8B5CF6', fontWeight: 700 } : {}}
        >
          <ArrowLeft className="w-4 h-4" /> {D ? 'Back' : 'Back'}
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 22 : undefined }} className={D ? '' : 'font-game text-xl text-white flex items-center gap-2'}>
              🗺️ {D ? 'AI Adventure Map' : 'AI ADVENTURE MAP'}
            </h1>
            <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 12 : undefined, fontWeight: D ? 600 : undefined }} className={D ? '' : 'text-white/40 font-body text-xs mt-0.5'}>
              Your epic learning journey through 5 worlds
            </p>
          </div>
          <div
            className={D ? '' : 'px-3 py-2 text-center'}
            style={D ? {
              background: '#FFFFFF',
              border: '1.5px solid #FFB84D',
              borderRadius: 12,
              padding: '6px 12px',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            } : { background: '#1E1B4B', border: '3px solid #FFD60A', boxShadow: '3px 3px 0px #000' }}
          >
            <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, color: '#C8960C', fontSize: 10 } : {}} className={D ? '' : 'font-pixel text-[6px] text-yellow-300'}>OVERALL</div>
            <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 900, color: '#000000', fontSize: 18 } : {}} className={D ? '' : 'font-game text-lg text-white'}>{totalPercent}%</div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div
          className={D ? '' : 'mt-3 w-full h-3 p-[1px] flex items-center'}
          style={D ? {
            width: '100%',
            height: 10,
            background: '#E0E0E0',
            borderRadius: 999,
            overflow: 'hidden',
            marginTop: 12,
          } : { background: '#0F0A2E', border: '2px solid #000', padding: 1, display: 'flex', alignItems: 'center', marginTop: 12 }}
        >
          <motion.div
            className="h-full"
            initial={{ width: 0 }}
            animate={{ width: `${totalPercent}%` }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            style={{
              background: D ? 'linear-gradient(90deg, #5FCC5F, #1EBC6B)' : 'linear-gradient(90deg, #7C3AED, #3B82F6, #10B981)',
              borderRadius: D ? 999 : 0,
            }}
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
          className={D ? 'w-full p-4 flex items-center gap-3 cursor-pointer text-left' : 'w-full p-4 flex items-center gap-3 cursor-pointer'}
          style={D ? {
            background: '#FFFFFF',
            border: '1.5px solid #FFB84D',
            borderRadius: 16,
            boxShadow: '0 4px 12px rgba(255,184,77,0.1)',
          } : {
            background: '#1E1B4B',
            border: '3px solid #F59E0B',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          <Trophy className="w-6 h-6 flex-shrink-0" style={{ color: D ? '#C8960C' : '#FFD60A' }} />
          <div className="flex-1 text-left">
            <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : undefined }} className={D ? '' : 'font-game text-sm text-white'}>
              {D ? 'Student Hall of Fame' : '🏛️ Student Hall of Fame'}
            </div>
            <div style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined }} className={D ? '' : 'text-white/40 font-body text-xs'}>See top adventurers &amp; highest streaks</div>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: ts.textMuted }} />
        </motion.button>
      </div>

      {/* World Detail Drawer */}
      <AnimatePresence>
        {selectedWorld && (() => {
          const ws = worldStates.find(w => w.world.id === selectedWorld.id);
          const zoneCurriculum = CURRICULUM.filter(l => (l.zone === userZone || l.zone === 'both') && l.phase !== 3 && l.phase !== 8 && l.phase !== 2);
          const visiblePhases = PHASES.filter(p => zoneCurriculum.some(l => l.phase === p.id));
          const worldLessons = selectedWorld.lessons.map(id =>
            CURRICULUM.find(l => l.id === id)
          ).filter((l): l is typeof CURRICULUM[0] => !!l && (l.zone === userZone || l.zone === 'both') && l.phase !== 3 && l.phase !== 8 && l.phase !== 2);

          return (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm">
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="w-full max-w-md max-h-[80vh] overflow-y-auto"
                style={D ? {
                  background: '#FFFFFF',
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  border: '1.5px solid #E0E0E0',
                  boxShadow: '0 -4px 24px rgba(0,0,0,0.15)',
                } : {
                  background: '#1E1B4B',
                  border: `3px solid ${selectedWorld.borderColor}`,
                  boxShadow: `0 -4px 0px #000, 0 0 30px ${selectedWorld.theme}44`,
                }}
              >
                {/* Drawer header */}
                <div
                  className="sticky top-0 px-5 py-4 flex items-center justify-between"
                  style={D ? {
                    background: '#FFFFFF',
                    borderBottom: '1px solid #E0E0E0',
                  } : { background: '#1E1B4B', borderBottom: '3px solid #000' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedWorld.emoji}</span>
                    <div>
                      <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 16 : undefined }} className={D ? '' : 'font-game text-sm text-white'}>{selectedWorld.name}</div>
                      <div style={D ? {
                        color: selectedWorld.theme,
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 800,
                        fontSize: 11,
                      } : { color: selectedWorld.theme }} className={D ? '' : 'font-pixel text-[5px]'}>
                        {ws?.progress.done}/{ws?.progress.total} lessons • {ws?.progress.percent}%
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedWorld(null)}
                    style={{ color: ts.textMuted }}
                    className="text-white/40 hover:text-white transition-colors font-body text-lg cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-5 space-y-3">
                  {/* Lessons list */}
                  <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 11, color: '#999999' } : {}} className={D ? 'mb-2' : 'font-pixel text-[6px] text-white/40 mb-2'}>
                    {D ? 'Lessons in this World' : 'LESSONS IN THIS WORLD'}
                  </div>
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
                        style={D ? {
                          background: isDone ? '#FFFBEB' : '#FFFFFF',
                          border: isDone ? `1.5px solid #FFB84D` : `1.5px solid #E0E0E0`,
                          borderRadius: 14,
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        } : {
                          background: isDone ? `${selectedWorld.theme}18` : '#16103A',
                          border: `2px solid ${isDone ? selectedWorld.theme : '#000'}`,
                          boxShadow: '2px 2px 0px #000',
                        }}
                      >
                        <div
                          className={D ? '' : 'w-10 h-10 flex items-center justify-center text-xl flex-shrink-0'}
                          style={D ? {
                            width: 36,
                            height: 36,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            background: isDone ? '#FFB84D' : '#F5F5F5',
                            borderRadius: 10,
                            flexShrink: 0,
                          } : {
                            background: isDone ? selectedWorld.theme : '#0F0A2E',
                            border: '2px solid #000',
                          }}
                        >
                          {isDone ? '✅' : lesson.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : undefined }} className={D ? 'truncate' : 'font-game text-xs text-white truncate'}>{lesson.title}</div>
                          {(() => {
                            const phaseIdx = visiblePhases.findIndex(p => p.id === lesson.phase);
                            const dynamicSubtitle = phaseIdx !== -1 ? `Phase ${phaseIdx + 1}: ${visiblePhases[phaseIdx].title}` : lesson.subtitle;
                            return (
                              <div style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined }} className={D ? 'truncate' : 'text-white/40 font-body text-[10px] truncate'}>{dynamicSubtitle}</div>
                            );
                          })()}
                          <div className="flex items-center gap-2 mt-1">
                            <span style={{ color: ts.textAccent, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 10 : undefined }} className={D ? '' : 'font-pixel text-[5px] text-yellow-300'}>
                              +{lesson.xpReward} XP
                            </span>
                            <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 700 : undefined, fontSize: D ? 10 : undefined }} className={D ? '' : 'font-pixel text-[5px] text-white/30'}>
                              🪙 +{lesson.coinsReward}
                            </span>
                          </div>
                        </div>
                        {isDone ? (
                          <Star className="w-4 h-4 flex-shrink-0" style={{ color: D ? '#FFB84D' : selectedWorld.theme }} />
                        ) : (
                          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: ts.textMuted }} />
                        )}
                      </motion.button>
                    );
                  })}

                  {/* Boss Challenge */}
                  <div
                    className={D ? '' : 'p-4 mt-2'}
                    style={D ? {
                      padding: 16,
                      marginTop: 8,
                      background: ws && ws.progress.percent >= 80 ? '#FFF5F5' : '#F5F5F5',
                      border: `1.5px solid ${ws && ws.progress.percent >= 80 ? '#FCA5A5' : '#E0E0E0'}`,
                      borderRadius: 16,
                      opacity: ws && ws.progress.percent >= 80 ? 1 : 0.6,
                    } : {
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
                        <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, color: '#EF4444', fontSize: 10 } : {}} className={D ? '' : 'font-pixel text-[6px] text-red-400'}>BOSS CHALLENGE</div>
                        <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : undefined }} className={D ? '' : 'font-game text-sm text-white'}>{selectedWorld.bossName}</div>
                        <div style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined }} className={D ? '' : 'text-white/40 font-body text-[10px]'}>
                          {ws && ws.progress.percent >= 80
                            ? 'Complete lessons to unlock!'
                            : 'Complete 80% of lessons to unlock'}
                        </div>
                      </div>
                    </div>
                    {ws && ws.progress.percent >= 80 && (
                      <button
                        onClick={() => navigate('/play/quiz')}
                        className={D ? 'w-full mt-3 py-2.5 text-center cursor-pointer transition-colors text-white hover:bg-red-600' : 'w-full mt-3 py-2 font-game text-xs cursor-pointer'}
                        style={D ? {
                          background: '#EF4444',
                          border: 'none',
                          borderRadius: 12,
                          fontFamily: '"Nunito", sans-serif',
                          fontWeight: 800,
                          fontSize: 13,
                          boxShadow: '0 3px 0px #C53030',
                        } : {
                          background: '#EF4444',
                          border: '2px solid #000',
                          boxShadow: '2px 2px 0px #000',
                          color: 'white',
                        }}
                      >
                        {D ? 'Face the Boss! ⚔️' : '⚔️ Face the Boss!'}
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
