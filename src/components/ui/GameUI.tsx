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
            className="px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #FFD60A 0%, #FF9F1C 100%)',
              boxShadow: '0 0 30px rgba(255,214,10,0.6), 0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <Zap className="w-5 h-5 text-gray-900" fill="#0D0D1A" />
            <span className="text-gray-900 font-heading font-800 text-base">+{amount} XP!</span>
          </div>
          {reason && (
            <div
              className="px-4 py-1.5 rounded-xl text-white/90 font-body text-xs"
              style={{
                background: 'rgba(13,13,26,0.85)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,214,10,0.3)',
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
            className="px-5 py-3 rounded-2xl flex items-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #FFD60A 0%, #FF9F1C 100%)',
              boxShadow: '0 0 24px rgba(255,214,10,0.5), 0 8px 20px rgba(0,0,0,0.4)',
            }}
          >
            <span className="text-xl">🪙</span>
            <span className="text-gray-900 font-heading font-bold text-sm">+{amount} Coins!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── XP Bar ───────────────────────────────────────────────────────────────────
interface XPBarProps { current: number; needed: number; level: number; }
export function XPBar({ current, needed, level }: XPBarProps) {
  const pct = Math.min((current / needed) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div
        className="px-2 py-0.5 rounded-lg text-gray-900 font-heading font-bold text-xs whitespace-nowrap"
        style={{ background: 'linear-gradient(135deg, #FFD60A 0%, #FF9F1C 100%)', boxShadow: '0 2px 8px rgba(255,214,10,0.4)' }}
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
      <span className="text-white/50 font-body text-[10px] whitespace-nowrap">{current}/{needed}</span>
    </div>
  );
}

// ─── Coin Counter ─────────────────────────────────────────────────────────────
interface CoinCounterProps { coins: number; }
export function CoinCounter({ coins }: CoinCounterProps) {
  return (
    <div
      className="flex items-center gap-1 px-3 py-1 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,214,10,0.2) 0%, rgba(255,159,28,0.12) 100%)',
        border: '1px solid rgba(255,214,10,0.4)',
        boxShadow: '0 2px 8px rgba(255,214,10,0.2)',
      }}
    >
      <span className="text-sm">🪙</span>
      <span className="font-heading font-bold text-xs" style={{ color: '#FFD60A' }}>{coins}</span>
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
      className="flex items-center gap-1 px-3 py-1 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,137,6,0.2) 0%, rgba(242,95,76,0.12) 100%)',
        border: '1px solid rgba(255,137,6,0.45)',
        boxShadow: '0 2px 8px rgba(255,137,6,0.25)',
      }}
    >
      <span className="text-sm">🔥</span>
      <span className="font-heading font-bold text-xs" style={{ color: '#FF8906' }}>{streak}d</span>
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
          borderRadius: 16,
          background: unlocked
            ? 'linear-gradient(135deg, rgba(127,90,240,0.25) 0%, rgba(44,182,125,0.15) 100%)'
            : 'rgba(255,255,255,0.06)',
          border: unlocked ? '1px solid rgba(127,90,240,0.5)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: unlocked ? '0 4px 20px rgba(127,90,240,0.3), inset 0 1px 0 rgba(255,255,255,0.15)' : 'none',
          backdropFilter: 'blur(8px)',
        }}
      >
        <span style={{ fontSize: fontSize[size] }}>{unlocked ? emoji : '🔒'}</span>
      </div>
      <span className="text-white/70 font-body text-[10px] text-center leading-tight max-w-[72px]">{name}</span>
    </motion.div>
  );
}

// ─── Progress Ring ────────────────────────────────────────────────────────────
interface ProgressRingProps { progress: number; size?: number; color?: string; children?: React.ReactNode; }
export function ProgressRing({ progress, size = 80, color = '#7F5AF0', children }: ProgressRingProps) {
  const r = (size - 14) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(progress, 100) / 100) * circ;
  const gradId = `grad-ring-${Math.round(progress)}`;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFD60A" />
            <stop offset="100%" stopColor="#FF9F1C" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth="7" fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={`url(#${gradId})`}
          strokeWidth="7" fill="none"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,214,10,0.7))' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
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
        className="w-24 h-24 flex items-center justify-center text-5xl cursor-pointer rounded-2xl"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #FFD60A, #FF9F1C)'
            : 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
          boxShadow: isOpen
            ? '0 0 32px rgba(255,214,10,0.7)'
            : '0 0 24px rgba(127,90,240,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
        }}
      >
        {isOpen ? reward || '🎁' : '❓'}
      </motion.div>
      {!isOpen && <p className="text-white/60 font-body text-xs text-center">Tap to open!</p>}
      {isOpen && <p className="font-heading font-bold text-sm text-center grad-text-xp">You got: {reward}!</p>}
    </div>
  );
}

// ─── Pixel Avatar ─────────────────────────────────────────────────────────────
const AVATAR_GRADIENTS = [
  ['#7F5AF0', '#2CB67D'],
  ['#00C2FF', '#5B5FFF'],
  ['#FF8906', '#F25F4C'],
  ['#FFD60A', '#FF9F1C'],
  ['#2CB67D', '#00C2FF'],
  ['#F25F4C', '#7F5AF0'],
];

interface PixelAvatarProps { username?: string; size?: number; colorIndex?: number; }
export function PixelAvatar({ username = 'AI', size = 64, colorIndex = 0 }: PixelAvatarProps) {
  const [from, to] = AVATAR_GRADIENTS[colorIndex % AVATAR_GRADIENTS.length];
  const initial = username.charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center justify-center font-heading font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
        boxShadow: `0 4px 20px rgba(127,90,240,0.4), 0 0 0 2px rgba(255,255,255,0.1)`,
        fontSize: size * 0.38,
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
      className="flex items-center gap-2 px-4 py-2 rounded-xl font-body text-sm transition-all"
      style={speaking ? {
        background: 'linear-gradient(135deg, #2CB67D, #00C2FF)',
        color: 'white',
        boxShadow: '0 4px 16px rgba(44,182,125,0.4)',
        border: '1px solid rgba(44,182,125,0.5)',
      } : {
        background: 'rgba(255,255,255,0.08)',
        color: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(255,255,255,0.15)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <span className="text-lg">{speaking ? '🔊' : '🔈'}</span>
      <span>{speaking ? 'Stop' : 'Listen'}</span>
    </motion.button>
  );
}
