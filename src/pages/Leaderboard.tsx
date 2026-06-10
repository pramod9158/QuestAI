import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { PixelAvatar } from '@/components/ui/GameUI';
import { Trophy, Zap, Award, Microscope, Sparkles, Heart } from 'lucide-react';

interface LeaderboardEntry { id: string; username: string; xp: number; current_streak: number; }
interface LabLeaderboardEntry { id: string; username: string; labsCompleted: number; badgeEmoji: string; }
interface WeeklyChallengeEntry { id: string; username: string; missionScore: number; missionName: string; }

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

const MOCK_LAB_DATA: LabLeaderboardEntry[] = [
  { id: 'lab-1', username: 'AIWizard', labsCompleted: 15, badgeEmoji: '🔬' },
  { id: 'lab-2', username: 'SuperCoder99', labsCompleted: 14, badgeEmoji: '🎨' },
  { id: 'lab-3', username: 'DataNinja', labsCompleted: 12, badgeEmoji: '🏋️' },
  { id: 'lab-4', username: 'RoboMaster', labsCompleted: 11, badgeEmoji: '🕵️' },
  { id: 'lab-5', username: 'PixelHero', labsCompleted: 10, badgeEmoji: '✏️' },
];

const MOCK_WEEKLY_DATA: WeeklyChallengeEntry[] = [
  { id: 'w-1', username: 'PixelHero', missionScore: 98, missionName: 'Operation: Smart Spy' },
  { id: 'w-2', username: 'BrainBot', missionScore: 95, missionName: 'Operation: Smart Spy' },
  { id: 'w-3', username: 'SuperCoder99', missionScore: 92, missionName: 'Code Breaker Academy' },
  { id: 'w-4', username: 'AIExplorer', missionScore: 90, missionName: 'Code Breaker Academy' },
  { id: 'w-5', username: 'AIWizard', missionScore: 88, missionName: 'Operation: Smart Spy' },
];

const PODIUM = [
  { rank: '🥇', gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706', height: 120, size: 52, delay: 0 },
  { rank: '🥈', gradFrom: '#C0C0D0', gradTo: '#9090A0', border: '#C0C0D0', shadow: '#6B7280', height: 90, size: 44, delay: 0.1 },
  { rank: '🥉', gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B', height: 75, size: 40, delay: 0.2 },
];
const PODIUM_ORDER = [1, 0, 2];

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  type CategoryType = 'xp' | 'labs' | 'weekly';
  const [activeCategory, setActiveCategory] = useState<CategoryType>('xp');

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
    <div className="min-h-full pb-20 bg-stars bg-[#0F0A2E] text-white">
      {/* Header Banner */}
      <div 
        className="px-5 pt-6 pb-6 border-b-3 border-black"
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #110B30 100%)'
        }}
      >
        <div className="flex justify-between items-center">
          <h1 className="font-game text-lg text-white tracking-wide flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FFD60A]" />
            LEADERBOARD STATION
          </h1>
          <div className="flex items-center gap-1.5 bg-black/40 border border-white/10 px-2 py-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-pixel text-[5px] text-emerald-400">REALTIME</span>
          </div>
        </div>
        <p className="text-white/50 font-body text-xs mt-1">Compare metrics with explorers across the country!</p>

        {/* Categories Tab selectors */}
        <div className="flex mt-4 p-1 bg-black/35 border-2 border-black gap-1">
          {[
            { id: 'xp', label: '⚡ XP Rank', icon: Zap },
            { id: 'labs', label: '🧪 Lab Ranks', icon: Microscope },
            { id: 'weekly', label: '🏆 Weekly Score', icon: Award }
          ].map(cat => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as CategoryType)}
                className={`flex-1 py-1.5 font-game text-[10px] cursor-pointer flex items-center justify-center gap-1 transition-all ${
                  active 
                    ? 'bg-[#7C3AED] text-white border-2 border-black shadow-[2px_2px_0px_#000]'
                    : 'text-white/45 hover:text-white/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Podium (renders on XP category) */}
      {activeCategory === 'xp' && entries.length >= 3 && (
        <div className="px-5 mt-4">
          <div className="flex items-end justify-center gap-2" style={{ height: 190 }}>
            {PODIUM_ORDER.map((pos) => {
              const p = PODIUM[pos];
              const entry = entries[pos];
              return (
                <motion.div
                  key={pos}
                  initial={{ y: 35, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: p.delay, duration: 0.5, type: 'spring' }}
                  className="flex flex-col items-center gap-1.5 flex-1"
                >
                  {pos === 0 ? (
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 2.5 }}>
                      <PixelAvatar username={entry?.username} size={p.size} colorIndex={pos} />
                    </motion.div>
                  ) : (
                    <PixelAvatar username={entry?.username} size={p.size} colorIndex={pos} />
                  )}
                  <div className="font-body text-white/80 text-[10px] text-center truncate w-full">{entry?.username}</div>
                  <div
                    className="w-full flex flex-col items-center justify-center py-3 bg-[#1E1B4B]"
                    style={{
                      height: p.height,
                      borderLeft: '2.5px solid #000000',
                      borderRight: '2.5px solid #000000',
                      borderTop: '2.5px solid #000000',
                      boxShadow: '4px 0 0px #000',
                    }}
                  >
                    <div className="text-2xl">{p.rank}</div>
                    <div className="font-game text-[10px] mt-0.5" style={{ color: p.gradFrom }}>
                      {entry?.xp} XP
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ranks list representation */}
      <div className="px-5 mt-5 space-y-2">
        
        {/* XP LEADERBOARD */}
        {activeCategory === 'xp' && entries.map((entry, idx) => {
          const isTop3 = idx < 3;
          return (
            <motion.div
              key={entry.id}
              initial={{ x: -15, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.03 }}
              className="flex items-center gap-3 p-3 bg-[#1E1B4B] border-2 border-black"
              style={{
                boxShadow: isTop3 ? '3.5px 3.5px 0px #000' : '2px 2px 0px #000',
              }}
            >
              <div className="w-6 text-center font-game text-xs">
                {isTop3 ? ['🥇', '🥈', '🥉'][idx] : <span className="text-white/35 font-pixel text-[6px]">#{idx + 1}</span>}
              </div>
              <PixelAvatar username={entry.username} size={36} colorIndex={idx} />
              <div className="flex-1 min-w-0">
                <div className="font-game text-xs text-white truncate">{entry.username}</div>
                <div className="text-white/35 font-pixel text-[4.5px] tracking-wide">🔥 {entry.current_streak}D STREAK</div>
              </div>
              <div className="flex items-center gap-1 font-game text-xs text-[#FFD60A]">
                <Zap className="w-3.5 h-3.5 fill-[#FFD60A]" />
                <span>{entry.xp}</span>
              </div>
            </motion.div>
          );
        })}

        {/* LAB COMPILERS LEADERBOARD */}
        {activeCategory === 'labs' && MOCK_LAB_DATA.map((entry, idx) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3 bg-[#1E1B4B] border-2 border-black shadow-[2.5px_2.5px_0px_#000]"
          >
            <div className="w-6 text-center font-game text-xs">
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-white/30 font-pixel text-[6px]">#{idx + 1}</span>}
            </div>
            <PixelAvatar username={entry.username} size={36} colorIndex={idx + 4} />
            <div className="flex-1 min-w-0">
              <div className="font-game text-xs text-white truncate">{entry.username}</div>
              <div className="text-white/40 font-pixel text-[5px]">MASTER LAB GRADUATE</div>
            </div>
            <div className="flex items-center gap-1 font-game text-xs text-[#10B981]">
              <span className="text-base">{entry.badgeEmoji}</span>
              <span>{entry.labsCompleted} Labs</span>
            </div>
          </div>
        ))}

        {/* WEEKLY CHALLENGE SCORES */}
        {activeCategory === 'weekly' && MOCK_WEEKLY_DATA.map((entry, idx) => (
          <div
            key={entry.id}
            className="flex items-center gap-3 p-3 bg-[#1E1B4B] border-2 border-black shadow-[2.5px_2.5px_0px_#000]"
          >
            <div className="w-6 text-center font-game text-xs">
              {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : <span className="text-white/30 font-pixel text-[6px]">#{idx + 1}</span>}
            </div>
            <PixelAvatar username={entry.username} size={36} colorIndex={idx + 7} />
            <div className="flex-1 min-w-0">
              <div className="font-game text-xs text-white truncate">{entry.username}</div>
              <div className="text-white/40 font-pixel text-[4.5px] truncate max-w-[170px]">{entry.missionName}</div>
            </div>
            <div className="flex items-center gap-1 font-game text-xs text-purple-400">
              <span>{entry.missionScore}% Score</span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATOR SPOTLIGHT SECTION */}
      <div className="px-5 mt-6">
        <div 
          className="p-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #29154C 100%)',
            border: '3px solid #F59E0B',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          {/* Spotlight banner decoration */}
          <div className="absolute top-0 right-0 bg-[#F59E0B] text-black font-pixel text-[5px] px-3 py-1 uppercase tracking-wider border-b-2 border-l-2 border-black font-bold">
            Featured
          </div>

          <div className="flex items-center gap-1.5 mb-2">
            <Sparkles className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse" />
            <h3 className="font-game text-xs text-white uppercase tracking-wider">Creator Spotlight of the Week</h3>
          </div>

          <div className="flex items-start gap-3 mt-3">
            <div 
              className="w-11 h-11 flex items-center justify-center text-xl flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #FFD60A, #F59E0B)',
                border: '2px solid #000',
                boxShadow: '2px 2px 0px #000',
              }}
            >
              🌾🛰️
            </div>
            <div>
              <span className="font-pixel text-[5px] text-[#A78BFA] block mb-0.5">Ananya (Age 11) • World 3 Explorer</span>
              <h4 className="font-game text-xs text-white uppercase mb-1">Smart Crop Guardian</h4>
              <p className="font-body text-[11px] text-white/70 leading-relaxed">
                "An AI sensor camera prototype that automatically classifies insect anomalies in rice farms, sending notifications to farmers' smartphones in real-time."
              </p>
            </div>
          </div>

          {/* Social reaction */}
          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between font-pixel text-[5.5px]">
            <button className="flex items-center gap-1 px-2.5 py-1 bg-black/35 hover:bg-black/55 text-white border border-black shadow-[1.5px_1.5px_0px_#000] cursor-pointer">
              <Heart className="w-2.5 h-2.5 text-pink-500 fill-pink-500" />
              156 LIKES
            </button>
            <span className="text-white/30 uppercase tracking-widest">INNOVATION SCORE: 98%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
