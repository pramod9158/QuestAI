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
  { rank: '🥇', grad: ['#FFD60A', '#FF9F1C'], glow: 'rgba(255,214,10,0.5)', height: 128, size: 56, delay: 0 },
  { rank: '🥈', grad: ['#C0C0D0', '#9090A0'], glow: 'rgba(192,192,200,0.35)', height: 96, size: 48, delay: 0.1 },
  { rank: '🥉', grad: ['#FF8906', '#F25F4C'], glow: 'rgba(255,137,6,0.4)', height: 80, size: 44, delay: 0.2 },
];
const PODIUM_ORDER = [1, 0, 2]; // show 2nd, 1st, 3rd

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
        <div className="gradient-orb gradient-orb-xp" style={{ width: 200, height: 200, top: -60, right: -40, opacity: 0.4 }} />
        <h1 className="font-heading font-bold text-2xl text-white flex items-center gap-2 relative">
          <Trophy className="w-6 h-6" style={{ color: '#FFD60A' }} />
          Leaderboard
        </h1>
        <p className="text-white/50 font-body text-sm mt-1 relative">Top AI Explorers this week!</p>
        <div className="flex items-center gap-2 mt-2 relative">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#2CB67D', boxShadow: '0 0 6px rgba(44,182,125,0.8)' }}
          />
          <span className="font-body text-xs" style={{ color: '#2CB67D' }}>Live • Updates in real-time</span>
        </div>
      </div>

      {/* Podium */}
      {entries.length >= 3 && (
        <div className="px-5 -mt-4">
          <div className="flex items-end justify-center gap-3" style={{ height: 200 }}>
            {PODIUM_ORDER.map((pos) => {
              const { rank, grad, glow, height, size, delay } = PODIUM[pos];
              const entry = entries[pos];
              return (
                <motion.div
                  key={pos}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay, duration: 0.5, type: 'spring', stiffness: 200 }}
                  className="flex flex-col items-center gap-2 flex-1"
                >
                  {pos === 0 && (
                    <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                      <PixelAvatar username={entry?.username} size={size} colorIndex={pos} />
                    </motion.div>
                  )}
                  {pos !== 0 && <PixelAvatar username={entry?.username} size={size} colorIndex={pos} />}
                  <div className="font-body text-white/80 text-xs text-center truncate w-full">{entry?.username}</div>
                  <div
                    className="w-full flex flex-col items-center justify-center py-4 rounded-t-2xl"
                    style={{
                      height,
                      background: `linear-gradient(180deg, rgba(${hexToRgb(grad[0])},0.3) 0%, rgba(${hexToRgb(grad[1])},0.15) 100%)`,
                      border: `1px solid rgba(${hexToRgb(grad[0])},0.5)`,
                      borderBottom: 'none',
                      boxShadow: `0 -4px 20px ${glow}`,
                    }}
                  >
                    <div className="text-3xl">{rank}</div>
                    <div
                      className="font-heading font-bold text-xs mt-1"
                      style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
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
          const topGrads = [['#FFD60A', '#FF9F1C'], ['#C0C0D0', '#9090A0'], ['#FF8906', '#F25F4C']];
          const [gf, gt] = isTop3 ? topGrads[i] : ['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)'];

          return (
            <motion.div
              key={entry.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.04, duration: 0.35 }}
              className="flex items-center gap-3 p-3 rounded-2xl"
              style={isTop3 ? {
                background: `linear-gradient(135deg, rgba(${hexToRgb(gf)},0.18) 0%, rgba(${hexToRgb(gt)},0.08) 100%)`,
                border: `1px solid rgba(${hexToRgb(gf)},0.4)`,
                boxShadow: `0 4px 16px rgba(${hexToRgb(gf)},0.15)`,
              } : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="w-8 text-center font-heading font-bold text-sm">
                {isTop3 ? rankBadge : <span className="text-white/35">#{i + 1}</span>}
              </div>
              <PixelAvatar username={entry.username} size={40} colorIndex={i} />
              <div className="flex-1 min-w-0">
                <div className="font-heading font-semibold text-sm text-white truncate">{entry.username}</div>
                <div className="text-white/40 font-body text-xs">🔥 {entry.current_streak}d streak</div>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" style={{ color: '#FFD60A' }} />
                <span
                  className="font-heading font-bold text-sm"
                  style={isTop3 ? {
                    background: `linear-gradient(135deg, ${gf}, ${gt})`,
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
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

function hexToRgb(hex: string): string {
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return '127,90,240';
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '127,90,240';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
