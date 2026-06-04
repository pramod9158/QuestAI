import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { PLAY_MODULES_DATA } from '@/data/curriculum';
import { getPlatformProgress } from '@/lib/gamification';
import { XPBottle } from '@/components/ui/XPBottle';
import { Play as PlayIcon, CheckCircle } from 'lucide-react';

export default function Play() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const userZone = profile?.zone || 'junior';

  const [activeTab, setActiveTab] = useState<'all' | 'in-progress' | 'completed'>('all');

  const filtered = PLAY_MODULES_DATA.filter(mod => mod.zones.includes(userZone));

  const rawInventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]');
  const savedIdeas = JSON.parse(localStorage.getItem('saved_ideas') || '[]');

  const stats = getPlatformProgress(profile);
  const completedPlayCount = stats.completedPlay;
  const totalPlayPercent = stats.playPercent;
  const overallPercent = stats.overallPercent;

  const playStatusList = filtered.map((mod, idx) => {
    let isDone = false;
    let percent = 0;
    const key = mod.completionKey;
    if (key === 'quests') {
      isDone = !!(profile?.completed_quests && profile.completed_quests.length > 0);
      percent = isDone ? 100 : 0;
    } else if (key.startsWith('quests_')) {
      const qId = key.replace('quests_', '');
      isDone = localStorage.getItem(`quests_${qId}`) === 'true' || !!(profile?.completed_quests && profile.completed_quests.includes(qId));
      if (isDone) {
        percent = 100;
      } else {
        percent = parseInt(localStorage.getItem(`play_progress_story_${qId}`) || '0', 10);
      }
    } else if (key === 'inventions') {
      isDone = rawInventions.length > 0;
      percent = isDone ? 100 : localStorage.getItem('play_progress_brainstorm') ? 50 : 0;
    } else if (key === 'ideas') {
      isDone = savedIdeas.length > 0;
      percent = isDone ? 100 : localStorage.getItem('play_progress_idea-generator') ? 50 : 0;
    } else {
      isDone = localStorage.getItem(key) === 'true';
      if (isDone) {
        percent = 100;
      } else {
        const progKey = key.replace('play_completed_', 'play_progress_');
        percent = parseInt(localStorage.getItem(progKey) || '0', 10);
      }
    }

    return {
      idx,
      title: mod.title,
      emoji: mod.emoji,
      desc: mod.desc,
      gradFrom: mod.gradFrom,
      isDone,
      percent,
      path: mod.path
    };
  });

  const inProgressList = playStatusList.filter(item => !item.isDone);
  const completedList = playStatusList.filter(item => item.isDone);

  const getDisplayItems = () => {
    if (activeTab === 'in-progress') return inProgressList;
    if (activeTab === 'completed') return completedList;
    return playStatusList;
  };

  const streak = profile?.current_streak || 0;
  const totalXp = profile?.xp || 0;

  return (
    <div className="min-h-full pb-16 bg-[#0F0A2E] p-4 md:p-6 bg-stars">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-pixel text-[10px] text-white flex items-center gap-2 relative tracking-wide uppercase">
          🎮 PLAY ZONE
        </h1>
        <p className="text-white/45 font-body text-xs mt-1.5 relative">
          {userZone === 'junior' 
            ? 'Exactly 20 interactive AI play modules for ages 6–11' 
            : 'Exactly 20 advanced AI creation modules for ages 12–16'}
        </p>
      </div>

      {/* ── MINECRAFT STYLE SPLIT DASHBOARD LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Summary Stats Panel */}
        <div className="lg:col-span-4 xl:col-span-3 mc-sidebar-panel p-5 flex flex-col items-center">
          {/* XP Bottle Container */}
          <div className="relative flex flex-col items-center mb-4">
            <XPBottle percent={totalPlayPercent} size={88} className="mb-2" />
            <div className="font-pixel text-lg text-white mt-1" style={{ textShadow: '2px 2px 0px #000' }}>
              {totalPlayPercent}%
            </div>
            <div className="font-pixel text-[5px] text-white/50 mt-1 uppercase tracking-wider">
              {completedPlayCount} of {filtered.length} completed
            </div>
          </div>

          {/* Sub-stats vertical list */}
          <div className="w-full space-y-2.5">
            <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
              <span className="font-pixel text-[5px] text-white/40 uppercase">In Progress</span>
              <span className="font-game text-xs text-white">{inProgressList.length}</span>
            </div>
            
            <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
              <span className="font-pixel text-[5px] text-white/40 uppercase">Completed</span>
              <span className="font-game text-xs text-green-400">{completedPlayCount} Modules</span>
            </div>

            <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
              <span className="font-pixel text-[5px] text-white/40 uppercase">Streak</span>
              <span className="font-game text-xs text-red-400">{streak} Days 🔥</span>
            </div>

            <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
              <span className="font-pixel text-[5px] text-white/40 uppercase">Gamerscore</span>
              <span className="font-game text-xs text-warning">+{totalXp} XP</span>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Achievements List */}
        <div className="lg:col-span-8 xl:col-span-9 mc-menu-panel p-4 flex flex-col min-h-[480px]">
          {/* Minecraft tabs header bar */}
          <div className="mc-tab-bar mb-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`mc-tab ${activeTab === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab('in-progress')}
              className={`mc-tab ${activeTab === 'in-progress' ? 'active' : ''}`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`mc-tab ${activeTab === 'completed' ? 'active' : ''}`}
            >
              Completed
            </button>
          </div>

          {/* List contents */}
          <div className="flex-1 space-y-4">
            {activeTab === 'all' ? (
              <>
                {/* 1. In Progress Section */}
                {inProgressList.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-pixel text-[5px] px-2 py-0.5 bg-[#5555ff] text-white border border-black inline-block uppercase tracking-wider">
                      In progress
                    </div>
                    {inProgressList.map(item => renderPlayCard(item))}
                  </div>
                )}

                {/* 2. Completed Section */}
                {completedList.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="font-pixel text-[5px] px-2 py-0.5 bg-green-700 text-white border border-black inline-block uppercase tracking-wider">
                      Completed
                    </div>
                    {completedList.map(item => renderPlayCard(item))}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-2">
                {getDisplayItems().length === 0 ? (
                  <div className="text-center py-12 text-white/40 font-body text-xs">
                    No play modules found in this category.
                  </div>
                ) : (
                  getDisplayItems().map(item => renderPlayCard(item))
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );

  // Render function for individual Play Cards in Minecraft style
  function renderPlayCard(item: typeof playStatusList[0]) {
    return (
      <motion.div
        key={item.path}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => navigate(item.path)}
        className={`mc-item-card p-4 flex gap-4 items-center justify-between select-none cursor-pointer ${
          item.isDone ? 'completed' : ''
        }`}
      >
        {/* Left slot */}
        <div 
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 border-[#0a0a0a] shadow-[inset_1.5px_1.5px_0px_#050505,inset_-1.5px_-1.5px_0px_#2c2c2c] text-xl"
          style={{ background: item.gradFrom }}
        >
          {item.emoji}
        </div>

        {/* Middle contents */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-pixel text-[4px] text-[#5555ff] uppercase tracking-wider">
              Play Module {item.idx + 1}
            </span>
          </div>

          <h3 className="font-game text-sm text-white leading-tight truncate">
            {item.title}
          </h3>
          <p className="text-white/45 font-body text-xs mt-0.5 line-clamp-1">
            {item.desc}
          </p>

          {/* Bottom blue progress bar for active items with partial progress */}
          {!item.isDone && item.percent > 0 && (
            <div className="mt-2.5 w-full h-1 bg-[#101010] p-[0.5px] border border-[#0d0d0d]">
              <div 
                className="h-full mc-progress-bar-blue" 
                style={{ width: `${item.percent}%` }} 
              />
            </div>
          )}
        </div>

        {/* Right slot */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="mc-sidebar-stat px-2 py-0.5 font-pixel text-[5px] text-amber-300">
            G 50
          </div>
          <div>
            {item.isDone ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <PlayIcon className="w-4 h-4 text-white animate-pulse" fill="white" />
            )}
          </div>
        </div>
      </motion.div>
    );
  }
}

