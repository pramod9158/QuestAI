import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { XPToast, CardProgressBadge, CardProgressBar } from '@/components/ui/GameUI';
import { WEEKLY_MISSIONS_DATA } from '@/data/curriculum';
import { supabase } from '@/lib/supabase';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { FileText, CheckCircle, XCircle, Zap, ArrowLeft, HelpCircle, Sparkles, Users, Award, Image, ThumbsUp, Heart } from 'lucide-react';
import { generateMissionSuggestions, evaluateMissionSubmission } from '@/lib/gemini';
import { getPlatformProgress } from '@/lib/gamification';

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

const validateSubmission = (missionId: number, text: string) => {
  const t = text.trim().toLowerCase();
  const nonRepetitive = !/(.)\1{4,}/.test(t) && !/^(xyz|abc|test|qwerty|asdf)/.test(t) && text.trim().split(/\s+/).length >= 5;
  
  if (missionId === 1) {
    const keywords = ['phone', 'mobile', 'camera', 'face id', 'fingerprint', 'alexa', 'siri', 'assistant', 'speaker', 'tv', 'television', 'refrigerator', 'fridge', 'vacuum', 'robot', 'youtube', 'netflix', 'spotify', 'light', 'bulb', 'ac', 'conditioner', 'smart', 'ai', 'algorithm', 'app', 'feed', 'recommend'];
    const matches = keywords.filter(kw => t.includes(kw));
    const minChars = 35;
    return {
      isValid: text.trim().length >= minChars && matches.length >= 2 && nonRepetitive,
      requirements: [
        { label: `📝 Write at least ${minChars} characters`, done: text.trim().length >= minChars },
        { label: "🤖 Mention smart features (Alexa, Netflix, Siri, camera)", done: matches.length >= 2 },
        { label: "💡 Provide a realistic description (no spam)", done: nonRepetitive },
      ]
    };
  }
  
  // Default validation
  return {
    isValid: text.trim().length >= 15 && nonRepetitive,
    requirements: [
      { label: "📝 Write at least 15 characters", done: text.trim().length >= 15 },
      { label: "💡 Avoid random keyboard mashing/spam", done: nonRepetitive }
    ]
  };
};

export default function WeeklyMissions() {
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

  const validation = mission ? (
    mission.isCustom
      ? { isValid: text.trim().length >= 15, requirements: [{ label: "📝 Write at least 15 characters describing your observation", done: text.trim().length >= 15 }] }
      : validateSubmission(mission.id, text)
  ) : { isValid: false, requirements: [] };

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
    <div className="min-h-full pb-20 bg-stars bg-[#0F0A2E] text-white">
      {showXP && <XPToast amount={toastXP} reason="Mission reward claimed!" onDone={() => setShowXP(false)} />}

      {/* Header Banner */}
      <div 
        className="p-5 flex flex-col justify-between relative overflow-hidden border-b-3 border-black"
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #110B30 100%)'
        }}
      >
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-game text-lg text-white tracking-wide flex items-center gap-2">
              🎯 WEEKLY MISSION CONTROL
            </h1>
            <p className="text-white/55 font-body text-xs mt-0.5">Explore real-world challenges with AI telemetry!</p>
          </div>
          <button onClick={() => navigate('/learn')} className="p-2 border-2 border-black bg-black/30 text-white/50 hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation selectors */}
        <div className="flex mt-4 p-1 bg-black/40 border-2 border-black overflow-x-auto no-scrollbar gap-1">
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
                className={`py-2 px-3 font-game text-[10px] whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
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
          <div className="space-y-4">
            {/* Solo Progress panel */}
            <div
              className="p-4 space-y-3"
              style={{
                background: '#1E1B4B',
                border: '3px solid #7C3AED',
                boxShadow: '4px 4px 0px #000',
              }}
            >
              <div className="flex justify-between items-baseline text-[7px] font-pixel text-[#A78BFA]">
                <span>SOLO MISSIONS COMPLETED</span>
                <span>{completedMissionsCount}/{totalMissionsCount} ({missionPercent}%)</span>
              </div>
              <div className="w-full h-3 bg-[#0F0A2E] border-2 border-black p-[2px] flex items-center">
                <div 
                  className="h-full bg-[#7C3AED] transition-all duration-800" 
                  style={{ width: `${missionPercent}%` }} 
                />
              </div>
            </div>

            {/* Solo Missions list */}
            {allMissions.map((m, idx) => {
              const done = isSubmitted(m.id);
              const isLocked = activeMissionIndex !== -1 && idx > activeMissionIndex;
              const pVal = done ? 100 : parseInt(localStorage.getItem(`mission_progress_${m.id}`) || '0', 10);
              return (
                <div
                  key={m.id}
                  className={`p-4 border-2 border-black relative overflow-hidden transition-all flex flex-col justify-between ${
                    done ? 'bg-[#1E1B4B]/60 opacity-60' : isLocked ? 'bg-black/20 opacity-40' : 'bg-[#151036]'
                  }`}
                  style={{
                    boxShadow: done ? '2px 2px 0px #000' : '4px 4px 0px #000',
                  }}
                >
                  {done && (
                    <div className="completed-ribbon-container">
                      <div className="completed-ribbon font-pixel text-[5px]">DONE</div>
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{m.emoji}</span>
                      <h3 className="font-game text-xs text-white uppercase tracking-wide truncate max-w-[200px]">
                        {m.title}
                      </h3>
                    </div>
                    {!done && !isLocked && <CardProgressBadge percent={pVal} />}
                  </div>

                  <p className="font-body text-[11px] text-white/75 leading-relaxed mb-3">
                    {m.description}
                  </p>

                  <div className="flex items-center justify-between mt-1 pt-2.5 border-t border-white/5">
                    <span className="font-pixel text-[5px] text-warning flex items-center gap-1">
                      ⚡ +{m.xp_reward} XP Reward
                    </span>
                    {done ? (
                      <span className="font-pixel text-[5px] text-[#10B981] flex items-center gap-1">✓ Complete</span>
                    ) : isLocked ? (
                      <span className="font-pixel text-[5px] text-white/30 flex items-center gap-1">🔒 Locked</span>
                    ) : (
                      <button
                        onClick={() => setSelectedMission(m.id)}
                        className="px-4 py-1.5 font-game text-[9px] text-black bg-[#FFD60A] border border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                      >
                        Accept Mission ➔
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TEAM ADVENTURES TAB */}
        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="bg-[#1E1B4B] border-3 border-[#3B82F6] p-4 shadow-[4px_4px_0px_#000] space-y-2">
              <h3 className="font-game text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" /> Collaborative Crew Missions
              </h3>
              <p className="font-body text-xs text-white/60 leading-relaxed">
                Connect with school colleagues, split research tasks, and upload collective submissions. Complete missions to earn massive XP!
              </p>
            </div>

            {mockTeamMissions.map(team => {
              const joined = joinedTeams.includes(team.id);
              return (
                <div
                  key={team.id}
                  className={`p-4 border-2 border-black flex flex-col justify-between ${
                    joined ? 'bg-[#151F3C]' : 'bg-[#1E1B4B]'
                  }`}
                  style={{ boxShadow: '4px 4px 0px #000' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-game text-xs text-white uppercase tracking-wide">{team.title}</h4>
                    <span className="font-pixel text-[5px] text-yellow-400 bg-yellow-950/20 border border-yellow-800/40 px-1 py-0.5">
                      {joined ? team.membersJoined + 1 : team.membersJoined}/{team.membersRequired} TEAM JOINED
                    </span>
                  </div>

                  <p className="font-body text-[11px] text-white/70 leading-relaxed mb-3">
                    {team.description}
                  </p>

                  <div className="flex items-center justify-between border-t border-white/5 pt-2.5 mt-1">
                    <span className="font-pixel text-[5px] text-warning">⚡ +{team.xpReward} XP PER MEMBER</span>
                    {joined ? (
                      <span className="font-pixel text-[5px] text-emerald-400 bg-emerald-950/15 border border-emerald-800/30 px-2 py-1 flex items-center gap-1">
                        ✓ Registered in Crew
                      </span>
                    ) : (
                      <button
                        onClick={() => handleJoinTeam(team.id)}
                        className="px-4 py-1.5 font-game text-[9px] text-white bg-blue-600 border border-black shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-blue-700 transition-colors"
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
            <div className="bg-[#1E1B4B] border-3 border-[#F59E0B] p-4 shadow-[4px_4px_0px_#000] space-y-2">
              <h3 className="font-game text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-400" /> Monthly Creator Contest
              </h3>
              <p className="font-body text-xs text-white/60 leading-relaxed">
                Theme: **"The Smart Robot Teacher Assistant"**. Sketch, describe, or design an AI helper bot that grades homework, explains concepts, or rings recess bells!
              </p>
            </div>

            {contestSubmitted ? (
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="p-5 border-2 border-[#10B981] bg-[#10B981]/10 text-center space-y-2 shadow-[4px_4px_0px_#000]"
              >
                <div className="text-3xl">🎉</div>
                <h4 className="font-game text-xs text-white uppercase">Contest Submission Logged!</h4>
                <p className="font-body text-[10px] text-white/60">
                  Your entry is queued for evaluation. Stand by to win up to 250 Gems!
                </p>
                <button
                  onClick={() => setContestSubmitted(false)}
                  className="mt-2.5 px-4 py-1.5 font-game text-[9px] text-black bg-[#FFD60A] border border-black cursor-pointer"
                >
                  Edit Submission
                </button>
              </motion.div>
            ) : (
              <div
                className="p-4 space-y-3"
                style={{ background: '#1E1B4B', border: '2.5px solid #000', boxShadow: '4px 4px 0px #000' }}
              >
                <div>
                  <span className="text-white/40 font-pixel text-[5px] block mb-1">INVENTION PROMPT NAME:</span>
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
                  <span className="text-white/40 font-pixel text-[5px] block mb-1">DESCRIBE CONTEST INVENTION DESIGN:</span>
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
                  className="w-full py-3 bg-[#F59E0B] text-black font-game text-xs border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
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
            <div className="bg-[#1E1B4B] border-3 border-pink-500 p-4 shadow-[4px_4px_0px_#000] space-y-2">
              <h3 className="font-game text-xs text-white uppercase tracking-wider flex items-center gap-2">
                <Image className="w-4 h-4 text-pink-400" /> Student Showcase Gallery
              </h3>
              <p className="font-body text-xs text-white/60 leading-relaxed">
                Check out the creations other students have built and compiled in their AI sandboxes and Prompt/Create labs!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {galleryItems.map(item => (
                <div
                  key={item.id}
                  className="p-4 bg-[#1E1B4B] border-2 border-black relative overflow-hidden flex flex-col justify-between"
                  style={{ boxShadow: '3px 3px 0px #000' }}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-pixel text-[5px] text-[#A78BFA]">{item.creator}</span>
                      <span className="text-xl">{item.emoji}</span>
                    </div>
                    <h4 className="font-game text-xs text-white uppercase tracking-wide mb-1">{item.title}</h4>
                    <p className="font-body text-[10px] text-white/60 leading-relaxed">{item.desc}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5">
                    <button
                      onClick={() => handleLikeItem(item.id)}
                      className={`flex items-center gap-1 font-pixel text-[6px] tracking-wide px-2 py-1 border border-black cursor-pointer transition-colors ${
                        item.liked ? 'bg-pink-600 text-white' : 'bg-black/20 text-white/50 hover:text-white'
                      }`}
                    >
                      <Heart className={`w-2.5 h-2.5 ${item.liked ? 'fill-white' : ''}`} />
                      {item.likes} LIKES
                    </button>
                    <span className="font-pixel text-[4px] text-white/20 uppercase">QUEST COMPILER</span>
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
                    className="p-4 border-2 border-black" 
                    style={{ background: '#1E1B4B', boxShadow: '3px 3px 0px #000' }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{m?.emoji || '🎯'}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-game text-xs truncate">{m?.title || 'Custom Mission'}</div>
                        <div className="text-white/45 font-pixel text-[4.5px]">{new Date(s.submittedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-pixel text-[5px] px-2 py-0.5 text-black bg-[#10B981] border border-black">+{s.xp} XP</span>
                        {s.score !== undefined && (
                          <span className="font-pixel text-[5px] text-[#FFD60A]">Score: {s.score}%</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-black/25 border-l-4 border-[#10B981] p-3 text-left">
                      <p className="text-white/80 font-body text-xs italic">"{s.text}"</p>
                    </div>
                    {s.feedback && (
                      <div className="mt-2 font-body text-[10px] bg-black/40 border-l-4 border-[#7C3AED] p-2 text-white/70">
                        <strong className="text-purple-400 font-game text-[8px] block mb-0.5">🤖 SPARKY ASSESSMENT:</strong>
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

                  {/* Validation feedback checks */}
                  <div className="p-2 border border-white/10 bg-black/25 space-y-1">
                    {validation.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-1 text-[9px] font-body text-white/60">
                        <span>{req.done ? '✅' : '❌'}</span>
                        <span>{req.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setSelectedMission(null)}>Cancel</Button>
                    <Button
                      variant="success"
                      fullWidth
                      disabled={!validation.isValid}
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
