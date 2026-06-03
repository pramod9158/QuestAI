import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CURRICULUM, PHASES } from '@/data/curriculum';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { Lock, Play, CheckCircle, Zap } from 'lucide-react';

const PHASE_STYLES: Record<number, { gradFrom: string; gradTo: string; border: string; shadow: string }> = {
  1: { gradFrom: '#7C3AED', gradTo: '#3B82F6', border: '#7C3AED', shadow: '#5B21B6' },
  2: { gradFrom: '#3B82F6', gradTo: '#8B5CF6', border: '#3B82F6', shadow: '#1D4ED8' },
  3: { gradFrom: '#EF4444', gradTo: '#F59E0B', border: '#EF4444', shadow: '#991B1B' },
  4: { gradFrom: '#F59E0B', gradTo: '#FCD34D', border: '#F59E0B', shadow: '#D97706' },
};

export default function Learn() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const [activeZone, setActiveZone] = useState<'all' | 'junior' | 'innovator'>('all');

  const completedIds: string[] = profile?.completed_lessons || [];
  const filtered = CURRICULUM.filter(l => activeZone === 'all' || l.zone === activeZone || l.zone === 'both');

  return (
    <div className="min-h-full pb-8">
      {/* Header */}
      <div className="relative px-5 pt-6 pb-10 overflow-hidden">
        <h1 className="font-pixel text-[10px] text-white flex items-center gap-2 relative tracking-wide">
          📚 LEARNING ZONES
        </h1>
        <p className="text-white/50 font-body text-sm mt-2 relative">20-lesson AI curriculum — explore at your own pace</p>

        {/* Zone filter pills */}
        <div className="flex gap-2 mt-4 relative">
          {[
            { key: 'all', label: 'All', emoji: '🌍' },
            { key: 'junior', label: 'Ages 6–11', emoji: '🚀' },
            { key: 'innovator', label: 'Ages 12–16', emoji: '🧠' },
          ].map(z => (
            <button
              key={z.key}
              onClick={() => setActiveZone(z.key as typeof activeZone)}
              className="px-3 py-2 font-body text-xs flex items-center gap-1.5 transition-all duration-150"
              style={activeZone === z.key ? {
                background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                color: 'white',
                border: '2px solid #5B21B6',
                boxShadow: '3px 3px 0px 0px #5B21B6',
              } : {
                background: '#1E1B4B',
                color: 'rgba(255,255,255,0.55)',
                border: '2px solid rgba(124,58,237,0.3)',
                boxShadow: '2px 2px 0px 0px rgba(0,0,0,0.4)',
              }}
            >
              {z.emoji} {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase Sections */}
      <div className="px-5 -mt-6 space-y-8">
        {PHASES.map(phase => {
          const phaseLessons = filtered.filter(l => l.phase === phase.id);
          if (phaseLessons.length === 0) return null;
          const ps = PHASE_STYLES[phase.id] || PHASE_STYLES[1];
          const doneCount = phaseLessons.filter(l => completedIds.includes(l.id)).length;
          const pct = Math.round((doneCount / phaseLessons.length) * 100);

          return (
            <div key={phase.id}>
              {/* Phase Header */}
              <div
                className="p-4 flex items-center gap-3 mb-3"
                style={{
                  background: 'linear-gradient(135deg, #1E1B4B, #16103A)',
                  border: `3px solid ${ps.border}`,
                  boxShadow: `4px 4px 0px 0px ${ps.shadow}`,
                }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${ps.gradFrom}, ${ps.gradTo})`, border: '2px solid rgba(0,0,0,0.3)', boxShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}
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
                          background: `linear-gradient(90deg, ${ps.gradFrom}, ${ps.gradTo})`,
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
                  const isLocked = idx > 0 && !completedIds.includes(phaseLessons[idx - 1].id) && phase.id > 1;

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
                        background: isDone
                          ? 'linear-gradient(135deg, #1E1B4B, #16103A)'
                          : isLocked
                          ? '#16103A'
                          : '#1E1B4B',
                        border: isDone
                          ? `3px solid ${ps.border}`
                          : `3px solid ${isLocked ? 'rgba(255,255,255,0.06)' : 'rgba(124,58,237,0.3)'}`,
                        boxShadow: isDone ? `3px 3px 0px 0px ${ps.shadow}` : '2px 2px 0px rgba(0,0,0,0.4)',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.5 : 1,
                      }}
                    >
                      <div
                        className="w-14 h-14 flex items-center justify-center text-2xl flex-shrink-0"
                        style={isDone ? {
                          background: `linear-gradient(135deg, ${ps.gradFrom}, ${ps.gradTo})`,
                          boxShadow: `2px 2px 0px rgba(0,0,0,0.5)`,
                          border: '2px solid rgba(0,0,0,0.3)',
                        } : {
                          background: isLocked ? '#0F0A2E' : '#16103A',
                          border: '2px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {isLocked ? <Lock className="w-6 h-6 text-white/30" /> : lesson.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-game text-sm leading-tight">{lesson.title}</div>
                        <div className="text-white/40 font-body text-[11px] mt-0.5 line-clamp-2">{lesson.description}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 font-pixel text-[6px]" style={{ color: '#F59E0B' }}>
                            <Zap className="w-3 h-3" /> +{lesson.xpReward} XP
                          </span>
                          <span className="text-white/30 font-pixel text-[5px]">
                            {lesson.zone === 'junior' ? '🚀 6–11' : lesson.zone === 'innovator' ? '🧠 12–16' : '🌍 ALL'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <div
                            className="w-8 h-8 flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${ps.gradFrom}, ${ps.gradTo})`, boxShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}
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
