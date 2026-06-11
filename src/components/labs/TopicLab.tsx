import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, Star, Award } from 'lucide-react';
import { AICompanion } from '../ui/AICompanion';

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
function FairnessLab({ onComplete }: { onComplete: () => void }) {
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
    if (idx === scenarios[current].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= scenarios.length) {
        setFinished(true);
        setTimeout(onComplete, 2500);
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
        <button onClick={onComplete} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
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
function SmartHomeLab({ onComplete }: { onComplete: () => void }) {
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
    if (correct >= 6) setTimeout(onComplete, 3000);
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
function WildlifeAILab({ onComplete }: { onComplete: () => void }) {
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
    setTimeout(onComplete, 3000);
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
            <button onClick={onComplete} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
              Submit Lab ➔
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 5: Voice Recognition Lab (lesson-5) ──────────────────────────────
function VoiceRecognitionLab({ onComplete }: { onComplete: () => void }) {
  const steps = [
    {
      icon: '🎙️',
      title: 'Step 1: Wake Word Detection',
      q: 'What does Alexa listen for BEFORE it understands your command?',
      options: ['Everything you say', 'Only the wake word "Alexa"', 'Your location', 'Your name'],
      correct: 1,
      fact: 'Alexa uses a tiny on-device neural network ONLY listening for its wake word to save battery and protect privacy!',
    },
    {
      icon: '🔊',
      title: 'Step 2: Audio → Text',
      q: 'What happens after Alexa hears its wake word?',
      options: ['It plays music immediately', 'It converts your speech to text using Speech Recognition', 'It calls your phone', 'It takes a photo'],
      correct: 1,
      fact: 'Your voice is converted to text (transcription) using automatic speech recognition (ASR) — then AI understands the text!',
    },
    {
      icon: '🧠',
      title: 'Step 3: Understanding Intent',
      q: 'If you say "Set a timer for 5 minutes", what does NLP identify?',
      options: ['Random words', 'Intent: SET-TIMER, Entity: 5-minutes', 'Just the word "timer"', 'A music request'],
      correct: 1,
      fact: 'Natural Language Processing (NLP) identifies your INTENT (what you want) and ENTITIES (specific details like numbers or names)!',
    },
  ];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleAnswer = (idx: number) => {
    setSelected(idx);
    if (idx === steps[current].correct) setScore(s => s + 1);
    setTimeout(() => {
      if (current + 1 >= steps.length) {
        setDone(true);
        setTimeout(onComplete, 2500);
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 2200);
  };

  if (done) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="p-4 border-2 border-[#10B981] bg-[#10B981]/10 text-center space-y-2">
        <div className="text-3xl">🎤</div>
        <p className="font-game text-xs text-white">Voice AI Score: {score}/{steps.length}</p>
        <p className="font-body text-[10px] text-white/60">You now understand how smart speakers process your voice!</p>
        <button onClick={onComplete} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
          Submit Lab ➔
        </button>
      </motion.div>
    );
  }

  const step = steps[current];
  return (
    <div className="space-y-4">
      <div className="p-3 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000]">
        <AICompanion state="teaching" message="Follow the voice AI pipeline step by step — from wake word to understanding commands!" size="sm" />
      </div>

      <div className="p-3 bg-[#1E1B4B] border-2 border-black">
        <div className="flex gap-2 mb-3">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 border border-black ${i <= current ? 'bg-[#3B82F6]' : 'bg-black/30'}`} />
          ))}
        </div>
        <p className="font-pixel text-[6px] text-[#A78BFA] uppercase tracking-wider mb-1">{step.icon} {step.title}</p>
        <p className="font-body text-xs text-white leading-relaxed mb-4">{step.q}</p>
        <div className="space-y-2">
          {step.options.map((opt, i) => {
            let cls = 'bg-black/30 text-white/70 border-white/10 hover:bg-black/50';
            if (selected !== null) {
              if (i === step.correct) cls = 'bg-[#10B981]/20 border-[#10B981] text-white';
              else if (i === selected) cls = 'bg-[#EF4444]/20 border-[#EF4444] text-white';
            }
            return (
              <button key={i} onClick={() => selected === null && handleAnswer(i)}
                className={`w-full text-left px-3 py-2 font-body text-xs border transition-all cursor-pointer ${cls}`}>
                {opt}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className="mt-3 p-2 bg-blue-900/30 border border-blue-500/30 font-body text-[10px] text-white/80 leading-relaxed">
            💡 {step.fact}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Module 8: Future of AI Quiz (lesson-12) ─────────────────────────────────
function FutureAILab({ onComplete }: { onComplete: () => void }) {
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
    setTimeout(onComplete, 3500);
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
            <button onClick={onComplete} className="mt-3 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
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
function EcoAILab({ onComplete }: { onComplete: () => void }) {
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
    if (correct >= 4) setTimeout(onComplete, 3000);
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
              <button onClick={onComplete} className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]">
                Submit Lab ➔
              </button>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

// ─── Main TopicLab Router ─────────────────────────────────────────────────────
export default function TopicLab({ lessonId, onComplete }: TopicLabProps) {
  switch (lessonId) {
    case 'lesson-5':       return <VoiceRecognitionLab onComplete={onComplete} />;
    case 'lesson-2':       return <RecommendationLab onComplete={onComplete} />;
    case 'lesson-12':      return <FutureAILab onComplete={onComplete} />;
    case 'lesson-10-jr':   return <FairnessLab onComplete={onComplete} />;
    case 'lesson-13-jr':   return <GameAILab onComplete={onComplete} />;
    case 'lesson-16-jr':   return <HealthAILab onComplete={onComplete} />;
    case 'lesson-17-jr':   return <SmartHomeLab onComplete={onComplete} />;
    case 'lesson-15-jr':   return <EcoAILab onComplete={onComplete} />;
    case 'lesson-19-jr':   return <WildlifeAILab onComplete={onComplete} />;
    default:               return null;
  }
}
