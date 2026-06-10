import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { getLevel, getEarnedBadges } from '@/lib/gamification';
import { 
  FileDown, ArrowLeft, MessageSquare, Sparkles, Send, Zap, 
  ShieldCheck, Award, Heart, CheckCircle2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  generateParentAssistantResponse, 
  generateParentCustomMission, 
  generateParentSkillAnalysis 
} from '@/lib/ai';

export default function Dashboard() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  
  const certRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [pin, setPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const CORRECT_PIN = '1234'; // Simple demo PIN

  // Tab State (Only 3 tabs now)
  const [activeTab, setActiveTab] = useState<'report' | 'skills' | 'cooperative'>('report');

  const completedLessons = profile?.completed_lessons?.length || 0;
  const completedQuests = profile?.completed_quests?.length || 0;
  const submissions = JSON.parse(localStorage.getItem('mission_submissions') || '[]').filter((s: any) => s.status === 'approved').length;
  const inventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]').length;
  const savedIdeas = JSON.parse(localStorage.getItem('saved_ideas') || '[]').length;

  const badges = profile ? getEarnedBadges(profile.xp, profile.current_streak) : [];
  const level = profile ? getLevel(profile.xp) : 1;

  // AI Parent Companion chat states
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: `Hi there! I am your QuestAI Parent Companion. Ask me anything about ${profile?.username || 'your child'}'s progress, strengths, or inventions!` }
  ]);
  const [sendingChat, setSendingChat] = useState(false);

  // Skill values calculation
  const computational = Math.min(100, completedLessons * 15 + level * 4);
  const observation = Math.min(100, submissions * 25 + (profile?.xp ? Math.floor(profile.xp / 45) : 0));
  const creative = Math.min(100, inventions * 30 + savedIdeas * 15 + level * 2);
  const ethics = Math.min(100, completedLessons * 10 + level * 5);
  const solving = Math.min(100, completedQuests * 15 + level * 5);

  const skills = { computational, observation, creative, ethics, solving };

  const skillList = [
    { name: 'Computational Thinking', value: computational, desc: 'Logical coding pathways, algorithm design, and neural network concepts.', color: '#00C2FF', level: computational < 40 ? 'Apprentice Coder' : computational < 80 ? 'Algorithm Builder' : 'Master Logic Architect' },
    { name: 'Real-World Observation', value: observation, desc: 'Identifying hardware sensors, daily smart appliances, and feedback loops.', color: '#10B981', level: observation < 40 ? 'Tech Spotter' : observation < 80 ? 'AI Detective' : 'Environment Explorer' },
    { name: 'Creative Innovation', value: creative, desc: 'Brainstorming original products, design thinking, and target audience alignment.', color: '#FFD60A', level: creative < 40 ? 'Dreamer' : creative < 80 ? 'Creative Brainstormer' : 'Grand AI Inventor' },
    { name: 'AI Ethics & Safety', value: ethics, desc: 'Understanding fairness in training data, privacy guardrails, and model bias.', color: '#EC4899', level: ethics < 40 ? 'Novice Citizen' : ethics < 80 ? 'Ethical Explorer' : 'Guardian of Trust' },
    { name: 'Critical Problem Solving', value: solving, desc: 'Logical debugging, story choice evaluation, and trade-off analysis.', color: '#FF8906', level: solving < 40 ? 'Puzzle Solver' : solving < 80 ? 'Branch Explorer' : 'Chief Systems Analyst' },
  ];

  // AI Diagnostic states
  const [diagnosticReport, setDiagnosticReport] = useState<string | null>(() => {
    return localStorage.getItem(`diagnostic_report_${profile?.username || 'user'}`);
  });
  const [generatingDiagnostic, setGeneratingDiagnostic] = useState(false);

  const handleGenerateDiagnostic = async () => {
    if (generatingDiagnostic) return;
    setGeneratingDiagnostic(true);
    try {
      const studentDataForAnalysis = {
        username: profile?.username || 'Student',
        level,
        xp: profile?.xp || 0,
        completedLessons,
        completedQuests,
        completedMissions: submissions,
        skills
      };
      const res = await generateParentSkillAnalysis(studentDataForAnalysis);
      setDiagnosticReport(res);
      localStorage.setItem(`diagnostic_report_${profile?.username || 'user'}`, res);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingDiagnostic(false);
    }
  };

  // Cooperative Hub States (Sticker seals & reviews)
  const [endorsementsList, setEndorsementsList] = useState<{ id: string; type: string; title: string; detail: string; date: string; score: number; isDemo?: boolean }[]>(() => {
    const rawSubs = JSON.parse(localStorage.getItem('mission_submissions') || '[]').filter((s: any) => s.status === 'approved');
    const myInventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]');
    
    const items: any[] = [];
    
    rawSubs.forEach((sub: any, idx: number) => {
      items.push({
        id: `mission_${sub.missionId || idx}`,
        type: 'mission',
        title: `Mission #${sub.missionId}: Field Observation`,
        detail: sub.text,
        date: sub.submittedAt || new Date().toISOString().split('T')[0],
        score: sub.score || 80,
      });
    });

    myInventions.forEach((inv: any, idx: number) => {
      items.push({
        id: `invention_${idx}`,
        type: 'invention',
        title: `Brainstorm: ${inv.ai_solution_name || inv.name}`,
        detail: `Problem: ${inv.problem}. Solution: ${inv.ai_solution_description || inv.description}. Target: ${inv.target_audience || inv.audience || 'Everyone'}.`,
        date: inv.created_at || new Date().toISOString().split('T')[0],
        score: inv.innovation_score || 85,
      });
    });

    if (items.length === 0) {
      items.push({
        id: 'demo_mission_1',
        type: 'mission',
        title: 'Mission #1: Smart Devices Spotter (Demo)',
        detail: "I found a face recognition camera on my dad's phone and a smart speaker in the kitchen. The smart speaker uses voice recognition AI to understand when I ask for cricket updates, and phone camera uses facial keypoints matching.",
        date: new Date().toISOString().split('T')[0],
        score: 92,
        isDemo: true,
      });
      items.push({
        id: 'demo_invention_2',
        type: 'invention',
        title: 'Brainstorm: Eco-Trash Sorter AI (Demo)',
        detail: "Problem: Wasting recyclable plastics. Solution: An AI scanner placed above school dustbins that identifies plastic bottles, counts them, and awards students green points to buy pencils.",
        date: new Date().toISOString().split('T')[0],
        score: 94,
        isDemo: true,
      });
    }

    return items;
  });

  const [endorsedIds, setEndorsedIds] = useState<string[]>(() => {
    return JSON.parse(localStorage.getItem('parent_endorsed_ids') || '[]');
  });

  const [endorsingSubId, setEndorsingSubId] = useState<string | null>(null);
  const [selectedSticker, setSelectedSticker] = useState('🌟');
  const [selectedStickerLabel, setSelectedStickerLabel] = useState('Star Explorer');
  const [parentNote, setParentNote] = useState('');

  const stickers = [
    { emoji: '🌟', label: 'Star Explorer' },
    { emoji: '🧠', label: 'AI Genius' },
    { emoji: '🎖️', label: 'Master Mind' },
    { emoji: '❤️', label: 'Super Proud' },
  ];

  const handleSendEndorsement = (itemId: string, itemTitle: string) => {
    if (!parentNote.trim()) return;

    const currentEndorsements = JSON.parse(localStorage.getItem('parent_endorsements') || '[]');
    const newEndorsement = {
      id: Math.random().toString(),
      itemId,
      title: itemTitle,
      sticker: selectedSticker,
      stickerLabel: selectedStickerLabel,
      message: parentNote,
      timestamp: new Date().toISOString(),
      claimed: false,
    };
    currentEndorsements.push(newEndorsement);
    localStorage.setItem('parent_endorsements', JSON.stringify(currentEndorsements));

    const updatedEndorsed = [...endorsedIds, itemId];
    setEndorsedIds(updatedEndorsed);
    localStorage.setItem('parent_endorsed_ids', JSON.stringify(updatedEndorsed));

    setEndorsingSubId(null);
    setParentNote('');
    setSelectedSticker('🌟');
    setSelectedStickerLabel('Star Explorer');
  };

  // Original AI Companion Chat handler
  const handleSendChat = async (messageText?: string) => {
    const textToSend = messageText || chatInput;
    if (!textToSend.trim() || sendingChat) return;

    const newMessages = [...chatMessages, { role: 'user' as const, text: textToSend }];
    setChatMessages(newMessages);
    if (!messageText) setChatInput('');
    setSendingChat(true);

    const rawSubs = JSON.parse(localStorage.getItem('mission_submissions') || '[]');
    const rawInventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]');
    const formattedSubs = rawSubs.map((s: any) => ({
      text: s.text,
      score: s.score || 100,
      feedback: s.feedback || ''
    }));
    const formattedInventions = rawInventions.map((i: any) => ({
      name: i.name,
      description: i.description,
      innovation_score: i.innovation_score || 80
    }));

    const studentData = {
      username: profile?.username || 'Student',
      level,
      xp: profile?.xp || 0,
      completedLessons,
      completedQuests,
      completedMissions: submissions,
      inventions: formattedInventions,
      observations: formattedSubs,
      streak: profile?.current_streak || 0
    };

    try {
      const response = await generateParentAssistantResponse(studentData, textToSend);
      setChatMessages(prev => [...prev, { role: 'assistant', text: response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "Sorry, I had trouble analyzing the progress right now. Please try again." }]);
    } finally {
      setSendingChat(false);
    }
  };

  // Original Custom Mission states
  const [customTopic, setCustomTopic] = useState('');
  const [generatedMission, setGeneratedMission] = useState<{ title: string; description: string; tasks: string[]; xp_reward: number } | null>(null);
  const [generatingMission, setGeneratingMission] = useState(false);
  const [missionAdded, setMissionAdded] = useState(false);

  const handleGenerateMission = async () => {
    if (!customTopic.trim() || generatingMission) return;
    setGeneratingMission(true);
    setGeneratedMission(null);
    setMissionAdded(false);
    try {
      const res = await generateParentCustomMission(customTopic);
      setGeneratedMission(res);
      setCustomTopic('');
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingMission(false);
    }
  };

  const handleAddCustomMission = () => {
    if (!generatedMission) return;
    const existing = JSON.parse(localStorage.getItem('parent_custom_missions') || '[]');
    const newMission = {
      id: 100 + existing.length,
      emoji: '💡',
      title: generatedMission.title,
      description: generatedMission.description,
      xp_reward: generatedMission.xp_reward,
      tasks: generatedMission.tasks,
      isCustom: true
    };
    existing.push(newMission);
    localStorage.setItem('parent_custom_missions', JSON.stringify(existing));
    setMissionAdded(true);
  };

  const generateCertificate = async () => {
    if (!certRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: '#0F0A2E', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210);
      pdf.save(`${profile?.username || 'student'}_AI_Explorer_Certificate.pdf`);
    } catch (err) { console.error('PDF generation failed:', err); }
    setGenerating(false);
  };

  // PIN Verification screen (identical to original)
  if (!pinVerified) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: '#0F0A2E' }}
      >
        <div className="w-full max-w-sm space-y-6 relative z-10">
          <div className="text-center">
            <div className="text-7xl mb-4">👨‍🏫</div>
            <h1
              className="font-heading font-bold text-xl"
              style={{ color: '#00C2FF' }}
            >
              Parent/Teacher Dashboard
            </h1>
            <p className="text-white/50 font-body text-sm mt-2">Enter PIN to view progress report</p>
          </div>
          <div
            className="p-6 space-y-4"
            style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '6px 6px 0px 0px #000000' }}
          >
            <input
              type="password" inputMode="numeric" pattern="[0-9]*"
              value={pin} onChange={e => setPin(e.target.value)}
              placeholder="Enter PIN (demo: 1234)"
              className="pixel-input text-center text-2xl tracking-widest"
              maxLength={4}
            />
            {pin.length === 4 && pin !== CORRECT_PIN && (
              <p className="font-body text-xs text-center" style={{ color: '#F25F4C' }}>❌ Incorrect PIN. Try 1234 for demo.</p>
            )}
            <Button variant="primary" fullWidth onClick={() => setPinVerified(true)} disabled={pin !== CORRECT_PIN}>
              Access Dashboard 🔓
            </Button>
          </div>
          <button onClick={() => navigate(-1)} className="w-full text-center text-white/35 font-body text-xs hover:text-white/60 transition-colors">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col pb-8" style={{ backgroundColor: '#0F0A2E' }}>
      
      {/* Hero Header */}
      <div className="relative px-5 pt-6 pb-6 overflow-hidden">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/45 hover:text-white mb-3 font-body text-sm transition-colors relative">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center justify-between gap-3 relative">
          <div>
            <h1 className="font-heading font-bold text-xl text-white flex items-center gap-2">👨‍🏫 Parent Dashboard</h1>
            <p className="text-white/50 font-body text-sm mt-1">Learning report for {profile?.username}</p>
          </div>
        </div>
      </div>

      {/* Pixel Tab Bar (Only 3 Core Tabs) */}
      <div className="px-5 mb-5">
        <div className="flex border-4 border-black bg-surface overflow-x-auto select-none no-scrollbar shadow-[3px_3px_0px_#000]">
          {[
            { id: 'report', label: '📊 Progress', emoji: '📊' },
            { id: 'skills', label: '🎯 Skill Map', emoji: '🎯' },
            { id: 'cooperative', label: '🤝 Cooperative', emoji: '🤝' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex-1 py-3 px-2 text-center font-game text-[10px] whitespace-nowrap border-r-2 last:border-r-0 border-black transition-colors min-w-[80px] cursor-pointer ${
                activeTab === t.id ? 'bg-primary text-white font-bold' : 'bg-surface text-white/50 hover:text-white'
              }`}
            >
              <span className="block text-base mb-0.5">{t.emoji}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs Content */}
      <div className="px-5 space-y-4">
        
        {/* ── TAB 1: PROGRESS REPORT ── */}
        {activeTab === 'report' && (
          <div className="space-y-4">
            
            {/* Summary Card */}
            <div
              className="p-5"
              style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                <div
                  className="w-16 h-16 flex items-center justify-center text-3xl font-heading font-bold"
                  style={{ background: '#7C3AED', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
                >
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-heading font-bold text-lg text-white">{profile?.username}</h2>
                  <p className="text-white/50 font-body text-sm">{profile?.zone === 'junior' ? '🚀 Junior Explorer' : '🧠 Future Innovator'}</p>
                  <p className="font-heading font-semibold text-xs mt-0.5" style={{ color: '#FFD60A' }}>Level {level} • {profile?.xp} XP Total</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[
                  { emoji: '📺', label: 'Lessons', value: completedLessons, max: 12, grad: ['#00C2FF', '#5B5FFF'] },
                  { emoji: '⚔️', label: 'Quests', value: completedQuests, max: 8, grad: ['#7F5AF0', '#2CB67D'] },
                  { emoji: '🎯', label: 'Missions', value: submissions, max: 4, grad: ['#FF8906', '#F25F4C'] },
                  { emoji: '💡', label: 'Ideas', value: savedIdeas, max: '∞', grad: ['#FFD60A', '#FF9F1C'] },
                  { emoji: '🏆', label: 'Badges', value: badges.length, max: 10, grad: ['#7F5AF0', '#2CB67D'] },
                  { emoji: '🔥', label: 'Streak', value: profile?.current_streak ?? 0, max: '∞', grad: ['#FF8906', '#F25F4C'] },
                ].map(stat => (
                  <div
                    key={stat.label}
                    className="p-3"
                    style={{ background: '#16103A', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
                  >
                    <div className="text-xl mb-1">{stat.emoji}</div>
                    <div
                      className="font-heading font-bold text-lg"
                      style={{ color: stat.grad[0] }}
                    >
                      {stat.value}<span className="text-white/30 text-xs font-normal">/{stat.max}</span>
                    </div>
                    <div className="text-white/45 font-body text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Badges Earned */}
            {badges.length > 0 && (
              <div
                className="p-5"
                style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
              >
                <h3 className="font-heading font-bold text-sm text-white mb-4">🏆 Badges Earned</h3>
                <div className="flex flex-wrap gap-3">
                  {badges.map(b => (
                    <div key={b.id} className="flex flex-col items-center gap-1.5">
                      <div
                        className="w-12 h-12 flex items-center justify-center text-2xl"
                        style={{ background: '#7C3AED', border: '2px solid #000000', boxShadow: '2px 2px 0px #000000' }}
                      >
                        {b.emoji}
                      </div>
                      <span className="text-white/55 font-body text-[9px] text-center max-w-[48px]">{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Insights */}
            <div
              className="p-5"
              style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <h3 className="font-heading font-bold text-sm mb-3" style={{ color: '#FFD60A' }}>📝 Learning Insights</h3>
              <div className="space-y-2">
                {completedLessons >= 3 && <p className="text-white/80 font-body text-sm">✅ Actively engaged with AI curriculum</p>}
                {completedQuests >= 2 && <p className="text-white/80 font-body text-sm">✅ Demonstrates problem-solving through story quests</p>}
                {submissions >= 1 && <p className="text-white/80 font-body text-sm">✅ Completes real-world observation missions</p>}
                {savedIdeas >= 1 && <p className="text-white/80 font-body text-sm">✅ Shows creative thinking in AI idea generation</p>}
                {profile?.current_streak && profile.current_streak >= 3 && <p className="text-white/80 font-body text-sm">✅ Consistent learner with {profile.current_streak}-day streak</p>}
                {completedLessons === 0 && <p className="text-white/45 font-body text-sm italic">Student has not yet completed any lessons.</p>}
              </div>
            </div>

            {/* Certificate */}
            <div
              className="p-5"
              style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <h3 className="font-heading font-bold text-sm text-white mb-2">📜 Completion Certificate</h3>
              <p className="text-white/50 font-body text-xs mb-4">Generate a beautiful PDF certificate to share!</p>
              <Button variant="success" fullWidth loading={generating} onClick={generateCertificate} icon={<FileDown className="w-4 h-4" />}>
                Download PDF Certificate
              </Button>
            </div>

            {/* AI Assistant Chat */}
            <div
              className="p-5 space-y-4"
              style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                  🤖 QuestAI Parent Companion <span className="bg-primary/20 text-primary-light text-[8px] font-heading px-1.5 py-0.5 rounded border border-primary/30 uppercase tracking-wider">AI Coach</span>
                </h3>
              </div>
              
              <p className="text-white/60 font-body text-xs leading-relaxed">
                Get instant AI insights about your child's lessons, observations, inventions, and personalized learning tips.
              </p>

              {/* Chat Messages */}
              <div className="space-y-3 bg-black/30 border border-white/5 p-3 max-h-60 overflow-y-auto">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`p-3 max-w-[85%] text-xs font-body leading-relaxed border border-black ${
                        msg.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white/10 text-white/90 border border-white/5'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <span className="text-[8px] font-heading text-primary-light block mb-1 uppercase tracking-wider">🤖 QuestAI Assistant</span>
                      )}
                      {msg.text}
                    </div>
                  </div>
                ))}
                {sendingChat && (
                  <div className="flex justify-start">
                    <div className="bg-white/10 p-3 rounded-xl rounded-tl-none border border-white/5 text-xs text-white/50 font-body flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary animate-spin" /> Thinking...
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Suggestions */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "📋 Summarize progress", query: "Summarize my child's learning progress and current report." },
                  { label: "💡 Recommend next steps", query: "What are some areas my child can improve in, and what should they study next?" },
                  { label: "✨ Highlight child's creativity", query: "What are some creative inventions or observations my child submitted?" }
                ].map((chip) => (
                  <button
                    key={chip.label}
                    disabled={sendingChat}
                    onClick={() => handleSendChat(chip.query)}
                    className="text-[10px] font-body bg-white/5 hover:bg-white/10 text-white/70 hover:text-white px-2.5 py-1 rounded-full border border-white/10 hover:border-primary/40 transition-all cursor-pointer animate-none"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                  placeholder="Ask anything about their progress..."
                  disabled={sendingChat}
                  className="flex-1 pixel-input px-3 py-2 text-xs text-white placeholder-white/30"
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={sendingChat || !chatInput.trim()}
                  className="btn-primary p-2 flex items-center justify-center cursor-pointer text-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SKILL MAP & DIAGNOSTICS (FULLY UNLOCKED) ── */}
        {activeTab === 'skills' && (
          <div className="space-y-4">
            
            {/* Dynamic Skill Ratings */}
            <div
              className="p-5 space-y-4"
              style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                🎯 Student Cognitive Skill Map
              </h3>
              <p className="text-white/60 font-body text-xs leading-relaxed">
                We track growth across 5 critical dimensions of digital literacy, derived directly from your child's lessons, quests, and active mission observations.
              </p>

              <div className="space-y-4 mt-2">
                {skillList.map(skill => (
                  <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <span className="font-game text-[10px] text-white">{skill.name}</span>
                      <span className="font-pixel text-[8px]" style={{ color: skill.color }}>{skill.level} ({skill.value}%)</span>
                    </div>
                    <div className="w-full h-4 bg-[#16103A] border-2 border-black flex items-center p-[2px]">
                      <div 
                        className="h-full border-r border-black shadow-[inset_-2px_0px_0px_rgba(0,0,0,0.2)]" 
                        style={{ width: `${skill.value}%`, backgroundColor: skill.color, transition: 'width 0.8s ease' }} 
                      />
                    </div>
                    <p className="text-white/45 font-body text-[9px] leading-snug">{skill.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Diagnostics Block (Fully open and available by default) */}
            <div
              className="p-5 space-y-3 relative overflow-hidden"
              style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <div className="flex items-center gap-1.5 text-warning font-heading font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <h3>🧠 AI Cognitive Diagnostic Report</h3>
              </div>

              <div className="space-y-3 mt-2">
                <p className="text-white/60 font-body text-xs">
                  Generate a personalized learning analysis summarizing your child's mental models, cognitive strengths, and recommended areas of enrichment.
                </p>

                {diagnosticReport ? (
                  <div className="bg-black/30 border-2 border-[#7C3AED] p-4 text-xs font-body leading-relaxed text-white/90 shadow-[inset_0px_0px_6px_rgba(124,58,237,0.3)] animate-none">
                    <div className="font-heading font-bold text-primary-light mb-2 uppercase text-[9px] tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-primary-light" /> QuestAI Counselor Analysis
                    </div>
                    {diagnosticReport}
                    <button 
                      type="button"
                      onClick={handleGenerateDiagnostic}
                      disabled={generatingDiagnostic}
                      className="mt-3 text-white/45 hover:text-warning text-[9px] font-body flex items-center gap-1 transition-colors bg-white/5 hover:bg-white/10 px-2 py-1 border border-white/10 cursor-pointer"
                    >
                      {generatingDiagnostic ? 'Re-analyzing...' : '🔄 Refresh Report'}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleGenerateDiagnostic}
                    disabled={generatingDiagnostic}
                    className="w-full bg-[#FFD60A] text-black font-game text-xs py-3 border-4 border-black shadow-[4px_4px_0px_#000] cursor-pointer hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
                  >
                    {generatingDiagnostic ? (
                      <>
                        <Sparkles className="w-4 h-4 animate-spin" />
                        Analyzing Student Profiles...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate Diagnostic Summary ✨
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: COOPERATIVE HUB (FULLY UNLOCKED) ── */}
        {activeTab === 'cooperative' && (
          <div className="space-y-4">
            
            {/* Custom Mission Generator (Fully open and available by default) */}
            <div
              className="p-5 space-y-4 relative overflow-hidden"
              style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-warning" />
                <h3 className="font-heading font-bold text-sm text-white">💡 Custom Mission Generator</h3>
              </div>
              <p className="text-white/60 font-body text-xs leading-relaxed">
                Create a customized learning mission on any real-world topic. QuestBot will frame a 3-step observation checklist for your child!
              </p>

              <div className="space-y-4">
                {generatedMission && (
                  <div className="border-2 border-warning bg-warning/5 p-4 space-y-3">
                    <div>
                      <span className="font-pixel text-[6px] text-warning block mb-1">Generated Mission</span>
                      <h4 className="text-white font-game text-sm">💡 {generatedMission.title}</h4>
                      <p className="text-white/70 font-body text-xs mt-1">{generatedMission.description}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-white/50 font-body text-[9px] block">Steps Checklist:</span>
                      {generatedMission.tasks.map((task: string, i: number) => (
                        <div key={i} className="text-white/80 font-body text-[10px] flex items-start gap-1">
                          <span>•</span>
                          <span>{task}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-warning font-pixel text-[8px] flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> +{generatedMission.xp_reward} XP Reward
                    </div>
                    
                    {!missionAdded ? (
                      <Button
                        variant="success"
                        size="sm"
                        fullWidth
                        onClick={handleAddCustomMission}
                      >
                        🚀 Add to Quest Map
                      </Button>
                    ) : (
                      <div className="bg-success/20 border border-success/45 p-2 text-center text-success font-game text-xs animate-none">
                        ✅ Mission added to Quest Map!
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder="e.g., Recycling trash, planting trees..."
                    className="flex-1 pixel-input text-xs text-white placeholder-white/35"
                    disabled={generatingMission}
                    onKeyDown={(e) => e.key === 'Enter' && handleGenerateMission()}
                  />
                  <Button
                    onClick={handleGenerateMission}
                    loading={generatingMission}
                    disabled={!customTopic.trim()}
                    size="sm"
                  >
                    Generate
                  </Button>
                </div>
              </div>
            </div>

            {/* Verification Feed & Endorsements */}
            <div
              className="p-5 space-y-4"
              style={{ background: '#1E1B4B', border: '3px solid #000000', boxShadow: '4px 4px 0px 0px #000000' }}
            >
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                🤝 Review Child Submissions & Inventions
              </h3>
              <p className="text-white/60 font-body text-xs leading-relaxed">
                Approve your child's creative ideas and observation logs. Add a parent encouraging sticker and comment, rewarding them with bonus coins in their mailbox!
              </p>

              <div className="space-y-4 mt-3">
                {endorsementsList.map(item => {
                  const isEndorsed = endorsedIds.includes(item.id);
                  return (
                    <div 
                      key={item.id}
                      className="border-2 border-black p-4 relative animate-none"
                      style={{ background: '#16103A' }}
                    >
                      {item.isDemo && (
                        <span className="absolute top-2 right-2 bg-purple-900/60 border border-purple-500/50 text-purple-300 font-pixel text-[5px] px-1 py-0.5">
                          DEMO
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <span className="text-base">{item.type === 'mission' ? '🎯' : '💡'}</span>
                        <h4 className="font-game text-xs text-white">{item.title}</h4>
                      </div>
                      <span className="text-white/30 font-body text-[8px] block mt-0.5">Submitted: {item.date}</span>
                      
                      <div className="my-2.5 p-2 bg-black/25 text-white/80 font-body text-[10px] leading-relaxed border-l-2 border-primary">
                        "{item.detail}"
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className="text-success font-pixel text-[8px]">Score: {item.score}%</span>

                        {isEndorsed ? (
                          <div className="text-success font-game text-[9px] flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Endorsed
                          </div>
                        ) : endorsingSubId === item.id ? (
                          <div className="w-full mt-3 border-t border-white/5 pt-3 space-y-3">
                            <span className="text-white/70 font-game text-[9px] block">Select Approval Seal:</span>
                            <div className="grid grid-cols-4 gap-2">
                              {stickers.map(s => (
                                <button
                                  type="button"
                                  key={s.label}
                                  onClick={() => { setSelectedSticker(s.emoji); setSelectedStickerLabel(s.label); }}
                                  className={`p-2 border-2 text-center text-lg flex flex-col items-center gap-1 transition-colors cursor-pointer ${
                                    selectedSticker === s.emoji ? 'bg-primary border-white' : 'bg-black/20 border-black hover:bg-black/30'
                                  }`}
                                >
                                  <span>{s.emoji}</span>
                                  <span className="text-[7px] font-body text-white/55 whitespace-nowrap">{s.label.split(' ')[0]}</span>
                                </button>
                              ))}
                            </div>

                            <div className="space-y-1">
                              <span className="text-white/70 font-game text-[9px] block">Encouraging Note:</span>
                              <textarea
                                value={parentNote}
                                onChange={(e) => setParentNote(e.target.value)}
                                placeholder="e.g. Great observation! I love how you explained the sensor."
                                className="w-full pixel-input text-[10px] p-2 h-14 bg-[#0F0A2E] text-white"
                              />
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleSendEndorsement(item.id, item.title)}
                                disabled={!parentNote.trim()}
                                className="flex-1 bg-success hover:bg-emerald-500 text-white font-game text-[9px] py-2 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-40 animate-none"
                              >
                                Send Seal (+50 Coins)
                              </button>
                              <button
                                type="button"
                                onClick={() => setEndorsingSubId(null)}
                                className="bg-white/10 hover:bg-white/15 text-white/80 font-game text-[9px] px-3.5 py-2 border border-white/20 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => { setEndorsingSubId(item.id); setParentNote(`Amazing work on ${item.title}! Super proud of you.`); }}
                            className="bg-primary hover:bg-primary-light text-white font-game text-[9px] px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                          >
                            Verify & Endorse 🎖️
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden Certificate template for PDF (Identical to original) */}
      <div ref={certRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', backgroundColor: '#0F0A2E', padding: '40px', fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ border: '8px solid #7C3AED', padding: '40px', textAlign: 'center', background: '#1E1B4B' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
          <h1 style={{ color: '#F59E0B', fontSize: '28px', marginBottom: '8px', fontWeight: 'bold' }}>CERTIFICATE OF ACHIEVEMENT</h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '24px' }}>AI Explorer — Gamified AI Learning Platform</p>
          <div style={{ borderTop: '2px solid rgba(255,255,255,0.2)', borderBottom: '2px solid rgba(255,255,255,0.2)', padding: '20px', margin: '20px 0' }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>This certifies that</p>
            <h2 style={{ color: 'white', fontSize: '36px', margin: '8px 0', fontWeight: 'bold' }}>{profile?.username}</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>has successfully completed</p>
            <p style={{ color: '#10B981', fontSize: '18px', fontWeight: 'bold', marginTop: '8px' }}>
              {completedLessons} AI Lessons • {badges.length} Badges • Level {level}
            </p>
          </div>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>
            Total XP: {profile?.xp} • {new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {badges.map(b => (
              <span key={b.id} style={{ background: 'rgba(124,58,237,0.3)', border: '2px solid #7C3AED', padding: '4px 12px', color: 'white', fontSize: '12px' }}>
                {b.emoji} {b.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
