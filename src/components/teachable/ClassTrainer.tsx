import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ClassInfo {
  label: string;
  emoji: string;
  instruction: string;
}

interface Props {
  classInfo: ClassInfo;
  classIndex: number;
  sampleCount: number;
  isCapturing: boolean;
  isActive: boolean;
  color: string;
  onStartCapture: () => void;
  onStopCapture: () => void;
}

const MIN_SAMPLES = 10;
const GOOD_SAMPLES = 20;

export default function ClassTrainer({
  classInfo,
  classIndex,
  sampleCount,
  isCapturing,
  isActive,
  color,
  onStartCapture,
  onStopCapture,
}: Props) {
  const strength = Math.min(100, Math.round((sampleCount / GOOD_SAMPLES) * 100));
  const isReady = sampleCount >= MIN_SAMPLES;

  return (
    <div
      className="p-3 space-y-2"
      style={{
        background: isActive ? 'rgba(124, 58, 237, 0.15)' : '#16103A',
        border: `2px solid ${isCapturing ? color : isReady ? '#10B981' : '#000'}`,
        boxShadow: isCapturing ? `0 0 12px ${color}60` : '2px 2px 0px #000',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Class header */}
      <div className="flex items-center gap-2">
        <div
          className="w-8 h-8 flex items-center justify-center text-lg flex-shrink-0"
          style={{ background: color, border: '2px solid #000', boxShadow: '2px 2px 0px #000' }}
        >
          {classInfo.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-white font-game text-xs">{classInfo.label}</span>
            <span className="font-pixel text-[7px] text-white/50">{sampleCount} samples</span>
          </div>
          {/* Brain strength bar */}
          <div className="mt-1 h-2 bg-black/40 border border-black/50">
            <motion.div
              className="h-full"
              style={{ background: isReady ? '#10B981' : color }}
              animate={{ width: `${strength}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-0.5">
            <span className="font-pixel text-[6px] text-white/30">
              {isReady ? '✅ READY' : `Need ${MIN_SAMPLES - sampleCount} more`}
            </span>
            <span className="font-pixel text-[6px]" style={{ color: isReady ? '#10B981' : '#fff3' }}>
              {strength}%
            </span>
          </div>
        </div>
      </div>

      {/* Instruction */}
      <p className="text-white/50 font-body text-[10px] italic leading-snug">
        💡 {classInfo.instruction}
      </p>

      {/* Capture button */}
      <button
        onPointerDown={onStartCapture}
        onPointerUp={onStopCapture}
        onPointerLeave={onStopCapture}
        className="w-full py-2 font-game text-xs transition-all select-none"
        style={{
          background: isCapturing
            ? color
            : isReady
            ? 'rgba(16,185,129,0.2)'
            : '#1E1B4B',
          border: `2px solid ${isCapturing ? color : '#000'}`,
          boxShadow: isCapturing ? 'none' : '2px 2px 0px #000',
          color: isCapturing ? '#fff' : '#fff',
          transform: isCapturing ? 'translate(2px, 2px)' : 'none',
        }}
      >
        {isCapturing ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            RECORDING...
          </span>
        ) : (
          `📸 Hold to Train "${classInfo.label}"`
        )}
      </button>

      {/* Milestone badge */}
      <AnimatePresence>
        {sampleCount === MIN_SAMPLES && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center font-game text-[10px] py-1"
            style={{ background: '#10B98120', border: '1px solid #10B981', color: '#10B981' }}
          >
            🎉 Class "{classInfo.label}" is ready!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
