import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { CURRICULUM, STORY_QUESTS, WEEKLY_MISSIONS_DATA } from '@/data/curriculum';
import { getLevel, getXPForNextLevel, getEarnedBadges } from '@/lib/gamification';
import { ProgressRing, XPToast } from '@/components/ui/GameUI';
import { Zap, BookOpen, Swords, Target, Trophy, Users, ChevronRight, Flame } from 'lucide-react';

const MODULE_CARDS = [
  { path: '/play/around-me', emoji: '🌍', title: 'AI Around Me', desc: 'Discover AI in your world', gradFrom: '#3B82F6', gradTo: '#8B5CF6', border: '#3B82F6', shadow: '#1D4ED8' },
  { path: '/play/story', emoji: '⚔️', title: 'Story Adventures', desc: '8 epic quests to solve', gradFrom: '#7C3AED', gradTo: '#3B82F6', border: '#7C3AED', shadow: '#5B21B6' },
  { path: '/play/detective', emoji: '🕵️', title: 'AI Detective', desc: 'Can AI help here?', gradFrom: '#10B981', gradTo: '#3B82F6', border: '#10B981', shadow: '#047857' },
  { path: '/play/brainstorm', emoji: '💡', title: 'Brainstorm Lab', desc: 'Invent AI solutions', gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706' },
  { path: '/play/idea-generator', emoji: '⚡', title: 'Idea Generator', desc: 'AI power your ideas', gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B' },
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Test your AI knowledge', gradFrom: '#EC4899', gradTo: '#7C3AED', border: '#EC4899', shadow: '#BE185D' },
  { path: '/play/cards', emoji: '🃏', title: 'AI Cards', desc: 'Collect them all!', gradFrom: '#F59E0B', gradTo: '#10B981', border: '#F59E0B', shadow: '#D97706' },
  { path: '/play/inventor-hall', emoji: '🏛️', title: 'Inventor Hall', desc: 'Share your inventions', gradFrom: '#8B5CF6', gradTo: '#EF4444', border: '#8B5CF6', shadow: '#6D28D9' },
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
    <div className="min-h-full bg-game" style={{ backgroundAttachment: 'fixed' }}>
      {showXP && <XPToast amount={10} reason="Daily login bonus!" onDone={() => setShowXP(false)} />}

      {/* ── Hero Section ── */}
      <div className="relative overflow-hidden px-5 pt-6 pb-10">
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-white/40 font-body text-sm">{timeOfDay},</p>
            <motion.h1
              {...fadeUp(0.05)}
              className="font-game text-2xl mt-1 text-white"
            >
              {profile.username}! 👋
            </motion.h1>
            <p className="text-white/40 font-pixel text-[6px] mt-2 tracking-wide">
              {profile.zone === 'junior' ? '🚀 JUNIOR EXPLORER' : '🧠 FUTURE INNOVATOR'}
            </p>
          </div>

          {/* Level Box */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}>
            <ProgressRing progress={xpInfo.progress} size={76} color="#7C3AED">
              <div className="text-center">
                <div className="font-pixel text-[6px] text-white/60">LV</div>
                <div className="font-pixel text-sm text-white">{level}</div>
              </div>
            </ProgressRing>
          </motion.div>
        </div>

        {/* Daily Mission Banner */}
        <motion.div
          {...fadeUp(0.15)}
          onClick={() => navigate('/missions')}
          className="mt-5 p-4 flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
          style={{
            background: '#1E1B4B',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
          >
            🎯
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-game text-sm" style={{ color: '#93C5FD' }}>Daily Mission Active!</div>
            <div className="text-white/50 font-body text-xs truncate">{WEEKLY_MISSIONS_DATA[0].title}</div>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#93C5FD' }} />
        </motion.div>
      </div>

      {/* ── Stats Row (Yellow bordered as in screenshot) ── */}
      <div className="px-5 -mt-6 grid grid-cols-3 gap-3 relative z-10">
        {[
          { icon: '🔥', label: 'Streak', value: `${profile.current_streak} days`, gradFrom: '#EF4444', gradTo: '#F59E0B', borderColor: '#F59E0B', shadowColor: '#D97706' },
          { icon: '⚡', label: 'Total XP', value: profile.xp.toString(), gradFrom: '#F59E0B', gradTo: '#FCD34D', borderColor: '#F59E0B', shadowColor: '#D97706' },
          { icon: '🪙', label: 'Coins', value: profile.coins?.toString() ?? '0', gradFrom: '#F59E0B', gradTo: '#FCD34D', borderColor: '#F59E0B', shadowColor: '#D97706' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            {...fadeUp(i * 0.07)}
            className="p-3 text-center"
            style={{
              background: '#1E1B4B',
              border: `3px solid ${stat.borderColor}`,
              boxShadow: '4px 4px 0px 0px #000000',
            }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div
              className="font-game text-sm"
              style={{ background: `linear-gradient(135deg, ${stat.gradFrom}, ${stat.gradTo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {stat.value}
            </div>
            <div className="text-white/40 font-pixel text-[5px] mt-1 tracking-wider uppercase">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Continue Learning ── */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 tracking-wide">
            <BookOpen className="w-4 h-4" style={{ color: '#3B82F6' }} />
            CONTINUE LEARNING
          </h2>
          <button
            onClick={() => navigate('/learn')}
            className="font-body text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
            style={{ color: '#93C5FD' }}
          >
            See all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/learn')}
          className="p-4 flex items-center gap-4 cursor-pointer"
          style={{
            background: '#1E1B4B',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div
            className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
          >
            {CURRICULUM[completedLessons]?.emoji || '📺'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-game text-sm text-white truncate">
              {CURRICULUM[completedLessons]?.title || 'Start Learning!'}
            </div>
            <div className="text-white/45 font-body text-xs mt-0.5 truncate">
              {CURRICULUM[completedLessons]?.subtitle || 'Your AI journey begins here'}
            </div>
            <div className="flex items-center gap-1 mt-2">
              <Zap className="w-3 h-3" style={{ color: '#F59E0B' }} />
              <span className="font-pixel text-[6px]" style={{ color: '#F59E0B' }}>
                +{CURRICULUM[completedLessons]?.xpReward || 30} XP
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />
        </motion.div>
      </div>

      {/* ── Module Grid ── */}
      <div className="px-5 mt-6">
        <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 mb-3 tracking-wide">
          <Swords className="w-4 h-4" style={{ color: '#7C3AED' }} />
          PLAY MODULES
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
              className="p-4 cursor-pointer"
              style={{
                background: '#1E1B4B',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center text-xl mb-3"
                style={{ background: `linear-gradient(135deg, ${mod.gradFrom}, ${mod.gradTo})`, border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
              >
                {mod.emoji}
              </div>
              <div className="font-game text-sm text-white leading-tight">{mod.title}</div>
              <div className="text-white/45 font-body text-[11px] mt-1">{mod.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Badges Earned ── */}
      {badges.length > 0 && (
        <div className="px-5 mt-6">
          <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 mb-3 tracking-wide">
            <Trophy className="w-4 h-4" style={{ color: '#F59E0B' }} />
            YOUR BADGES
          </h2>
          <div
            className="p-4"
            style={{
              background: '#1E1B4B',
              border: '3px solid #000000',
              boxShadow: '4px 4px 0px 0px #000000',
            }}
          >
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
              {badges.map((b) => (
                <motion.div key={b.id} whileHover={{ scale: 1.1 }} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                  <div
                    className="w-14 h-14 flex items-center justify-center text-2xl"
                    style={{
                      background: 'linear-gradient(135deg, #2D1B69, #1E3A5F)',
                      border: '3px solid #000000',
                      boxShadow: '3px 3px 0px 0px #000000',
                    }}
                  >
                    {b.emoji}
                  </div>
                  <span className="text-white/60 font-pixel text-[5px] text-center max-w-[56px] leading-relaxed">{b.name}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Leaderboard Teaser ── */}
      <div className="px-5 mt-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 tracking-wide">
            <Users className="w-4 h-4" style={{ color: '#10B981' }} />
            LEADERBOARD
          </h2>
          <button
            onClick={() => navigate('/leaderboard')}
            className="font-body text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
            style={{ color: '#6EE7B7' }}
          >
            Full board <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div
          className="overflow-hidden"
          style={{
            background: '#1E1B4B',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          {[
            { rank: '🥇', name: 'SuperCoder99', xp: '1,250 XP', gradFrom: '#F59E0B', gradTo: '#FCD34D' },
            { rank: '🥈', name: 'AIWizard', xp: '980 XP', gradFrom: '#C0C0D0', gradTo: '#9090A0' },
            { rank: '🥉', name: 'PixelHero', xp: '820 XP', gradFrom: '#EF4444', gradTo: '#F59E0B' },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
              style={{ borderColor: 'rgba(255,255,255,0.08)' }}
            >
              <span className="text-xl">{row.rank}</span>
              <span className="font-body text-white/80 text-sm flex-1">{row.name}</span>
              <span
                className="font-game text-xs"
                style={{ background: `linear-gradient(135deg, ${row.gradFrom}, ${row.gradTo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
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
