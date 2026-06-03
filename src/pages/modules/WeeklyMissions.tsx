import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { WEEKLY_MISSIONS_DATA } from '@/data/curriculum';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, CheckCircle, XCircle, Zap, ArrowLeft, HelpCircle, Sparkles } from 'lucide-react';
import { generateMissionSuggestions, evaluateMissionSubmission } from '@/lib/gemini';

interface Submission { 
  missionId: number; 
  text: string; 
  status: string; 
  xp: number; 
  submittedAt: string; 
  score?: number; 
  feedback?: string; 
}

const MISSION_HELPERS: Record<number, { goal: string; examples: string; validationDesc: string }> = {
  1: {
    goal: "Find 3 smart items or AI-powered features in your home.",
    examples: "FaceID / fingerprint phone unlock, YouTube/Netflix recommendations, smart voice assistants (Alexa/Siri), robotic vacuum cleaner, smart light bulbs, or smart AC schedule.",
    validationDesc: "Identify and describe at least 3 smart/AI features or devices and explain why they are smart."
  },
  2: {
    goal: "Find 3 spots in your school or home where people waste time waiting.",
    examples: "Waiting in line at the school canteen, waiting at the school bus stop, waiting to check out books in the library, or gate queues.",
    validationDesc: "Propose how predictive AI, smart cameras, or scheduling apps could predict, automate, or reduce this waiting time."
  },
  3: {
    goal: "Spot a real-world problem in your neighbourhood, school, or city.",
    examples: "Water pipe leaks, overflowing trash bins, dark unlit streetlights, unsafe potholes on the road, or garbage pile-ups.",
    validationDesc: "Describe the issue clearly and suggest how AI sensors, smart cameras, or automated mapping could detect it automatically."
  },
  4: {
    goal: "Interview an adult (parent, teacher, neighbour) about technology at work.",
    examples: "Ask them: 'What smart software, spreadsheets, computer apps, or automation tools do you use to make your job easier?'",
    validationDesc: "Summarize who you interviewed, what their profession is, and the technology tools they rely on daily."
  }
};

const validateSubmission = (missionId: number, text: string) => {
  const t = text.trim().toLowerCase();
  
  if (missionId === 1) {
    const keywords = ['phone', 'mobile', 'camera', 'face id', 'fingerprint', 'alexa', 'siri', 'assistant', 'speaker', 'tv', 'television', 'refrigerator', 'fridge', 'vacuum', 'robot', 'youtube', 'netflix', 'spotify', 'light', 'bulb', 'ac', 'conditioner', 'smart', 'ai', 'algorithm', 'app', 'feed', 'recommend'];
    const matches = keywords.filter(kw => t.includes(kw));
    const minChars = 35;
    const hasEnoughChars = text.trim().length >= minChars;
    const hasSmartKeywords = matches.length >= 2;
    const nonRepetitive = !/(.)\1{4,}/.test(t) && !/^(xyz|abc|test|qwerty|asdf)/.test(t) && text.trim().split(/\s+/).length >= 5;
    
    return {
      isValid: hasEnoughChars && hasSmartKeywords && nonRepetitive,
      requirements: [
        { label: `📝 Write at least ${minChars} characters of description`, done: hasEnoughChars },
        { label: "🤖 Mention smart features (e.g. phone camera, Alexa, YouTube, smart TV)", done: hasSmartKeywords },
        { label: "💡 Provide a realistic description (no random letters or spam)", done: nonRepetitive },
      ]
    };
  }
  
  if (missionId === 2) {
    const scenarios = ['queue', 'line', 'wait', 'bus', 'traffic', 'canteen', 'lunch', 'library', 'counter', 'gate', 'office', 'register', 'store', 'shop'];
    const aiSolutions = ['predict', 'optimize', 'schedule', 'app', 'alert', 'route', 'camera', 'sensor', 'automated', 'time', 'manage'];
    const hasScenario = scenarios.some(kw => t.includes(kw));
    const hasAISolution = aiSolutions.some(kw => t.includes(kw));
    const minChars = 35;
    const hasEnoughChars = text.trim().length >= minChars;
    const nonRepetitive = !/(.)\1{4,}/.test(t) && !/^(xyz|abc|test|qwerty|asdf)/.test(t) && text.trim().split(/\s+/).length >= 5;

    return {
      isValid: hasEnoughChars && hasScenario && hasAISolution && nonRepetitive,
      requirements: [
        { label: `📝 Write at least ${minChars} characters explaining the scenarios`, done: hasEnoughChars },
        { label: "⏰ Describe waiting areas (e.g. canteen queue, bus stop, library)", done: hasScenario },
        { label: "💡 Explain how AI/apps can help predict or reduce the wait", done: hasAISolution },
      ]
    };
  }
  
  if (missionId === 3) {
    const problems = ['trash', 'waste', 'garbage', 'leak', 'water', 'light', 'streetlight', 'hole', 'road', 'traffic', 'pollution', 'broken', 'dirty', 'litter'];
    const techSolutions = ['sensor', 'camera', 'ai', 'app', 'system', 'detect', 'notify', 'alert', 'analyze', 'satellite', 'monitor'];
    const hasProblem = problems.some(kw => t.includes(kw));
    const hasTechSolution = techSolutions.some(kw => t.includes(kw));
    const minChars = 40;
    const hasEnoughChars = text.trim().length >= minChars;
    const nonRepetitive = !/(.)\1{4,}/.test(t) && !/^(xyz|abc|test|qwerty|asdf)/.test(t) && text.trim().split(/\s+/).length >= 5;

    return {
      isValid: hasEnoughChars && hasProblem && hasTechSolution && nonRepetitive,
      requirements: [
        { label: `📝 Detailed description (at least ${minChars} characters)`, done: hasEnoughChars },
        { label: "🌍 Describe a real local problem (e.g. trash leak, broken lights, traffic)", done: hasProblem },
        { label: "🤖 Propose a smart tech/AI solution (e.g. sensors, auto alerts, cameras)", done: hasTechSolution },
      ]
    };
  }
  
  if (missionId === 4) {
    const people = ['father', 'mother', 'parent', 'teacher', 'neighbour', 'uncle', 'aunt', 'doctor', 'shopkeeper', 'adult', 'friend', 'colleague', 'he', 'she', 'they', 'mr', 'mrs', 'ms'];
    const technology = ['computer', 'laptop', 'excel', 'software', 'app', 'email', 'search', 'write', 'track', 'teach', 'sell', 'record', 'system', 'smart', 'tool', 'internet', 'ai'];
    const hasPerson = people.some(kw => t.includes(kw));
    const hasTech = technology.some(kw => t.includes(kw));
    const minChars = 40;
    const hasEnoughChars = text.trim().length >= minChars;
    const nonRepetitive = !/(.)\1{4,}/.test(t) && !/^(xyz|abc|test|qwerty|asdf)/.test(t) && text.trim().split(/\s+/).length >= 5;

    return {
      isValid: hasEnoughChars && hasPerson && hasTech && nonRepetitive,
      requirements: [
        { label: `📝 Write at least ${minChars} characters summarizing the interview`, done: hasEnoughChars },
        { label: "👤 State who you interviewed (e.g. parent, teacher, shopkeeper)", done: hasPerson },
        { label: "💻 List the software, computers, or smart apps they use", done: hasTech },
      ]
    };
  }
  
  return {
    isValid: text.trim().length >= 10,
    requirements: [
      { label: "📝 Write at least 10 characters", done: text.trim().length >= 10 }
    ]
  };
};

export default function WeeklyMissions() {
  const { user, profile, guestProfile, isGuest, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'missions' | 'submissions'>('missions');
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    return JSON.parse(localStorage.getItem('mission_submissions') || '[]');
  });

  // AI Suggestions states
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // AI Evaluation states
  const [evaluationResult, setEvaluationResult] = useState<{
    score: number;
    feedback: string;
    earnedXp: number;
  } | null>(null);
  const [showGradeCard, setShowGradeCard] = useState(false);

  const resetAIStates = () => {
    setSuggestions([]);
    setLoadingSuggestions(false);
    setEvaluationResult(null);
    setShowGradeCard(false);
  };

  const handleGetSuggestions = async () => {
    if (!mission) return;
    setLoadingSuggestions(true);
    try {
      const goalText = MISSION_HELPERS[mission.id]?.goal || mission.description;
      const res = await generateMissionSuggestions(mission.title, goalText, text);
      setSuggestions(res);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleApplySuggestion = (suggestion: string) => {
    if (text.trim() === '') {
      setText(suggestion);
    } else {
      setText(prev => `${prev.trim()} ${suggestion}`);
    }
  };


  const mission = WEEKLY_MISSIONS_DATA.find(m => m.id === selectedMission);
  const isSubmitted = (id: number) => submissions.some(s => s.missionId === id && s.status === 'approved');

  const validation = mission ? validateSubmission(mission.id, text) : { isValid: false, requirements: [] };

  const [toastXP, setToastXP] = useState(80);

  const handleSubmit = async () => {
    if (!mission || !validation.isValid) return;
    setSubmitting(true);
    
    const goalText = MISSION_HELPERS[mission.id]?.goal || mission.description;
    
    try {
      const evalResult = await evaluateMissionSubmission(mission.title, goalText, text);
      const earnedXp = evalResult.passed ? Math.max(20, Math.round((evalResult.score / 100) * mission.xp_reward)) : 0;
      
      if (evalResult.passed) {
        const submission: Submission = {
          missionId: mission.id,
          text,
          status: 'approved',
          xp: earnedXp,
          submittedAt: new Date().toISOString(),
          score: evalResult.score,
          feedback: evalResult.feedback
        };

        if (user) {
          await supabase.from('mission_submissions').insert({
            user_id: user.id,
            mission_id: mission.id,
            text_observation: text,
            status: 'approved',
            earned_xp: earnedXp,
          });
          
          await updateProfile({
            xp: (profile?.xp ?? 0) + earnedXp
          });
        } else if (isGuest) {
          await updateProfile({
            xp: (guestProfile?.xp ?? 0) + earnedXp
          });
        }

        const newSubs = [...submissions, submission];
        setSubmissions(newSubs);
        localStorage.setItem('mission_submissions', JSON.stringify(newSubs));
        setToastXP(earnedXp);
      }

      setEvaluationResult({
        score: evalResult.score,
        feedback: evalResult.feedback,
        earnedXp
      });
      setShowGradeCard(true);
    } catch (error) {
      console.warn('Gemini evaluation failed, falling back to local verification:', error);
      try {
        const evalResult = await evaluateMissionSubmission(mission.title, goalText, text);
        const earnedXp = evalResult.passed ? Math.max(20, Math.round((evalResult.score / 100) * mission.xp_reward)) : 0;
        
        if (evalResult.passed) {
          const submission: Submission = {
            missionId: mission.id,
            text,
            status: 'approved',
            xp: earnedXp,
            submittedAt: new Date().toISOString(),
            score: evalResult.score,
            feedback: evalResult.feedback
          };

          if (user) {
            await supabase.from('mission_submissions').insert({
              user_id: user.id,
              mission_id: mission.id,
              text_observation: text,
              status: 'approved',
              earned_xp: earnedXp,
            });
            
            await updateProfile({
              xp: (profile?.xp ?? 0) + earnedXp
            });
          } else if (isGuest) {
            await updateProfile({
              xp: (guestProfile?.xp ?? 0) + earnedXp
            });
          }

          const newSubs = [...submissions, submission];
          setSubmissions(newSubs);
          localStorage.setItem('mission_submissions', JSON.stringify(newSubs));
          setToastXP(earnedXp);
        }

        setEvaluationResult({
          score: evalResult.score,
          feedback: evalResult.feedback,
          earnedXp
        });
        setShowGradeCard(true);
      } catch (fallbackError) {
        console.error('Local verification fallback failed:', fallbackError);
      }
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <div className="min-h-full pb-6">
      {showXP && <XPToast amount={toastXP} reason="Mission submitted!" onDone={() => setShowXP(false)} />}

      {/* Header */}
      <div className="p-5" style={{ background: 'linear-gradient(180deg, rgba(124,58,237,0.2), transparent)' }}>
        <h1 className="font-pixel text-[10px] text-white flex items-center gap-2 tracking-wide">🎯 WEEKLY MISSIONS</h1>
        <p className="text-white/55 font-body text-sm mt-1">Real-world field challenges — earn massive XP!</p>

        {/* Tabs */}
        <div className="flex mt-4 p-1" style={{ background: '#16103A', border: '2px solid rgba(124,58,237,0.3)' }}>
          {(['missions', 'submissions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 font-pixel text-[6px] transition-all duration-150 tracking-wide"
              style={activeTab === tab ? {
                background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                color: 'white',
                boxShadow: '2px 2px 0px #5B21B6',
              } : { color: 'rgba(255,255,255,0.4)' }}>
              {tab === 'missions' ? '🎯 MISSIONS' : '📋 SUBMISSIONS'}
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
                  className="p-5"
                  style={done ? {
                    background: 'linear-gradient(135deg, #0D3B2E, #1E1B4B)',
                    border: '3px solid #10B981',
                    boxShadow: '4px 4px 0px #047857',
                  } : {
                    background: '#1E1B4B',
                    border: '3px solid rgba(124,58,237,0.4)',
                    boxShadow: '4px 4px 0px rgba(0,0,0,0.6)',
                  }}
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
                    <div className="mt-3 pt-2 text-center" style={{ borderTop: '2px solid rgba(16,185,129,0.3)' }}>
                      <span className="font-pixel text-[6px] tracking-wide" style={{ color: '#10B981' }}>✅ MISSION COMPLETED!</span>
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
                <div key={i} className="p-4" style={{ background: 'linear-gradient(135deg, #0D3B2E, #1E1B4B)', border: '3px solid #10B981', boxShadow: '3px 3px 0px #047857' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{m?.emoji}</span>
                    <div className="flex-1">
                      <div className="text-white font-game text-sm">{m?.title}</div>
                      <div className="text-white/50 font-body text-xs">{new Date(s.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="font-pixel text-[7px] px-2 py-1 text-white" style={{ background: 'linear-gradient(135deg, #10B981, #3B82F6)', border: '2px solid #047857', boxShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>+{s.xp} XP</span>
                      {s.score !== undefined && (
                        <span className="bg-primary/20 border border-primary/40 text-primary-light font-pixel text-[8px] px-1">
                          Score: {s.score}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="bg-black/20 border-l-4 border-success p-3">
                    <p className="text-white/80 font-body text-sm italic">"{s.text}"</p>
                  </div>
                  {s.feedback && (
                    <div className="mt-2 text-[10px] font-body bg-black/30 border-l-4 border-primary p-2 text-white/70">
                      <strong className="text-primary font-game text-[8px] block mb-0.5">🤖 AI Feedback:</strong>
                      {s.feedback}
                    </div>
                  )}
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
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md my-auto"
              style={{ background: '#1E1B4B', border: '4px solid #7C3AED', boxShadow: '6px 6px 0px #5B21B6' }}
            >
              {/* Header */}
              <div className="p-4 flex items-center gap-3" style={{ background: '#16103A', borderBottom: '3px solid #7C3AED' }}>
                <span className="text-3xl">{mission.emoji}</span>
                <div>
                  <div className="text-white font-game text-sm">{mission.title}</div>
                  <div className="text-warning font-body text-xs">+{mission.xp_reward} XP on completion</div>
                </div>
              </div>

              {showGradeCard && evaluationResult ? (
                /* Report Card View */
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 space-y-6 text-center"
                >
                  <div className="space-y-1">
                    <span className="text-4xl">🏆</span>
                    <h3 className="text-white font-game text-sm uppercase tracking-wide">Mission Evaluated!</h3>
                    <p className="text-white/50 font-body text-[10px]">QuestAI Evaluator Results</p>
                  </div>

                  {/* Circular / Large Score Badge */}
                  <div className={`relative w-32 h-32 mx-auto flex flex-col items-center justify-center border-8 border-black bg-game rounded-full ${
                    evaluationResult.score >= 50 
                      ? 'shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
                      : 'shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  }`}>
                    <div className="text-[9px] font-game text-white/40 uppercase tracking-widest">Score</div>
                    <div className={`text-3xl font-game animate-pulse ${
                      evaluationResult.score >= 50 ? 'text-success' : 'text-pixel-red'
                    }`}>
                      {evaluationResult.score}%
                    </div>
                    <div className="text-[10px] font-body text-white/60 mt-1">
                      Grade: {
                        evaluationResult.score >= 90 ? 'A+' :
                        evaluationResult.score >= 80 ? 'A' :
                        evaluationResult.score >= 70 ? 'B' :
                        evaluationResult.score >= 50 ? 'C' : 'F'
                      }
                    </div>
                  </div>

                  {/* XP Reward Banner */}
                  <div className={`border-4 border-black p-3 flex items-center justify-center gap-3 ${
                    evaluationResult.score >= 50 ? 'bg-warning/10' : 'bg-pixel-red/10'
                  }`}>
                    {evaluationResult.score >= 50 ? (
                      <>
                        <Zap className="w-6 h-6 text-warning animate-bounce" />
                        <div className="text-left">
                          <div className="text-warning font-game text-xs">+{evaluationResult.earnedXp} XP Awarded</div>
                          <div className="text-white/50 font-body text-[9px]">Added to your profile</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-pixel-red animate-bounce" />
                        <div className="text-left">
                          <div className="text-pixel-red font-game text-xs">0 XP Earned</div>
                          <div className="text-white/50 font-body text-[9px]">Score must be at least 50% to pass</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* AI Feedback Bubble */}
                  <div className="border-4 border-black bg-black/40 p-4 text-left relative mt-2">
                    <div className="absolute -top-3 left-4 bg-primary text-black font-game text-[8px] px-2 py-0.5 border-2 border-black">
                      🤖 AI Feedback
                    </div>
                    <p className="text-white/90 font-body text-xs leading-relaxed mt-1">
                      {evaluationResult.feedback}
                    </p>
                  </div>

                  {/* Claim or Retry Button */}
                  {evaluationResult.score >= 50 ? (
                    <Button
                      variant="success"
                      fullWidth
                      onClick={() => {
                        setSelectedMission(null);
                        setText('');
                        setShowXP(true);
                        resetAIStates();
                      }}
                    >
                      Claim Rewards & Return! 🎒
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      fullWidth
                      onClick={() => {
                        setShowGradeCard(false);
                        setEvaluationResult(null);
                      }}
                    >
                      Try Again to Improve! 🔄
                    </Button>
                  )}
                </motion.div>
              ) : (
                /* Edit / Input View */
                <>
                  {/* Instructions */}
                  <div className="p-4 border-b-4 border-black bg-primary/10">
                    <div className="text-white font-game text-[10px] uppercase text-primary tracking-wider mb-1 flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" /> Step-by-Step Instructions
                    </div>
                    <p className="text-white font-body text-xs font-semibold leading-relaxed">
                      {MISSION_HELPERS[mission.id]?.goal}
                    </p>
                    <div className="mt-2 text-white/70 font-body text-[11px] leading-relaxed">
                      <strong className="text-warning">💡 Examples:</strong> {MISSION_HELPERS[mission.id]?.examples}
                    </div>
                    <div className="mt-2 text-white/50 font-body text-[10px] leading-relaxed border-t border-white/5 pt-1">
                      <strong className="text-white/70">⚙️ How it is validated:</strong> {MISSION_HELPERS[mission.id]?.validationDesc}
                    </div>
                  </div>

                  {/* Input & Live Checklist */}
                  <div className="p-5 space-y-4">
                    <div>
                      <label className="text-white/70 font-body text-xs mb-2 block flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" /> Your Observation:
                      </label>
                      <textarea value={text} onChange={e => setText(e.target.value)}
                        placeholder="Provide your detailed observation here..."
                        className="pixel-input h-28 resize-none text-xs" maxLength={500} />
                      <div className="flex justify-between items-center mt-1">
                        <button
                          type="button"
                          onClick={handleGetSuggestions}
                          disabled={loadingSuggestions}
                          className="flex items-center gap-1 text-primary hover:text-primary-light text-[9px] font-game bg-primary/10 hover:bg-primary/20 px-2 py-1 border border-primary/20 rounded transition-all"
                        >
                          <Sparkles className="w-3 h-3 animate-pulse" />
                          {loadingSuggestions ? 'Asking Gemini...' : '💡 Ask Gemini for suggestions'}
                        </button>
                        <div className="text-white/30 font-body text-xs">{text.length}/500</div>
                      </div>
                    </div>

                    {/* Suggestions list */}
                    {suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 border-primary bg-primary/5 p-3 space-y-2 relative"
                      >
                        <div className="absolute -top-2.5 right-3 bg-primary text-black font-game text-[8px] px-1.5 py-0.5 border border-black rounded">
                          Gemini Suggestions
                        </div>
                        <div className="text-[9px] font-body text-white/50 mb-1">
                          Click any hint below to add it to your observation:
                        </div>
                        <div className="space-y-1">
                          {suggestions.map((sug, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleApplySuggestion(sug)}
                              className="w-full text-left bg-black/30 hover:bg-black/50 border border-white/10 hover:border-primary/45 p-2 text-[10px] font-body text-white/80 hover:text-white transition-all flex items-start gap-1"
                            >
                              <span className="text-primary font-bold">•</span>
                              <span>{sug}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Validation Checklist */}
                    <div className="border-2 border-black bg-game p-3">
                      <div className="text-white/50 font-game text-[9px] uppercase tracking-wider mb-2">AI Verification Checklist</div>
                      <div className="space-y-1.5">
                        {validation.requirements.map((req, index) => (
                          <div key={index} className="flex items-start gap-2">
                            {req.done ? (
                              <CheckCircle className="w-3.5 h-3.5 text-success flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-pixel-red flex-shrink-0 mt-0.5 opacity-60" />
                            )}
                            <span className={`text-[10px] font-body transition-colors leading-tight ${req.done ? 'text-white' : 'text-white/40'}`}>
                              {req.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit / Cancel Buttons */}
                    <div className="flex gap-3 pt-2">
                      <Button variant="ghost" onClick={() => { setSelectedMission(null); setText(''); resetAIStates(); }}>Cancel</Button>
                      <Button variant="success" fullWidth loading={submitting} disabled={!validation.isValid} onClick={handleSubmit}>
                        Submit Mission! 🚀
                      </Button>
                    </div>
                  </div>
                </>
              )}

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
