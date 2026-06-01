import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { PixelAvatar } from '@/components/ui/GameUI';
import { Trophy, Star, Zap } from 'lucide-react';

interface LeaderboardEntry { id: string; username: string; xp: number; current_streak: number; }

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demo
  const MOCK_DATA: LeaderboardEntry[] = [
    { id: '1', username: 'SuperCoder99', xp: 1250, current_streak: 15 },
    { id: '2', username: 'AIWizard', xp: 980, current_streak: 8 },
    { id: '3', username: 'PixelHero', xp: 820, current_streak: 12 },
    { id: '4', username: 'DataNinja', xp: 740, current_streak: 5 },
    { id: '5', username: 'BrainBot', xp: 690, current_streak: 7 },
    { id: '6', username: 'TechKid', xp: 580, current_streak: 3 },
    { id: '7', username: 'AIExplorer', xp: 520, current_streak: 10 },
    { id: '8', username: 'FutureInnovator', xp: 440, current_streak: 4 },
    { id: '9', username: 'RoboMaster', xp: 390, current_streak: 6 },
    { id: '10', username: 'CodeWizard', xp: 320, current_streak: 2 },
  ];

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await supabase
          .from('profiles').select('id, username, xp, current_streak')
          .order('xp', { ascending: false }).limit(10);
        if (data && data.length > 0) setEntries(data as LeaderboardEntry[]);
        else setEntries(MOCK_DATA);
      } catch { setEntries(MOCK_DATA); }
      setLoading(false);
    };
    fetchLeaderboard();

    // Realtime subscription
    const channel = supabase.channel('leaderboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => fetchLeaderboard())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const RANK_BADGES = ['🥇', '🥈', '🥉'];
  const RANK_COLORS = ['bg-yellow-500/30 border-yellow-500', 'bg-gray-400/20 border-gray-400', 'bg-orange-600/20 border-orange-600'];

  return (
    <div className="min-h-full bg-pixel-darker pb-6">
      <div className="bg-gradient-to-b from-success/30 to-pixel-darker p-5">
        <h1 className="text-white font-game text-xl flex items-center gap-2">
          <Trophy className="w-6 h-6 text-warning" /> 🏆 Leaderboard
        </h1>
        <p className="text-white/60 font-body text-sm mt-1">Can you reach the top this week? 🚀</p>
        <div className="flex items-center gap-2 mt-2">
          <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
          <span className="text-success font-body text-xs">🟢 Live · Updates in real-time</span>
        </div>
      </div>

      {/* Top 3 Podium */}
      {entries.length >= 3 && (
        <div className="px-4 pt-4">
          <div className="flex items-end justify-center gap-3 h-40">
            {/* 2nd place */}
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <PixelAvatar username={entries[1]?.username} size={48} colorIndex={1} />
              <div className="text-white font-body text-xs text-center truncate w-full">{entries[1]?.username}</div>
              <div className="w-full border-4 border-black bg-gray-400/30 flex flex-col items-center justify-center py-4 h-24">
                <div className="text-3xl">🥈</div>
                <div className="text-white font-pixel text-[8px]">{entries[1]?.xp} XP</div>
              </div>
            </motion.div>
            {/* 1st place */}
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                <PixelAvatar username={entries[0]?.username} size={56} colorIndex={0} />
              </motion.div>
              <div className="text-white font-body text-xs text-center truncate w-full">{entries[0]?.username}</div>
              <div className="w-full border-4 border-yellow-500 bg-yellow-500/30 flex flex-col items-center justify-center py-4 h-32 animate-pulse-glow">
                <div className="text-4xl">🥇</div>
                <div className="text-warning font-pixel text-[8px]">{entries[0]?.xp} XP</div>
              </div>
            </motion.div>
            {/* 3rd place */}
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-2 flex-1"
            >
              <PixelAvatar username={entries[2]?.username} size={48} colorIndex={2} />
              <div className="text-white font-body text-xs text-center truncate w-full">{entries[2]?.username}</div>
              <div className="w-full border-4 border-orange-600 bg-orange-600/20 flex flex-col items-center justify-center py-4 h-20">
                <div className="text-3xl">🥉</div>
                <div className="text-orange-400 font-pixel text-[8px]">{entries[2]?.xp} XP</div>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="px-4 mt-5 space-y-3">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`border-4 border-black p-3 flex items-center gap-3 ${i < 3 ? RANK_COLORS[i] : 'bg-pixel-dark'}`}
          >
            <div className="text-xl w-8 text-center">{i < 3 ? RANK_BADGES[i] : `#${i + 1}`}</div>
            <PixelAvatar username={entry.username} size={40} colorIndex={i} />
            <div className="flex-1 min-w-0">
              <div className="text-white font-game text-sm truncate">{entry.username}</div>
              <div className="flex items-center gap-2">
                <span className="text-white/50 font-body text-xs">🔥 {entry.current_streak}d streak</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-warning" />
              <span className="text-warning font-pixel text-[10px]">{entry.xp}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
