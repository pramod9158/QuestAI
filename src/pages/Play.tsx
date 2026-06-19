import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { PLAY_MODULES_DATA, type PlayModule } from '@/data/curriculum';
import { getPlatformProgress, getLevel } from '@/lib/gamification';
import { AICompanion } from '@/components/ui/AICompanion';
import { Lock, CheckCircle, Trophy, AlertCircle, Gamepad2, HelpCircle } from 'lucide-react';
import { useThemeStyles } from '@/lib/useThemeStyles';
import { ActivityHelpModal } from '@/components/ui/ActivityHelpModal';

const PLAY_MODULE_INSTRUCTIONS: Record<string, { steps: string[]; rewards: string }> = {
  '/play/quiz': {
    steps: [
      "Select Casual mode (no timer) or Time Attack (15s limit).",
      "Answer multiple choice questions on various AI topics.",
      "Submit your final answer and claim your XP rewards!"
    ],
    rewards: "⚡ Variable XP based on correct answers and speed"
  },
  '/play/inventor-hall': {
    steps: [
      "Explore the showcase of inventions uploaded by other students.",
      "Read their project names, descriptions, and solutions.",
      "Like and show support for community innovations!"
    ],
    rewards: "❤️ Community appreciation & design inspiration"
  },
  '/play/around-me': {
    steps: [
      "Select an AI discovery module (Smart Camera, Recycler, Sound Recognizer, gesture puppy).",
      "Use your device camera or microphone to capture real-world items.",
      "Train models or classify actions to solve the challenges!"
    ],
    rewards: "⚡ +15 to +30 XP upon solving observations"
  },
  '/play/story': {
    steps: [
      "Accept one of the 8 epic interactive text-based story quests.",
      "Read the dialogue carefully and explore choices.",
      "Debug system algorithms and make the right AI-ethical choices to finish the quest!"
    ],
    rewards: "⚡ +40 to +60 XP, story checkpoints"
  },
  '/play/detective': {
    steps: [
      "Examine case details containing photos, statements, or automated files.",
      "Deduce if AI can help solve the issue or spot deepfake scams.",
      "Read the educational summary to learn detective clues!"
    ],
    rewards: "⚡ +10 to +20 XP per solved case"
  },
  '/play/brainstorm': {
    steps: [
      "Construct a virtual AI prototype system.",
      "Set input tokens, define system logic parameters, and inspect outputs.",
      "Test custom instructions and adjust system boundaries."
    ],
    rewards: "⚡ +15 to +30 XP on valid blueprints"
  },
  '/play/idea-generator': {
    steps: [
      "Pick a local issue (like waste, farming, traffic, water).",
      "Explain the problem context to the generator helper.",
      "Get three structured AI solution templates and save your favorites!"
    ],
    rewards: "⚡ +15 XP on generating and saving ideas"
  },
  '/comic': {
    steps: [
      "Compose a multi-panel visual comic strip.",
      "Type creative image prompts to generate custom scene backgrounds.",
      "Write speech bubbles and narratives to tell a tech-related story!"
    ],
    rewards: "⚡ +20 XP on saving a completed comic"
  }
};

const PLAY_PHASES = [
  { id: 1, title: 'Foundation Fields', emoji: '🚀', description: 'Master the basics and explore key AI concepts.' },
  { id: 2, title: 'Explorer Domains', emoji: '🔍', description: 'Step into interactive scenarios and test your AI logic.' },
  { id: 3, title: 'Innovator Lands', emoji: '🛠️', description: 'Apply AI tools to real-world datasets and problems.' },
  { id: 4, title: 'Creator Frontiers', emoji: '🌌', description: 'Build advanced prototypes, design systems, and share your work.' },
];

export default function Play() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const ts = useThemeStyles();
  const D = ts.duo;
  const [searchParams, setSearchParams] = useSearchParams();
  const [lockedTarget, setLockedTarget] = useState<PlayModule | null>(null);
  const [lockedActive, setLockedActive] = useState<PlayModule | null>(null);
  const [helpModule, setHelpModule] = useState<PlayModule | null>(null);

  const userZone = profile?.zone || 'junior';
  const filtered = PLAY_MODULES_DATA.filter(mod => mod.zones.includes(userZone));
  const rawInventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]');
  const savedIdeas = JSON.parse(localStorage.getItem('saved_ideas') || '[]');

  const stats = getPlatformProgress(profile);
  const completedPlayCount = stats.completedPlay;
  const totalPlayPercent = stats.playPercent;
  const level = profile ? getLevel(profile.xp) : 1;
  const streak = profile?.current_streak || 0;
  const totalXp = profile?.xp || 0;

  const isModDone = (path: string) => {
    const mod = PLAY_MODULES_DATA.find(m => m.path === path);
    if (!mod) return false;
    const key = mod.completionKey;
    if (key === 'quests') return !!(profile?.completed_quests && profile.completed_quests.length > 0);
    if (key.startsWith('quests_')) {
      const qId = key.replace('quests_', '');
      return localStorage.getItem(`quests_${qId}`) === 'true' || !!(profile?.completed_quests && profile.completed_quests.includes(qId));
    }
    if (key === 'inventions') return rawInventions.length > 0 || localStorage.getItem('user_has_inventions') === 'true';
    if (key === 'ideas') return savedIdeas.length > 0;
    return localStorage.getItem(key) === 'true';
  };

  const activePlayIndex = filtered.findIndex(mod => !isModDone(mod.path));

  useEffect(() => {
    const isLocked = searchParams.get('locked') === 'true';
    if (isLocked) {
      const targetPath = searchParams.get('target');
      const activePath = searchParams.get('active');
      const targetMod = filtered.find(m => m.path === targetPath);
      const activeMod = filtered.find(m => m.path === activePath);
      if (targetMod) setLockedTarget(targetMod);
      if (activeMod) setLockedActive(activeMod);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, filtered]);

  const handleCardClick = (modPath: string, isLocked: boolean) => {
    if (isLocked) {
      const clickedMod = filtered.find(m => m.path === modPath);
      const activeMod = filtered[activePlayIndex];
      if (clickedMod) setLockedTarget(clickedMod);
      if (activeMod) setLockedActive(activeMod);
      return;
    }
    navigate(modPath);
  };

  const getLevelTitle = (lvl: number) => {
    if (lvl < 2) return 'Novice Explorer';
    if (lvl < 4) return 'AI Explorer';
    if (lvl < 6) return 'AI Scholar';
    return 'Future Innovator';
  };

  const getSparkyPlayMessage = () => {
    if (completedPlayCount === 0) return `Welcome to the Play Zone, Agent! 🎮 I'm Rio. Test your AI skills or create prototypes in the interactive play modules below!`;
    if (completedPlayCount === 20) return `BZZZ! AMAZING! 🏆 You have conquered all Play modules! You are a certified AI Master! Keep experimenting!`;
    const nextMod = filtered[activePlayIndex] || filtered[0];
    return `Welcome back, Agent! We've completed ${completedPlayCount} play missions. Ready to tackle "${nextMod.title}" next? Let's play!`;
  };

  const playStatusList = filtered.map((mod, i) => {
    const isDone = isModDone(mod.path);
    let percent = 0;
    const key = mod.completionKey;
    if (isDone) { percent = 100; }
    else if (key === 'quests') { percent = 0; }
    else if (key.startsWith('quests_')) { const qId = key.replace('quests_', ''); percent = parseInt(localStorage.getItem(`play_progress_story_${qId}`) || '0', 10); }
    else if (key === 'inventions') { percent = localStorage.getItem('play_progress_brainstorm') ? 50 : 0; }
    else if (key === 'ideas') { percent = localStorage.getItem('play_progress_idea-generator') ? 50 : 0; }
    else { const progKey = key.replace('play_completed_', 'play_progress_'); percent = parseInt(localStorage.getItem(progKey) || '0', 10); }

    return {
      ...mod,
      isDone,
      isLocked: activePlayIndex !== -1 && i > activePlayIndex,
      isActive: activePlayIndex !== -1 && i === activePlayIndex,
      percent,
    };
  });

  const getPhaseModules = (phaseId: number) => {
    const start = (phaseId - 1) * 5;
    return playStatusList.slice(start, start + 5);
  };

  const isPhaseLocked = (phaseId: number) => {
    if (activePlayIndex === -1) return false;
    return activePlayIndex < (phaseId - 1) * 5;
  };

  return (
    <div
      className={D ? '' : 'min-h-full pb-20 bg-stars bg-[#0F0A2E] text-white'}
      style={D ? { minHeight: '100%', paddingBottom: 80, background: '#F5F5F5' } : {}}
    >
      {/* GLOBAL PROGRESS HEADER */}
      <div
        style={D ? { position: 'sticky', top: 0, zIndex: 30, padding: '12px 16px 10px', background: '#FFFFFF', borderBottom: '1px solid #E0E0E0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }
             : { position: 'sticky', top: 0, zIndex: 30, padding: '12px 16px 8px', background: 'rgba(15,10,46,0.95)', backdropFilter: 'blur(12px)', borderBottom: '3px solid #000' }}
      >
        <div style={D ? { padding: '12px 16px' } : {
          background: 'linear-gradient(135deg, #1E1B4B 0%, #16103A 100%)',
          border: '3px solid #10B981', boxShadow: '4px 4px 0px #000', padding: 12,
        }}>
          <div className="flex items-center justify-between" style={{ borderBottom: D ? '1px solid #F0F0F0' : '1px solid rgba(255,255,255,0.1)', paddingBottom: 8, marginBottom: 8 }}>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4" style={{ color: D ? '#5FCC5F' : '#10B981' }} />
              <span style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 14 : 10, color: D ? '#000' : '#fff', textTransform: 'uppercase', letterSpacing: D ? 0.5 : undefined }}>
                Mission Control
              </span>
            </div>
            <div style={D ? {
              fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 11,
              color: '#5FCC5F', background: '#F0FFF4', border: '1px solid #BBF7D0',
              borderRadius: 999, padding: '2px 10px',
            } : {
              fontFamily: '"Press Start 2P", monospace', fontSize: 6,
              color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 8px',
            }}>
              {completedPlayCount} / 20 CONQUERED
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center" style={{ marginBottom: 8 }}>
            {[
              { label: 'RANK', value: getLevelTitle(level), sub: `Lv ${level}`, subColor: D ? '#8B5CF6' : '#A78BFA' },
              { label: 'TOTAL ENERGY', value: `⚡ ${totalXp} XP`, sub: 'Loot', subColor: D ? '#999999' : 'rgba(255,255,255,0.3)' },
              { label: 'STREAK', value: `${streak} Days`, sub: 'Active 🔥', subColor: D ? '#999999' : 'rgba(255,255,255,0.3)' },
            ].map(s => (
              <div key={s.label} style={D ? {
                background: '#F8F8F8', border: '1px solid #EEEEEE', borderRadius: 8, padding: '6px 4px',
              } : {
                background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.05)', padding: '4px 2px',
              }}>
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 9 : 5, color: D ? '#999' : 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{s.label}</div>
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 11 : 10, color: D ? '#000' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
                <div style={{ fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 9 : 5, color: s.subColor, marginTop: 2 }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 10 : 7, fontWeight: D ? 700 : undefined, color: D ? '#5FCC5F' : '#10B981' }}>
                {D ? 'Play Zone Completed' : 'PLAY ZONE COMPLETED'}
              </span>
              <span style={{ fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 10 : 7, fontWeight: D ? 700 : undefined, color: D ? '#5FCC5F' : '#10B981' }}>{totalPlayPercent}%</span>
            </div>
            <div style={D ? { height: 10, background: '#E0E0E0', borderRadius: 999, overflow: 'hidden' }
                       : { height: 12, background: '#0F0A2E', border: '2px solid #000', padding: '2px', display: 'flex', alignItems: 'center' }}>
              <div style={D ? {
                width: `${totalPlayPercent}%`, height: '100%',
                background: 'linear-gradient(90deg, #5FCC5F, #1EBC6B)', borderRadius: 999, transition: 'width 0.8s ease',
              } : {
                width: `${totalPlayPercent}%`, height: '100%',
                background: 'linear-gradient(90deg, #10B981, #059669)', transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        </div>
      </div>


      {/* Play Zone Map */}
      <div className="px-4">
        <div className="space-y-6">
          {PLAY_PHASES.map((phase) => {
            const phaseModules = getPhaseModules(phase.id);
            const isLocked = isPhaseLocked(phase.id);

            return (
              <div key={phase.id} className="space-y-3">
                {/* Phase Header */}
                <div className="p-3 flex items-center justify-between"
                  style={D ? {
                    background: isLocked ? '#F8F8F8' : '#FFFFFF',
                    border: `1.5px solid ${isLocked ? '#E0E0E0' : '#BBF7D0'}`,
                    borderLeft: `5px solid ${isLocked ? '#D1D5DB' : '#5FCC5F'}`,
                    borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  } : {
                    background: isLocked ? '#1A1829' : 'linear-gradient(90deg, #1E1B4B 0%, #16103A 100%)',
                    border: '2px solid #000',
                    borderLeft: `6px solid ${isLocked ? '#4B5563' : '#10B981'}`,
                    boxShadow: '3px 3px 0px #000',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{phase.emoji}</span>
                    <div>
                      <h2 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : undefined, display: 'flex', alignItems: 'center', gap: 6 }}
                          className={D ? '' : 'font-game text-xs text-white uppercase tracking-wider flex items-center gap-1.5'}
                      >
                        {D ? `World ${phase.id}: ${phase.title}` : `WORLD ${phase.id}: ${phase.title}`}
                        {isLocked && <Lock className="w-3 h-3" style={{ color: D ? '#9CA3AF' : 'rgba(255,255,255,0.4)' }} />}
                      </h2>
                      <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : 10 }}
                         className={D ? '' : 'font-body text-[10px] text-white/50'}
                      >
                        {phase.description}
                      </p>
                    </div>
                  </div>
                  {isLocked ? (
                    <span style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10, color: '#EF4444', background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 999, padding: '2px 8px' }
                                  : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#F87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 6px' }}>
                      LOCKED
                    </span>
                  ) : (
                    <span style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10, color: '#5FCC5F', background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 999, padding: '2px 8px' }
                                  : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#34D399', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 6px' }}>
                      OPEN
                    </span>
                  )}
                </div>

                {/* Modules */}
                <div className="pl-2 space-y-4" style={{ borderLeft: D ? '2px solid #E0E0E0' : '2px solid rgba(255,255,255,0.05)' }}>
                  {phaseModules.map((mod) => {
                    const isDone = mod.isDone;
                    const isModLocked = isLocked || mod.isLocked;
                    const isActive = mod.isActive;

                    return (
                      <div key={mod.path} className="relative flex gap-3">
                        {/* Dot */}
                        <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                          <motion.div
                            whileHover={!isModLocked ? { scale: 1.15 } : {}}
                            onClick={() => handleCardClick(mod.path, isModLocked)}
                            className="w-8 h-8 flex items-center justify-center text-xs cursor-pointer"
                            style={D ? {
                              background: isDone ? '#5FCC5F' : isActive ? '#5FCC5F' : '#E0E0E0',
                              border: `2px solid ${isDone ? '#5FCC5F' : isActive ? '#5FCC5F' : '#D1D5DB'}`,
                              borderRadius: '50%',
                              boxShadow: isActive ? '0 0 12px rgba(95,204,95,0.4)' : 'none',
                            } : {
                              background: isDone ? '#10B981' : isActive ? undefined : '#1E293B',
                              backgroundImage: isActive ? 'linear-gradient(135deg, #10B981, #3B82F6)' : undefined,
                              border: '2px solid #000',
                              boxShadow: isActive ? '0 0 12px rgba(16,185,129,0.5)' : 'none',
                            }}
                          >
                            {isDone ? <CheckCircle className="w-4 h-4" style={{ color: '#fff' }} />
                              : isModLocked ? <Lock className="w-3 h-3" style={{ color: D ? '#9CA3AF' : 'rgba(255,255,255,0.3)' }} />
                              : <Gamepad2 className="w-3.5 h-3.5" style={{ color: '#fff' }} />}
                          </motion.div>
                        </div>

                        {/* Module Card */}
                        <div className="flex-1 min-w-0">
                          <motion.div
                            whileHover={!isModLocked ? { y: -2, scale: 1.01 } : {}}
                            onClick={() => handleCardClick(mod.path, isModLocked)}
                            className="relative p-3.5 transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
                            style={D ? {
                              background: '#FFFFFF',
                              border: `${isDone ? '1.5px solid #E0E0E0' : isActive ? '2px solid #5FCC5F' : '1.5px solid #E0E0E0'}`,
                              borderRadius: 12,
                              boxShadow: isActive ? '0 4px 16px rgba(95,204,95,0.15)' : '0 1px 4px rgba(0,0,0,0.06)',
                              opacity: isDone ? 0.65 : 1,
                            } : {
                              background: isDone ? 'rgba(30,27,75,0.6)' : isActive ? undefined : '#151036',
                              backgroundImage: isActive ? 'linear-gradient(135deg, #1E1B4B, #251E5C)' : undefined,
                              borderColor: isModLocked ? '#374151' : isActive ? '#10B981' : '#000',
                              border: '2px solid',
                              boxShadow: isActive ? '3px 3px 0px #10B981' : '3px 3px 0px #000',
                              opacity: isDone ? 0.6 : 1,
                            }}
                          >
                            {isActive && (
                              <div className="absolute top-0 left-0 right-0 h-1 animate-pulse"
                                style={{ background: D ? '#5FCC5F' : '#10B981', borderRadius: D ? '12px 12px 0 0' : 0 }} />
                            )}

                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <div className="w-7 h-7 flex items-center justify-center text-sm flex-shrink-0"
                                    style={D ? {
                                      background: isModLocked ? '#F5F5F5' : `${mod.gradFrom}18`,
                                      border: `1.5px solid ${isModLocked ? '#E0E0E0' : mod.gradFrom + '40'}`,
                                      borderRadius: 8,
                                    } : {
                                      background: isModLocked ? '#374151' : mod.gradFrom,
                                      border: '1.5px solid #000',
                                    }}
                                  >
                                    {isModLocked ? '🔒' : mod.emoji}
                                  </div>
                                  <h3 style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : undefined }}
                                      className={D ? '' : 'font-game text-xs text-white leading-snug uppercase tracking-wide flex items-center gap-1.5 flex-wrap'}
                                  >
                                    <span>{mod.title}</span>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setHelpModule(mod);
                                      }}
                                      className="p-1 hover:opacity-85 text-[#10B981] transition-opacity cursor-pointer"
                                      title="Show instructions"
                                    >
                                      <HelpCircle className="w-3.5 h-3.5" />
                                    </button>
                                  </h3>
                                </div>
                                <p style={D ? { color: '#8B5CF6', fontFamily: '"Nunito", sans-serif', fontStyle: 'italic', fontSize: 11, marginTop: 4, lineHeight: 1.5 } : {}}
                                   className={D ? '' : 'font-body text-[10px] text-purple-300 italic mt-1 leading-relaxed'}
                                >
                                  "{mod.desc}"
                                </p>
                              </div>
                              {isDone && (
                                <span style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10, color: '#5FCC5F', background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap' }
                                            : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#10B981', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', padding: '2px 4px' }}>
                                  {D ? '✅ Done' : 'DONE'}
                                </span>
                              )}
                            </div>

                            {/* Progress bar */}
                            <div className="mt-3 space-y-1">
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 9 : 5, textTransform: 'uppercase' }}>Module Progress</span>
                                <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 9 : 5 }}>{mod.percent}%</span>
                              </div>
                              <div style={D ? { height: 6, background: '#E0E0E0', borderRadius: 999, overflow: 'hidden' }
                                         : { height: 6, background: 'rgba(0,0,0,0.45)', border: '1px solid #000', padding: '0.5px', display: 'flex', alignItems: 'center' }}>
                                <div style={D ? { width: `${mod.percent}%`, height: '100%', background: '#5FCC5F', borderRadius: 999 }
                                           : { width: `${mod.percent}%`, height: '100%', background: '#10B981' }} />
                              </div>
                            </div>

                            {isModLocked && (
                              <div className="mt-2.5 flex items-center gap-1 p-1"
                                style={D ? { background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 6, color: '#EF4444', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 10 }
                                       : { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontFamily: '"Press Start 2P", monospace', fontSize: 5 }}
                              >
                                <AlertCircle className="w-2.5 h-2.5" />
                                <span>Complete previous play missions to unlock</span>
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

      {/* Locked Modal */}
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
                <h3 style={{ color: '#EF4444', fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 16 : 12, textTransform: 'uppercase' }}>
                  Play Mission Gated!
                </h3>
                <p style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 13 : 11, lineHeight: 1.6 }}>
                  You must complete your current active play module first to unlock this activity!
                </p>
              </div>
              <div className="p-3 text-left space-y-1" style={D ? { background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 10 } : { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <div style={{ color: '#EF4444', fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontWeight: D ? 700 : undefined, fontSize: D ? 10 : 5, textTransform: 'uppercase' }}>LOCKED TARGET:</div>
                <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : 12 }}>
                  {lockedTarget.emoji} {lockedTarget.title}
                </div>
              </div>
              {lockedActive && (
                <div className="p-3 text-left space-y-1" style={D ? { background: '#F0FFF4', border: '1px solid #BBF7D0', borderRadius: 10 } : { background: 'rgba(6,78,59,0.2)', border: '1px solid rgba(6,78,59,0.3)' }}>
                  <div style={{ color: '#5FCC5F', fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontWeight: D ? 700 : undefined, fontSize: D ? 10 : 5, textTransform: 'uppercase' }}>YOUR CURRENT ACTIVE PLAY ZONE:</div>
                  <div style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : 12 }}>
                    {lockedActive.emoji} {lockedActive.title}
                  </div>
                </div>
              )}
              <div className="space-y-3 pt-2">
                {lockedActive && (
                  <button type="button"
                    onClick={() => { setLockedTarget(null); navigate(lockedActive.path); }}
                    style={D ? { width: '100%', background: '#5FCC5F', color: '#000', border: 'none', borderRadius: 12, padding: '13px', fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 14, boxShadow: '0 4px 0px rgba(0,0,0,0.15)', cursor: 'pointer' } : {}}
                    className={D ? '' : 'w-full bg-[#10B981] text-white font-game text-xs py-3 border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer hover:bg-emerald-600 transition-colors uppercase font-bold flex items-center justify-center gap-1'}
                  >
                    {D ? '🎮 Go to Active Module' : '⚡ Start Active Mission ⚡'}
                  </button>
                )}
                <button type="button" onClick={() => setLockedTarget(null)}
                  style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 13 : 12 }}
                  className="w-full text-center font-body text-xs hover:opacity-70 transition-colors cursor-pointer"
                >
                  Back to Play Zone
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ActivityHelpModal
        isOpen={!!helpModule}
        onClose={() => setHelpModule(null)}
        title={helpModule?.title || ''}
        type="play"
        description={helpModule?.desc || ''}
        steps={helpModule ? (PLAY_MODULE_INSTRUCTIONS[helpModule.path.split('?')[0]]?.steps || ['Explore and interact with the module activity to earn XP!']) : []}
        rewards={helpModule ? (PLAY_MODULE_INSTRUCTIONS[helpModule.path.split('?')[0]]?.rewards || '⚡ XP rewards') : ''}
      />
    </div>
  );
}
