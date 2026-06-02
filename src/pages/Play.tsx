import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PLAY_MODULES = [
  { path: '/play/around-me', emoji: '🌍', title: 'AI Around Me', desc: 'Swipe cards — Is this AI?', grad: ['#00C2FF', '#5B5FFF'] },
  { path: '/play/story', emoji: '⚔️', title: 'Story Adventures', desc: '8 epic quests to solve', grad: ['#7F5AF0', '#2CB67D'] },
  { path: '/play/detective', emoji: '🕵️', title: 'AI Detective', desc: 'Can AI help here?', grad: ['#2CB67D', '#00C2FF'] },
  { path: '/play/brainstorm', emoji: '💡', title: 'Brainstorm Lab', desc: '3-step AI invention wizard', grad: ['#FFD60A', '#FF9F1C'] },
  { path: '/play/idea-generator', emoji: '⚡', title: 'Idea Generator', desc: 'Type a problem → get 3 AI ideas', grad: ['#FF8906', '#F25F4C'] },
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Time Attack or Casual mode', grad: ['#F25F4C', '#7F5AF0'] },
  { path: '/play/cards', emoji: '🃏', title: 'AI Cards', desc: 'Collect all 7 hero cards!', grad: ['#FFD60A', '#2CB67D'] },
  { path: '/play/inventor-hall', emoji: '🏛️', title: 'Inventor Hall', desc: 'See the global AI showcase', grad: ['#5B5FFF', '#FF8906'] },
  { path: '/comic', emoji: '📚', title: 'Comic Creator', desc: 'Build your AI adventure comic!', grad: ['#7F5AF0', '#F25F4C'] },
];

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '127,90,240';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}

export default function Play() {
  const navigate = useNavigate();
  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="relative px-5 pt-6 pb-10 overflow-hidden">
        <div className="gradient-orb gradient-orb-primary" style={{ width: 180, height: 180, top: -50, right: -30, opacity: 0.4 }} />
        <h1 className="font-heading font-bold text-2xl text-white flex items-center gap-2 relative">
          🎮 Play Zone
        </h1>
        <p className="text-white/50 font-body text-sm mt-1 relative">9 interactive AI modules to explore</p>
      </div>

      {/* Module Grid */}
      <div className="px-5 -mt-6 grid grid-cols-2 gap-4">
        {PLAY_MODULES.map((mod, i) => {
          const [gradFrom, gradTo] = mod.grad;
          const rgbFrom = hexToRgb(gradFrom);
          return (
            <motion.div
              key={mod.path}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate(mod.path)}
              className="p-5 rounded-2xl cursor-pointer flex flex-col gap-3"
              style={{
                background: `linear-gradient(135deg, rgba(${rgbFrom},0.18) 0%, rgba(${hexToRgb(gradTo)},0.10) 100%)`,
                border: `1px solid rgba(${rgbFrom},0.35)`,
                boxShadow: `0 4px 24px rgba(${rgbFrom},0.18), inset 0 1px 0 rgba(255,255,255,0.08)`,
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{
                  background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                  boxShadow: `0 4px 14px rgba(${rgbFrom},0.5)`,
                }}
              >
                {mod.emoji}
              </div>
              <div>
                <div className="font-heading font-bold text-sm text-white leading-tight">{mod.title}</div>
                <div className="text-white/50 font-body text-[11px] mt-1">{mod.desc}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
