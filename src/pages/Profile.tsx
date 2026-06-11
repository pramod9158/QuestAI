import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { getLevel, getXPForNextLevel, getEarnedBadges, BADGES } from '@/lib/gamification';
import { PixelAvatar, Badge, ProgressRing, MysteryBox } from '@/components/ui/GameUI';
import { Button } from '@/components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronRight } from 'lucide-react';
import { useThemeStyles } from '@/lib/useThemeStyles';

const MYSTERY_REWARDS = ['🎩 Cool Hat', '🦺 Explorer Vest', '🌈 Rainbow Trail', '⚡ Lightning Effect', '🔮 Magic Orb', '🎯 Target Shield'];

export default function Profile() {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const profile = useCurrentProfile();
  const ts = useThemeStyles();
  const D = ts.duo;
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
    <div
      className={D ? '' : 'min-h-full pb-8 bg-stars bg-[#0F0A2E] text-white'}
      style={ts.page}
    >
      {/* Hero */}
      <div
        className="relative px-5 pt-6 pb-14 overflow-hidden"
        style={D ? { background: '#FFFFFF', borderBottom: '1px solid #E0E0E0' } : {}}
      >
        <div className="relative flex items-center gap-5">
          {/* Avatar with pixel border */}
          <div className="relative">
            {!D && (
              <div
                className="absolute inset-[-4px]"
                style={{
                  background: '#000000',
                  boxShadow: '4px 4px 0px 0px #000000',
                }}
              />
            )}
            <div style={{ position: 'relative' }}>
              <PixelAvatar username={profile.username} size={76} colorIndex={level % 6} />
            </div>
            {/* Level badge */}
            <div
              className={D ? '' : 'absolute -bottom-2 -right-2 px-2 py-0.5 font-pixel text-[6px] text-white'}
              style={D ? {
                position: 'absolute',
                bottom: -4,
                right: -4,
                background: '#8B5CF6',
                borderRadius: 999,
                padding: '3px 8px',
                color: '#FFFFFF',
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 800,
                fontSize: 10,
                boxShadow: '0 2px 4px rgba(139,92,246,0.3)',
              } : { background: '#7C3AED', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
            >
              {D ? `Lv. ${level}` : `LV.${level}`}
            </div>
          </div>

          <div>
            <h1 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 22 : undefined }} className={D ? '' : 'font-game text-xl text-white'}>{profile.username}</h1>
            <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined, fontWeight: D ? 700 : undefined }} className={D ? '' : 'text-white/45 font-pixel text-[6px] mt-1 tracking-wide'}>
              {profile.zone === 'junior' ? '🚀 JUNIOR EXPLORER' : '🧠 FUTURE INNOVATOR'}
            </p>
            {user && (
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#5FCC5F' }} />
                <span style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 700 : undefined, fontSize: D ? 11 : undefined, color: '#5FCC5F' }} className={D ? '' : 'font-pixel text-[6px] text-[#10B981]'}>
                  {D ? 'Connected' : 'CONNECTED'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* XP Progress */}
        <div className="relative mt-6 flex items-center gap-4">
          <ProgressRing progress={xpInfo.progress} size={58} color={D ? '#8B5CF6' : '#7C3AED'}>
            <span style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 11 : undefined, color: ts.textPrimary }} className={D ? '' : 'font-pixel text-[7px] text-white'}>
              {Math.round(xpInfo.progress)}%
            </span>
          </ProgressRing>
          <div className="flex-1">
            <div style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined, fontWeight: D ? 700 : undefined }} className={D ? '' : 'text-white/45 font-pixel text-[6px] mb-1.5 tracking-wide'}>
              {D ? 'XP to Next Level' : 'XP TO LEVEL ' + (level + 1)}
            </div>
            <div style={ts.progressTrack}>
              <motion.div
                style={ts.progressFill(xpInfo.progress)}
                animate={{ width: `${xpInfo.progress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 10 : undefined }} className={D ? '' : 'text-white/35 font-pixel text-[6px] mt-1'}>{xpInfo.current}/{xpInfo.needed} XP</div>
          </div>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="px-5 -mt-8 grid grid-cols-4 gap-2 relative z-10">
        {[
          { icon: '⚡', value: profile.xp, label: 'XP', border: D ? '#FFD60A' : '#F59E0B', duoColor: '#C8960C' },
          { icon: '🔥', value: profile.current_streak, label: 'Streak', border: D ? '#FF6B6B' : '#EF4444', duoColor: '#EF4444' },
          { icon: '📚', value: completedLessons, label: 'Lessons', border: D ? '#60A5FA' : '#3B82F6', duoColor: '#3B82F6' },
          { icon: '🏆', value: badges.length, label: 'Badges', border: D ? '#C4B5FD' : '#7C3AED', duoColor: '#8B5CF6' },
        ].map(stat => (
          <div
            key={stat.label}
            className="p-2 text-center"
            style={D ? {
              background: '#FFFFFF',
              border: `1.5px solid ${stat.duoColor}40`,
              borderRadius: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            } : {
              background: '#1E1B4B',
              border: `2px solid ${stat.border}`,
              boxShadow: '3px 3px 0px 0px #000000',
            }}
          >
            <div className="text-xl mb-0.5">{stat.icon}</div>
            <div
              style={D ? {
                color: '#000000',
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 900,
                fontSize: 14,
              } : {
                color: stat.border
              }}
              className={D ? '' : 'font-game text-sm'}
            >
              {stat.value}
            </div>
            <div style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 9 : undefined, fontWeight: D ? 700 : undefined }} className={D ? '' : 'text-white/35 font-pixel text-[5px] mt-0.5 tracking-wider uppercase'}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-5 mt-5">
        <div
          className={D ? '' : 'flex p-1'}
          style={D ? {
            display: 'flex',
            background: '#FFFFFF',
            border: '1.5px solid #E0E0E0',
            borderRadius: 12,
            padding: 4,
          } : { background: '#16103A', border: '2px solid #000000' }}
        >
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={D ? 'flex-1 py-2 font-body text-xs font-bold transition-all duration-150 rounded-lg cursor-pointer' : 'flex-1 py-2 font-pixel text-[6px] transition-all duration-150 tracking-wide'}
              style={activeTab === tab.key ? (D ? {
                background: '#F0FAF0',
                color: '#5FCC5F',
              } : {
                background: '#7C3AED',
                color: 'white',
                border: '1.5px solid #000000',
                boxShadow: '2px 2px 0px #000000',
              }) : (D ? { color: '#999999' } : { color: 'rgba(255,255,255,0.4)' })}
            >
              {D ? tab.label.replace('📊 ', '').replace('🏆 ', '').replace('⚙️ ', '') : tab.label}
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
              style={ts.card}
            >
              <h3 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : undefined }} className={D ? '' : 'font-pixel text-[7px] text-white tracking-wide'}>
                {D ? '📊 My Journey' : '📊 MY JOURNEY'}
              </h3>
              {[
                { emoji: '📺', label: 'Lessons Completed', value: completedLessons, gradFrom: D ? '#3B82F6' : '#3B82F6' },
                { emoji: '⚔️', label: 'Quests Solved', value: completedQuests, gradFrom: D ? '#8B5CF6' : '#7C3AED' },
                { emoji: '🪙', label: 'Coins Earned', value: profile.coins ?? 0, gradFrom: D ? '#C8960C' : '#F59E0B' },
                { emoji: '🏆', label: 'Badges Earned', value: badges.length, gradFrom: D ? '#EF4444' : '#EF4444' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                  style={{ borderColor: ts.divider }}
                >
                  <span style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 600 : undefined, fontSize: D ? 13 : undefined }} className={D ? '' : 'text-white/65 font-body text-sm'}>{item.emoji} {item.label}</span>
                  <span
                    style={D ? {
                      color: item.gradFrom,
                      fontFamily: '"Nunito", sans-serif',
                      fontWeight: 800,
                      fontSize: 14,
                    } : { color: item.gradFrom }}
                    className={D ? '' : 'font-game text-sm'}
                  >
                    {item.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Mystery Box */}
            <div
              className="p-5"
              style={ts.card}
            >
              <h3 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : undefined }} className={D ? '' : 'font-pixel text-[7px] text-white mb-4 tracking-wide'}>
                {D ? '🎁 Mystery Box' : '🎁 MYSTERY BOX'}
              </h3>
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
              className="w-full p-4 flex items-center gap-3 text-left transition-all cursor-pointer"
              style={ts.card}
            >
              <span className="text-3xl">👨‍🏫</span>
              <div>
                <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : undefined }} className={D ? '' : 'font-game text-sm text-white'}>Parent/Teacher Dashboard</div>
                <div style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined }} className={D ? '' : 'text-white/45 font-body text-xs'}>View progress & download certificate</div>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto" style={{ color: ts.textMuted }} />
            </motion.button>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-5">
            <div
              className="px-3 py-2 inline-block"
              style={D ? {
                background: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                borderRadius: 8,
              } : { background: '#16103A', border: '2px solid #000000', boxShadow: '2px 2px 0px 0px #000000' }}
            >
              <span style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 700 : undefined, fontSize: D ? 11 : undefined }} className={D ? '' : 'font-pixel text-[6px] text-white/60 tracking-wide'}>
                {D ? `${badges.length}/${BADGES.length} Badges Earned` : `${badges.length}/${BADGES.length} BADGES EARNED`}
              </span>
            </div>

            {badges.length > 0 && (
              <div>
                <h3 style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 13, color: '#5FCC5F' } : { color: '#10B981' }} className={D ? '' : 'font-pixel text-[7px] mb-3 tracking-wide'}>
                  {D ? 'Earned' : '✅ EARNED'}
                </h3>
                <div className="grid grid-cols-4 gap-4">
                  {badges.map(b => <Badge key={b.id} emoji={b.emoji} name={b.name} unlocked={true} />)}
                </div>
              </div>
            )}

            {lockedBadges.length > 0 && (
              <div>
                <h3 style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 13, color: '#999999' } : {}} className={D ? '' : 'font-pixel text-[7px] mb-3 text-white/35 tracking-wide'}>
                  {D ? 'Locked' : '🔒 LOCKED'}
                </h3>
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
              style={ts.card}
            >
              <h3 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : undefined }} className={D ? '' : 'font-pixel text-[7px] text-white tracking-wide'}>
                {D ? '⚙️ Account' : '⚙️ ACCOUNT'}
              </h3>
              <Button variant="danger" fullWidth onClick={handleSignOut} icon={<LogOut className="w-4 h-4" />}>
                Sign Out / Change User
              </Button>
            </div>

            <div
              className="p-5 space-y-3"
              style={ts.card}
            >
              <h3 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : undefined }} className={D ? '' : 'font-pixel text-[7px] text-white tracking-wide'}>
                {D ? '🎮 Zone' : '🎮 ZONE'}
              </h3>
              <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 12 : undefined }} className={D ? '' : 'text-white/45 font-body text-xs'}>Current: {profile.zone === 'junior' ? '🚀 Junior Explorer (6-11)' : '🧠 Future Innovator (12-16)'}</p>
              <button
                onClick={() => navigate('/onboarding')}
                className={D ? 'w-full py-2.5 font-body text-sm font-bold text-center transition-all bg-white border border-[#E0E0E0] hover:bg-[#F8F8F8] rounded-xl cursor-pointer text-[#555555]' : 'w-full py-2.5 text-white/55 font-body text-sm hover:text-white transition-colors'}
                style={D ? {} : { background: '#16103A', border: '2px solid #000000', boxShadow: '2px 2px 0px 0px #000000' }}
              >
                Switch Zone
              </button>
            </div>

            <div style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 9 : undefined, fontWeight: D ? 700 : undefined }} className={D ? 'text-center uppercase tracking-wider mt-4' : 'text-center text-white/20 font-pixel text-[5px] mt-4 tracking-widest'}>
              {D ? 'Quest AI v1.0 • Built for India 🇮🇳' : 'QUEST AI v1.0 • BUILT FOR INDIA 🇮🇳'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
