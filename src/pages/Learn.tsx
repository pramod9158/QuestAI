import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRICULUM } from '@/data/curriculum';
import { Lock, Play, CheckCircle, Zap, Calendar, Award, Trophy, Compass, Flame, Map, LayoutGrid, AlertCircle } from 'lucide-react';
import { getPlatformProgress, getLevel, getEarnedBadges, BADGES } from '@/lib/gamification';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { XPBottle } from '@/components/ui/XPBottle';

export default function Learn() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  
  const userZone = profile?.zone || 'junior';
  const completedIds: string[] = profile?.completed_lessons || [];
  
  // Sort and filter the curriculum based on student zone
  const filtered = CURRICULUM.filter(l => l.zone === userZone || l.zone === 'both');
  
  const [activeTab, setActiveTab] = useState<'all' | 'locked' | 'completed'>('all');

  // Calculate stats for left sidebar
  const stats = getPlatformProgress(profile);
  const doneCount = stats.completedLessons;
  const totalCount = filtered.length || 20;
  const percent = Math.round((doneCount / totalCount) * 100);
  
  const level = profile ? getLevel(profile.xp) : 1;
  const streak = profile?.current_streak || 0;
  const totalXp = profile?.xp || 0;
  const badgesEarned = profile ? getEarnedBadges(profile.xp, profile.current_streak) : [];

  const getLevelTitle = (lvl: number) => {
    if (lvl < 2) return 'Novice Explorer';
    if (lvl < 4) return 'AI Explorer';
    if (lvl < 6) return 'AI Scholar';
    return 'Future Innovator';
  };

  const getDuration = (xp: number) => {
    if (xp <= 30) return '10 min';
    if (xp <= 45) return '15 min';
    return '20 min';
  };

  // Find the current active lesson index (first incomplete)
  const activeIndex = filtered.findIndex(l => !completedIds.includes(l.id));


  // Partition the curriculum lessons
  const mappedLessons = filtered.map((lesson, idx) => {
    const isDone = completedIds.includes(lesson.id);
    const isLocked = idx > activeIndex && activeIndex !== -1;
    const isCurrent = !isDone && !isLocked;
    const pVal = isDone ? 100 : parseInt(localStorage.getItem(`lesson_progress_${lesson.id}`) || '0', 10);
    const duration = getDuration(lesson.xpReward);
    const completedDate = localStorage.getItem(`lesson_completed_at_${lesson.id}`) || 'Recently';
    return {
      ...lesson,
      idx,
      isDone,
      isLocked,
      isCurrent,
      pVal,
      duration,
      completedDate
    };
  });

  const inProgressList = mappedLessons.filter(l => l.isCurrent);
  const lockedList = mappedLessons.filter(l => l.isLocked);
  const completedList = mappedLessons.filter(l => l.isDone);

  // Filter lessons based on active tab
  const getDisplayLessons = () => {
    if (activeTab === 'locked') return lockedList;
    if (activeTab === 'completed') return completedList;
    return mappedLessons;
  };

  const handleCardClick = (lessonId: string, isLocked: boolean) => {
    if (isLocked) return;
    navigate(`/learn/${lessonId}`);
  };

  return (
    <div className="min-h-full pb-16 bg-stars bg-[#0F0A2E] p-4 md:p-6">
      
      {/* Page Title Header */}
      <div className="mb-6">
        <h1 className="font-pixel text-[10px] text-white flex items-center gap-2 tracking-wide uppercase">
          📚 {userZone === 'junior' ? 'JUNIOR EXPLORER ZONE' : 'FUTURE INNOVATOR ZONE'}
        </h1>
        <p className="text-white/45 font-body text-xs mt-1.5">
          {userZone === 'junior' 
            ? 'Start your adventure and learn how AI can make magic!' 
            : 'Master artificial intelligence through hands-on neural designs.'}
        </p>
      </div>

      {/* ── MINECRAFT STYLE SPLIT DASHBOARD LAYOUT ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Summary Stats Panel */}
        <div className="lg:col-span-4 xl:col-span-3 mc-sidebar-panel p-5 flex flex-col items-center">
          {/* XP Bottle Container */}
          <div className="relative flex flex-col items-center mb-4">
            <XPBottle percent={percent} size={88} className="mb-2" />
            <div className="font-pixel text-lg text-white mt-1" style={{ textShadow: '2px 2px 0px #000' }}>
              {percent}%
            </div>
            <div className="font-pixel text-[5px] text-white/50 mt-1 uppercase tracking-wider">
              {doneCount} of {totalCount} completed
            </div>
          </div>

          {/* Sub-stats vertical list */}
          <div className="w-full space-y-2.5">
            <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
              <span className="font-pixel text-[5px] text-white/40 uppercase">In Progress</span>
              <span className="font-game text-xs text-white">{inProgressList.length}</span>
            </div>
            
            <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
              <span className="font-pixel text-[5px] text-white/40 uppercase">Rewards</span>
              <span className="font-game text-xs text-[#FFD60A]">{badgesEarned.length}/{BADGES.length} Badges</span>
            </div>

            <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
              <span className="font-pixel text-[5px] text-white/40 uppercase">Level</span>
              <div className="text-right">
                <span className="font-game text-xs text-white block leading-none">{getLevelTitle(level)}</span>
                <span className="font-pixel text-[4px] text-primary-light mt-0.5 inline-block">Lv {level}</span>
              </div>
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
              onClick={() => setActiveTab('locked')}
              className={`mc-tab ${activeTab === 'locked' ? 'active' : ''}`}
            >
              Locked
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
            
            {/* 0% Progress Prompt */}
            {doneCount === 0 && activeTab === 'all' && (
              <motion.div 
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mc-item-card p-5 text-center mb-4"
              >
                <div className="text-4xl animate-bounce mb-3.5">🚀</div>
                <h2 className="font-game text-base text-white">Start Your AI Adventure</h2>
                <p className="text-white/60 font-body text-xs mt-1 max-w-sm mx-auto">
                  Unlock the secrets of machine learning, train models, and design systems! Complete Module 1 to begin.
                </p>
                <button
                  onClick={() => navigate(`/learn/${filtered[0]?.id}`)}
                  className="mt-4 px-5 py-2 mc-sidebar-stat text-warning font-game text-xs uppercase cursor-pointer hover:brightness-110 active:scale-98"
                >
                  Start Module 1
                </button>
              </motion.div>
            )}

            {/* 100% Course Completed State */}
            {doneCount === totalCount && activeTab === 'all' && (
              <motion.div 
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mc-item-card p-5 text-center mb-4"
                style={{ borderColor: '#4caf50' }}
              >
                <div className="text-4xl mb-2.5">🎓</div>
                <h2 className="font-game text-base text-green-400 uppercase tracking-wide">Course Completed!</h2>
                <p className="text-white/80 font-body text-xs mt-1">
                  Congratulations! You completed all {totalCount} modules of the AI curriculum!
                </p>

                {/* Pixel Certificate */}
                <div className="my-5 p-4 mc-sidebar-panel text-center relative overflow-hidden max-w-sm mx-auto">
                  <div className="font-pixel text-[5px] text-[#FFD60A]">CERTIFICATE OF ACHIEVEMENT</div>
                  <div className="font-game text-sm text-white mt-2.5">{profile?.username || 'Explorer'}</div>
                  <p className="font-body text-[10px] text-white/50 mt-1 max-w-[220px] mx-auto leading-tight">
                    Has successfully completed the interactive AI machine learning journey.
                  </p>
                  <div className="font-pixel text-[4px] text-white/30 mt-3.5 uppercase">QUESTAI PLATFORM</div>
                </div>
                
                <button
                  onClick={() => navigate('/play/brainstorm')}
                  className="px-5 py-2 mc-sidebar-stat text-green-300 font-game text-xs uppercase cursor-pointer hover:brightness-110 active:scale-98"
                >
                  Create New Inventions
                </button>
              </motion.div>
            )}

            {/* Render items by active tab */}
            {activeTab === 'all' ? (
              // Grouped view for "All" tab matching Minecraft
              <>
                {/* 1. In Progress Section */}
                {inProgressList.length > 0 && (
                  <div className="space-y-2">
                    <div className="font-pixel text-[5px] px-2 py-0.5 bg-[#5555ff] text-white border border-black inline-block uppercase tracking-wider">
                      In progress
                    </div>
                    {inProgressList.map(lesson => renderLessonCard(lesson))}
                  </div>
                )}

                {/* 2. Completed Section */}
                {completedList.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="font-pixel text-[5px] px-2 py-0.5 bg-green-700 text-white border border-black inline-block uppercase tracking-wider">
                      Completed
                    </div>
                    {completedList.map(lesson => renderLessonCard(lesson))}
                  </div>
                )}

                {/* 3. Locked Section */}
                {lockedList.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="font-pixel text-[5px] px-2 py-0.5 bg-[#555555] text-white border border-black inline-block uppercase tracking-wider">
                      Locked
                    </div>
                    {lockedList.map(lesson => renderLessonCard(lesson))}
                  </div>
                )}
              </>
            ) : (
              // Filtered list view for Locked and Completed tabs
              <div className="space-y-2">
                {getDisplayLessons().length === 0 ? (
                  <div className="text-center py-12 text-white/40 font-body text-xs">
                    No modules found in this category.
                  </div>
                ) : (
                  getDisplayLessons().map(lesson => renderLessonCard(lesson))
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );

  // Helper render function for Lesson Cards matching Minecraft UI
  function renderLessonCard(lesson: typeof mappedLessons[0]) {
    return (
      <motion.div
        key={lesson.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onClick={() => handleCardClick(lesson.id, lesson.isLocked)}
        className={`mc-item-card p-4 flex gap-4 items-center justify-between select-none cursor-pointer ${
          lesson.isDone ? 'completed' : lesson.isLocked ? 'locked' : ''
        }`}
        style={{ cursor: lesson.isLocked ? 'not-allowed' : 'pointer' }}
      >
        {/* Left icon thumbnail slot */}
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#181818] border-2 border-[#0a0a0a] shadow-[inset_1.5px_1.5px_0px_#050505,inset_-1.5px_-1.5px_0px_#2c2c2c] text-xl">
          {lesson.emoji}
        </div>

        {/* Middle title and description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-pixel text-[4px] text-[#5555ff] uppercase tracking-wider">
              Module {lesson.idx + 1}
            </span>
            {lesson.isCurrent && (
              <span className="font-pixel text-[4px] px-1 py-0.2 bg-[#5555ff]/20 text-[#5555ff] border border-[#5555ff]/30 uppercase">
                Active
              </span>
            )}
          </div>
          
          <h3 className="font-game text-sm text-white leading-tight truncate">
            {lesson.title}
          </h3>
          <p className="text-white/45 font-body text-xs mt-0.5 line-clamp-1">
            {lesson.description}
          </p>

          {/* Stats sub-row */}
          <div className="flex items-center gap-3 mt-1.5 font-pixel text-[4px] text-white/30 uppercase">
            <span>⏱️ {lesson.duration}</span>
            <span className="text-amber-500 flex items-center gap-0.5">
              ⚡ +{lesson.xpReward} XP
            </span>
            {lesson.isDone && lesson.completedDate && (
              <span className="text-green-500">
                ✓ Completed {lesson.completedDate}
              </span>
            )}
          </div>

          {/* Blue progress line at the bottom of active cards */}
          {lesson.isCurrent && lesson.pVal > 0 && (
            <div className="mt-2.5 w-full h-1 bg-[#101010] p-[0.5px] border border-[#0d0d0d]">
              <div 
                className="h-full mc-progress-bar-blue" 
                style={{ width: `${lesson.pVal}%` }} 
              />
            </div>
          )}
        </div>

        {/* Right side lock status or gamerscore XP label */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="mc-sidebar-stat px-2 py-0.5 font-pixel text-[5px] text-amber-300">
            G {lesson.xpReward}
          </div>
          <div>
            {lesson.isDone ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : lesson.isLocked ? (
              <Lock className="w-4 h-4 text-white/20" />
            ) : (
              <Play className="w-4 h-4 text-white animate-pulse" fill="white" />
            )}
          </div>
        </div>
      </motion.div>
    );
  }
}

