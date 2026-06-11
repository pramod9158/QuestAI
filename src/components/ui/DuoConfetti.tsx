import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

// ─────────────────────────────────────────────────────────────────────────────
// DuoConfetti — Duolingo-style celebration overlay
// Only renders when theme === 'duolingo' and celebrationActive === true
// Uses pure CSS + framer-motion for performance
// ─────────────────────────────────────────────────────────────────────────────

const CONFETTI_COLORS = [
  '#5FCC5F', '#B366FF', '#FFB84D', '#FF6B6B',
  '#4CAF50', '#1EBC6B', '#FFD700', '#FF69B4',
];

const CONFETTI_PIECES = 52;

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  rotation: number;
  shape: 'rect' | 'circle' | 'star';
}

function generatePieces(): Piece[] {
  return Array.from({ length: CONFETTI_PIECES }, (_, i) => ({
    id: i,
    x: randomBetween(2, 98),
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: randomBetween(6, 13),
    delay: randomBetween(0, 1.2),
    duration: randomBetween(2.0, 3.5),
    rotation: randomBetween(0, 720),
    shape: (['rect', 'circle', 'star'] as const)[Math.floor(Math.random() * 3)],
  }));
}

function ConfettiPiece({ piece }: { piece: Piece }) {
  const isCircle = piece.shape === 'circle';
  const isStar = piece.shape === 'star';
  return (
    <motion.div
      style={{
        position: 'absolute',
        left: `${piece.x}%`,
        top: -20,
        width: piece.size,
        height: isStar ? piece.size : piece.size * (isCircle ? 1 : 0.55),
        borderRadius: isCircle ? '50%' : isStar ? '50%' : 2,
        fontSize: isStar ? piece.size + 4 : undefined,
        display: isStar ? 'flex' : undefined,
        alignItems: isStar ? 'center' : undefined,
        justifyContent: isStar ? 'center' : undefined,
        color: isStar ? piece.color : undefined,
        background: isStar ? 'transparent' : piece.color,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
      initial={{ y: -30, opacity: 1, rotate: 0, scale: 0.8 }}
      animate={{
        y: typeof window !== 'undefined' ? window.innerHeight + 60 : 900,
        opacity: [1, 1, 0.6, 0],
        rotate: piece.rotation,
        scale: [0.8, 1.1, 0.9, 1],
        x: [0, randomBetween(-40, 40), randomBetween(-30, 30)],
      }}
      transition={{
        duration: piece.duration,
        delay: piece.delay,
        ease: 'easeIn',
      }}
    >
      {isStar ? '⭐' : null}
    </motion.div>
  );
}

// ── Main overlay ───────────────────────────────────────────────────────────────
export function DuoConfetti() {
  const { celebrationActive, isDuolingo } = useTheme();
  const piecesRef = useRef<Piece[]>(generatePieces());

  // Re-generate on each new celebration
  useEffect(() => {
    if (celebrationActive) {
      piecesRef.current = generatePieces();
    }
  }, [celebrationActive]);

  // Only relevant in Duolingo theme
  if (!isDuolingo) return null;

  return (
    <AnimatePresence>
      {celebrationActive && (
        <>
          {/* Confetti rain */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9998,
              pointerEvents: 'none',
              overflow: 'hidden',
            }}
          >
            {piecesRef.current.map(piece => (
              <ConfettiPiece key={piece.id} piece={piece} />
            ))}
          </div>

          {/* Central celebration banner */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 10000,
              pointerEvents: 'none',
              textAlign: 'center',
            }}
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: 2, duration: 0.45 }}
              style={{
                background: 'linear-gradient(135deg, #5FCC5F, #1EBC6B)',
                borderRadius: 20,
                padding: '18px 32px',
                boxShadow: '0 8px 32px rgba(95,204,95,0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{ fontSize: 40 }}>🎉</span>
              <span
                style={{
                  fontFamily: '"Nunito", sans-serif',
                  fontWeight: 900,
                  fontSize: 22,
                  color: '#000',
                  letterSpacing: '-0.5px',
                }}
              >
                Amazing! Keep it up! 🌟
              </span>
              <span style={{ fontFamily: '"Nunito", sans-serif', fontSize: 13, color: '#333', fontWeight: 600 }}>
                💪 You're on a roll!
              </span>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
