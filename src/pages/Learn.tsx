import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CURRICULUM, PHASES } from '@/data/curriculum';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { Lock, Play, CheckCircle, Zap } from 'lucide-react';

const PHASE_GRADIENTS: Record<number, [string, string]> = {
  1: ['#7F5AF0', '#2CB67D'],
  2: ['#00C2FF', '#5B5FFF'],
  3: ['#FF8906', '#F25F4C'],
  4: ['#FFD60A', '#FF9F1C'],
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
        <div className="gradient-orb gradient-orb-mission" style={{ width: 200, height: 200, top: -60, right: -40, opacity: 0.4 }} />
        <h1 className="font-heading font-bold text-2xl text-white flex items-center gap-2 relative">
          📚 Learning Zones
        </h1>
        <p className="text-white/50 font-body text-sm mt-1 relative">20-lesson AI curriculum — explore at your own pace</p>

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
              className="px-3 py-2 rounded-xl font-body text-xs flex items-center gap-1.5 transition-all duration-200"
              style={activeZone === z.key ? {
                background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(127,90,240,0.4)',
              } : {
                background: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(255,255,255,0.12)',
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
          const [gradFrom, gradTo] = PHASE_GRADIENTS[phase.id] || ['#7F5AF0', '#2CB67D'];
          const doneCount = phaseLessons.filter(l => completedIds.includes(l.id)).length;
          const pct = Math.round((doneCount / phaseLessons.length) * 100);

          return (
            <div key={phase.id}>
              {/* Phase Header */}
              <div
                className="p-4 rounded-2xl flex items-center gap-3 mb-3"
                style={{
                  background: `linear-gradient(135deg, rgba(${hexToRgb(gradFrom)},0.2) 0%, rgba(${hexToRgb(gradTo)},0.1) 100%)`,
                  border: `1px solid rgba(${hexToRgb(gradFrom)},0.4)`,
                  boxShadow: `0 4px 20px rgba(${hexToRgb(gradFrom)},0.2)`,
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`, boxShadow: `0 4px 12px rgba(${hexToRgb(gradFrom)},0.5)` }}
                >
                  {phase.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-sm text-white">Phase {phase.id}: {phase.title}</div>
                  <div className="text-white/50 font-body text-xs mt-0.5">{phase.description}</div>
                  {/* Progress */}
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${gradFrom}, ${gradTo})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>
                </div>
                <div className="font-heading font-bold text-sm flex-shrink-0" style={{ color: gradFrom }}>
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
                      className="flex items-center gap-4 p-4 rounded-2xl transition-all"
                      style={{
                        background: isDone
                          ? `linear-gradient(135deg, rgba(${hexToRgb(gradFrom)},0.15) 0%, rgba(${hexToRgb(gradTo)},0.08) 100%)`
                          : isLocked
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(255,255,255,0.06)',
                        border: isDone
                          ? `1px solid rgba(${hexToRgb(gradFrom)},0.4)`
                          : `1px solid rgba(255,255,255,${isLocked ? '0.06' : '0.1'})`,
                        boxShadow: isDone ? `0 4px 16px rgba(${hexToRgb(gradFrom)},0.15)` : 'none',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.5 : 1,
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={isDone ? {
                          background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
                          boxShadow: `0 4px 12px rgba(${hexToRgb(gradFrom)},0.4)`,
                        } : {
                          background: isLocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      >
                        {isLocked ? <Lock className="w-6 h-6 text-white/30" /> : lesson.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-heading font-semibold text-sm leading-tight">{lesson.title}</div>
                        <div className="text-white/45 font-body text-[11px] mt-0.5 line-clamp-2">{lesson.description}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 font-body text-[10px]" style={{ color: '#FFD60A' }}>
                            <Zap className="w-3 h-3" /> +{lesson.xpReward} XP
                          </span>
                          <span className="text-white/30 font-body text-[10px]">
                            {lesson.zone === 'junior' ? '🚀 6–11' : lesson.zone === 'innovator' ? '🧠 12–16' : '🌍 All ages'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`, boxShadow: `0 2px 8px rgba(${hexToRgb(gradFrom)},0.5)` }}
                          >
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : isLocked ? null : (
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
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

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '127,90,240';
  return `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`;
}
