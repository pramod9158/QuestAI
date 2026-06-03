import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { PixelAvatar } from '@/components/ui/GameUI';
import { Trophy, Zap } from 'lucide-react';

interface LeaderboardEntry { id: string; username: string; xp: number; current_streak: number; }

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

const PODIUM = [
  { rank: '🥇', gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706', height: 128, size: 56, delay: 0 },
  { rank: '🥈', gradFrom: '#C0C0D0', gradTo: '#9090A0', border: '#C0C0D0', shadow: '#6B7280', height: 96, size: 48, delay: 0.1 },
  { rank: '🥉', gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B', height: 80, size: 44, delay: 0.2 },
];
const PODIUM_ORDER = [1, 0, 2];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

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
    const channel = supabase.channel('leaderboard')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, () => fetchLeaderboard())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="relative px-5 pt-6 pb-10 overflow-hidden">
        <h1 className="font-pixel text-[10px] text-white flex items-center gap-2 relative tracking-wide">
          <Trophy className="w-5 h-5" style={{ color: '#F59E0B' }} />
          LEADERBOARD
        </h1>
        <p className="text-white/50 font-body text-sm mt-2 relative">Top AI Explorers this week!</p>
        <div className="flex items-center gap-2 mt-2 relative">
          <div className="w-2 h-2 animate-pulse" style={{ background: '#10B981', boxShadow: '0 0 6px rgba(16,185,129,0.8)' }} />
          <span className="font-pixel text-[6px] tracking-wide" style={{ color: '#10B981' }}>LIVE • UPDATES IN REAL-TIME</span>
        </div>
      </div>

      {/* Podium */}
      {entries.length >= 3 && (
        <div className="px-5 -mt-4">
          <div className="flex items-end justify-center gap-3" style={{ height: 200 }}>
            {PODIUM_ORDER.map((pos) => {
              const p = PODIUM[pos];
              const entry = entries[pos];
              return (
                <motion.div
                  key={pos}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: p.delay, duration: 0.5, type: 'spring', stiffness: 200 }}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  {pos === 0 ? (
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                      <PixelAvatar username={entry?.username} size={p.size} colorIndex={pos} />
                    </motion.div>
                  ) : (
                    <PixelAvatar username={entry?.username} size={p.size} colorIndex={pos} />
                  )}
                  <div className="font-body text-white/80 text-xs text-center truncate w-full">{entry?.username}</div>
                  <div
                    className="w-full flex flex-col items-center justify-center py-4"
                    style={{
                      height: p.height,
                      background: '#1E1B4B',
                      borderLeft: '3px solid #000000',
                      borderRight: '3px solid #000000',
                      borderTop: '3px solid #000000',
                      boxShadow: '0 -3px 0px 0px #000000, 4px 0 0px 0px #000000',
                    }}
                  >
                    <div className="text-3xl">{p.rank}</div>
                    <div
                      className="font-game text-xs mt-1"
                      style={{ color: p.gradFrom }}
                    >
                      {entry?.xp} XP
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Full List */}
      <div className="px-5 mt-4 space-y-2">
        {entries.map((entry, i) => {
          const isTop3 = i < 3;
          const rankBadge = ['🥇', '🥈', '🥉'][i];
          const topStyles = [
            { gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706' },
            { gradFrom: '#C0C0D0', gradTo: '#9090A0', border: '#C0C0D0', shadow: '#6B7280' },
            { gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B' },
          ];
          const ts = isTop3 ? topStyles[i] : null;

          return (
            <motion.div
              key={entry.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="flex items-center gap-3 p-3"
              style={isTop3 && ts ? {
                background: '#1E1B4B',
                border: '3px solid #000000',
                boxShadow: '3px 3px 0px 0px #000000',
              } : {
                background: '#1E1B4B',
                border: '2px solid #000000',
                boxShadow: '2px 2px 0px 0px #000000',
              }}
            >
              <div className="w-8 text-center font-game text-sm">
                {isTop3 ? rankBadge : <span className="text-white/35 font-pixel text-[7px]">#{i + 1}</span>}
              </div>
              <PixelAvatar username={entry.username} size={40} colorIndex={i} />
              <div className="flex-1 min-w-0">
                <div className="font-game text-sm text-white truncate">{entry.username}</div>
                <div className="text-white/35 font-pixel text-[5px] tracking-wide">🔥 {entry.current_streak}D STREAK</div>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} />
                <span
                  className="font-game text-sm"
                  style={isTop3 && ts ? {
                    color: ts.gradFrom,
                  } : { color: 'rgba(255,255,255,0.6)' }}
                >
                  {entry.xp}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
