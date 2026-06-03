import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PLAY_MODULES = [
  { path: '/play/around-me', emoji: '🌍', title: 'AI Around Me', desc: 'Swipe cards — Is this AI?', gradFrom: '#3B82F6', gradTo: '#8B5CF6', border: '#3B82F6', shadow: '#1D4ED8' },
  { path: '/play/story', emoji: '⚔️', title: 'Story Adventures', desc: '8 epic quests to solve', gradFrom: '#7C3AED', gradTo: '#3B82F6', border: '#7C3AED', shadow: '#5B21B6' },
  { path: '/play/detective', emoji: '🕵️', title: 'AI Detective', desc: 'Can AI help here?', gradFrom: '#10B981', gradTo: '#3B82F6', border: '#10B981', shadow: '#047857' },
  { path: '/play/brainstorm', emoji: '💡', title: 'Brainstorm Lab', desc: '3-step AI invention wizard', gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706' },
  { path: '/play/idea-generator', emoji: '⚡', title: 'Idea Generator', desc: 'Type a problem → get 3 AI ideas', gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B' },
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Time Attack or Casual mode', gradFrom: '#EC4899', gradTo: '#7C3AED', border: '#EC4899', shadow: '#BE185D' },
  { path: '/play/cards', emoji: '🃏', title: 'AI Cards', desc: 'Collect all 7 hero cards!', gradFrom: '#F59E0B', gradTo: '#10B981', border: '#F59E0B', shadow: '#D97706' },
  { path: '/play/inventor-hall', emoji: '🏛️', title: 'Inventor Hall', desc: 'See the global AI showcase', gradFrom: '#8B5CF6', gradTo: '#EF4444', border: '#8B5CF6', shadow: '#6D28D9' },
  { path: '/comic', emoji: '📚', title: 'Comic Creator', desc: 'Build your AI adventure comic!', gradFrom: '#7C3AED', gradTo: '#EC4899', border: '#7C3AED', shadow: '#5B21B6' },
];

export default function Play() {
  const navigate = useNavigate();
  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="relative px-5 pt-6 pb-10 overflow-hidden">
        <h1 className="font-pixel text-[10px] text-white flex items-center gap-2 relative tracking-wide">
          🎮 PLAY ZONE
        </h1>
        <p className="text-white/50 font-body text-sm mt-2 relative">9 interactive AI modules to explore</p>
      </div>

      {/* Module Grid */}
      <div className="px-5 -mt-6 grid grid-cols-2 gap-4">
        {PLAY_MODULES.map((mod, i) => (
          <motion.div
            key={mod.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, duration: 0.35 }}
            whileHover={{ scale: 1.04, y: -3 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(mod.path)}
            className="p-5 cursor-pointer flex flex-col gap-3"
            style={{
              background: '#1E1B4B',
              border: '3px solid #000000',
              boxShadow: '4px 4px 0px 0px #000000',
            }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center text-2xl"
              style={{
                background: `linear-gradient(135deg, ${mod.gradFrom}, ${mod.gradTo})`,
                border: '2px solid #000000',
                boxShadow: '2px 2px 0px #000000',
              }}
            >
              {mod.emoji}
            </div>
            <div>
              <div className="font-game text-sm text-white leading-tight">{mod.title}</div>
              <div className="text-white/45 font-body text-[11px] mt-1">{mod.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
