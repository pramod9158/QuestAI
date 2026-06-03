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
    { key: 'overview', label: '📊 STATS' },
    { key: 'badges', label: '🏆 BADGES' },
    { key: 'settings', label: '⚙️ SETTINGS' },
  ] as const;

  return (
    <div className="min-h-full pb-8">
      {/* Hero */}
      <div className="relative px-5 pt-6 pb-14 overflow-hidden">
        <div className="relative flex items-center gap-5">
          {/* Avatar with pixel border */}
          <div className="relative">
            <div
              className="absolute inset-[-4px]"
              style={{
                background: '#000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
            />
            <div style={{ position: 'relative' }}>
              <PixelAvatar username={profile.username} size={76} colorIndex={level % 6} />
            </div>
            {/* Level badge */}
            <div
              className="absolute -bottom-2 -right-2 px-2 py-0.5 font-pixel text-[6px] text-white"
              style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
            >
              LV.{level}
            </div>
          </div>

          <div>
            <h1 className="font-game text-xl text-white">{profile.username}</h1>
            <p className="text-white/45 font-pixel text-[6px] mt-1 tracking-wide">
              {profile.zone === 'junior' ? '🚀 JUNIOR EXPLORER' : '🧠 FUTURE INNOVATOR'}
            </p>
            {user && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2" style={{ background: '#10B981' }} />
                <span className="font-pixel text-[6px]" style={{ color: '#10B981' }}>CONNECTED</span>
              </div>
            )}
          </div>
        </div>

        {/* XP Progress */}
        <div className="relative mt-6 flex items-center gap-4">
          <ProgressRing progress={xpInfo.progress} size={58}>
            <span className="font-pixel text-[7px] text-white">{Math.round(xpInfo.progress)}%</span>
          </ProgressRing>
          <div className="flex-1">
            <div className="text-white/45 font-pixel text-[6px] mb-1.5 tracking-wide">XP TO LEVEL {level + 1}</div>
            <div className="h-3 overflow-hidden" style={{ background: '#0F0A2E', border: '2px solid #000000' }}>
              <motion.div
                className="h-full"
                style={{
                  background: 'linear-gradient(90deg, #F59E0B, #FCD34D)',
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(0,0,0,0.2) 4px, rgba(0,0,0,0.2) 6px)',
                }}
                animate={{ width: `${xpInfo.progress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="text-white/35 font-pixel text-[6px] mt-1">{xpInfo.current}/{xpInfo.needed} XP</div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="px-5 -mt-8 grid grid-cols-4 gap-2 relative z-10">
        {[
          { icon: '⚡', value: profile.xp, label: 'XP', gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706' },
          { icon: '🔥', value: profile.current_streak, label: 'Streak', gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B' },
          { icon: '📚', value: completedLessons, label: 'Lessons', gradFrom: '#3B82F6', gradTo: '#8B5CF6', border: '#3B82F6', shadow: '#1D4ED8' },
          { icon: '🏆', value: badges.length, label: 'Badges', gradFrom: '#7C3AED', gradTo: '#3B82F6', border: '#7C3AED', shadow: '#5B21B6' },
        ].map(stat => (
          <div
            key={stat.label}
            className="p-2 text-center"
            style={{
              background: '#1E1B4B',
              border: `2px solid ${stat.border}`,
              boxShadow: '3px 3px 0px 0px #000000',
            }}
          >
            <div className="text-xl mb-0.5">{stat.icon}</div>
            <div
              className="font-game text-sm"
              style={{ background: `linear-gradient(135deg, ${stat.gradFrom}, ${stat.gradTo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              {stat.value}
            </div>
            <div className="text-white/35 font-pixel text-[5px] mt-0.5 tracking-wider uppercase">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-5 mt-5">
        <div
          className="flex p-1"
          style={{ background: '#16103A', border: '2px solid #000000' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-1 py-2 font-pixel text-[6px] transition-all duration-150 tracking-wide"
              style={activeTab === tab.key ? {
                background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                color: 'white',
                border: '1.5px solid #000000',
                boxShadow: '2px 2px 0px #000000',
              } : { color: 'rgba(255,255,255,0.4)' }}
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
              className="p-5 space-y-3"
              style={{
                background: '#1E1B4B',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
            >
              <h3 className="font-pixel text-[7px] text-white tracking-wide">📊 MY JOURNEY</h3>
              {[
                { emoji: '📺', label: 'Lessons Completed', value: completedLessons, gradFrom: '#3B82F6', gradTo: '#8B5CF6' },
                { emoji: '⚔️', label: 'Quests Solved', value: completedQuests, gradFrom: '#7C3AED', gradTo: '#3B82F6' },
                { emoji: '🪙', label: 'Coins Earned', value: profile.coins ?? 0, gradFrom: '#F59E0B', gradTo: '#FCD34D' },
                { emoji: '🏆', label: 'Badges Earned', value: badges.length, gradFrom: '#EF4444', gradTo: '#F59E0B' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                >
                  <span className="text-white/65 font-body text-sm">{item.emoji} {item.label}</span>
                  <span
                    className="font-game text-sm"
                    style={{ background: `linear-gradient(135deg, ${item.gradFrom}, ${item.gradTo})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Mystery Box */}
            <div
              className="p-5"
              style={{
                background: '#1E1B4B',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
            >
              <h3 className="font-pixel text-[7px] text-white mb-4 tracking-wide">🎁 MYSTERY BOX</h3>
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
              className="w-full p-4 flex items-center gap-3 text-left transition-all"
              style={{
                background: '#1E1B4B',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
            >
              <span className="text-3xl">👨‍🏫</span>
              <div>
                <div className="font-game text-sm text-white">Parent/Teacher Dashboard</div>
                <div className="text-white/45 font-body text-xs">View progress & download certificate</div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/30 ml-auto" />
            </motion.button>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-5">
            <div
              className="px-3 py-2 inline-block"
              style={{ background: '#16103A', border: '2px solid #000000', boxShadow: '2px 2px 0px 0px #000000' }}
            >
              <span className="font-pixel text-[6px] text-white/60 tracking-wide">{badges.length}/{BADGES.length} BADGES EARNED</span>
            </div>

            {badges.length > 0 && (
              <div>
                <h3 className="font-pixel text-[7px] mb-3 tracking-wide" style={{ color: '#10B981' }}>
                  ✅ EARNED
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {badges.map(b => <Badge key={b.id} emoji={b.emoji} name={b.name} unlocked={true} />)}
                </div>
              </div>
            )}

            {lockedBadges.length > 0 && (
              <div>
                <h3 className="font-pixel text-[7px] mb-3 text-white/35 tracking-wide">🔒 LOCKED</h3>
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
              className="p-5 space-y-3"
              style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <h3 className="font-pixel text-[7px] text-white tracking-wide">⚙️ ACCOUNT</h3>
              <Button variant="danger" fullWidth onClick={handleSignOut} icon={<LogOut className="w-4 h-4" />}>
                Sign Out / Change User
              </Button>
            </div>

            <div
              className="p-5 space-y-3"
              style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <h3 className="font-pixel text-[7px] text-white tracking-wide">🎮 ZONE</h3>
              <p className="text-white/45 font-body text-xs">Current: {profile.zone === 'junior' ? '🚀 Junior Explorer (6-11)' : '🧠 Future Innovator (12-16)'}</p>
              <button
                onClick={() => navigate('/onboarding')}
                className="w-full py-2.5 text-white/55 font-body text-sm hover:text-white transition-colors"
                style={{ background: '#16103A', border: '2px solid #000000', boxShadow: '2px 2px 0px 0px #000000' }}
              >
                Switch Zone
              </button>
            </div>

            <div className="text-center text-white/20 font-pixel text-[5px] mt-4 tracking-widest">
              QUEST AI v1.0 • BUILT FOR INDIA 🇮🇳
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
