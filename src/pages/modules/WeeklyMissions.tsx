import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { XPToast, CardProgressBadge, CardProgressBar } from '@/components/ui/GameUI';
import { WEEKLY_MISSIONS_DATA } from '@/data/curriculum';
import { supabase } from '@/lib/supabase';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { FileText, CheckCircle, XCircle, Zap, ArrowLeft, HelpCircle, Sparkles, Users, Award, Image, ThumbsUp, Heart, Lock, AlertCircle, Target } from 'lucide-react';
import { generateMissionSuggestions, evaluateMissionSubmission } from '@/lib/ai';
import { getPlatformProgress } from '@/lib/gamification';
import { useThemeStyles } from '@/lib/useThemeStyles';

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
    examples: "FaceID phone unlock, Netflix recommendations, voice assistants (Alexa/Siri), robotic vacuum, or smart AC.",
    validationDesc: "Identify and describe at least 3 smart/AI features or devices and explain why they are smart."
  },
  2: {
    goal: "Find 2 examples of technology or apps that help animals — describe each one.",
    examples: "A GPS pet tracker collar, a veterinary diagnosis app, or wildlife camera alerts.",
    validationDesc: "Describe at least 2 technology examples that help animals and explain how they work."
  },
  3: {
    goal: "Watch a screen for 10 minutes and note 3 times AI made a recommendation to you.",
    examples: "YouTube next-ups, Spotify playlists, Google Maps suggestions, or Netflix recommendation queues.",
    validationDesc: "Describe 3 specific recommendation instances and explain how AI might be involved."
  },
  4: {
    goal: "Ask a parent or sibling to show you one way technology makes their day easier.",
    examples: "Calendar alerts, Google Maps route predictions, automatic banking, or smart voice commands.",
    validationDesc: "Describe who you asked, what they showed you, and explain how it saves time/effort."
  },
  101: {
    goal: "Find 3 spots in your school or neighbourhood where people waste time waiting.",
    examples: "Canteen queue, bus stop lines, checking out library books, or gate traffic.",
    validationDesc: "Propose how predictive scheduling or smart cameras could optimize time."
  },
  102: {
    goal: "Spot a real-world problem in your neighbourhood, school, or city.",
    examples: "Water leaks, overflowing garbage bins, dark streetlights, or potholes.",
    validationDesc: "Describe the issue and how AI sensors or automatic mapping could alert authorities."
  },
  103: {
    goal: "Interview an adult about technology at work.",
    examples: "Ask: 'What smart software or spreadsheets do you use to make your job faster?'",
    validationDesc: "Summarize the person's job and the technology tools they rely on daily."
  },
  104: {
    goal: "Find one example where AI gave an unfair result and explain why it happened.",
    examples: "Voice helpers misunderstanding accents, biased search rankings, or inaccurate facial match alerts.",
    validationDesc: "Describe the system, explain the biased result, and trace it back to training data."
  },
};


export default function WeeklyMissions() {
  const ts = useThemeStyles();
  const D = ts.duo;
  const { user, profile, guestProfile, isGuest, updateProfile } = useAuth();
  const currentProfile = useCurrentProfile();
  const userZone = currentProfile?.zone || 'junior';
  const navigate = useNavigate();

  const stats = getPlatformProgress(currentProfile);
  const completedMissionsCount = stats.completedMissions;
  const totalMissionsCount = stats.totalMissions;
  const missionPercent = stats.missionPercent;

  type TabType = 'solo' | 'team' | 'contest' | 'gallery' | 'submissions';
  const [activeTab, setActiveTab] = useState<TabType>('solo');
  const [selectedMission, setSelectedMission] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [toastXP, setToastXP] = useState(80);
  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    return JSON.parse(localStorage.getItem('mission_submissions') || '[]');
  });

  const [customMissions, setCustomMissions] = useState<any[]>([]);

  // Weekly missions data
  const zoneMissions = WEEKLY_MISSIONS_DATA.filter(m => m.zone === userZone || m.zone === 'both');
  const allMissions = [...zoneMissions, ...customMissions];
  const mission = allMissions.find(m => m.id === selectedMission);

  // Team missions data (Mock)
  const mockTeamMissions = [
    { id: 'team-1', title: 'Operation: Green Classroom', description: 'Form a crew of 3 classmates. Devise a smart sensor layout to track empty desks, shutting off unused fans automatically. Submit a team proposal!', membersJoined: 2, membersRequired: 3, xpReward: 150, progress: 66, status: 'gathering' },
    { id: 'team-2', title: 'Detective Agency: Spoof Finders', description: 'Team up with another explorer to find 3 deepfakes online. Compare observation metrics and write a combined audit report.', membersJoined: 1, membersRequired: 2, xpReward: 120, progress: 50, status: 'gathering' }
  ];
  const [joinedTeams, setJoinedTeams] = useState<string[]>([]);

  // Creativity Contest entry state
  const [contestName, setContestName] = useState('');
  const [contestDesc, setContestDesc] = useState('');
  const [contestSubmitted, setContestSubmitted] = useState(false);

  // Showcase Gallery data (Mock)
  const [galleryItems, setGalleryItems] = useState([
    { id: 'g-1', creator: 'Aarav (Age 10)', title: 'Solar Tracking Robot', desc: 'An AI panel that follows the sun using simple light sensor metrics.', likes: 24, liked: false, emoji: '☀️🤖' },
    { id: 'g-2', creator: 'Dia (Age 12)', title: 'Pet Voice Translator', desc: 'Used comic builder prompts to design a translator collar for street dogs.', likes: 42, liked: false, emoji: '🐕✨' },
    { id: 'g-3', creator: 'Rohan (Age 11)', title: 'Smart Canteen Scheduler', desc: 'Predictive queue manager built using Explore Lab decision trees.', likes: 18, liked: false, emoji: '🍿⏱️' },
  ]);

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
  const activeMissionIndex = allMissions.findIndex(m => !isSubmitted(m.id));

  const isValid = text.trim().length > 0;

  const handleSubmit = async () => {
    if (!mission || !isValid) return;
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
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Joined Team handler
  const handleJoinTeam = (teamId: string) => {
    if (!joinedTeams.includes(teamId)) {
      setJoinedTeams(prev => [...prev, teamId]);
      setToastXP(50);
      setShowXP(true);
    }
  };

  // Submit contest handler
  const handleContestSubmit = () => {
    if (!contestName.trim() || !contestDesc.trim()) return;
    setContestSubmitted(true);
    setToastXP(100);
    setShowXP(true);
  };

  // Like gallery item
  const handleLikeItem = (id: string) => {
    setGalleryItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          likes: item.liked ? item.likes - 1 : item.likes + 1,
          liked: !item.liked
        };
      }
      return item;
    }));
  };

  return (
    <div
      className={D ? '' : 'min-h-full pb-20 bg-stars bg-[#0F0A2E] text-white'}
      style={D ? { minHeight: '100%', paddingBottom: 80, background: '#F5F5F5' } : {}}
    >
      {showXP && <XPToast amount={toastXP} reason="Mission reward claimed!" onDone={() => setShowXP(false)} />}

      {/* Header Banner */}
      <div 
        className={D ? "p-5 flex flex-col justify-between relative overflow-hidden bg-white border-b border-[#E0E0E0] shadow-sm" : "p-5 flex flex-col justify-between relative overflow-hidden border-b-3 border-black"}
        style={D ? {} : {
          background: 'linear-gradient(135deg, #1E1B4B 0%, #110B30 100%)'
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className={D ? "font-game text-lg text-black tracking-wide flex items-center gap-2 font-extrabold" : "font-game text-lg text-white tracking-wide flex items-center gap-2"}>
              🎯 WEEKLY MISSION CONTROL
            </h1>
            <p className={D ? "text-gray-400 font-body text-xs mt-0.5 font-semibold" : "text-white/55 font-body text-xs mt-0.5"}>Explore real-world challenges with AI telemetry!</p>
          </div>
          <button onClick={() => navigate('/learn')} className={D ? "p-2 border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer rounded-lg" : "p-2 border-2 border-black bg-black/30 text-white/50 hover:text-white transition-colors cursor-pointer"}>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation selectors */}
        <div className={D ? "flex mt-4 p-1 bg-gray-50 border border-gray-200 rounded-xl overflow-x-auto no-scrollbar gap-1" : "flex mt-4 p-1 bg-black/40 border-2 border-black overflow-x-auto no-scrollbar gap-1"}>
          {[
            { id: 'solo', label: '🎯 Solo Missions', icon: Zap },
            { id: 'team', label: '👥 Team Adventures', icon: Users },
            { id: 'contest', label: '🏆 Creative Contest', icon: Award },
            { id: 'gallery', label: '🖼️ Showcase Gallery', icon: Image },
            { id: 'submissions', label: '📋 Submissions', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={D ? `py-2 px-3 font-game text-[10px] whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 rounded-lg ${
                  active 
                    ? 'bg-[#B366FF] text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-600 font-semibold'
                }` : `py-2 px-3 font-game text-[10px] whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  active 
                    ? 'bg-[#7C3AED] text-white border-2 border-black shadow-[2px_2px_0px_#000]'
                    : 'text-white/45 hover:text-white/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-4 pt-4">
        
        {/* SOLO MISSIONS TAB */}
        {activeTab === 'solo' && (
          <div className="space-y-6">
            {/* Solo Progress panel */}
            <div
              className="p-4 space-y-3"
              style={D ? {
                background: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                borderRadius: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              } : {
                background: '#1E1B4B',
                border: '3px solid #7C3AED',
                boxShadow: '4px 4px 0px #000',
              }}
            >
              <div className="flex justify-between items-baseline text-[10px]" style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, color: '#8B5CF6' } : { fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#A78BFA' }}>
                <span>SOLO MISSIONS COMPLETED</span>
                <span>{completedMissionsCount}/{totalMissionsCount} ({missionPercent}%)</span>
              </div>
              <div className="w-full h-3 flex items-center" style={D ? { background: '#E0E0E0', borderRadius: 999, overflow: 'hidden' } : { background: '#0F0A2E', border: '2px solid #000', padding: '2px' }}>
                <div
                  className="h-full transition-all duration-800"
                  style={{ width: `${missionPercent}%`, background: D ? '#B366FF' : '#7C3AED', borderRadius: D ? 999 : 0 }}
                />
              </div>
            </div>

            {/* ── Play-style timeline layout ── */}
            <div className="space-y-3">
              {/* Group header — mirrors Play's phase header */}
              <div
                className="p-3 flex items-center justify-between"
                style={D ? {
                  background: '#FFFFFF',
                  border: '1.5px solid #BBF7D0',
                  borderLeft: '5px solid #B366FF',
                  borderRadius: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                } : {
                  background: 'linear-gradient(90deg, #1E1B4B 0%, #16103A 100%)',
                  border: '2px solid #000',
                  borderLeft: '6px solid #7C3AED',
                  boxShadow: '3px 3px 0px #000',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">🎯</span>
                  <div>
                    <h2
                      style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : undefined }}
                      className={D ? '' : 'font-game text-xs text-white uppercase tracking-wider'}
                    >
                      {D ? 'Mission Zone: Solo Challenges' : 'MISSION ZONE: SOLO CHALLENGES'}
                    </h2>
                    <p
                      style={{ color: ts.textSecondary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontSize: D ? 11 : 10 }}
                      className={D ? '' : 'font-body text-[10px] text-white/50'}
                    >
                      Complete real-world AI challenges to earn XP
                    </p>
                  </div>
                </div>
                <span style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10, color: '#B366FF', background: '#F5F0FF', border: '1px solid #DDD6FE', borderRadius: 999, padding: '2px 8px' }
                            : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#A78BFA', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', padding: '2px 6px' }}>
                  OPEN
                </span>
              </div>

              {/* Timeline list — exact same structure as Play modules */}
              <div className="pl-2 space-y-4" style={{ borderLeft: D ? '2px solid #E0E0E0' : '2px solid rgba(255,255,255,0.05)' }}>
                {allMissions.map((m, idx) => {
                  const done = isSubmitted(m.id);
                  const isLocked = activeMissionIndex !== -1 && idx > activeMissionIndex;
                  const isActive = activeMissionIndex === idx;
                  const pVal = done ? 100 : parseInt(localStorage.getItem(`mission_progress_${m.id}`) || '0', 10);

                  return (
                    <div key={m.id} className="relative flex gap-3">
                      {/* Dot — same as Play */}
                      <div className="flex flex-col items-center flex-shrink-0 relative z-10">
                        <motion.div
                          whileHover={!isLocked ? { scale: 1.15 } : {}}
                          onClick={() => !isLocked && !done && setSelectedMission(m.id)}
                          className="w-8 h-8 flex items-center justify-center text-xs cursor-pointer"
                          style={D ? {
                            background: done ? '#B366FF' : isActive ? '#B366FF' : '#E0E0E0',
                            border: `2px solid ${done ? '#B366FF' : isActive ? '#B366FF' : '#D1D5DB'}`,
                            borderRadius: '50%',
                            boxShadow: isActive ? '0 0 12px rgba(179,102,255,0.4)' : 'none',
                          } : {
                            background: done ? '#7C3AED' : isActive ? undefined : '#1E293B',
                            backgroundImage: isActive ? 'linear-gradient(135deg, #7C3AED, #3B82F6)' : undefined,
                            border: '2px solid #000',
                            boxShadow: isActive ? '0 0 12px rgba(124,58,237,0.5)' : 'none',
                          }}
                        >
                          {done
                            ? <CheckCircle className="w-4 h-4" style={{ color: '#fff' }} />
                            : isLocked
                            ? <Lock className="w-3 h-3" style={{ color: D ? '#9CA3AF' : 'rgba(255,255,255,0.3)' }} />
                            : <Target className="w-3.5 h-3.5" style={{ color: '#fff' }} />}
                        </motion.div>
                      </div>

                      {/* Mission Card — mirrors Play module card exactly */}
                      <div className="flex-1 min-w-0">
                        <motion.div
                          whileHover={!isLocked ? { y: -2, scale: 1.01 } : {}}
                          onClick={() => !isLocked && !done && setSelectedMission(m.id)}
                          className="relative p-3.5 transition-all flex flex-col justify-between overflow-hidden cursor-pointer"
                          style={D ? {
                            background: '#FFFFFF',
                            border: `${done ? '1.5px solid #E0E0E0' : isActive ? '2px solid #B366FF' : isLocked ? '1.5px solid #E8E8E8' : '1.5px solid #E0E0E0'}`,
                            borderRadius: 12,
                            boxShadow: isActive ? '0 4px 16px rgba(179,102,255,0.15)' : isLocked ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                            opacity: done ? 0.65 : 1,
                          } : {
                            background: done ? 'rgba(30,27,75,0.6)' : isActive ? undefined : isLocked ? 'rgba(21,16,54,0.5)' : '#151036',
                            backgroundImage: isActive ? 'linear-gradient(135deg, #1E1B4B, #251E5C)' : undefined,
                            borderColor: isLocked ? '#374151' : isActive ? '#7C3AED' : '#000',
                            border: '2px solid',
                            boxShadow: isActive ? '3px 3px 0px #7C3AED' : '3px 3px 0px #000',
                            opacity: done ? 0.6 : 1,
                          }}
                        >
                          {/* Active pulse bar */}
                          {isActive && (
                            <div
                              className="absolute top-0 left-0 right-0 h-1 animate-pulse"
                              style={{ background: D ? '#B366FF' : '#7C3AED', borderRadius: D ? '12px 12px 0 0' : 0 }}
                            />
                          )}

                          {/* Header row: icon + title + done badge */}
                          <div className="flex items-start justify-between gap-1 mb-1">
                            <div>
                              <div className="flex items-center gap-1.5">
                                {/* Icon box */}
                                <div
                                  className="w-7 h-7 flex items-center justify-center text-sm flex-shrink-0"
                                  style={D ? {
                                    background: isLocked ? '#F5F5F5' : '#B366FF18',
                                    border: `1.5px solid ${isLocked ? '#E0E0E0' : '#B366FF40'}`,
                                    borderRadius: 8,
                                  } : {
                                    background: isLocked ? '#374151' : '#7C3AED',
                                    border: '1.5px solid #000',
                                  }}
                                >
                                  {isLocked ? '🔒' : m.emoji}
                                </div>
                                {/* Title */}
                                <h3
                                  style={{ color: ts.textPrimary, fontFamily: D ? '"Nunito", sans-serif' : undefined, fontWeight: D ? 800 : undefined, fontSize: D ? 13 : undefined }}
                                  className={D ? '' : 'font-game text-xs text-white leading-snug uppercase tracking-wide'}
                                >
                                  {m.title}
                                </h3>
                              </div>
                              {/* Italic description — like Play's mod.desc */}
                              <p
                                style={D ? { color: '#8B5CF6', fontFamily: '"Nunito", sans-serif', fontStyle: 'italic', fontSize: 11, marginTop: 4, lineHeight: 1.5 } : {}}
                                className={D ? '' : 'font-body text-[10px] text-purple-300 italic mt-1 leading-relaxed'}
                              >
                                "{m.description.length > 80 ? m.description.slice(0, 77) + '…' : m.description}"
                              </p>
                            </div>
                            {/* Done badge */}
                            {done && (
                              <span
                                style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10, color: '#B366FF', background: '#F5F0FF', border: '1px solid #DDD6FE', borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap' }
                                      : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#A78BFA', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', padding: '2px 4px' }}
                              >
                                {D ? '✅ Done' : 'DONE'}
                              </span>
                            )}
                            {/* Locked badge */}
                            {isLocked && !done && (
                              <span
                                style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10, color: '#EF4444', background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 999, padding: '2px 8px', whiteSpace: 'nowrap' }
                                      : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#F87171', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', padding: '2px 6px' }}
                              >
                                LOCKED
                              </span>
                            )}
                          </div>

                          {/* Progress bar — same as Play */}
                          <div className="mt-3 space-y-1">
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 9 : 5, textTransform: 'uppercase' }}>Mission Progress</span>
                              <span style={{ color: ts.textMuted, fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 9 : 5 }}>{pVal}%</span>
                            </div>
                            <div style={D ? { height: 6, background: '#E0E0E0', borderRadius: 999, overflow: 'hidden' }
                                       : { height: 6, background: 'rgba(0,0,0,0.45)', border: '1px solid #000', padding: '0.5px', display: 'flex', alignItems: 'center' }}>
                              <div style={D ? { width: `${pVal}%`, height: '100%', background: '#B366FF', borderRadius: 999 }
                                         : { width: `${pVal}%`, height: '100%', background: '#7C3AED' }} />
                            </div>
                          </div>

                          {/* Bottom action row */}
                          {!isLocked && (
                            <div className="flex items-center justify-between mt-2 pt-2" style={D ? { borderTop: '1px solid #EEEEEE' } : { borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                              <span style={{ color: D ? (done ? '#B366FF' : '#999') : 'rgba(255,255,255,0.4)', fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace', fontSize: D ? 10 : 5, fontWeight: D ? 700 : undefined }}>
                                ⚡ +{m.xp_reward} XP
                              </span>
                              {!done && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setSelectedMission(m.id); }}
                                  className={D ? 'px-3 py-1 font-game text-[9px] text-white bg-[#B366FF] hover:bg-[#A356FF] rounded-lg cursor-pointer transition-all shadow-sm' : 'px-3 py-1 font-game text-[9px] text-black bg-[#FFD60A] border border-black shadow-[2px_2px_0px_#000] cursor-pointer'}
                                >
                                  Accept ➔
                                </button>
                              )}
                            </div>
                          )}

                          {/* Locked hint — same as Play */}
                          {isLocked && (
                            <div
                              className="mt-2.5 flex items-center gap-1 p-1"
                              style={D ? { background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: 6, color: '#EF4444', fontFamily: '"Nunito", sans-serif', fontWeight: 700, fontSize: 10 }
                                     : { background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)', fontFamily: '"Press Start 2P", monospace', fontSize: 5 }}
                            >
                              <AlertCircle className="w-2.5 h-2.5" />
                              <span>Complete previous missions to unlock</span>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TEAM ADVENTURES TAB */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div 
              className={D ? "p-4 space-y-2" : "bg-[#1E1B4B] border-3 border-[#3B82F6] p-4 shadow-[4px_4px_0px_#000] space-y-2"}
              style={D ? {
                background: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                borderRadius: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              } : {}}
            >
              <h3 className={D ? "font-game text-xs uppercase tracking-wider flex items-center gap-2 text-black font-extrabold" : "font-game text-xs text-white uppercase tracking-wider flex items-center gap-2"}>
                <Users className="w-4 h-4" style={{ color: D ? '#B366FF' : '#60A5FA' }} /> Collaborative Crew Missions
              </h3>
              <p className="font-body text-xs leading-relaxed" style={D ? { color: '#555555' } : { color: 'rgba(255,255,255,0.6)' }}>
                Connect with school colleagues, split research tasks, and upload collective submissions. Complete missions to earn massive XP!
              </p>
            </div>

            {mockTeamMissions.map(team => {
              const joined = joinedTeams.includes(team.id);
              return (
                <div
                  key={team.id}
                  className={D ? `p-4 border flex flex-col justify-between rounded-xl ${
                    joined ? 'bg-[#ECFDF5] border-[#10B981]/30' : 'bg-[#FFFFFF] border-gray-200'
                  }` : `p-4 border-2 border-black flex flex-col justify-between ${
                    joined ? 'bg-[#151F3C]' : 'bg-[#1E1B4B]'
                  }`}
                  style={D ? {
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  } : {
                    boxShadow: '4px 4px 0px #000'
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className={D ? "font-game text-xs uppercase tracking-wide text-black font-extrabold" : "font-game text-xs text-white uppercase tracking-wide"}>{team.title}</h4>
                    <span className={D ? "font-body text-[9px] text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full font-bold border border-purple-100" : "font-pixel text-[5px] text-yellow-400 bg-yellow-950/20 border border-yellow-800/40 px-1 py-0.5"}>
                      {joined ? team.membersJoined + 1 : team.membersJoined}/{team.membersRequired} TEAM JOINED
                    </span>
                  </div>

                  <p className="font-body text-[11px] leading-relaxed mb-3" style={D ? { color: '#555555' } : { color: 'rgba(255,255,255,0.7)' }}>
                    {team.description}
                  </p>

                  <div className="flex items-center justify-between border-t pt-2.5 mt-1" style={D ? { borderTopColor: '#EEEEEE' } : { borderTopColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="font-pixel text-[5px] text-warning" style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 10 } : {}}>⚡ +{team.xpReward} XP PER MEMBER</span>
                    {joined ? (
                      <span className={D ? "font-body text-[10px] text-emerald-600 bg-[#E8FBF2] px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold border border-emerald-100" : "font-pixel text-[5px] text-emerald-400 bg-emerald-950/15 border border-emerald-800/30 px-2 py-1 flex items-center gap-1"}>
                        ✓ Registered in Crew
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinTeam(team.id)}
                        className={D ? "px-4 py-1.5 font-game text-[9px] text-white bg-[#B366FF] hover:bg-[#A356FF] rounded-lg cursor-pointer transition-colors shadow-sm" : "px-4 py-1.5 font-game text-[9px] text-white bg-blue-600 border border-black shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-blue-700 transition-colors"}
                      >
                        Join Team Room 👥
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CREATIVE CONTEST TAB */}
        {activeTab === 'contest' && (
          <div className="space-y-4 max-w-md mx-auto">
            <div 
              className={D ? "p-4 space-y-2" : "bg-[#1E1B4B] border-3 border-[#F59E0B] p-4 shadow-[4px_4px_0px_#000] space-y-2"}
              style={D ? {
                background: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                borderRadius: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              } : {}}
            >
              <h3 className={D ? "font-game text-xs uppercase tracking-wider flex items-center gap-2 text-black font-extrabold" : "font-game text-xs text-white uppercase tracking-wider flex items-center gap-2"}>
                <Award className="w-4 h-4" style={{ color: D ? '#B366FF' : '#F59E0B' }} /> Monthly Creator Contest
              </h3>
              <p className="font-body text-xs leading-relaxed" style={D ? { color: '#555555' } : { color: 'rgba(255,255,255,0.6)' }}>
                Theme: **"The Smart Robot Teacher Assistant"**. Sketch, describe, or design an AI helper bot that grades homework, explains concepts, or rings recess bells!
              </p>
            </div>

            {contestSubmitted ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className={D ? "p-5 border border-green-200 bg-green-50/60 text-center space-y-2 rounded-xl shadow-sm" : "p-5 border-2 border-[#10B981] bg-[#10B981]/10 text-center space-y-2 shadow-[4px_4px_0px_#000]"}
              >
                <div className="text-3xl">🎉</div>
                <h4 className={D ? "font-game text-xs text-black uppercase font-bold" : "font-game text-xs text-white uppercase"}>Contest Submission Logged!</h4>
                <p className="font-body text-[10px] text-gray-500">
                  Your entry is queued for evaluation. Stand by to win up to 250 Gems!
                </p>
                <button
                  onClick={() => setContestSubmitted(false)}
                  className={D ? "mt-2.5 px-4 py-1.5 font-game text-[9px] text-white bg-[#B366FF] hover:bg-[#A356FF] rounded-lg cursor-pointer" : "mt-2.5 px-4 py-1.5 font-game text-[9px] text-black bg-[#FFD60A] border border-black cursor-pointer"}
                >
                  Edit Submission
                </button>
              </motion.div>
            ) : (
              <div
                className="p-4 space-y-3"
                style={D ? {
                  background: '#FFFFFF',
                  border: '1.5px solid #E0E0E0',
                  borderRadius: 14,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                } : { background: '#1E1B4B', border: '2.5px solid #000', boxShadow: '4px 4px 0px #000' }}
              >
                <div>
                  <span className={D ? "text-gray-400 font-body text-[10px] uppercase font-bold block mb-1" : "text-white/40 font-pixel text-[5px] block mb-1"}>INVENTION PROMPT NAME:</span>
                  <input
                    type="text"
                    value={contestName}
                    onChange={e => setContestName(e.target.value)}
                    placeholder="e.g. Recess Bot 3000"
                    className="w-full pixel-input text-xs"
                    maxLength={30}
                  />
                </div>

                <div>
                  <span className={D ? "text-gray-400 font-body text-[10px] uppercase font-bold block mb-1" : "text-white/40 font-pixel text-[5px] block mb-1"}>DESCRIBE CONTEST INVENTION DESIGN:</span>
                  <textarea
                    value={contestDesc}
                    onChange={e => setContestDesc(e.target.value)}
                    placeholder="Describe how your AI teacher assistant works..."
                    className="w-full pixel-input text-xs h-28 resize-none"
                    maxLength={300}
                  />
                </div>

                <button
                  onClick={handleContestSubmit}
                  disabled={!contestName.trim() || !contestDesc.trim()}
                  className={D ? "w-full py-3 bg-[#5FCC5F] hover:bg-[#4CAF50] text-white font-game text-xs rounded-xl shadow-[0_4px_0px_rgba(0,0,0,0.15)] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all active:translate-y-[2px]" : "w-full py-3 bg-[#F59E0B] text-black font-game text-xs border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"}
                >
                  <Award className="w-3.5 h-3.5" />
                  Submit Contest Entry 🚀
                </button>
              </div>
            )}
          </div>
        )}

        {/* SHOWCASE GALLERY TAB */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <div 
              className={D ? "p-4 space-y-2" : "bg-[#1E1B4B] border-3 border-pink-500 p-4 shadow-[4px_4px_0px_#000] space-y-2"}
              style={D ? {
                background: '#FFFFFF',
                border: '1.5px solid #E0E0E0',
                borderRadius: 14,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              } : {}}
            >
              <h3 className={D ? "font-game text-xs uppercase tracking-wider flex items-center gap-2 text-black font-extrabold" : "font-game text-xs text-white uppercase tracking-wider flex items-center gap-2"}>
                <Image className="w-4 h-4" style={{ color: D ? '#B366FF' : '#EC4899' }} /> Student Showcase Gallery
              </h3>
              <p className="font-body text-xs leading-relaxed" style={D ? { color: '#555555' } : { color: 'rgba(255,255,255,0.6)' }}>
                Check out the creations other students have built and compiled in their AI sandboxes and Prompt/Create labs!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {galleryItems.map(item => (
                <div
                  key={item.id}
                  className={D ? "p-4 border relative overflow-hidden flex flex-col justify-between rounded-xl bg-white border-gray-200" : "p-4 bg-[#1E1B4B] border-2 border-black relative overflow-hidden flex flex-col justify-between"}
                  style={D ? {
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  } : { boxShadow: '3px 3px 0px #000' }}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className={D ? "font-body text-[9px] text-[#8B5CF6] font-bold" : "font-pixel text-[5px] text-[#A78BFA]"}>{item.creator}</span>
                      <span className="text-xl">{item.emoji}</span>
                    </div>
                    <h4 className={D ? "font-game text-xs uppercase tracking-wide mb-1 text-black font-extrabold" : "font-game text-xs text-white uppercase tracking-wide mb-1"}>{item.title}</h4>
                    <p className="font-body text-[10px] leading-relaxed" style={D ? { color: '#555555' } : { color: 'rgba(255,255,255,0.6)' }}>{item.desc}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5" style={D ? { borderTopColor: '#EEEEEE' } : {}}>
                    <button
                      onClick={() => handleLikeItem(item.id)}
                      className={D ? `flex items-center gap-1 font-body text-[10px] px-2.5 py-1.5 border border-pink-100 rounded-lg cursor-pointer transition-colors ${
                        item.liked ? 'bg-pink-500 text-white border-none' : 'bg-pink-50/50 text-pink-500 hover:bg-pink-50'
                      }` : `flex items-center gap-1 font-pixel text-[6px] tracking-wide px-2 py-1 border border-black cursor-pointer transition-colors ${
                        item.liked ? 'bg-pink-600 text-white' : 'bg-black/20 text-white/50 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-2.5 h-2.5 ${item.liked ? 'fill-white' : ''}`} />
                      {item.likes} LIKES
                    </button>
                    <span className="font-pixel text-[4px] text-white/20 uppercase" style={D ? { fontFamily: '"Nunito", sans-serif', fontSize: 8, color: '#999999', fontWeight: 700 } : {}}>QUEST COMPILER</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUBMISSIONS LIST TAB */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                <div className="text-5xl opacity-30">📋</div>
                <p className="text-white/40 font-body text-sm">No submissions documented. Solve a solo mission to view stats!</p>
              </div>
            ) : (
              submissions.map((s, idx) => {
                const m = WEEKLY_MISSIONS_DATA.find(m => m.id === s.missionId);
                return (
                  <div 
                    key={idx} 
                    className={D ? "p-4 border rounded-xl" : "p-4 border-2 border-black"} 
                    style={D ? {
                      background: '#FFFFFF',
                      borderColor: '#E0E0E0',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                    } : { background: '#1E1B4B', boxShadow: '3px 3px 0px #000' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{m?.emoji || '🎯'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-game text-xs truncate" style={D ? { color: '#000000', fontWeight: 800 } : { color: '#ffffff' }}>{m?.title || 'Custom Mission'}</div>
                        <div className={D ? "text-gray-400 font-body text-[9px] font-bold" : "text-white/45 font-pixel text-[4.5px]"}>{new Date(s.submittedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={D ? "font-body text-[10px] px-2 py-0.5 text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-md font-extrabold" : "font-pixel text-[5px] px-2 py-0.5 text-black bg-[#10B981] border border-black"}>+{s.xp} XP</span>
                        {s.score !== undefined && (
                          <span className={D ? "font-body text-[10px] text-yellow-600 font-extrabold" : "font-pixel text-[5px] text-[#FFD60A]"}>Score: {s.score}%</span>
                        )}
                      </div>
                    </div>
                    <div className={D ? "bg-emerald-50/20 border-l-4 border-[#10B981] p-3 text-left rounded-r-lg" : "bg-black/25 border-l-4 border-[#10B981] p-3 text-left"}>
                      <p className="font-body text-xs italic" style={D ? { color: '#333333' } : { color: 'rgba(255, 255, 255, 0.8)' }}>"{s.text}"</p>
                    </div>
                    {s.feedback && (
                      <div className={D ? "mt-2 font-body text-[10px] bg-purple-50/30 border-l-4 border-[#B366FF] p-2 text-gray-700 rounded-r-lg" : "mt-2 font-body text-[10px] bg-black/40 border-l-4 border-[#7C3AED] p-2 text-white/70"}>
                        <strong className={D ? "text-purple-600 font-game text-[9px] block mb-0.5 font-bold" : "text-purple-400 font-game text-[8px] block mb-0.5"}>🤖 SPARKY ASSESSMENT:</strong>
                        {s.feedback}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Mission Observation Input Overlay */}
      <AnimatePresence>
        {selectedMission && mission && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm my-auto bg-[#1E1B4B] border-4 border-black p-4 shadow-[6px_6px_0px_#000]"
            >
              {/* Header */}
              <div className="p-3 mb-3 flex items-center gap-3 bg-[#16103A] border-b-2 border-black">
                <span className="text-3xl">{mission.emoji}</span>
                <div>
                  <h4 className="font-game text-xs text-white uppercase">{mission.title}</h4>
                  <span className="font-pixel text-[5px] text-warning">+{mission.xp_reward} XP Reward</span>
                </div>
              </div>

              {showGradeCard && evaluationResult ? (
                /* Evaluation Summary */
                <div className="space-y-4 text-center">
                  <div className="w-24 h-24 mx-auto flex flex-col items-center justify-center border-4 border-black bg-black/40 rounded-full">
                    <span className="font-pixel text-[5px] text-white/40 uppercase">Score</span>
                    <span className="font-game text-2xl text-emerald-400">{evaluationResult.score}%</span>
                  </div>

                  <div className="border border-white/10 bg-black/25 p-3 text-left">
                    <span className="font-pixel text-[5px] text-purple-400 block mb-1">🤖 AI FEEDBACK:</span>
                    <p className="font-body text-xs text-white/80 leading-relaxed italic">"{evaluationResult.feedback}"</p>
                  </div>

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
                    Claim XP & Continue ➔
                  </Button>
                </div>
              ) : (
                /* Submission entry */
                <div className="space-y-4">
                  <div className="bg-black/35 p-3 border border-white/5">
                    <span className="font-pixel text-[5px] text-purple-400 block mb-1">MISSION GOAL:</span>
                    <p className="font-body text-xs text-white/80 leading-relaxed">
                      {mission.isCustom ? mission.description : MISSION_HELPERS[mission.id]?.goal}
                    </p>
                  </div>

                  <div>
                    <span className="font-pixel text-[5px] text-white/40 block mb-1">YOUR FIELD OBSERVATION DETAIL:</span>
                    <textarea
                      value={text}
                      onChange={e => setText(e.target.value)}
                      placeholder="Write your research observations here..."
                      className="w-full pixel-input text-xs h-24 resize-none"
                    />
                    
                    <button
                      onClick={handleGetSuggestions}
                      disabled={loadingSuggestions}
                      className="mt-2 text-[#7C3AED] hover:text-purple-400 font-game text-[8px] bg-purple-950/20 px-2 py-1 border border-purple-900/30 flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                      {loadingSuggestions ? 'Asking Sparky...' : '💡 Get Suggestions from Sparky'}
                    </button>
                  </div>

                  {/* Suggestions mapping */}
                  {suggestions.length > 0 && (
                    <div className="bg-black/40 border border-[#7C3AED]/30 p-2 space-y-1">
                      {suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleApplySuggestion(sug)}
                          className="w-full text-left p-1 bg-purple-950/10 hover:bg-purple-950/30 border border-transparent hover:border-purple-800/40 text-[9px] font-body text-white/70"
                        >
                          • {sug}
                        </button>
                      ))}
                    </div>
                  )}


                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedMission(null)}>Cancel</Button>
                    <Button
                      variant="success"
                      fullWidth
                      disabled={!isValid}
                      onClick={handleSubmit}
                    >
                      Submit Observations 🚀
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
