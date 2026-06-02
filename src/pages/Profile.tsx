import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { getLevel, getXPForNextLevel, getEarnedBadges, BADGES } from '@/lib/gamification';
import { PixelAvatar, Badge, ProgressRing, MysteryBox } from '@/components/ui/GameUI';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Trophy, Star, Zap, Book } from 'lucide-react';

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
  const submissions = JSON.parse(localStorage.getItem('mission_submissions') || '[]').length;
  const inventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]').length;

  const handleOpenBox = () => {
    const r = MYSTERY_REWARDS[Math.floor(Math.random() * MYSTERY_REWARDS.length)];
    setBoxReward(r);
    setOpenBox(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-full bg-pixel-darker pb-6">
      {/* Profile Hero */}
      <div className="relative bg-gradient-to-b from-primary/40 to-pixel-darker p-6 pb-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 border-l-4 border-b-4 border-black" />
        <div className="flex items-center gap-5">
          <div className="relative">
            <PixelAvatar username={profile.username} size={72} />
            <div className="absolute -bottom-1 -right-1 bg-warning border-2 border-black px-1.5 font-pixel text-[8px] text-black">
              LV.{level}
            </div>
          </div>
          <div>
            <h1 className="text-white font-game text-xl">{profile.username}</h1>
            <p className="text-white/60 font-body text-sm">{profile.zone === 'junior' ? '🚀 Junior Explorer' : '🧠 Future Innovator'}</p>
            {user && (
              <div className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 bg-success border border-black" />
                <span className="text-success font-body text-xs">Connected</span>
              </div>
            )}
          </div>
        </div>

        {/* XP Progress */}
        <div className="mt-5 flex items-center gap-3">
          <ProgressRing progress={xpInfo.progress} size={60} color="#F59E0B">
            <span className="text-white font-pixel text-[8px]">{Math.round(xpInfo.progress)}%</span>
          </ProgressRing>
          <div className="flex-1">
            <div className="text-white/60 font-body text-xs mb-1">XP to Level {level + 1}</div>
            <div className="h-4 bg-black border-2 border-black">
              <motion.div className="h-full bg-gradient-to-r from-warning to-primary"
                animate={{ width: `${xpInfo.progress}%` }} transition={{ duration: 0.8 }} />
            </div>
            <div className="text-white/50 font-body text-xs mt-1">{xpInfo.current}/{xpInfo.needed} XP</div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="px-4 -mt-6 grid grid-cols-4 gap-2 z-10 relative">
        {[
          { icon: '⚡', value: profile.xp, label: 'XP' },
          { icon: '🔥', value: profile.current_streak, label: 'Streak' },
          { icon: '📚', value: completedLessons, label: 'Lessons' },
          { icon: '🏆', value: badges.length, label: 'Badges' },
        ].map(stat => (
          <div key={stat.label} className="border-4 border-black bg-pixel-dark p-2 text-center shadow-pixel">
            <div className="text-xl">{stat.icon}</div>
            <div className="text-white font-game text-sm">{stat.value}</div>
            <div className="text-white/40 font-body text-[9px]">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-4 mt-5">
        <div className="flex border-4 border-black">
          {(['overview', 'badges', 'settings'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 font-game text-[10px] capitalize transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'bg-pixel-dark text-white/50 hover:text-white'}`}>
              {tab === 'overview' ? '📊 Stats' : tab === 'badges' ? '🏆 Badges' : '⚙️ Settings'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 mt-4">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Achievement Stats */}
            <div className="border-4 border-black bg-pixel-dark p-5 shadow-pixel space-y-3">
              <h3 className="text-white font-game text-sm">📊 My Journey</h3>
              {[
                { emoji: '📺', label: 'Lessons Completed', value: completedLessons },
                { emoji: '⚔️', label: 'Quests Solved', value: completedQuests },
                { emoji: '🎯', label: 'Missions Submitted', value: submissions },
                { emoji: '💡', label: 'Inventions Created', value: inventions },
                { emoji: '🪙', label: 'Coins Earned', value: profile.coins ?? 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0 last:pb-0">
                  <span className="text-white/70 font-body text-sm">{item.emoji} {item.label}</span>
                  <span className="text-white font-game text-sm">{item.value}</span>
                </div>
              ))}
            </div>

            {/* Mystery Box */}
            <div className="border-4 border-black bg-primary/20 p-5">
              <h3 className="text-white font-game text-sm mb-4">🎁 Mystery Box</h3>
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
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full border-4 border-black bg-blue-game/20 border-blue-game p-4 flex items-center gap-3 text-left hover:bg-blue-game/30 transition-all"
            >
              <span className="text-3xl">👨‍🏫</span>
              <div>
                <div className="text-white font-game text-sm">Parent/Teacher Dashboard</div>
                <div className="text-white/60 font-body text-xs">View progress & download certificate</div>
              </div>
            </button>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-4">
            <div className="text-white/60 font-body text-xs">{badges.length}/{BADGES.length} badges earned</div>
            {/* Earned */}
            {badges.length > 0 && (
              <div>
                <h3 className="text-success font-game text-sm mb-3">✅ Earned</h3>
                <div className="grid grid-cols-4 gap-4">
                  {badges.map(b => <Badge key={b.id} emoji={b.emoji} name={b.name} unlocked={true} />)}
                </div>
              </div>
            )}
            {/* Locked */}
            {lockedBadges.length > 0 && (
              <div>
                <h3 className="text-white/40 font-game text-sm mb-3">🔒 Locked</h3>
                <div className="grid grid-cols-4 gap-4">
                  {lockedBadges.map(b => <Badge key={b.id} emoji={b.emoji} name={b.name} unlocked={false} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="border-4 border-black bg-pixel-dark p-5 space-y-3">
              <h3 className="text-white font-game text-sm">⚙️ Account</h3>
              <Button variant="danger" fullWidth onClick={handleSignOut} icon={<LogOut className="w-4 h-4" />}>
                Sign Out / Change User
              </Button>
            </div>

            <div className="border-4 border-black bg-pixel-dark p-5 space-y-3">
              <h3 className="text-white font-game text-sm">🎮 Zone</h3>
              <p className="text-white/60 font-body text-xs">Current: {profile.zone === 'junior' ? '🚀 Junior Explorer (6-11)' : '🧠 Future Innovator (12-16)'}</p>
              <button onClick={() => navigate('/onboarding')} className="w-full border-2 border-white/20 bg-white/5 py-2 text-white/70 font-body text-sm hover:bg-white/10">
                Switch Zone
              </button>
            </div>

            <div className="text-center text-white/20 font-body text-xs mt-4">
              AI Explorer v1.0 • Built for India 🇮🇳
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
