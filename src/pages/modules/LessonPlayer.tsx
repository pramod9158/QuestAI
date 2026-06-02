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
            <p className="text-white/70 font-body text-xs p-3 bg-blue-game/25 border-2 border-black rounded-2xl m-2 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.4)]">
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
            <p className="text-white/70 font-body text-xs p-3 bg-success/25 border-2 border-black rounded-2xl m-2 shadow-[inset_0px_2px_4px_rgba(0,0,0,0.4)]">
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
    <div className="min-h-full flex flex-col bg-pixel-darker">
      {showXP && <XPToast amount={lesson.xpReward} reason={`${lesson.title} complete!`} onDone={() => setShowXP(false)} />}

      {/* Header */}
      <div className="bg-pixel-dark border-b-4 border-black px-4 py-3 rounded-b-3xl flex items-center gap-3 shadow-[0px_5px_0px_0px_rgba(0,0,0,0.85)]">
        <button onClick={() => navigate('/learn')} className="touch-target text-white/60 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="text-white font-game text-sm truncate">{lesson.title}</div>
          <div className="text-white/40 font-body text-xs">{lesson.subtitle}</div>
        </div>
        <SpeakButton text={lesson.ttsIntro} />
      </div>

      {/* Split Layout: Video + Sandbox */}
      <div className="flex flex-col md:flex-row flex-1" style={{ minHeight: '60vh' }}>
        {/* Video Panel */}
        <div className="w-full md:w-1/2 flex flex-col border-b-4 md:border-b-0 md:border-r-4 border-black">
          <div className="bg-black/50 p-2 flex items-center justify-between border-b-2 border-black">
            <span className="text-white/60 font-body text-xs">📺 Video Lesson</span>
            <a
              href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-game font-body text-xs"
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
          <div className="p-3 bg-primary/10 border-t-2 border-black">
            <p className="text-white/70 font-body text-xs italic">"{lesson.ttsIntro}"</p>
          </div>
        </div>

        {/* Sandbox Panel */}
        <div className="w-full md:w-1/2 flex flex-col" style={{ minHeight: '300px' }}>
          <div className="bg-black/50 p-2 border-b-2 border-black">
            <span className="text-white/60 font-body text-xs">🎮 Try It Yourself</span>
          </div>
          <div className="flex-1 overflow-auto">
            {sandboxContent()}
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div className="border-t-4 border-black p-4 bg-pixel-dark rounded-t-3xl shadow-[0px_-5px_0px_0px_rgba(0,0,0,0.85)]">
        {completed ? (
          <div className="flex items-center justify-center gap-2 py-4">
            <CheckCircle className="w-6 h-6 text-success" />
            <span className="text-success font-game text-sm">Lesson Complete! +{lesson.xpReward} XP earned!</span>
          </div>
        ) : (
          <Button variant="success" size="lg" fullWidth onClick={handleComplete}>
            ✅ Mark as Complete (+{lesson.xpReward} XP)
          </Button>
        )}
        <button
          onClick={() => navigate('/learn')}
          className="w-full text-center text-white/40 font-body text-xs mt-2 hover:text-white/70"
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
          <div key={item} className={`border-4 border-black p-3.5 rounded-3xl shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] transition-all ${sorted[item] === 'smart' ? 'bg-success/20 border-success shadow-[0px_6px_0px_0px_rgba(16,185,129,0.3)]' : sorted[item] === 'dumb' ? 'bg-gray-800 shadow-[0px_6px_0px_0px_rgba(0,0,0,0.5)]' : 'bg-pixel-dark'}`}>
            <div className="text-white font-game text-xs text-center mb-2.5">{item}</div>
            <div className="flex gap-2">
              <button
                onClick={() => handleSort(item, 'smart')}
                className={`flex-1 border-4 border-black py-2 text-xs font-game rounded-2xl transition-all cursor-pointer hover:scale-[1.03] hover:-rotate-1 active:translate-y-0.5 shadow-[0px_3px_0px_0px_#000] active:shadow-none ${
                  sorted[item] === 'smart'
                    ? 'bg-gradient-to-r from-success to-success-light text-white shadow-[0px_3px_0px_0px_#000,inset_0px_2px_0px_0px_rgba(255,255,255,0.4)]'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                Smart 🤖
              </button>
              <button
                onClick={() => handleSort(item, 'dumb')}
                className={`flex-1 border-4 border-black py-2 text-xs font-game rounded-2xl transition-all cursor-pointer hover:scale-[1.03] hover:-rotate-1 active:translate-y-0.5 shadow-[0px_3px_0px_0px_#000] active:shadow-none ${
                  sorted[item] === 'dumb'
                    ? 'bg-gradient-to-r from-pixel-red to-red-400 text-white shadow-[0px_3px_0px_0px_#000,inset_0px_2px_0px_0px_rgba(255,255,255,0.4)]'
                    : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                Not 📦
              </button>
            </div>
          </div>
        ))}
      </div>
      {Object.keys(sorted).length === items.length && score === null && (
        <Button variant="primary" size="lg" fullWidth onClick={checkAnswers}>
          CHECK MY ANSWERS! 🚀
        </Button>
      )}
      {score !== null && (
        <div className="border-4 border-success bg-success/20 p-5 rounded-3xl text-center shadow-[0px_5px_0px_0px_rgba(16,185,129,0.5)]">
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
      <div className="space-y-3">
        {q.opts.map((opt, i) => {
          let optionStyles = 'bg-pixel-dark border-black text-white hover:bg-white/10 hover:scale-[1.02] hover:-rotate-0.5 shadow-[0px_6px_0px_0px_rgba(0,0,0,1)]';
          if (selected !== null) {
            if (i === q.a) {
              optionStyles = 'bg-gradient-to-r from-success to-success-light border-black text-white shadow-[0px_4px_0px_0px_#000000,inset_0px_3px_0px_0px_rgba(255,255,255,0.4)]';
            } else if (i === selected) {
              optionStyles = 'bg-gradient-to-r from-pixel-red to-red-400 border-black text-white shadow-[0px_4px_0px_0px_#000000,inset_0px_3px_0px_0px_rgba(255,255,255,0.4)]';
            } else {
              optionStyles = 'bg-pixel-dark opacity-40 border-black text-white/50 shadow-none pointer-events-none';
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              className={`w-full border-4 ${optionStyles} p-4 text-left font-game text-xs transition-all active:translate-y-0.5 active:shadow-none cursor-pointer rounded-2xl`}
            >
              <span className="font-pixel text-[10px] text-white/50 mr-2">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
