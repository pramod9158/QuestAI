import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { getLevel, getEarnedBadges } from '@/lib/gamification';
import { FileDown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function Dashboard() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const certRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const [pin, setPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);
  const CORRECT_PIN = '1234'; // Simple demo PIN

  const completedLessons = profile?.completed_lessons?.length || 0;
  const completedQuests = profile?.completed_quests?.length || 0;
  const submissions = JSON.parse(localStorage.getItem('mission_submissions') || '[]').length;
  const inventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]').length;
  const savedIdeas = JSON.parse(localStorage.getItem('saved_ideas') || '[]').length;

  const badges = profile ? getEarnedBadges(profile.xp, profile.current_streak) : [];
  const level = profile ? getLevel(profile.xp) : 1;

  if (!pinVerified) {
    return (
      <div className="min-h-screen bg-pixel-darker flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <div className="text-7xl mb-4">👨‍🏫</div>
            <h1 className="text-white font-game text-xl">Parent/Teacher Dashboard</h1>
            <p className="text-white/60 font-body text-sm mt-2">Enter PIN to view progress report</p>
          </div>
          <div className="border-4 border-black bg-pixel-dark p-6 space-y-4">
            <input
              type="password" inputMode="numeric" pattern="[0-9]*"
              value={pin} onChange={e => setPin(e.target.value)}
              placeholder="Enter PIN (demo: 1234)"
              className="pixel-input text-center text-2xl tracking-widest"
              maxLength={4}
            />
            {pin.length === 4 && pin !== CORRECT_PIN && (
              <p className="text-red-400 font-body text-xs text-center">❌ Incorrect PIN. Try 1234 for demo.</p>
            )}
            <Button variant="primary" fullWidth onClick={() => setPinVerified(true)} disabled={pin !== CORRECT_PIN}>
              Access Dashboard 🔓
            </Button>
          </div>
          <button onClick={() => navigate(-1)} className="w-full text-center text-white/40 font-body text-xs hover:text-white/70">
            ← Go back
          </button>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-full bg-pixel-darker pb-8">
      <div className="bg-gradient-to-b from-blue-game/30 to-pixel-darker p-5">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">👨‍🏫 Progress Dashboard</h1>
        <p className="text-white/60 font-body text-sm mt-1">Learning report for {profile?.username}</p>
      </div>

      <div className="px-4 space-y-5 pt-2">
        {/* Summary Card */}
        <div className="border-4 border-black bg-pixel-dark p-5 shadow-pixel">
          <div className="flex items-center gap-4 pb-4 border-b-2 border-white/10">
            <div className="w-16 h-16 border-4 border-black bg-primary flex items-center justify-center text-3xl">
              {profile?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-game text-lg">{profile?.username}</h2>
              <p className="text-white/60 font-body text-sm">{profile?.zone === 'junior' ? '🚀 Junior Explorer' : '🧠 Future Innovator'}</p>
              <p className="text-warning font-body text-xs">Level {level} • {profile?.xp} XP Total</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {[
              { emoji: '📺', label: 'Lessons Completed', value: completedLessons, max: 12 },
              { emoji: '⚔️', label: 'Quests Solved', value: completedQuests, max: 8 },
              { emoji: '🎯', label: 'Missions Done', value: submissions, max: 4 },
              { emoji: '💡', label: 'Ideas Generated', value: savedIdeas, max: '∞' },
              { emoji: '🏆', label: 'Badges Earned', value: badges.length, max: 10 },
              { emoji: '🔥', label: 'Day Streak', value: profile?.current_streak ?? 0, max: '∞' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border-2 border-white/10 p-3">
                <div className="text-xl mb-1">{stat.emoji}</div>
                <div className="text-white font-game text-lg">{stat.value}<span className="text-white/30 text-xs">/{stat.max}</span></div>
                <div className="text-white/50 font-body text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Earned */}
        {badges.length > 0 && (
          <div className="border-4 border-black bg-pixel-dark p-5">
            <h3 className="text-white font-game text-sm mb-4">🏆 Badges Earned</h3>
            <div className="flex flex-wrap gap-3">
              {badges.map(b => (
                <div key={b.id} className="flex flex-col items-center gap-1">
                  <div className="w-12 h-12 border-4 border-black bg-primary/30 flex items-center justify-center text-2xl">
                    {b.emoji}
                  </div>
                  <span className="text-white/60 font-body text-[9px] text-center max-w-[48px]">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Teacher Notes */}
        <div className="border-4 border-warning bg-warning/10 p-5">
          <h3 className="text-warning font-game text-sm mb-3">📝 Learning Insights</h3>
          <div className="space-y-2">
            {completedLessons >= 3 && <p className="text-white/80 font-body text-sm">✅ Actively engaged with AI curriculum</p>}
            {completedQuests >= 2 && <p className="text-white/80 font-body text-sm">✅ Demonstrates problem-solving through story quests</p>}
            {submissions >= 1 && <p className="text-white/80 font-body text-sm">✅ Completes real-world observation missions</p>}
            {savedIdeas >= 1 && <p className="text-white/80 font-body text-sm">✅ Shows creative thinking in AI idea generation</p>}
            {profile?.current_streak && profile.current_streak >= 3 && <p className="text-white/80 font-body text-sm">✅ Consistent learner with {profile.current_streak}-day streak</p>}
            {completedLessons === 0 && <p className="text-white/50 font-body text-sm italic">Student has not yet completed any lessons.</p>}
          </div>
        </div>

        {/* Certificate */}
        <div className="border-4 border-black bg-success/10 border-success p-5">
          <h3 className="text-white font-game text-sm mb-2">📜 Completion Certificate</h3>
          <p className="text-white/60 font-body text-xs mb-4">Generate a beautiful PDF certificate to share!</p>
          <Button variant="success" fullWidth loading={generating} onClick={generateCertificate} icon={<FileDown className="w-4 h-4" />}>
            Download PDF Certificate
          </Button>
        </div>
      </div>

      {/* Hidden Certificate template for PDF */}
      <div ref={certRef} style={{ position: 'absolute', left: '-9999px', top: 0, width: '800px', backgroundColor: '#0F0A2E', padding: '40px', fontFamily: 'Nunito, sans-serif' }}>
        <div style={{ border: '8px solid #7C3AED', padding: '40px', textAlign: 'center', background: 'linear-gradient(135deg, #1E1B4B, #0F0A2E)' }}>
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
