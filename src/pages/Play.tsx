import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { PLAY_MODULES_DATA, type PlayModule } from '@/data/curriculum';
import { getPlatformProgress, getLevel } from '@/lib/gamification';
import { AICompanion } from '@/components/ui/AICompanion';
import { Lock, CheckCircle, Trophy, AlertCircle, Gamepad2 } from 'lucide-react';

const PLAY_PHASES = [
  { id: 1, title: 'Foundation Fields', emoji: '🚀', description: 'Master the basics and explore key AI concepts.' },
  { id: 2, title: 'Explorer Domains', emoji: '🔍', description: 'Step into interactive scenarios and test your AI logic.' },
  { id: 3, title: 'Innovator Lands', emoji: '🛠️', description: 'Apply AI tools to real-world datasets and problems.' },
  { id: 4, title: 'Creator Frontiers', emoji: '🌌', description: 'Build advanced prototypes, design systems, and share your work.' },
];

export default function Play() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [lockedTarget, setLockedTarget] = useState<PlayModule | null>(null);
  const [lockedActive, setLockedActive] = useState<PlayModule | null>(null);

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
    if (completedPlayCount === 0) {
      return `Welcome to the Play Zone, Agent! 🎮 I'm Sparky. Test your AI skills or create prototypes in the interactive play modules below!`;
    }
    if (completedPlayCount === 20) {
      return `BZZZ! AMAZING! 🏆 You have conquered all Play modules! You are a certified AI Master! Keep experimenting!`;
    }
    const nextMod = filtered[activePlayIndex] || filtered[0];
    return `Welcome back, Agent! We've completed ${completedPlayCount} play missions. Ready to tackle "${nextMod.title}" next? Let's play!`;
  };

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

    const isLocked = activePlayIndex !== -1 && i > activePlayIndex;
    const isActive = activePlayIndex !== -1 && i === activePlayIndex;

    return {
      title: mod.title,
      emoji: mod.emoji,
      desc: mod.desc,
      gradFrom: mod.gradFrom,
      gradTo: mod.gradTo,
      border: mod.border,
      shadow: mod.shadow,
      isDone,
      isLocked,
      isActive,
      percent,
      path: mod.path
    };
  });

  const getPhaseModules = (phaseId: number) => {
    const start = (phaseId - 1) * 5;
    return playStatusList.slice(start, start + 5);
  };

  const isPhaseLocked = (phaseId: number) => {
    if (activePlayIndex === -1) return false;
    const firstIndexInPhase = (phaseId - 1) * 5;
    return activePlayIndex < firstIndexInPhase;
  };

  return (
    <div className="min-h-full pb-20 bg-stars bg-[#0F0A2E] text-white">
      
      {/* GLOBAL PROGRESS HEADER */}
      <div className="sticky top-0 z-30 px-4 pt-3 pb-2 bg-[#0F0A2E]/95 backdrop-blur-md border-b-3 border-black">
        <div 
          className="p-3 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #1E1B4B 0%, #16103A 100%)',
            border: '3px solid #10B981',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          {/* Progress Header Row */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#10B981]" />
              <span className="font-game text-[10px] text-white uppercase tracking-wider">Mission Control</span>
            </div>
            <div className="font-pixel text-[6px] text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 border border-[#10B981]/20">
              {completedPlayCount} / 20 CONQUERED
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
            <div className="flex justify-between items-baseline text-[7px] font-pixel text-[#10B981]">
              <span>PLAY ZONE COMPLETED</span>
              <span>{totalPlayPercent}%</span>
            </div>
            <div className="w-full h-3 bg-[#0F0A2E] border-2 border-black p-[2px] flex items-center">
              <div 
                className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] transition-all duration-800 ease-out" 
                style={{ width: `${totalPlayPercent}%` }} 
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
            border: '2.5px solid #10B981',
            boxShadow: '3px 3px 0px #000',
          }}
        >
          <AICompanion 
            state={completedPlayCount === 20 ? 'celebrating' : completedPlayCount === 0 ? 'welcome' : 'idle'}
            message={getSparkyPlayMessage()}
            name="SPARKY"
            size="sm"
            showBubble={true}
          />
        </div>
      </div>

      <div className="px-4">
        {/* PLAY ZONE MAP */}
        <div className="space-y-6">
          {PLAY_PHASES.map((phase) => {
            const phaseModules = getPhaseModules(phase.id);
            const isLocked = isPhaseLocked(phase.id);

            return (
              <div key={phase.id} className="space-y-3">
                {/* PHASE WORLD HEADER */}
                <div 
                  className="p-3 flex items-center justify-between border-2 border-black"
                  style={{
                    background: isLocked ? '#1A1829' : 'linear-gradient(90deg, #1E1B4B 0%, #16103A 100%)',
                    boxShadow: '3px 3px 0px #000',
                    borderLeftWidth: '6px',
                    borderLeftColor: isLocked ? '#4B5563' : '#10B981',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{phase.emoji}</span>
                    <div>
                      <h2 className="font-game text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                        WORLD {phase.id}: {phase.title}
                        {isLocked && <Lock className="w-3 h-3 text-white/40" />}
                      </h2>
                      <p className="font-body text-[10px] text-white/50">{phase.description}</p>
                    </div>
                  </div>
                  {isLocked ? (
                    <span className="font-pixel text-[5px] text-red-400 bg-red-950/20 border border-red-900/30 px-1.5 py-0.5">LOCKED</span>
                  ) : (
                    <span className="font-pixel text-[5px] text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 px-1.5 py-0.5">OPEN</span>
                  )}
                </div>

                {/* MODULES IN THIS PHASE */}
                <div className="pl-2 space-y-4 border-l-2 border-white/5 relative">
                  {phaseModules.map((mod) => {
                    const isDone = mod.isDone;
                    const isModLocked = isLocked || mod.isLocked;
                    const isActive = mod.isActive;

                    return (
                      <div key={mod.path} className="relative flex gap-3">
                        {/* Indicator circle */}
                        <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                          <motion.div
                            whileHover={!isModLocked ? { scale: 1.15 } : {}}
                            onClick={() => handleCardClick(mod.path, isModLocked)}
                            className={`w-8 h-8 border-2 border-black flex items-center justify-center text-xs cursor-pointer ${
                              isDone ? 'bg-[#10B981] text-white' :
                              isActive ? 'bg-gradient-to-br from-[#10B981] to-[#3B82F6] text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]' :
                              'bg-slate-800 text-white/30'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : isModLocked ? (
                              <Lock className="w-3 h-3" />
                            ) : (
                              <Gamepad2 className="w-3.5 h-3.5 text-white" />
                            )}
                          </motion.div>
                        </div>

                        {/* Module Card */}
                        <div className="flex-1 min-w-0">
                          <motion.div
                            whileHover={!isModLocked ? { y: -2, scale: 1.01 } : {}}
                            onClick={() => handleCardClick(mod.path, isModLocked)}
                            className={`relative p-3.5 border-2 border-black transition-all flex flex-col justify-between overflow-hidden cursor-pointer ${
                              isDone ? 'bg-[#1E1B4B]/60 opacity-60' :
                              isActive ? 'bg-gradient-to-br from-[#1E1B4B] to-[#251E5C] border-[#10B981] shadow-[3px_3px_0px_#000]' :
                              'bg-[#151036]'
                            }`}
                            style={{
                              borderColor: isModLocked ? '#374151' : isActive ? '#10B981' : '#000000',
                              boxShadow: isActive ? '3px 3px 0px #10B981' : '3px 3px 0px #000000',
                            }}
                          >
                            {/* Active Glow Bar */}
                            {isActive && (
                              <div className="absolute top-0 left-0 right-0 h-1 bg-[#10B981] animate-pulse" />
                            )}

                            <div className="flex items-start justify-between gap-1 mb-1">
                              <div>
                                {/* Mission Emoji + Title */}
                                <div className="flex items-center gap-1.5">
                                  <div
                                    className="w-7 h-7 flex items-center justify-center text-sm flex-shrink-0"
                                    style={{
                                      background: isModLocked ? '#374151' : mod.gradFrom,
                                      border: '1.5px solid #000000',
                                    }}
                                  >
                                    {isModLocked ? '🔒' : mod.emoji}
                                  </div>
                                  <h3 className="font-game text-xs text-white leading-snug uppercase tracking-wide">
                                    {mod.title}
                                  </h3>
                                </div>
                                {/* Description */}
                                <p className="font-body text-[10px] text-purple-300 italic mt-1 leading-relaxed">
                                  "{mod.desc}"
                                </p>
                              </div>
                              {isDone && (
                                <span className="font-pixel text-[5px] text-[#10B981] bg-[#10B981]/10 px-1 py-0.5 border border-[#10B981]/20">DONE</span>
                              )}
                            </div>

                            {/* Progress bar inside card */}
                            <div className="mt-3 space-y-1">
                              <div className="flex justify-between items-baseline text-[5px] font-pixel text-white/45">
                                <span>MODULE PROGRESS</span>
                                <span>{mod.percent}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-black/45 border border-black p-[0.5px] flex items-center">
                                <div className="h-full bg-[#10B981]" style={{ width: `${mod.percent}%` }} />
                              </div>
                            </div>

                            {/* Gated locked message */}
                            {isModLocked && (
                              <div className="mt-2.5 flex items-center gap-1 font-pixel text-[5px] text-white/30 bg-black/20 p-1 border border-white/5 uppercase">
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

      {/* LOCKED MISSION CLARIFICATION MODAL */}
      <AnimatePresence>
        {lockedTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[2px]">
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="w-full max-w-sm p-6 space-y-5 text-center relative"
              style={{ background: '#1E1B4B', border: '4px solid #EF4444', boxShadow: '8px 8px 0px 0px #000000' }}
            >
              <div className="text-3xl">🔒</div>
              
              <div className="space-y-1">
                <h3 className="font-game text-xs text-red-400 uppercase tracking-wide">Play Mission Gated!</h3>
                <p className="text-white/60 font-body text-[11px] leading-relaxed">
                  BZZZT! Agent, you must complete your current active play module first to build the necessary AI experience before unlocking this activity!
                </p>
              </div>

              {/* Locked Module Info */}
              <div className="p-3 bg-red-950/20 border border-red-900/30 text-left space-y-1">
                <div className="font-pixel text-[5px] text-red-400 uppercase">LOCKED TARGET:</div>
                <div className="font-game text-xs text-white uppercase truncate">
                  {lockedTarget.emoji} {lockedTarget.title}
                </div>
              </div>

              {/* Active Module Info */}
              {lockedActive && (
                <div className="p-3 bg-[#064E3B]/20 border border-[#064E3B]/30 text-left space-y-1">
                  <div className="font-pixel text-[5px] text-emerald-400 uppercase">YOUR CURRENT ACTIVE PLAY ZONE:</div>
                  <div className="font-game text-xs text-white uppercase truncate">
                    {lockedActive.emoji} {lockedActive.title}
                  </div>
                </div>
              )}

              <div className="space-y-3 pt-2">
                {lockedActive && (
                  <button
                    type="button"
                    onClick={() => {
                      setLockedTarget(null);
                      navigate(lockedActive.path);
                    }}
                    className="w-full bg-[#10B981] text-white font-game text-xs py-3 border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer hover:bg-emerald-600 transition-colors uppercase font-bold flex items-center justify-center gap-1"
                  >
                    ⚡ Start Active Mission ⚡
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setLockedTarget(null);
                  }}
                  className="w-full text-center text-white/45 font-body text-xs hover:text-white/70 transition-colors cursor-pointer"
                >
                  Back to Play Zone
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
