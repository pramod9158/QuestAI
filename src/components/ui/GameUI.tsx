import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

// ─── XP Toast ─────────────────────────────────────────────────────────────────
interface XPToastProps {
  amount: number;
  reason?: string;
  onDone?: () => void;
}

export function XPToast({ amount, reason, onDone }: XPToastProps) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.(); }, 2400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.6 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -80, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 pointer-events-none"
        >
          <div
            className="px-6 py-3 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
              border: '3px solid #D97706',
              boxShadow: '4px 4px 0px 0px #92400E, 0 0 20px rgba(245,158,11,0.5)',
            }}
          >
            <Zap className="w-5 h-5 text-gray-900" fill="#0F0A2E" />
            <span className="text-gray-900 font-game text-base">+{amount} XP!</span>
          </div>
          {reason && (
            <div
              className="px-4 py-1.5 text-white/90 font-body text-xs"
              style={{
                background: '#1E1B4B',
                border: '2px solid #F59E0B',
                boxShadow: '2px 2px 0px rgba(0,0,0,0.5)',
              }}
            >
              {reason}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Coin Toast ───────────────────────────────────────────────────────────────
interface CoinToastProps { amount: number; }
export function CoinToast({ amount }: CoinToastProps) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const t = setTimeout(() => setVisible(false), 2200); return () => clearTimeout(t); }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.6 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="fixed top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div
            className="px-5 py-3 flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
              border: '3px solid #D97706',
              boxShadow: '4px 4px 0px 0px #92400E',
            }}
          >
            <span className="text-xl">🪙</span>
            <span className="text-gray-900 font-game text-sm">+{amount} Coins!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── XP Bar (Pixel Stepped) ──────────────────────────────────────────────────
interface XPBarProps { current: number; needed: number; level: number; }
export function XPBar({ current, needed, level }: XPBarProps) {
  const pct = Math.min((current / needed) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div
        className="px-2 py-0.5 font-pixel text-[7px] text-gray-900 whitespace-nowrap"
        style={{
          background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
          border: '2px solid #D97706',
          boxShadow: '2px 2px 0px 0px #92400E',
        }}
      >
        Lv.{level}
      </div>
      <div className="flex-1 xp-bar-track">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-white/50 font-pixel text-[6px] whitespace-nowrap">{current}/{needed}</span>
    </div>
  );
}

// ─── Coin Counter ─────────────────────────────────────────────────────────────
interface CoinCounterProps { coins: number; }
export function CoinCounter({ coins }: CoinCounterProps) {
  return (
    <div
      className="flex items-center gap-1 px-2 py-1"
      style={{
        background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(252,211,77,0.1))',
        border: '2px solid #F59E0B',
        boxShadow: '2px 2px 0px 0px #92400E',
      }}
    >
      <span className="text-sm">🪙</span>
      <span className="font-pixel text-[7px]" style={{ color: '#FCD34D' }}>{coins}</span>
    </div>
  );
}

// ─── Streak Flame ─────────────────────────────────────────────────────────────
interface StreakFlameProps { streak: number; }
export function StreakFlame({ streak }: StreakFlameProps) {
  return (
    <motion.div
      animate={streak > 0 ? { scale: [1, 1.08, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.8 }}
      className="flex items-center gap-1 px-2 py-1"
      style={{
        background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.15))',
        border: '2px solid #EF4444',
        boxShadow: '2px 2px 0px 0px #991B1B',
      }}
    >
      <span className="text-sm">🔥</span>
      <span className="font-pixel text-[7px]" style={{ color: '#F59E0B' }}>{streak}d</span>
    </motion.div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps { emoji: string; name: string; unlocked?: boolean; size?: 'sm' | 'md' | 'lg'; }
export function Badge({ emoji, name, unlocked = true, size = 'md' }: BadgeProps) {
  const dims = { sm: 48, md: 64, lg: 80 };
  const d = dims[size];
  const fontSize = { sm: 20, md: 28, lg: 36 };
  return (
    <motion.div
      whileHover={{ scale: 1.08 }}
      className={`flex flex-col items-center gap-1.5 ${unlocked ? '' : 'opacity-40 grayscale'}`}
    >
      <div
        className="flex items-center justify-center relative"
        style={{
          width: d, height: d,
          background: unlocked
            ? 'linear-gradient(135deg, #2D1B69, #1E3A5F)'
            : '#16103A',
          border: unlocked ? '3px solid #7C3AED' : '3px solid rgba(255,255,255,0.1)',
          boxShadow: unlocked ? '3px 3px 0px 0px #5B21B6, 0 0 12px rgba(124,58,237,0.3)' : 'none',
        }}
      >
        <span style={{ fontSize: fontSize[size] }}>{unlocked ? emoji : '🔒'}</span>
      </div>
      <span className="text-white/70 font-body text-[10px] text-center leading-tight max-w-[72px]">{name}</span>
    </motion.div>
  );
}

// ─── Progress Ring → Pixel Progress Box ───────────────────────────────────────
interface ProgressRingProps { progress: number; size?: number; color?: string; children?: React.ReactNode; }
export function ProgressRing({ progress, size = 80, color = '#7C3AED', children }: ProgressRingProps) {
  const pct = Math.min(progress, 100);
  const barWidth = size - 16;
  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{
        width: size, height: size,
        background: '#16103A',
        border: `3px solid ${color}`,
        boxShadow: `3px 3px 0px 0px rgba(0,0,0,0.6), 0 0 8px ${color}44`,
      }}
    >
      {children}
      {/* Bottom pixel progress bar */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2"
        style={{ width: barWidth, height: 4, background: '#0F0A2E', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        <motion.div
          style={{ height: '100%', background: `linear-gradient(90deg, #F59E0B, #FCD34D)` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Mystery Box ──────────────────────────────────────────────────────────────
interface MysteryBoxProps { onOpen: () => void; isOpen: boolean; reward?: string; }
export function MysteryBox({ onOpen, isOpen, reward }: MysteryBoxProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={!isOpen
          ? { y: [0, -8, 0], rotate: [-3, 3, -3] }
          : { scale: [1, 1.4, 1], rotate: 360 }}
        transition={!isOpen ? { repeat: Infinity, duration: 2.2 } : { duration: 0.6 }}
        onClick={!isOpen ? onOpen : undefined}
        className="w-24 h-24 flex items-center justify-center text-5xl cursor-pointer"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #F59E0B, #FCD34D)'
            : 'linear-gradient(135deg, #7C3AED, #3B82F6)',
          border: isOpen ? '4px solid #D97706' : '4px solid #5B21B6',
          boxShadow: isOpen
            ? '6px 6px 0px 0px #92400E, 0 0 20px rgba(245,158,11,0.5)'
            : '6px 6px 0px 0px rgba(0,0,0,0.8), 0 0 16px rgba(124,58,237,0.4)',
        }}
      >
        {isOpen ? reward || '🎁' : '❓'}
      </motion.div>
      {!isOpen && <p className="text-white/60 font-body text-xs text-center">Tap to open!</p>}
      {isOpen && <p className="font-game text-sm text-center grad-text-xp">You got: {reward}!</p>}
    </div>
  );
}

// ─── Pixel Avatar ─────────────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  ['#7C3AED', '#3B82F6'],
  ['#3B82F6', '#8B5CF6'],
  ['#EF4444', '#F59E0B'],
  ['#F59E0B', '#FCD34D'],
  ['#10B981', '#3B82F6'],
  ['#EC4899', '#7C3AED'],
];

interface PixelAvatarProps { username?: string; size?: number; colorIndex?: number; }
export function PixelAvatar({ username = 'AI', size = 64, colorIndex = 0 }: PixelAvatarProps) {
  const [from, to] = AVATAR_GRADIENTS[colorIndex % AVATAR_GRADIENTS.length];
  const initial = username.charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center justify-center font-pixel font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        border: '3px solid rgba(255,255,255,0.3)',
        boxShadow: `4px 4px 0px 0px rgba(0,0,0,0.8), 0 0 8px ${from}66`,
        fontSize: size * 0.3,
      }}
    >
      {initial}
    </div>
  );
}

// ─── Speak Button ─────────────────────────────────────────────────────────────
interface SpeakButtonProps { text: string; }
export function SpeakButton({ text }: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);
  const handleSpeak = () => {
    if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-IN'; utt.rate = 0.9; utt.pitch = 1.1;
    utt.onend = () => setSpeaking(false);
    window.speechSynthesis?.speak(utt);
    setSpeaking(true);
  };
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={handleSpeak}
      className="flex items-center gap-2 px-4 py-2 font-body text-sm transition-all"
      style={speaking ? {
        background: 'linear-gradient(135deg, #10B981, #3B82F6)',
        color: 'white',
        border: '3px solid #047857',
        boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.6)',
      } : {
        background: '#1E1B4B',
        color: 'rgba(255,255,255,0.7)',
        border: '3px solid rgba(124,58,237,0.4)',
        boxShadow: '3px 3px 0px 0px rgba(0,0,0,0.5)',
      }}
    >
      <span className="text-lg">{speaking ? '🔊' : '🔈'}</span>
      <span>{speaking ? 'Stop' : 'Listen'}</span>
    </motion.button>
  );
}
