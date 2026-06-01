import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { WEEKLY_MISSIONS_DATA } from '@/data/curriculum';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Camera, FileText, CheckCircle, Clock, Zap } from 'lucide-react';

interface Submission { missionId: number; text: string; status: string; xp: number; submittedAt: string; }

export default function WeeklyMissions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'missions' | 'submissions'>('missions');
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    return JSON.parse(localStorage.getItem('mission_submissions') || '[]');
  });

  const mission = WEEKLY_MISSIONS_DATA.find(m => m.id === selectedMission);
  const isSubmitted = (id: number) => submissions.some(s => s.missionId === id);

  const handleSubmit = async () => {
    if (!mission || !text.trim()) return;
    setSubmitting(true);
    const submission: Submission = {
      missionId: mission.id,
      text,
      status: 'approved',
      xp: mission.xp_reward,
      submittedAt: new Date().toISOString(),
    };

    if (user) {
      await supabase.from('mission_submissions').insert({
        user_id: user.id,
        mission_id: mission.id,
        text_observation: text,
        status: 'approved',
        earned_xp: mission.xp_reward,
      });
    }

    const newSubs = [...submissions, submission];
    setSubmissions(newSubs);
    localStorage.setItem('mission_submissions', JSON.stringify(newSubs));
    setShowXP(true);
    setSubmitting(false);
    setSelectedMission(null);
    setText('');
  };

  return (
    <div className="min-h-full bg-pixel-darker pb-6">
      {showXP && <XPToast amount={mission?.xp_reward ?? 80} reason="Mission submitted!" onDone={() => setShowXP(false)} />}

      {/* Header */}
      <div className="bg-gradient-to-b from-primary/30 to-pixel-darker p-5">
        <h1 className="text-white font-game text-xl flex items-center gap-2">🎯 Weekly Missions</h1>
        <p className="text-white/60 font-body text-sm mt-1">Real-world field challenges — earn massive XP!</p>

        {/* Tabs */}
        <div className="flex mt-4 border-4 border-black">
          {(['missions', 'submissions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 font-game text-xs capitalize transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'bg-pixel-dark text-white/50 hover:text-white'}`}>
              {tab === 'missions' ? '🎯 Active Missions' : '📋 My Submissions'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-2">
        {activeTab === 'missions' && (
          <div className="space-y-4">
            {WEEKLY_MISSIONS_DATA.map((m, i) => {
              const done = isSubmitted(m.id);
              return (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`border-4 border-black p-5 shadow-pixel ${done ? 'bg-success/20 border-success' : 'bg-pixel-dark'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">{m.emoji}</span>
                        <div>
                          <div className="text-white font-game text-sm">{m.title}</div>
                          <span className={`text-xs font-body border border-black px-2 py-0.5 ${
                            m.difficulty === 'Easy' ? 'bg-success/30 text-green-300' :
                            m.difficulty === 'Medium' ? 'bg-warning/30 text-yellow-300' :
                            'bg-pixel-red/30 text-red-300'
                          }`}>
                            {m.difficulty}
                          </span>
                        </div>
                      </div>
                      <p className="text-white/70 font-body text-sm leading-relaxed mt-2">{m.description}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Zap className="w-4 h-4 text-warning" />
                        <span className="text-warning font-game text-xs">+{m.xp_reward} XP Reward</span>
                      </div>
                    </div>
                    {done ? (
                      <CheckCircle className="w-8 h-8 text-success flex-shrink-0" />
                    ) : null}
                  </div>
                  {!done && (
                    <Button variant="primary" size="sm" fullWidth className="mt-4" onClick={() => setSelectedMission(m.id)}>
                      Start Mission →
                    </Button>
                  )}
                  {done && (
                    <div className="mt-3 bg-success/10 border-t-2 border-success/30 pt-2 text-center">
                      <span className="text-success font-body text-xs">✅ Mission Completed!</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-4 pt-2">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
                <div className="text-6xl opacity-40">📋</div>
                <p className="text-white/40 font-body text-sm">No submissions yet. Complete a mission to see it here!</p>
              </div>
            ) : submissions.map((s, i) => {
              const m = WEEKLY_MISSIONS_DATA.find(m => m.id === s.missionId);
              return (
                <div key={i} className="border-4 border-black bg-success/10 border-success p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{m?.emoji}</span>
                    <div className="flex-1">
                      <div className="text-white font-game text-sm">{m?.title}</div>
                      <div className="text-white/50 font-body text-xs">{new Date(s.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <span className="bg-success border-2 border-black text-white font-pixel text-[9px] px-2 py-1">+{s.xp} XP</span>
                  </div>
                  <div className="bg-black/20 border-l-4 border-success p-3">
                    <p className="text-white/80 font-body text-sm italic">"{s.text}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Mission Submission Modal */}
      <AnimatePresence>
        {selectedMission && mission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md border-4 border-black bg-pixel-dark"
            >
              <div className="border-b-4 border-black p-4 flex items-center gap-3">
                <span className="text-3xl">{mission.emoji}</span>
                <div>
                  <div className="text-white font-game text-sm">{mission.title}</div>
                  <div className="text-warning font-body text-xs">+{mission.xp_reward} XP on completion</div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="text-white/70 font-body text-sm mb-2 block flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Your Observation:
                  </label>
                  <textarea value={text} onChange={e => setText(e.target.value)}
                    placeholder="Describe what you found, observed, or learned..."
                    className="pixel-input h-32 resize-none" maxLength={500} />
                  <div className="text-right text-white/30 font-body text-xs mt-1">{text.length}/500</div>
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => { setSelectedMission(null); setText(''); }}>Cancel</Button>
                  <Button variant="success" fullWidth loading={submitting} disabled={text.length < 10} onClick={handleSubmit}>
                    Submit Mission! 🚀
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
