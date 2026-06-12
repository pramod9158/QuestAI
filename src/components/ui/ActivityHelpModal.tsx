import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Trophy, HelpCircle, BookOpen, Lightbulb, Play } from 'lucide-react';
import { useThemeStyles } from '@/lib/useThemeStyles';

interface ActivityHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: 'learn' | 'play' | 'prompt' | 'mission';
  description: string;
  steps?: string[];
  rewards?: string;
  examples?: string;
  goal?: string;
  deliverable?: string;
}

export function ActivityHelpModal({
  isOpen,
  onClose,
  title,
  type,
  description,
  steps,
  rewards,
  examples,
  goal,
  deliverable,
}: ActivityHelpModalProps) {
  const ts = useThemeStyles();
  const D = ts.duo;

  const getTypeHeader = () => {
    switch (type) {
      case 'learn':
        return { label: 'Learn Lesson', emoji: '🧠', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' };
      case 'play':
        return { label: 'Play Arena Activity', emoji: '🎮', color: '#10B981', bg: 'rgba(16,185,129,0.1)' };
      case 'prompt':
        return { label: 'Prompt Engineering Lab', emoji: '✨', color: '#EC4899', bg: 'rgba(236,72,153,0.1)' };
      case 'mission':
        return { label: 'Weekly Mission Challenge', emoji: '🎯', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
    }
  };

  const headerMeta = getTypeHeader();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full max-w-md relative overflow-hidden flex flex-col max-h-[85vh]"
            style={ts.modal}
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4 pb-3 border-b" style={{ borderColor: ts.divider }}>
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{headerMeta.emoji}</span>
                <div>
                  <div
                    className="font-pixel text-[5.5px] tracking-wider uppercase px-1.5 py-0.5 border inline-block mb-1"
                    style={{
                      borderColor: D ? '#E0E0E0' : 'rgba(255,255,255,0.15)',
                      background: headerMeta.bg,
                      color: headerMeta.color,
                      fontFamily: D ? '"Nunito", sans-serif' : undefined,
                      fontWeight: D ? 800 : undefined,
                      borderRadius: D ? 6 : 0,
                    }}
                  >
                    {headerMeta.label}
                  </div>
                  <h3
                    style={{
                      color: ts.textPrimary,
                      fontFamily: D ? '"Nunito", sans-serif' : undefined,
                      fontWeight: D ? 900 : undefined,
                      fontSize: D ? 16 : undefined,
                    }}
                    className={D ? '' : 'font-game text-xs text-white uppercase tracking-wider'}
                  >
                    {title}
                  </h3>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:opacity-75 transition-opacity cursor-pointer text-gray-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 font-body text-xs leading-relaxed" style={{ color: ts.textSecondary }}>
              
              {/* Description */}
              <div className="p-3 bg-black/10 rounded-lg border border-white/5" style={D ? { background: '#F8F9FA', borderColor: '#E9ECEF', borderRadius: 12 } : {}}>
                <p className="italic">"{description}"</p>
              </div>

              {/* Goal / Objective (If mission) */}
              {goal && (
                <div className="space-y-1">
                  <h4 className="font-game text-[9px] uppercase tracking-wider flex items-center gap-1.5 font-bold" style={{ color: ts.textPrimary }}>
                    <HelpCircle className="w-3.5 h-3.5" style={{ color: '#3B82F6' }} /> Objective Goal
                  </h4>
                  <p className="pl-5 text-gray-300" style={{ color: ts.textSecondary }}>{goal}</p>
                </div>
              )}

              {/* Steps to Perform */}
              {steps && steps.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-game text-[9px] uppercase tracking-wider flex items-center gap-1.5 font-bold" style={{ color: ts.textPrimary }}>
                    <BookOpen className="w-3.5 h-3.5" style={{ color: '#8B5CF6' }} /> How to Perform:
                  </h4>
                  <ul className="pl-5 space-y-1 list-disc">
                    {steps.map((step, idx) => (
                      <li key={idx} className="text-gray-300" style={{ color: ts.textSecondary }}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Examples / Hints */}
              {examples && (
                <div className="space-y-1">
                  <h4 className="font-game text-[9px] uppercase tracking-wider flex items-center gap-1.5 font-bold" style={{ color: ts.textPrimary }}>
                    <Lightbulb className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} /> Examples / Hints:
                  </h4>
                  <p className="pl-5 text-gray-300" style={{ color: ts.textSecondary }}>{examples}</p>
                </div>
              )}

              {/* Deliverable details */}
              {deliverable && (
                <div className="space-y-1">
                  <h4 className="font-game text-[9px] uppercase tracking-wider flex items-center gap-1.5 font-bold" style={{ color: ts.textPrimary }}>
                    <Play className="w-3.5 h-3.5" style={{ color: '#10B981' }} /> Deliverable Submission:
                  </h4>
                  <p className="pl-5 text-gray-300" style={{ color: ts.textSecondary }}>{deliverable}</p>
                </div>
              )}

              {/* Rewards */}
              {rewards && (
                <div className="p-3 border-2 border-dashed flex justify-between items-center rounded-lg mt-2"
                  style={{
                    borderColor: D ? '#E2E8F0' : 'rgba(255,255,255,0.06)',
                    background: D ? '#FFFDF5' : 'rgba(255,214,10,0.02)',
                  }}
                >
                  <span className="font-game text-[9px] uppercase tracking-wider flex items-center gap-1.5 font-bold" style={{ color: ts.textPrimary }}>
                    <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Activity Rewards
                  </span>
                  <span className="font-pixel text-[8px] text-yellow-400 font-bold" style={D ? { fontFamily: '"Nunito", sans-serif', fontSize: 12, color: '#FFB84D' } : {}}>
                    {rewards}
                  </span>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="mt-5 pt-3 border-t flex justify-end" style={{ borderColor: ts.divider }}>
              <button
                onClick={onClose}
                className="px-4 py-2 font-game text-[10px] uppercase border-2 border-black transition-transform cursor-pointer shadow-[2px_2px_0px_#000] flex items-center gap-1"
                style={D ? {
                  background: '#5FCC5F',
                  color: '#000',
                  border: 'none',
                  borderRadius: 10,
                  boxShadow: '0 3px 0px rgba(0,0,0,0.1)',
                  fontFamily: '"Nunito", sans-serif',
                  fontWeight: 800,
                } : {
                  background: '#FFD60A',
                  color: '#000',
                }}
              >
                Let's Go! ➔
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
