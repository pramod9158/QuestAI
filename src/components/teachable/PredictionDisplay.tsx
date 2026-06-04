import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Prediction {
  label: string;
  emoji: string;
  confidence: number;
}

interface Props {
  predictions: Prediction[];
  topPrediction: Prediction | null;
  missionColor: string;
}

export default function PredictionDisplay({ predictions, topPrediction, missionColor }: Props) {
  if (predictions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-4xl"
        >
          🔄
        </motion.div>
        <p className="text-white/40 font-body text-xs text-center">Waiting for prediction...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-3">
      {/* Top prediction hero */}
      <AnimatePresence mode="wait">
        {topPrediction && (
          <motion.div
            key={topPrediction.label}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="text-center py-4"
            style={{
              background: 'rgba(124,58,237,0.1)',
              border: `3px solid ${missionColor}`,
              boxShadow: `0 0 20px ${missionColor}40`,
            }}
          >
            <motion.div
              className="text-5xl mb-2"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {topPrediction.emoji}
            </motion.div>
            <div className="font-game text-base text-white">{topPrediction.label}</div>
            <div className="font-pixel text-[8px] mt-1" style={{ color: missionColor }}>
              {Math.round(topPrediction.confidence * 100)}% CONFIDENT
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confidence bars for all classes */}
      <div className="space-y-2">
        <span className="font-pixel text-[7px] text-white/30 block uppercase tracking-wider">
          AI Brain Activity:
        </span>
        {predictions.map((pred) => (
          <div key={pred.label} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="font-body text-xs text-white/70 flex items-center gap-1">
                <span>{pred.emoji}</span> {pred.label}
              </span>
              <span className="font-pixel text-[7px] text-white/50">
                {Math.round(pred.confidence * 100)}%
              </span>
            </div>
            <div className="h-3 bg-black/40 border border-black/30 overflow-hidden">
              <motion.div
                className="h-full"
                style={{
                  background: pred === topPrediction
                    ? `linear-gradient(90deg, ${missionColor}, #fff4)`
                    : 'rgba(255,255,255,0.15)',
                }}
                animate={{ width: `${pred.confidence * 100}%` }}
                transition={{ duration: 0.15 }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Explanation card */}
      <div
        className="p-3 space-y-1"
        style={{ background: '#16103A', border: '2px solid rgba(255,255,255,0.08)' }}
      >
        <span className="font-pixel text-[7px] text-white/40 block">💡 WHY DID AI PICK THAT?</span>
        <p className="text-white/60 font-body text-[10px] leading-relaxed">
          The AI compared what it sees now against the photos you trained it with.
          The class with the{' '}
          <span className="text-white font-game text-[10px]">most similar patterns</span>{' '}
          wins! That's why more training samples = smarter AI.
        </p>
        {topPrediction && topPrediction.confidence < 0.6 && (
          <p className="font-body text-[10px]" style={{ color: '#F59E0B' }}>
            ⚠️ Confidence is low! Try training with more samples or better lighting.
          </p>
        )}
      </div>
    </div>
  );
}
