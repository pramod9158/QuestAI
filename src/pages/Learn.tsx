import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CURRICULUM, PHASES } from '@/data/curriculum';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { Lock, Play, Star, Zap, ChevronLeft } from 'lucide-react';

export default function Learn() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const [activeZone, setActiveZone] = useState<'all' | 'junior' | 'innovator'>('all');

  const completedIds: string[] = profile?.completed_lessons || [];
  const filtered = CURRICULUM.filter(l => activeZone === 'all' || l.zone === activeZone || l.zone === 'both');

  return (
    <div className="min-h-full bg-pixel-darker pb-6">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#241740] to-pixel-darker p-5 pb-8">
        <h1 className="text-white font-game text-2xl flex items-center gap-2">
          📚 Learning Zones
        </h1>
        <p className="text-white/60 font-body text-sm mt-1">20-lesson AI curriculum — explore at your own pace</p>

        {/* Zone filter */}
        <div className="flex gap-2 mt-4">
          {[
            { key: 'all', label: 'All', emoji: '🌍' },
            { key: 'junior', label: 'Ages 6–11', emoji: '🚀' },
            { key: 'innovator', label: 'Ages 12–16', emoji: '🧠' },
          ].map(z => (
            <button
              key={z.key}
              onClick={() => setActiveZone(z.key as typeof activeZone)}
              className={`border-2 border-black px-4 py-2 font-game text-xs flex items-center gap-1.5 rounded-2xl transition-all shadow-[0px_4px_0px_0px_#000000] active:translate-y-0.5 active:shadow-none ${activeZone === z.key ? 'bg-primary text-white' : 'bg-pixel-dark text-white/60 hover:text-white'}`}
            >
              {z.emoji} {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phase Sections */}
      <div className="px-4 -mt-4 space-y-6">
        {PHASES.map(phase => {
          const phaseLessons = filtered.filter(l => l.phase === phase.id);
          if (phaseLessons.length === 0) return null;
          return (
            <div key={phase.id}>
              {/* Phase Header */}
              <div className={`border-4 border-black ${phase.color} px-4 py-3 flex items-center gap-2 mb-3 rounded-2xl shadow-[0px_6px_0px_0px_#000000]`}>
                <span className="text-2xl">{phase.emoji}</span>
                <div>
                  <div className="text-white font-game text-sm">Phase {phase.id}: {phase.title}</div>
                  <div className="text-white/70 font-body text-xs">{phase.description}</div>
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
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      whileHover={!isLocked ? { scale: 1.01 } : {}}
                      whileTap={!isLocked ? { scale: 0.98 } : {}}
                      onClick={() => !isLocked && navigate(`/learn/${lesson.id}`)}
                      className={`border-4 border-black p-4 rounded-3xl flex items-center gap-4 transition-all shadow-[0px_6px_0px_0px_rgba(0,0,0,0.85)] ${
                        isDone ? 'bg-[#122A1C] border-success' :
                        isLocked ? 'bg-black/40 opacity-60 cursor-not-allowed' :
                        'bg-pixel-dark cursor-pointer hover:bg-white/5 hover:scale-[1.01] hover:shadow-[0px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
                      }`}
                    >
                      <div className={`w-14 h-14 border-4 border-black flex items-center justify-center text-2xl flex-shrink-0 rounded-2xl shadow-[0px_3px_0px_0px_rgba(0,0,0,1)] ${
                        isDone ? 'bg-success' : isLocked ? 'bg-gray-700' : 'bg-[#241740]'
                      }`}>
                        {isLocked ? <Lock className="w-6 h-6 text-gray-400" /> : lesson.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-game text-sm leading-tight">{lesson.title}</div>
                        <div className="text-white/50 font-body text-[11px] mt-0.5 line-clamp-2">{lesson.description}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-warning font-body text-[10px]">
                            <Zap className="w-3 h-3" /> +{lesson.xpReward} XP
                          </span>
                          <span className="text-white/30 font-body text-[10px]">
                            {lesson.zone === 'junior' ? '🚀 6–11' : lesson.zone === 'innovator' ? '🧠 12–16' : '🌍 All ages'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {isDone ? (
                          <div className="w-8 h-8 bg-success border-2 border-black flex items-center justify-center rounded-xl shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Star className="w-4 h-4 text-white" fill="white" />
                          </div>
                        ) : isLocked ? null : (
                          <div className="w-8 h-8 bg-primary border-2 border-black flex items-center justify-center rounded-xl shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]">
                            <Play className="w-4 h-4 text-white" fill="white" />
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
