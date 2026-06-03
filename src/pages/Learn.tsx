import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CURRICULUM, PHASES } from '@/data/curriculum';
import { Lock, Play, CheckCircle, Zap } from 'lucide-react';
import { getPlatformProgress } from '@/lib/gamification';
import { CardProgressBadge, CardProgressBar } from '@/components/ui/GameUI';
import { useCurrentProfile } from '@/contexts/AuthContext';

const PHASE_STYLES: Record<number, { gradFrom: string; gradTo: string; border: string; shadow: string }> = {
  1: { gradFrom: '#7C3AED', gradTo: '#3B82F6', border: '#7C3AED', shadow: '#5B21B6' },
  2: { gradFrom: '#3B82F6', gradTo: '#8B5CF6', border: '#3B82F6', shadow: '#1D4ED8' },
  3: { gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B' },
  4: { gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706' },
};

export default function Learn() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  
  const userZone = profile?.zone || 'junior';
  const completedIds: string[] = profile?.completed_lessons || [];
  const filtered = CURRICULUM.filter(l => l.zone === userZone || l.zone === 'both');

  const stats = getPlatformProgress(profile);
  const doneCount = stats.completedLessons;
  const totalLessons = stats.totalLessons;
  const totalPercent = stats.lessonPercent;
  const overallPercent = stats.overallPercent;

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="relative px-5 pt-6 pb-8 overflow-hidden">
        <h1 className="font-pixel text-[10px] text-white flex items-center gap-2 relative tracking-wide">
          📚 {userZone === 'junior' ? 'JUNIOR EXPLORER ZONE (AGES 6–11)' : 'FUTURE INNOVATOR ZONE (AGES 12–16)'}
        </h1>
        <p className="text-white/55 font-body text-sm mt-2 relative">
          {userZone === 'junior' 
            ? 'Exactly 20 structured phases to explore AI magic!' 
            : 'Exactly 20 advanced phases to master artificial intelligence!'}
        </p>
      </div>

      {/* Phase Sections */}
      <div className="px-5 -mt-6 space-y-8">
        
        {/* Tab Overall Progress Panel */}
        <div
          className="p-4 space-y-3"
          style={{
            background: '#1E1B4B',
            border: '3px solid #00C2FF',
            boxShadow: '4px 4px 0px 0px #000000',
          }}
        >
          <div className="flex items-center gap-1.5 border-b border-white/10 pb-2">
            <span className="text-sm">🏆</span>
            <span className="font-game text-[10px] text-white uppercase tracking-wider">Mission Control</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Bar 1: Overall Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline text-[7px] font-pixel text-[#FFD60A]">
                <span>OVERALL</span>
                <span>{overallPercent}%</span>
              </div>
              <div className="w-full h-3 bg-[#0F0A2E] border border-black p-[1px] flex items-center">
                <div className="h-full bg-[#FFD60A]" style={{ width: `${overallPercent}%`, transition: 'width 0.8s ease' }} />
              </div>
            </div>

            {/* Bar 2: Lesson Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-baseline text-[7px] font-pixel text-[#00C2FF]">
                <span>CURRICULUM</span>
                <span>{doneCount}/20 ({totalPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-[#0F0A2E] border border-black p-[1px] flex items-center">
                <div className="h-full bg-[#00C2FF]" style={{ width: `${totalPercent}%`, transition: 'width 0.8s ease' }} />
              </div>
            </div>
          </div>

          {/* Quick List of what is completed */}
          <div className="pt-2 border-t border-white/5 space-y-1.5 max-h-36 overflow-y-auto pr-1">
            <span className="text-white/45 font-game text-[8px] block uppercase">Curriculum Checklist:</span>
            {filtered.map((lesson, idx) => {
              const isDone = completedIds.includes(lesson.id);
              const isLocked = false;
              const pVal = isDone ? 100 : parseInt(localStorage.getItem(`lesson_progress_${lesson.id}`) || '0', 10);
              return (
                <div key={lesson.id} className="flex items-center justify-between text-[10px] font-body text-white/80">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{isDone ? '✅' : pVal > 0 ? '⏳' : '⏳'}</span>
                    <span className={isDone ? 'line-through text-white/40 truncate' : 'truncate'}>
                      {lesson.title} {pVal > 0 && pVal < 100 && `(${pVal}%)`}
                    </span>
                  </div>
                  <button
                    disabled={isLocked || isDone}
                    onClick={() => !isLocked && !isDone && navigate(`/learn/${lesson.id}`)}
                    className={`font-pixel text-[6px] px-1.5 py-0.5 border border-black shadow-[1px_1px_0px_#000] uppercase ${
                      isDone ? 'bg-success text-white opacity-60' :
                      isLocked ? 'bg-gray-800 text-white/40 cursor-not-allowed' :
                      'bg-warning text-black hover:bg-amber-300 cursor-pointer'
                    }`}
                  >
                    {isDone ? 'Done' : isLocked ? 'Locked' : 'Start'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {PHASES.map(phase => {
          const phaseLessons = filtered.filter(l => l.phase === phase.id);
          if (phaseLessons.length === 0) return null;
          const ps = PHASE_STYLES[((phase.id - 1) % 4) + 1];
          const doneCount = phaseLessons.filter(l => completedIds.includes(l.id)).length;
          const pct = Math.round((doneCount / phaseLessons.length) * 100);

          return (
            <div key={phase.id}>
              {/* Phase Header */}
              <div
                className="p-4 flex items-center gap-3 mb-3"
                style={{
                  background: '#1E1B4B',
                  border: '3px solid #000000',
                  boxShadow: '4px 4px 0px 0px #000000',
                }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: ps.gradFrom, border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
                >
                  {phase.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-game text-sm text-white">Phase {phase.id}: {phase.title}</div>
                  <div className="text-white/45 font-body text-xs mt-0.5">{phase.description}</div>
                  {/* Pixel Progress */}
                  <div className="mt-2">
                    <div className="h-2 overflow-hidden" style={{ background: '#0F0A2E', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <motion.div
                        className="h-full"
                        style={{
                          background: ps.gradFrom,
                          backgroundImage: 'repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(0,0,0,0.2) 4px, rgba(0,0,0,0.2) 6px)',
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>
                <div className="font-game text-sm flex-shrink-0" style={{ color: ps.gradFrom }}>
                  {doneCount}/{phaseLessons.length}
                </div>
              </div>

              {/* Lesson Cards */}
              <div className="space-y-3">
                {phaseLessons.map((lesson, idx) => {
                  const isDone = completedIds.includes(lesson.id);
                  const isLocked = false;
                  const pVal = isDone ? 100 : parseInt(localStorage.getItem(`lesson_progress_${lesson.id}`) || '0', 10);

                  return (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04, duration: 0.35 }}
                      whileHover={!isLocked ? { scale: 1.01, x: 2 } : {}}
                      whileTap={!isLocked ? { scale: 0.98 } : {}}
                      onClick={() => !isLocked && navigate(`/learn/${lesson.id}`)}
                      className="flex items-center gap-4 p-4 transition-all"
                      style={{
                        background: isLocked ? '#16103A' : '#1E1B4B',
                        border: '3px solid #000000',
                        boxShadow: '3px 3px 0px 0px #000000',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.5 : 1,
                      }}
                    >
                      <div
                        className="w-14 h-14 flex items-center justify-center text-2xl flex-shrink-0"
                        style={isDone ? {
                          background: ps.gradFrom,
                          boxShadow: `2px 2px 0px #000000`,
                          border: '2px solid #000000',
                        } : {
                          background: isLocked ? '#0F0A2E' : '#16103A',
                          border: '2px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {isLocked ? <Lock className="w-6 h-6 text-white/30" /> : lesson.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1.5">
                          <div className="text-white font-game text-sm leading-tight truncate">{lesson.title}</div>
                          <CardProgressBadge percent={pVal} />
                        </div>
                        <div className="text-white/40 font-body text-[11px] mt-0.5 line-clamp-2">{lesson.description}</div>
                        <div className="flex items-center justify-between gap-3 mt-1.5">
                          <span className="flex items-center gap-1 font-pixel text-[6px]" style={{ color: '#F59E0B' }}>
                            <Zap className="w-3 h-3" /> +{lesson.xpReward} XP
                          </span>
                          <span className="text-white/30 font-pixel text-[5px]">
                            {lesson.zone === 'junior' ? '🚀 6–11' : lesson.zone === 'innovator' ? '🧠 12–16' : '🌍 ALL'}
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <CardProgressBar percent={pVal} />
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <div
                            className="w-8 h-8 flex items-center justify-center"
                            style={{ background: ps.gradFrom, border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : isLocked ? null : (
                          <div
                            className="w-8 h-8 flex items-center justify-center"
                            style={{ background: '#16103A', border: '2px solid rgba(255,255,255,0.15)' }}
                          >
                            <Play className="w-4 h-4 text-white/70" fill="rgba(255,255,255,0.7)" />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
