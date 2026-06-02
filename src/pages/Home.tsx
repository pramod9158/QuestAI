import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { CURRICULUM, STORY_QUESTS, WEEKLY_MISSIONS_DATA } from '@/data/curriculum';
import { getLevel, getXPForNextLevel, getEarnedBadges } from '@/lib/gamification';
import { ProgressRing, XPToast } from '@/components/ui/GameUI';
import { Zap, BookOpen, Swords, Target, Trophy, Users, ChevronRight, Flame } from 'lucide-react';

const MODULE_CARDS = [
  { path: '/play/around-me', emoji: '🌍', title: 'AI Around Me', desc: 'Discover AI in your world', grad: ['#00C2FF', '#5B5FFF'] },
  { path: '/play/story', emoji: '⚔️', title: 'Story Adventures', desc: '8 epic quests to solve', grad: ['#7F5AF0', '#2CB67D'] },
  { path: '/play/detective', emoji: '🕵️', title: 'AI Detective', desc: 'Can AI help here?', grad: ['#2CB67D', '#00C2FF'] },
  { path: '/play/brainstorm', emoji: '💡', title: 'Brainstorm Lab', desc: 'Invent AI solutions', grad: ['#FFD60A', '#FF9F1C'] },
  { path: '/play/idea-generator', emoji: '⚡', title: 'Idea Generator', desc: 'AI power your ideas', grad: ['#FF8906', '#F25F4C'] },
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Test your AI knowledge', grad: ['#F25F4C', '#7F5AF0'] },
  { path: '/play/cards', emoji: '🃏', title: 'AI Cards', desc: 'Collect them all!', grad: ['#FFD60A', '#2CB67D'] },
  { path: '/play/inventor-hall', emoji: '🏛️', title: 'Inventor Hall', desc: 'Share your inventions', grad: ['#5B5FFF', '#FF8906'] },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

export default function Home() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const [showXP, setShowXP] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setTimeOfDay(h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening');
  }, []);

  useEffect(() => {
    if (!profile) navigate('/auth', { replace: true });
  }, [profile, navigate]);

  if (!profile) return null;

  const level = getLevel(profile.xp);
  const xpInfo = getXPForNextLevel(profile.xp);
  const badges = getEarnedBadges(profile.xp, profile.current_streak);
  const completedLessons = profile.completed_lessons?.length || 0;

  return (
    <div className="min-h-full" style={{ background: 'transparent' }}>
      {showXP && <XPToast amount={10} reason="Daily login bonus!" onDone={() => setShowXP(false)} />}

      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden px-5 pt-6 pb-10">
        {/* Decorative orbs */}
        <div className="gradient-orb gradient-orb-primary" style={{ width: 200, height: 200, top: -60, right: -40, opacity: 0.4 }} />
        <div className="gradient-orb gradient-orb-xp" style={{ width: 120, height: 120, top: 60, left: -30, opacity: 0.3, animationDelay: '-3s' }} />

        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-white/50 font-body text-sm">{timeOfDay},</p>
            <motion.h1
              {...fadeUp(0.05)}
              className="font-heading font-bold text-3xl mt-1"
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(127,90,240,0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {profile.username}! 👋
            </motion.h1>
            <p className="text-white/40 font-body text-xs mt-1">
              {profile.zone === 'junior' ? '🚀 Junior Explorer' : '🧠 Future Innovator'}
            </p>
          </div>

          {/* Level Ring */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}>
            <ProgressRing progress={xpInfo.progress} size={76} color="#7F5AF0">
              <div className="text-center">
                <div className="font-heading font-bold text-[9px] text-white/60">LV</div>
                <div className="font-heading font-bold text-lg text-white">{level}</div>
              </div>
            </ProgressRing>
          </motion.div>
        </div>

        {/* Daily Mission Banner */}
        <motion.div
          {...fadeUp(0.15)}
          onClick={() => navigate('/missions')}
          className="mt-5 p-4 rounded-2xl flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
          style={{
            background: 'linear-gradient(135deg, rgba(0,194,255,0.18) 0%, rgba(91,95,255,0.12) 100%)',
            border: '1px solid rgba(0,194,255,0.35)',
            boxShadow: '0 4px 24px rgba(0,194,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #00C2FF, #5B5FFF)', boxShadow: '0 4px 12px rgba(0,194,255,0.4)' }}
          >
            🎯
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading font-bold text-sm" style={{ color: '#00C2FF' }}>Daily Mission Active!</div>
            <div className="text-white/60 font-body text-xs truncate">{WEEKLY_MISSIONS_DATA[0].title}</div>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#00C2FF' }} />
        </motion.div>
      </div>

      {/* ── Stats Row ── */}
      <div className="px-5 -mt-6 grid grid-cols-3 gap-3 relative z-10">
        {[
          { icon: '🔥', label: 'Streak', value: `${profile.current_streak}d`, grad: ['#FF8906', '#F25F4C'], glow: 'rgba(255,137,6,0.3)' },
          { icon: '⚡', label: 'Total XP', value: profile.xp.toString(), grad: ['#FFD60A', '#FF9F1C'], glow: 'rgba(255,214,10,0.3)' },
          { icon: '🪙', label: 'Coins', value: profile.coins?.toString() ?? '0', grad: ['#FFD60A', '#FF9F1C'], glow: 'rgba(255,214,10,0.25)' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            {...fadeUp(i * 0.07)}
            className="p-3 rounded-2xl text-center"
            style={{
              background: `linear-gradient(135deg, rgba(${stat.grad[0] === '#FF8906' ? '255,137,6' : '255,214,10'},0.15) 0%, rgba(${stat.grad[1] === '#F25F4C' ? '242,95,76' : '255,159,28'},0.08) 100%)`,
              border: `1px solid rgba(${stat.grad[0] === '#FF8906' ? '255,137,6' : '255,214,10'},0.3)`,
              boxShadow: `0 4px 20px ${stat.glow}`,
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div
              className="font-heading font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${stat.grad[0]}, ${stat.grad[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {stat.value}
            </div>
            <div className="text-white/40 font-body text-[10px] mt-0.5">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Continue Learning ── */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5" style={{ color: '#00C2FF' }} />
            Continue Learning
          </h2>
          <button
            onClick={() => navigate('/learn')}
            className="font-body text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
            style={{ color: '#00C2FF' }}
          >
            See all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/learn')}
          className="p-4 rounded-2xl flex items-center gap-4 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, rgba(0,194,255,0.15) 0%, rgba(91,95,255,0.08) 100%)',
            border: '1px solid rgba(0,194,255,0.3)',
            boxShadow: '0 4px 24px rgba(0,194,255,0.15)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, rgba(0,194,255,0.25), rgba(91,95,255,0.2))', border: '1px solid rgba(0,194,255,0.3)' }}
          >
            {CURRICULUM[completedLessons]?.emoji || '📺'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-heading font-semibold text-sm text-white truncate">
              {CURRICULUM[completedLessons]?.title || 'Start Learning!'}
            </div>
            <div className="text-white/50 font-body text-xs mt-0.5 truncate">
              {CURRICULUM[completedLessons]?.subtitle || 'Your AI journey begins here'}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Zap className="w-3 h-3" style={{ color: '#FFD60A' }} />
              <span className="font-body text-xs" style={{ color: '#FFD60A' }}>
                +{CURRICULUM[completedLessons]?.xpReward || 30} XP
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />
        </motion.div>
      </div>

      {/* ── Module Grid ── */}
      <div className="px-5 mt-6">
        <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2 mb-3">
          <Swords className="w-5 h-5" style={{ color: '#7F5AF0' }} />
          Play Modules
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {MODULE_CARDS.map((mod, i) => (
            <motion.div
              key={mod.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(mod.path)}
              className="p-4 rounded-2xl cursor-pointer"
              style={{
                background: `linear-gradient(135deg, rgba(${hexToRgb(mod.grad[0])},0.18) 0%, rgba(${hexToRgb(mod.grad[1])},0.10) 100%)`,
                border: `1px solid rgba(${hexToRgb(mod.grad[0])},0.35)`,
                boxShadow: `0 4px 20px rgba(${hexToRgb(mod.grad[0])},0.15)`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                style={{ background: `linear-gradient(135deg, ${mod.grad[0]}, ${mod.grad[1]})`, boxShadow: `0 4px 12px rgba(${hexToRgb(mod.grad[0])},0.4)` }}
              >
                {mod.emoji}
              </div>
              <div className="font-heading font-bold text-sm text-white leading-tight">{mod.title}</div>
              <div className="text-white/50 font-body text-[11px] mt-1">{mod.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Badges Earned ── */}
      {badges.length > 0 && (
        <div className="px-5 mt-6">
          <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5" style={{ color: '#FFD60A' }} />
            Your Badges
          </h2>
          <div
            className="p-4 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(255,214,10,0.1) 0%, rgba(255,159,28,0.06) 100%)',
              border: '1px solid rgba(255,214,10,0.25)',
            }}
          >
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
              {badges.map((b) => (
                <motion.div key={b.id} whileHover={{ scale: 1.1 }} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(127,90,240,0.3), rgba(44,182,125,0.2))',
                      border: '1px solid rgba(127,90,240,0.5)',
                      boxShadow: '0 4px 16px rgba(127,90,240,0.3)',
                    }}
                  >
                    {b.emoji}
                  </div>
                  <span className="text-white/60 font-body text-[9px] text-center max-w-[56px] leading-tight">{b.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Leaderboard Teaser ── */}
      <div className="px-5 mt-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-lg text-white flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: '#2CB67D' }} />
            Leaderboard
          </h2>
          <button
            onClick={() => navigate('/leaderboard')}
            className="font-body text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: '#2CB67D' }}
          >
            Full board <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(44,182,125,0.12) 0%, rgba(0,194,255,0.07) 100%)',
            border: '1px solid rgba(44,182,125,0.25)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {[
            { rank: '🥇', name: 'SuperCoder99', xp: '1,250 XP', grad: ['#FFD60A', '#FF9F1C'] },
            { rank: '🥈', name: 'AIWizard', xp: '980 XP', grad: ['rgba(200,200,220,0.9)', 'rgba(160,160,180,0.9)'] },
            { rank: '🥉', name: 'PixelHero', xp: '820 XP', grad: ['#FF8906', '#F25F4C'] },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <span className="text-xl">{row.rank}</span>
              <span className="font-body text-white/80 text-sm flex-1">{row.name}</span>
              <span
                className="font-heading font-bold text-xs"
                style={{ background: `linear-gradient(135deg, ${row.grad[0]}, ${row.grad[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                {row.xp}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper: hex to rgb string for rgba()
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '127,90,240';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
