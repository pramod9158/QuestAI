import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStyles } from '@/lib/useThemeStyles';
import { Mascot } from '@/components/ui/Mascot';

// ============================================================================
// RANDOM MESSAGE LIBRARIES
// ============================================================================

const SUCCESS_MESSAGES = [
  "Fantastic!",
  "You are amazing!",
  "AI Champion!",
  "Outstanding Work!",
  "You did it!",
  "Excellent Thinking!",
  "Keep Going!",
  "You're becoming an AI Expert!",
  "Great Job!",
  "Level Cleared!"
];

const PARTIAL_MESSAGES = [
  "Good effort!",
  "You are getting closer!",
  "Try once more!",
  "Almost there!",
  "You're improving!"
];

const FAILURE_MESSAGES = [
  "Don't worry!",
  "Every expert was once a beginner!",
  "Let's try again!",
  "You can do this!",
  "Practice makes progress!",
  "One more try!",
  "I believe in you!"
];

function getRandomMessage(library: string[]): string {
  const idx = Math.floor(Math.random() * library.length);
  return library[idx];
}

// ============================================================================
// SOUND SYNTHESIS (WEB AUDIO API)
// ============================================================================

function playSynthesizedSound(type: 'success' | 'partial' | 'failure' | 'module' | 'mission' | 'chapter' | 'streak') {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = ctx.currentTime;

    if (type === 'success' || type === 'streak') {
      // Ascending C-Major scale (bright fanfare)
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.07);
        gain.gain.setValueAtTime(0, now + index * 0.07);
        gain.gain.linearRampToValueAtTime(0.25, now + index * 0.07 + 0.01);
        const decay = index === notes.length - 1 ? 0.8 : 0.15;
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + decay);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.07);
        osc.stop(now + index * 0.07 + decay + 0.05);
      });
    } else if (type === 'partial') {
      // Soft major-7th chord sweep (encouraging)
      const notes = [293.66, 369.99, 440.00, 554.37]; // D Maj 7 arpeggio
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);
        gain.gain.setValueAtTime(0, now + index * 0.08);
        gain.gain.linearRampToValueAtTime(0.2, now + index * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.08);
        osc.stop(now + index * 0.08 + 0.65);
      });
    } else if (type === 'failure') {
      // Supportive resolution arpeggio (minor to hopeful major note)
      const notes = [329.63, 293.66, 261.63, 392.00]; // descending minor-ish to hopeful resolution
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);
        gain.gain.setValueAtTime(0, now + index * 0.12);
        gain.gain.linearRampToValueAtTime(0.18, now + index * 0.12 + 0.02);
        const decay = index === notes.length - 1 ? 0.9 : 0.25;
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + decay);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + decay + 0.05);
      });
    } else if (type === 'module' || type === 'mission' || type === 'chapter') {
      // Big Epic Fanfare (Double oscillator arpeggio)
      const rootNotes = [261.63, 392.00, 523.25, 783.99, 1046.50];
      const harmonyNotes = [329.63, 493.88, 659.25, 987.77, 1318.51];
      rootNotes.forEach((freq, index) => {
        [freq, harmonyNotes[index]].forEach((f, oscIdx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = oscIdx === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(f, now + index * 0.09);
          gain.gain.setValueAtTime(0, now + index * 0.09);
          gain.gain.linearRampToValueAtTime(0.15, now + index * 0.09 + 0.02);
          const decay = index === rootNotes.length - 1 ? 1.4 : 0.22;
          gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.09 + decay);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + index * 0.09);
          osc.stop(now + index * 0.09 + decay + 0.05);
        });
      });
    }
  } catch (e) {
    console.error('Audio feedback synthesis failed:', e);
  }
}

// ============================================================================
// CONFLICT-FREE VISUAL ELEMENTS
// ============================================================================

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  speed: number;
  delay: number;
}

function generateExplosiveParticles(count = 20): Particle[] {
  const colors = ['#FFD60A', '#7C3AED', '#3B82F6', '#10B981', '#EF4444', '#EC4899'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 0,
    y: 0,
    color: colors[i % colors.length],
    size: Math.random() * 8 + 4,
    angle: Math.random() * 360,
    speed: Math.random() * 120 + 60,
    delay: Math.random() * 0.2,
  }));
}

// Confetti specs
interface ConfettiItem {
  id: number;
  x: number;
  y: number;
  color: string;
  shape: 'round' | 'square' | 'triangle';
  size: number;
  delay: number;
  duration: number;
  rotateEnd: number;
  xDrift: number;
}

function generateConfetti(count = 30): ConfettiItem[] {
  const colors = ['#FFD60A', '#7C3AED', '#3B82F6', '#10B981', '#EF4444', '#EC4899'];
  const shapes: ('round' | 'square' | 'triangle')[] = ['round', 'square', 'triangle'];
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: -(Math.random() * 20 + 10),
    color: colors[i % colors.length],
    shape: shapes[i % shapes.length],
    size: Math.random() * 8 + 6,
    delay: Math.random() * 0.5,
    duration: Math.random() * 1.5 + 1.5,
    rotateEnd: (Math.random() - 0.5) * 720,
    xDrift: (Math.random() - 0.5) * 40,
  }));
}

// ============================================================================
// CONTEXT TYPE
// ============================================================================

interface CelebrationOptions {
  title?: string;
  subtitle?: string;
  xpGained?: number;
  coinsGained?: number;
  gemsGained?: number;
  badge?: { emoji: string; name: string };
  streakDays?: number;
  onDone?: () => void;
}

interface FeedbackEngineContextType {
  showSuccessCelebration: (options?: CelebrationOptions) => void;
  showPartialSuccessCelebration: (options?: CelebrationOptions) => void;
  showFailureMotivation: (options?: CelebrationOptions) => void;
  showModuleCompletionCelebration: (options?: CelebrationOptions) => void;
  showMissionCompletionCelebration: (options?: CelebrationOptions) => void;
  showChapterCompletionCelebration: (options?: CelebrationOptions) => void;
  showDailyStreakCelebration: (options?: CelebrationOptions) => void;
}

const FeedbackEngineContext = createContext<FeedbackEngineContextType | null>(null);

export function useFeedbackEngine() {
  const context = useContext(FeedbackEngineContext);
  if (!context) {
    throw new Error('useFeedbackEngine must be used within a FeedbackEngineProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

export function FeedbackEngineProvider({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  const [type, setType] = useState<'success' | 'partial' | 'failure' | 'module' | 'mission' | 'chapter' | 'streak'>('success');
  const [stateOptions, setStateOptions] = useState<CelebrationOptions>({});

  const showSuccessCelebration = (options?: CelebrationOptions) => {
    setType('success');
    setStateOptions({
      title: options?.title || getRandomMessage(SUCCESS_MESSAGES),
      subtitle: options?.subtitle || "Challenge completed successfully!",
      ...options
    });
    setShow(true);
  };

  const showPartialSuccessCelebration = (options?: CelebrationOptions) => {
    setType('partial');
    setStateOptions({
      title: options?.title || getRandomMessage(PARTIAL_MESSAGES),
      subtitle: options?.subtitle || "You made great progress on this activity!",
      ...options
    });
    setShow(true);
  };

  const showFailureMotivation = (options?: CelebrationOptions) => {
    setType('failure');
    setStateOptions({
      title: options?.title || getRandomMessage(FAILURE_MESSAGES),
      subtitle: options?.subtitle || "Let's review the guidelines and try again!",
      ...options
    });
    setShow(true);
  };

  const showModuleCompletionCelebration = (options?: CelebrationOptions) => {
    setType('module');
    setStateOptions({
      title: options?.title || "MODULE COMPLETED",
      subtitle: options?.subtitle || "Incredible learning milestones reached!",
      xpGained: options?.xpGained ?? 100,
      coinsGained: options?.coinsGained ?? 25,
      ...options
    });
    setShow(true);
  };

  const showMissionCompletionCelebration = (options?: CelebrationOptions) => {
    setType('mission');
    setStateOptions({
      title: options?.title || "MISSION ACCOMPLISHED",
      subtitle: options?.subtitle || "Epic explorer challenge conquered!",
      xpGained: options?.xpGained ?? 150,
      badge: options?.badge || { emoji: '🏅', name: 'Field Specialist' },
      ...options
    });
    setShow(true);
  };

  const showChapterCompletionCelebration = (options?: CelebrationOptions) => {
    setType('chapter');
    setStateOptions({
      title: options?.title || "CHAPTER CONQUERED",
      subtitle: options?.subtitle || "Cinematic milestone reached! Unlocking new territory!",
      xpGained: options?.xpGained ?? 250,
      coinsGained: options?.coinsGained ?? 50,
      ...options
    });
    setShow(true);
  };

  const showDailyStreakCelebration = (options?: CelebrationOptions) => {
    setType('streak');
    setStateOptions({
      title: options?.title || "STREAK COMPLETED",
      subtitle: options?.subtitle || "Daily metrics maintained!",
      streakDays: options?.streakDays || parseInt(localStorage.getItem('user_streak') || '1', 10),
      ...options
    });
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    stateOptions.onDone?.();
  };

  return (
    <FeedbackEngineContext.Provider
      value={{
        showSuccessCelebration,
        showPartialSuccessCelebration,
        showFailureMotivation,
        showModuleCompletionCelebration,
        showMissionCompletionCelebration,
        showChapterCompletionCelebration,
        showDailyStreakCelebration,
      }}
    >
      {children}
      <FeedbackEngineOverlay
        show={show}
        type={type}
        options={stateOptions}
        onClose={handleClose}
      />
    </FeedbackEngineContext.Provider>
  );
}

// ============================================================================
// OVERLAY COMPONENT
// ============================================================================

interface FeedbackEngineOverlayProps {
  show: boolean;
  type: 'success' | 'partial' | 'failure' | 'module' | 'mission' | 'chapter' | 'streak';
  options: CelebrationOptions;
  onClose: () => void;
}

function FeedbackEngineOverlay({ show, type, options, onClose }: FeedbackEngineOverlayProps) {
  const ts = useThemeStyles();
  const D = ts.duo;
  
  const confettiList = useRef<ConfettiItem[]>([]);
  const explosionList = useRef<Particle[]>([]);
  
  // Triggers when showing celebration overlay
  useEffect(() => {
    if (show) {
      playSynthesizedSound(type);
      
      // Generate confetti if successes
      if (['success', 'module', 'mission', 'chapter', 'streak'].includes(type)) {
        confettiList.current = generateConfetti(40);
      } else {
        confettiList.current = [];
      }
      
      // Generate explosion particles for missions/chapters
      if (['mission', 'chapter'].includes(type)) {
        explosionList.current = generateExplosiveParticles(30);
      } else if (type === 'partial') {
        explosionList.current = generateExplosiveParticles(10); // small sparkles
      } else {
        explosionList.current = [];
      }
    }
  }, [show, type]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.85)' }}
        >
          {/* Confetti Animation */}
          {confettiList.current.length > 0 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {confettiList.current.map(c => (
                <motion.div
                  key={c.id}
                  initial={{
                    left: `${c.x}%`,
                    top: `${c.y}%`,
                    opacity: 1,
                    rotate: 0,
                    x: 0,
                  }}
                  animate={{
                    top: '110%',
                    opacity: [1, 1, 0],
                    rotate: c.rotateEnd,
                    x: c.xDrift,
                  }}
                  transition={{
                    duration: c.duration,
                    delay: c.delay,
                    ease: 'easeIn',
                  }}
                  className="absolute"
                  style={{
                    width: c.size,
                    height: c.size,
                    background: c.color,
                    borderRadius: c.shape === 'round' ? '50%' : '0',
                    clipPath: c.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
                  }}
                />
              ))}
            </div>
          )}

          {/* Explosion Particle Animations (Fireworks / Sparkles) */}
          {explosionList.current.length > 0 && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
              {explosionList.current.map(p => {
                const x = Math.cos((p.angle * Math.PI) / 180) * p.speed;
                const y = Math.sin((p.angle * Math.PI) / 180) * p.speed;
                return (
                  <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x, y, opacity: 0, scale: 0 }}
                    transition={{ duration: 1.2, delay: p.delay, ease: 'easeOut' }}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: p.color,
                      width: p.size,
                      height: p.size,
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Content Card Wrapper */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            className="w-full max-w-sm overflow-hidden"
            style={D ? {
              background: '#FFFFFF',
              border: `3px solid ${type === 'failure' ? '#EF4444' : type === 'partial' ? '#EC9A0A' : '#5FCC5F'}`,
              borderRadius: 28,
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            } : {
              background: '#130F32',
              border: `4px solid ${type === 'failure' ? '#EF4444' : type === 'partial' ? '#F59E0B' : '#FFD60A'}`,
              boxShadow: '6px 6px 0px #000',
            }}
          >
            {/* Visor Header/Banner for major completions */}
            {['module', 'mission', 'chapter'].includes(type) && (
              <div
                className="py-3.5 text-center font-game text-xs tracking-wider"
                style={{
                  background: type === 'mission' ? 'linear-gradient(90deg, #EC4899, #7C3AED)' : 'linear-gradient(90deg, #7C3AED, #3B82F6)',
                  color: '#FFFFFF',
                  borderBottom: D ? 'none' : '4px solid #000',
                }}
              >
                🏆 {type.toUpperCase()} COMPLETE
              </div>
            )}

            <div className="p-6 text-center space-y-5 flex flex-col items-center">
              {/* Central Mascot (Sparky) posing dynamically */}
              <Mascot type={type} size={100} />

              {/* Title & Description */}
              <div className="space-y-1">
                <h2
                  className={D ? 'font-bold' : 'font-game text-lg tracking-wide'}
                  style={{
                    color: D 
                      ? (type === 'failure' ? '#EF4444' : type === 'partial' ? '#D97706' : '#5FCC5F')
                      : (type === 'failure' ? '#EF4444' : type === 'partial' ? '#F59E0B' : '#FFD60A'),
                    fontFamily: D ? '"Nunito", sans-serif' : undefined,
                    fontSize: D ? 22 : undefined,
                    fontWeight: D ? 900 : undefined,
                  }}
                >
                  {options.title}
                </h2>
                <p
                  className={D ? 'font-semibold' : 'font-body text-xs'}
                  style={{
                    color: D ? '#777777' : 'rgba(255,255,255,0.7)',
                    fontFamily: D ? '"Nunito", sans-serif' : undefined,
                  }}
                >
                  {options.subtitle}
                </p>
              </div>

              {/* Reward Widget Row */}
              {((options.xpGained ?? 0) > 0 || (options.coinsGained ?? 0) > 0) && (
                <div className="flex justify-center gap-3 flex-wrap">
                  {(options.xpGained ?? 0) > 0 && (
                    <div
                      className={D ? 'font-bold' : 'font-game text-[10px]'}
                      style={D ? {
                        background: '#EEFBF2',
                        border: '1.5px solid #BBF7D0',
                        borderRadius: 12,
                        padding: '5px 12px',
                        color: '#1EBE6F',
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 900,
                        fontSize: 12,
                      } : {
                        background: 'linear-gradient(135deg, #10B981, #059669)',
                        border: '2px solid #000',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        boxShadow: '2px 2px 0px #000',
                      }}
                    >
                      ⚡ +{options.xpGained} XP
                    </div>
                  )}
                  {(options.coinsGained ?? 0) > 0 && (
                    <div
                      className={D ? 'font-bold' : 'font-game text-[10px]'}
                      style={D ? {
                        background: '#FFFBEB',
                        border: '1.5px solid #FDE68A',
                        borderRadius: 12,
                        padding: '5px 12px',
                        color: '#D97706',
                        fontFamily: '"Nunito", sans-serif',
                        fontWeight: 900,
                        fontSize: 12,
                      } : {
                        background: 'linear-gradient(135deg, #F59E0B, #D97706)',
                        border: '2px solid #000',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        boxShadow: '2px 2px 0px #000',
                      }}
                    >
                      🪙 +{options.coinsGained} Coins
                    </div>
                  )}
                </div>
              )}

              {/* Badge Unlock Notification */}
              {options.badge && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [0, 1.15, 1] }}
                  className="flex flex-col items-center gap-1.5 p-3 w-full border"
                  style={D ? {
                    background: '#F9F8FF',
                    borderColor: '#E8D5FF',
                    borderRadius: 16,
                  } : {
                    background: 'rgba(124, 58, 237, 0.1)',
                    borderColor: 'rgba(124, 58, 237, 0.3)',
                    borderWidth: 2,
                  }}
                >
                  <div className="text-4xl animate-bounce">{options.badge.emoji}</div>
                  <div>
                    <span className="block font-pixel text-[5px] text-purple-400">UNLOCKED BADGE:</span>
                    <span style={{ color: ts.textPrimary }} className={D ? 'font-bold' : 'font-bold'}>{options.badge.name}</span>
                  </div>
                </motion.div>
              )}

              {/* Daily Streak Flame Container */}
              {type === 'streak' && options.streakDays !== undefined && (
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    {/* Flame Animation */}
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 1.2 }}
                      className="text-6xl text-orange-500 drop-shadow-[0_0_12px_#F97316]"
                    >
                      🔥
                    </motion.div>
                  </div>
                  <div className="font-game text-xs text-orange-400">
                    {options.streakDays} DAY ACTIVE STREAK!
                  </div>
                </div>
              )}

              {/* Confirm / Continue Button */}
              <button
                onClick={onClose}
                className={D ? 'w-full py-3.5 cursor-pointer font-bold text-sm text-white' : 'w-full py-3.5 font-game text-xs cursor-pointer'}
                style={D ? {
                  background: type === 'failure' ? '#EF4444' : type === 'partial' ? '#EC9A0A' : '#5FCC5F',
                  borderRadius: 14,
                  boxShadow: '0 4px 0px rgba(0,0,0,0.15)',
                  fontFamily: '"Nunito", sans-serif',
                } : {
                  background: type === 'failure' ? '#EF4444' : type === 'partial' ? '#F59E0B' : '#FFD60A',
                  border: '3px solid #000',
                  boxShadow: '3px 3px 0px #000',
                  color: '#000',
                }}
              >
                {type === 'failure' ? 'One More Try! ➔' : 'Claim & Continue 🚀'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Mascot component is now imported from Mascot.tsx
