import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRICULUM } from '@/data/curriculum';
import { Lock, Play, CheckCircle, Zap, Calendar, Award, Trophy, Compass, Flame, Map, LayoutGrid, AlertCircle } from 'lucide-react';
import { getPlatformProgress, getLevel } from '@/lib/gamification';
import { useCurrentProfile } from '@/contexts/AuthContext';

export default function Learn() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  
  const [viewMode, setViewMode] = useState<'journey' | 'grid'>('journey');

  const userZone = profile?.zone || 'junior';
  const completedIds: string[] = profile?.completed_lessons || [];
  
  // Sort and filter the curriculum based on student zone
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

  const getDuration = (xp: number) => {
    if (xp <= 30) return '10 min';
    if (xp <= 45) return '15 min';
    return '20 min';
  };

  // Find the current active lesson index (first incomplete)
  const activeIndex = filtered.findIndex(l => !completedIds.includes(l.id));

  // Handler for ribbon retake replay logic
  const handleCardClick = (lessonId: string, isLocked: boolean) => {
    if (isLocked) {
      const activeLesson = filtered[activeIndex];
      if (activeLesson) {
        navigate(`/learn/${activeLesson.id}`);
      }
      return;
    }
    navigate(`/learn/${lessonId}`);
  };

  return (
    <div className="min-h-full pb-16 bg-stars bg-[#0F0A2E]">
      
      {/* ── REQUIREMENT 7: GLOBAL COURSE PROGRESS HEADER ── */}
      <div className="sticky top-0 z-30 px-5 pt-4 pb-3 bg-[#0F0A2E]/95 backdrop-blur-md border-b-3 border-black">
        <div 
          className="p-4 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #16103A 100%)',
            border: '3px solid #FFD60A',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#FFD60A]" />
              <span className="font-game text-xs text-white uppercase tracking-wider">Course Progress</span>
            </div>
            <div className="font-pixel text-[6px] text-[#FFD60A] bg-[#FFD60A]/10 px-2 py-0.5 border border-[#FFD60A]/20">
              {doneCount} / {totalCount} MODULES DONE
            </div>
          </div>

          {/* Stats details grid */}
          <div className="grid grid-cols-3 gap-2 text-center mb-2.5">
            <div className="bg-black/30 border border-white/5 py-1.5 px-1">
              <div className="font-pixel text-[5px] text-white/40 uppercase">LEVEL</div>
              <div className="font-game text-xs text-white mt-0.5 truncate">{getLevelTitle(level)}</div>
              <div className="font-pixel text-[5px] text-primary/80 mt-0.5">Lv {level}</div>
            </div>
            <div className="bg-black/30 border border-white/5 py-1.5 px-1">
              <div className="font-pixel text-[5px] text-white/40 uppercase">TOTAL XP</div>
              <div className="font-game text-xs text-warning mt-0.5 truncate">+{totalXp} XP</div>
              <div className="font-pixel text-[5px] text-white/30 mt-0.5">Earned</div>
            </div>
            <div className="bg-black/30 border border-white/5 py-1.5 px-1">
              <div className="font-pixel text-[5px] text-white/40 uppercase">STREAK</div>
              <div className="font-game text-xs text-red-400 mt-0.5 truncate">{streak} Days</div>
              <div className="font-pixel text-[5px] text-white/30 mt-0.5">Flame 🔥</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="flex justify-between items-baseline text-[7px] font-pixel text-[#FFD60A]">
              <span>COMPLETION RATE</span>
              <span>{percent}%</span>
            </div>
            <div className="w-full h-3.5 bg-[#0F0A2E] border-2 border-black p-[2px] flex items-center shadow-[inset_1px_1px_0px_#000]">
              <div 
                className="h-full bg-[#FFD60A] transition-all duration-800 ease-out" 
                style={{ 
                  width: `${percent}%`, 
                  backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(0,0,0,0.15) 4px, rgba(0,0,0,0.15) 6px)' 
                }} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Intro Text */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="font-pixel text-[9px] text-white flex items-center gap-2 tracking-wide uppercase">
          📚 {userZone === 'junior' ? 'JUNIOR EXPLORER ZONE' : 'FUTURE INNOVATOR ZONE'}
        </h1>
        <p className="text-white/45 font-body text-xs mt-1.5">
          {userZone === 'junior' 
            ? 'Start your adventure and learn how AI can make magic!' 
            : 'Master artificial intelligence through hands-on neural designs.'}
        </p>
      </div>

      {/* Toggle View Mode Buttons */}
      <div className="px-5 mb-6 flex gap-2">
        <button
          onClick={() => setViewMode('journey')}
          className={`flex-1 flex items-center justify-center gap-1.5 font-game text-xs py-2 border-3 border-black shadow-[2px_2px_0px_#000] transition-all ${
            viewMode === 'journey' 
              ? 'bg-[#7C3AED] text-white' 
              : 'bg-[#1E1B4B] text-white/50 hover:text-white/80'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          Journey Path
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={`flex-1 flex items-center justify-center gap-1.5 font-game text-xs py-2 border-3 border-black shadow-[2px_2px_0px_#000] transition-all ${
            viewMode === 'grid' 
              ? 'bg-[#7C3AED] text-white' 
              : 'bg-[#1E1B4B] text-white/50 hover:text-white/80'
          }`}
        >
          <LayoutGrid className="w-3.5 h-3.5" />
          Grid View
        </button>
      </div>

      <div className="px-5">
        {/* ── REQUIREMENT 9: EMPTY STATE FOR 0% PROGRESS ── */}
        {doneCount === 0 && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 p-6 text-center border-4 border-dashed border-[#7C3AED] bg-[#7C3AED]/10 relative z-10"
            style={{ boxShadow: '4px 4px 0px 0px #000' }}
          >
            <div className="text-5xl animate-bounce mb-3">🚀</div>
            <h2 className="font-game text-base text-white">Start Your AI Adventure</h2>
            <p className="text-white/60 font-body text-xs mt-1 max-w-xs mx-auto">
              Unlock the secrets of machine learning, train models, and design systems! Complete Module 1 to begin.
            </p>
            <button
              onClick={() => navigate(`/learn/${filtered[0]?.id}`)}
              className="mt-4 px-6 py-2.5 bg-warning text-black font-game text-xs uppercase border-3 border-black shadow-[3px_3px_0px_#000] hover:bg-amber-300 transition-colors cursor-pointer"
            >
              Start Module 1
            </button>
          </motion.div>
        )}

        {/* ── REQUIREMENT 9: CONGRATULATIONS STATE FOR 100% PROGRESS ── */}
        {doneCount === totalCount && (
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-8 p-5 text-center bg-[#10B981]/10 border-4 border-dashed border-[#10B981]"
            style={{ boxShadow: '4px 4px 0px 0px #000' }}
          >
            <div className="text-5xl mb-2">🎓</div>
            <h2 className="font-game text-base text-[#10B981] uppercase tracking-wide">Course Completed!</h2>
            <p className="text-white/80 font-body text-xs mt-1">
              Congratulations! You completed all 20 modules of the AI Explorer curriculum!
            </p>

            {/* Simulated certificate */}
            <div className="my-5 p-4 border-2 border-black bg-[#1E1B4B] text-center relative overflow-hidden shadow-pixel">
              <div className="absolute top-0 right-0 w-8 h-8 bg-[#FFD60A] rotate-45 transform translate-x-4 -translate-y-4 border border-black" />
              <div className="font-pixel text-[5px] text-[#FFD60A]">CERTIFICATE OF ACHIEVEMENT</div>
              <div className="font-game text-sm text-white mt-2">{profile?.username || 'Explorer'}</div>
              <p className="font-body text-[10px] text-white/50 mt-1 max-w-[200px] mx-auto leading-tight">
                Has successfully completed the interactive AI machine learning journey.
              </p>
              <div className="font-pixel text-[4px] text-white/30 mt-3 uppercase">QUESTAI PLATFORM</div>
            </div>
            
            <button
              onClick={() => navigate('/play/brainstorm')}
              className="px-5 py-2.5 bg-success text-white font-game text-xs uppercase border-3 border-black shadow-[3px_3px_0px_#000] hover:brightness-110 cursor-pointer"
            >
              Create New Inventions
            </button>
          </motion.div>
        )}

        {/* Curriculum modules rendering */}
        {viewMode === 'journey' ? (
          /* ── REQUIREMENT 6: LEARNING PATH JOURNEY VIEW ── */
          <div className="relative">
            {filtered.map((lesson, idx) => {
              const isDone = completedIds.includes(lesson.id);
              const isLocked = false; // Bypass locking
              const isActive = idx === activeIndex;
              const pVal = isDone ? 100 : parseInt(localStorage.getItem(`lesson_progress_${lesson.id}`) || '0', 10);
              const duration = getDuration(lesson.xpReward);
              const completedDate = localStorage.getItem(`lesson_completed_at_${lesson.id}`) || 'Recently';

              // Determine connecting line color leading to the next item
              let lineStatus: 'completed' | 'current' | 'locked' = 'locked';
              if (idx < activeIndex || activeIndex === -1) {
                lineStatus = 'completed';
              } else if (idx === activeIndex) {
                lineStatus = 'current';
              }

              return (
                <div key={lesson.id} className="flex gap-4">
                  
                  {/* Timeline connecting line segment & dots */}
                  <div className="flex flex-col items-center flex-shrink-0 relative">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-9 h-9 border-3 border-black flex items-center justify-center text-sm z-10 ${
                        isDone ? 'bg-success text-white' : 
                        isActive ? 'bg-[#7C3AED] text-white animate-pulse' : 
                        'bg-slate-800 text-white/30'
                      }`}
                      style={{ 
                        boxShadow: isDone ? '2px 2px 0px #000' : isActive ? '2px 2px 0px rgba(124,58,237,0.4)' : '2px 2px 0px #000',
                      }}
                    >
                      {isDone ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-white/30" />
                      ) : (
                        <Play className="w-3.5 h-3.5 text-white animate-pulse" fill="white" />
                      )}
                    </motion.div>
                    
                    {/* The connecting vertical path line */}
                    {idx < filtered.length - 1 && (
                      <div 
                        className={`journey-line-vertical w-1.5 flex-1 my-1.5 ${
                          lineStatus === 'completed' ? 'completed' : 
                          lineStatus === 'current' ? 'current' : 'locked'
                        }`}
                      />
                    )}
                  </div>

                  {/* Module card */}
                  <div className="flex-1 pb-6 min-w-0">
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03, duration: 0.3 }}
                      whileHover={!isLocked && !isDone ? { scale: 1.01, y: -2 } : {}}
                      onClick={() => handleCardClick(lesson.id, isLocked)}
                      className={`relative p-4 border-3 border-black overflow-hidden select-none transition-all flex flex-col justify-between ${
                        isDone ? 'bg-[#1E1B4B]/80 opacity-40 grayscale saturate-50' :
                        isActive ? 'module-card-active bg-[#1E1B4B]' :
                        'module-card-locked bg-[#16103A]'
                      }`}
                      style={{
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        boxShadow: isActive ? 'none' : isDone ? '2px 2px 0px 0px #000000' : '3px 3px 0px 0px #000000',
                      }}
                    >
                      {/* COMPLETED RIBBON OVERLAY */}
                      {isDone && (
                        <div className="completed-ribbon-container">
                          <div className="completed-ribbon">DONE</div>
                        </div>
                      )}

                      {/* Header tags */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-pixel text-[5px] text-[#00C2FF] uppercase tracking-wider">
                          Module {idx + 1}
                        </span>
                        
                        {/* Continue Learning status tag */}
                        {isActive && (
                          <span className="badge-pill bg-[#7C3AED] border-black text-white py-0.5 px-1.5">
                            Continue Learning
                          </span>
                        )}
                        {isDone && (
                          <span className="flex items-center gap-0.5 text-success font-game text-[9px] uppercase font-bold mr-12">
                            <CheckCircle className="w-3 h-3" /> Completed
                          </span>
                        )}
                      </div>

                      {/* Lesson title */}
                      <h3 className="font-game text-sm text-white leading-snug truncate pr-6">
                        {lesson.title}
                      </h3>
                      
                      {/* Description */}
                      <p className="text-white/40 font-body text-xs mt-1.5 line-clamp-2">
                        {lesson.description}
                      </p>

                      {/* Stats footer (Duration, XP) */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-white/50 font-pixel text-[5px] flex items-center gap-1">
                            ⏱️ {duration}
                          </span>
                          <span className="font-pixel text-[5px] flex items-center gap-0.5 text-[#F59E0B]">
                            <Zap className="w-3 h-3 text-[#F59E0B]" /> +{lesson.xpReward} XP
                          </span>
                        </div>
                        <span className="text-white/30 font-pixel text-[4px] uppercase tracking-wider">
                          {lesson.zone === 'junior' ? '🚀 JUNIOR' : lesson.zone === 'innovator' ? '🧠 INNOVATOR' : '🌍 ALL'}
                        </span>
                      </div>

                      {/* Progress bar */}
                      {!isLocked && (
                        <div className="mt-3">
                          <div className="flex justify-between items-center text-[7px] font-pixel text-white/30 mb-1">
                            <span>MODULE STATUS</span>
                            <span className={isDone ? 'text-success' : 'text-primary-light'}>{pVal}%</span>
                          </div>
                          <div className="w-full h-2 bg-[#0F0A2E] border border-black p-[1px] flex items-center">
                            <div 
                              className={`h-full ${isDone ? 'bg-success' : 'bg-[#7C3AED]'}`} 
                              style={{ width: `${pVal}%` }} 
                            />
                          </div>
                        </div>
                      )}

                      {/* Lock requirements */}
                      {isLocked && (
                        <div className="mt-3 flex items-center gap-1.5 text-red-400 font-pixel text-[5px] bg-red-950/20 border border-red-900/35 p-1.5 uppercase">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Complete Module {idx} to unlock</span>
                        </div>
                      )}

                      {/* Completion Date metadata */}
                      {isDone && completedDate && (
                        <div className="mt-2 text-white/30 font-pixel text-[4px] flex items-center gap-1 justify-end">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>{completedDate}</span>
                        </div>
                      )}
                    </motion.div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Grid View Layout (Req 10: responsive Grid) */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((lesson, idx) => {
              const isDone = completedIds.includes(lesson.id);
              const isLocked = false; // Bypass locking
              const isActive = idx === activeIndex;
              const pVal = isDone ? 100 : parseInt(localStorage.getItem(`lesson_progress_${lesson.id}`) || '0', 10);
              const duration = getDuration(lesson.xpReward);
              const completedDate = localStorage.getItem(`lesson_completed_at_${lesson.id}`) || 'Recently';

              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  whileHover={!isLocked && !isDone ? { scale: 1.01 } : {}}
                  onClick={() => handleCardClick(lesson.id, isLocked)}
                  className={`relative p-4 border-3 border-black overflow-hidden transition-all flex flex-col justify-between ${
                    isDone ? 'bg-[#1E1B4B]/80 opacity-40 grayscale saturate-50' :
                    isActive ? 'module-card-active bg-[#1E1B4B]' :
                    'module-card-locked bg-[#16103A]'
                  }`}
                  style={{
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    boxShadow: isActive ? 'none' : isDone ? '2px 2px 0px 0px #000000' : '3px 3px 0px 0px #000000',
                  }}
                >
                  {isDone && (
                    <div className="completed-ribbon-container">
                      <div className="completed-ribbon">DONE</div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-pixel text-[5px] text-[#00C2FF] uppercase">
                        Module {idx + 1}
                      </span>
                      {isActive && (
                        <span className="badge-pill bg-[#7C3AED] text-white py-0.5 px-1.5">
                          Active
                        </span>
                      )}
                      {isDone && (
                        <span className="flex items-center gap-0.5 text-success font-game text-[9px] uppercase font-bold mr-12">
                          <CheckCircle className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>

                    <h3 className="font-game text-sm text-white truncate pr-6">{lesson.title}</h3>
                    <p className="text-white/40 font-body text-xs mt-1 line-clamp-2">{lesson.description}</p>
                  </div>

                  <div className="mt-4">
                    {/* Stats */}
                    <div className="flex items-center justify-between text-white/50 font-pixel text-[5px] pt-2 border-t border-white/5">
                      <span className="flex items-center gap-1">⏱️ {duration}</span>
                      <span className="flex items-center gap-0.5 text-[#F59E0B]"><Zap className="w-3 h-3" /> +{lesson.xpReward} XP</span>
                    </div>

                    {/* Progress bar */}
                    {!isLocked && (
                      <div className="mt-3">
                        <div className="w-full h-1.5 bg-[#0F0A2E] border border-black p-[0.5px]">
                          <div className={`h-full ${isDone ? 'bg-success' : 'bg-[#7C3AED]'}`} style={{ width: `${pVal}%` }} />
                        </div>
                      </div>
                    )}

                    {/* Lock text */}
                    {isLocked && (
                      <div className="mt-3 flex items-center gap-1.5 text-red-400 font-pixel text-[5px] bg-red-950/20 border border-red-900/35 p-1 uppercase">
                        <Lock className="w-3 h-3 flex-shrink-0" />
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
