import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Mascot } from '@/components/ui/Mascot';

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

export interface CompanionState {
  visible: boolean;
  mood: 'guiding' | 'encouraging' | 'celebrating' | 'thinking' | 'curious' | 'proud' | 'excited';
  pose: 'idle' | 'wave' | 'walk' | 'run' | 'fly' | 'jump' | 'dance' | 'point-left' | 'point-right' | 'thinking';
  outfit: 'default' | 'scientist' | 'prompt-master' | 'mission-guide';
  message: string;
  currentModule: string;
  progressPercentage: number;
  currentXP: number;
  streakDays: number;
}

export interface DailyQuest {
  id: string;
  description: string;
  targetXP: number;
  currentXP: number;
  completed: boolean;
  rewardXP: number;
}

interface LearningCompanionContextType {
  companionState: CompanionState;
  speak: (
    message: string,
    options?: {
      mood?: CompanionState['mood'];
      pose?: CompanionState['pose'];
      outfit?: CompanionState['outfit'];
      duration?: number;
      priority?: 'low' | 'medium' | 'high';
    }
  ) => void;
  pointTo: (
    elementSelector: string,
    message: string,
    options?: {
      mood?: CompanionState['mood'];
      outfit?: CompanionState['outfit'];
      side?: 'left' | 'right';
      duration?: number;
    }
  ) => void;
  setOutfit: (outfit: CompanionState['outfit']) => void;
  setMood: (mood: CompanionState['mood']) => void;
  setPose: (pose: CompanionState['pose']) => void;
  hide: () => void;
  triggerTravel: (type: 'rocket' | 'portal', onComplete?: () => void) => void;
  showVideoLoadScreen: (facts?: string[], onComplete?: () => void) => void;
  hideVideoLoadScreen: () => void;
  mute: () => void;
  unmute: () => void;
  gainXP: (amount: number) => void;
  dismissTip: (tipId: string) => void;
  isMuted: boolean;
  dailyQuests: DailyQuest[];
  completeQuest: (id: string) => void;
}

const LearningCompanionContext = createContext<LearningCompanionContextType | null>(null);

export function useLearningCompanion() {
  const context = useContext(LearningCompanionContext);
  if (!context) {
    throw new Error('useLearningCompanion must be used within a LearningCompanionProvider');
  }
  return context;
}

// ============================================================================
// DATA LIBRARIES
// ============================================================================

const AI_FUN_FACTS = [
  "🤖 AI stands for Artificial Intelligence—it's like teaching computers how to think and learn!",
  "🎨 AI can learn to draw pictures by studying millions of real paintings and photos!",
  "💡 Just like you practice math or spelling, AI programs practice using data to get smarter!",
  "🧠 Deep Learning is inspired by how neurons in the human brain talk to each other!",
  "🎮 Many of the bots you play against in video games are powered by artificial intelligence!",
  "🔍 Language models predict the most likely next word, almost like predictive texting on steroids!",
  "🚀 The word 'robot' comes from a Czech play written in 1920, meaning 'forced labor'!",
  "🦁 AI can help scientists track wild animals in the forest by recognizing their unique spots or stripes!",
  "🎹 AI can compose its own music! It listens to songs to find patterns, then writes new melodies.",
  "🍕 An AI once invented a pizza recipe with blueberry and cheese—some recipes are better left to humans!",
];

const PROACTIVE_TIPS: Record<string, string[]> = {
  '/': [
    "Ready for today's adventure? Let's check out our daily quests!",
    "Click on the 'Learn' tab to continue your AI lesson journey!",
    "Earn more coins by completing modules and games today!",
  ],
  '/learn': [
    "Choose a lesson module to learn cool facts about neural networks!",
    "Double-tap lesson cards to skip videos if you're in developer mode! 😉",
    "Finish a lesson module to unlock high-score badges!",
  ],
  '/play': [
    "AI Labs are playgrounds! Try designing custom items or detective files.",
    "Unleash your curiosity in the AI Card game or the Quiz Arena!",
  ],
  '/prompts': [
    "Try using standard prompts like: 'Write a story about a brave space cat.'",
    "Use details like adjectives and locations to make your prompts super strong!",
  ],
  '/missions': [
    "Missions are weekly challenges! Unlock epic badges by finishing them.",
    "Completing missions gives huge bonus XP! Let's check them out.",
  ],
};

// ============================================================================
// PROVIDER
// ============================================================================

export function LearningCompanionProvider({ children }: { children: React.ReactNode }) {
  const profile = useCurrentProfile();
  const { isDuolingo } = useTheme();
  const location = useLocation();

  // State mapping Sparky state
  const [visible, setVisible] = useState(false);
  const [mood, setMoodState] = useState<CompanionState['mood']>('guiding');
  const [pose, setPoseState] = useState<CompanionState['pose']>('idle');
  const [outfit, setOutfitState] = useState<CompanionState['outfit']>('default');
  const [message, setMessage] = useState('');
  const [targetSelector, setTargetSelector] = useState<string | null>(null);
  const [pointingSide, setPointingSide] = useState<'left' | 'right'>('left');

  // Travel Transitions
  const [travelType, setTravelType] = useState<'rocket' | 'portal' | null>(null);
  const [travelingTo, setTravelingTo] = useState('');
  const onTravelDoneRef = useRef<(() => void) | null>(null);

  // Video Load Screens
  const [videoLoading, setVideoLoading] = useState(false);
  const [loadFacts, setLoadFacts] = useState<string[]>([]);
  const onLoadDoneRef = useRef<(() => void) | null>(null);

  // Muting & Anti-Spam
  const [isMuted, setIsMuted] = useState(false);
  const [proactiveMessageCount, setProactiveMessageCount] = useState<Record<string, number>>({});
  const lastProactiveTime = useRef<number>(0);
  const currentPathRef = useRef(location.pathname);

  // Daily Quests State
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>(() => {
    const saved = localStorage.getItem('daily_quests_v2');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'xp_50', description: 'Earn 50 XP today', targetXP: 50, currentXP: 0, completed: false, rewardXP: 15 },
      { id: 'lesson_1', description: 'Complete 1 video lesson', targetXP: 1, currentXP: 0, completed: false, rewardXP: 10 },
      { id: 'quiz_attempt', description: 'Solve 3 questions in Quiz Coach', targetXP: 3, currentXP: 0, completed: false, rewardXP: 15 },
    ];
  });

  // Track profile changes to sync states
  const currentXP = profile?.xp ?? 0;
  const streakDays = profile?.current_streak ?? 0;
  const currentModule = profile?.zone === 'junior' ? 'Junior Explorer' : 'Future Innovator';

  // Persist Daily Quests
  useEffect(() => {
    localStorage.setItem('daily_quests_v2', JSON.stringify(dailyQuests));
  }, [dailyQuests]);

  // Keep track of current path for anti-spam resets
  useEffect(() => {
    currentPathRef.current = location.pathname;
    setTargetSelector(null); // Clear pointing targets on page navigation
  }, [location.pathname]);

  // Sync profile XP to quest progress
  useEffect(() => {
    if (profile) {
      const todayXPEarned = Math.max(0, profile.xp - (Number(localStorage.getItem('start_of_day_xp')) || profile.xp));
      setDailyQuests(prev =>
        prev.map(q => {
          if (q.id === 'xp_50') {
            const current = Math.min(q.targetXP, todayXPEarned);
            const done = current >= q.targetXP;
            return { ...q, currentXP: current, completed: done };
          }
          return q;
        })
      );
    }
  }, [profile]);

  // Save start-of-day XP if not existing
  useEffect(() => {
    if (profile && !localStorage.getItem('start_of_day_xp')) {
      localStorage.setItem('start_of_day_xp', String(profile.xp));
    }
  }, [profile]);

  // Helper selectors
  const hide = useCallback(() => {
    setVisible(false);
    setTargetSelector(null);
  }, []);

  const speak = useCallback((
    msg: string,
    options?: {
      mood?: CompanionState['mood'];
      pose?: CompanionState['pose'];
      outfit?: CompanionState['outfit'];
      duration?: number;
      priority?: 'low' | 'medium' | 'high';
    }
  ) => {
    if (isMuted && options?.priority !== 'high') return;

    // Anti-spam rule: Cooldown period check for proactively triggered (low/medium priority) messages
    const now = Date.now();
    const isProactive = !options || options.priority !== 'high';
    if (isProactive && now - lastProactiveTime.current < 60000) { // 1 minute cooldown
      return;
    }

    // Anti-spam rule: limit messages per page session
    const currentPath = currentPathRef.current;
    const count = proactiveMessageCount[currentPath] || 0;
    if (isProactive && count >= 3) {
      return;
    }

    if (isProactive) {
      setProactiveMessageCount(prev => ({ ...prev, [currentPath]: (prev[currentPath] || 0) + 1 }));
      lastProactiveTime.current = now;
    }

    setMessage(msg);
    if (options?.mood) setMoodState(options.mood);
    if (options?.pose) setPoseState(options.pose);
    if (options?.outfit) setOutfitState(options.outfit);
    setVisible(true);

    if (options?.duration) {
      setTimeout(() => {
        setVisible(false);
        setTargetSelector(null);
      }, options.duration);
    }
  }, [isMuted, proactiveMessageCount]);

  const pointTo = useCallback((
    selector: string,
    msg: string,
    options?: {
      mood?: CompanionState['mood'];
      outfit?: CompanionState['outfit'];
      side?: 'left' | 'right';
      duration?: number;
    }
  ) => {
    setTargetSelector(selector);
    setPointingSide(options?.side || 'left');
    setPoseState(options?.side === 'right' ? 'point-right' : 'point-left');
    if (options?.mood) setMoodState(options.mood);
    if (options?.outfit) setOutfitState(options.outfit);
    setMessage(msg);
    setVisible(true);

    if (options?.duration) {
      setTimeout(() => {
        setVisible(false);
        setTargetSelector(null);
      }, options.duration);
    }
  }, []);

  const setOutfit = useCallback((o: CompanionState['outfit']) => setOutfitState(o), []);
  const setMood = useCallback((m: CompanionState['mood']) => setMoodState(m), []);
  const setPose = useCallback((p: CompanionState['pose']) => setPoseState(p), []);

  const triggerTravel = useCallback((type: 'rocket' | 'portal', onComplete?: () => void) => {
    setTravelType(type);
    setTravelingTo(location.pathname);
    onTravelDoneRef.current = onComplete || null;

    // Auto complete after 2.5s
    setTimeout(() => {
      setTravelType(null);
      if (onTravelDoneRef.current) {
        onTravelDoneRef.current();
        onTravelDoneRef.current = null;
      }
    }, 2500);
  }, [location.pathname]);

  const showVideoLoadScreen = useCallback((facts?: string[], onComplete?: () => void) => {
    setLoadFacts(facts || AI_FUN_FACTS);
    setVideoLoading(true);
    onLoadDoneRef.current = onComplete || null;
  }, []);

  const hideVideoLoadScreen = useCallback(() => {
    setVideoLoading(false);
    if (onLoadDoneRef.current) {
      onLoadDoneRef.current();
      onLoadDoneRef.current = null;
    }
  }, []);

  const mute = useCallback(() => setIsMuted(true), []);
  const unmute = useCallback(() => setIsMuted(false), []);

  const gainXP = useCallback((amount: number) => {
    // Interactive feedback engine triggers arpeggios
    // Daily Quest XP gains logic update
    const todayXPEarned = (Number(localStorage.getItem('today_xp_earned')) || 0) + amount;
    localStorage.setItem('today_xp_earned', String(todayXPEarned));

    setDailyQuests(prev =>
      prev.map(q => {
        if (q.id === 'xp_50') {
          const current = Math.min(q.targetXP, q.currentXP + amount);
          const done = current >= q.targetXP;
          if (done && !q.completed) {
            // Level / milestone animation triggered
            speak("🌟 Amazing! You've completed your daily XP quest! Claiming 15 XP bonus!", {
              mood: 'excited',
              pose: 'dance',
              priority: 'high',
            });
          }
          return { ...q, currentXP: current, completed: done };
        }
        return q;
      })
    );
  }, [speak]);

  const completeQuest = useCallback((id: string) => {
    setDailyQuests(prev =>
      prev.map(q => (q.id === id ? { ...q, completed: true, currentXP: q.targetXP } : q))
    );
  }, []);

  const dismissTip = useCallback((tipId: string) => {
    const dismissed = JSON.parse(localStorage.getItem('dismissed_tips_v2') || '[]');
    dismissed.push(tipId);
    localStorage.setItem('dismissed_tips_v2', JSON.stringify(dismissed));
    setVisible(false);
    setTargetSelector(null);
  }, []);

  // 1. Safety Interrupter: Mute on input areas & active quizzes
  useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable ||
        target.closest('.quiz-active') ||
        target.closest('.code-active')
      ) {
        setIsMuted(true);
      }
    };

    const handleBlur = () => {
      setIsMuted(false);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);
    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // 2. Inactivity Detector (25 seconds)
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        // Trigger idle advice
        if (isMuted || visible) return;

        const path = location.pathname;
        const tips = PROACTIVE_TIPS[path] || AI_FUN_FACTS;
        const randTip = tips[Math.floor(Math.random() * tips.length)];

        speak(randTip, {
          mood: 'curious',
          pose: 'thinking',
          priority: 'low',
        });
      }, 25000); // 25s inactivity
    };

    // Events to track user activity
    const activityEvents = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    activityEvents.forEach(evt => document.addEventListener(evt, resetIdleTimer));

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimer);
      activityEvents.forEach(evt => document.removeEventListener(evt, resetIdleTimer));
    };
  }, [location.pathname, isMuted, visible]);

  // Context State
  const companionState: CompanionState = {
    visible,
    mood,
    pose,
    outfit,
    message,
    currentModule,
    progressPercentage: 40, // standard placeholder or computed
    currentXP,
    streakDays,
  };

  return (
    <LearningCompanionContext.Provider
      value={{
        companionState,
        speak,
        pointTo,
        setOutfit,
        setMood,
        setPose,
        hide,
        triggerTravel,
        showVideoLoadScreen,
        hideVideoLoadScreen,
        mute,
        unmute,
        gainXP,
        dismissTip,
        isMuted,
        dailyQuests,
        completeQuest,
      }}
    >
      {children}

      {/* Global Interactive Overlays */}
      <AnimatePresence>
        {/* 1. Travel overlays */}
        {travelType === 'rocket' && (
          <RocketTravelOverlay active={!!travelType} />
        )}
        {travelType === 'portal' && (
          <PortalTravelOverlay active={!!travelType} />
        )}

        {/* 2. Interactive Video Load screen */}
        {videoLoading && (
          <VideoLoadingFactsScreen
            facts={loadFacts}
            onClose={hideVideoLoadScreen}
          />
        )}
      </AnimatePresence>

      {/* Floating Sparky companion */}
      <FloatingCompanion
        state={companionState}
        targetSelector={targetSelector}
        side={pointingSide}
        onDismiss={hide}
        isDuolingo={isDuolingo}
      />
    </LearningCompanionContext.Provider>
  );
}

// ============================================================================
// FLOATING COMPANION COMPONENT
// ============================================================================

interface FloatingCompanionProps {
  state: CompanionState;
  targetSelector: string | null;
  side: 'left' | 'right';
  onDismiss: () => void;
  isDuolingo: boolean;
}

function FloatingCompanion({ state, targetSelector, side, onDismiss, isDuolingo }: FloatingCompanionProps) {
  const [coords, setCoords] = useState<{ top: number; left: number; position: 'fixed' | 'absolute' }>({
    top: 0,
    left: 0,
    position: 'fixed',
  });

  const [rightOffset, setRightOffset] = useState('24px');

  // Keep track of window width to stay inside max-w-md viewport
  useEffect(() => {
    const updateOffset = () => {
      if (window.innerWidth > 448) {
        const right = (window.innerWidth - 448) / 2 + 16;
        setRightOffset(`${right}px`);
      } else {
        setRightOffset('16px');
      }
    };
    updateOffset();
    window.addEventListener('resize', updateOffset);
    return () => window.removeEventListener('resize', updateOffset);
  }, []);

  // Update position if pointing to a selector
  useEffect(() => {
    if (!state.visible) return;

    if (!targetSelector) {
      // Set to bottom-right fixed positions
      return;
    }

    const updatePosition = () => {
      const el = document.querySelector(targetSelector);
      if (!el) {
        // Fallback if target element disappears
        return;
      }

      const rect = el.getBoundingClientRect();
      const mascotSize = 85;
      
      let top = rect.top + window.scrollY + rect.height / 2 - mascotSize / 2;
      let left = 0;

      if (side === 'left') {
        // Sparky floats on the right, pointing left
        left = rect.right + 12;
      } else {
        // Sparky floats on the left, pointing right
        left = rect.left - mascotSize - 12;
      }

      // Safeguard boundaries
      if (left < 0) left = 8;
      if (left + mascotSize > window.innerWidth) left = window.innerWidth - mascotSize - 8;

      setCoords({
        top,
        left,
        position: 'absolute',
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    // Poll in case DOM changes height or positions asynchronously
    const timer = setInterval(updatePosition, 300);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
      clearInterval(timer);
    };
  }, [state.visible, targetSelector, side]);

  if (!state.visible) return null;

  const styleProps: React.CSSProperties = targetSelector
    ? {
        position: coords.position,
        top: coords.top,
        left: coords.left,
        zIndex: 150,
      }
    : {
        position: 'fixed',
        bottom: '80px',
        right: rightOffset,
        zIndex: 150,
      };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      style={styleProps}
      className="flex flex-col items-center gap-2 max-w-[200px] pointer-events-auto"
    >
      {/* Speech bubble */}
      <AnimatePresence mode="wait">
        {state.message && (
          <motion.div
            key={state.message}
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative p-3 shadow-lg max-w-[190px] border text-center select-none"
            style={
              isDuolingo
                ? {
                    background: '#FFFFFF',
                    border: '1.5px solid #E0E0E0',
                    borderRadius: '16px',
                    color: '#333333',
                    fontFamily: '"Nunito", sans-serif',
                    fontSize: '11px',
                    fontWeight: 700,
                  }
                : {
                    background: '#1A1144',
                    border: '3px solid #000000',
                    borderRadius: '0px',
                    boxShadow: '4px 4px 0px #000',
                    color: '#FFFFFF',
                    fontFamily: '"Fredoka One", cursive',
                    fontSize: '10px',
                  }
            }
          >
            {/* Bubble arrow indicator */}
            <div
              className="absolute w-3 h-3 rotate-45 border-r border-b"
              style={
                isDuolingo
                  ? {
                      bottom: '-7px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      background: '#FFFFFF',
                      borderColor: '#E0E0E0',
                    }
                  : {
                      bottom: '-8px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      background: '#1A1144',
                      borderColor: '#000000',
                      borderWidth: '0 3px 3px 0',
                    }
              }
            />

            <span className="block">{state.message}</span>
            <button
              onClick={onDismiss}
              className="absolute top-1 right-1.5 opacity-60 hover:opacity-100 font-bold text-[8px] cursor-pointer"
              style={{ fontFamily: 'monospace' }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sparky rendering */}
      <Mascot
        mood={state.mood}
        pose={state.pose}
        outfit={state.outfit}
        size={80}
      />
    </motion.div>
  );
}

// ============================================================================
// TRANSITIONS & OVERLAYS
// ============================================================================

function RocketTravelOverlay({ active }: { active: boolean }) {
  // Star particle list
  const stars = useRef(
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 2 + 1,
    }))
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#070320' }}
    >
      {/* Falling Stars */}
      <div className="absolute inset-0">
        {stars.current.map(s => (
          <motion.div
            key={s.id}
            animate={{ y: ['-10%', '110%'] }}
            transition={{ repeat: Infinity, duration: s.speed, ease: 'linear' }}
            className="absolute rounded-full bg-white opacity-80"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              boxShadow: '0 0 8px #FFF',
            }}
          />
        ))}
      </div>

      {/* Rocket and Sparky */}
      <div className="relative w-64 h-64 flex flex-col items-center justify-center">
        {/* Space Rocket */}
        <motion.div
          animate={{
            x: [-120, 120],
            y: [120, -120],
            rotate: [45, 45],
            scale: [0.7, 1.2, 0.7],
          }}
          transition={{ duration: 2.5, ease: 'easeInOut' }}
          className="absolute flex flex-col items-center"
        >
          {/* Sparky Mascot Riding */}
          <Mascot mood="excited" pose="fly" outfit="mission-guide" size={60} />
          
          {/* Retro Rocket ship */}
          <svg width="70" height="90" viewBox="0 0 70 90" fill="none">
            <path d="M35 5 L60 40 L60 75 L10 75 L10 40 Z" fill="#E2E8F0" stroke="#000" strokeWidth="3" />
            <path d="M10 75 L5 85 L20 85 L20 75 Z" fill="#EF4444" stroke="#000" strokeWidth="2" />
            <path d="M60 75 L65 85 L50 85 L50 75 Z" fill="#EF4444" stroke="#000" strokeWidth="2" />
            <circle cx="35" cy="45" r="8" fill="#3B82F6" stroke="#000" strokeWidth="2" />
            {/* Thruster Fire */}
            <motion.path
              d="M30 75 L35 90 L40 75 Z"
              fill="#F59E0B"
              animate={{ scaleY: [1, 1.5, 1], fill: ['#F59E0B', '#EF4444', '#F59E0B'] }}
              transition={{ repeat: Infinity, duration: 0.15 }}
            />
          </svg>
        </motion.div>
      </div>

      <h2 className="font-game text-sm text-yellow-300 tracking-widest mt-8 animate-pulse text-center px-4">
        HYPERSPACE JUMP ACTIVATED!
      </h2>
      <p className="font-pixel text-[6px] text-white opacity-70 mt-2">
        SPARKY IS NAVIGATING...
      </p>
    </motion.div>
  );
}

function PortalTravelOverlay({ active }: { active: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[300] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: '#0F0A2E' }}
    >
      {/* Portal Core Spiral */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
        className="w-72 h-72 rounded-full border-4 border-dashed flex items-center justify-center"
        style={{
          borderImage: 'linear-gradient(to right, #7C3AED, #3B82F6, #EC4899) 1',
          background: 'radial-gradient(circle, rgba(124,58,237,0.3) 0%, rgba(15,10,46,0) 70%)',
          boxShadow: '0 0 50px rgba(124,58,237,0.5)',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-48 h-48 rounded-full border-2 border-dashed border-blue-400"
        />
      </motion.div>

      {/* Sparky gets sucked in */}
      <motion.div
        animate={{
          rotate: [0, 720],
          scale: [1.3, 0],
          opacity: [1, 0],
          y: [0, 10],
        }}
        transition={{ duration: 2.2, ease: 'easeIn' }}
        className="absolute"
      >
        <Mascot mood="excited" pose="dance" size={100} />
      </motion.div>

      <h2 className="font-game text-xs text-blue-300 mt-8 animate-pulse text-center tracking-widest px-4">
        WARPING THROUGH QUANTUM PORTAL...
      </h2>
    </motion.div>
  );
}

// ============================================================================
// INTERACTIVE LOADING FACTS SCREEN
// ============================================================================

interface VideoLoadingFactsScreenProps {
  facts: string[];
  onClose: () => void;
}

interface StarItem {
  id: number;
  x: number;
  y: number;
}

function VideoLoadingFactsScreen({ facts, onClose }: VideoLoadingFactsScreenProps) {
  const [activeFactIdx, setActiveFactIdx] = useState(0);
  const [starsCollected, setStarsCollected] = useState(0);
  const [starTargets, setStarTargets] = useState<StarItem[]>([]);
  const [sparkyPos, setSparkyPos] = useState({ x: 100, y: 150 });
  const [sparkyPose, setSparkyPose] = useState<'idle' | 'walk' | 'run' | 'fly'>('fly');

  // Fact rotator effect (every 3 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFactIdx(prev => (prev + 1) % facts.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [facts]);

  // Click handler to drop a star target
  const handleScreenClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newStar: StarItem = {
      id: Date.now() + Math.random(),
      x,
      y,
    };

    setStarTargets(prev => [...prev, newStar]);
    setSparkyPose('run');
  };

  // Sparky AI movement behavior to collect stars
  useEffect(() => {
    if (starTargets.length === 0) {
      setSparkyPose('fly');
      return;
    }

    const nextStar = starTargets[0];
    const dx = nextStar.x - sparkyPos.x;
    const dy = nextStar.y - sparkyPos.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 20) {
      // Collected!
      setStarTargets(prev => prev.slice(1));
      setStarsCollected(c => c + 1);
      
      // Twinkle play sound
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high A pitch
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } catch (e) {}
    } else {
      // Step closer
      const step = 8; // Speed
      const angle = Math.atan2(dy, dx);
      const timer = setTimeout(() => {
        setSparkyPos({
          x: sparkyPos.x + Math.cos(angle) * step,
          y: sparkyPos.y + Math.sin(angle) * step,
        });
      }, 30);
      return () => clearTimeout(timer);
    }
  }, [starTargets, sparkyPos]);

  return (
    <div
      onClick={handleScreenClick}
      className="fixed inset-0 z-[250] flex flex-col justify-between p-6 select-none cursor-crosshair overflow-hidden"
      style={{
        background: 'radial-gradient(circle, #181145 0%, #0B0625 100%)',
      }}
    >
      {/* Star count and header */}
      <div className="flex justify-between items-center z-10">
        <div>
          <span className="font-game text-[9px] text-yellow-300 block">LOADING MODULE LESSON...</span>
          <span className="font-pixel text-[5px] text-white opacity-60">Tap screen to feed Sparky stars!</span>
        </div>
        <div className="font-game text-[9px] text-white bg-black/40 border border-white/20 px-3 py-1.5 rounded-full">
          ⭐ STARS COLLECTED: <span className="text-yellow-300 font-bold">{starsCollected}</span>
        </div>
      </div>

      {/* Floating Target Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {starTargets.map(star => (
          <motion.div
            key={star.id}
            initial={{ scale: 0 }}
            animate={{ scale: [1, 1.3, 1], rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1 }}
            className="absolute text-xl text-yellow-300 drop-shadow-[0_0_8px_#FCD34D]"
            style={{ left: star.x - 10, top: star.y - 10 }}
          >
            ★
          </motion.div>
        ))}
      </div>

      {/* Sparky Character */}
      <motion.div
        animate={{
          x: sparkyPos.x - 40,
          y: sparkyPos.y - 40,
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0.03 }}
        className="absolute pointer-events-none"
      >
        <Mascot mood="excited" pose={sparkyPose} outfit="scientist" size={80} />
      </motion.div>

      {/* Center Rotating Fact card */}
      <div className="flex flex-col items-center justify-center gap-6 z-10 my-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFactIdx}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -15 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm p-6 text-center"
            style={{
              background: 'rgba(26, 17, 68, 0.8)',
              border: '3px solid #000',
              boxShadow: '6px 6px 0 #000',
            }}
          >
            <div className="font-game text-[8px] text-purple-400 mb-2">SPARKY'S AI FUN FACT</div>
            <p className="font-bold text-sm text-white leading-relaxed">
              {facts[activeFactIdx]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <div className="flex flex-col items-center gap-4 z-10">
        <div className="w-full max-w-xs h-3 bg-black/60 border border-white/20 p-0.5 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 8, ease: 'easeOut' }}
            className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
          />
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="px-6 py-2.5 font-game text-[8px] cursor-pointer text-black bg-yellow-300 border-2 border-black shadow-[3px_3px_0_#000] active:translate-y-0.5 active:shadow-[1.5px_1.5px_0_#000]"
        >
          SKIP LOADING ➔
        </button>
      </div>
    </div>
  );
}
