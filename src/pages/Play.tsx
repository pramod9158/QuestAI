import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { PLAY_MODULES_DATA } from '@/data/curriculum';
import { getPlatformProgress } from '@/lib/gamification';
import { CardProgressBadge, CardProgressBar } from '@/components/ui/GameUI';

export default function Play() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const userZone = profile?.zone || 'junior';

  const filtered = PLAY_MODULES_DATA.filter(mod => mod.zones.includes(userZone));

  const rawInventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]');
  const savedIdeas = JSON.parse(localStorage.getItem('saved_ideas') || '[]');

  const stats = getPlatformProgress(profile);
  const completedPlayCount = stats.completedPlay;
  const totalPlayPercent = stats.playPercent;
  const overallPercent = stats.overallPercent;

  const isModDone = (path: string) => {
    const mod = PLAY_MODULES_DATA.find(m => m.path === path);
    if (!mod) return false;
    const key = mod.completionKey;
    if (key === 'quests') {
      return !!(profile?.completed_quests && profile.completed_quests.length > 0);
    } else if (key.startsWith('quests_')) {
      const qId = key.replace('quests_', '');
      return localStorage.getItem(`quests_${qId}`) === 'true' || !!(profile?.completed_quests && profile.completed_quests.includes(qId));
    } else if (key === 'inventions') {
      return rawInventions.length > 0;
    } else if (key === 'ideas') {
      return savedIdeas.length > 0;
    } else {
      return localStorage.getItem(key) === 'true';
    }
  };

  const activePlayIndex = filtered.findIndex(mod => !isModDone(mod.path));

  const playStatusList = filtered.map((mod, i) => {
    const isDone = isModDone(mod.path);
    let percent = 0;
    const key = mod.completionKey;
    if (isDone) {
      percent = 100;
    } else {
      if (key === 'quests') {
        percent = 0;
      } else if (key.startsWith('quests_')) {
        const qId = key.replace('quests_', '');
        percent = parseInt(localStorage.getItem(`play_progress_story_${qId}`) || '0', 10);
      } else if (key === 'inventions') {
        percent = localStorage.getItem('play_progress_brainstorm') ? 50 : 0;
      } else if (key === 'ideas') {
        percent = localStorage.getItem('play_progress_idea-generator') ? 50 : 0;
      } else {
        const progKey = key.replace('play_completed_', 'play_progress_');
        percent = parseInt(localStorage.getItem(progKey) || '0', 10);
      }
    }

    const isLocked = false; // Bypass locking
    const isActive = activePlayIndex !== -1 && i === activePlayIndex;

    return {
      title: mod.title,
      emoji: mod.emoji,
      desc: mod.desc,
      gradFrom: mod.gradFrom,
      isDone,
      isLocked,
      isActive,
      percent,
      path: mod.path
    };
  });

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="relative px-5 pt-6 pb-10 overflow-hidden">
        <h1 className="font-pixel text-[10px] text-white flex items-center gap-2 relative tracking-wide">
          🎮 PLAY ZONE
        </h1>
        <p className="text-white/55 font-body text-sm mt-2 relative">
          {userZone === 'junior' 
            ? 'Exactly 20 interactive AI play modules for ages 6–11' 
            : 'Exactly 20 advanced AI creation modules for ages 12–16'}
        </p>
      </div>

      {/* Play Tab Progress Panel */}
      <div className="px-5 mb-6 -mt-6">
        <div
          className="p-4 space-y-3"
          style={{
            background: '#1E1B4B',
            border: '3px solid #10B981',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
            <span className="text-sm">🏆</span>
            <span className="font-game text-[10px] text-white uppercase tracking-wider">Mission Control</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Play Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline text-[7px] font-pixel text-[#10B981]">
                <span>PLAY ZONE COMPLETED</span>
                <span>{completedPlayCount}/20 ({totalPlayPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-[#0F0A2E] border border-black p-[1px] flex items-center">
                <div className="h-full bg-[#10B981]" style={{ width: `${totalPlayPercent}%`, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          </div>

          {/* List of play module completions */}
          <div className="pt-2 border-t border-white/5 space-y-1.5">
            <span className="text-white/45 font-game text-[8px] block uppercase">Activity Log:</span>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
              {playStatusList.map(item => (
                <div 
                  key={item.path} 
                  onClick={() => {
                    if (item.isLocked) {
                      const activeMod = filtered[activePlayIndex];
                      if (activeMod) navigate(activeMod.path);
                    } else {
                      navigate(item.path);
                    }
                  }}
                  className="flex items-center gap-1.5 text-[9px] font-body text-white/80 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{item.isDone ? '✅' : item.isLocked ? '🔒' : '⏳'}</span>
                    <span className={item.isDone ? 'line-through text-white/40 truncate' : item.isLocked ? 'text-white/30 truncate' : 'truncate'}>
                      {item.emoji} {item.title} {item.percent > 0 && item.percent < 100 && `(${item.percent}%)`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Module Grid */}
      <div className="px-5 grid grid-cols-2 gap-4">
        {playStatusList.map((mod, i) => (
          <motion.div
            key={mod.path}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03, duration: 0.3 }}
            whileHover={!mod.isDone && !mod.isLocked ? { scale: 1.03, y: -2 } : {}}
            whileTap={!mod.isDone && !mod.isLocked ? { scale: 0.97 } : {}}
            onClick={() => {
              if (mod.isLocked) {
                const activeMod = filtered[activePlayIndex];
                if (activeMod) navigate(activeMod.path);
              } else {
                navigate(mod.path);
              }
            }}
            className={`p-4 cursor-pointer flex flex-col justify-between min-h-[140px] relative overflow-hidden transition-all ${
              mod.isDone ? 'opacity-40 grayscale saturate-50' : 
              mod.isLocked ? 'opacity-35 grayscale saturate-50' : ''
            }`}
            style={{
              background: '#1E1B4B',
              border: mod.isLocked ? '3px solid #374151' : '3px solid #000000',
              boxShadow: mod.isDone || mod.isLocked ? '2px 2px 0px 0px #000000' : '4px 4px 0px 0px #000000',
            }}
          >
            {mod.isDone && (
              <div className="completed-ribbon-container">
                <div className="completed-ribbon">DONE</div>
              </div>
            )}
            {mod.isLocked && (
              <div className="completed-ribbon-container">
                <div className="completed-ribbon bg-gray-600" style={{ background: '#374151' }}>LOCKED</div>
              </div>
            )}
            <div>
              <div className="flex justify-between items-start mb-2.5">
                <div
                  className="w-10 h-10 flex items-center justify-center text-xl flex-shrink-0"
                  style={{
                    background: mod.isLocked ? '#374151' : mod.gradFrom,
                    border: mod.isLocked ? '2px solid #4B5563' : '2px solid #000000',
                    boxShadow: mod.isLocked ? '2px 2px 0px #374151' : '2px 2px 0px #000000',
                  }}
                >
                  {mod.isLocked ? '🔒' : mod.emoji}
                </div>
                {mod.isLocked ? (
                  <span className="bg-gray-800/80 border border-gray-600 font-pixel text-[5px] text-gray-400 px-1.5 py-0.5">
                    LOCKED
                  </span>
                ) : (
                  <CardProgressBadge percent={mod.percent} />
                )}
              </div>
              <div>
                <div className="font-game text-xs text-white leading-tight truncate">{mod.title}</div>
                <div className="text-white/40 font-body text-[10px] mt-1 line-clamp-2 h-7 leading-tight">{mod.desc}</div>
              </div>
            </div>
            <div className="mt-2.5">
              <CardProgressBar percent={mod.percent} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
