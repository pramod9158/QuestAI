import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Phase = 'mission' | 'training' | 'predicting' | 'complete';

interface NarratorMessage {
  phase: Phase;
  text: string;
  icon: string;
}

const MESSAGES: NarratorMessage[] = [
  { phase: 'mission', text: "Welcome, Robot Engineer! Choose a mission to begin teaching your AI brain.", icon: '🤖' },
  { phase: 'training', text: "Hold the button and show the camera each class clearly! The more examples you give, the smarter your AI gets.", icon: '🎓' },
  { phase: 'predicting', text: "Your AI is LIVE! Watch it predict in real time. Try moving or changing — see what it thinks!", icon: '🔮' },
  { phase: 'complete', text: "INCREDIBLE! You trained a real AI model today — just like machine learning engineers at Google and Apple!", icon: '🏆' },
];

interface Props {
  phase: Phase;
  totalSamples: number;
  classesReady: number;
  totalClasses: number;
  topConfidence?: number;
}

export default function TrainingNarrator({ phase, totalSamples, classesReady, totalClasses, topConfidence }: Props) {
  const message = MESSAGES.find(m => m.phase === phase) || MESSAGES[0];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={phase}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
        className="px-4 py-3 flex items-start gap-3"
        style={{
          background: 'rgba(124,58,237,0.15)',
          borderBottom: '3px solid #000',
          borderTop: '1px solid rgba(124,58,237,0.3)',
        }}
      >
        {/* Bot icon */}
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
          className="text-2xl flex-shrink-0 mt-0.5"
        >
          {message.icon}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-pixel text-[7px] text-[#7C3AED] uppercase tracking-wider">QuestBot AI</span>
            {phase === 'training' && (
              <span className="font-pixel text-[6px] px-1 border border-[#F59E0B] text-[#F59E0B]">
                {classesReady}/{totalClasses} classes ready
              </span>
            )}
            {phase === 'predicting' && topConfidence !== undefined && (
              <span
                className="font-pixel text-[6px] px-1 border"
                style={{
                  borderColor: topConfidence > 0.75 ? '#10B981' : '#F59E0B',
                  color: topConfidence > 0.75 ? '#10B981' : '#F59E0B',
                }}
              >
                {Math.round(topConfidence * 100)}% CONFIDENCE
              </span>
            )}
          </div>
          <p className="text-white/80 font-body text-xs leading-relaxed">{message.text}</p>

          {/* Progress stat for training */}
          {phase === 'training' && totalSamples > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 bg-black/40 border border-black/30">
                <motion.div
                  className="h-full bg-[#7C3AED]"
                  animate={{ width: `${Math.min(100, (classesReady / totalClasses) * 100)}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <span className="font-pixel text-[6px] text-white/40">{totalSamples} samples</span>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
