import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useState, useEffect } from 'react';

interface XPToastProps {
  amount: number;
  reason?: string;
  onDone?: () => void;
}

export function XPToast({ amount, reason, onDone }: XPToastProps) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => { setVisible(false); onDone?.(); }, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 pointer-events-none"
        >
          <div className="bg-warning border-4 border-black px-6 py-3 rounded-2xl shadow-pixel-lg flex items-center gap-2">
            <Zap className="w-5 h-5 text-black" fill="black" />
            <span className="text-black font-pixel text-sm">+{amount} XP!</span>
          </div>
          {reason && (
            <div className="bg-black/80 px-4 py-1.5 text-white/80 font-body text-xs border-2 border-white/20 rounded-xl">
              {reason}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface CoinToastProps { amount: number; }
export function CoinToast({ amount }: CoinToastProps) {
  const [visible, setVisible] = useState(true);
  useEffect(() => { const t = setTimeout(() => setVisible(false), 2000); return () => clearTimeout(t); }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-32 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div className="bg-yellow-400 border-4 border-black px-5 py-2 rounded-2xl shadow-pixel-lg flex items-center gap-2">
            <span className="text-xl">🪙</span>
            <span className="text-black font-pixel text-xs">+{amount} Coins!</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// XP Bar component
interface XPBarProps { current: number; needed: number; level: number; }
export function XPBar({ current, needed, level }: XPBarProps) {
  const pct = Math.min((current / needed) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary border-2 border-black px-2.5 py-1 text-white font-pixel text-[9px] rounded-lg whitespace-nowrap">
        Lv.{level}
      </div>
      <div className="flex-1 xp-bar-track">
        <motion.div
          className="xp-bar-fill"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
      <span className="text-white/60 font-pixel text-[8px] whitespace-nowrap">{current}/{needed}</span>
    </div>
  );
}

// Coin Counter
interface CoinCounterProps { coins: number; }
export function CoinCounter({ coins }: CoinCounterProps) {
  return (
    <div className="flex items-center gap-1 bg-yellow-400/20 border-2 border-yellow-400 px-3 py-1 rounded-2xl shadow-[inset_0px_2px_4px_rgba(245,158,11,0.2)]">
      <span className="text-sm">🪙</span>
      <span className="text-yellow-400 font-pixel text-[10px]">{coins}</span>
    </div>
  );
}

// Streak Flame
interface StreakFlameProps { streak: number; }
export function StreakFlame({ streak }: StreakFlameProps) {
  return (
    <motion.div
      animate={streak > 0 ? { scale: [1, 1.1, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.5 }}
      className="flex items-center gap-1 bg-orange-500/20 border-2 border-orange-500 px-3 py-1 rounded-2xl shadow-[inset_0px_2px_4px_rgba(249,115,22,0.2)]"
    >
      <span className="text-sm">🔥</span>
      <span className="text-orange-400 font-pixel text-[10px]">{streak}d</span>
    </motion.div>
  );
}

// Badge Component
interface BadgeProps { emoji: string; name: string; unlocked?: boolean; size?: 'sm' | 'md' | 'lg'; }
export function Badge({ emoji, name, unlocked = true, size = 'md' }: BadgeProps) {
  const sizes = { sm: 'w-12 h-12 text-2xl', md: 'w-16 h-16 text-3xl', lg: 'w-20 h-20 text-4xl' };
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`flex flex-col items-center gap-1 ${unlocked ? '' : 'opacity-40 grayscale'}`}
    >
      <div className={`${sizes[size]} border-4 border-black flex items-center justify-center ${unlocked ? 'bg-primary/30' : 'bg-gray-700'} rounded-3xl shadow-pixel-lg`}>
        {unlocked ? <span>{emoji}</span> : <span>🔒</span>}
      </div>
      <span className="text-white/70 font-body text-[10px] text-center leading-tight max-w-[64px]">{name}</span>
    </motion.div>
  );
}

// Progress Ring
interface ProgressRingProps { progress: number; size?: number; color?: string; children?: React.ReactNode; }
export function ProgressRing({ progress, size = 80, color = '#7C3AED', children }: ProgressRingProps) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          stroke={color} strokeWidth="8" fill="none"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="square"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// Mystery Box
interface MysteryBoxProps { onOpen: () => void; isOpen: boolean; reward?: string; }
export function MysteryBox({ onOpen, isOpen, reward }: MysteryBoxProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={!isOpen ? { y: [0, -5, 0], rotate: [-3, 3, -3] } : { scale: [1, 1.5, 1], rotate: 360 }}
        transition={!isOpen ? { repeat: Infinity, duration: 2 } : { duration: 0.5 }}
        onClick={!isOpen ? onOpen : undefined}
        className={`w-24 h-24 border-4 border-black flex items-center justify-center text-5xl rounded-3xl shadow-pixel-lg cursor-pointer ${isOpen ? 'bg-yellow-400' : 'bg-primary hover:bg-primary-light'}`}
      >
        {isOpen ? reward || '🎁' : '❓'}
      </motion.div>
      {!isOpen && <p className="text-white/60 font-body text-xs text-center">Tap to open!</p>}
      {isOpen && <p className="text-warning font-game text-sm text-center">You got: {reward}!</p>}
    </div>
  );
}

// Pixel Avatar
const AVATAR_COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#EF4444'];
interface PixelAvatarProps { username?: string; size?: number; colorIndex?: number; }
export function PixelAvatar({ username = 'AI', size = 64, colorIndex = 0 }: PixelAvatarProps) {
  const color = AVATAR_COLORS[colorIndex % AVATAR_COLORS.length];
  const initial = username.charAt(0).toUpperCase();
  return (
    <div
      className="border-4 border-black flex items-center justify-center font-pixel text-white rounded-2xl shadow-pixel select-none"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.3 }}
    >
      {initial}
    </div>
  );
}

// Speak Button (TTS)
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
      whileTap={{ scale: 0.9 }}
      onClick={handleSpeak}
      className={`border-2 border-black px-3 py-1.5 flex items-center gap-1.5 rounded-2xl shadow-[0px_3px_0px_0px_#000000] active:translate-y-0.5 active:shadow-none transition-all duration-100 ${speaking ? 'bg-success text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
    >
      <span className="text-lg">{speaking ? '🔊' : '🔈'}</span>
      <span className="font-game text-xs leading-none">{speaking ? 'Stop' : 'Listen'}</span>
    </motion.button>
  );
}
