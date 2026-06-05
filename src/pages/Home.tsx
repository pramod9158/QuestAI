import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentProfile, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CURRICULUM, STORY_QUESTS, WEEKLY_MISSIONS_DATA, PLAY_MODULES_DATA } from '@/data/curriculum';
import { getLevel, getXPForNextLevel, getEarnedBadges, getPlatformProgress } from '@/lib/gamification';
import { ProgressRing, XPToast, CoinToast } from '@/components/ui/GameUI';
import { Zap, BookOpen, Swords, Target, Trophy, Users, ChevronRight, Flame, Sparkles } from 'lucide-react';
import { askHomeQuestBot } from '@/lib/gemini';
import { PetCompanion } from '@/components/ui/PetCompanion';
import { DailyRewardModal } from '@/components/ui/DailyRewardModal';
import { TreasureChestModal } from '@/components/ui/TreasureChestModal';
import { getUnopenedChests, getUnopenedCount, type Chest } from '@/lib/treasureChest';
import { Map } from 'lucide-react';

const MODULE_CARDS = [
  { path: '/play/around-me', emoji: '🌍', title: 'AI Around Me', desc: 'Discover AI in your world', gradFrom: '#3B82F6', gradTo: '#8B5CF6', border: '#3B82F6', shadow: '#1D4ED8', zone: 'junior' },
  { path: '/play/story', emoji: '⚔️', title: 'Story Adventures', desc: '8 epic quests to solve', gradFrom: '#7C3AED', gradTo: '#3B82F6', border: '#7C3AED', shadow: '#5B21B6', zone: 'junior' },
  { path: '/play/detective', emoji: '🕵️', title: 'AI Detective', desc: 'Can AI help here?', gradFrom: '#10B981', gradTo: '#3B82F6', border: '#10B981', shadow: '#047857', zone: 'junior' },
  { path: '/play/brainstorm', emoji: '💡', title: 'Brainstorm Lab', desc: 'Invent AI solutions', gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706', zone: 'innovator' },
  { path: '/play/idea-generator', emoji: '⚡', title: 'Idea Generator', desc: 'AI power your ideas', gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B', zone: 'innovator' },
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Test your AI knowledge', gradFrom: '#EC4899', gradTo: '#7C3AED', border: '#EC4899', shadow: '#BE185D', zone: 'both' },
  { path: '/play/cards', emoji: '🃏', title: 'AI Cards', desc: 'Collect them all!', gradFrom: '#F59E0B', gradTo: '#10B981', border: '#F59E0B', shadow: '#D97706', zone: 'both' },
  { path: '/play/inventor-hall', emoji: '🏛️', title: 'Inventor Hall', desc: 'Share your inventions', gradFrom: '#8B5CF6', gradTo: '#EF4444', border: '#8B5CF6', shadow: '#6D28D9', zone: 'both' },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

export default function Home() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const { updateProfile } = useAuth();
  const [xpToastInfo, setXpToastInfo] = useState<{ amount: number; reason: string } | null>(null);
  const [timeOfDay, setTimeOfDay] = useState('');

  // Treasure chest states
  const [currentChest, setCurrentChest] = useState<Chest | null>(null);
  const [unopenedCount, setUnopenedCount] = useState(0);

  useEffect(() => {
    setUnopenedCount(getUnopenedCount());
  }, []);

  const handleOpenNextChest = () => {
    const chests = getUnopenedChests();
    if (chests.length > 0) setCurrentChest(chests[0]);
  };

  const handleChestClaim = async (chest: Chest) => {
    if (!profile) return;
    
    // Apply rewards based on chest content
    if (chest.reward.type === 'coins' && chest.reward.amount) {
      await updateProfile({ coins: (profile.coins ?? 0) + chest.reward.amount });
      setShowCoinsToast(chest.reward.amount);
      setTimeout(() => setShowCoinsToast(null), 2500);
    } else if (chest.reward.type === 'xp_boost' && chest.reward.amount) {
      await updateProfile({ xp: (profile.xp ?? 0) + chest.reward.amount });
      setXpToastInfo({ amount: chest.reward.amount, reason: `Treasure Chest: ${chest.reward.label}!` });
    } else if (chest.reward.type === 'ai_card' && chest.reward.item) {
      // Unlock the card in profiles or DB if it exists, fallback to localStorage
      try {
        const { data: currentCards } = await supabase
          .from('user_cards')
          .select('card_id');
        // Unlocked cards catalog logic
      } catch (err) {
        console.warn('Failed to save card in DB:', err);
      }
      const unlockedCards = JSON.parse(localStorage.getItem('unlocked_cards') || '[]');
      if (!unlockedCards.includes(chest.reward.item)) {
        localStorage.setItem('unlocked_cards', JSON.stringify([...unlockedCards, chest.reward.item]));
      }
    } else if (chest.reward.type === 'accessory' && chest.reward.item) {
      const petAccessories = JSON.parse(localStorage.getItem('pet_accessories') || '[]');
      if (!petAccessories.includes(chest.reward.item)) {
        localStorage.setItem('pet_accessories', JSON.stringify([...petAccessories, chest.reward.item]));
      }
    } else if (chest.reward.type === 'title' && chest.reward.item) {
      const unlockedTitles = JSON.parse(localStorage.getItem('unlocked_titles') || '[]');
      if (!unlockedTitles.includes(chest.reward.item)) {
        localStorage.setItem('unlocked_titles', JSON.stringify([...unlockedTitles, chest.reward.item]));
      }
    }

    const remaining = getUnopenedChests();
    setUnopenedCount(remaining.length);
    setCurrentChest(null);
  };

  // Parent mailbox states
  const [unreadEndorsement, setUnreadEndorsement] = useState<any | null>(null);
  const [showMailboxModal, setShowMailboxModal] = useState(false);
  const [showCoinsToast, setShowCoinsToast] = useState<number | null>(null);


  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const endorsements = JSON.parse(localStorage.getItem('parent_endorsements') || '[]');
    const unread = endorsements.find((e: any) => !e.claimed);
    if (unread) {
      setUnreadEndorsement(unread);
    }
  }, []);


  const handleClaimEndorsement = async () => {
    if (!unreadEndorsement || !profile) return;
    const currentCoins = profile.coins || 0;
    await updateProfile({
      coins: currentCoins + 50
    });

    const endorsements = JSON.parse(localStorage.getItem('parent_endorsements') || '[]');
    const updated = endorsements.map((e: any) => {
      if (e.id === unreadEndorsement.id) {
        return { ...e, claimed: true };
      }
      return e;
    });
    localStorage.setItem('parent_endorsements', JSON.stringify(updated));

    setUnreadEndorsement(null);
    setShowMailboxModal(false);
    
    // Show coin toast
    setShowCoinsToast(50);
    setTimeout(() => {
      setShowCoinsToast(null);
    }, 2500);
  };


  // QuestBot Companion states
  const [questBotInput, setQuestBotInput] = useState('');
  const [questBotAnswer, setQuestBotAnswer] = useState<string | null>(null);
  const [askingQuestBot, setAskingQuestBot] = useState(false);

  const handleAskQuestBot = async () => {
    if (!questBotInput.trim() || askingQuestBot) return;
    setAskingQuestBot(true);
    try {
      const response = await askHomeQuestBot(questBotInput);
      setQuestBotAnswer(response);
      setQuestBotInput('');
    } catch (err) {
      setQuestBotAnswer("Beep boop! I failed to compute that. Try again!");
    } finally {
      setAskingQuestBot(false);
    }
  };

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
  const stats = getPlatformProgress(profile);
  const completedLessons = stats.completedLessons;
  const totalLessons = stats.totalLessons;
  const playCompletedCount = stats.completedPlay;
  const totalPlayModules = stats.totalPlay;
  const completedMissionsCount = stats.completedMissions;
  const totalMissions = stats.totalMissions;
  const overallPercent = stats.overallPercent;

  const userZone = profile.zone || 'junior';
  const filteredCards = MODULE_CARDS.filter(mod => mod.zone === userZone || mod.zone === 'both');

  const rawInventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]');
  const savedIdeas = JSON.parse(localStorage.getItem('saved_ideas') || '[]');

  const isPlayModuleDone = (path: string) => {
    const mod = PLAY_MODULES_DATA.find(m => m.path === path);
    if (!mod) return false;
    const key = mod.completionKey;
    if (key === 'quests') {
      return !!(profile?.completed_quests && profile.completed_quests.length > 0);
    } else if (key.startsWith('quests_')) {
      const qId = key.replace('quests_', '');
      return localStorage.getItem(`quests_${qId}`) === 'true' || !!(profile?.completed_quests && profile.completed_quests.includes(qId));
    } else if (key === 'inventions') {
      return rawInventions.length > 0;
    } else if (key === 'ideas') {
      return savedIdeas.length > 0;
    } else {
      return localStorage.getItem(key) === 'true';
    }
  };

  const filteredPlay = PLAY_MODULES_DATA.filter(m => m.zones.includes(userZone));
  const activePlayIndex = filteredPlay.findIndex(m => !isPlayModuleDone(m.path));
  const activePlayMod = activePlayIndex !== -1 ? filteredPlay[activePlayIndex] : null;

  return (
    <div className="min-h-full bg-game" style={{ backgroundAttachment: 'fixed' }}>
      {xpToastInfo && (
        <XPToast 
          amount={xpToastInfo.amount} 
          reason={xpToastInfo.reason} 
          onDone={() => setXpToastInfo(null)} 
        />
      )}
      {showCoinsToast && <CoinToast amount={showCoinsToast} />}

      {/* Daily Login Reward Modal */}
      <DailyRewardModal
        username={profile.username}
        streak={profile.current_streak ?? 1}
        onClaim={async (coins, xp) => {
          await updateProfile({
            coins: (profile.coins ?? 0) + coins,
            xp: (profile.xp ?? 0) + xp,
          });
          setXpToastInfo({ amount: xp, reason: "Daily login reward!" });
          setShowCoinsToast(coins);
          setTimeout(() => setShowCoinsToast(null), 2500);
        }}
      />

      {/* Treasure Chest Modal */}
      {currentChest && (
        <TreasureChestModal
          chest={currentChest}
          onClaim={handleChestClaim}
          onClose={() => setCurrentChest(null)}
        />
      )}

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
            style={{ background: '#3B82F6', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
          >
            🎯
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-game text-sm" style={{ color: '#93C5FD' }}>Daily Mission Active!</div>
            <div className="text-white/50 font-body text-xs truncate">{WEEKLY_MISSIONS_DATA[0].title}</div>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#93C5FD' }} />
        </motion.div>

        {/* 🗺️ World Map Adventure Banner */}
        <motion.div
          {...fadeUp(0.18)}
          onClick={() => navigate('/worlds')}
          className="mt-4 p-4 flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
          style={{
            background: '#1E1B4B',
            border: '3px solid #7C3AED',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
              border: '2px solid #000000',
              boxShadow: '2px 2px 0px #000000',
            }}
          >
            🗺️
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-game text-sm text-white">AI Adventure World Map</div>
            <div className="text-white/50 font-body text-xs">Explore 5 worlds • Defeat boss challenges</div>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0 text-purple-400" />
        </motion.div>

        {/* 📦 Treasure Chest Notification */}
        {unopenedCount > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleOpenNextChest}
            className="mt-4 p-3 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
            style={{
              background: '#1E1B4B',
              border: '3px solid #F59E0B',
              boxShadow: '4px 4px 0px 0px #000000',
            }}
          >
            <div className="flex items-center gap-2.5">
              <motion.span
                animate={{ rotate: [-5, 5, -5], y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
                className="text-2xl"
              >
                📦
              </motion.span>
              <div>
                <div className="font-game text-[10px] text-yellow-300 uppercase">{unopenedCount} Treasure Chest{unopenedCount > 1 ? 's' : ''} Waiting!</div>
                <div className="font-body text-xs text-white/60">Tap to open your reward</div>
              </div>
            </div>
            <button className="bg-yellow-500 text-black font-game text-[9px] px-2.5 py-1 uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer">
              Open
            </button>
          </motion.div>
        )}

        {/* 📬 Parent Mailbox Banner */}
        {unreadEndorsement && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setShowMailboxModal(true)}
            className="mt-5 p-3 bg-purple-900 border-4 border-black text-white flex items-center justify-between cursor-pointer shadow-[4px_4px_0px_#000] active:scale-98 transition-transform"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-bounce">📬</span>
              <div>
                <div className="font-game text-[10px] text-warning uppercase">Parent Note Alert!</div>
                <div className="font-body text-xs text-white/80">Open message from your Parent</div>
              </div>
            </div>
            <button className="bg-success text-white font-game text-[9px] px-2.5 py-1 uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer">
              Open
            </button>
          </motion.div>
        )}

        {/* 🏆 My Learning Journey (Overall Progress) */}
        <motion.div
          {...fadeUp(0.18)}
          className="mt-5 p-4 space-y-3"
          style={{
            background: '#1E1B4B',
            border: '3px solid #FFD60A',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-game text-xs text-[#FFD60A] uppercase flex items-center gap-1.5">
              🏆 My Learning Journey
            </h3>
            <span className="font-pixel text-[8px] text-[#FFD60A]">{overallPercent}% Complete</span>
          </div>

          <div className="w-full h-5 bg-[#0F0A2E] border-2 border-black p-[2px] flex items-center shadow-[inset_2px_2px_0px_rgba(0,0,0,0.5)]">
            <div 
              className="h-full bg-[#FFD60A] shadow-[inset_-2px_0px_0px_rgba(0,0,0,0.2)]" 
              style={{ width: `${overallPercent}%`, transition: 'width 0.8s ease' }} 
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1.5 border-t border-white/5">
            <div className="text-center bg-[#16103A] border border-black p-2 shadow-[2px_2px_0px_#000]">
              <div className="text-sm">📚</div>
              <div className="font-game text-[7px] text-white mt-1">Lessons</div>
              <div className="font-pixel text-[6px] text-white/55 mt-0.5">{completedLessons}/{totalLessons} ({Math.round(completedLessons/(totalLessons || 1)*100)}%)</div>
            </div>
            <div className="text-center bg-[#16103A] border border-black p-2 shadow-[2px_2px_0px_#000]">
              <div className="text-sm">🎮</div>
              <div className="font-game text-[7px] text-white mt-1">Play</div>
              <div className="font-pixel text-[6px] text-white/55 mt-0.5">{playCompletedCount}/{totalPlayModules} ({Math.round(playCompletedCount/totalPlayModules*100)}%)</div>
            </div>
            <div className="text-center bg-[#16103A] border border-black p-2 shadow-[2px_2px_0px_#000]">
              <div className="text-sm">🎯</div>
              <div className="font-game text-[7px] text-white mt-1">Missions</div>
              <div className="font-pixel text-[6px] text-white/55 mt-0.5">{completedMissionsCount}/{totalMissions} ({Math.round(completedMissionsCount/totalMissions*100)}%)</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── AI Pet Companion ── */}
      <div className="px-5 mt-2">
        <div
          className="p-3"
          style={{
            background: '#1E1B4B',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-pixel text-[7px] text-white flex items-center gap-2 tracking-wide">
              🤖 YOUR AI PET
            </h2>
            <button
              onClick={() => navigate('/profile')}
              className="font-body text-[10px] text-white/40 hover:text-white/70 transition-colors cursor-pointer"
            >
              View Profile ›
            </button>
          </div>
          <PetCompanion xp={profile.xp} />
        </div>
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
              style={{ color: stat.borderColor }}
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
        {(() => {
          const zoneCurriculum = CURRICULUM.filter(l => l.zone === userZone || l.zone === 'both');
          const nextLesson = zoneCurriculum[completedLessons];
          return (
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(nextLesson ? `/learn/${nextLesson.id}` : '/learn')}
              className="p-4 flex items-center gap-4 cursor-pointer"
              style={{
                background: '#1E1B4B',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
            >
              <div
                className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0"
                style={{ 
                  background: nextLesson ? '#7C3AED' : '#10B981', 
                  border: '2px solid #000000', 
                  boxShadow: '2px 2px 0px #000000' 
                }}
              >
                {nextLesson ? nextLesson.emoji : '🎉'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-game text-sm text-white truncate">
                  {nextLesson ? nextLesson.title : 'Curriculum Completed!'}
                </div>
                <div className="text-white/45 font-body text-xs mt-0.5 truncate">
                  {nextLesson ? nextLesson.subtitle : 'Amazing job, you are an AI expert!'}
                </div>
                {nextLesson ? (
                  <div className="flex items-center gap-1 mt-2">
                    <Zap className="w-3 h-3" style={{ color: '#F59E0B' }} />
                    <span className="font-pixel text-[6px]" style={{ color: '#F59E0B' }}>
                      +{nextLesson.xpReward} XP
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-2 text-[#10B981] font-pixel text-[6px]">
                    ★ 20/20 MODULES COMPLETED
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-white/30 flex-shrink-0" />
            </motion.div>
          );
        })()}
      </div>

      {/* ── Module Grid ── */}
      <div className="px-5 mt-6">
        <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 mb-3 tracking-wide">
          <Swords className="w-4 h-4" style={{ color: '#7C3AED' }} />
          PLAY MODULES
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {filteredCards.map((mod, i) => {
            const isDone = isPlayModuleDone(mod.path);
            const cardIndexInPlay = filteredPlay.findIndex(m => {
              return m.path === mod.path || m.path.split('?')[0] === mod.path.split('?')[0];
            });
            const isLocked = !isDone && activePlayIndex !== -1 && cardIndexInPlay !== -1 && cardIndexInPlay > activePlayIndex;

            return (
              <motion.div
                key={mod.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                whileHover={!isDone && !isLocked ? { scale: 1.03, y: -2 } : {}}
                whileTap={!isDone && !isLocked ? { scale: 0.96 } : {}}
                onClick={() => {
                  if (isLocked) {
                    if (activePlayMod) {
                      navigate(activePlayMod.path);
                    }
                  } else {
                    navigate(mod.path);
                  }
                }}
                className={`p-4 cursor-pointer relative overflow-hidden transition-all ${
                  isDone ? 'opacity-40 grayscale saturate-50' : 
                  isLocked ? 'opacity-35 grayscale saturate-50' : ''
                }`}
                style={{
                  background: '#1E1B4B',
                  border: isLocked ? '3px solid #374151' : '3px solid #000000',
                  boxShadow: isDone || isLocked ? '2px 2px 0px 0px #000000' : '4px 4px 0px 0px #000000',
                }}
              >
                {isDone && (
                  <div className="completed-ribbon-container">
                    <div className="completed-ribbon">DONE</div>
                  </div>
                )}
                {isLocked && (
                  <div className="completed-ribbon-container">
                    <div className="completed-ribbon bg-gray-600" style={{ background: '#374151' }}>LOCKED</div>
                  </div>
                )}
                <div
                  className="w-10 h-10 flex items-center justify-center text-xl mb-3"
                  style={{ background: mod.gradFrom, border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
                >
                  {mod.emoji}
                </div>
                <div className="font-game text-sm text-white leading-tight">{mod.title}</div>
                <div className="text-white/45 font-body text-[11px] mt-1">{mod.desc}</div>
              </motion.div>
            );
          })}
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
                      background: '#7C3AED',
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
                style={{ color: row.gradFrom }}
              >
                {row.xp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── QuestBot AI Companion Chat ── */}
      <div className="px-5 mt-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 tracking-wide">
            <Sparkles className="w-4 h-4" style={{ color: '#7C3AED' }} />
            QUESTBOT COMPANION
          </h2>
        </div>
        <div
          className="p-4 space-y-4"
          style={{
            background: '#1E1B4B',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#7C3AED] border-2 border-black flex items-center justify-center text-lg">🤖</div>
            <div>
              <div className="font-game text-xs text-white">QuestBot AI</div>
              <div className="text-white/40 font-body text-[10px]">Ask me anything about Artificial Intelligence!</div>
            </div>
          </div>

          {questBotAnswer && (
            <div className="bg-black/30 border-l-4 border-[#7C3AED] p-3 text-xs font-body leading-relaxed text-white/90">
              {questBotAnswer}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={questBotInput}
              onChange={(e) => setQuestBotInput(e.target.value)}
              placeholder="e.g. What is a neural network?"
              onKeyDown={(e) => e.key === 'Enter' && handleAskQuestBot()}
              className="flex-1 pixel-input text-xs text-white placeholder-white/35"
              disabled={askingQuestBot}
            />
            <button
              onClick={handleAskQuestBot}
              disabled={askingQuestBot || !questBotInput.trim()}
              className="btn-primary p-2 flex items-center justify-center cursor-pointer text-xs"
              style={{ minHeight: '40px' }}
            >
              Ask
            </button>
          </div>
        </div>
      </div>

      {/* 📬 Mailbox Modal */}
      <AnimatePresence>
        {showMailboxModal && unreadEndorsement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-sm p-6 space-y-5 text-center relative"
              style={{ background: '#1E1B4B', border: '4px solid #000000', boxShadow: '8px 8px 0px 0px #000000' }}
            >
              <div className="text-3xl">📬</div>
              
              <div className="space-y-1">
                <h3 className="font-game text-xs text-warning uppercase tracking-wide">Parent Stamp of Approval!</h3>
                <p className="text-white/40 font-body text-[10px]">Verified: {unreadEndorsement.title}</p>
              </div>

              {/* Large Seal */}
              <div className="flex flex-col items-center gap-1.5 py-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-20 h-20 rounded-full bg-warning border-4 border-black flex items-center justify-center text-4xl shadow-[4px_4px_0px_#000]"
                >
                  {unreadEndorsement.sticker}
                </motion.div>
                <span className="text-[#FFD60A] font-game text-[10px] mt-1">{unreadEndorsement.stickerLabel}</span>
              </div>

              {/* Message box */}
              <div className="p-4 bg-[#16103A] border-2 border-black text-white/95 font-body text-xs italic leading-relaxed text-left">
                "{unreadEndorsement.message}"
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleClaimEndorsement}
                  className="w-full bg-[#FFD60A] text-black font-game text-xs py-3 border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer hover:bg-amber-300 transition-colors uppercase font-bold flex items-center justify-center gap-1"
                >
                  Claim +50 Coins 🪙
                </button>
                <button
                  type="button"
                  onClick={() => setShowMailboxModal(false)}
                  className="w-full text-center text-white/45 font-body text-xs hover:text-white/70 transition-colors cursor-pointer"
                >
                  Read later
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
