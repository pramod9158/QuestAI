/**
 * QuestAI — Treasure Chest Opening Modal
 *
 * Animated chest with bounce/shake before open, card flip reveal,
 * rarity glow effect, and XP/coin toast on claim.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { openChest, CHEST_TIER_META, type Chest } from '@/lib/treasureChest';
import { getRewardRarityColor, getRewardRarityGlow } from '@/lib/loginRewards';

interface TreasureChestModalProps {
  chest: Chest | null;
  onClaim: (chest: Chest) => void;
  onClose: () => void;
}

type Phase = 'closed' | 'shaking' | 'opening' | 'revealed';

export function TreasureChestModal({ chest, onClaim, onClose }: TreasureChestModalProps) {
  const [phase, setPhase] = useState<Phase>('closed');

  if (!chest) return null;

  const meta = CHEST_TIER_META[chest.tier];
  const rarityColor = getRewardRarityColor(chest.reward.rarity);
  const rarityGlow = getRewardRarityGlow(chest.reward.rarity);

  function handleChestTap() {
    if (phase !== 'closed') return;
    setPhase('shaking');
    setTimeout(() => setPhase('opening'), 800);
    setTimeout(() => setPhase('revealed'), 1400);
  }

  function handleClaim() {
    openChest(chest!.id);
    onClaim(chest!);
    onClose();
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="w-full max-w-sm"
          style={{
            background: '#1E1B4B',
            border: `4px solid ${meta.color}`,
            boxShadow: `6px 6px 0px #000, ${meta.glow}`,
          }}
        >
          {/* Header */}
          <div className="p-4 text-center border-b-4 border-black">
            <div
              className="inline-block px-3 py-0.5 mb-2 font-pixel text-[6px] border-2 border-black"
              style={{ background: meta.color, color: '#000' }}
            >
              {meta.name.toUpperCase()}
            </div>
            <p className="text-white/50 font-body text-xs">{chest.triggerLabel}</p>
          </div>

          {/* Chest + Content */}
          <div className="p-6 flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              {phase !== 'revealed' ? (
                <motion.button
                  key="chest"
                  onClick={handleChestTap}
                  animate={
                    phase === 'shaking'
                      ? { rotate: [-8, 8, -6, 6, -3, 3, 0], scale: [1, 1.1, 1.1, 1] }
                      : phase === 'opening'
                      ? { scale: [1, 1.5, 0], rotate: [0, 15, -15] }
                      : { y: [0, -8, 0] }
                  }
                  transition={
                    phase === 'closed'
                      ? { repeat: Infinity, duration: 2, ease: 'easeInOut' }
                      : { duration: 0.6 }
                  }
                  className="text-8xl cursor-pointer relative"
                  whileHover={phase === 'closed' ? { scale: 1.1 } : {}}
                  whileTap={phase === 'closed' ? { scale: 0.95 } : {}}
                  style={{ filter: `drop-shadow(0 0 20px ${meta.color}88)` }}
                >
                  📦
                  {phase === 'closed' && (
                    <motion.div
                      className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                      <span className="font-game text-xs text-white/60">Tap to Open!</span>
                    </motion.div>
                  )}
                </motion.button>
              ) : (
                <motion.div
                  key="reward"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.3, 1], opacity: 1 }}
                  transition={{ duration: 0.5, type: 'spring', stiffness: 400, damping: 20 }}
                  className="flex flex-col items-center gap-3"
                >
                  {/* Reward card with flip reveal */}
                  <div
                    className="w-36 h-36 flex flex-col items-center justify-center gap-2 relative"
                    style={{
                      background: `${rarityColor}18`,
                      border: `4px solid ${rarityColor}`,
                      boxShadow: `4px 4px 0px #000, ${rarityGlow}`,
                    }}
                  >
                    {/* Rarity shimmer */}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{ opacity: [0, 0.3, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      style={{
                        background: `linear-gradient(135deg, transparent 30%, ${rarityColor}55 50%, transparent 70%)`,
                      }}
                    />
                    <span className="text-5xl">{chest.reward.emoji}</span>
                    <span
                      className="font-pixel text-[6px] px-2 py-0.5"
                      style={{
                        background: rarityColor,
                        border: '2px solid #000',
                        color: chest.reward.rarity === 'legendary' ? '#000' : 'white',
                      }}
                    >
                      {chest.reward.rarity.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-center space-y-1">
                    <div
                      className="font-game text-lg"
                      style={{ color: rarityColor }}
                    >
                      {chest.reward.label}
                    </div>
                    {chest.reward.amount && (
                      <div className="flex items-center justify-center gap-2">
                        {chest.reward.type === 'coins' && (
                          <span className="font-pixel text-[8px] text-yellow-300">+{chest.reward.amount} 🪙</span>
                        )}
                        {chest.reward.type === 'xp_boost' && (
                          <span className="font-pixel text-[8px] text-purple-300">+{chest.reward.amount} XP ⚡</span>
                        )}
                      </div>
                    )}
                    {chest.reward.type === 'ai_card' && (
                      <span className="text-white/60 font-body text-xs">New AI Hero Card Unlocked!</span>
                    )}
                    {chest.reward.type === 'accessory' && (
                      <span className="text-white/60 font-body text-xs">New Pet Accessory Unlocked!</span>
                    )}
                    {chest.reward.type === 'title' && (
                      <span className="text-white/60 font-body text-xs">Special Title Earned!</span>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Particle burst on reveal */}
            {phase === 'revealed' && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-2"
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{
                      x: (Math.cos((i / 12) * 2 * Math.PI) * 100),
                      y: (Math.sin((i / 12) * 2 * Math.PI) * 100),
                      opacity: 0,
                      scale: 0,
                    }}
                    transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
                    style={{
                      background: rarityColor,
                      borderRadius: i % 2 === 0 ? '50%' : '0',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 space-y-3">
            {phase === 'revealed' ? (
              <button
                onClick={handleClaim}
                className="w-full py-3 font-game text-sm cursor-pointer transition-all"
                style={{
                  background: rarityColor,
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0px #000',
                  color: chest.reward.rarity === 'legendary' ? '#000' : 'white',
                }}
              >
                ✨ Claim Reward!
              </button>
            ) : (
              <button
                onClick={handleChestTap}
                className="w-full py-3 font-game text-sm cursor-pointer transition-all"
                style={{
                  background: meta.color,
                  border: '3px solid #000',
                  boxShadow: '4px 4px 0px #000',
                  color: '#000',
                }}
              >
                📦 Open Chest!
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full text-center text-white/30 font-body text-xs hover:text-white/60 transition-colors cursor-pointer"
            >
              Open later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
