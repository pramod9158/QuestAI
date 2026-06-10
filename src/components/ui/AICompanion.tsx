import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type CompanionState = 'welcome' | 'teaching' | 'celebrating' | 'encouraging' | 'hinting' | 'idle' | 'thinking';

interface AICompanionProps {
  state?: CompanionState;
  message?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  onDismiss?: () => void;
  showBubble?: boolean;
  className?: string;
}

const STATE_CONFIG: Record<CompanionState, { emoji: string; bgGrad: string; glowColor: string; label: string }> = {
  welcome:      { emoji: '🤖', bgGrad: 'linear-gradient(135deg, #7C3AED, #3B82F6)', glowColor: 'rgba(124,58,237,0.4)', label: 'SPARKY' },
  teaching:     { emoji: '📖', bgGrad: 'linear-gradient(135deg, #3B82F6, #06B6D4)', glowColor: 'rgba(59,130,246,0.4)', label: 'TEACHING' },
  celebrating:  { emoji: '🎉', bgGrad: 'linear-gradient(135deg, #F59E0B, #EF4444)', glowColor: 'rgba(245,158,11,0.5)', label: 'AWESOME!' },
  encouraging:  { emoji: '💪', bgGrad: 'linear-gradient(135deg, #10B981, #3B82F6)', glowColor: 'rgba(16,185,129,0.4)', label: 'GO FOR IT!' },
  hinting:      { emoji: '💡', bgGrad: 'linear-gradient(135deg, #F59E0B, #FCD34D)', glowColor: 'rgba(245,158,11,0.4)', label: 'HINT' },
  idle:         { emoji: '🤖', bgGrad: 'linear-gradient(135deg, #4B5563, #6B7280)', glowColor: 'rgba(75,85,99,0.3)', label: 'SPARKY' },
  thinking:     { emoji: '🧠', bgGrad: 'linear-gradient(135deg, #8B5CF6, #EC4899)', glowColor: 'rgba(139,92,246,0.4)', label: 'THINKING...' },
};

const SIZE_MAP = {
  sm: { avatar: 'w-10 h-10', text: 'text-lg', bubble: 'text-[11px]', maxW: 'max-w-[200px]' },
  md: { avatar: 'w-14 h-14', text: 'text-2xl', bubble: 'text-xs', maxW: 'max-w-[280px]' },
  lg: { avatar: 'w-20 h-20', text: 'text-4xl', bubble: 'text-sm', maxW: 'max-w-[340px]' },
};

export function AICompanion({ state = 'idle', message, name, size = 'md', onDismiss, showBubble = true, className = '' }: AICompanionProps) {
  const config = STATE_CONFIG[state];
  const sizeConfig = SIZE_MAP[size];
  const [typedText, setTypedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Typing animation effect
  useEffect(() => {
    if (!message) { setTypedText(''); return; }
    setIsTyping(true);
    setTypedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < message.length) {
        setTypedText(message.slice(0, i + 1));
        i++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [message]);

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      {/* Avatar */}
      <motion.div
        animate={
          state === 'celebrating'
            ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }
            : state === 'thinking'
            ? { scale: [1, 1.05, 1] }
            : { scale: [1, 1.02, 1], y: [0, -2, 0] }
        }
        transition={{
          repeat: Infinity,
          duration: state === 'celebrating' ? 0.8 : 2.5,
          ease: 'easeInOut',
        }}
        className={`${sizeConfig.avatar} flex items-center justify-center flex-shrink-0 relative`}
        style={{
          background: config.bgGrad,
          border: '3px solid #000',
          boxShadow: `3px 3px 0px #000, 0 0 20px ${config.glowColor}`,
        }}
      >
        <span className={sizeConfig.text}>{config.emoji}</span>
        {/* Status indicator */}
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="absolute -bottom-0.5 -right-0.5 w-3 h-3"
          style={{
            background: state === 'celebrating' ? '#FFD60A' : '#10B981',
            border: '2px solid #000',
          }}
        />
      </motion.div>

      {/* Speech Bubble */}
      {showBubble && message && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`relative ${sizeConfig.maxW}`}
          >
            {/* Bubble arrow */}
            <div
              className="absolute left-[-6px] top-3 w-0 h-0"
              style={{
                borderTop: '6px solid transparent',
                borderBottom: '6px solid transparent',
                borderRight: '6px solid #1E1B4B',
              }}
            />
            <div
              className="p-3 relative"
              style={{
                background: '#1E1B4B',
                border: '2px solid #000',
                boxShadow: '3px 3px 0px #000',
              }}
            >
              {/* Header with name & state */}
              <div className="flex items-center justify-between mb-1">
                <span className="font-pixel text-[6px] tracking-wider" style={{ color: '#7C3AED' }}>
                  {name || 'SPARKY'} • {config.label}
                </span>
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="text-white/30 hover:text-white/60 transition-colors text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
              {/* Message with typing effect */}
              <p className={`${sizeConfig.bubble} font-body text-white/90 leading-relaxed`}>
                {typedText}
                {isTyping && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="inline-block ml-0.5 w-1.5 h-3 bg-purple-400 align-middle"
                  />
                )}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

// Compact inline companion for use in headers and small spaces
export function CompanionInline({ message, state = 'idle' }: { message: string; state?: CompanionState }) {
  const config = STATE_CONFIG[state];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 p-2.5"
      style={{
        background: '#1E1B4B',
        border: '2px solid #000',
        boxShadow: '3px 3px 0px #000',
      }}
    >
      <motion.div
        animate={{ rotate: [0, -5, 5, 0] }}
        transition={{ repeat: Infinity, duration: 3 }}
        className="w-8 h-8 flex items-center justify-center flex-shrink-0"
        style={{
          background: config.bgGrad,
          border: '2px solid #000',
          boxShadow: '2px 2px 0px #000',
        }}
      >
        <span className="text-base">{config.emoji}</span>
      </motion.div>
      <p className="text-[11px] font-body text-white/80 leading-snug">{message}</p>
    </motion.div>
  );
}

// Full-screen mission briefing companion (for curiosity hook)
interface MissionBriefingProps {
  missionTitle: string;
  missionEmoji: string;
  curiosityHook: string;
  storyContext: string;
  onAccept: () => void;
}

export function MissionBriefing({ missionTitle, missionEmoji, curiosityHook, storyContext, onAccept }: MissionBriefingProps) {
  const [showStory, setShowStory] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setShowStory(true), 1200);
    return () => clearTimeout(t);
  }, []);

  const handleAccept = () => {
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      onAccept();
      return;
    }
    const t = setTimeout(() => setCountdown(c => (c !== null ? c - 1 : null)), 800);
    return () => clearTimeout(t);
  }, [countdown, onAccept]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'radial-gradient(ellipse at center, #1E1B4B 0%, #0F0A2E 70%, #000 100%)' }}
    >
      {/* Animated stars background */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
          transition={{ repeat: Infinity, duration: 2 + Math.random() * 2, delay: Math.random() * 2 }}
        />
      ))}

      <div className="max-w-sm w-full relative z-10">
        {/* Countdown overlay */}
        <AnimatePresence>
          {countdown !== null && countdown > 0 && (
            <motion.div
              key={countdown}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 1] }}
              exit={{ scale: 2, opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="fixed inset-0 z-60 flex items-center justify-center"
            >
              <span className="font-pixel text-6xl text-[#FFD60A]" style={{ textShadow: '0 0 30px rgba(245,158,11,0.8)' }}>
                {countdown}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mission emoji */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ type: 'spring', delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-4 flex items-center justify-center text-4xl"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
            border: '4px solid #000',
            boxShadow: '4px 4px 0px #000, 0 0 30px rgba(124,58,237,0.5)',
          }}
        >
          {missionEmoji}
        </motion.div>

        {/* Mission alert label */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 'auto' }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mx-auto mb-3 overflow-hidden"
        >
          <div
            className="px-4 py-1 mx-auto w-fit font-pixel text-[7px] tracking-[3px] text-[#FFD60A] uppercase text-center"
            style={{ background: '#000', border: '2px solid #FFD60A', boxShadow: '0 0 10px rgba(245,158,11,0.3)' }}
          >
            ⚡ NEW MISSION INCOMING ⚡
          </div>
        </motion.div>

        {/* Mission title */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="font-game text-lg text-white text-center mb-2"
        >
          {missionTitle}
        </motion.h2>

        {/* Curiosity hook */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mb-6 p-3"
          style={{
            background: 'rgba(124,58,237,0.15)',
            border: '2px solid rgba(124,58,237,0.3)',
          }}
        >
          <p className="text-purple-300 font-body text-sm italic">"{curiosityHook}"</p>
        </motion.div>

        {/* Story context from companion */}
        <AnimatePresence>
          {showStory && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <AICompanion
                state="teaching"
                message={storyContext}
                size="sm"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Accept mission button */}
        {countdown === null && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAccept}
            className="w-full py-4 font-game text-sm tracking-wider uppercase text-black cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #FFD60A, #F59E0B)',
              border: '4px solid #000',
              boxShadow: '4px 4px 0px #000',
            }}
          >
            ⚡ ACCEPT MISSION ⚡
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
