import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { AI_CARDS_DATA } from '@/data/curriculum';
import { SpeakButton } from '@/components/ui/GameUI';
import { Lock, Star, ArrowLeft, HelpCircle } from 'lucide-react';
import { useThemeStyles } from '@/lib/useThemeStyles';
import { ActivityHelpModal } from '@/components/ui/ActivityHelpModal';

const RARITY_COLORS = {
  common: { border: 'border-gray-400', badge: 'bg-gray-500', label: 'COMMON' },
  rare: { border: 'border-blue-game', badge: 'bg-blue-game', label: 'RARE' },
  epic: { border: 'border-primary', badge: 'bg-primary', label: 'EPIC' },
  legendary: { border: 'border-yellow-400', badge: 'bg-yellow-500', label: 'LEGENDARY' },
};

export default function AICards() {
  const ts = useThemeStyles();
  const D = ts.duo;
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');

  const unlockedIds: number[] = JSON.parse(localStorage.getItem('unlocked_cards') || '[1, 2, 3]');
  const [flipped, setFlipped] = useState<number | null>(null);
  const [viewCard, setViewCard] = useState<typeof AI_CARDS_DATA[0] | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('play_completed_cards', 'true');
    localStorage.setItem('play_progress_cards', '100');
    if (category) {
      localStorage.setItem(`play_completed_cards_${category}`, 'true');
      localStorage.setItem(`play_progress_cards_${category}`, '100');
    }
  }, [category]);

  return (
    <div className="min-h-full bg-game pb-6">
      {/* Header */}
      <div className={D ? "bg-white p-5 border-b border-gray-200 shadow-sm" : "bg-surface-2 p-5"}>
        <button 
          onClick={() => navigate('/play')} 
          className={D ? "flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-3 font-body text-sm font-semibold" : "flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm"}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className={D ? "text-black font-game text-xl flex items-center gap-2 font-extrabold" : "text-white font-game text-xl flex items-center gap-2"}>
          🃏 AI Cards
          <button
            onClick={() => setHelpOpen(true)}
            className="p-1 hover:text-purple-400 transition-colors cursor-pointer text-gray-400"
            title="Show how to collect cards"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </button>
        </h1>
        <p className={D ? "text-gray-500 font-body text-sm mt-1 font-semibold" : "text-white/60 font-body text-sm mt-1"}>
          Collect all 7 AI hero cards!
        </p>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex gap-1">
            {AI_CARDS_DATA.map((c, i) => (
              <div 
                key={i} 
                className={D ? "w-3 h-3 bg-[#5FCC5F] rounded-full" : "w-4 h-4 border-2 border-black bg-warning"} 
              />
            ))}
          </div>
          <span className={D ? "text-[#5FCC5F] font-body text-xs font-bold" : "text-warning font-pixel text-[10px]"}>
            {AI_CARDS_DATA.length}/{AI_CARDS_DATA.length} COLLECTED
          </span>
          <button
            onClick={() => navigate('/play')}
            className="text-white/30 hover:text-white/60 font-pixel text-[6px] tracking-wider uppercase border border-white/10 px-2 py-0.5 ml-auto cursor-pointer transition-colors"
          >
            ⚡ Skip
          </button>
        </div>
      </div>

      {/* Card Grid */}
      <div className="px-4 pt-4 grid grid-cols-2 gap-4">
        {AI_CARDS_DATA.map((card) => {
          const isUnlocked = true;
          const rarity = RARITY_COLORS[card.rarity as keyof typeof RARITY_COLORS];
          const isFlipped = flipped === card.id;

          return (
            <motion.div
              key={card.id}
              whileHover={isUnlocked ? { scale: 1.03 } : {}}
              whileTap={isUnlocked ? { scale: 0.97 } : {}}
              onClick={() => isUnlocked && setViewCard(card)}
              className={D ? "relative overflow-hidden cursor-pointer transition-all flex flex-col justify-between rounded-xl border" : `relative border-4 border-black shadow-pixel cursor-pointer ${isUnlocked ? rarity.border : 'border-gray-600'}`}
              style={D ? {
                aspectRatio: '2/3',
                background: '#FFFFFF',
                borderColor: isUnlocked ? (card.rarity === 'legendary' ? '#FFB84D' : card.rarity === 'epic' ? '#B366FF' : card.rarity === 'rare' ? '#60A5FA' : '#E0E0E0') : '#E0E0E0',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              } : {
                aspectRatio: '2/3',
              }}
            >
              {/* Card Background */}
              {!D && <div className={`absolute inset-0 ${isUnlocked ? card.color : 'bg-gray-800'} opacity-80`} />}

              {/* Pixel grid overlay */}
              {!D && <div className="absolute inset-0 bg-pixel-grid opacity-20" />}

              {/* Rarity badge */}
              {isUnlocked && (
                <div 
                  className={D 
                    ? `absolute top-2 right-2 border px-2 py-0.5 font-body text-[9px] font-bold rounded-full ${
                        card.rarity === 'legendary' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                        card.rarity === 'epic' ? 'bg-purple-50 text-purple-600 border-purple-200' :
                        card.rarity === 'rare' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                        'bg-gray-50 text-gray-600 border-gray-200'
                      }`
                    : `absolute top-2 right-2 ${rarity.badge} border-2 border-black px-1.5 py-0.5 font-pixel text-[7px] text-white z-10`
                  }
                >
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
                    <div className={D ? "text-black font-game text-sm text-center leading-tight font-extrabold" : "text-white font-game text-xs text-center leading-tight"}>
                      {card.title}
                    </div>
                    <div className={D ? "border-t border-gray-150 w-full" : "border-t border-white/30 w-full"} />
                    <div className={D ? "text-gray-500 font-body text-[10px] text-center leading-tight line-clamp-3 font-semibold" : "text-white/70 font-body text-[9px] text-center leading-tight line-clamp-3"}>
                      {card.problem_solved}
                    </div>
                  </>
                ) : (
                  <>
                    <Lock className="w-10 h-10 text-gray-400" />
                    <div className="text-gray-400 font-body text-[10px] text-center font-semibold">Complete more lessons to unlock!</div>
                  </>
                )}
              </div>

              {/* Shine effect for unlocked */}
              {isUnlocked && !D && (
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
              className={D ? "w-full max-w-md bg-white overflow-hidden" : "w-full max-w-md border-4 border-black bg-surface shadow-pixel-lg"}
              style={D ? {
                borderRadius: 20,
                boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
              } : {}}
            >
              {/* Card header */}
              <div 
                className={`${viewCard.color} p-6 flex flex-col items-center gap-3`}
                style={D ? {
                  borderBottom: '1px solid rgba(0,0,0,0.08)'
                } : {
                  borderBottom: '4px solid #000'
                }}
              >
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-7xl">
                  {viewCard.emoji}
                </motion.div>
                <div className="text-white font-game text-xl font-extrabold">{viewCard.title}</div>
                <div 
                  className={D 
                    ? `border px-3 py-1 font-body text-xs font-bold rounded-full ${
                        viewCard.rarity === 'legendary' ? 'bg-amber-100/90 text-amber-800 border-amber-200' :
                        viewCard.rarity === 'epic' ? 'bg-purple-100/90 text-purple-800 border-purple-200' :
                        viewCard.rarity === 'rare' ? 'bg-blue-100/90 text-blue-800 border-blue-200' :
                        'bg-gray-100/90 text-gray-800 border-gray-200'
                      }`
                    : `${RARITY_COLORS[viewCard.rarity as keyof typeof RARITY_COLORS].badge} border-2 border-black px-3 py-1 font-pixel text-[9px] text-white`
                  }
                >
                  {RARITY_COLORS[viewCard.rarity as keyof typeof RARITY_COLORS].label}
                </div>
              </div>

              {/* Card details */}
              <div className="p-5 space-y-4">
                <div>
                  <div className={D ? "text-gray-500 font-body text-xs mb-1 font-bold" : "text-white/50 font-body text-xs mb-1"}>🎯 Problem Solved:</div>
                  <div className={D ? "text-black font-body text-sm font-semibold" : "text-white font-body text-sm"}>{viewCard.problem_solved}</div>
                </div>
                <div>
                  <div className={D ? "text-gray-500 font-body text-xs mb-1 font-bold" : "text-white/50 font-body text-xs mb-1"}>⚡ AI Superpower:</div>
                  <div className={D ? "text-[#5FCC5F] font-game text-sm font-extrabold" : "text-primary font-game text-sm"}>{viewCard.ai_power}</div>
                </div>
                <div className={D ? "border border-amber-200 bg-amber-50/50 p-3.5 rounded-xl" : "border-2 border-warning bg-warning/10 p-3"}>
                  <div className={D ? "text-amber-700 font-body text-xs mb-1 font-extrabold" : "text-warning font-body text-xs mb-1"}>🌟 Fun Fact:</div>
                  <div className={D ? "text-amber-950 font-body text-sm italic font-semibold" : "text-white/80 font-body text-sm italic"}>{viewCard.fun_fact}</div>
                </div>

                <div className="flex gap-3">
                  <SpeakButton text={`${viewCard.title}. ${viewCard.fun_fact}`} />
                  <button 
                    onClick={() => setViewCard(null)} 
                    className={D ? "flex-1 border border-gray-300 bg-gray-50 hover:bg-gray-100 py-3 text-gray-700 font-game text-sm rounded-xl cursor-pointer transition-colors" : "flex-1 border-4 border-black bg-white/10 py-3 text-white font-game text-sm"}
                  >
                    Close ✕
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ActivityHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="AI Cards"
        type="play"
        description="Unlock and collect all 7 AI hero cards detailing key technologies like rovers, smart diagnostic grids, and translators."
        steps={[
          "Browse through the list of cards in your album.",
          "Check which cards are unlocked (indicated by bright colors) and locked (indicated by a lock pad).",
          "Click on any unlocked card to view its AI superpower details, the problem solved, and a fun fact.",
          "Unlock more cards by completing curriculum lessons and earning XP!"
        ]}
        rewards="🃏 7 collectible AI hero cards"
      />
    </div>
  );
}
