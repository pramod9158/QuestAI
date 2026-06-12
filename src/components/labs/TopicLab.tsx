import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Star, Award } from 'lucide-react';
import { AICompanion } from '../ui/AICompanion';
import { useFeedbackEngine } from '@/contexts/FeedbackEngineContext';

interface TopicLabProps {
  lessonId: string;
  onComplete: () => void;
}

// ─── Generic Helper Components ────────────────────────────────────────────────

function LabCompleteCard({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-4 text-center border-2 border-[#10B981] bg-[#10B981]/15 shadow-[3px_3px_0px_#000]"
    >
      <div className="text-3xl mb-2">🎉</div>
      <p className="font-game text-xs text-white">Lab complete! Sparky is impressed!</p>
      <button
        onClick={onComplete}
        className="mt-3 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
      >
        Submit Lab ➔
      </button>
    </motion.div>
  );
}

// ─── Module 6: YouTube Recommendation Lab (lesson-2) ─────────────────────────
function RecommendationLab({ onComplete }: { onComplete: () => void }) {
  const categories = [
    { id: 'cooking', label: '🍳 Cooking', videos: ['Pasta Recipe', 'Easy Biryani', 'Chocolate Cake'] },
    { id: 'gaming', label: '🎮 Gaming', videos: ['Minecraft Tips', 'FIFA 25 Goals', 'Roblox Tricks'] },
    { id: 'science', label: '🔬 Science', videos: ['How Rockets Work', 'Black Holes', 'Ocean Secrets'] },
  ];
  const [watched, setWatched] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const watchVideo = (vid: string) => {
    if (!watched.includes(vid)) setWatched(prev => [...prev, vid]);
  };

  const getRecommendation = () => {
    const counts: Record<string, number> = { cooking: 0, gaming: 0, science: 0 };
    categories.forEach(cat => {
      cat.videos.forEach(v => { if (watched.includes(v)) counts[cat.id]++; });
    });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    const rec = {
      cooking: '🍕 "10 Street Foods from India" — based on your cooking interest!',
      gaming: '🕹️ "Top 10 Most Epic Gaming Moments" — you love gaming content!',
      science: '🌌 "What Happens at the Edge of the Universe?" — science fan detected!',
    }[top[0]] || 'A popular trending video!';
    setRecommendation(rec);
    if (!done) {
      setDone(true);
      setTimeout(onComplete, 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Watch some videos and let the AI algorithm learn your taste. Then it'll recommend the perfect next video!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-[#A78BFA] uppercase tracking-wider mb-3">📺 VIDEOS TO WATCH ({watched.length} watched)</p>
        {categories.map(cat => (
          <div key={cat.id} className="mb-3">
            <p className="font-game text-[10px] text-white/60 mb-1">{cat.label}</p>
            <div className="grid grid-cols-3 gap-1">
              {cat.videos.map(vid => (
                <button
                  key={vid}
                  onClick={() => watchVideo(vid)}
                  className={`py-1.5 px-1 font-pixel text-[6px] border border-black transition-all cursor-pointer text-center ${
                    watched.includes(vid) ? 'bg-[#10B981] text-white' : 'bg-black/30 text-white/50 hover:bg-black/50'
                  }`}
                >
                  {watched.includes(vid) ? '✓ ' : ''}{vid}
                </button>
              ))}
            </div>
          </div>
        ))}

        {watched.length >= 3 && !recommendation && (
          <button
            onClick={getRecommendation}
            className="w-full py-2.5 bg-[#3B82F6] text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] mt-2"
          >
            🤖 Activate AI Recommendation Engine!
          </button>
        )}

        <AnimatePresence>
          {recommendation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 border-2 border-[#FFD60A] bg-[#FFD60A]/10 text-center"
            >
              <p className="font-pixel text-[6px] text-yellow-400 mb-1">AI RECOMMENDS NEXT:</p>
              <p className="font-game text-[10px] text-white">{recommendation}</p>
              <p className="font-body text-[9px] text-white/50 mt-1">The algorithm noticed your pattern and predicted what you'd love next!</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Module 9: AI Fairness Simulation (lesson-10-jr) ─────────────────────────
function FairnessLab({ onComplete, onCelebrate }: { onComplete: () => void; onCelebrate: () => void }) {
  const scenarios = [
    {
      q: 'A face recognition app works 98% of the time for light-skinned faces but only 65% for dark-skinned faces. Is this fair?',
      options: ['Yes, 65% is still good!', 'No! Training data was biased — needs more diverse photos', 'Yes, all faces are different'],
      correct: 1,
      explain: 'Correct! The AI was trained on mostly light-skinned photos, so it learned to recognize those better. The fix: add more diverse training data.',
    },
    {
      q: 'A hiring AI rejects more female applicants because most engineers in the training data were male. What is the problem?',
      options: ['Female applicants are less qualified', 'The AI learned from biased historical data', 'The AI prefers men intentionally'],
      correct: 1,
      explain: 'Spot on! The AI learned from old data where women were underrepresented in tech. The fix: audit training data and remove historical bias.',
    },
    {
      q: 'How do we make AI fairer for everyone?',
      options: ['Use only one type of data', 'Collect diverse data from all groups and regularly audit the AI', 'AI can fix itself automatically'],
      correct: 1,
      explain: 'Exactly! Fairness requires diverse data, human review, and regular testing across different groups of people.',
    },
  ];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    const isCorrect = idx === scenarios[current].correct;
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(s => s + 1);
    
    setTimeout(() => {
      if (current + 1 >= scenarios.length) {
        setFinished(true);
        if (nextScore === scenarios.length) {
          setTimeout(onCelebrate, 1000);
        } else {
          setTimeout(onComplete, 2500);
        }
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 2000);
  };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="p-4 border-2 border-[#10B981] bg-[#10B981]/10 text-center space-y-2">
        <div className="text-3xl">⚖️</div>
        <p className="font-game text-xs text-white">Fairness Score: {score}/{scenarios.length}</p>
        <p className="font-body text-[10px] text-white/60">You now understand how bias sneaks into AI and how to fight it!</p>
        <button onClick={() => {
          if (score === scenarios.length) {
            onCelebrate();
          } else {
            onComplete();
          }
        }} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
          Submit Lab ➔
        </button>
      </motion.div>
    );
  }

  const sc = scenarios[current];
  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="thinking" message="AI fairness is about making sure AI works equally well for everyone, no matter who they are!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-[#A78BFA] uppercase tracking-wider mb-2">⚖️ FAIRNESS CASE {current + 1}/{scenarios.length}</p>
        <p className="font-body text-xs text-white leading-relaxed mb-4">{sc.q}</p>
        <div className="space-y-2">
          {sc.options.map((opt, i) => {
            let cls = 'bg-black/30 text-white/70 border-white/10 hover:bg-black/50';
            if (selected !== null) {
              if (i === sc.correct) cls = 'bg-[#10B981]/20 border-[#10B981] text-white';
              else if (i === selected) cls = 'bg-[#EF4444]/20 border-[#EF4444] text-white';
            }
            return (
              <button
                key={i}
                onClick={() => selected === null && handleAnswer(i)}
                className={`w-full text-left px-3 py-2 font-body text-xs border transition-all cursor-pointer ${cls} ${selected !== null ? 'cursor-not-allowed' : ''}`}
              >
                {opt}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2 bg-blue-900/30 border border-blue-500/30 font-body text-[10px] text-white/80 leading-relaxed">
            💡 {sc.explain}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 11: Game AI NPC Behavior Builder (lesson-13-jr) ──────────────────
function GameAILab({ onComplete }: { onComplete: () => void }) {
  const [states, setStates] = useState<Record<string, string>>({});
  const [tested, setTested] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const stateOptions = [
    { id: 'idle', label: '😴 Idle (Far away)', choices: ['Stand still', 'Patrol area', 'Sleep'] },
    { id: 'alert', label: '👀 Alert (Sees you)', choices: ['Chase player', 'Call for help', 'Sound alarm'] },
    { id: 'attack', label: '⚔️ Attack (Close)', choices: ['Swing sword', 'Throw object', 'Use special power'] },
    { id: 'retreat', label: '💨 Retreat (Low HP)', choices: ['Run away', 'Find cover', 'Heal self'] },
  ];

  const selectState = (stateId: string, choice: string) => {
    setStates(prev => ({ ...prev, [stateId]: choice }));
  };

  const testNPC = () => {
    setTested(true);
    const scenario = `Your NPC: patrols when idle → ${states.alert || 'does nothing'} when it sees you → ${states.attack || 'stands there'} when close → ${states.retreat || 'stays'} when hurt!`;
    setResult(scenario);
    setTimeout(onComplete, 3000);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Design your own NPC (Non-Player Character) by choosing a behavior for each game state! This is exactly how Minecraft creepers and game bosses work." size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-purple-400 uppercase tracking-wider mb-3">🎮 NPC BEHAVIOR DESIGNER — CHOOSE 4 STATES</p>
        <div className="space-y-3">
          {stateOptions.map(st => (
            <div key={st.id}>
              <p className="font-game text-[9px] text-white/60 mb-1">{st.label}</p>
              <div className="flex gap-1">
                {st.choices.map(ch => (
                  <button
                    key={ch}
                    onClick={() => selectState(st.id, ch)}
                    className={`flex-1 py-1 font-pixel text-[6px] border border-black cursor-pointer transition-all ${
                      states[st.id] === ch ? 'bg-purple-600 text-white' : 'bg-black/20 text-white/40 hover:bg-black/40'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(states).length >= 4 && !tested && (
          <button
            onClick={testNPC}
            className="w-full mt-3 py-2.5 bg-purple-600 text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            🎮 Activate NPC AI Brain!
          </button>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 border-2 border-purple-500 bg-purple-900/20 text-center">
            <p className="font-pixel text-[6px] text-purple-300 uppercase mb-1">YOUR NPC BEHAVIOR TREE:</p>
            <p className="font-body text-[10px] text-white leading-relaxed">{result}</p>
            <p className="font-body text-[9px] text-white/50 mt-1">This is a real State Machine — the same tech used in Minecraft, FIFA, and Elden Ring!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 14: Healthcare AI Diagnosis Helper (lesson-16-jr) ─────────────────
function HealthAILab({ onComplete }: { onComplete: () => void }) {
  const symptoms = ['Fever', 'Cough', 'Headache', 'Runny nose', 'Fatigue', 'Sore throat'];
  const [selected, setSelected] = useState<string[]>([]);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'result'>('select');

  const toggle = (s: string) => {
    setSelected(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const diagnose = () => {
    let result = '';
    if (selected.includes('Fever') && selected.includes('Cough') && selected.includes('Fatigue')) {
      result = '🦠 Possible Flu detected! Rest, drink fluids, and consult a doctor.';
    } else if (selected.includes('Runny nose') && selected.includes('Cough')) {
      result = '🤧 Possible Common Cold. Stay warm, rest well!';
    } else if (selected.includes('Headache') && selected.includes('Fatigue')) {
      result = '😓 Possible fatigue or stress. Get more sleep and drink water.';
    } else {
      result = '✅ Symptoms are mild. Monitor them and rest well.';
    }
    setDiagnosis(result);
    setStep('result');
    setTimeout(onComplete, 3000);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Select symptoms from a patient and watch the AI match patterns to suggest a possible diagnosis — just like a real AI doctor app!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-red-400 uppercase tracking-wider mb-3">🏥 PATIENT SYMPTOM CHECKER</p>

        {step === 'select' && (
          <>
            <p className="font-body text-[10px] text-white/60 mb-3">Select all symptoms the patient is showing:</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {symptoms.map(s => (
                <button
                  key={s}
                  onClick={() => toggle(s)}
                  className={`py-2 font-game text-[9px] border border-black cursor-pointer transition-all ${
                    selected.includes(s) ? 'bg-red-500/70 text-white border-red-500' : 'bg-black/20 text-white/50 hover:bg-black/40'
                  }`}
                >
                  {selected.includes(s) ? '✓ ' : ''}{s}
                </button>
              ))}
            </div>

            {selected.length >= 2 && (
              <button
                onClick={diagnose}
                className="w-full py-2.5 bg-red-600 text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                🤖 Run AI Diagnosis
              </button>
            )}
          </>
        )}

        {step === 'result' && diagnosis && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="space-y-3">
            <div className="p-3 border-2 border-red-400 bg-red-900/20 text-center">
              <p className="font-pixel text-[6px] text-red-300 uppercase mb-1">AI DIAGNOSIS RESULT:</p>
              <p className="font-game text-xs text-white">{diagnosis}</p>
            </div>
            <div className="p-2 bg-yellow-900/20 border border-yellow-500/30">
              <p className="font-body text-[9px] text-yellow-300">⚠️ Important: AI assists doctors but never replaces them! A human doctor always makes the final decision.</p>
            </div>
            <button onClick={onComplete} className="w-full py-2 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
              Submit Lab ➔
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 15: Smart Home Designer (lesson-17-jr) ────────────────────────────
function SmartHomeLab({ onComplete, onCelebrate }: { onComplete: () => void; onCelebrate: () => void }) {
  const devices = [
    { id: 'thermostat', name: 'Smart Thermostat 🌡️', isAI: true, reason: 'Learns your schedule and adjusts temperature automatically' },
    { id: 'bulb', name: 'Regular Bulb 💡', isAI: false, reason: 'Just turns on/off — no learning ability' },
    { id: 'camera', name: 'Security Camera 📸', isAI: true, reason: 'Uses face recognition to identify family vs strangers' },
    { id: 'fridge', name: 'Smart Fridge 🧊', isAI: true, reason: 'Tracks food, suggests recipes, orders groceries' },
    { id: 'fan', name: 'Ceiling Fan 🌀', isAI: false, reason: 'Mechanical device — no intelligence' },
    { id: 'speaker', name: 'Smart Speaker 🔊', isAI: true, reason: 'Understands voice commands with NLP' },
    { id: 'tv', name: 'Old TV 📺', isAI: false, reason: 'Shows channels — no learning or prediction' },
    { id: 'lock', name: 'Smart Lock 🔐', isAI: true, reason: 'Recognizes your fingerprint or face to unlock' },
  ];

  const [sorted, setSorted] = useState<Record<string, 'smart' | 'regular'>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const sortDevice = (id: string, cat: 'smart' | 'regular') => {
    if (checked) return;
    setSorted(prev => ({ ...prev, [id]: cat }));
  };

  const checkAnswers = () => {
    let correct = 0;
    devices.forEach(d => {
      const answer = sorted[d.id];
      if ((d.isAI && answer === 'smart') || (!d.isAI && answer === 'regular')) correct++;
    });
    setScore(correct);
    setChecked(true);
    if (correct >= 6) {
      if (correct === devices.length) {
        setTimeout(onCelebrate, 1500);
      } else {
        setTimeout(onComplete, 3000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Sort each home device! Which ones have AI brains that learn and adapt? Which are just basic electrical devices?" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-blue-400 uppercase tracking-wider mb-3">🏠 SMART HOME SORTER ({Object.keys(sorted).length}/{devices.length} sorted)</p>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {devices.map(d => {
            const s = sorted[d.id];
            let borderColor = 'border-white/10';
            if (checked && s) {
              const correct = (d.isAI && s === 'smart') || (!d.isAI && s === 'regular');
              borderColor = correct ? 'border-[#10B981]' : 'border-[#EF4444]';
            }
            return (
              <div key={d.id} className={`p-2 border-2 bg-black/20 ${borderColor}`}>
                <p className="font-game text-[9px] text-white mb-1">{d.name}</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => sortDevice(d.id, 'smart')}
                    className={`flex-1 py-1 font-pixel text-[6px] border border-black cursor-pointer ${s === 'smart' ? 'bg-[#3B82F6] text-white' : 'bg-black/20 text-white/40'}`}
                    disabled={checked}
                  >
                    🤖 AI Smart
                  </button>
                  <button
                    onClick={() => sortDevice(d.id, 'regular')}
                    className={`flex-1 py-1 font-pixel text-[6px] border border-black cursor-pointer ${s === 'regular' ? 'bg-gray-600 text-white' : 'bg-black/20 text-white/40'}`}
                    disabled={checked}
                  >
                    🔌 Regular
                  </button>
                </div>
                {checked && s && (
                  <p className="font-body text-[8px] text-white/50 mt-1 italic">{d.reason}</p>
                )}
              </div>
            );
          })}
        </div>

        {Object.keys(sorted).length === devices.length && !checked && (
          <button
            onClick={checkAnswers}
            className="w-full mt-3 py-2.5 bg-[#3B82F6] text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            Check My Smart Home Sorting!
          </button>
        )}

        {checked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`mt-3 p-3 border-2 text-center ${score >= 6 ? 'border-[#10B981] bg-[#10B981]/10' : 'border-yellow-500 bg-yellow-900/10'}`}>
            <p className="font-game text-xs text-white">Score: {score}/{devices.length}</p>
            {score >= 6 ? (
              <p className="font-body text-[10px] text-white/60 mt-1">Excellent! You can identify smart AI devices perfectly!</p>
            ) : (
              <button onClick={() => { setSorted({}); setChecked(false); }} className="mt-2 px-3 py-1 font-game text-[8px] bg-yellow-600 text-white border border-black cursor-pointer">
                Try Again
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 17: Animal Recognition AI (lesson-19-jr) ─────────────────────────
function WildlifeAILab({ onComplete, onCelebrate }: { onComplete: () => void; onCelebrate: () => void }) {
  const tigers = [
    { id: 'A', pattern: '🐯 Wide horizontal stripes, broad face', name: 'Raja' },
    { id: 'B', pattern: '🐯 Thin vertical stripes, narrow nose', name: 'Shiva' },
    { id: 'C', pattern: '🐯 Mixed stripes, distinctive ear tufts', name: 'Amba' },
  ];

  const sightings = [
    { id: 1, description: 'Wide horizontal stripes, broad face spotted near river', correctId: 'A' },
    { id: 2, description: 'Mixed stripes with distinctive ear tufts captured on camera', correctId: 'C' },
    { id: 3, description: 'Thin vertical stripes near the bamboo grove', correctId: 'B' },
  ];

  const [matches, setMatches] = useState<Record<number, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const matchTiger = (sightingId: number, tigerId: string) => {
    if (done) return;
    setMatches(prev => ({ ...prev, [sightingId]: tigerId }));
  };

  const submitMatches = () => {
    const correct = sightings.filter(s => matches[s.id] === s.correctId).length;
    setResult(`AI correctly identified ${correct}/${sightings.length} tigers! ${correct === sightings.length ? '🎉 Perfect match!' : 'Check the stripe patterns more carefully next time!'}`);
    setDone(true);
    if (correct === sightings.length) {
      setTimeout(onCelebrate, 1500);
    } else {
      setTimeout(onComplete, 3000);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="thinking" message="Match each camera trap sighting to the correct tiger using their unique stripe patterns — just like a real wildlife AI system!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-orange-400 uppercase tracking-wider mb-2">🐯 KNOWN TIGERS DATABASE</p>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {tigers.map(t => (
            <div key={t.id} className="p-2 bg-black/30 border border-orange-500/30 text-center">
              <p className="font-game text-[9px] text-orange-300">Tiger {t.id}: {t.name}</p>
              <p className="font-body text-[8px] text-white/50 mt-1">{t.pattern}</p>
            </div>
          ))}
        </div>

        <p className="font-pixel text-[6px] text-orange-400 uppercase tracking-wider mb-2">📸 CAMERA TRAP SIGHTINGS — MATCH THE TIGER</p>
        <div className="space-y-3">
          {sightings.map(s => (
            <div key={s.id} className="p-2 bg-black/20 border border-white/10">
              <p className="font-body text-[10px] text-white/80 mb-2">Sighting {s.id}: "{s.description}"</p>
              <div className="flex gap-1">
                {tigers.map(t => {
                  let cls = 'bg-black/20 text-white/40';
                  if (matches[s.id] === t.id) {
                    if (done) {
                      cls = s.correctId === t.id ? 'bg-[#10B981] text-white' : 'bg-[#EF4444] text-white';
                    } else {
                      cls = 'bg-orange-600 text-white';
                    }
                  } else if (done && s.correctId === t.id) {
                    cls = 'bg-[#10B981]/50 text-white border-[#10B981]';
                  }
                  return (
                    <button
                      key={t.id}
                      onClick={() => matchTiger(s.id, t.id)}
                      disabled={done}
                      className={`flex-1 py-1 font-game text-[8px] border border-black cursor-pointer transition-all ${cls}`}
                    >
                      Tiger {t.id}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(matches).length === sightings.length && !done && (
          <button
            onClick={submitMatches}
            className="w-full mt-3 py-2.5 bg-orange-600 text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            🐯 Submit Tiger ID Results!
          </button>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 border-2 border-orange-400 bg-orange-900/20 text-center">
            <p className="font-body text-[10px] text-white leading-relaxed">{result}</p>
            <button onClick={() => {
              const correct = sightings.filter(s => matches[s.id] === s.correctId).length;
              if (correct === sightings.length) {
                onCelebrate();
              } else {
                onComplete();
              }
            }} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
              Submit Lab ➔
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 5: Alexa Voice Command Builder (lesson-5) ────────────────────────
function VoiceRecognitionLab({ onComplete }: { onComplete: () => void }) {
  // Simulate building a voice command pipeline
  const pipeline = [
    { id: 'wake', label: '1. Wake Word', icon: '🎙️', desc: 'Device detects wake word', color: 'border-blue-400', chip: 'On-Device Neural Net' },
    { id: 'capture', label: '2. Capture Audio', icon: '🔊', desc: 'Records your command', color: 'border-purple-400', chip: '500ms audio buffer' },
    { id: 'asr', label: '3. Speech → Text', icon: '📝', desc: 'Converts voice to words', color: 'border-yellow-400', chip: 'ASR Model' },
    { id: 'nlp', label: '4. Understand Intent', icon: '🧠', desc: 'AI reads what you want', color: 'border-pink-400', chip: 'NLP + NER' },
    { id: 'action', label: '5. Execute Action', icon: '⚡', desc: 'Performs your request', color: 'border-green-400', chip: 'Smart Home API' },
  ];

  const commands = [
    { text: 'Alexa, play jazz music', steps: ['wake', 'capture', 'asr', 'nlp', 'action'], result: '🎵 Playing Jazz Radio!' },
    { text: 'Alexa, set a 10 minute timer', steps: ['wake', 'capture', 'asr', 'nlp', 'action'], result: '⏱️ Timer set for 10 minutes!' },
    { text: 'Alexa, what is the weather?', steps: ['wake', 'capture', 'asr', 'nlp', 'action'], result: '☀️ Today: Sunny, 32°C in your city' },
  ];

  const [activeCmd, setActiveCmd] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [completedCmds, setCompletedCmds] = useState<number[]>([]);

  const runPipeline = (cmdIdx: number) => {
    if (running || completedCmds.includes(cmdIdx)) return;
    setActiveCmd(cmdIdx);
    setActiveStep(0);
    setRunning(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= pipeline.length) {
        clearInterval(interval);
        setActiveStep(pipeline.length);
        setRunning(false);
        const newCompleted = [...completedCmds, cmdIdx];
        setCompletedCmds(newCompleted);
        if (newCompleted.length >= commands.length) {
          setDone(true);
          setTimeout(onComplete, 2500);
        }
      } else {
        setActiveStep(step);
      }
    }, 700);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Tap each voice command and watch how Alexa processes it through the AI pipeline — step by step!" size="sm" />
      </div>

      {/* Pipeline Visual */}
      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-[#A78BFA] uppercase tracking-wider mb-3">🎙️ ALEXA AI PIPELINE</p>
        <div className="flex items-center gap-0.5 overflow-x-auto pb-2">
          {pipeline.map((step, i) => (
            <React.Fragment key={step.id}>
              <div className={`flex-shrink-0 p-2 border-2 text-center min-w-[60px] transition-all duration-300 ${
                activeStep > i ? step.color + ' bg-white/5' :
                activeStep === i && running ? 'border-yellow-400 bg-yellow-900/20 animate-pulse' :
                'border-white/10 bg-black/20'
              }`}>
                <div className="text-lg">{step.icon}</div>
                <p className="font-pixel text-[5px] text-white/60 mt-0.5">{step.label}</p>
                {activeStep > i && <p className="font-pixel text-[4px] text-green-400 mt-0.5">{step.chip}</p>}
              </div>
              {i < pipeline.length - 1 && (
                <div className={`w-3 h-0.5 flex-shrink-0 ${ activeStep > i ? 'bg-green-400' : 'bg-white/20' }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Commands to Try */}
      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-[#A78BFA] uppercase tracking-wider mb-3">🗣️ TAP A VOICE COMMAND TO RUN IT ({completedCmds.length}/{commands.length})</p>
        <div className="space-y-2">
          {commands.map((cmd, i) => (
            <div key={i}>
              <button
                onClick={() => runPipeline(i)}
                disabled={running || completedCmds.includes(i)}
                className={`w-full text-left p-3 border-2 font-game text-[10px] transition-all cursor-pointer ${
                  completedCmds.includes(i) ? 'border-[#10B981] bg-[#10B981]/10 text-white' :
                  activeCmd === i && running ? 'border-yellow-400 bg-yellow-900/10 animate-pulse text-white' :
                  'border-white/10 bg-black/20 text-white/60 hover:bg-black/40 hover:text-white'
                }`}
              >
                <span className="text-white/40 font-pixel text-[5px] block mb-0.5">COMMAND {i + 1}</span>
                🎙️ "{cmd.text}" {completedCmds.includes(i) ? '✓' : ''}
              </button>
              {activeCmd === i && activeStep >= pipeline.length && completedCmds.includes(i) && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="mt-1 p-2 bg-green-900/20 border border-green-500/30 font-game text-[9px] text-green-300">
                  Alexa: {cmd.result}
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-3 p-3 border-2 border-[#10B981] bg-[#10B981]/10 text-center">
            <p className="font-game text-xs text-white">🎙️ Voice Pipeline Mastered!</p>
            <p className="font-body text-[10px] text-white/60 mt-1">You traced 3 complete voice commands through the full AI pipeline!</p>
            <button onClick={onComplete} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">Submit Lab ➔</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 8: Future of AI Quiz (lesson-12) ─────────────────────────────────
function FutureAILab({ onComplete, onCelebrate }: { onComplete: () => void; onCelebrate: () => void }) {
  const futures = [
    { year: '2025', emoji: '🚗', prediction: 'Self-driving cars widely available', likely: true },
    { year: '2030', emoji: '🏥', prediction: 'AI diagnoses most diseases before symptoms appear', likely: true },
    { year: '2030', emoji: '🤖', prediction: 'Robots do ALL household chores automatically', likely: false },
    { year: '2035', emoji: '👩‍🏫', prediction: 'AI tutors customize education for every student', likely: true },
    { year: '2035', emoji: '🌍', prediction: 'AI solves climate change completely on its own', likely: false },
    { year: '2040', emoji: '🧬', prediction: 'AI discovers cures for most genetic diseases', likely: true },
  ];

  const [votes, setVotes] = useState<Record<number, boolean>>({});
  const [result, setResult] = useState<string | null>(null);

  const vote = (idx: number, val: boolean) => {
    if (result) return;
    setVotes(prev => ({ ...prev, [idx]: val }));
  };

  const submit = () => {
    let correct = 0;
    futures.forEach((f, i) => {
      if (votes[i] === f.likely) correct++;
    });
    setResult(`You predicted ${correct}/${futures.length} correctly! ${correct >= 4 ? '🎉 Amazing future thinking!' : 'Keep learning — AI futures are complex!'}`);
    if (correct === futures.length) {
      setTimeout(onCelebrate, 1500);
    } else {
      setTimeout(onComplete, 3500);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="thinking" message="Vote on each future AI prediction — will it LIKELY happen or is it UNLIKELY? Show me how well you understand AI's trajectory!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-yellow-400 uppercase tracking-wider mb-3">🔮 FUTURE AI PREDICTION VOTER</p>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {futures.map((f, i) => (
            <div key={i} className={`p-2.5 border-2 bg-black/20 transition-all ${
              votes[i] === true ? 'border-green-500' : votes[i] === false ? 'border-red-500' : 'border-white/10'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                <span className="text-xl">{f.emoji}</span>
                <div>
                  <span className="font-pixel text-[5px] text-yellow-400 block">{f.year}</span>
                  <p className="font-body text-[10px] text-white/90 leading-snug">{f.prediction}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => vote(i, true)}
                  disabled={!!result}
                  className={`flex-1 py-1 font-pixel text-[6px] border border-black cursor-pointer ${
                    votes[i] === true ? 'bg-green-600 text-white' : 'bg-black/20 text-white/40 hover:bg-green-900/30'
                  }`}
                >✓ Likely</button>
                <button
                  onClick={() => vote(i, false)}
                  disabled={!!result}
                  className={`flex-1 py-1 font-pixel text-[6px] border border-black cursor-pointer ${
                    votes[i] === false ? 'bg-red-700 text-white' : 'bg-black/20 text-white/40 hover:bg-red-900/30'
                  }`}
                >✗ Unlikely</button>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(votes).length === futures.length && !result && (
          <button
            onClick={submit}
            className="w-full mt-3 py-2.5 bg-yellow-600 text-black font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            🔮 See Future Predictions Score!
          </button>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 border-2 border-yellow-500 bg-yellow-900/20 text-center">
            <p className="font-game text-xs text-white">{result}</p>
            {futures.map((f, i) => (
              <div key={i} className="mt-1 flex items-center gap-1 text-left">
                <span>{f.likely ? '✅' : '❌'}</span>
                <span className="font-body text-[8px] text-white/60">{f.prediction} — {f.likely ? 'Likely!' : 'Unlikely in this timeframe'}</span>
              </div>
            ))}
            <button onClick={() => {
              let correct = 0;
              futures.forEach((f, i) => {
                if (votes[i] === f.likely) correct++;
              });
              if (correct === futures.length) {
                onCelebrate();
              } else {
                onComplete();
              }
            }} className="mt-3 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
              Submit Lab ➔
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 7: Word Magic Story Builder (lesson-7-jr) ─────────────────────────
// The existing prompt-lab handles this well, but let's verify if user means module 7 has the explore-lab
// lesson-7-jr has aiLab.type === 'prompt-lab' so it's already different. The rendering in LessonPlayer falls through to prompt-lab.
// If the user mentions module 7 still shows the AI sim lab, it might be because the lesson data maps it to 'explore-lab'.
// Based on the curriculum data, lesson-7-jr has type 'prompt-lab' which renders PromptLab, not ExploreLab.

// ─── Module 4: Robot Training (lesson-4) ─────────────────────────────────────
// lesson-4 has type 'train-lab' which renders TrainLab — already different

// ─── Module 6: lesson-2 — already handled above (RecommendationLab) ──────────
// ─── Module 13: Eco AI Forest Protection (lesson-15-jr) ───────────────────────
function EcoAILab({ onComplete, onCelebrate }: { onComplete: () => void; onCelebrate: () => void }) {
  const sounds = [
    { id: 'chainsaw', emoji: '🪚', name: 'Chainsaw noise', isThreaten: true },
    { id: 'thunder', emoji: '⛈️', name: 'Thunder clap', isThreaten: false },
    { id: 'gunshot', emoji: '🔫', name: 'Gunshot', isThreaten: true },
    { id: 'bird', emoji: '🐦', name: 'Bird singing', isThreaten: false },
    { id: 'vehicle', emoji: '🚛', name: 'Truck engine', isThreaten: true },
    { id: 'rain', emoji: '🌧️', name: 'Rain falling', isThreaten: false },
  ];

  const [classified, setClassified] = useState<Record<string, 'threat' | 'safe'>>({});
  const [score, setScore] = useState<number | null>(null);

  const classify = (id: string, cat: 'threat' | 'safe') => {
    if (score !== null) return;
    setClassified(prev => ({ ...prev, [id]: cat }));
  };

  const check = () => {
    let correct = 0;
    sounds.forEach(s => {
      if ((s.isThreaten && classified[s.id] === 'threat') || (!s.isThreaten && classified[s.id] === 'safe')) correct++;
    });
    setScore(correct);
    if (correct >= 4) {
      if (correct === sounds.length) {
        setTimeout(onCelebrate, 1500);
      } else {
        setTimeout(onComplete, 3000);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Train the AI forest guardian! Classify each sound as a threat to the forest (like chainsaws) or a safe natural sound. The AI learns from your labels!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-green-400 uppercase tracking-wider mb-3">🌱 FOREST SOUND CLASSIFIER ({Object.keys(classified).length}/{sounds.length})</p>

        <div className="space-y-2">
          {sounds.map(s => {
            const c = classified[s.id];
            let borderCls = 'border-white/10';
            if (score !== null && c) {
              const correct = (s.isThreaten && c === 'threat') || (!s.isThreaten && c === 'safe');
              borderCls = correct ? 'border-[#10B981]' : 'border-[#EF4444]';
            }
            return (
              <div key={s.id} className={`flex items-center gap-3 p-2 bg-black/20 border-2 ${borderCls}`}>
                <span className="text-xl">{s.emoji}</span>
                <span className="font-game text-[9px] text-white flex-1">{s.name}</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => classify(s.id, 'threat')}
                    disabled={score !== null}
                    className={`px-2 py-1 font-pixel text-[6px] border border-black cursor-pointer ${c === 'threat' ? 'bg-red-600 text-white' : 'bg-black/20 text-white/40'}`}
                  >
                    ⚠️ Threat
                  </button>
                  <button
                    onClick={() => classify(s.id, 'safe')}
                    disabled={score !== null}
                    className={`px-2 py-1 font-pixel text-[6px] border border-black cursor-pointer ${c === 'safe' ? 'bg-green-700 text-white' : 'bg-black/20 text-white/40'}`}
                  >
                    ✓ Safe
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {Object.keys(classified).length === sounds.length && score === null && (
          <button
            onClick={check}
            className="w-full mt-3 py-2.5 bg-green-700 text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            🌱 Submit to Forest AI Guardian
          </button>
        )}

        {score !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`mt-3 p-3 border-2 text-center ${score >= 4 ? 'border-[#10B981] bg-[#10B981]/10' : 'border-yellow-500 bg-yellow-900/10'}`}>
            <p className="font-game text-xs text-white">Score: {score}/{sounds.length}</p>
            <p className="font-body text-[10px] text-white/60 mt-1">
              {score >= 4 ? '🌳 Great! The AI forest guardian can now detect logging threats!' : 'Try again — listen carefully to which sounds threaten the forest!'}
            </p>
            {score < 4 && (
              <button onClick={() => { setClassified({}); setScore(null); }} className="mt-2 px-3 py-1 font-game text-[8px] bg-green-700 text-white border border-black cursor-pointer">
                Try Again
              </button>
            )}
            {score >= 4 && (
              <button onClick={() => {
                if (score === sounds.length) {
                  onCelebrate();
                } else {
                  onComplete();
                }
              }} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
                Submit Lab ➔
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 10: AI in India — Crop Disease Doctor (lesson-11) ────────────────
function IndiaAILab({ onComplete, onCelebrate }: { onComplete: () => void; onCelebrate: () => void }) {
  const crops = [
    {
      name: '🌾 Wheat',
      photo: 'Yellow spots on leaves, edges turning brown',
      diseases: ['Rust Disease 🟠', 'Healthy ✅', 'Powdery Mildew ⚪', 'Drought Stress 🌵'],
      correct: 0,
      treatment: '💊 Apply fungicide spray. Rust is caused by a fungus — the AI caught it from the yellow-orange spots!',
    },
    {
      name: '🍅 Tomato',
      photo: 'Dark circular spots with yellow rings around them',
      diseases: ['Healthy ✅', 'Early Blight 🦠', 'Overwatering 💧', 'Insect Damage 🐛'],
      correct: 1,
      treatment: '🌿 Remove infected leaves and apply copper spray. AI detected the classic bullseye pattern of early blight!',
    },
    {
      name: '🌽 Maize',
      photo: 'Leaves with white powdery coating, stunted growth',
      diseases: ['Viral Mosaic 🔬', 'Nutrient Deficiency 🟡', 'Powdery Mildew ⚪', 'Healthy ✅'],
      correct: 2,
      treatment: '💨 Improve air circulation, apply sulfur-based treatment. AI recognized the white powder coating pattern!',
    },
  ];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const diagnose = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === crops[current].correct;
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(s => s + 1);
    
    setTimeout(() => {
      if (current + 1 >= crops.length) {
        setDone(true);
        if (nextScore === crops.length) {
          setTimeout(onCelebrate, 1000);
        } else {
          setTimeout(onComplete, 2500);
        }
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 2500);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="p-4 border-2 border-[#10B981] bg-[#10B981]/10 text-center space-y-2">
        <div className="text-3xl">🌾</div>
        <p className="font-game text-xs text-white">Crop Diagnosis Score: {score}/{crops.length}</p>
        <p className="font-body text-[10px] text-white/60">You helped diagnose crops just like India's real KisanAI app!</p>
        <button onClick={() => {
          if (score === crops.length) {
            onCelebrate();
          } else {
            onComplete();
          }
        }} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">Submit Lab ➔</button>
      </motion.div>
    );
  }

  const crop = crops[current];
  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="In India, farmers use AI apps to photograph sick crops and get instant disease diagnoses. Be the AI — diagnose each crop from its symptoms!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <div className="flex gap-1 mb-3">
          {crops.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 border border-black ${ i < current ? 'bg-[#10B981]' : i === current ? 'bg-yellow-400 animate-pulse' : 'bg-black/30' }`} />
          ))}
        </div>
        <p className="font-pixel text-[6px] text-green-400 uppercase tracking-wider mb-2">🇮🇳 KISANAI CROP DOCTOR — CASE {current + 1}/{crops.length}</p>

        <div className="p-3 bg-black/30 border border-white/10 mb-4">
          <p className="font-game text-[10px] text-white mb-1">Farmer's crop: {crop.name}</p>
          <p className="font-pixel text-[6px] text-white/40 uppercase mb-1">📸 PHOTO ANALYSIS:</p>
          <p className="font-body text-[10px] text-yellow-200 italic">"{crop.photo}"</p>
        </div>

        <p className="font-pixel text-[6px] text-white/50 uppercase mb-2">🤖 SELECT THE AI DIAGNOSIS:</p>
        <div className="space-y-2">
          {crop.diseases.map((d, i) => {
            let cls = 'bg-black/20 text-white/60 border-white/10 hover:bg-black/40';
            if (selected !== null) {
              if (i === crop.correct) cls = 'bg-[#10B981]/20 border-[#10B981] text-white';
              else if (i === selected) cls = 'bg-[#EF4444]/20 border-[#EF4444] text-white';
            }
            return (
              <button key={i} onClick={() => diagnose(i)}
                className={`w-full text-left px-3 py-2 font-game text-[10px] border transition-all cursor-pointer ${cls}`}>
                {d}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2 bg-green-900/20 border border-green-500/30 font-body text-[10px] text-white/80 leading-relaxed">
            {crop.treatment}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 16: Smart Farm Irrigation Designer (lesson-18-jr) ─────────────────
function SmartFarmLab({ onComplete }: { onComplete: () => void }) {
  const sensors = [
    { id: 'soil', emoji: '🌱', name: 'Soil Moisture Sensor', readings: ['Dry (20%)', 'Moist (55%)', 'Wet (85%)'] },
    { id: 'weather', emoji: '☀️', name: 'Weather Forecast', readings: ['Rain today', 'Sunny 3 days', 'Cloudy tomorrow'] },
    { id: 'crop', emoji: '🌾', name: 'Crop Type', readings: ['Wheat (needs less)', 'Rice (needs more)', 'Tomato (medium)'] },
  ];

  const [readings, setReadings] = useState<Record<string, string>>({});
  const [decision, setDecision] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const setReading = (sensorId: string, val: string) => {
    if (checked) return;
    setReadings(prev => ({ ...prev, [sensorId]: val }));
  };

  const analyzeAndDecide = () => {
    const soil = readings.soil || '';
    const weather = readings.weather || '';
    const crop = readings.crop || '';

    let liters = 0;
    let reason = '';

    if (soil.includes('Dry')) liters += 30;
    else if (soil.includes('Moist')) liters += 15;
    else liters += 5;

    if (weather.includes('Rain')) { liters = Math.max(0, liters - 20); reason += 'Rain predicted → reduced watering. '; }
    else if (weather.includes('Sunny')) { liters += 10; reason += 'Hot sunny days → extra water needed. '; }

    if (crop.includes('Rice')) liters += 15;
    else if (crop.includes('Wheat')) liters -= 5;

    liters = Math.max(5, liters);
    setDecision(`💧 AI recommends: Water ${liters}L today. ${reason}This saves ${Math.max(0, 60 - liters)}L compared to traditional flooding!`);
    setChecked(true);
    setTimeout(onComplete, 3500);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Select sensor readings and let the AI irrigation system decide exactly how much water the field needs today!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-green-400 uppercase tracking-wider mb-3">🌾 SMART IRRIGATION AI — SELECT SENSOR DATA</p>
        <div className="space-y-4">
          {sensors.map(s => (
            <div key={s.id}>
              <p className="font-game text-[10px] text-white/70 mb-1.5">{s.emoji} {s.name}</p>
              <div className="grid grid-cols-3 gap-1">
                {s.readings.map(r => (
                  <button
                    key={r}
                    onClick={() => setReading(s.id, r)}
                    disabled={checked}
                    className={`py-1.5 font-pixel text-[6px] border border-black cursor-pointer transition-all text-center ${
                      readings[s.id] === r ? 'bg-green-700 text-white' : 'bg-black/20 text-white/40 hover:bg-black/40'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {Object.keys(readings).length === sensors.length && !checked && (
          <button
            onClick={analyzeAndDecide}
            className="w-full mt-4 py-2.5 bg-green-700 text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            🤖 Run AI Irrigation Analysis!
          </button>
        )}

        {decision && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-3 border-2 border-green-500 bg-green-900/20">
            <p className="font-pixel text-[6px] text-green-400 uppercase mb-1">AI IRRIGATION DECISION:</p>
            <p className="font-body text-[10px] text-white leading-relaxed">{decision}</p>
            <p className="font-body text-[8px] text-white/50 mt-2 italic">This is how real precision farming AI works — it reads sensor data and makes optimal watering decisions automatically!</p>
            <button onClick={onComplete} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">Submit Lab ➔</button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 18: Cyber Safety Sorter (lesson-20-jr) ───────────────────────────
function CyberSafetyLab({ onComplete, onCelebrate }: { onComplete: () => void; onCelebrate: () => void }) {
  const scenarios = [
    {
      id: 1,
      text: "Sharing your favorite flavor of ice cream on a kids gaming forum.",
      isSafe: true,
      reason: "This is general preference data. Sharing favorite ice cream, colors, or animals is completely safe!",
    },
    {
      id: 2,
      text: "Giving your phone number to a friendly player online who wants to send you a gift.",
      isSafe: false,
      reason: "Dangerous! Never share personal contact info like phone numbers or home address with online strangers.",
    },
    {
      id: 3,
      text: "Creating a password like '123456' or 'yourname123' because it is easy to remember.",
      isSafe: false,
      reason: "Risky! Easy passwords can be easily guessed by hacking programs. Always use complex passwords.",
    },
    {
      id: 4,
      text: "Posting a photo of your school ID card online to show friends your new picture.",
      isSafe: false,
      reason: "Risky! School IDs contain your full name, photo, school name, and ID number — hackers can misuse this.",
    },
    {
      id: 5,
      text: "Telling a math app your favorite animal to customize your profile avatar.",
      isSafe: true,
      reason: "Safe! General avatar preferences don't link back to your real-world identity.",
    },
  ];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleChoice = (choice: boolean) => {
    if (selected !== null) return;
    setSelected(choice);
    const isCorrect = choice === scenarios[current].isSafe;
    const nextScore = isCorrect ? score + 1 : score;
    if (isCorrect) {
      setScore(s => s + 1);
    }
    setTimeout(() => {
      if (current + 1 >= scenarios.length) {
        setDone(true);
        if (nextScore === scenarios.length) {
          setTimeout(onCelebrate, 1500);
        }
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 2800);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="p-4 border-2 border-[#10B981] bg-[#10B981]/15 text-center space-y-2">
        <div className="text-3xl">🔒</div>
        <p className="font-game text-xs text-white">Cyber Safety Score: {score}/{scenarios.length}</p>
        <p className="font-body text-[10px] text-white/60">You successfully classified personal vs safe data sharing! Sparky feels much safer now.</p>
        <button onClick={() => {
          if (score === scenarios.length) {
            onCelebrate();
          } else {
            onComplete();
          }
        }} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">Submit Lab ➔</button>
      </motion.div>
    );
  }

  const sc = scenarios[current];
  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Protect your digital identity! Determine whether it's safe to share this information or if it should be kept secret." size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <div className="flex gap-1 mb-3">
          {scenarios.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 border border-black ${ i < current ? 'bg-[#10B981]' : i === current ? 'bg-yellow-400 animate-pulse' : 'bg-black/30' }`} />
          ))}
        </div>
        <p className="font-pixel text-[6px] text-blue-400 uppercase tracking-wider mb-2">🔒 CYBER SAFETY SHIELD — SITUATION {current + 1}/{scenarios.length}</p>

        <div className="p-4 bg-black/45 border-2 border-dashed border-white/20 mb-4 min-h-[70px] flex items-center justify-center text-center">
          <p className="font-body text-xs text-white leading-relaxed font-semibold">
            "{sc.text}"
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleChoice(true)}
            disabled={selected !== null}
            className={`flex-1 py-3 font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] text-center transition-all ${
              selected === true ? 'bg-green-600 text-white' : 'bg-[#10B981]/20 text-[#10B981] hover:bg-[#10B981]/30'
            } ${selected !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            🟢 Safe to Share
          </button>
          <button
            onClick={() => handleChoice(false)}
            disabled={selected !== null}
            className={`flex-1 py-3 font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] text-center transition-all ${
              selected === false ? 'bg-red-600 text-white' : 'bg-[#EF4444]/20 text-[#EF4444] hover:bg-[#EF4444]/30'
            } ${selected !== null ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            🔴 Keep Secret!
          </button>
        </div>

        <AnimatePresence>
          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div className={`p-3 border-2 font-body text-[10px] text-white/90 leading-relaxed flex items-start gap-2 ${
                selected === sc.isSafe 
                  ? 'border-[#10B981] bg-[#10B981]/15' 
                  : 'border-[#EF4444] bg-[#EF4444]/15'
              }`}>
                <span className="text-sm">{selected === sc.isSafe ? '✅' : '❌'}</span>
                <div>
                  <span className="font-bold block mb-0.5">{selected === sc.isSafe ? 'Excellent Decision!' : 'Not Quite Safe!'}</span>
                  {sc.reason}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Module 19: AI Beat Composer (lesson-21-jr) ──────────────────────────────
function MusicComposerLab({ onComplete }: { onComplete: () => void }) {
  const genres = ['Cyber Synthwave 🌌', '8-Bit Retro 👾', 'Lo-Fi Chill ☕'];
  const tempos = ['Relaxed (80 BPM) 🐢', 'Groovy (115 BPM) 🦊', 'Fast (140 BPM) ⚡'];
  const leads = ['Retro Synthesizer 🎹', 'Electric Lead Guitar 🎸', 'Square Wave Chip ⚡'];
  const drums = ['LinnDrum Classic 🥁', 'Acoustic Punchy 🥁', 'No Beats (Ambient) 🔇'];

  const [genre, setGenre] = useState('');
  const [tempo, setTempo] = useState('');
  const [lead, setLead] = useState('');
  const [drum, setDrum] = useState('');

  const [generating, setGenerating] = useState(false);
  const [composedTrack, setComposedTrack] = useState<string | null>(null);
  const [generationSteps] = useState<string[]>([
    'Setting tempo grid...',
    'Loading generative MIDI model...',
    'Composing synth melodies...',
    'Mixing drum backing pattern...',
    'Applying final EQ & rendering...',
  ]);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackTitle, setTrackTitle] = useState('');

  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const schedulerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const activeNodesRef = React.useRef<AudioNode[]>([]);

  const stopPlayback = () => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    activeNodesRef.current.forEach(n => {
      try { (n as OscillatorNode).stop?.(); } catch (_) {}
      try { n.disconnect(); } catch (_) {}
    });
    activeNodesRef.current = [];
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  React.useEffect(() => () => { stopPlayback(); }, []);

  const playTrack = () => {
    stopPlayback();
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const bpm = tempo.includes('80') ? 80 : tempo.includes('115') ? 115 : 140;
    const beatDur = 60 / bpm;
    const isRetro = genre.includes('8-Bit');
    const isChill = genre.includes('Lo-Fi');

    const waveType: OscillatorType = lead.includes('Square') ? 'square' : lead.includes('Guitar') ? 'sawtooth' : 'sine';
    const melodyPatterns = {
      synth:  [261.6, 329.6, 392.0, 493.9, 392.0, 329.6, 261.6, 220.0],
      retro:  [261.6, 261.6, 329.6, 0,     392.0, 0,     329.6, 261.6],
      chill:  [196.0, 220.0, 261.6, 293.7, 261.6, 220.0, 196.0, 164.8],
    };
    const melody = isChill ? melodyPatterns.chill : isRetro ? melodyPatterns.retro : melodyPatterns.synth;
    const chordNotes = isChill ? [[130.8, 164.8, 196.0], [146.8, 185.0, 220.0]] : [[130.8, 164.8, 196.0, 246.9], [110.0, 138.6, 164.8, 207.7]];

    const createReverb = () => {
      const conv = ctx.createConvolver();
      const len = ctx.sampleRate * 1.5;
      const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      }
      conv.buffer = buf;
      return conv;
    };

    const master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    activeNodesRef.current.push(master);

    let effectNode: AudioNode = master;
    if (isChill) {
      const rev = createReverb();
      const dry = ctx.createGain(); dry.gain.value = 0.6;
      const wet = ctx.createGain(); wet.gain.value = 0.4;
      dry.connect(master); rev.connect(wet); wet.connect(master);
      const mid = ctx.createGain(); mid.gain.value = 1; mid.connect(dry); mid.connect(rev);
      const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 2200;
      const preLpf = ctx.createGain(); preLpf.gain.value = 1; preLpf.connect(lpf); lpf.connect(mid);
      effectNode = preLpf;
      activeNodesRef.current.push(rev, dry, wet, mid, lpf, preLpf);
    }

    let beatIndex = 0;
    const scheduleNote = () => {
      const now = ctx.currentTime;
      const noteFreq = melody[beatIndex % melody.length];
      const step = beatIndex % 16;
      if (noteFreq > 0) {
        const osc = ctx.createOscillator(); const env = ctx.createGain();
        osc.type = isRetro ? 'square' : waveType; osc.frequency.value = isRetro ? noteFreq * 2 : noteFreq;
        env.gain.setValueAtTime(0, now); env.gain.linearRampToValueAtTime(0.6, now + 0.01); env.gain.exponentialRampToValueAtTime(0.001, now + beatDur * 0.8);
        osc.connect(env); env.connect(effectNode as AudioNode); osc.start(now); osc.stop(now + beatDur);
        activeNodesRef.current.push(osc, env);
      }
      if (step % 4 === 0) {
        const chord = chordNotes[(step / 4) % chordNotes.length];
        chord.forEach(freq => {
          const co = ctx.createOscillator(); const ce = ctx.createGain();
          co.type = isChill ? 'sine' : 'sawtooth'; co.frequency.value = freq;
          ce.gain.setValueAtTime(0, now); ce.gain.linearRampToValueAtTime(0.18, now + 0.05); ce.gain.exponentialRampToValueAtTime(0.001, now + beatDur * 3.5);
          co.connect(ce); ce.connect(effectNode as AudioNode); co.start(now); co.stop(now + beatDur * 4);
          activeNodesRef.current.push(co, ce);
        });
      }
      if (step % 2 === 0) {
        const bassFreq = melody[beatIndex % melody.length] / 2;
        const bo = ctx.createOscillator(); const be = ctx.createGain();
        bo.type = 'sine'; bo.frequency.value = bassFreq || 65.4;
        be.gain.setValueAtTime(0, now); be.gain.linearRampToValueAtTime(0.4, now + 0.02); be.gain.exponentialRampToValueAtTime(0.001, now + beatDur * 1.5);
        bo.connect(be); be.connect(effectNode as AudioNode); bo.start(now); bo.stop(now + beatDur * 2);
        activeNodesRef.current.push(bo, be);
      }
      if (!drum.includes('Ambient')) {
        const isHard = drum.includes('Acoustic');
        if (step === 0 || step === 8) {
          const kick = ctx.createOscillator(); const ke = ctx.createGain();
          kick.frequency.setValueAtTime(isHard ? 150 : 100, now); kick.frequency.exponentialRampToValueAtTime(0.001, now + 0.3);
          ke.gain.setValueAtTime(1.0, now); ke.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          kick.connect(ke); ke.connect(master); kick.start(now); kick.stop(now + 0.35); activeNodesRef.current.push(kick, ke);
        }
        if (step === 4 || step === 12) {
          const snareBuf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
          const data = snareBuf.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, isHard ? 1.5 : 3);
          const snare = ctx.createBufferSource(); snare.buffer = snareBuf; const se = ctx.createGain(); se.gain.value = isHard ? 0.7 : 0.45;
          snare.connect(se); se.connect(master); snare.start(now); activeNodesRef.current.push(snare, se);
        }
        const hatEvery = isChill ? 2 : 1;
        if (step % hatEvery === 0) {
          const hatBuf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
          const hd = hatBuf.getChannelData(0); for (let i = 0; i < hd.length; i++) hd[i] = Math.random() * 2 - 1;
          const hat = ctx.createBufferSource(); hat.buffer = hatBuf; const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 8000;
          const he = ctx.createGain(); he.gain.value = 0.2; hat.connect(hpf); hpf.connect(he); he.connect(master); hat.start(now); activeNodesRef.current.push(hat, hpf, he);
        }
      }
      beatIndex++;
    };
    scheduleNote(); schedulerRef.current = setInterval(scheduleNote, beatDur * 1000); setIsPlaying(true);
  };

  const startComposition = () => {
    if (!genre || !tempo || !lead || !drum) return;
    setGenerating(true); setComposedTrack(null); setActiveStep(0); stopPlayback();
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= 5) {
        clearInterval(interval); setGenerating(false);
        const titles = ['Neon Spark Explorer', 'Cyber Forest Groove', '8-Bit Quest Beats', 'Pixel Sunset Loop', 'Lofi AI Cozy Corner'];
        const title = titles[Math.floor(Math.random() * titles.length)];
        setTrackTitle(title); setComposedTrack(`✨ '${title}'`);
      } else setActiveStep(step);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Mix genre, speed, and instruments to let the AI compose a unique track — then hit PLAY to actually hear it!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black space-y-4">
        <p className="font-pixel text-[6px] text-pink-400 uppercase tracking-wider">🎵 AI MUSIC STUDIO</p>

        {!composedTrack && !generating && (
          <div className="space-y-3">
            <div>
              <p className="font-game text-[9px] text-white/60 mb-1">1. Choose Genre Mood</p>
              <div className="grid grid-cols-3 gap-1">
                {genres.map(g => (
                  <button key={g} onClick={() => setGenre(g)} className={`py-1.5 font-pixel text-[5px] border border-black cursor-pointer transition-all ${genre === g ? 'bg-pink-600 text-white' : 'bg-black/20 text-white/40 hover:bg-black/40'}`}>{g}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-game text-[9px] text-white/60 mb-1">2. Set Tempo Speed</p>
              <div className="grid grid-cols-3 gap-1">
                {tempos.map(t => (
                  <button key={t} onClick={() => setTempo(t)} className={`py-1.5 font-pixel text-[5px] border border-black cursor-pointer transition-all ${tempo === t ? 'bg-pink-600 text-white' : 'bg-black/20 text-white/40 hover:bg-black/40'}`}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-game text-[9px] text-white/60 mb-1">3. Select Lead Instrument</p>
              <div className="grid grid-cols-3 gap-1">
                {leads.map(l => (
                  <button key={l} onClick={() => setLead(l)} className={`py-1.5 font-pixel text-[5px] border border-black cursor-pointer transition-all ${lead === l ? 'bg-pink-600 text-white' : 'bg-black/20 text-white/40 hover:bg-black/40'}`}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-game text-[9px] text-white/60 mb-1">4. Select Backing Beats</p>
              <div className="grid grid-cols-3 gap-1">
                {drums.map(d => (
                  <button key={d} onClick={() => setDrum(d)} className={`py-1.5 font-pixel text-[5px] border border-black cursor-pointer transition-all ${drum === d ? 'bg-pink-600 text-white' : 'bg-black/20 text-white/40 hover:bg-black/40'}`}>{d}</button>
                ))}
              </div>
            </div>
            {genre && tempo && lead && drum && (
              <button onClick={startComposition} className="w-full mt-2 py-2.5 bg-pink-600 text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">🎹 Generate AI Music Track!</button>
            )}
          </div>
        )}

        {generating && (
          <div className="p-4 border-2 border-pink-500 bg-pink-950/20 text-center space-y-4">
            <div className="flex justify-center items-end gap-1 h-12">
              {[...Array(6)].map((_, i) => (
                <motion.div key={i} animate={{ height: [12, 48, 12] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} className="w-1.5 bg-pink-500" />
              ))}
            </div>
            <div className="space-y-1">
              <p className="font-pixel text-[6px] text-pink-400">AI COMPOSING IN PROGRESS...</p>
              <p className="font-game text-[9px] text-white animate-pulse">🤖 {generationSteps[activeStep]}</p>
            </div>
          </div>
        )}

        {composedTrack && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 border-2 border-[#10B981] bg-[#10B981]/15 text-center space-y-3">
            <div className="text-3xl">🎵</div>
            <p className="font-pixel text-[6px] text-[#10B981] uppercase">AI TRACK READY — TAP PLAY TO LISTEN</p>
            <p className="font-game text-[10px] text-white leading-relaxed">{composedTrack}</p>

            {/* Animated equalizer visualizer */}
            <div className="flex justify-center items-end gap-1 h-8">
              {[...Array(12)].map((_, i) => (
                isPlaying ? (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 24 + (i % 3) * 6, 4] }}
                    transition={{ duration: 0.35 + (i % 4) * 0.1, repeat: Infinity, delay: i * 0.06 }}
                    className="w-1 bg-pink-400 rounded"
                  />
                ) : (
                  <div key={i} className="w-1 bg-green-400/40 rounded" style={{ height: 6 }} />
                )
              ))}
            </div>

            {isPlaying && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-[8px] font-pixel text-pink-300 animate-pulse">
                ▶ NOW PLAYING: {trackTitle.toUpperCase()} — {genre.split(' ')[0].toUpperCase()} · {tempo.match(/\d+ BPM/)?.[0]}
              </motion.div>
            )}

            <div className="flex gap-2">
              <button
                onClick={isPlaying ? stopPlayback : playTrack}
                className={`flex-1 py-2.5 font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] transition-all ${
                  isPlaying ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-pink-600 text-white hover:bg-pink-700'
                }`}
              >
                {isPlaying ? '⏹ STOP MUSIC' : '▶ PLAY TRACK'}
              </button>
              <button
                onClick={() => { stopPlayback(); setComposedTrack(null); setGenre(''); setTempo(''); setLead(''); setDrum(''); }}
                className="px-3 py-2.5 font-game text-[10px] bg-black/30 text-white/60 border border-black/40 cursor-pointer hover:bg-black/50"
              >
                🔄 Remix
              </button>
            </div>

            <button onClick={() => { stopPlayback(); onComplete(); }}
              className="w-full py-2 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
              Submit Composition ➔
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}


// ─── Module 20: Human vs AI Task Sorter (lesson-22-jr) ───────────────────────
function HumanAICoLab({ onComplete, onCelebrate }: { onComplete: () => void; onCelebrate: () => void }) {
  const tasks = [
    {
      id: 1,
      title: "Feeling empathy & comforting a friend who is crying",
      category: "human",
      reason: "Humans excel at genuine empathy and feelings. AI cannot truly feel sad or hug a friend.",
    },
    {
      id: 2,
      title: "Searching 10,000 photos for a yellow car in 1 second",
      category: "ai",
      reason: "AI can process massive datasets instantly! A human would take hours or days to count them all.",
    },
    {
      id: 3,
      title: "Writing a story with creative ideas + AI checking spelling",
      category: "colab",
      reason: "Perfect teamwork! You provide the heart and creativity, while the AI helps clean up mistakes.",
    },
    {
      id: 4,
      title: "Playing a song on the violin with deep emotion",
      category: "human",
      reason: "Artistic expression comes from personal life experiences and soul, which are uniquely human qualities.",
    },
    {
      id: 5,
      title: "Translating a web page into 50 languages instantly",
      category: "ai",
      reason: "A computer can look up rules and convert vocabulary in milliseconds, making translation incredibly fast.",
    },
  ];

  const [selections, setSelections] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (taskId: number, cat: string) => {
    if (checked) return;
    setSelections(prev => ({ ...prev, [taskId]: cat }));
  };

  const checkAnswers = () => {
    let correct = 0;
    tasks.forEach(t => {
      if (selections[t.id] === t.category) correct++;
    });
    setScore(correct);
    setChecked(true);
    if (correct >= 4) {
      if (correct === tasks.length) {
        setTimeout(onCelebrate, 1500);
      } else {
        setTimeout(onComplete, 3500);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Who does it best? Match each task to either Human, AI, or a Collaborative team (Human + AI)!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <p className="font-pixel text-[6px] text-yellow-400 uppercase tracking-wider mb-3">🤝 HUMAN-AI TEAMWORK CHALLENGE</p>

        <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-2">
          {tasks.map(t => {
            const sel = selections[t.id];
            let borderCol = 'border-white/10';
            if (checked) {
              borderCol = sel === t.category ? 'border-[#10B981] bg-[#10B981]/10' : 'border-[#EF4444] bg-[#EF4444]/10';
            }
            return (
              <div key={t.id} className={`p-2 border-2 bg-black/20 ${borderCol}`}>
                <p className="font-game text-[9px] text-white mb-2">{t.title}</p>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleSelect(t.id, 'human')}
                    disabled={checked}
                    className={`flex-1 py-1 font-pixel text-[5px] border border-black cursor-pointer transition-all ${
                      sel === 'human' ? 'bg-[#3B82F6] text-white' : 'bg-black/20 text-white/40'
                    }`}
                  >
                    🧑 Human
                  </button>
                  <button
                    onClick={() => handleSelect(t.id, 'ai')}
                    disabled={checked}
                    className={`flex-1 py-1 font-pixel text-[5px] border border-black cursor-pointer transition-all ${
                      sel === 'ai' ? 'bg-[#8B5CF6] text-white' : 'bg-black/20 text-white/40'
                    }`}
                  >
                    🤖 AI
                  </button>
                  <button
                    onClick={() => handleSelect(t.id, 'colab')}
                    disabled={checked}
                    className={`flex-1 py-1 font-pixel text-[5px] border border-black cursor-pointer transition-all ${
                      sel === 'colab' ? 'bg-[#FFD60A] text-black font-semibold' : 'bg-black/20 text-white/40'
                    }`}
                  >
                    🤝 Both
                  </button>
                </div>
                {checked && (
                  <p className="font-body text-[8px] text-white/50 mt-1.5 italic leading-snug">{t.reason}</p>
                )}
              </div>
            );
          })}
        </div>

        {Object.keys(selections).length === tasks.length && !checked && (
          <button
            onClick={checkAnswers}
            className="w-full mt-3 py-2.5 bg-[#FFD60A] text-black font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            📊 Verify AI Teamwork Sorting
          </button>
        )}

        {checked && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`mt-3 p-3 border-2 text-center ${score >= 4 ? 'border-[#10B981] bg-[#10B981]/15' : 'border-yellow-500 bg-yellow-900/10'}`}>
            <p className="font-game text-xs text-white">Score: {score}/{tasks.length}</p>
            {score >= 4 ? (
              <p className="font-body text-[10px] text-white/60 mt-1">Excellent! You perfectly understand how humans and AI can combine their strengths.</p>
            ) : (
              <div className="space-y-2">
                <p className="font-body text-[10px] text-white/60">Review your choices and try again to get at least 4/5 correct!</p>
                <button onClick={() => { setSelections({}); setChecked(false); }}
                  className="px-4 py-1.5 font-game text-[8px] bg-yellow-600 text-white border border-black cursor-pointer">
                  Try Again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Main TopicLab Router ─────────────────────────────────────────────────────
export default function TopicLab({ lessonId, onComplete }: TopicLabProps) {
  const { showSuccessCelebration, showPartialSuccessCelebration } = useFeedbackEngine();

  const handleCelebrate = () => {
    showSuccessCelebration({
      title: "100% Correct!",
      subtitle: "Perfect score! You are an AI genius! 🤖",
      xpGained: 15,
      coinsGained: 10,
      onDone: onComplete,
    });
  };

  const handleCompleteIntercept = () => {
    showPartialSuccessCelebration({
      title: "GOOD EFFORT!",
      subtitle: "You completed the lab! Keep practicing to get 100%!",
      xpGained: 10,
      coinsGained: 5,
      onDone: onComplete,
    });
  };

  const renderLab = () => {
    switch (lessonId) {
      case 'lesson-5':       return <VoiceRecognitionLab onComplete={handleCompleteIntercept} />;
      case 'lesson-2':       return <RecommendationLab onComplete={handleCompleteIntercept} />;
      case 'lesson-12':      return <FutureAILab onComplete={handleCompleteIntercept} onCelebrate={handleCelebrate} />;
      case 'lesson-10-jr':   return <FairnessLab onComplete={handleCompleteIntercept} onCelebrate={handleCelebrate} />;
      case 'lesson-13-jr':   return <GameAILab onComplete={handleCompleteIntercept} />;
      case 'lesson-16-jr':   return <HealthAILab onComplete={handleCompleteIntercept} />;
      case 'lesson-17-jr':   return <SmartHomeLab onComplete={handleCompleteIntercept} onCelebrate={handleCelebrate} />;
      case 'lesson-15-jr':   return <EcoAILab onComplete={handleCompleteIntercept} onCelebrate={handleCelebrate} />;
      case 'lesson-19-jr':   return <WildlifeAILab onComplete={handleCompleteIntercept} onCelebrate={handleCelebrate} />;
      case 'lesson-11':      return <IndiaAILab onComplete={handleCompleteIntercept} onCelebrate={handleCelebrate} />;
      case 'lesson-18-jr':   return <SmartFarmLab onComplete={handleCompleteIntercept} />;
      case 'lesson-20-jr':   return <CyberSafetyLab onComplete={handleCompleteIntercept} onCelebrate={handleCelebrate} />;
      case 'lesson-21-jr':   return <MusicComposerLab onComplete={handleCompleteIntercept} />;
      case 'lesson-22-jr':   return <HumanAICoLab onComplete={handleCompleteIntercept} onCelebrate={handleCelebrate} />;
      default:               return null;
    }
  };

  return (
    <>
      {renderLab()}
    </>
  );
}
