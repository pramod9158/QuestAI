import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const PLAY_MODULES = [
  { path: '/play/around-me', emoji: '🌍', title: 'AI Around Me', desc: 'Spot AI in everyday life!', color: 'bg-blue-game', shadow: 'shadow-pixel-blue' },
  { path: '/play/story', emoji: '🗺️', title: 'Story Adventures', desc: 'Go on 8 epic AI quests!', color: 'bg-primary', shadow: 'shadow-pixel-purple' },
  { path: '/play/detective', emoji: '🕵️', title: 'AI Detective', desc: 'Solve mysteries with AI!', color: 'bg-success', shadow: 'shadow-pixel-green' },
  { path: '/play/brainstorm', emoji: '💡', title: 'Brainstorm Lab', desc: 'Invent your AI idea!', color: 'bg-warning', shadow: 'shadow-pixel-orange', textColor: 'text-black' },
  { path: '/play/idea-generator', emoji: '💫', title: 'Idea Generator', desc: 'Get 3 AI ideas instantly!', color: 'bg-pink-600', shadow: 'shadow-pixel' },
  { path: '/play/quiz', emoji: '🎯', title: 'Quiz Arena', desc: 'Time Attack or Casual mode!', color: 'bg-red-600', shadow: 'shadow-pixel-red' },
  { path: '/play/cards', emoji: '🃏', title: 'AI Cards', desc: 'Collect all 7 hero cards!', color: 'bg-yellow-600', shadow: 'shadow-pixel-orange' },
  { path: '/play/inventor-hall', emoji: '🏆', title: 'Inventor Hall', desc: 'Show off your inventions!', color: 'bg-gray-600', shadow: 'shadow-pixel' },
  { path: '/comic', emoji: '📚', title: 'Comic Creator', desc: 'Make your own AI comic!', color: 'bg-purple-700', shadow: 'shadow-pixel-purple' },
];

export default function Play() {
  const navigate = useNavigate();
  return (
    <div className="min-h-full bg-pixel-darker pb-6">
      <div className="bg-gradient-to-b from-primary/30 to-pixel-darker p-5">
        <h1 className="text-white font-game text-xl flex items-center gap-2">🎮 Play Zone</h1>
        <p className="text-white/60 font-body text-sm mt-1">9 fun AI activities to explore 🚀</p>
      </div>
      <div className="px-4 pt-4 grid grid-cols-2 gap-4">
        {PLAY_MODULES.map((mod, i) => (
          <motion.div
            key={mod.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => navigate(mod.path)}
            className={`border-4 border-black ${mod.color} ${mod.shadow} p-5 cursor-pointer active:translate-y-1 active:shadow-none transition-all flex flex-col gap-2`}
          >
            <span className="text-4xl">{mod.emoji}</span>
            <div className={`font-game text-sm leading-tight ${mod.textColor || 'text-white'}`}>{mod.title}</div>
            <div className={`font-body text-xs ${mod.textColor ? 'text-black/70' : 'text-white/70'}`}>{mod.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
