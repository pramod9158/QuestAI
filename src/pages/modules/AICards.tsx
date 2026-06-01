import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AI_CARDS_DATA } from '@/data/curriculum';
import { SpeakButton } from '@/components/ui/GameUI';
import { Lock, Star, ArrowLeft } from 'lucide-react';

const RARITY_COLORS = {
  common: { border: 'border-gray-400', badge: 'bg-gray-500', label: 'COMMON' },
  rare: { border: 'border-blue-game', badge: 'bg-blue-game', label: 'RARE' },
  epic: { border: 'border-primary', badge: 'bg-primary', label: 'EPIC' },
  legendary: { border: 'border-yellow-400', badge: 'bg-yellow-500', label: 'LEGENDARY' },
};

export default function AICards() {
  const navigate = useNavigate();
  const unlockedIds: number[] = JSON.parse(localStorage.getItem('unlocked_cards') || '[1, 2, 3]');
  const [flipped, setFlipped] = useState<number | null>(null);
  const [viewCard, setViewCard] = useState<typeof AI_CARDS_DATA[0] | null>(null);

  return (
    <div className="min-h-full bg-pixel-darker pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-yellow-600/30 to-pixel-darker p-5">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">🃏 AI Cards</h1>
        <p className="text-white/60 font-body text-sm mt-1">Collect all 7 AI hero cards!</p>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex gap-1">
            {AI_CARDS_DATA.map((c, i) => (
              <div key={i} className={`w-4 h-4 border-2 border-black ${unlockedIds.includes(c.id) ? 'bg-warning' : 'bg-white/20'}`} />
            ))}
          </div>
          <span className="text-warning font-pixel text-[10px]">{unlockedIds.length}/{AI_CARDS_DATA.length} COLLECTED</span>
        </div>
      </div>

      {/* Card Grid */}
      <div className="px-4 pt-4 grid grid-cols-2 gap-4">
        {AI_CARDS_DATA.map((card) => {
          const isUnlocked = unlockedIds.includes(card.id);
          const rarity = RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS];
          const isFlipped = flipped === card.id;

          return (
            <motion.div
              key={card.id}
              whileHover={isUnlocked ? { scale: 1.03 } : {}}
              whileTap={isUnlocked ? { scale: 0.97 } : {}}
              onClick={() => isUnlocked && setViewCard(card)}
              className={`relative border-4 border-black shadow-pixel cursor-pointer ${isUnlocked ? rarity.border : 'border-gray-600'}`}
              style={{ aspectRatio: '2/3' }}
            >
              {/* Card Background */}
              <div className={`absolute inset-0 ${isUnlocked ? card.color : 'bg-gray-800'} opacity-80`} />

              {/* Pixel grid overlay */}
              <div className="absolute inset-0 bg-pixel-grid opacity-20" />

              {/* Rarity badge */}
              {isUnlocked && (
                <div className={`absolute top-2 right-2 ${rarity.badge} border-2 border-black px-1.5 py-0.5 font-pixel text-[7px] text-white z-10`}>
                  {rarity.label}
                </div>
              )}

              {/* Card content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full p-3 gap-2">
                {isUnlocked ? (
                  <>
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{ repeat: Infinity, duration: 2, delay: card.id * 0.3 }}
                      className="text-5xl"
                    >
                      {card.emoji}
                    </motion.div>
                    <div className="text-white font-game text-xs text-center leading-tight">{card.title}</div>
                    <div className="border-t border-white/30 w-full" />
                    <div className="text-white/70 font-body text-[9px] text-center leading-tight line-clamp-3">{card.problem_solved}</div>
                  </>
                ) : (
                  <>
                    <Lock className="w-10 h-10 text-gray-500" />
                    <div className="text-gray-500 font-body text-[10px] text-center">Complete more lessons to unlock!</div>
                  </>
                )}
              </div>

              {/* Shine effect for unlocked */}
              {isUnlocked && (
                <motion.div
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ repeat: Infinity, duration: 3, delay: card.id * 0.5 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Card Detail Modal */}
      <AnimatePresence>
        {viewCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-4"
            onClick={() => setViewCard(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md border-4 border-black bg-pixel-dark shadow-pixel-lg"
            >
              {/* Card header */}
              <div className={`${viewCard.color} border-b-4 border-black p-6 flex flex-col items-center gap-3`}>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-7xl">
                  {viewCard.emoji}
                </motion.div>
                <div className="text-white font-game text-xl">{viewCard.title}</div>
                <div className={`${RARITY_COLORS[viewCard.rarity as keyof typeof RARITY_COLORS].badge} border-2 border-black px-3 py-1 font-pixel text-[9px] text-white`}>
                  {RARITY_COLORS[viewCard.rarity as keyof typeof RARITY_COLORS].label}
                </div>
              </div>

              {/* Card details */}
              <div className="p-5 space-y-4">
                <div>
                  <div className="text-white/50 font-body text-xs mb-1">🎯 Problem Solved:</div>
                  <div className="text-white font-body text-sm">{viewCard.problem_solved}</div>
                </div>
                <div>
                  <div className="text-white/50 font-body text-xs mb-1">⚡ AI Superpower:</div>
                  <div className="text-primary font-game text-sm">{viewCard.ai_power}</div>
                </div>
                <div className="border-2 border-warning bg-warning/10 p-3">
                  <div className="text-warning font-body text-xs mb-1">🌟 Fun Fact:</div>
                  <div className="text-white/80 font-body text-sm italic">{viewCard.fun_fact}</div>
                </div>

                <div className="flex gap-3">
                  <SpeakButton text={`${viewCard.title}. ${viewCard.fun_fact}`} />
                  <button onClick={() => setViewCard(null)} className="flex-1 border-4 border-black bg-white/10 py-3 text-white font-game text-sm">
                    Close ✕
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
