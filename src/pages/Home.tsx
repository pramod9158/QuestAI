import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { CURRICULUM, STORY_QUESTS, WEEKLY_MISSIONS_DATA } from '@/data/curriculum';
import { getLevel, getXPForNextLevel, getEarnedBadges } from '@/lib/gamification';
import { ProgressRing, XPToast } from '@/components/ui/GameUI';
import { Zap, BookOpen, Swords, Target, Lightbulb, Star, Trophy, Users, ChevronRight } from 'lucide-react';

const MODULE_CARDS = [
  { path: '/play/around-me', emoji: '🌍', title: 'AI Around Me', desc: 'Discover AI in your world', color: 'bg-blue-game', textColor: 'text-blue-game' },
  { path: '/play/story', emoji: '⚔️', title: 'Story Adventures', desc: '8 epic quests to solve', color: 'bg-primary', textColor: 'text-primary' },
  { path: '/play/detective', emoji: '🕵️', title: 'AI Detective', desc: 'Can AI help here?', color: 'bg-success', textColor: 'text-success' },
  { path: '/play/brainstorm', emoji: '💡', title: 'Brainstorm Lab', desc: 'Invent AI solutions', color: 'bg-warning', textColor: 'text-warning' },
  { path: '/play/idea-generator', emoji: '⚡', title: 'Idea Generator', desc: 'AI power your ideas', color: 'bg-pixel-pink', textColor: 'text-pink-400' },
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Test your AI knowledge', color: 'bg-pixel-red', textColor: 'text-red-400' },
  { path: '/play/cards', emoji: '🃏', title: 'AI Cards', desc: 'Collect them all!', color: 'bg-yellow-600', textColor: 'text-yellow-400' },
  { path: '/play/inventor-hall', emoji: '🏛️', title: 'Inventor Hall', desc: 'Share your inventions', color: 'bg-gray-600', textColor: 'text-gray-300' },
];

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
  const completedLessons = parseInt(localStorage.getItem('completed_lessons_count') || '0');

  return (
    <div className="min-h-full bg-pixel-darker">
      {showXP && <XPToast amount={10} reason="Daily login bonus!" onDone={() => setShowXP(false)} />}

      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary/40 to-pixel-darker p-6 pb-8 overflow-hidden">
        {/* Pixel decorations */}
        <div className="absolute top-2 right-4 text-4xl opacity-20 animate-float">⭐</div>
        <div className="absolute top-10 right-16 text-2xl opacity-15 animate-float" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-4 left-6 text-3xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🌟</div>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 font-body text-sm">{timeOfDay},</p>
            <motion.h1
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="text-white font-game text-2xl mt-1"
            >
              {profile.username}! 👋
            </motion.h1>
            <p className="text-white/50 font-body text-xs mt-1">
              {profile.zone === 'junior' ? '🚀 Junior Explorer' : '🧠 Future Innovator'}
            </p>
          </div>

          {/* Level Ring */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>
            <ProgressRing progress={xpInfo.progress} size={72} color="#F59E0B">
              <div className="text-center">
                <div className="text-warning font-pixel text-[8px]">LV</div>
                <div className="text-white font-pixel text-sm">{level}</div>
              </div>
            </ProgressRing>
          </motion.div>
        </div>

        {/* Daily Quest Banner */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/missions')}
          className="mt-5 border-4 border-black bg-warning/20 p-4 flex items-center gap-3 cursor-pointer hover:bg-warning/30 active:scale-98 transition-all"
        >
          <span className="text-3xl">🎯</span>
          <div className="flex-1">
            <div className="text-warning font-game text-sm">Daily Mission Active!</div>
            <div className="text-white/70 font-body text-xs">{WEEKLY_MISSIONS_DATA[0].title}</div>
          </div>
          <ChevronRight className="w-5 h-5 text-warning" />
        </motion.div>
      </div>

      {/* Stats Row */}
      <div className="px-4 -mt-4 grid grid-cols-3 gap-3 z-10 relative">
        {[
          { icon: '🔥', label: 'Streak', value: `${profile.current_streak} days`, color: 'border-orange-500' },
          { icon: '⚡', label: 'Total XP', value: profile.xp.toString(), color: 'border-yellow-400' },
          { icon: '🪙', label: 'Coins', value: profile.coins?.toString() ?? '0', color: 'border-yellow-300' },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`border-4 border-black ${stat.color} bg-pixel-dark p-3 text-center shadow-pixel`}
          >
            <div className="text-2xl">{stat.icon}</div>
            <div className="text-white font-game text-sm leading-tight">{stat.value}</div>
            <div className="text-white/40 font-body text-[10px]">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Continue Learning */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-game text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-game" /> Continue Learning
          </h2>
          <button onClick={() => navigate('/learn')} className="text-blue-game font-body text-xs flex items-center gap-1">
            See all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <motion.div
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/learn')}
          className="border-4 border-black bg-blue-game/20 p-4 flex items-center gap-4 cursor-pointer shadow-pixel-blue"
        >
          <div className="text-4xl">{CURRICULUM[completedLessons]?.emoji || '📺'}</div>
          <div className="flex-1">
            <div className="text-white font-game text-sm">{CURRICULUM[completedLessons]?.title || 'Start Learning!'}</div>
            <div className="text-white/60 font-body text-xs">{CURRICULUM[completedLessons]?.subtitle || 'Your AI journey begins here'}</div>
            <div className="flex items-center gap-1 mt-1">
              <Zap className="w-3 h-3 text-warning" />
              <span className="text-warning font-body text-xs">+{CURRICULUM[completedLessons]?.xpReward || 30} XP</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-white/50" />
        </motion.div>
      </div>

      {/* Module Grid */}
      <div className="px-4 mt-6">
        <h2 className="text-white font-game text-lg flex items-center gap-2 mb-3">
          <Swords className="w-5 h-5 text-primary" /> Play Modules
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {MODULE_CARDS.map((mod, i) => (
            <motion.div
              key={mod.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(mod.path)}
              className="border-4 border-black bg-pixel-dark p-4 cursor-pointer shadow-pixel hover:bg-white/5 active:translate-y-1 transition-all"
            >
              <div className="text-3xl mb-2">{mod.emoji}</div>
              <div className="text-white font-game text-xs leading-tight">{mod.title}</div>
              <div className="text-white/50 font-body text-[10px] mt-1">{mod.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Badges Earned */}
      {badges.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="text-white font-game text-lg flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-warning" /> Your Badges
          </h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {badges.map((b) => (
              <motion.div key={b.id} whileHover={{ scale: 1.1 }} className="flex-shrink-0 flex flex-col items-center gap-1">
                <div className="w-14 h-14 border-4 border-black bg-primary/30 flex items-center justify-center text-2xl shadow-pixel">
                  {b.emoji}
                </div>
                <span className="text-white/60 font-body text-[9px] text-center max-w-[56px] leading-tight">{b.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard Teaser */}
      <div className="px-4 mt-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white font-game text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-success" /> Leaderboard
          </h2>
          <button onClick={() => navigate('/leaderboard')} className="text-success font-body text-xs flex items-center gap-1">
            Full board <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="border-4 border-black bg-success/10 p-4">
          {['🥇 SuperCoder99 — 1,250 XP', '🥈 AIWizard — 980 XP', '🥉 PixelHero — 820 XP'].map((row, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-white/10 last:border-0">
              <span className="font-body text-white/80 text-sm">{row}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
