import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { XPToast, CardProgressBadge, CardProgressBar } from '@/components/ui/GameUI';
import { WEEKLY_MISSIONS_DATA } from '@/data/curriculum';
import { supabase } from '@/lib/supabase';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { FileText, CheckCircle, XCircle, Zap, ArrowLeft, HelpCircle, Sparkles, Play, Lock } from 'lucide-react';
import { generateMissionSuggestions, evaluateMissionSubmission } from '@/lib/gemini';
import { getPlatformProgress } from '@/lib/gamification';
import { XPBottle } from '@/components/ui/XPBottle';

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
  // Junior missions
  1: {
    goal: "Find 3 smart items or AI-powered features in your home.",
    examples: "FaceID / fingerprint phone unlock, YouTube/Netflix recommendations, smart voice assistants (Alexa/Siri), robotic vacuum cleaner, smart light bulbs, or smart AC schedule.",
    validationDesc: "Identify and describe at least 3 smart/AI features or devices and explain why they are smart."
  },
  2: {
    goal: "Find 2 examples of technology or apps that help animals — describe each one.",
    examples: "A GPS pet tracker collar, a veterinary diagnosis app, a wildlife camera that sends alerts, or an app that helps identify animal species from a photo.",
    validationDesc: "Describe at least 2 technology examples that help animals and explain how they work."
  },
  3: {
    goal: "Watch a screen for 10 minutes and note 3 times AI made a recommendation or suggestion to you.",
    examples: "YouTube suggesting 'watch next', Netflix showing 'you might also like', Spotify playlist suggestions, or Google Maps suggesting a route automatically.",
    validationDesc: "Describe 3 specific moments where an app or screen suggested something to you, and explain how AI might be involved."
  },
  4: {
    goal: "Ask a parent or sibling to show you one way technology makes their day easier.",
    examples: "A smart calendar reminder, a Google Maps route, a recipe app, an automatic bill payment, or a work email tool.",
    validationDesc: "Describe who you asked, what they showed you, and explain in simple terms how it makes their life easier."
  },
  // Innovator missions
  101: {
    goal: "Find 3 spots in your school or neighbourhood where people waste time waiting.",
    examples: "Waiting in line at the school canteen, waiting at the school bus stop, waiting to check out books in the library, or gate queues.",
    validationDesc: "Propose how predictive AI, smart cameras, or scheduling apps could predict, automate, or reduce this waiting time."
  },
  102: {
    goal: "Spot a real-world problem in your neighbourhood, school, or city.",
    examples: "Water pipe leaks, overflowing trash bins, dark unlit streetlights, unsafe potholes on the road, or garbage pile-ups.",
    validationDesc: "Describe the issue clearly and suggest how AI sensors, smart cameras, or automated mapping could detect it automatically."
  },
  103: {
    goal: "Interview an adult (parent, teacher, neighbour) about technology at work.",
    examples: "Ask them: 'What smart software, spreadsheets, computer apps, or automation tools do you use to make your job easier?'",
    validationDesc: "Summarize who you interviewed, what their profession is, and the technology tools they rely on daily."
  },
  104: {
    goal: "Find one example where AI gave an unfair or surprising result and explain why it may have happened.",
    examples: "A voice assistant that misunderstands certain accents, an image search that shows biased results, or an AI hiring tool that treats different people differently.",
    validationDesc: "Describe the AI system, explain what unfair or surprising result occurred, and suggest why the training data might have caused it."
  },
};
const validateSubmission = (missionId: number, text: string) => {
  const t = text.trim().toLowerCase();
  const nonRepetitive = !/(.)\\1{4,}/.test(t) && !/^(xyz|abc|test|qwerty|asdf)/.test(t) && text.trim().split(/\s+/).length >= 5;
  
  // ── JUNIOR MISSIONS ───────────────────────────────────
  if (missionId === 1) {
    const keywords = ['phone', 'mobile', 'camera', 'face id', 'fingerprint', 'alexa', 'siri', 'assistant', 'speaker', 'tv', 'television', 'refrigerator', 'fridge', 'vacuum', 'robot', 'youtube', 'netflix', 'spotify', 'light', 'bulb', 'ac', 'conditioner', 'smart', 'ai', 'algorithm', 'app', 'feed', 'recommend'];
    const matches = keywords.filter(kw => t.includes(kw));
    const minChars = 35;
    const hasEnoughChars = text.trim().length >= minChars;
    const hasSmartKeywords = matches.length >= 2;
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
    // Animal Friend AI — mention animals + technology
    const animalKeywords = ['dog', 'cat', 'pet', 'animal', 'bird', 'fish', 'cow', 'wildlife', 'vet', 'collar', 'tracker', 'wildlife', 'nature'];
    const techKeywords = ['app', 'tracker', 'gps', 'camera', 'sensor', 'technology', 'device', 'smart', 'ai', 'identify', 'detect', 'monitor'];
    const hasAnimal = animalKeywords.some(kw => t.includes(kw));
    const hasTech = techKeywords.some(kw => t.includes(kw));
    const minChars = 30;
    const hasEnoughChars = text.trim().length >= minChars;
    return {
      isValid: hasEnoughChars && hasAnimal && hasTech && nonRepetitive,
      requirements: [
        { label: `📝 Write at least ${minChars} characters`, done: hasEnoughChars },
        { label: "🐾 Mention animals or pets", done: hasAnimal },
        { label: "📱 Describe a technology or app that helps them", done: hasTech },
      ]
    };
  }
  
  if (missionId === 3) {
    // Smart Screen Spotter — mention a screen and recommendations
    const screenKeywords = ['youtube', 'netflix', 'spotify', 'phone', 'tv', 'screen', 'tablet', 'watch', 'video', 'app', 'show'];
    const suggestionKeywords = ['suggest', 'recommend', 'next', 'for you', 'playlist', 'similar', 'because', 'like', 'ad', 'algorithm'];
    const hasScreen = screenKeywords.some(kw => t.includes(kw));
    const hasSuggestion = suggestionKeywords.some(kw => t.includes(kw));
    const minChars = 30;
    const hasEnoughChars = text.trim().length >= minChars;
    return {
      isValid: hasEnoughChars && hasScreen && hasSuggestion && nonRepetitive,
      requirements: [
        { label: `📝 Write at least ${minChars} characters`, done: hasEnoughChars },
        { label: "📺 Mention a screen or app you watched (e.g. YouTube, Netflix)", done: hasScreen },
        { label: "💡 Describe how it suggested or recommended something to you", done: hasSuggestion },
      ]
    };
  }
  
  if (missionId === 4) {
    // Helpful Robot Helper — mention a person and a technology
    const personKeywords = ['parent', 'father', 'mother', 'sister', 'brother', 'sibling', 'mum', 'dad', 'uncle', 'aunt', 'grandparent', 'friend', 'he', 'she', 'they'];
    const techKeywords = ['app', 'phone', 'map', 'calendar', 'reminder', 'computer', 'laptop', 'email', 'google', 'alarm', 'smart', 'technology', 'tool', 'software'];
    const hasPerson = personKeywords.some(kw => t.includes(kw));
    const hasTech = techKeywords.some(kw => t.includes(kw));
    const minChars = 30;
    const hasEnoughChars = text.trim().length >= minChars;
    return {
      isValid: hasEnoughChars && hasPerson && hasTech && nonRepetitive,
      requirements: [
        { label: `📝 Write at least ${minChars} characters`, done: hasEnoughChars },
        { label: "👤 Mention who you asked (e.g. mum, dad, brother)", done: hasPerson },
        { label: "💻 Describe the technology or app they showed you", done: hasTech },
      ]
    };
  }
  
  // ── INNOVATOR MISSIONS ───────────────────────────────────
  if (missionId === 101) {
    const scenarios = ['queue', 'line', 'wait', 'bus', 'traffic', 'canteen', 'lunch', 'library', 'counter', 'gate', 'office', 'register', 'store', 'shop'];
    const aiSolutions = ['predict', 'optimize', 'schedule', 'app', 'alert', 'route', 'camera', 'sensor', 'automated', 'time', 'manage'];
    const hasScenario = scenarios.some(kw => t.includes(kw));
    const hasAISolution = aiSolutions.some(kw => t.includes(kw));
    const minChars = 35;
    const hasEnoughChars = text.trim().length >= minChars;
    return {
      isValid: hasEnoughChars && hasScenario && hasAISolution && nonRepetitive,
      requirements: [
        { label: `📝 Write at least ${minChars} characters explaining the scenarios`, done: hasEnoughChars },
        { label: "⏰ Describe waiting areas (e.g. canteen queue, bus stop, library)", done: hasScenario },
        { label: "💡 Explain how AI/apps can help predict or reduce the wait", done: hasAISolution },
      ]
    };
  }
  
  if (missionId === 102) {
    const problems = ['trash', 'waste', 'garbage', 'leak', 'water', 'light', 'streetlight', 'hole', 'road', 'traffic', 'pollution', 'broken', 'dirty', 'litter'];
    const techSolutions = ['sensor', 'camera', 'ai', 'app', 'system', 'detect', 'notify', 'alert', 'analyze', 'satellite', 'monitor'];
    const hasProblem = problems.some(kw => t.includes(kw));
    const hasTechSolution = techSolutions.some(kw => t.includes(kw));
    const minChars = 40;
    const hasEnoughChars = text.trim().length >= minChars;
    return {
      isValid: hasEnoughChars && hasProblem && hasTechSolution && nonRepetitive,
      requirements: [
        { label: `📝 Detailed description (at least ${minChars} characters)`, done: hasEnoughChars },
        { label: "🌍 Describe a real local problem (e.g. trash, water leaks, broken lights)", done: hasProblem },
        { label: "🤖 Propose a smart tech/AI solution (e.g. sensors, auto alerts, cameras)", done: hasTechSolution },
      ]
    };
  }
  
  if (missionId === 103) {
    const people = ['father', 'mother', 'parent', 'teacher', 'neighbour', 'uncle', 'aunt', 'doctor', 'shopkeeper', 'adult', 'friend', 'colleague', 'he', 'she', 'they', 'mr', 'mrs', 'ms'];
    const technology = ['computer', 'laptop', 'excel', 'software', 'app', 'email', 'search', 'write', 'track', 'teach', 'sell', 'record', 'system', 'smart', 'tool', 'internet', 'ai'];
    const hasPerson = people.some(kw => t.includes(kw));
    const hasTech = technology.some(kw => t.includes(kw));
    const minChars = 40;
    const hasEnoughChars = text.trim().length >= minChars;
    return {
      isValid: hasEnoughChars && hasPerson && hasTech && nonRepetitive,
      requirements: [
        { label: `📝 Write at least ${minChars} characters summarizing the interview`, done: hasEnoughChars },
        { label: "👤 State who you interviewed (e.g. parent, teacher, shopkeeper)", done: hasPerson },
        { label: "💻 List the software, computers, or smart apps they use", done: hasTech },
      ]
    };
  }
  
  if (missionId === 104) {
    // Bias Detector — mention AI or system and an unfair/biased result
    const aiKeywords = ['ai', 'algorithm', 'system', 'model', 'voice', 'image', 'search', 'recognition', 'tool', 'software'];
    const biasKeywords = ['bias', 'unfair', 'wrong', 'mistake', 'accent', 'gender', 'race', 'colour', 'skin', 'discriminat', 'inaccurat', 'misunderstand', 'incorrect'];
    const hasAI = aiKeywords.some(kw => t.includes(kw));
    const hasBias = biasKeywords.some(kw => t.includes(kw));
    const minChars = 40;
    const hasEnoughChars = text.trim().length >= minChars;
    return {
      isValid: hasEnoughChars && hasAI && hasBias && nonRepetitive,
      requirements: [
        { label: `📝 Write at least ${minChars} characters about your finding`, done: hasEnoughChars },
        { label: "🤖 Mention an AI system, tool, or algorithm", done: hasAI },
        { label: "⚖️ Describe an unfair or biased result it gave", done: hasBias },
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
  const currentProfile = useCurrentProfile();
  const userZone = currentProfile?.zone || 'junior';

  const stats = getPlatformProgress(currentProfile);
  const overallPercent = stats.overallPercent;
  const completedMissionsCount = stats.completedMissions;
  const totalMissionsCount = stats.totalMissions;
  const missionPercent = stats.missionPercent;

  const [activeTab, setActiveTab] = useState<'missions' | 'submissions'>('missions');
  const [missionFilter, setMissionFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    return JSON.parse(localStorage.getItem('mission_submissions') || '[]');
  });

  const [customMissions, setCustomMissions] = useState<any[]>([]);

  // Filter standard missions by zone, then append custom missions (which parents add for specific child)
  const zoneMissions = WEEKLY_MISSIONS_DATA.filter(m => m.zone === userZone || m.zone === 'both');
  const allMissions = [...zoneMissions, ...customMissions];
  const mission = allMissions.find(m => m.id === selectedMission);

  useEffect(() => {
    const parentCustom = JSON.parse(localStorage.getItem('parent_custom_missions') || '[]');
    setCustomMissions(parentCustom);
  }, []);

  // Load draft when selectedMission changes
  useEffect(() => {
    if (selectedMission) {
      const draft = localStorage.getItem(`mission_draft_${selectedMission}`) || '';
      setText(draft);
      const existingProg = parseInt(localStorage.getItem(`mission_progress_${selectedMission}`) || '0', 10);
      if (existingProg === 0) {
        localStorage.setItem(`mission_progress_${selectedMission}`, '10');
      }
    } else {
      setText('');
      resetAIStates();
    }
  }, [selectedMission]);

  // Save draft and update progress when text changes
  useEffect(() => {
    if (selectedMission && mission) {
      localStorage.setItem(`mission_draft_${selectedMission}`, text);
      const done = submissions.some(s => s.missionId === selectedMission && s.status === 'approved');
      if (!done) {
        if (text.trim().length === 0) {
          localStorage.setItem(`mission_progress_${selectedMission}`, '10');
        } else {
          const minChars = mission.isCustom ? 15 : (MISSION_HELPERS[mission.id]?.goal ? 20 : 10);
          const percentage = Math.min(95, Math.round(10 + (text.trim().length / minChars) * 85));
          localStorage.setItem(`mission_progress_${selectedMission}`, percentage.toString());
        }
      }
    }
  }, [text, selectedMission, mission, submissions]);



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



  const isSubmitted = (id: number) => submissions.some(s => s.missionId === id && s.status === 'approved');

  const validation = mission ? (
    mission.isCustom
      ? { isValid: text.trim().length >= 15, requirements: [{ label: "📝 Write at least 15 characters describing your observation", done: text.trim().length >= 15 }] }
      : validateSubmission(mission.id, text)
  ) : { isValid: false, requirements: [] };

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
        localStorage.setItem(`mission_progress_${mission.id}`, '100');
        localStorage.removeItem(`mission_draft_${mission.id}`);
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
          localStorage.setItem(`mission_progress_${mission.id}`, '100');
          localStorage.removeItem(`mission_draft_${mission.id}`);
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
      <div className="p-5" style={{ background: '#16103A' }}>
        <h1 className="font-pixel text-[10px] text-white flex items-center gap-2 tracking-wide">🎯 WEEKLY MISSIONS</h1>
        <p className="text-white/55 font-body text-sm mt-1">Real-world field challenges — earn massive XP!</p>

        {/* Tabs */}
        <div className="flex mt-4 p-1" style={{ background: '#16103A', border: '2px solid #000000' }}>
          {(['missions', 'submissions'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="flex-1 py-2 font-pixel text-[6px] transition-all duration-150 tracking-wide"
              style={activeTab === tab ? {
                background: '#7C3AED',
                color: 'white',
                border: '1.5px solid #000000',
                boxShadow: '2px 2px 0px #000000',
              } : { color: 'rgba(255,255,255,0.4)' }}>
              {tab === 'missions' ? '🎯 MISSIONS' : '📋 SUBMISSIONS'}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pt-2">
        {activeTab === 'missions' && (
          <div className="space-y-4">
            {/* ── MINECRAFT STYLE SPLIT DASHBOARD LAYOUT ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Summary Stats Panel */}
              <div className="lg:col-span-4 xl:col-span-3 mc-sidebar-panel p-5 flex flex-col items-center">
                {/* XP Bottle Container */}
                <div className="relative flex flex-col items-center mb-4">
                  <XPBottle percent={missionPercent} size={88} className="mb-2" />
                  <div className="font-pixel text-lg text-white mt-1" style={{ textShadow: '2px 2px 0px #000' }}>
                    {missionPercent}%
                  </div>
                  <div className="font-pixel text-[5px] text-white/50 mt-1 uppercase tracking-wider">
                    {completedMissionsCount} of {totalMissionsCount} completed
                  </div>
                </div>

                {/* Sub-stats vertical list */}
                <div className="w-full space-y-2.5">
                  {(() => {
                    const activeStreak = currentProfile?.current_streak || 0;
                    const totalXpEarned = currentProfile?.xp || 0;
                    const inProgMissions = allMissions.filter(m => {
                      const done = isSubmitted(m.id);
                      return !done && parseInt(localStorage.getItem(`mission_progress_${m.id}`) || '0', 10) > 0;
                    });

                    return (
                      <>
                        <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
                          <span className="font-pixel text-[5px] text-white/40 uppercase">In Progress</span>
                          <span className="font-game text-xs text-white">{inProgMissions.length}</span>
                        </div>
                        
                        <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
                          <span className="font-pixel text-[5px] text-white/40 uppercase">Completed</span>
                          <span className="font-game text-xs text-green-400">{completedMissionsCount} Missions</span>
                        </div>

                        <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
                          <span className="font-pixel text-[5px] text-white/40 uppercase">Streak</span>
                          <span className="font-game text-xs text-red-400">{activeStreak} Days 🔥</span>
                        </div>

                        <div className="mc-sidebar-stat p-2.5 flex items-center justify-between">
                          <span className="font-pixel text-[5px] text-white/40 uppercase">Gamerscore</span>
                          <span className="font-game text-xs text-warning">+{totalXpEarned} XP</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Right Column: Tabbed Achievements List */}
              <div className="lg:col-span-8 xl:col-span-9 mc-menu-panel p-4 flex flex-col min-h-[480px]">
                {/* Minecraft tabs header bar */}
                <div className="mc-tab-bar mb-4">
                  <button
                    onClick={() => setMissionFilter('all')}
                    className={`mc-tab ${missionFilter === 'all' ? 'active' : ''}`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setMissionFilter('in-progress')}
                    className={`mc-tab ${missionFilter === 'in-progress' ? 'active' : ''}`}
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => setMissionFilter('completed')}
                    className={`mc-tab ${missionFilter === 'completed' ? 'active' : ''}`}
                  >
                    Completed
                  </button>
                </div>

                {/* List contents */}
                <div className="flex-1 space-y-4">
                  {(() => {
                    const parsedMissions = allMissions.map((m, idx) => {
                      const done = isSubmitted(m.id);
                      const pVal = done ? 100 : parseInt(localStorage.getItem(`mission_progress_${m.id}`) || '0', 10);
                      const inProgress = !done && pVal > 0;
                      const notStarted = !done && pVal === 0;
                      return {
                        ...m,
                        idx,
                        done,
                        pVal,
                        inProgress,
                        notStarted
                      };
                    });

                    const inProgressAndActiveList = parsedMissions.filter(m => !m.done);
                    const completedList = parsedMissions.filter(m => m.done);

                    const getDisplayMissions = () => {
                      if (missionFilter === 'in-progress') return inProgressAndActiveList;
                      if (missionFilter === 'completed') return completedList;
                      return parsedMissions;
                    };

                    if (missionFilter === 'all') {
                      return (
                        <>
                          {/* 1. In Progress Section */}
                          {inProgressAndActiveList.length > 0 && (
                            <div className="space-y-2">
                              <div className="font-pixel text-[5px] px-2 py-0.5 bg-[#5555ff] text-white border border-black inline-block uppercase tracking-wider">
                                In progress
                              </div>
                              {inProgressAndActiveList.map(m => renderMissionCard(m))}
                            </div>
                          )}

                          {/* 2. Completed Section */}
                          {completedList.length > 0 && (
                            <div className="space-y-2 pt-2">
                              <div className="font-pixel text-[5px] px-2 py-0.5 bg-green-700 text-white border border-black inline-block uppercase tracking-wider">
                                Completed
                              </div>
                              {completedList.map(m => renderMissionCard(m))}
                            </div>
                          )}
                        </>
                      );
                    }

                    return (
                      <div className="space-y-2">
                        {getDisplayMissions().length === 0 ? (
                          <div className="text-center py-12 text-white/40 font-body text-xs">
                            No missions found in this category.
                          </div>
                        ) : (
                          getDisplayMissions().map(m => renderMissionCard(m))
                        )}
                      </div>
                    );

                    // Card rendering helper for WeeklyMissions
                    function renderMissionCard(m: typeof parsedMissions[0]) {
                      return (
                        <motion.div
                          key={m.id}
                          id={`mission-card-${m.id}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          onClick={() => {
                            if (!m.done) {
                              setSelectedMission(m.id);
                            }
                          }}
                          className={`mc-item-card p-4 flex gap-4 items-center justify-between select-none cursor-pointer ${
                            m.done ? 'completed' : ''
                          }`}
                          style={{ cursor: m.done ? 'default' : 'pointer' }}
                        >
                          {/* Left icon */}
                          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-[#181818] border-2 border-[#0a0a0a] shadow-[inset_1.5px_1.5px_0px_#050505,inset_-1.5px_-1.5px_0px_#2c2c2c] text-xl">
                            {m.emoji}
                          </div>

                          {/* Middle details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-pixel text-[4px] text-[#5555ff] uppercase tracking-wider">
                                Mission {m.idx + 1}
                              </span>
                              <span className={`font-pixel text-[4px] px-1 py-0.2 border border-black/35 ${
                                m.difficulty === 'Easy' ? 'bg-success/20 text-green-300' :
                                m.difficulty === 'Medium' ? 'bg-warning/20 text-yellow-300' :
                                'bg-red-950/20 text-red-300'
                              }`}>
                                {m.difficulty}
                              </span>
                            </div>

                            <h3 className="font-game text-sm text-white leading-tight truncate">
                              {m.title}
                            </h3>
                            <p className="text-white/45 font-body text-xs mt-0.5 line-clamp-1">
                              {m.description}
                            </p>

                            {/* Bottom blue progress bar for active items with progress */}
                            {!m.done && m.pVal > 0 && (
                              <div className="mt-2.5 w-full h-1 bg-[#101010] p-[0.5px] border border-[#0d0d0d]">
                                <div 
                                  className="h-full mc-progress-bar-blue" 
                                  style={{ width: `${m.pVal}%` }} 
                                />
                              </div>
                            )}
                          </div>

                          {/* Right slot */}
                          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                            <div className="mc-sidebar-stat px-2 py-0.5 font-pixel text-[5px] text-amber-300">
                              G {m.xp_reward}
                            </div>
                            <div>
                              {m.done ? (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              ) : (
                                <Play className="w-4 h-4 text-white animate-pulse" fill="white" />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    }
                  })()}
                </div>
              </div>

            </div>
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
                <div key={i} className="p-4" style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '3px 3px 0px #000000' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{m?.emoji}</span>
                    <div className="flex-1">
                      <div className="text-white font-game text-sm">{m?.title}</div>
                      <div className="text-white/50 font-body text-xs">{new Date(s.submittedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                       <span className="font-pixel text-[7px] px-2 py-1 text-white" style={{ background: '#10B981', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}>+{s.xp} XP</span>
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
              style={{ background: '#1E1B4B', border: '4px solid #000000', boxShadow: '6px 6px 0px #000000' }}
            >
              {/* Header */}
              <div className="p-4 flex items-center gap-3" style={{ background: '#16103A', borderBottom: '3px solid #000000' }}>
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
                      {mission.isCustom ? mission.description : MISSION_HELPERS[mission.id]?.goal}
                    </p>
                    {mission.isCustom && mission.tasks && (
                      <div className="mt-2 space-y-1">
                        <strong className="text-warning text-[10px] block">📋 Tasks Checklist:</strong>
                        {mission.tasks.map((task: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-white/80 font-body text-[10px]">
                            <span>⬜</span>
                            <span>{task}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {!mission.isCustom && (
                      <>
                        <div className="mt-2 text-white/70 font-body text-[11px] leading-relaxed">
                          <strong className="text-warning">💡 Examples:</strong> {MISSION_HELPERS[mission.id]?.examples}
                        </div>
                        <div className="mt-2 text-white/50 font-body text-[10px] leading-relaxed border-t border-white/5 pt-1">
                          <strong className="text-white/70">⚙️ How it is validated:</strong> {MISSION_HELPERS[mission.id]?.validationDesc}
                        </div>
                      </>
                    )}
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
