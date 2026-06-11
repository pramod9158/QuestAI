import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRICULUM, PHASES, type Lesson } from '@/data/curriculum';
import { Lock, Play, CheckCircle, Zap, Calendar, Trophy, Flame, Map, LayoutGrid, AlertCircle, Sparkles } from 'lucide-react';
import { getPlatformProgress, getLevel } from '@/lib/gamification';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { AICompanion } from '@/components/ui/AICompanion';
import { useThemeStyles } from '@/lib/useThemeStyles';

export default function Learn() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const ts = useThemeStyles();
  const D = ts.duo;
  const [searchParams, setSearchParams] = useSearchParams();
  const [lockedTarget, setLockedTarget] = useState<Lesson | null>(null);
  const [lockedActive, setLockedActive] = useState<Lesson | null>(null);

  useEffect(() => {
    const isLocked = searchParams.get('locked') === 'true';
    if (isLocked) {
      const targetId = searchParams.get('target');
      const activeId = searchParams.get('active');
      const targetL = CURRICULUM.find(l => l.id === targetId);
      const activeL = CURRICULUM.find(l => l.id === activeId);
      if (targetL) setLockedTarget(targetL);
      if (activeL) setLockedActive(activeL);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const userZone = profile?.zone || 'junior';
  const completedIds: string[] = profile?.completed_lessons || [];
  const filtered = CURRICULUM.filter(l => (l.zone === userZone || l.zone === 'both') && l.phase !== 3 && l.phase !== 8 && l.phase !== 2);
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

  const activeIndex = filtered.findIndex(l => !completedIds.includes(l.id));

  const getStepStatus = (lesson: Lesson) => {
    const isCompleted = completedIds.includes(lesson.id);
    if (isCompleted) return { watch: true, lab: true, project: true };
    return {
      watch: localStorage.getItem(`lesson_${lesson.id}_watch`) === 'true',
      lab: localStorage.getItem(`lesson_${lesson.id}_lab`) === 'true',
      project: localStorage.getItem(`lesson_${lesson.id}_project`) === 'true',
    };
  };

  const lessonsByPhase: Record<number, Lesson[]> = {};
  filtered.forEach(lesson => {
    if (!lessonsByPhase[lesson.phase]) lessonsByPhase[lesson.phase] = [];
    lessonsByPhase[lesson.phase].push(lesson);
  });

  const handleCardClick = (lessonId: string, isLocked: boolean) => {
    if (isLocked) {
      const clickedL = CURRICULUM.find(l => l.id === lessonId);
      const activeL = filtered[activeIndex];
      if (clickedL) setLockedTarget(clickedL);
      if (activeL) setLockedActive(activeL);
      return;
    }
    navigate(`/learn/${lessonId}`);
  };

  const getSparkyMessage = () => {
    if (doneCount === 0) return `Welcome to QuestAI, Agent! 🚀 I'm Sparky, your AI guide. Accept your first mission below to begin our tech adventure!`;
    if (doneCount === totalCount) return `BZZZ! UNBELIEVABLE! 🎓 You have completed all ${totalCount} missions! You are officially an AI Master! Try the weekly challenges next!`;
    const currentLesson = filtered[activeIndex] || filtered[0];
    return `Welcome back, Agent! We've solved ${doneCount} missions together. Ready to tackle "${currentLesson.missionTitle || currentLesson.title}" next? Let's go!`;
  };

  return (
    <div
      className={D ? '' : 'min-h-full pb-20 bg-stars bg-[#0F0A2E] text-white'}
      style={D ? { minHeight: '100%', paddingBottom: 80, background: '#F5F5F5' } : {}}
    >
      {/* GLOBAL PROGRESS HEADER */}
      <div
        className={D ? '' : 'sticky top-0 z-30 px-4 pt-3 pb-2 bg-[#0F0A2E]/95 backdrop-blur-md border-b-3 border-black'}
        style={D ? { position: 'sticky', top: 0, zIndex: 30, padding: '12px 16px 10px', background: '#FFFFFF', borderBottom: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' } : {}}
      >
        <div
          className={D ? '' : 'p-3 relative overflow-hidden'}
          style={D ? { padding: '12px 16px' } : {
            background: 'linear-gradient(135deg, #1E1B4B 0%, #16103A 100%)',
            border: '3px solid #FFD60A',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          {/* Header Row */}
          <div className="flex items-center justify-between" style={{ borderBottom: D ? '1px solid #F0F0F0' : '1px solid rgba(255,255,255,0.1)', paddingBottom: 8, marginBottom: 8 }}>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{ color: D ? '#C8960C' : '#FFD60A' }} />
              <span style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : 10, color: D ? '#000' : '#fff', textTransform: 'uppercase', letterSpacing: D ? 0.5 : undefined }}>
                Mission Command
              </span>
            </div>
            <div style={D ? {
              fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 11,
              color: '#5FCC5F', background: '#F0FFF4', border: '1px solid #BBF7D0',
              borderRadius: 999, padding: '2px 10px',
            } : {
              fontFamily: '"Press Start 2P", monospace', fontSize: 6,
              color: '#FFD60A', background: 'rgba(255,214,10,0.1)',
              border: '1px solid rgba(255,214,10,0.2)', padding: '2px 8px',
            }}>
              {doneCount} / {totalCount} CRUSHED
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center" style={{ marginBottom: 8 }}>
            {[
              { label: 'RANK', value: getLevelTitle(level), sub: `Lv ${level}`, subColor: D ? '#8B5CF6' : '#A78BFA' },
              { label: 'TOTAL ENERGY', value: `⚡ ${totalXp} XP`, sub: 'Loot', subColor: D ? '#999999' : 'rgba(255,255,255,0.3)' },
              { label: 'STREAK', value: `${streak} Days`, sub: 'Active 🔥', subColor: D ? '#999999' : 'rgba(255,255,255,0.3)' },
            ].map(s => (
              <div key={s.label} style={D ? {
                background: '#F8F8F8', border: '1px solid #EEEEEE',
                borderRadius: 8, padding: '6px 4px',
              } : {
                background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 2px',
              }}>
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 9 : 5, color: D ? '#999' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 11 : 10, color: D ? '#000' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 9 : 5, color: s.subColor, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 10 : 7, fontWeight: D ? 700 : undefined, color: D ? '#5FCC5F' : '#FFD60A' }}>
                {D ? 'Curriculum Unlocked' : 'CURRICULUM UNLOCKED'}
              </span>
              <span style={{ fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 10 : 7, fontWeight: D ? 700 : undefined, color: D ? '#5FCC5F' : '#FFD60A' }}>{percent}%</span>
            </div>
            <div style={D ? {
              height: 10, background: '#E0E0E0', borderRadius: 999, overflow: 'hidden',
            } : {
              height: 12, background: '#0F0A2E', border: '2px solid #000', padding: '2px', display: 'flex', alignItems: 'center',
            }}>
              <div style={D ? {
                width: `${percent}%`, height: '100%',
                background: 'linear-gradient(90deg, #5FCC5F, #1EBC6B)',
                borderRadius: 999, transition: 'width 0.8s ease',
              } : {
                width: `${percent}%`, height: '100%',
                background: 'linear-gradient(90deg, #FFD60A, #F59E0B)',
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* SPARKY / OWL COMPANION BANNER */}
      <div className="px-4 pt-4">
        <div
          className="p-3 mb-4 flex items-center gap-3 relative overflow-hidden"
          style={D ? {
            background: '#FFFFFF',
            border: '1.5px solid #C4B5FD',
            borderRadius: 14,
            boxShadow: '0 2px 10px rgba(139,92,246,0.1)',
          } : {
            background: 'linear-gradient(135deg, #1E1B4B 0%, #110B30 100%)',
            border: '2.5px solid #7C3AED',
            boxShadow: '3px 3px 0px #000',
          }}
        >
          <AICompanion
            state={doneCount === totalCount ? 'celebrating' : doneCount === 0 ? 'welcome' : 'idle'}
            message={getSparkyMessage()}
            name={D ? 'QUEST OWL' : 'SPARKY'}
            size="sm"
            showBubble={true}
          />
        </div>
      </div>

      <div className="px-4">
        {/* Empty state */}
        {doneCount === 0 && (
          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-6 p-4 text-center relative z-10"
            style={D ? {
              background: '#FFFFFF',
              border: '1.5px dashed #C4B5FD',
              borderRadius: 16,
              boxShadow: '0 2px 8px rgba(124,58,237,0.08)',
            } : {
              border: '4px dashed #7C3AED',
              background: 'rgba(124,58,237,0.05)',
              boxShadow: '4px 4px 0px #000',
            }}
          >
            <div className="text-4xl animate-bounce mb-2">🚀</div>
            <h2 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 900 : undefined, fontSize: D ? 16 : undefined }}
                className={D ? '' : 'font-game text-sm text-white uppercase tracking-wider'}
            >
              {D ? 'Unlock Your Potential!' : 'Unlock Your Potential'}
            </h2>
            <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 13 : undefined, lineHeight: 1.6 }}
               className={D ? 'mt-1 max-w-xs mx-auto' : 'text-white/60 font-body text-xs mt-1 max-w-xs mx-auto leading-relaxed'}
            >
              Launch your first interactive mission, train custom classifiers, and program AI companions!
            </p>
            <button
              onClick={() => navigate(`/learn/${filtered[0]?.id}`)}
              style={D ? {
                marginTop: 14, padding: '10px 24px',
                background: '#5FCC5F', color: '#000',
                border: 'none', borderRadius: 12,
                fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 13,
                boxShadow: '0 4px 0px rgba(0,0,0,0.12)', cursor: 'pointer',
              } : {}}
              className={D ? '' : 'mt-3.5 px-5 py-2 bg-[#FFD60A] text-black font-game text-xs uppercase border-3 border-black shadow-[3px_3px_0px_#000] hover:bg-amber-300 transition-colors cursor-pointer'}
            >
              {D ? '🚀 Start First Mission' : 'Start Mission 1 ⚡'}
            </button>
          </motion.div>
        )}

        {/* Curriculum Map */}
        <div className="space-y-6">
          {PHASES.filter(p => lessonsByPhase[p.id] && lessonsByPhase[p.id].length > 0).map((phase, idx) => {
            const phaseLessons = lessonsByPhase[phase.id];
            const prevPhaseLessons = Object.entries(lessonsByPhase)
              .filter(([pId]) => parseInt(pId, 10) < phase.id)
              .flatMap(([, les]) => les);
            const isPhaseLocked = prevPhaseLessons.some(l => !completedIds.includes(l.id));

            return (
              <div key={phase.id} className="space-y-3">
                {/* Phase Header */}
                <div
                  className="p-3 flex items-center justify-between"
                  style={D ? {
                    background: isPhaseLocked ? '#F8F8F8' : '#FFFFFF',
                    border: `1.5px solid ${isPhaseLocked ? '#E0E0E0' : '#C4B5FD'}`,
                    borderLeft: `5px solid ${isPhaseLocked ? '#D1D5DB' : '#8B5CF6'}`,
                    borderRadius: 12,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  } : {
                    background: isPhaseLocked ? '#1A1829' : 'linear-gradient(90deg, #1E1B4B 0%, #16103A 100%)',
                    border: '2px solid #000',
                    borderLeft: `6px solid ${isPhaseLocked ? '#4B5563' : '#7C3AED'}`,
                    boxShadow: '3px 3px 0px #000',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{phase.emoji}</span>
                    <div>
                      <h2 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 6 }}
                          className={D ? '' : 'font-game text-xs text-white uppercase tracking-wider flex items-center gap-1.5'}
                      >
                        {D ? `World ${idx + 1}: ${phase.title}` : `WORLD ${idx + 1}: ${phase.title}`}
                        {isPhaseLocked && <Lock className="w-3 h-3" style={{ color: D ? '#9CA3AF' : 'rgba(255,255,255,0.4)' }} />}
                      </h2>
                      <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : 10 }}
                         className={D ? '' : 'font-body text-[10px] text-white/50'}
                      >
                        {phase.description}
                      </p>
                    </div>
                  </div>
                  {isPhaseLocked ? (
                    <span style={D ? {
                      fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10,
                      color: '#EF4444', background: '#FFF5F5',
                      border: '1px solid #FCA5A5', borderRadius: 999, padding: '2px 8px',
                    } : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#F87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 6px' }}>
                      LOCKED
                    </span>
                  ) : (
                    <span style={D ? {
                      fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10,
                      color: '#5FCC5F', background: '#F0FFF4',
                      border: '1px solid #BBF7D0', borderRadius: 999, padding: '2px 8px',
                    } : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#34D399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 6px' }}>
                      OPEN
                    </span>
                  )}
                </div>

                {/* Lessons */}
                <div className="pl-2 space-y-4" style={{ borderLeft: D ? '2px solid #E0E0E0' : '2px solid rgba(255,255,255,0.05)' }}>
                  {phaseLessons.map((lesson) => {
                    const isDone = completedIds.includes(lesson.id);
                    const lIdx = filtered.findIndex(l => l.id === lesson.id);
                    const isLocked = isPhaseLocked || (lIdx > activeIndex && activeIndex !== -1);
                    const isActive = lIdx === activeIndex;
                    const steps = getStepStatus(lesson);
                    const duration = parseInt(lesson.videoDuration || '5', 10) +
                                    parseInt(lesson.labDuration || '8', 10) +
                                    parseInt(lesson.projectDuration || '5', 10);

                    return (
                      <div key={lesson.id} className="relative flex gap-3">
                        {/* Indicator dot */}
                        <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                          <motion.div
                            whileHover={!isLocked ? { scale: 1.15 } : {}}
                            onClick={() => handleCardClick(lesson.id, isLocked)}
                            className="w-8 h-8 flex items-center justify-center text-xs cursor-pointer"
                            style={D ? {
                              background: isDone ? '#5FCC5F' : isActive ? '#8B5CF6' : '#E0E0E0',
                              border: `2px solid ${isDone ? '#5FCC5F' : isActive ? '#8B5CF6' : '#D1D5DB'}`,
                              borderRadius: '50%',
                              boxShadow: isActive ? '0 0 12px rgba(139,92,246,0.4)' : 'none',
                            } : {
                              background: isDone ? '#10B981' : isActive ? undefined : '#1E293B',
                              backgroundImage: isActive ? 'linear-gradient(135deg, #7C3AED, #3B82F6)' : undefined,
                              border: '2px solid #000',
                              boxShadow: isActive ? '0 0 12px rgba(124,58,237,0.5)' : 'none',
                            }}
                          >
                            {isDone ? (
                              <CheckCircle className="w-4 h-4" style={{ color: D ? '#fff' : '#fff' }} />
                            ) : isLocked ? (
                              <Lock className="w-3 h-3" style={{ color: D ? '#9CA3AF' : 'rgba(255,255,255,0.3)' }} />
                            ) : (
                              <Play className="w-3 h-3" style={{ color: '#fff' }} fill="#fff" />
                            )}
                          </motion.div>
                        </div>

                        {/* Lesson Card */}
                        <div className="flex-1 min-w-0">
                          <motion.div
                            whileHover={!isLocked ? { y: -2, scale: 1.01 } : {}}
                            onClick={() => handleCardClick(lesson.id, isLocked)}
                            className="relative p-3.5 transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
                            style={D ? {
                              background: isDone ? '#F8F8F8' : isActive ? '#FFFFFF' : '#FFFFFF',
                              border: isDone ? '1.5px solid #E0E0E0' : isActive ? '2px solid #8B5CF6' : '1.5px solid #E0E0E0',
                              borderRadius: 12,
                              boxShadow: isActive ? '0 4px 16px rgba(139,92,246,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                              opacity: isDone ? 0.7 : 1,
                            } : {
                              background: isDone ? 'rgba(30,27,75,0.6)' : isActive ? undefined : '#151036',
                              backgroundImage: isActive ? 'linear-gradient(135deg, #1E1B4B, #251E5C)' : undefined,
                              border: `2px solid ${isActive ? '#FFD60A' : '#000'}`,
                              boxShadow: isActive ? '3px 3px 0px #FFD60A' : '3px 3px 0px #000',
                              opacity: isDone ? 0.6 : 1,
                            }}
                          >
                            {/* Active glow bar */}
                            {isActive && (
                              <div className="absolute top-0 left-0 right-0 h-1 animate-pulse"
                                style={{ background: D ? '#8B5CF6' : '#FFD60A', borderRadius: D ? '12px 12px 0 0' : 0 }} />
                            )}

                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="text-base">{lesson.missionEmoji || lesson.emoji}</span>
                                  <h3 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : undefined }}
                                      className={D ? '' : 'font-game text-xs text-white leading-snug uppercase tracking-wide'}
                                  >
                                    {lesson.missionTitle || lesson.title}
                                  </h3>
                                </div>
                                <p style={D ? {
                                  color: '#8B5CF6', fontFamily: '"Nunito", sans-serif',
                                  fontStyle: 'italic', fontSize: 11, marginTop: 4, lineHeight: 1.5,
                                } : {}}
                                  className={D ? '' : 'font-body text-[10px] text-purple-300 italic mt-1 leading-relaxed'}
                                >
                                  "{lesson.curiosityHook || lesson.description}"
                                </p>
                              </div>
                              {isDone && (
                                <span style={D ? {
                                  fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10,
                                  color: '#5FCC5F', background: '#F0FFF4',
                                  border: '1px solid #BBF7D0', borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap',
                                } : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 4px' }}>
                                  {D ? '✅ Done' : 'CRUSHED'}
                                </span>
                              )}
                            </div>

                            {/* Step status */}
                            {!isLocked && (
                              <div className="mt-3 grid grid-cols-3 gap-1 pt-2" style={{ borderTop: `1px solid ${ts.divider}` }}>
                                {[
                                  { key: 'watch', done: steps.watch, label: '🎥 Watch' },
                                  { key: 'lab', done: steps.lab, label: '🧪 Lab' },
                                  { key: 'project', done: steps.project, label: '🛠️ Create' },
                                ].map(step => (
                                  <div key={step.key}
                                    className="py-1 flex items-center justify-center gap-1 text-center text-[8px]"
                                    style={D ? {
                                      background: step.done ? '#F0FFF4' : '#F8F8F8',
                                      border: `1px solid ${step.done ? '#BBF7D0' : '#E0E0E0'}`,
                                      borderRadius: 6,
                                      color: step.done ? '#5FCC5F' : '#9CA3AF',
                                      fontFamily: '"Nunito", sans-serif',
                                      fontWeight: 700, fontSize: 10,
                                    } : {
                                      background: step.done ? 'rgba(16,185,129,0.15)' : 'rgba(0,0,0,0.25)',
                                      border: `1px solid ${step.done ? 'rgba(16,185,129,0.35)' : 'rgba(255,255,255,0.05)'}`,
                                      color: step.done ? '#10B981' : 'rgba(255,255,255,0.4)',
                                    }}
                                  >
                                    {step.label} {step.done && '✓'}
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Footer */}
                            <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: `1px solid ${ts.divider}` }}>
                              <div className="flex items-center gap-2.5">
                                <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 10 : 5 }}>
                                  ⏱️ {duration} min
                                </span>
                                <span style={{ color: D ? '#C8960C' : '#FFD60A', fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 10 : 5, fontWeight: D ? 700 : undefined }}>
                                  ⚡ +{lesson.xpReward} XP
                                </span>
                              </div>
                              <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 9 : 4, textTransform: 'uppercase' }}>
                                {lesson.aiLab?.type?.replace('-lab', '') || 'lab'} • {lesson.microProject?.type || 'project'}
                              </span>
                            </div>

                            {/* Locked warning */}
                            {isLocked && (
                              <div className="mt-2.5 flex items-center gap-1 p-1 uppercase"
                                style={D ? {
                                  background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 6,
                                  color: '#EF4444', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 10,
                                } : {
                                  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)',
                                  color: 'rgba(255,255,255,0.3)', fontFamily: '"Press Start 2P", monospace', fontSize: 5,
                                }}
                              >
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
      </div>

      {/* LOCKED MODAL */}
      <AnimatePresence>
        {lockedTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-sm space-y-5 text-center relative"
              style={ts.modal}
            >
              <div className="text-3xl">🔒</div>
              <div className="space-y-1">
                <h3 style={{ color: D ? '#EF4444' : '#F87171', fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 16 : 12, textTransform: 'uppercase' }}>
                  Mission Gated!
                </h3>
                <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 13 : 11, lineHeight: 1.6 }}>
                  You must complete your current active mission first to build the necessary AI skills before unlocking this path!
                </p>
              </div>

              <div className="p-3 text-left space-y-1" style={D ? { background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 10 } : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ color: '#EF4444', fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontWeight: D ? 700 : undefined, fontSize: D ? 10 : 5, textTransform: 'uppercase' }}>LOCKED TARGET:</div>
                <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : 12, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {lockedTarget.missionEmoji || lockedTarget.emoji} {lockedTarget.missionTitle || lockedTarget.title}
                </div>
              </div>

              {lockedActive && (
                <div className="p-3 text-left space-y-1" style={D ? { background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 10 } : { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <div style={{ color: '#5FCC5F', fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontWeight: D ? 700 : undefined, fontSize: D ? 10 : 5, textTransform: 'uppercase' }}>YOUR CURRENT ACTIVE MISSION:</div>
                  <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : 12, textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lockedActive.missionEmoji || lockedActive.emoji} {lockedActive.missionTitle || lockedActive.title}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                {lockedActive && (
                  <button
                    type="button"
                    onClick={() => { setLockedTarget(null); navigate(`/learn/${lockedActive.id}`); }}
                    style={D ? {
                      width: '100%', background: '#5FCC5F', color: '#000',
                      border: 'none', borderRadius: 12, padding: '13px',
                      fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 14,
                      boxShadow: '0 4px 0px rgba(0,0,0,0.15)', cursor: 'pointer',
                    } : {}}
                    className={D ? '' : 'w-full bg-[#FFD60A] text-black font-game text-xs py-3 border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer hover:bg-amber-300 transition-colors uppercase font-bold flex items-center justify-center gap-1'}
                  >
                    {D ? '⚡ Start Active Mission' : '⚡ Start Active Mission ⚡'}
                  </button>
                )}
                <button type="button" onClick={() => setLockedTarget(null)}
                  style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 13 : 12 }}
                  className="w-full text-center font-body text-xs hover:opacity-70 transition-colors cursor-pointer"
                >
                  Back to Map
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
