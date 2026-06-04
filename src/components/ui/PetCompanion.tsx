/**
 * QuestAI — AI Pet Companion Widget
 *
 * A floating animated AI robot that lives on the Home screen.
 * Greets students daily, celebrates achievements, and evolves with XP.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPetState, selectPet, PETS, loadPetData,
  type PetType, type PetState,
} from '@/lib/petCompanion';

interface PetCompanionProps {
  xp: number;
  onClose?: () => void;
}

export function PetCompanion({ xp }: PetCompanionProps) {
  const [pet, setPet] = useState<PetState>(() => getPetState(xp));
  const [showDialog, setShowDialog] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);

  useEffect(() => {
    setPet(getPetState(xp));
  }, [xp]);

  // Celebrate if on a milestone XP
  useEffect(() => {
    if (xp > 0 && xp % 100 === 0) {
      setIsCelebrating(true);
      setTimeout(() => setIsCelebrating(false), 2000);
    }
  }, [xp]);

  function handlePetTap() {
    setShowDialog(true);
    setTimeout(() => setShowDialog(false), 3000);
  }

  function handleSelectPet(type: PetType) {
    selectPet(type);
    setPet(getPetState(xp));
    setShowSelector(false);
  }

  return (
    <>
      {/* Floating Pet Widget */}
      <div className="relative flex flex-col items-center gap-2 py-3 select-none">
        {/* Dialog Bubble */}
        <AnimatePresence>
          {showDialog && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="absolute -top-14 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap"
            >
              <div
                className="px-3 py-2 text-white font-body text-xs leading-tight relative"
                style={{
                  background: '#1E1B4B',
                  border: '2px solid #000000',
                  boxShadow: '3px 3px 0px #000000',
                  maxWidth: 220,
                  whiteSpace: 'normal',
                }}
              >
                <span className="block">{pet.greeting}</span>
                {/* Tail */}
                <div
                  className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
                  style={{ background: '#000000' }}
                />
                <div
                  className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45"
                  style={{ background: '#1E1B4B' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-end gap-4">
          {/* Pet Avatar */}
          <motion.button
            onClick={handlePetTap}
            animate={
              isCelebrating
                ? { rotate: [0, -15, 15, -10, 10, 0], scale: [1, 1.3, 1.3, 1.1, 1] }
                : { y: [0, -6, 0] }
            }
            transition={
              isCelebrating
                ? { duration: 0.8, ease: 'easeOut' }
                : { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }
            }
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            className="relative flex items-center justify-center cursor-pointer"
            style={{
              width: 64,
              height: 64,
              background: `linear-gradient(135deg, ${pet.color}33, ${pet.color}22)`,
              border: `3px solid ${pet.color}`,
              boxShadow: `4px 4px 0px #000, 0 0 18px ${pet.color}55`,
            }}
          >
            <span className="text-3xl">{pet.emoji}</span>
            {/* Stage badge */}
            <div
              className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center"
              style={{
                background: pet.color,
                border: '2px solid #000',
                boxShadow: '1px 1px 0px #000',
              }}
            >
              <span className="font-pixel text-[5px] text-white">{pet.stage}</span>
            </div>
          </motion.button>

          {/* Pet Info */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-game text-sm text-white">{pet.name}</span>
              <span
                className="font-pixel text-[5px] px-1.5 py-0.5"
                style={{
                  background: pet.color,
                  border: '1.5px solid #000',
                  boxShadow: '1px 1px 0px #000',
                  color: 'white',
                }}
              >
                {pet.stageLabel}
              </span>
            </div>

            {/* Evolution progress bar */}
            {pet.nextStageXP !== null && (
              <div className="flex items-center gap-1.5">
                <div
                  className="w-28 h-2.5 flex items-center p-[1px]"
                  style={{ background: '#0F0A2E', border: '2px solid #000' }}
                >
                  <motion.div
                    className="h-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pet.xpProgress}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ background: pet.color }}
                  />
                </div>
                <span className="font-pixel text-[5px] text-white/40">
                  {pet.xpProgress}%
                </span>
              </div>
            )}
            {pet.nextStageXP === null && (
              <span className="font-pixel text-[5px]" style={{ color: pet.color }}>
                ✨ MAX LEVEL!
              </span>
            )}

            {/* Change pet button */}
            <button
              onClick={() => setShowSelector(true)}
              className="font-pixel text-[5px] text-white/30 hover:text-white/60 transition-colors text-left mt-0.5 cursor-pointer"
            >
              Change Bot ›
            </button>
          </div>
        </div>
      </div>

      {/* Pet Selector Modal */}
      <AnimatePresence>
        {showSelector && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="w-full max-w-md p-5 space-y-4"
              style={{ background: '#1E1B4B', border: '3px solid #000', boxShadow: '0 -4px 0px #000' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-game text-base text-white">Choose Your AI Bot</h3>
                <button
                  onClick={() => setShowSelector(false)}
                  className="text-white/40 hover:text-white transition-colors font-body text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {(Object.entries(PETS) as [PetType, typeof PETS[PetType]][]).map(([type, def]) => {
                  const stage1 = def.stages[0];
                  const isSelected = loadPetData().type === type;
                  return (
                    <motion.button
                      key={type}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleSelectPet(type)}
                      className="p-3 flex flex-col items-center gap-2 cursor-pointer transition-all"
                      style={{
                        background: isSelected ? `${def.color}22` : '#16103A',
                        border: `3px solid ${isSelected ? def.color : '#000'}`,
                        boxShadow: isSelected ? `4px 4px 0px #000, 0 0 12px ${def.color}44` : '3px 3px 0px #000',
                      }}
                    >
                      <span className="text-4xl">{stage1.emoji}</span>
                      <span className="font-game text-xs text-white">{def.name}</span>
                      <span className="text-white/50 font-body text-[9px] text-center leading-tight">
                        {def.description}
                      </span>
                      {isSelected && (
                        <span
                          className="font-pixel text-[5px] px-1.5 py-0.5"
                          style={{ background: def.color, border: '1px solid #000', color: 'white' }}
                        >
                          SELECTED
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
