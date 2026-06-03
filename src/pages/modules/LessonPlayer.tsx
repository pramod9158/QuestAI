import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CURRICULUM } from '@/data/curriculum';
import { SpeakButton } from '@/components/ui/GameUI';
import { XPToast } from '@/components/ui/GameUI';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';

export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, guestProfile, isGuest, updateProfile } = useAuth();
  const lesson = CURRICULUM.find(l => l.id === id);
  const [showXP, setShowXP] = useState(false);

  if (!lesson) return <div className="p-6 text-white font-body">Lesson not found.</div>;

  const completed = profile?.completed_lessons?.includes(lesson.id) ?? false;

  const handleComplete = async () => {
    if (!completed) {
      const currentProfileXP = isGuest ? (guestProfile?.xp ?? 0) : (profile?.xp ?? 0);
      const currentProfileCoins = isGuest ? (guestProfile?.coins ?? 0) : (profile?.coins ?? 0);
      const currentCompletedLessons = profile?.completed_lessons || [];
      
      await updateProfile({
        xp: currentProfileXP + lesson.xpReward,
        coins: currentProfileCoins + (lesson.coinsReward || 0),
        completed_lessons: [...currentCompletedLessons, lesson.id],
      });
      setShowXP(true);
    }
  };

  const sandboxContent = () => {
    switch (lesson.sandboxType) {
      case 'teachable':
        return (
          <div className="flex flex-col h-full">
            <p className="text-white/70 font-body text-xs p-3 bg-blue-game/20 border-b-2 border-black">
              🎮 Try Google's Teachable Machine — train an AI with your webcam!
            </p>
            <iframe
              src="https://teachablemachine.withgoogle.com/train/image"
              className="flex-1 w-full"
              allow="camera; microphone"
              title="Teachable Machine"
            />
          </div>
        );
      case 'quickdraw':
        return (
          <div className="flex flex-col h-full">
            <p className="text-white/70 font-body text-xs p-3 bg-success/20 border-b-2 border-black">
              🎨 Draw something and let AI guess what it is!
            </p>
            <iframe src="https://quickdraw.withgoogle.com" className="flex-1 w-full" title="Quick Draw" />
          </div>
        );
      case 'dragdrop':
        return <DragDropSandbox />;
      case 'quiz':
        return <QuizSandbox lessonId={lesson.id} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <div className="text-6xl animate-float">{lesson.emoji}</div>
            <p className="text-white/70 font-body text-sm text-center">
              Interactive sandbox coming soon! Complete the video lesson to earn your XP.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      {showXP && <XPToast amount={lesson.xpReward} reason={`${lesson.title} complete!`} onDone={() => setShowXP(false)} />}

      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: '#1E1B4B', borderBottom: '3px solid #000000', boxShadow: '0 4px 0px 0px #000000' }}
      >
        <button onClick={() => navigate('/learn')} className="touch-target text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-heading font-bold text-sm text-white truncate">{lesson.title}</div>
          <div className="text-white/40 font-body text-xs">{lesson.subtitle}</div>
        </div>
        <SpeakButton text={lesson.ttsIntro} />
      </div>

      {/* Split Layout: Video + Sandbox */}
      <div className="flex flex-col md:flex-row flex-1" style={{ minHeight: '60vh' }}>
        {/* Video Panel */}
        <div className="w-full md:w-1/2 flex flex-col" style={{ borderBottom: '1px solid rgba(127,90,240,0.2)' }}>
          <div
            className="p-2 flex items-center justify-between"
            style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-white/50 font-body text-xs">📺 Video Lesson</span>
            <a
              href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-body text-xs transition-opacity hover:opacity-80"
              style={{ color: '#00C2FF' }}
            >
              Open <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="relative" style={{ paddingBottom: '56.25%' }}>
            <iframe
              src={`https://www.youtube.com/embed/${lesson.youtubeId}?rel=0&modestbranding=1&color=white&iv_load_policy=3`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          </div>
          {/* TTS Intro */}
          <div className="p-3" style={{ background: '#16103A', borderTop: '2px solid #000000' }}>
            <p className="text-white/60 font-body text-xs italic">"{lesson.ttsIntro}"</p>
          </div>
        </div>

        {/* Sandbox Panel */}
        <div className="w-full md:w-1/2 flex flex-col" style={{ minHeight: '300px' }}>
          <div
            className="p-2"
            style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-white/50 font-body text-xs">🎮 Try It Yourself</span>
          </div>
          <div className="flex-1 overflow-auto">
            {sandboxContent()}
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div
        className="p-4"
        style={{ background: '#16103A', borderTop: '3px solid #000000', boxShadow: '0 -4px 0px 0px #000000' }}
      >
        {completed ? (
          <div
            className="flex items-center justify-center gap-2 py-4 rounded-2xl"
            style={{ background: '#10B981', border: '3px solid #000000', boxShadow: '3px 3px 0px 0px #000000' }}
          >
            <CheckCircle className="w-6 h-6 text-white" />
            <span className="font-heading font-bold text-sm text-white">Lesson Complete! +{lesson.xpReward} XP earned!</span>
          </div>
        ) : (
          <Button variant="success" size="lg" fullWidth onClick={handleComplete}>
            ✅ Mark as Complete (+{lesson.xpReward} XP)
          </Button>
        )}
        <button
          onClick={() => navigate('/learn')}
          className="w-full text-center text-white/35 font-body text-xs mt-2 hover:text-white/60 transition-colors"
        >
          ← Back to curriculum
        </button>
      </div>
    </div>
  );
}

// Embedded drag-drop "Smart vs Dumb" sorter
function DragDropSandbox() {
  const items = ['Smart Speaker', 'Pencil', 'Netflix', 'Toaster', 'Google Maps', 'Chair', 'Phone Camera', 'Notebook'];
  const answers: Record<string, boolean> = {
    'Smart Speaker': true, 'Pencil': false, 'Netflix': true, 'Toaster': false,
    'Google Maps': true, 'Chair': false, 'Phone Camera': true, 'Notebook': false,
  };
  const [sorted, setSorted] = useState<Record<string, 'smart' | 'dumb' | null>>({});
  const [score, setScore] = useState<number | null>(null);

  const handleSort = (item: string, category: 'smart' | 'dumb') => {
    setSorted(prev => ({ ...prev, [item]: category }));
  };

  const checkAnswers = () => {
    let correct = 0;
    Object.entries(sorted).forEach(([item, cat]) => {
      if ((answers[item] && cat === 'smart') || (!answers[item] && cat === 'dumb')) correct++;
    });
    setScore(correct);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-white font-game text-sm text-center">Sort: Smart AI vs Not Smart?</div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => (
          <div key={item} className={`border-4 border-black p-3 ${sorted[item] === 'smart' ? 'bg-success/30' : sorted[item] === 'dumb' ? 'bg-gray-700' : 'bg-surface'}`}>
            <div className="text-white font-body text-sm text-center mb-2">{item}</div>
            <div className="flex gap-2">
              <button onClick={() => handleSort(item, 'smart')} className={`flex-1 border-2 border-black py-1 text-xs font-body ${sorted[item] === 'smart' ? 'bg-success text-white' : 'bg-white/10 text-white/70'}`}>🤖 Smart</button>
              <button onClick={() => handleSort(item, 'dumb')} className={`flex-1 border-2 border-black py-1 text-xs font-body ${sorted[item] === 'dumb' ? 'bg-gray-600 text-white' : 'bg-white/10 text-white/70'}`}>📦 Not</button>
            </div>
          </div>
        ))}
      </div>
      {Object.keys(sorted).length === items.length && score === null && (
        <button onClick={checkAnswers} className="w-full border-4 border-black bg-primary py-3 text-white font-game text-sm">
          CHECK MY ANSWERS!
        </button>
      )}
      {score !== null && (
        <div className="border-4 border-success bg-success/20 p-4 text-center">
          <div className="text-3xl mb-2">{score >= 6 ? '🏆' : score >= 4 ? '⭐' : '💪'}</div>
          <div className="text-white font-game text-sm">{score}/{items.length} Correct!</div>
          <div className="text-white/70 font-body text-xs mt-1">{score >= 6 ? 'Amazing! You\'re an AI expert!' : 'Good try! Keep learning!'}</div>
        </div>
      )}
    </div>
  );
}

// Quick inline quiz
function QuizSandbox({ lessonId }: { lessonId: string }) {
  const questions = [
    { q: 'What helps YouTube recommend videos?', opts: ['Random choice', 'AI learns your preferences', 'Your location', 'Your age'], a: 1 },
    { q: 'How does face recognition work?', opts: ['Magic', 'By comparing pixel patterns', 'By reading your ID', 'By asking you'], a: 1 },
  ];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[current].a) setCorrect(c => c + 1);
    setTimeout(() => {
      if (current + 1 >= questions.length) setDone(true);
      else { setCurrent(c => c + 1); setSelected(null); }
    }, 1200);
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center h-full p-6 gap-4">
      <div className="text-5xl">{correct === questions.length ? '🏆' : '⭐'}</div>
      <div className="text-white font-game text-sm">{correct}/{questions.length} Correct!</div>
    </div>
  );

  const q = questions[current];
  return (
    <div className="p-4 space-y-4">
      <div className="text-white/60 font-body text-xs">Question {current + 1}/{questions.length}</div>
      <div className="text-white font-game text-sm leading-relaxed">{q.q}</div>
      <div className="space-y-2">
        {q.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className={`w-full border-4 border-black p-3 text-left font-body text-sm transition-all ${
              selected === null ? 'bg-surface text-white hover:bg-white/10' :
              i === q.a ? 'bg-success text-white' :
              i === selected ? 'bg-pixel-red text-white' :
              'bg-surface text-white/40'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
