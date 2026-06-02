import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { getLevel, getXPForNextLevel, getEarnedBadges, BADGES } from '@/lib/gamification';
import { PixelAvatar, Badge, ProgressRing, MysteryBox } from '@/components/ui/GameUI';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight } from 'lucide-react';

const MYSTERY_REWARDS = ['🎩 Cool Hat', '🦺 Explorer Vest', '🌈 Rainbow Trail', '⚡ Lightning Effect', '🔮 Magic Orb', '🎯 Target Shield'];

export default function Profile() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const profile = useCurrentProfile();
  const [openBox, setOpenBox] = useState(false);
  const [boxReward, setBoxReward] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'settings'>('overview');

  React.useEffect(() => {
    if (!profile) navigate('/auth', { replace: true });
  }, [profile, navigate]);

  if (!profile) return null;

  const level = getLevel(profile.xp);
  const xpInfo = getXPForNextLevel(profile.xp);
  const badges = getEarnedBadges(profile.xp, profile.current_streak);
  const lockedBadges = BADGES.filter(b => !badges.find(eb => eb.id === b.id));
  const completedLessons = profile.completed_lessons?.length || 0;
  const completedQuests = profile.completed_quests?.length || 0;

  const handleOpenBox = () => {
    const r = MYSTERY_REWARDS[Math.floor(Math.random() * MYSTERY_REWARDS.length)];
    setBoxReward(r);
    setOpenBox(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const TABS = [
    { key: 'overview', label: '📊 Stats' },
    { key: 'badges', label: '🏆 Badges' },
    { key: 'settings', label: '⚙️ Settings' },
  ] as const;

  return (
    <div className="min-h-full pb-8">
      {/* Hero */}
      <div className="relative px-5 pt-6 pb-14 overflow-hidden">
        <div className="gradient-orb gradient-orb-primary" style={{ width: 220, height: 220, top: -60, right: -60, opacity: 0.45 }} />
        <div className="gradient-orb gradient-orb-accent" style={{ width: 150, height: 150, bottom: 0, left: -30, opacity: 0.3, animationDelay: '-5s' }} />

        <div className="relative flex items-center gap-5">
          {/* Avatar with glow ring */}
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                padding: 3,
                borderRadius: 18,
                filter: 'blur(0px)',
                boxShadow: '0 0 24px rgba(127,90,240,0.6)',
              }}
            />
            <div style={{ position: 'relative' }}>
              <PixelAvatar username={profile.username} size={76} colorIndex={level % 6} />
            </div>
            {/* Level badge */}
            <div
              className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-lg font-heading font-bold text-xs text-gray-900"
              style={{ background: 'linear-gradient(135deg, #FFD60A, #FF9F1C)', boxShadow: '0 2px 8px rgba(255,214,10,0.6)' }}
            >
              LV.{level}
            </div>
          </div>

          <div>
            <h1 className="font-heading font-bold text-2xl text-white">{profile.username}</h1>
            <p className="text-white/50 font-body text-sm mt-0.5">
              {profile.zone === 'junior' ? '🚀 Junior Explorer' : '🧠 Future Innovator'}
            </p>
            {user && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#2CB67D', boxShadow: '0 0 6px rgba(44,182,125,0.8)' }} />
                <span className="font-body text-xs" style={{ color: '#2CB67D' }}>Connected</span>
              </div>
            )}
          </div>
        </div>

        {/* XP Progress */}
        <div className="relative mt-6 flex items-center gap-4">
          <ProgressRing progress={xpInfo.progress} size={58}>
            <span className="font-heading font-bold text-xs text-white">{Math.round(xpInfo.progress)}%</span>
          </ProgressRing>
          <div className="flex-1">
            <div className="text-white/50 font-body text-xs mb-1.5">XP to Level {level + 1}</div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #FFD60A, #FF9F1C)', boxShadow: '0 0 8px rgba(255,214,10,0.6)' }}
                animate={{ width: `${xpInfo.progress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="text-white/40 font-body text-xs mt-1">{xpInfo.current}/{xpInfo.needed} XP</div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="px-5 -mt-8 grid grid-cols-4 gap-2 relative z-10">
        {[
          { icon: '⚡', value: profile.xp, label: 'XP', grad: ['#FFD60A', '#FF9F1C'] },
          { icon: '🔥', value: profile.current_streak, label: 'Streak', grad: ['#FF8906', '#F25F4C'] },
          { icon: '📚', value: completedLessons, label: 'Lessons', grad: ['#00C2FF', '#5B5FFF'] },
          { icon: '🏆', value: badges.length, label: 'Badges', grad: ['#7F5AF0', '#2CB67D'] },
        ].map(stat => (
          <div
            key={stat.label}
            className="p-2 rounded-xl text-center"
            style={{
              background: `linear-gradient(135deg, rgba(127,90,240,0.15), rgba(44,182,125,0.08))`,
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="text-xl mb-0.5">{stat.icon}</div>
            <div
              className="font-heading font-bold text-sm"
              style={{ background: `linear-gradient(135deg, ${stat.grad[0]}, ${stat.grad[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {stat.value}
            </div>
            <div className="text-white/35 font-body text-[9px] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-5 mt-5">
        <div
          className="flex rounded-xl p-1"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2 rounded-xl font-heading font-semibold text-xs transition-all duration-200"
              style={activeTab === tab.key ? {
                background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(127,90,240,0.4)',
              } : { color: 'rgba(255,255,255,0.45)' }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Journey Stats */}
            <div
              className="p-5 rounded-2xl space-y-3"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <h3 className="font-heading font-bold text-sm text-white">📊 My Journey</h3>
              {[
                { emoji: '📺', label: 'Lessons Completed', value: completedLessons, grad: ['#00C2FF', '#5B5FFF'] },
                { emoji: '⚔️', label: 'Quests Solved', value: completedQuests, grad: ['#7F5AF0', '#2CB67D'] },
                { emoji: '🪙', label: 'Coins Earned', value: profile.coins ?? 0, grad: ['#FFD60A', '#FF9F1C'] },
                { emoji: '🏆', label: 'Badges Earned', value: badges.length, grad: ['#FF8906', '#F25F4C'] },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: 'rgba(255,255,255,0.07)' }}
                >
                  <span className="text-white/70 font-body text-sm">{item.emoji} {item.label}</span>
                  <span
                    className="font-heading font-bold text-sm"
                    style={{ background: `linear-gradient(135deg, ${item.grad[0]}, ${item.grad[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Mystery Box */}
            <div
              className="p-5 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(127,90,240,0.15), rgba(44,182,125,0.08))',
                border: '1px solid rgba(127,90,240,0.3)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <h3 className="font-heading font-bold text-sm text-white mb-4">🎁 Mystery Box</h3>
              <div className="flex flex-col items-center">
                <MysteryBox onOpen={handleOpenBox} isOpen={openBox} reward={boxReward} />
              </div>
              {openBox && (
                <Button variant="ghost" size="sm" fullWidth className="mt-4" onClick={() => setOpenBox(false)}>
                  Close Box
                </Button>
              )}
            </div>

            {/* Dashboard Link */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/dashboard')}
              className="w-full p-4 rounded-2xl flex items-center gap-3 text-left transition-all"
              style={{
                background: 'linear-gradient(135deg, rgba(0,194,255,0.15), rgba(91,95,255,0.08))',
                border: '1px solid rgba(0,194,255,0.3)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <span className="text-3xl">👨‍🏫</span>
              <div>
                <div className="font-heading font-bold text-sm text-white">Parent/Teacher Dashboard</div>
                <div className="text-white/50 font-body text-xs">View progress & download certificate</div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
            </motion.button>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-5">
            <div
              className="px-3 py-2 rounded-xl inline-block"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <span className="font-body text-xs text-white/60">{badges.length}/{BADGES.length} badges earned</span>
            </div>

            {badges.length > 0 && (
              <div>
                <h3
                  className="font-heading font-bold text-sm mb-3"
                  style={{ color: '#2CB67D' }}
                >
                  ✅ Earned
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {badges.map(b => <Badge key={b.id} emoji={b.emoji} name={b.name} unlocked={true} />)}
                </div>
              </div>
            )}

            {lockedBadges.length > 0 && (
              <div>
                <h3 className="font-heading font-bold text-sm mb-3 text-white/35">🔒 Locked</h3>
                <div className="grid grid-cols-4 gap-4">
                  {lockedBadges.map(b => <Badge key={b.id} emoji={b.emoji} name={b.name} unlocked={false} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div
              className="p-5 rounded-2xl space-y-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
            >
              <h3 className="font-heading font-bold text-sm text-white">⚙️ Account</h3>
              <Button variant="danger" fullWidth onClick={handleSignOut} icon={<LogOut className="w-4 h-4" />}>
                Sign Out / Change User
              </Button>
            </div>

            <div
              className="p-5 rounded-2xl space-y-3"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' }}
            >
              <h3 className="font-heading font-bold text-sm text-white">🎮 Zone</h3>
              <p className="text-white/50 font-body text-xs">Current: {profile.zone === 'junior' ? '🚀 Junior Explorer (6-11)' : '🧠 Future Innovator (12-16)'}</p>
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full py-2.5 rounded-xl text-white/60 font-body text-sm hover:text-white transition-colors"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                Switch Zone
              </button>
            </div>

            <div className="text-center text-white/20 font-body text-xs mt-4">
              Quest AI v1.0 • Built for India 🇮🇳
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
