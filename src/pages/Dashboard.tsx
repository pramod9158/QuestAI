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
  const submissions = JSON.parse(localStorage.getItem('mission_submissions') || '[]').filter((s: any) => s.status === 'approved').length;
  const inventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]').length;
  const savedIdeas = JSON.parse(localStorage.getItem('saved_ideas') || '[]').length;

  const badges = profile ? getEarnedBadges(profile.xp, profile.current_streak) : [];
  const level = profile ? getLevel(profile.xp) : 1;

  if (!pinVerified) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0D0D1A 0%, #1A1040 100%)' }}
      >
        <div className="gradient-orb gradient-orb-mission" style={{ width: 240, height: 240, top: -60, left: -60, opacity: 0.4 }} />
        <div className="gradient-orb gradient-orb-primary" style={{ width: 180, height: 180, bottom: -40, right: -40, opacity: 0.35, animationDelay: '-5s' }} />
        <div className="w-full max-w-sm space-y-6 relative z-10">
          <div className="text-center">
            <div className="text-7xl mb-4">👨‍🏫</div>
            <h1
              className="font-heading font-bold text-xl"
              style={{ background: 'linear-gradient(135deg, #00C2FF, #5B5FFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
            >
              Parent/Teacher Dashboard
            </h1>
            <p className="text-white/50 font-body text-sm mt-2">Enter PIN to view progress report</p>
          </div>
          <div
            className="p-6 rounded-2xl space-y-4"
            style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(16px)', border: '1px solid rgba(0,194,255,0.25)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
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
    <div className="min-h-full pb-8">
      <div className="relative px-5 pt-6 pb-10 overflow-hidden">
        <div className="gradient-orb gradient-orb-mission" style={{ width: 180, height: 180, top: -50, right: -30, opacity: 0.4 }} />
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/45 hover:text-white mb-3 font-body text-sm transition-colors relative">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-heading font-bold text-xl text-white flex items-center gap-2 relative">👨‍🏫 Progress Dashboard</h1>
        <p className="text-white/50 font-body text-sm mt-1 relative">Learning report for {profile?.username}</p>
      </div>

      <div className="px-5 space-y-4 -mt-6">
        {/* Summary Card */}
        <div
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex items-center gap-4 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-heading font-bold"
              style={{ background: 'linear-gradient(135deg, #7F5AF0, #2CB67D)', boxShadow: '0 4px 16px rgba(127,90,240,0.5)' }}
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
                className="p-3 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                <div className="text-xl mb-1">{stat.emoji}</div>
                <div
                  className="font-heading font-bold text-lg"
                  style={{ background: `linear-gradient(135deg, ${stat.grad[0]}, ${stat.grad[1]})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                  {stat.value}<span className="text-white/30 text-xs font-normal" style={{ WebkitTextFillColor: 'rgba(255,255,255,0.3)' }}>/{stat.max}</span>
                </div>
                <div className="text-white/45 font-body text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Earned */}
        {badges.length > 0 && (
          <div
            className="p-5 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(127,90,240,0.15), rgba(44,182,125,0.08))', border: '1px solid rgba(127,90,240,0.3)', backdropFilter: 'blur(12px)' }}
          >
            <h3 className="font-heading font-bold text-sm text-white mb-4">🏆 Badges Earned</h3>
            <div className="flex flex-wrap gap-3">
              {badges.map(b => (
                <div key={b.id} className="flex flex-col items-center gap-1.5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: 'linear-gradient(135deg, rgba(127,90,240,0.3), rgba(44,182,125,0.2))', border: '1px solid rgba(127,90,240,0.5)', boxShadow: '0 4px 12px rgba(127,90,240,0.3)' }}
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
          className="p-5 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(255,214,10,0.12), rgba(255,159,28,0.07))', border: '1px solid rgba(255,214,10,0.3)', backdropFilter: 'blur(12px)' }}
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
          className="p-5 rounded-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(44,182,125,0.15), rgba(0,194,255,0.08))', border: '1px solid rgba(44,182,125,0.35)', backdropFilter: 'blur(12px)' }}
        >
          <h3 className="font-heading font-bold text-sm text-white mb-2">📜 Completion Certificate</h3>
          <p className="text-white/50 font-body text-xs mb-4">Generate a beautiful PDF certificate to share!</p>
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
