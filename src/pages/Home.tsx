import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentProfile, useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { CURRICULUM, PHASES, STORY_QUESTS, WEEKLY_MISSIONS_DATA, PLAY_MODULES_DATA } from '@/data/curriculum';
import { getLevel, getXPForNextLevel, getEarnedBadges, getPlatformProgress } from '@/lib/gamification';
import { ProgressRing, XPToast, CoinToast } from '@/components/ui/GameUI';
import { Zap, BookOpen, Swords, Target, Trophy, Users, ChevronRight, Flame, Sparkles } from 'lucide-react';
import { askHomeQuestBot } from '@/lib/ai';
import { TreasureChestModal } from '@/components/ui/TreasureChestModal';
import { getUnopenedChests, getUnopenedCount, type Chest } from '@/lib/treasureChest';
import { Map } from 'lucide-react';
import { useThemeStyles } from '@/lib/useThemeStyles';
import { useLearningCompanion } from '@/contexts/LearningCompanionContext';

const MODULE_CARDS = [
  { path: '/play/around-me', emoji: '🌍', title: 'AI Around Me', desc: 'Discover AI in your world', gradFrom: '#3B82F6', gradTo: '#8B5CF6', border: '#3B82F6', shadow: '#1D4ED8', zone: 'junior' },
  { path: '/play/story', emoji: '⚔️', title: 'Story Adventures', desc: '8 epic quests to solve', gradFrom: '#7C3AED', gradTo: '#3B82F6', border: '#7C3AED', shadow: '#5B21B6', zone: 'junior' },
  { path: '/play/detective', emoji: '🕵️', title: 'AI Detective', desc: 'Can AI help here?', gradFrom: '#10B981', gradTo: '#3B82F6', border: '#10B981', shadow: '#047857', zone: 'junior' },
  { path: '/play/brainstorm', emoji: '💡', title: 'Brainstorm Lab', desc: 'Invent AI solutions', gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706', zone: 'innovator' },
  { path: '/play/idea-generator', emoji: '⚡', title: 'Idea Generator', desc: 'AI power your ideas', gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B', zone: 'innovator' },
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Test your AI knowledge', gradFrom: '#EC4899', gradTo: '#7C3AED', border: '#EC4899', shadow: '#BE185D', zone: 'both' },
  { path: '/play/inventor-hall', emoji: '🏛️', title: 'Inventor Hall', desc: 'Share your inventions', gradFrom: '#8B5CF6', gradTo: '#EF4444', border: '#8B5CF6', shadow: '#6D28D9', zone: 'both' },
];

// Duolingo-friendly light pastel colors for module cards
const DUO_MODULE_COLORS: Record<string, string> = {
  '/play/around-me':    '#3B82F6',
  '/play/story':        '#8B5CF6',
  '/play/detective':    '#10B981',
  '/play/brainstorm':   '#F59E0B',
  '/play/idea-generator': '#EF4444',
  '/play/quiz':         '#EC4899',
  '/play/inventor-hall': '#8B5CF6',
};

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: 'easeOut' as const },
});

export default function Home() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const { updateProfile } = useAuth();
  const ts = useThemeStyles();
  const D = ts.duo; // shorthand

  const { pointTo, dailyQuests } = useLearningCompanion();



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

    if (chest.reward.type === 'coins' && chest.reward.amount) {
      await updateProfile({ coins: (profile.coins ?? 0) + chest.reward.amount });
      setShowCoinsToast(chest.reward.amount);
      setTimeout(() => setShowCoinsToast(null), 2500);
    } else if (chest.reward.type === 'xp_boost' && chest.reward.amount) {
      await updateProfile({ xp: (profile.xp ?? 0) + chest.reward.amount });
      setXpToastInfo({ amount: chest.reward.amount, reason: `Treasure Chest: ${chest.reward.label}!` });
    } else if (chest.reward.type === 'ai_card' && chest.reward.item) {
      try {
        const { data: currentCards } = await supabase.from('user_cards').select('card_id');
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

  const [unreadEndorsement, setUnreadEndorsement] = useState<any | null>(null);
  const [showMailboxModal, setShowMailboxModal] = useState(false);
  const [showCoinsToast, setShowCoinsToast] = useState<number | null>(null);

  const todayDate = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const endorsements = JSON.parse(localStorage.getItem('parent_endorsements') || '[]');
    const unread = endorsements.find((e: any) => !e.claimed);
    if (unread) setUnreadEndorsement(unread);
  }, []);

  const handleClaimEndorsement = async () => {
    if (!unreadEndorsement || !profile) return;
    await updateProfile({ coins: (profile.coins || 0) + 50 });

    const endorsements = JSON.parse(localStorage.getItem('parent_endorsements') || '[]');
    const updated = endorsements.map((e: any) =>
      e.id === unreadEndorsement.id ? { ...e, claimed: true } : e
    );
    localStorage.setItem('parent_endorsements', JSON.stringify(updated));
    setUnreadEndorsement(null);
    setShowMailboxModal(false);
    setShowCoinsToast(50);
    setTimeout(() => setShowCoinsToast(null), 2500);
  };

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
      setQuestBotAnswer('Beep boop! I failed to compute that. Try again!');
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
  const { completedLessons, totalLessons, completedPlay: playCompletedCount, totalPlay: totalPlayModules, completedMissions: completedMissionsCount, totalMissions, overallPercent } = stats;

  const userZone = profile.zone || 'junior';
  const filteredCards = MODULE_CARDS.filter(mod => mod.zone === userZone || mod.zone === 'both');
  const rawInventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]');
  const savedIdeas = JSON.parse(localStorage.getItem('saved_ideas') || '[]');

  const isPlayModuleDone = (path: string) => {
    const mod = PLAY_MODULES_DATA.find(m => m.path === path);
    if (!mod) return false;
    const key = mod.completionKey;
    if (key === 'quests') return !!(profile?.completed_quests && profile.completed_quests.length > 0);
    if (key.startsWith('quests_')) {
      const qId = key.replace('quests_', '');
      return localStorage.getItem(`quests_${qId}`) === 'true' || !!(profile?.completed_quests && profile.completed_quests.includes(qId));
    }
    if (key === 'inventions') return rawInventions.length > 0 || localStorage.getItem('user_has_inventions') === 'true';
    if (key === 'ideas') return savedIdeas.length > 0;
    return localStorage.getItem(key) === 'true';
  };

  const filteredPlay = PLAY_MODULES_DATA.filter(m => m.zones.includes(userZone));
  const activePlayIndex = filteredPlay.findIndex(m => !isPlayModuleDone(m.path));
  const activePlayMod = activePlayIndex !== -1 ? filteredPlay[activePlayIndex] : null;

  // ── Duolingo section label component ──────────────────────────────────────
  const SectionLabel = ({ icon, text }: { icon: string | React.ReactNode; text: string }) => D ? (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 15, color: '#000' }}>{text}</span>
    </div>
  ) : (
    <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 tracking-wide">
      <span>{icon}</span>
      {text}
    </h2>
  );

  return (
    <div
      className={D ? '' : 'min-h-full bg-game'}
      style={D ? { minHeight: '100%', background: '#F5F5F5', backgroundAttachment: 'fixed' } : { backgroundAttachment: 'fixed' }}
    >
      {xpToastInfo && (
        <XPToast
          amount={xpToastInfo.amount}
          reason={xpToastInfo.reason}
          onDone={() => setXpToastInfo(null)}
        />
      )}
      {showCoinsToast && <CoinToast amount={showCoinsToast} />}

      {currentChest && (
        <TreasureChestModal
          chest={currentChest}
          onClaim={handleChestClaim}
          onClose={() => setCurrentChest(null)}
        />
      )}

      {/* ── Hero Section ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden px-5 pt-6 pb-10">
        <div className="relative flex items-start justify-between">
          <div>
            <p style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 13 : undefined }}>
              {timeOfDay},
            </p>
            <motion.h1
              {...fadeUp(0.05)}
              style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 26 : undefined }}
              className={D ? '' : 'font-game text-2xl mt-1 text-white'}
            >
              {profile.username}! 👋
            </motion.h1>
            <p style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined, fontWeight: D ? 700 : undefined, marginTop: 4 }}
               className={D ? '' : 'text-white/40 font-pixel text-[6px] mt-2 tracking-wide'}
            >
              {profile.zone === 'junior' ? '🚀 Junior Explorer' : '🧠 Future Innovator'}
            </p>
          </div>

          {/* Level Ring */}
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}>
            <ProgressRing progress={xpInfo.progress} size={76} color={D ? '#5FCC5F' : '#7C3AED'}>
              <div className="text-center">
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 9 : 6, color: ts.textSecondary }}>LV</div>
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontWeight: D ? 900 : undefined, fontSize: D ? 18 : 12, color: ts.textPrimary }}>{level}</div>
              </div>
            </ProgressRing>
          </motion.div>
        </div>

        {/* ── Daily Mission Banner ───────────────────────────────────────────── */}
        <motion.div
          {...fadeUp(0.15)}
          onClick={() => navigate('/missions')}
          className="mt-5 p-4 flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
          style={D ? {
            background: '#FFFFFF',
            border: '1.5px solid #60A5FA',
            borderRadius: 14,
            boxShadow: '0 2px 10px rgba(96,165,250,0.15)',
          } : {
            background: '#1E1B4B',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
            style={D ? { background: '#EFF6FF', border: '1.5px solid #BFDBFE', borderRadius: 10 }
                     : { background: '#3B82F6', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
          >
            🎯
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : undefined, color: D ? '#3B82F6' : '#93C5FD' }}
                 className={D ? '' : 'font-game text-sm'}
            >
              Daily Mission Active!
            </div>
            <div style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 12 : undefined }}
                 className={D ? '' : 'text-white/50 font-body text-xs truncate'}
            >
              {WEEKLY_MISSIONS_DATA[0].title}
            </div>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: D ? '#3B82F6' : '#93C5FD' }} />
        </motion.div>

        {/* ── World Map Banner ───────────────────────────────────────────────── */}
        <motion.div
          {...fadeUp(0.18)}
          onClick={() => navigate('/worlds')}
          className="mt-4 p-4 flex items-center gap-3 cursor-pointer active:scale-98 transition-transform"
          style={D ? {
            background: '#FFFFFF',
            border: '1.5px solid #C4B5FD',
            borderRadius: 14,
            boxShadow: '0 2px 10px rgba(139,92,246,0.12)',
          } : {
            background: '#1E1B4B',
            border: '3px solid #7C3AED',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div
            className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
            style={D ? { background: '#F5F3FF', border: '1.5px solid #DDD6FE', borderRadius: 10 }
                     : { background: 'linear-gradient(135deg, #7C3AED, #3B82F6)', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
          >
            🗺️
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : undefined, color: ts.textPrimary }}
                 className={D ? '' : 'font-game text-sm text-white'}
            >
              AI Adventure World Map
            </div>
            <div style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 12 : undefined }}
                 className={D ? '' : 'text-white/50 font-body text-xs'}
            >
              Explore 5 worlds • Defeat boss challenges
            </div>
          </div>
          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: D ? '#8B5CF6' : '#A78BFA' }} />
        </motion.div>

        {/* ── Treasure Chest ────────────────────────────────────────────────── */}
        {unopenedCount > 0 && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={handleOpenNextChest}
            className="mt-4 p-3 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
            style={D ? {
              background: '#FFFBEB',
              border: '1.5px solid #FCD34D',
              borderRadius: 14,
              boxShadow: '0 2px 10px rgba(252,211,77,0.2)',
            } : {
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
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 12 : undefined, color: D ? '#C8960C' : undefined }}
                     className={D ? '' : 'font-game text-[10px] text-yellow-300 uppercase'}
                >
                  {unopenedCount} Treasure Chest{unopenedCount > 1 ? 's' : ''} Waiting!
                </div>
                <div style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined }}
                     className={D ? '' : 'font-body text-xs text-white/60'}
                >
                  Tap to open your reward
                </div>
              </div>
            </div>
            <button
              style={D ? {
                background: '#FCD34D',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                padding: '5px 12px',
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 800,
                fontSize: 12,
                boxShadow: '0 2px 0px rgba(0,0,0,0.12)',
                cursor: 'pointer',
              } : {}}
              className={D ? '' : 'bg-yellow-500 text-black font-game text-[9px] px-2.5 py-1 uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer'}
            >
              Open
            </button>
          </motion.div>
        )}

        {/* ── Parent Mailbox ────────────────────────────────────────────────── */}
        {unreadEndorsement && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setShowMailboxModal(true)}
            className="mt-5 p-3 flex items-center justify-between cursor-pointer active:scale-98 transition-transform"
            style={D ? {
              background: '#FFF5F5',
              border: '1.5px solid #FCA5A5',
              borderRadius: 14,
              boxShadow: '0 2px 10px rgba(252,165,165,0.2)',
            } : {
              background: '#4C1D95',
              border: '4px solid #000',
              boxShadow: '4px 4px 0px #000',
            }}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-2xl animate-bounce">📬</span>
              <div>
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 12 : undefined, color: D ? '#EF4444' : undefined }}
                     className={D ? '' : 'font-game text-[10px] text-warning uppercase'}
                >
                  Parent Note Alert!
                </div>
                <div style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined }}
                     className={D ? '' : 'font-body text-xs text-white/80'}
                >
                  Open message from your Parent
                </div>
              </div>
            </div>
            <button
              style={D ? {
                background: '#5FCC5F',
                color: '#000',
                border: 'none',
                borderRadius: 8,
                padding: '5px 12px',
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 800,
                fontSize: 12,
                boxShadow: '0 2px 0px rgba(0,0,0,0.12)',
                cursor: 'pointer',
              } : {}}
              className={D ? '' : 'bg-success text-white font-game text-[9px] px-2.5 py-1 uppercase border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer'}
            >
              Open
            </button>
          </motion.div>
        )}

        {/* ── Daily Quests Widget ───────────────────────────────────────────── */}
        <motion.div
          id="daily-quests-widget"
          {...fadeUp(0.20)}
          className="mt-5 p-4 space-y-4"
          style={D ? {
            background: '#FFFFFF',
            border: '1.5px solid #10B981',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(16,185,129,0.1)',
          } : {
            background: '#1E1B4B',
            border: '3px solid #10B981',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div className="flex items-center justify-between">
            {D ? (
              <span style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 14, color: '#10B981' }}>⚡ Rio's Daily Quests</span>
            ) : (
              <h3 className="font-game text-xs text-success uppercase">⚡ Rio's Daily Quests</h3>
            )}
            <span className="text-[9px] opacity-60 font-mono tracking-widest text-emerald-400">TODAY</span>
          </div>

          <div className="space-y-3">
            {dailyQuests.map((quest) => {
              const pct = Math.min(100, (quest.currentXP / quest.targetXP) * 100);
              return (
                <div key={quest.id} className="space-y-1.5 p-2.5 rounded-lg" style={{ background: D ? '#F9FAF9' : 'rgba(0,0,0,0.2)' }}>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-xs" style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined }}>{quest.description}</span>
                    <span className="text-[10px] text-yellow-500 font-extrabold font-mono">+{quest.rewardXP} XP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-grow bg-black/20 h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-bold font-mono whitespace-nowrap" style={{ color: ts.textSecondary }}>{quest.currentXP} / {quest.targetXP}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ── My Learning Journey ───────────────────────────────────────────── */}
        <motion.div
          {...fadeUp(0.18)}
          className="mt-5 p-4 space-y-3"
          style={D ? {
            background: '#FFFFFF',
            border: '1.5px solid #E0E0E0',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          } : {
            background: '#1E1B4B',
            border: '3px solid #FFD60A',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div className="flex items-center justify-between">
            {D ? (
              <>
                <span style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 14, color: '#000' }}>🏆 My Learning Journey</span>
                <span style={{ fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12, color: '#5FCC5F' }}>{overallPercent}% Complete</span>
              </>
            ) : (
              <>
                <h3 className="font-game text-xs text-[#FFD60A] uppercase flex items-center gap-1.5">🏆 My Learning Journey</h3>
                <span className="font-pixel text-[8px] text-[#FFD60A]">{overallPercent}% Complete</span>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div style={D ? {
            height: 14,
            background: '#F0F0F0',
            borderRadius: 999,
            overflow: 'hidden',
            padding: 2,
          } : {
            height: 20,
            background: '#0F0A2E',
            border: '2px solid black',
            padding: '2px',
            display: 'flex',
            alignItems: 'center',
            boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.5)',
          }}>
            <div
              style={D ? {
                width: `${overallPercent}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #5FCC5F, #1EBC6B)',
                borderRadius: 999,
                transition: 'width 0.8s ease',
              } : {
                width: `${overallPercent}%`,
                height: '100%',
                background: '#FFD60A',
                boxShadow: 'inset -2px 0px 0px rgba(0,0,0,0.2)',
                transition: 'width 0.8s ease',
              }}
            />
          </div>

          {/* 3-col stats */}
          <div className="grid grid-cols-3 gap-2 pt-1.5" style={{ borderTop: `1px solid ${ts.divider}` }}>
            {[
              { icon: '📚', label: 'Lessons', value: `${completedLessons}/${totalLessons}`, sub: `${Math.round(completedLessons/(totalLessons||1)*100)}%` },
              { icon: '🎮', label: 'Play', value: `${playCompletedCount}/${totalPlayModules}`, sub: `${Math.round(playCompletedCount/totalPlayModules*100)}%` },
              { icon: '🎯', label: 'Missions', value: `${completedMissionsCount}/${totalMissions}`, sub: `${Math.round(completedMissionsCount/totalMissions*100)}%` },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center p-2"
                style={D ? {
                  background: '#F8F8F8',
                  borderRadius: 10,
                  border: '1px solid #EEEEEE',
                } : {
                  background: '#16103A',
                  border: '1px solid #000',
                  boxShadow: '2px 2px 0px #000',
                }}
              >
                <div className="text-sm">{s.icon}</div>
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 700 : undefined, fontSize: D ? 11 : undefined, color: ts.textPrimary }}
                     className={D ? '' : 'font-game text-[7px] text-white mt-1'}
                >
                  {s.label}
                </div>
                <div style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 10 : undefined }}
                     className={D ? '' : 'font-pixel text-[6px] text-white/55 mt-0.5'}
                >
                  {s.value} ({s.sub})
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Stats Row ─────────────────────────────────────────────────────────── */}
      <div className="px-5 mt-5 grid grid-cols-3 gap-3 relative z-10">
        {[
          { icon: '🔥', label: 'Streak', value: `${profile.current_streak} days`, borderColor: '#EF4444', duoColor: '#EF4444' },
          { icon: '⚡', label: 'Total XP', value: profile.xp.toString(), borderColor: '#F59E0B', duoColor: '#C8960C' },
          { icon: '🪙', label: 'Coins', value: profile.coins?.toString() ?? '0', borderColor: '#F59E0B', duoColor: '#C8960C' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            {...fadeUp(i * 0.07)}
            className="p-3 text-center"
            style={D ? {
              background: '#FFFFFF',
              border: `1.5px solid ${stat.duoColor}30`,
              borderRadius: 14,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            } : {
              background: '#1E1B4B',
              border: `3px solid ${stat.borderColor}`,
              boxShadow: '4px 4px 0px 0px #000000',
            }}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div style={D
              ? { fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 15, color: '#000' }
              : { color: stat.borderColor }
            }
              className={D ? '' : 'font-game text-sm'}
            >
              {stat.value}
            </div>
            <div style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 9 : undefined, fontWeight: D ? 700 : undefined, textTransform: 'uppercase' as const, letterSpacing: D ? '0.5px' : undefined }}
                 className={D ? '' : 'text-white/40 font-pixel text-[5px] mt-1 tracking-wider uppercase'}
            >
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Continue Learning ─────────────────────────────────────────────────── */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          {D ? (
            <SectionLabel icon="📚" text="Continue Learning" />
          ) : (
            <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 tracking-wide">
              <BookOpen className="w-4 h-4" style={{ color: '#3B82F6' }} />
              CONTINUE LEARNING
            </h2>
          )}
          <button
            onClick={() => navigate('/learn')}
            style={{ color: D ? '#5FCC5F' : '#93C5FD', fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 700 : undefined }}
            className="font-body text-xs flex items-center gap-1 transition-opacity hover:opacity-80"
          >
            See all <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        {(() => {
          const zoneCurriculum = CURRICULUM.filter(l => (l.zone === userZone || l.zone === 'both') && l.phase !== 3 && l.phase !== 8 && l.phase !== 2);
          const nextLesson = zoneCurriculum[completedLessons];
          let dynamicSubtitle = 'Amazing job, you are an AI expert!';
          if (nextLesson) {
            const visiblePhases = PHASES.filter(p => zoneCurriculum.some(l => l.phase === p.id));
            const phaseIdx = visiblePhases.findIndex(p => p.id === nextLesson.phase);
            dynamicSubtitle = phaseIdx !== -1 ? `Phase ${phaseIdx + 1}: ${visiblePhases[phaseIdx].title}` : nextLesson.subtitle;
          }
          return (
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(nextLesson ? `/learn/${nextLesson.id}` : '/learn')}
              className="p-4 flex items-center gap-4 cursor-pointer"
              style={D ? {
                background: '#FFFFFF',
                border: '1.5px solid #C4B5FD',
                borderRadius: 14,
                boxShadow: '0 2px 10px rgba(124,58,237,0.1)',
              } : {
                background: '#1E1B4B',
                border: '3px solid #000000',
                boxShadow: '4px 4px 0px 0px #000000',
              }}
            >
              <div
                className="w-14 h-14 flex items-center justify-center text-3xl flex-shrink-0"
                style={D ? {
                  background: nextLesson ? '#F5F3FF' : '#F0FFF4',
                  border: `1.5px solid ${nextLesson ? '#DDD6FE' : '#BBF7D0'}`,
                  borderRadius: 12,
                } : {
                  background: nextLesson ? '#7C3AED' : '#10B981',
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                }}
              >
                {nextLesson ? nextLesson.emoji : '🎉'}
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : undefined }}
                     className={D ? '' : 'font-game text-sm text-white truncate'}
                >
                  {nextLesson ? nextLesson.title : 'Curriculum Completed!'}
                </div>
                <div style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 12 : undefined }}
                     className={D ? '' : 'text-white/45 font-body text-xs mt-0.5 truncate'}
                >
                  {dynamicSubtitle}
                </div>
                {nextLesson ? (
                  <div className="flex items-center gap-1 mt-2">
                    <Zap className="w-3 h-3" style={{ color: D ? '#C8960C' : '#F59E0B' }} />
                    <span style={{ color: D ? '#C8960C' : '#F59E0B', fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontWeight: D ? 800 : undefined, fontSize: D ? 11 : 6 }}>
                      +{nextLesson.xpReward} XP
                    </span>
                  </div>
                ) : (
                  <div style={{ color: D ? '#5FCC5F' : '#10B981', fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontWeight: D ? 800 : undefined, fontSize: D ? 11 : 6 }}
                       className="flex items-center gap-1 mt-2"
                  >
                    ✅ {completedLessons}/{totalLessons} MODULES COMPLETED
                  </div>
                )}
              </div>
              <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: D ? '#C4B5FD' : 'rgba(255,255,255,0.3)' }} />
            </motion.div>
          );
        })()}
      </div>

      {/* ── Module Grid ───────────────────────────────────────────────────────── */}
      <div className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          {D ? (
            <SectionLabel icon="🎮" text="Play Modules" />
          ) : (
            <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 tracking-wide">
              <Swords className="w-4 h-4" style={{ color: '#7C3AED' }} />
              PLAY MODULES
            </h2>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredCards.map((mod, i) => {
            const isDone = isPlayModuleDone(mod.path);
            const cardIndexInPlay = filteredPlay.findIndex(m =>
              m.path === mod.path || m.path.split('?')[0] === mod.path.split('?')[0]
            );
            const isLocked = !isDone && activePlayIndex !== -1 && cardIndexInPlay !== -1 && cardIndexInPlay > activePlayIndex;
            const duoAccent = DUO_MODULE_COLORS[mod.path] || '#5FCC5F';

            return (
              <motion.div
                key={mod.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                whileHover={!isDone && !isLocked ? { scale: 1.03, y: -2 } : {}}
                whileTap={!isDone && !isLocked ? { scale: 0.96 } : {}}
                onClick={() => {
                  if (isLocked) { if (activePlayMod) navigate(activePlayMod.path); }
                  else navigate(mod.path);
                }}
                className={`p-4 cursor-pointer relative overflow-hidden transition-all ${
                  isDone ? 'opacity-50' :
                  isLocked ? 'opacity-40' : ''
                }`}
                style={D ? {
                  background: '#FFFFFF',
                  border: isLocked ? '1.5px solid #E0E0E0' : `1.5px solid ${duoAccent}40`,
                  borderRadius: 14,
                  boxShadow: isDone || isLocked ? 'none' : `0 2px 10px ${duoAccent}18`,
                  filter: isDone ? 'grayscale(0.5)' : isLocked ? 'grayscale(0.6)' : 'none',
                } : {
                  background: '#1E1B4B',
                  border: isLocked ? '3px solid #374151' : '3px solid #000000',
                  boxShadow: isDone || isLocked ? '2px 2px 0px 0px #000000' : '4px 4px 0px 0px #000000',
                }}
              >
                {isDone && (
                  <div className="completed-ribbon-container">
                    <div className="completed-ribbon" style={D ? { background: '#5FCC5F', color: '#000', fontFamily: '"Nunito", sans-serif', fontWeight: 800 } : {}}>DONE</div>
                  </div>
                )}
                {isLocked && (
                  <div className="completed-ribbon-container">
                    <div className="completed-ribbon" style={{ background: D ? '#9CA3AF' : '#374151', color: D ? '#fff' : '#fff', fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined }}>LOCKED</div>
                  </div>
                )}
                <div
                  className="w-10 h-10 flex items-center justify-center text-xl mb-3"
                  style={D ? {
                    background: isLocked ? '#F5F5F5' : `${duoAccent}18`,
                    border: `1.5px solid ${isLocked ? '#E0E0E0' : duoAccent + '40'}`,
                    borderRadius: 10,
                  } : {
                    background: isLocked ? '#374151' : mod.gradFrom,
                    border: isLocked ? '2px solid #4B5563' : '2px solid #000000',
                    boxShadow: isLocked ? '2px 2px 0px #374151' : '2px 2px 0px #000000',
                  }}
                >
                  {isLocked ? '🔒' : mod.emoji}
                </div>
                <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : undefined }}
                     className={D ? '' : 'font-game text-sm text-white leading-tight'}
                >
                  {mod.title}
                </div>
                <div style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined }}
                     className={D ? '' : 'text-white/45 font-body text-[11px] mt-1'}
                >
                  {mod.desc}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Badges Earned ─────────────────────────────────────────────────────── */}
      {badges.length > 0 && (
        <div className="px-5 mt-6">
          <div className="flex items-center justify-between mb-3">
            {D ? (
              <SectionLabel icon="🏆" text="Your Badges" />
            ) : (
              <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 tracking-wide">
                <Trophy className="w-4 h-4" style={{ color: '#F59E0B' }} />
                YOUR BADGES
              </h2>
            )}
          </div>
          <div
            className="p-4"
            style={D ? {
              background: '#FFFFFF',
              border: '1.5px solid #E0E0E0',
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            } : {
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
                    style={D ? {
                      background: '#F0FFF4',
                      border: '2px solid #5FCC5F',
                      borderRadius: '50%',
                      boxShadow: '0 2px 8px rgba(95,204,95,0.2)',
                    } : {
                      background: '#7C3AED',
                      border: '3px solid #000000',
                      boxShadow: '3px 3px 0px 0px #000000',
                    }}
                  >
                    {b.emoji}
                  </div>
                  <span style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 700 : undefined, fontSize: D ? 10 : undefined, textAlign: 'center', maxWidth: 56 }}
                        className={D ? '' : 'text-white/60 font-pixel text-[5px] text-center max-w-[56px] leading-relaxed'}
                  >
                    {b.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Leaderboard Teaser ────────────────────────────────────────────────── */}
      <div className="px-5 mt-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          {D ? (
            <SectionLabel icon="🏅" text="Leaderboard" />
          ) : (
            <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 tracking-wide">
              <Users className="w-4 h-4" style={{ color: '#10B981' }} />
              LEADERBOARD
            </h2>
          )}
          <button
            onClick={() => navigate('/leaderboard')}
            style={{ color: D ? '#5FCC5F' : '#6EE7B7', fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 700 : undefined }}
            className="font-body text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
          >
            Full board <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div
          className="overflow-hidden"
          style={D ? {
            background: '#FFFFFF',
            border: '1.5px solid #E0E0E0',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          } : {
            background: '#1E1B4B',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          {[
            { rank: '🥇', name: 'SuperCoder99', xp: '1,250 XP', color: '#F59E0B' },
            { rank: '🥈', name: 'AIWizard', xp: '980 XP', color: D ? '#555555' : '#C0C0D0' },
            { rank: '🥉', name: 'PixelHero', xp: '820 XP', color: '#EF4444' },
          ].map((row, i) => (
            <div
              key={i}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-0"
              style={{ borderColor: ts.listRowBorder }}
            >
              <span className="text-xl">{row.rank}</span>
              <span style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 600 : undefined, fontSize: D ? 14 : undefined }}
                    className={D ? '' : 'font-body text-white/80 text-sm flex-1'}
              >
                {row.name}
              </span>
              <span style={{ color: row.color, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : undefined }}
                    className={D ? '' : 'font-game text-xs'}
              >
                {row.xp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── QuestBot AI Companion ─────────────────────────────────────────────── */}
      <div className="px-5 mt-6 mb-8">
        <div className="flex items-center justify-between mb-3">
          {D ? (
            <SectionLabel icon="🤖" text="QuestBot AI" />
          ) : (
            <h2 className="font-pixel text-[8px] text-white flex items-center gap-2 tracking-wide">
              <Sparkles className="w-4 h-4" style={{ color: '#7C3AED' }} />
              QUESTBOT COMPANION
            </h2>
          )}
        </div>
        <div
          className="p-4 space-y-4"
          style={D ? {
            background: '#FFFFFF',
            border: '1.5px solid #E0E0E0',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          } : {
            background: '#1E1B4B',
            border: '3px solid #000000',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div className="flex items-center gap-2">
            <div style={D ? {
              width: 36, height: 36,
              background: '#F0FAF0',
              border: '1.5px solid #5FCC5F',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            } : {
              width: 32, height: 32,
              background: '#7C3AED',
              border: '2px solid black',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              🤖
            </div>
            <div>
              <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : undefined }}
                   className={D ? '' : 'font-game text-xs text-white'}
              >
                QuestBot AI
              </div>
              <div style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : undefined }}
                   className={D ? '' : 'text-white/40 font-body text-[10px]'}
              >
                Ask me anything about Artificial Intelligence!
              </div>
            </div>
          </div>

          {questBotAnswer && (
            <div style={D ? {
              background: '#F8FFF8',
              border: '1.5px solid #BBF7D0',
              borderLeft: '4px solid #5FCC5F',
              borderRadius: 10,
              padding: '10px 14px',
              color: '#333333',
              fontFamily: '"Nunito", sans-serif',
              fontSize: 13,
              fontWeight: 600,
              lineHeight: 1.6,
            } : {
              background: 'rgba(0,0,0,0.3)',
              borderLeft: '4px solid #7C3AED',
              padding: '12px',
            }}
              className={D ? '' : 'text-xs font-body leading-relaxed text-white/90'}
            >
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
              className="flex-1 pixel-input text-xs"
              style={D ? { color: '#000000' } : { color: 'white' }}
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

      {/* ── Mailbox Modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMailboxModal && unreadEndorsement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-sm space-y-5 text-center relative"
              style={ts.modal}
            >
              <div className="text-3xl">📬</div>

              <div className="space-y-1">
                <h3 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 16 : undefined }}
                    className={D ? '' : 'font-game text-xs text-warning uppercase tracking-wide'}
                >
                  Parent Stamp of Approval!
                </h3>
                <p style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 12 : undefined }}
                   className={D ? '' : 'text-white/40 font-body text-[10px]'}
                >
                  Verified: {unreadEndorsement.title}
                </p>
              </div>

              <div className="flex flex-col items-center gap-1.5 py-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.2, 1] }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="w-20 h-20 flex items-center justify-center text-4xl"
                  style={D ? {
                    background: '#F0FFF4',
                    border: '2px solid #5FCC5F',
                    borderRadius: '50%',
                    boxShadow: '0 4px 16px rgba(95,204,95,0.25)',
                  } : {
                    borderRadius: '50%',
                    background: '#FFD60A',
                    border: '4px solid #000',
                    boxShadow: '4px 4px 0px #000',
                  }}
                >
                  {unreadEndorsement.sticker}
                </motion.div>
                <span style={{ color: D ? '#5FCC5F' : '#FFD60A', fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontWeight: D ? 800 : undefined, fontSize: D ? 12 : 10, marginTop: 4 }}>
                  {unreadEndorsement.stickerLabel}
                </span>
              </div>

              <div style={D ? {
                background: '#F8FFF8',
                border: '1.5px solid #BBF7D0',
                borderRadius: 12,
                padding: '14px',
                color: '#333333',
                fontFamily: '"Nunito", sans-serif',
                fontStyle: 'italic',
                fontSize: 13,
                lineHeight: 1.6,
                textAlign: 'left',
              } : {
                padding: '16px',
                background: '#16103A',
                border: '2px solid black',
                color: 'rgba(255,255,255,0.95)',
                fontStyle: 'italic',
                fontSize: 12,
                lineHeight: 1.6,
                textAlign: 'left',
              }}>
                "{unreadEndorsement.message}"
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleClaimEndorsement}
                  style={D ? {
                    width: '100%',
                    background: '#5FCC5F',
                    color: '#000',
                    border: 'none',
                    borderRadius: 12,
                    padding: '14px',
                    fontFamily: '"Nunito", sans-serif',
                    fontWeight: 800,
                    fontSize: 14,
                    boxShadow: '0 4px 0px rgba(0,0,0,0.15)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 4,
                  } : {}}
                  className={D ? '' : 'w-full bg-[#FFD60A] text-black font-game text-xs py-3 border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer hover:bg-amber-300 transition-colors uppercase font-bold flex items-center justify-center gap-1'}
                >
                  🪙 Claim +50 Coins
                </button>
                <button
                  type="button"
                  onClick={() => setShowMailboxModal(false)}
                  style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 13 : undefined }}
                  className="w-full text-center font-body text-xs hover:opacity-70 transition-colors cursor-pointer"
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
