import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PLAY_MODULES = [
  { path: '/play/around-me', emoji: '🌍', title: 'AI Around Me', desc: 'Swipe cards — Is this AI?', color: 'from-blue-game/20 to-pixel-darker', glow: 'pixel-glow-blue', bgSolid: '#1D2A54' },
  { path: '/play/story', emoji: '⚔️', title: 'Story Adventures', desc: '8 epic quests to solve', color: 'from-primary/20 to-pixel-darker', glow: 'pixel-glow-purple', bgSolid: '#2D1D54' },
  { path: '/play/detective', emoji: '🕵️', title: 'AI Detective', desc: 'Can AI help here?', color: 'from-success/20 to-pixel-darker', glow: 'pixel-glow-success', bgSolid: '#1B3D34' },
  { path: '/play/brainstorm', emoji: '💡', title: 'Brainstorm Lab', desc: '3-step AI invention wizard', color: 'from-warning/20 to-pixel-darker', glow: 'pixel-glow-warning', bgSolid: '#3D2D1B' },
  { path: '/play/idea-generator', emoji: '⚡', title: 'Idea Generator', desc: 'Type a problem → get 3 AI ideas', color: 'from-pixel-pink/20 to-pixel-darker', glow: 'pixel-glow-pink', bgSolid: '#3D1B34' },
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Time Attack or Casual mode', color: 'from-pixel-red/20 to-pixel-darker', glow: 'pixel-glow-red', bgSolid: '#3D1B1B' },
  { path: '/play/cards', emoji: '🃏', title: 'AI Cards', desc: 'Collect all 7 hero cards!', color: 'from-warning/20 to-pixel-darker', glow: 'pixel-glow-orange', bgSolid: '#3D241B' },
  { path: '/play/inventor-hall', emoji: '🏛️', title: 'Inventor Hall', desc: 'See the global AI showcase', color: 'from-primary/10 to-pixel-darker', glow: 'pixel-glow-teal', bgSolid: '#1B3D3B' },
  { path: '/comic', emoji: '📚', title: 'Comic Creator', desc: 'Build your AI adventure comic!', color: 'from-primary/20 to-pixel-darker', glow: 'pixel-glow-violet', bgSolid: '#2D1D54' },
];

export default function Play() {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-pixel-darker pb-6">
      <div className="bg-gradient-to-b from-[#241740] to-pixel-darker p-5">
        <h1 className="text-white font-game text-xl flex items-center gap-2">🎮 Play Zone</h1>
        <p className="text-white/60 font-body text-sm mt-1">9 interactive AI modules to explore</p>
      </div>
      <div className="px-4 pt-4 grid grid-cols-2 gap-4">
        {PLAY_MODULES.map((mod, i) => (
          <motion.div
            key={mod.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(mod.path)}
            className={`border-4 border-black p-5 cursor-pointer transition-all flex flex-col gap-2 pixel-card-promax ${mod.glow}`}
            style={{
              backgroundImage: `linear-gradient(180deg, ${mod.bgSolid} 0%, #1E1B4B 100%)`
            }}
          >
            <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">{mod.emoji}</span>
            <div className="font-game text-sm leading-tight text-white">{mod.title}</div>
            <div className="font-body text-xs text-white/70">{mod.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
