import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRICULUM, PHASES, type Lesson } from '@/data/curriculum';
import { Lock, Play, CheckCircle, Zap, Calendar, Trophy, Flame, Map, LayoutGrid, AlertCircle, Sparkles } from 'lucide-react';
import { getPlatformProgress, getLevel } from '@/lib/gamification';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { AICompanion } from '@/components/ui/AICompanion';

export default function Learn() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  
  const [viewMode, setViewMode] = useState<'journey' | 'grid'>('journey');

  const userZone = profile?.zone || 'junior';
  const completedIds: string[] = profile?.completed_lessons || [];
  
  // Filter curriculum by zone
  const filtered = CURRICULUM.filter(l => l.zone === userZone || l.zone === 'both');
  
  const stats = getPlatformProgress(profile);
  const doneCount = stats.completedLessons;
  const totalCount = filtered.length || 20;
  const percent = Math.round((doneCount / totalCount) * 100);
  
  const level = profile ? getLevel(profile.xp) : 1;
  const streak = profile?.current_streak || 0;
  const totalXp = profile?.xp || 0;

  const getLevelTitle = (lvl: number) => {
    if (lvl < 2) return 'Novice Explorer';
    if (lvl < 4) return 'AI Explorer';
    if (lvl < 6) return 'AI Scholar';
    return 'Future Innovator';
  };

  // Find first incomplete lesson index
  const activeIndex = filtered.findIndex(l => !completedIds.includes(l.id));

  // Determine user progress in active lesson steps
  const getStepStatus = (lesson: Lesson) => {
    const isCompleted = completedIds.includes(lesson.id);
    if (isCompleted) {
      return { watch: true, lab: true, project: true };
    }
    return {
      watch: localStorage.getItem(`lesson_${lesson.id}_watch`) === 'true',
      lab: localStorage.getItem(`lesson_${lesson.id}_lab`) === 'true',
      project: localStorage.getItem(`lesson_${lesson.id}_project`) === 'true',
    };
  };

  // Group lessons by phase
  const lessonsByPhase: Record<number, Lesson[]> = {};
  filtered.forEach(lesson => {
    if (!lessonsByPhase[lesson.phase]) {
      lessonsByPhase[lesson.phase] = [];
    }
    lessonsByPhase[lesson.phase].push(lesson);
  });

  const handleCardClick = (lessonId: string, isLocked: boolean) => {
    if (isLocked) {
      // Direct user to their current active lesson
      const activeLesson = filtered[activeIndex];
      if (activeLesson) {
        navigate(`/learn/${activeLesson.id}`);
      }
      return;
    }
    navigate(`/learn/${lessonId}`);
  };

  // Generate customized message for Sparky based on user progress
  const getSparkyMessage = () => {
    if (doneCount === 0) {
      return `Welcome to QuestAI, Agent! 🚀 I'm Sparky, your AI guide. Accept your first mission below to begin our tech adventure!`;
    }
    if (doneCount === totalCount) {
      return `BZZZ! UNBELIEVABLE! 🎓 You have completed all ${totalCount} missions! You are officially an AI Master! Try the weekly challenges next!`;
    }
    const currentLesson = filtered[activeIndex] || filtered[0];
    return `Welcome back, Agent! We've solved ${doneCount} missions together. Ready to tackle "${currentLesson.missionTitle || currentLesson.title}" next? Let's go!`;
  };

  return (
    <div className="min-h-full pb-20 bg-stars bg-[#0F0A2E] text-white">
      
      {/* GLOBAL PROGRESS HEADER */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-2 bg-[#0F0A2E]/95 backdrop-blur-md border-b-3 border-black">
        <div 
          className="p-3 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #16103A 100%)',
            border: '3px solid #FFD60A',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          {/* Progress Header Row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#FFD60A]" />
              <span className="font-game text-[10px] text-white uppercase tracking-wider">Mission Command</span>
            </div>
            <div className="font-pixel text-[6px] text-[#FFD60A] bg-[#FFD60A]/10 px-2 py-0.5 border border-[#FFD60A]/20">
              {doneCount} / {totalCount} CRUSHED
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center mb-2">
            <div className="bg-black/35 border border-white/5 py-1 px-0.5">
              <div className="font-pixel text-[5px] text-white/40 uppercase">RANK</div>
              <div className="font-game text-[10px] text-white truncate">{getLevelTitle(level)}</div>
              <div className="font-pixel text-[5px] text-[#A78BFA] mt-0.5">Lv {level}</div>
            </div>
            <div className="bg-black/35 border border-white/5 py-1 px-0.5">
              <div className="font-pixel text-[5px] text-white/40 uppercase">TOTAL ENERGY</div>
              <div className="font-game text-[10px] text-warning truncate">⚡ {totalXp} XP</div>
              <div className="font-pixel text-[5px] text-white/30 mt-0.5">Loot</div>
            </div>
            <div className="bg-black/35 border border-white/5 py-1 px-0.5">
              <div className="font-pixel text-[5px] text-white/40 uppercase">STREAK</div>
              <div className="font-game text-[10px] text-orange-400 truncate">{streak} Days</div>
              <div className="font-pixel text-[5px] text-white/30 mt-0.5">Active 🔥</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-0.5">
            <div className="flex justify-between items-baseline text-[7px] font-pixel text-[#FFD60A]">
              <span>CURRICULUM UNLOCKED</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full h-3 bg-[#0F0A2E] border-2 border-black p-[2px] flex items-center">
              <div 
                className="h-full bg-gradient-to-r from-[#FFD60A] to-[#F59E0B] transition-all duration-800 ease-out" 
                style={{ width: `${percent}%` }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* SPARKY mascot welcome banner */}
      <div className="px-4 pt-4">
        <div 
          className="p-3 mb-4 flex items-center gap-3 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #110B30 100%)',
            border: '2.5px solid #7C3AED',
            boxShadow: '3px 3px 0px #000',
          }}
        >
          <AICompanion 
            state={doneCount === totalCount ? 'celebrating' : doneCount === 0 ? 'welcome' : 'idle'}
            message={getSparkyMessage()}
            name="SPARKY"
            size="sm"
            showBubble={true}
          />
        </div>
      </div>

      {/* VIEW TOGGLE */}
      <div className="px-4 mb-5 flex gap-2">
        <button
          onClick={() => setViewMode('journey')}
          className={`flex-1 flex items-center justify-center gap-1.5 font-game text-[10px] uppercase py-2 border-3 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
            viewMode === 'journey' 
              ? 'bg-[#7C3AED] text-white' 
              : 'bg-[#1E1B4B] text-white/50 hover:text-white/80'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          Adventure Map
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`flex-1 flex items-center justify-center gap-1.5 font-game text-[10px] uppercase py-2 border-3 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
            viewMode === 'grid' 
              ? 'bg-[#7C3AED] text-white' 
              : 'bg-[#1E1B4B] text-white/50 hover:text-white/80'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Grid View
        </button>
      </div>

      <div className="px-4">
        {/* EMPTY STATE */}
        {doneCount === 0 && (
          <motion.div 
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 p-4 text-center border-4 border-dashed border-[#7C3AED] bg-[#7C3AED]/5 relative z-10"
            style={{ boxShadow: '4px 4px 0px #000' }}
          >
            <div className="text-4xl animate-bounce mb-2">🚀</div>
            <h2 className="font-game text-sm text-white uppercase tracking-wider">Unlock Your Potential</h2>
            <p className="text-white/60 font-body text-xs mt-1 max-w-xs mx-auto leading-relaxed">
              Launch your first interactive mission, train custom classifiers, and program AI companions!
            </p>
            <button
              onClick={() => navigate(`/learn/${filtered[0]?.id}`)}
              className="mt-3.5 px-5 py-2 bg-[#FFD60A] text-black font-game text-xs uppercase border-3 border-black shadow-[3px_3px_0px_#000] hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Start Mission 1 ⚡
            </button>
          </motion.div>
        )}

        {/* CURRICULUM MAP */}
        {viewMode === 'journey' ? (
          <div className="space-y-6">
            {PHASES.map(phase => {
              const phaseLessons = lessonsByPhase[phase.id];
              if (!phaseLessons || phaseLessons.length === 0) return null;

              // Check if previous phase is fully completed to enforce gating
              const prevPhaseLessons = Object.entries(lessonsByPhase)
                .filter(([pId]) => parseInt(pId, 10) < phase.id)
                .flatMap(([, les]) => les);
              
              const isPhaseLocked = prevPhaseLessons.some(l => !completedIds.includes(l.id));

              return (
                <div key={phase.id} className="space-y-3">
                  {/* PHASE WORLD HEADER */}
                  <div 
                    className="p-3 flex items-center justify-between border-2 border-black"
                    style={{
                      background: isPhaseLocked ? '#1A1829' : 'linear-gradient(90deg, #1E1B4B 0%, #16103A 100%)',
                      boxShadow: '3px 3px 0px #000',
                      borderLeftWidth: '6px',
                      borderLeftColor: isPhaseLocked ? '#4B5563' : '#7C3AED',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{phase.emoji}</span>
                      <div>
                        <h2 className="font-game text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                          WORLD {phase.id}: {phase.title}
                          {isPhaseLocked && <Lock className="w-3 h-3 text-white/40" />}
                        </h2>
                        <p className="font-body text-[10px] text-white/50">{phase.description}</p>
                      </div>
                    </div>
                    {isPhaseLocked ? (
                      <span className="font-pixel text-[5px] text-red-400 bg-red-950/20 border border-red-900/30 px-1.5 py-0.5">LOCKED</span>
                    ) : (
                      <span className="font-pixel text-[5px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5">OPEN</span>
                    )}
                  </div>

                  {/* LESSONS IN THIS PHASE */}
                  <div className="pl-2 space-y-4 border-l-2 border-white/5 relative">
                    {phaseLessons.map((lesson, idx) => {
                      const isDone = completedIds.includes(lesson.id);
                      // Lesson lock logic
                      const lIdx = filtered.findIndex(l => l.id === lesson.id);
                      const isLocked = isPhaseLocked || (lIdx > activeIndex && activeIndex !== -1);
                      const isActive = lIdx === activeIndex;
                      
                      const steps = getStepStatus(lesson);
                      const duration = parseInt(lesson.videoDuration || '5', 10) + 
                                       parseInt(lesson.labDuration || '8', 10) + 
                                       parseInt(lesson.projectDuration || '5', 10);

                      return (
                        <div key={lesson.id} className="relative flex gap-3">
                          {/* Indicator circle */}
                          <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                            <motion.div
                              whileHover={!isLocked ? { scale: 1.15 } : {}}
                              onClick={() => handleCardClick(lesson.id, isLocked)}
                              className={`w-8 h-8 border-2 border-black flex items-center justify-center text-xs cursor-pointer ${
                                isDone ? 'bg-[#10B981] text-white' :
                                isActive ? 'bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] text-white shadow-[0_0_12px_rgba(124,58,237,0.5)]' :
                                'bg-slate-800 text-white/30'
                              }`}
                            >
                              {isDone ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : isLocked ? (
                                <Lock className="w-3 h-3" />
                              ) : (
                                <Play className="w-3 h-3 text-white fill-white" />
                              )}
                            </motion.div>
                          </div>

                          {/* Lesson Card */}
                          <div className="flex-1 min-w-0">
                            <motion.div
                              whileHover={!isLocked ? { y: -2, scale: 1.01 } : {}}
                              onClick={() => handleCardClick(lesson.id, isLocked)}
                              className={`relative p-3.5 border-2 border-black transition-all flex flex-col justify-between overflow-hidden cursor-pointer ${
                                isDone ? 'bg-[#1E1B4B]/60 opacity-60' :
                                isActive ? 'bg-gradient-to-br from-[#1E1B4B] to-[#251E5C] border-[#FFD60A] shadow-[3px_3px_0px_#000]' :
                                'bg-[#151036]'
                              }`}
                              style={{
                                boxShadow: isActive ? '3px 3px 0px #FFD60A' : '3px 3px 0px #000',
                              }}
                            >
                              {/* Active Glow Bar */}
                              {isActive && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-[#FFD60A] animate-pulse" />
                              )}

                              <div className="flex items-start justify-between gap-1 mb-1">
                                <div>
                                  {/* Mission Emoji + Title */}
                                  <div className="flex items-center gap-1">
                                    <span className="text-base">{lesson.missionEmoji || lesson.emoji}</span>
                                    <h3 className="font-game text-xs text-white leading-snug uppercase tracking-wide">
                                      {lesson.missionTitle || lesson.title}
                                    </h3>
                                  </div>
                                  {/* Curiosity Hook */}
                                  <p className="font-body text-[10px] text-purple-300 italic mt-1 leading-relaxed">
                                    "{lesson.curiosityHook || lesson.description}"
                                  </p>
                                </div>
                                {isDone && (
                                  <span className="font-pixel text-[5px] text-[#10B981] bg-[#10B981]/10 px-1 py-0.5 border border-[#10B981]/20">CRUSHED</span>
                                )}
                              </div>

                              {/* Watch -> Lab -> Create Step Status */}
                              {!isLocked && (
                                <div className="mt-3 grid grid-cols-3 gap-1 border-t border-white/5 pt-2 text-center text-[8px] font-pixel">
                                  <div className={`py-1 border border-black flex items-center justify-center gap-1 ${steps.watch ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/35' : 'bg-black/25 text-white/40 border-white/5'}`}>
                                    🎥 Watch {steps.watch && '✓'}
                                  </div>
                                  <div className={`py-1 border border-black flex items-center justify-center gap-1 ${steps.lab ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/35' : 'bg-black/25 text-white/40 border-white/5'}`}>
                                    🧪 Lab {steps.lab && '✓'}
                                  </div>
                                  <div className={`py-1 border border-black flex items-center justify-center gap-1 ${steps.project ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/35' : 'bg-black/25 text-white/40 border-white/5'}`}>
                                    🛠️ Create {steps.project && '✓'}
                                  </div>
                                </div>
                              )}

                              {/* Lesson stats footer */}
                              <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-2.5">
                                  <span className="text-white/50 font-pixel text-[5px] flex items-center gap-1">
                                    ⏱️ {duration} min adventure
                                  </span>
                                  <span className="font-pixel text-[5px] flex items-center gap-0.5 text-[#FFD60A]">
                                    ⚡ +{lesson.xpReward} XP
                                  </span>
                                </div>
                                <span className="text-white/30 font-pixel text-[4px] uppercase tracking-wider">
                                  {lesson.aiLab?.type?.replace('-lab', '') || 'lab'} • {lesson.microProject?.type || 'project'}
                                </span>
                              </div>

                              {/* Gated locked message */}
                              {isLocked && (
                                <div className="mt-2.5 flex items-center gap-1 font-pixel text-[5px] text-white/30 bg-black/20 p-1 border border-white/5 uppercase">
                                  <AlertCircle className="w-2.5 h-2.5" />
                                  <span>Complete previous mission to unlock</span>
                                </div>
                              )}
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* GRID VIEW LAYOUT */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((lesson, idx) => {
              const isDone = completedIds.includes(lesson.id);
              const isLocked = idx > activeIndex && activeIndex !== -1;
              const isActive = idx === activeIndex;
              const steps = getStepStatus(lesson);
              const duration = parseInt(lesson.videoDuration || '5', 10) + 
                               parseInt(lesson.labDuration || '8', 10) + 
                               parseInt(lesson.projectDuration || '5', 10);

              return (
                <motion.div
                  key={lesson.id}
                  whileHover={!isLocked ? { scale: 1.01 } : {}}
                  onClick={() => handleCardClick(lesson.id, isLocked)}
                  className={`relative p-4 border-2 border-black flex flex-col justify-between overflow-hidden cursor-pointer ${
                    isDone ? 'bg-[#1E1B4B]/60 opacity-60' :
                    isActive ? 'bg-[#1E1B4B] border-[#FFD60A] shadow-[3px_3px_0px_#FFD60A]' :
                    'bg-[#151036]'
                  }`}
                  style={{
                    boxShadow: isActive ? '3px 3px 0px #FFD60A' : '3px 3px 0px #000',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-pixel text-[5px] text-[#A78BFA] uppercase">
                        Module {idx + 1}
                      </span>
                      {isActive && (
                        <span className="font-pixel text-[5px] text-white bg-[#7C3AED] px-1 py-0.5 border border-black">
                          ACTIVE
                        </span>
                      )}
                      {isDone && (
                        <span className="font-pixel text-[5px] text-[#10B981] bg-[#10B981]/10 px-1 py-0.5 border border-[#10B981]/20">DONE</span>
                      )}
                    </div>

                    <h3 className="font-game text-xs text-white uppercase tracking-wide truncate">{lesson.missionTitle || lesson.title}</h3>
                    <p className="text-white/40 font-body text-[10px] mt-1.5 italic">"{lesson.curiosityHook || lesson.description}"</p>
                  </div>

                  <div className="mt-4">
                    {/* Watch, Lab, Create Indicator */}
                    {!isLocked && (
                      <div className="grid grid-cols-3 gap-1 mb-3 text-center text-[7px] font-pixel">
                        <div className={`py-0.5 border ${steps.watch ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20' : 'bg-black/20 text-white/30 border-white/5'}`}>🎥 Watch</div>
                        <div className={`py-0.5 border ${steps.lab ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20' : 'bg-black/20 text-white/30 border-white/5'}`}>🧪 Lab</div>
                        <div className={`py-0.5 border ${steps.project ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20' : 'bg-black/20 text-white/30 border-white/5'}`}>🛠️ Create</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-white/50 font-pixel text-[5px] pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1">⏱️ {duration} min</span>
                      <span className="flex items-center gap-0.5 text-[#FFD60A]"><Zap className="w-3 h-3 text-[#FFD60A]" /> +{lesson.xpReward} XP</span>
                    </div>

                    {isLocked && (
                      <div className="mt-2 flex items-center gap-1 text-red-400 font-pixel text-[5px] bg-red-950/10 border border-red-900/30 p-1 uppercase">
                        <Lock className="w-2.5 h-2.5" />
                        <span>Module {idx} Locked</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
