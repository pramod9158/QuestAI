import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useThemeStyles } from '@/lib/useThemeStyles';

// ─── XP Toast ─────────────────────────────────────────────────────────────────
interface XPToastProps {
  amount: number;
  reason?: string;
  onDone?: () => void;
}

export function XPToast({ amount, reason, onDone }: XPToastProps) {
  const ts = useThemeStyles();
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
            style={ts.duo ? {
              background: 'linear-gradient(135deg, #5FCC5F 0%, #1EBC6B 100%)',
              border: 'none',
              borderRadius: 16,
              boxShadow: '0 4px 16px rgba(95,204,95,0.35)',
            } : {
              background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
              border: '3px solid #000000',
              boxShadow: '4px 4px 0px 0px #000000',
            }}
          >
            <Zap className="w-5 h-5 text-gray-900" fill="#0F0A2E" />
            <span
              style={ts.duo ? {
                color: '#000000',
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 900,
                fontSize: 16,
              } : {}}
              className={ts.duo ? '' : 'text-gray-900 font-game text-base'}
            >
              +{amount} XP!
            </span>
          </div>
          {reason && (
            <div
              className={ts.duo ? '' : 'px-4 py-1.5 text-white/90 font-body text-xs'}
              style={ts.duo ? {
                background: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                borderRadius: 10,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                color: '#555555',
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 700,
                fontSize: 12,
                padding: '6px 14px',
              } : {
                background: '#1E1B4B',
                border: '2px solid #000000',
                boxShadow: '2px 2px 0px 0px #000000',
                padding: '6px 16px',
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
  const ts = useThemeStyles();
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
            style={ts.duo ? {
              background: 'linear-gradient(135deg, #FFFFFF, #FFF8E1)',
              border: '1.5px solid #FFB84D',
              borderRadius: 16,
              boxShadow: '0 4px 16px rgba(255,184,77,0.3)',
            } : {
              background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%)',
              border: '3px solid #000000',
              boxShadow: '4px 4px 0px 0px #000000',
            }}
          >
            <span className="text-xl">🪙</span>
            <span
              style={ts.duo ? {
                color: '#000000',
                fontFamily: '"Nunito", sans-serif',
                fontWeight: 900,
                fontSize: 14,
              } : {}}
              className={ts.duo ? '' : 'text-gray-900 font-game text-sm'}
            >
              +{amount} Coins!
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── XP Bar ──────────────────────────────────────────────────────────────────
interface XPBarProps { current: number; needed: number; level: number; }
export function XPBar({ current, needed, level }: XPBarProps) {
  const ts = useThemeStyles();
  const pct = Math.min((current / needed) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div
        className={ts.duo ? '' : 'px-2 py-0.5 font-pixel text-[7px] text-white whitespace-nowrap'}
        style={ts.duo ? ts.pill : {
          background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
          border: '2px solid #000000',
          boxShadow: '2px 2px 0px 0px #000000',
          padding: '2px 8px',
          color: 'white',
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
      <span
        style={ts.duo ? {
          fontFamily: '"Nunito", sans-serif',
          fontWeight: 700,
          fontSize: 10,
          color: '#999999',
        } : {}}
        className={ts.duo ? '' : 'text-white/50 font-pixel text-[6px] whitespace-nowrap'}
      >
        {current}/{needed}
      </span>
    </div>
  );
}

// ─── Coin Counter ─────────────────────────────────────────────────────────────
interface CoinCounterProps { coins: number; }
export function CoinCounter({ coins }: CoinCounterProps) {
  const ts = useThemeStyles();
  return (
    <div className="flex items-center gap-1 px-2 py-1" style={ts.coinPill}>
      <span className="text-sm">🪙</span>
      <span
        style={ts.duo
          ? { color: '#C8960C', fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12 }
          : { color: '#FCD34D' }
        }
        className={ts.duo ? '' : 'font-pixel text-[7px]'}
      >
        {coins}
      </span>
    </div>
  );
}

// ─── Streak Flame ─────────────────────────────────────────────────────────────
interface StreakFlameProps { streak: number; }
export function StreakFlame({ streak }: StreakFlameProps) {
  const ts = useThemeStyles();
  return (
    <motion.div
      animate={streak > 0 ? { scale: [1, 1.08, 1] } : {}}
      transition={{ repeat: Infinity, duration: 1.8 }}
      className="flex items-center gap-1 px-2 py-1"
      style={ts.streakPill}
    >
      <span className="text-sm">🔥</span>
      <span
        style={ts.duo
          ? { color: '#FF6B35', fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12 }
          : { color: '#F59E0B' }
        }
        className={ts.duo ? '' : 'font-pixel text-[7px]'}
      >
        {streak}d
      </span>
    </motion.div>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
interface BadgeProps { emoji: string; name: string; unlocked?: boolean; size?: 'sm' | 'md' | 'lg'; }
export function Badge({ emoji, name, unlocked = true, size = 'md' }: BadgeProps) {
  const ts = useThemeStyles();
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
        style={ts.duo ? {
          width: d, height: d,
          background: unlocked ? '#F0FFF0' : '#F5F5F5',
          border: unlocked ? '2px solid #5FCC5F' : '1.5px solid #E0E0E0',
          borderRadius: '50%',
          boxShadow: unlocked ? '0 2px 8px rgba(95,204,95,0.2)' : 'none',
        } : {
          width: d, height: d,
          background: unlocked ? 'linear-gradient(135deg, #2D1B69, #1E3A5F)' : '#16103A',
          border: '3px solid #000000',
          boxShadow: unlocked ? '3px 3px 0px 0px #000000' : 'none',
        }}
      >
        <span style={{ fontSize: fontSize[size] }}>{unlocked ? emoji : '🔒'}</span>
      </div>
      <span
        style={ts.duo ? {
          color: '#555555',
          fontFamily: '"Nunito", sans-serif',
          fontWeight: 700,
          fontSize: 10,
          textAlign: 'center',
          maxWidth: 72,
        } : {}}
        className={ts.duo ? '' : 'text-white/70 font-body text-[10px] text-center leading-tight max-w-[72px]'}
      >
        {name}
      </span>
    </motion.div>
  );
}

// ─── Progress Ring → theme-aware ──────────────────────────────────────────────
interface ProgressRingProps { progress: number; size?: number; color?: string; children?: React.ReactNode; }
export function ProgressRing({ progress, size = 80, color = '#7C3AED', children }: ProgressRingProps) {
  const ts = useThemeStyles();
  const pct = Math.min(progress, 100);
  const barWidth = size - 16;
  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={ts.progressRingBox(size)}
    >
      {children}
      {/* Bottom progress bar */}
      <div
        className="absolute bottom-1 left-1/2 -translate-x-1/2"
        style={ts.duo ? {
          width: barWidth,
          height: 5,
          background: '#E0E0E0',
          borderRadius: 999,
          overflow: 'hidden',
        } : {
          width: barWidth,
          height: 4,
          background: '#0F0A2E',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <motion.div
          style={ts.duo ? {
            height: '100%',
            background: 'linear-gradient(90deg, #5FCC5F, #1EBC6B)',
            borderRadius: 999,
          } : {
            height: '100%',
            background: `linear-gradient(90deg, #F59E0B, #FCD34D)`,
          }}
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
  const ts = useThemeStyles();
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={!isOpen
          ? { y: [0, -8, 0], rotate: [-3, 3, -3] }
          : { scale: [1, 1.4, 1], rotate: 360 }}
        transition={!isOpen ? { repeat: Infinity, duration: 2.2 } : { duration: 0.6 }}
        onClick={!isOpen ? onOpen : undefined}
        className="w-24 h-24 flex items-center justify-center text-5xl cursor-pointer"
        style={ts.duo ? {
          background: isOpen ? 'linear-gradient(135deg, #5FCC5F, #1EBC6B)' : '#FFFFFF',
          border: isOpen ? '2px solid #5FCC5F' : '2px solid #E0E0E0',
          borderRadius: '50%',
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        } : {
          background: isOpen
            ? 'linear-gradient(135deg, #F59E0B, #FCD34D)'
            : 'linear-gradient(135deg, #7C3AED, #3B82F6)',
          border: '4px solid #000000',
          boxShadow: '6px 6px 0px 0px #000000',
        }}
      >
        {isOpen ? reward || '🎁' : '❓'}
      </motion.div>
      {!isOpen && <p style={{ color: ts.textSecondary }} className="font-body text-xs text-center">Tap to open!</p>}
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
  const ts = useThemeStyles();
  const [from, to] = AVATAR_GRADIENTS[colorIndex % AVATAR_GRADIENTS.length];
  const initial = username.charAt(0).toUpperCase();
  return (
    <div
      className="flex items-center justify-center font-pixel font-bold text-white select-none"
      style={ts.avatar(from, to, size)}
    >
      {initial}
    </div>
  );
}

// ─── Speak Button ─────────────────────────────────────────────────────────────
interface SpeakButtonProps { text: string; }
export function SpeakButton({ text }: SpeakButtonProps) {
  const ts = useThemeStyles();
  const [speaking, setSpeaking] = useState(false);

  const getBestFemaleVoice = (): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();
    const priority = [
      'Google UK English Female',
      'Microsoft Zira',
      'Microsoft Hazel',
      'Samantha',
      'Karen',
      'Moira',
      'Tessa',
      'Victoria',
      'Fiona',
      'Google US English',
    ];
    for (const name of priority) {
      const v = voices.find(v => v.name === name);
      if (v) return v;
    }
    // Fallback: any voice with 'female' in name or English female by heuristic
    const femaleHint = voices.find(
      v => /female|woman|girl/i.test(v.name) && v.lang.startsWith('en')
    );
    if (femaleHint) return femaleHint;
    return voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  };

  const handleSpeak = () => {
    if (speaking) { window.speechSynthesis?.cancel(); setSpeaking(false); return; }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'en-US';
    utt.rate = 0.88;
    utt.pitch = 1.1;
    utt.volume = 1;
    utt.onend = () => setSpeaking(false);

    const doSpeak = () => {
      const voice = getBestFemaleVoice();
      if (voice) utt.voice = voice;
      window.speechSynthesis?.speak(utt);
      setSpeaking(true);
    };

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      doSpeak();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null;
        doSpeak();
      };
      setTimeout(() => { if (!window.speechSynthesis.speaking) doSpeak(); }, 500);
    }
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={handleSpeak}
      className="flex items-center gap-2 px-4 py-2 font-body text-sm transition-all"
      style={speaking ? {
        background: ts.duo ? 'linear-gradient(135deg, #5FCC5F, #1EBC6B)' : 'linear-gradient(135deg, #10B981, #3B82F6)',
        color: ts.duo ? '#000000' : 'white',
        border: ts.duo ? 'none' : '3px solid #000000',
        borderRadius: ts.duo ? 10 : 0,
        boxShadow: ts.duo ? '0 2px 8px rgba(95,204,95,0.3)' : '3px 3px 0px 0px #000000',
      } : {
        background: ts.duo ? '#FFFFFF' : '#1E1B4B',
        color: ts.duo ? '#555555' : 'rgba(255,255,255,0.7)',
        border: ts.duo ? '1.5px solid #E0E0E0' : '3px solid #000000',
        borderRadius: ts.duo ? 10 : 0,
        boxShadow: ts.duo ? '0 1px 3px rgba(0,0,0,0.06)' : '3px 3px 0px 0px #000000',
      }}
    >
      <span className="text-lg">{speaking ? '🔊' : '🔈'}</span>
      <span>{speaking ? 'Stop' : 'Listen'}</span>
    </motion.button>
  );
}


export function CardProgressBadge({ percent }: { percent: number }) {
  const ts = useThemeStyles();
  let statusText = "Not Started";
  let statusColor = ts.duo
    ? "bg-red-50 text-red-500 border-red-200"
    : "bg-red-950/60 text-red-400 border-red-500";
  let pulse = "";

  if (percent === 100) {
    statusText = "Completed";
    statusColor = ts.duo
      ? "bg-green-50 text-green-600 border-green-300"
      : "bg-emerald-950/60 text-emerald-300 border-emerald-500";
  } else if (percent > 0) {
    statusText = `In Progress (${percent}%)`;
    statusColor = ts.duo
      ? "bg-yellow-50 text-yellow-600 border-yellow-300"
      : "bg-amber-950/60 text-amber-300 border-amber-500";
    pulse = "animate-pulse";
  }

  return (
    <div
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 border text-[7px] font-pixel uppercase ${statusColor} ${pulse}`}
      style={{ borderRadius: ts.duo ? 999 : 0 }}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {statusText}
    </div>
  );
}

export function CardProgressBar({ percent }: { percent: number }) {
  const ts = useThemeStyles();
  const barColor = percent === 100 ? "#10B981" : percent > 0 ? (ts.duo ? "#5FCC5F" : "#FFD60A") : "#374151";
  return (
    <div
      style={ts.duo ? {
        width: '100%',
        height: 6,
        background: '#E0E0E0',
        borderRadius: 999,
        overflow: 'hidden',
      } : {
        width: '100%',
        height: 6,
        background: '#0F0A2E',
        border: '1px solid #000',
        padding: '0.5px',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div
        className="h-full transition-all duration-500"
        style={{ width: `${percent}%`, backgroundColor: barColor, borderRadius: ts.duo ? 999 : 0 }}
      />
    </div>
  );
}
