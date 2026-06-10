import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { VideoCheckpoint as CheckpointData } from '@/data/curriculum';

interface VideoCheckpointProps {
  checkpoint: CheckpointData;
  onAnswer: (correct: boolean, xpEarned: number) => void;
  onDismiss: () => void;
}

export function VideoCheckpointOverlay({ checkpoint, onAnswer, onDismiss }: VideoCheckpointProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = useCallback((index: number) => {
    if (selectedIndex !== null) return; // already answered
    setSelectedIndex(index);
    
    // For vote type, any answer is "correct" (no wrong answers)
    const correct = checkpoint.type === 'vote' || index === checkpoint.correctIndex;
    setIsCorrect(correct);
    setShowResult(true);

    setTimeout(() => {
      onAnswer(correct, correct ? checkpoint.xpReward : 0);
    }, 2200);
  }, [selectedIndex, checkpoint, onAnswer]);

  const typeConfig = {
    predict: { label: '🔮 PREDICT', color: '#8B5CF6', bgColor: 'rgba(139,92,246,0.15)' },
    guess: { label: '🤔 GUESS', color: '#3B82F6', bgColor: 'rgba(59,130,246,0.15)' },
    vote: { label: '🗳️ VOTE', color: '#10B981', bgColor: 'rgba(16,185,129,0.15)' },
    'quick-quiz': { label: '⚡ QUICK QUIZ', color: '#F59E0B', bgColor: 'rgba(245,158,11,0.15)' },
  };

  const config = typeConfig[checkpoint.type];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-30 flex items-center justify-center p-3"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
    >
      <motion.div
        initial={{ scale: 0.8, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full max-w-sm"
      >
        {/* Type badge */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 'auto' }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-3 overflow-hidden"
        >
          <div
            className="px-3 py-1 w-fit font-pixel text-[7px] tracking-[2px] uppercase"
            style={{ background: config.bgColor, border: `2px solid ${config.color}`, color: config.color }}
          >
            {config.label}
          </div>
        </motion.div>

        {/* Question card */}
        <div
          className="p-4 mb-3"
          style={{
            background: '#1E1B4B',
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          {/* Companion avatar */}
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-8 h-8 flex items-center justify-center text-base flex-shrink-0"
              style={{ background: config.color, border: '2px solid #000', boxShadow: '2px 2px 0px #000' }}
            >
              🤖
            </div>
            <span className="font-pixel text-[6px] text-white/50 tracking-wider">SPARKY ASKS...</span>
          </div>

          {/* Question */}
          <p className="font-game text-sm text-white leading-relaxed mb-4">
            {checkpoint.question}
          </p>

          {/* Options */}
          <div className="space-y-2">
            {checkpoint.options?.map((option, i) => {
              const isSelected = selectedIndex === i;
              const isAnswer = checkpoint.correctIndex === i;
              let optionStyle: React.CSSProperties = {
                background: '#16103A',
                border: '2px solid #374151',
                boxShadow: '2px 2px 0px #000',
              };

              if (showResult) {
                if (checkpoint.type === 'vote') {
                  optionStyle = {
                    background: isSelected ? 'rgba(16,185,129,0.2)' : '#16103A',
                    border: isSelected ? '2px solid #10B981' : '2px solid #374151',
                    boxShadow: '2px 2px 0px #000',
                  };
                } else if (isAnswer) {
                  optionStyle = {
                    background: 'rgba(16,185,129,0.2)',
                    border: '2px solid #10B981',
                    boxShadow: '2px 2px 0px #000, 0 0 10px rgba(16,185,129,0.3)',
                  };
                } else if (isSelected && !isAnswer) {
                  optionStyle = {
                    background: 'rgba(239,68,68,0.2)',
                    border: '2px solid #EF4444',
                    boxShadow: '2px 2px 0px #000',
                  };
                }
              } else if (isSelected) {
                optionStyle = {
                  background: 'rgba(124,58,237,0.2)',
                  border: `2px solid ${config.color}`,
                  boxShadow: `2px 2px 0px #000, 0 0 10px ${config.bgColor}`,
                };
              }

              return (
                <motion.button
                  key={i}
                  whileHover={selectedIndex === null ? { x: 4 } : {}}
                  whileTap={selectedIndex === null ? { scale: 0.98 } : {}}
                  onClick={() => handleSelect(i)}
                  disabled={selectedIndex !== null}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 transition-all cursor-pointer disabled:cursor-default"
                  style={optionStyle}
                >
                  <span
                    className="w-6 h-6 flex items-center justify-center font-pixel text-[7px] flex-shrink-0"
                    style={{
                      background: showResult && isAnswer && checkpoint.type !== 'vote' ? '#10B981' : 'rgba(255,255,255,0.1)',
                      border: '1.5px solid #000',
                    }}
                  >
                    {showResult && isAnswer && checkpoint.type !== 'vote' ? '✓' : String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-body text-xs text-white/90">{option}</span>
                  {showResult && isSelected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto text-base"
                    >
                      {isCorrect || checkpoint.type === 'vote' ? '✅' : '❌'}
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 text-center"
              style={{
                background: isCorrect || checkpoint.type === 'vote'
                  ? 'rgba(16,185,129,0.15)'
                  : 'rgba(239,68,68,0.15)',
                border: `2px solid ${isCorrect || checkpoint.type === 'vote' ? '#10B981' : '#EF4444'}`,
              }}
            >
              <p className="font-game text-xs text-white">
                {checkpoint.type === 'vote'
                  ? '🗳️ Great vote! Every opinion counts!'
                  : isCorrect
                  ? `🎉 Correct! +${checkpoint.xpReward} XP!`
                  : '💪 Not quite! But great thinking! No XP lost.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* XP indicator */}
        {!showResult && (
          <div className="text-center mt-2">
            <span className="font-pixel text-[6px] text-[#F59E0B] tracking-wider">
              ⚡ +{checkpoint.xpReward} XP FOR ANSWERING
            </span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Progress indicator showing checkpoint positions on the video timeline
interface CheckpointTimelineProps {
  checkpoints: CheckpointData[];
  completedIndices: number[];
  videoDuration: number; // in seconds
  currentTime: number;
}

export function CheckpointTimeline({ checkpoints, completedIndices, videoDuration, currentTime }: CheckpointTimelineProps) {
  if (!checkpoints.length || !videoDuration) return null;

  return (
    <div className="relative w-full h-2 mt-1">
      {/* Checkpoint markers */}
      {checkpoints.map((cp, i) => {
        const position = (cp.timestampSeconds / videoDuration) * 100;
        const isCompleted = completedIndices.includes(i);
        const isUpcoming = !isCompleted && currentTime < cp.timestampSeconds;

        return (
          <motion.div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 z-10"
            style={{
              left: `${Math.min(position, 97)}%`,
              background: isCompleted ? '#10B981' : isUpcoming ? '#F59E0B' : '#EF4444',
              border: '1.5px solid #000',
              boxShadow: isUpcoming ? '0 0 6px rgba(245,158,11,0.5)' : 'none',
            }}
            animate={isUpcoming ? { scale: [1, 1.3, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            title={`Checkpoint: ${cp.question}`}
          />
        );
      })}
    </div>
  );
}
