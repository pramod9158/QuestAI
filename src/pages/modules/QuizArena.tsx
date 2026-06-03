import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { QUIZ_QUESTIONS } from '@/data/curriculum';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { Timer, Zap, Trophy, RotateCcw, ArrowLeft } from 'lucide-react';

type Mode = 'lobby' | 'time-attack' | 'casual' | 'results';

export default function QuizArena() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const topic = searchParams.get('topic');

  const { profile, guestProfile, isGuest, updateProfile } = useAuth();
  const currentProfile = useCurrentProfile();
  const userZone = currentProfile?.zone || 'junior';
  const [mode, setMode] = useState<Mode>('lobby');
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXPEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showXP, setShowXP] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);

  // Filter questions by student's age zone and topic
  let questions = QUIZ_QUESTIONS.filter(q => q.zone === userZone || q.zone === 'both');
  if (topic) {
    const filtered = questions.filter(q => 
      q.question.toLowerCase().includes(topic.toLowerCase()) || 
      q.options.some(o => o.toLowerCase().includes(topic.toLowerCase()))
    );
    if (filtered.length > 0) {
      questions = filtered;
    }
  }

  // Timer for time attack
  useEffect(() => {
    if (mode !== 'time-attack' || selected !== null) return;
    if (timeLeft <= 0) { handleAnswer(-1); return; }
    const t = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(t);
  }, [mode, timeLeft, selected]);

  useEffect(() => {
    if (mode === 'casual' || mode === 'time-attack') {
      const progKey = topic ? `play_progress_quiz_${topic}` : 'play_progress_quiz';
      const percent = Math.max(10, Math.round((currentQ / questions.length) * 100));
      localStorage.setItem(progKey, percent.toString());
    }
  }, [mode, currentQ, topic, questions.length]);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    setAnswers(prev => [...prev, idx]);
    const q = questions[currentQ];
    const isCorrect = idx === q.correct;
    let currentEarned = xpEarned;
    if (isCorrect) {
      const xp = mode === 'time-attack' ? q.xp + Math.max(0, timeLeft) : q.xp;
      setScore(s => s + 1);
      currentEarned += xp;
      setXPEarned(currentEarned);
    }
    setTimeout(() => {
      if (currentQ + 1 >= questions.length) { 
        setMode('results'); 
        setShowXP(true); 
        localStorage.setItem('play_completed_quiz', 'true');
        localStorage.setItem('play_progress_quiz', '100');
        if (topic) {
          localStorage.setItem(`play_completed_quiz_${topic}`, 'true');
          localStorage.setItem(`play_progress_quiz_${topic}`, '100');
        }
        // Update profile XP!
        const currentProfileXP = isGuest ? (guestProfile?.xp ?? 0) : (profile?.xp ?? 0);
        updateProfile({ xp: currentProfileXP + currentEarned });
      }
      else { setCurrentQ(i => i + 1); setSelected(null); setTimeLeft(15); }
    }, 1400);
  };

  const restart = () => {
    setMode('lobby'); setCurrentQ(0); setSelected(null); setScore(0); setXPEarned(0); setTimeLeft(15); setAnswers([]);
  };

  const q = questions[currentQ];
  const pct = score / questions.length * 100;

  if (mode === 'lobby') return (
    <div className="min-h-full bg-game flex flex-col pb-6">
      <div className="bg-surface-2 p-5">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">🎯 Quiz Arena</h1>
        <p className="text-white/60 font-body text-sm mt-1">
          {userZone === 'junior' ? '🚀 Junior AI Quiz — everyday AI adventures!' : '🧠 Innovator AI Quiz — advanced AI concepts!'}
        </p>
      </div>
      <div className="px-4 pt-6 space-y-4">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => { setMode('time-attack'); setTimeLeft(15); }}
          className="border-4 border-pixel-red bg-pixel-red/20 p-6 cursor-pointer shadow-pixel-red"
        >
          <div className="flex items-center gap-4">
            <Timer className="w-12 h-12 text-red-400" />
            <div>
              <div className="text-white font-game text-lg">⚡ Time Attack!</div>
              <div className="text-white/70 font-body text-sm">15 seconds per question. Bonus XP for speed!</div>
              <div className="text-red-400 font-body text-xs mt-1">{questions.length} Questions • Hard Mode</div>
            </div>
          </div>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => setMode('casual')}
          className="border-4 border-success bg-success/20 p-6 cursor-pointer shadow-pixel-green"
        >
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12 text-green-400" />
            <div>
              <div className="text-white font-game text-lg">😊 Casual Mode</div>
              <div className="text-white/70 font-body text-sm">No time pressure. Learn at your own pace.</div>
              <div className="text-green-400 font-body text-xs mt-1">{questions.length} Questions • Easy Mode</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );

  if (mode === 'results') return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 gap-6 bg-game">
      {showXP && <XPToast amount={xpEarned} reason="Quiz complete!" onDone={() => setShowXP(false)} />}
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-center">
        <div className="text-8xl mb-4">{pct === 100 ? '🏆' : pct >= 70 ? '🥈' : pct >= 40 ? '🥉' : '💪'}</div>
        <h2 className="text-white font-game text-xl">
          {pct === 100 ? 'PERFECT SCORE!' : pct >= 70 ? 'Great Job!' : pct >= 40 ? 'Good Try!' : 'Keep Learning!'}
        </h2>
      </motion.div>
      <div className="w-full border-4 border-black bg-surface p-6 shadow-pixel space-y-4">
        <div className="flex justify-between">
          <span className="text-white/60 font-body text-sm">Correct:</span>
          <span className="text-success font-game text-base">{score}/{questions.length}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60 font-body text-sm">Accuracy:</span>
          <span className="text-white font-game text-base">{Math.round(pct)}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/60 font-body text-sm">XP Earned:</span>
          <span className="text-warning font-game text-base">+{xpEarned} XP</span>
        </div>
        {/* Answer review */}
        <div className="border-t-2 border-white/10 pt-3">
          <div className="text-white/50 font-body text-xs mb-2">Answer Review:</div>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => (
              <div key={i} className={`w-8 h-8 border-2 border-black flex items-center justify-center font-pixel text-[9px] ${answers[i] === q.correct ? 'bg-success' : 'bg-pixel-red'}`}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
      <Button variant="primary" onClick={restart} icon={<RotateCcw className="w-4 h-4" />}>Play Again!</Button>
    </div>
  );

  return (
    <div className="min-h-full bg-game flex flex-col">
      {/* Quiz Header */}
      <div className={`p-4 border-b-4 border-black ${mode === 'time-attack' ? 'bg-pixel-red/30' : 'bg-success/20'}`}>
        <div className="flex items-center justify-between">
          <span className="text-white font-body text-sm">{currentQ + 1}/{questions.length}</span>
          <span className="text-white font-game text-sm">{mode === 'time-attack' ? '⚡ Time Attack' : '😊 Casual'}</span>
          <span className="text-warning font-pixel text-[10px]">+{xpEarned} XP</span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 bg-black border border-black">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(currentQ / questions.length) * 100}%` }} />
        </div>
        {/* Timer */}
        {mode === 'time-attack' && (
          <div className="mt-2 flex items-center gap-2">
            <Timer className="w-4 h-4 text-red-400" />
            <div className="flex-1 h-3 bg-black border border-black">
              <motion.div
                className="h-full bg-pixel-red"
                animate={{ width: `${(timeLeft / 15) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <span className={`font-pixel text-[10px] ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>{timeLeft}s</span>
          </div>
        )}
      </div>

      {/* Question */}
      <div className="flex-1 p-5 flex flex-col gap-5">
        <AnimatePresence mode="wait">
          <motion.div key={currentQ} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}>
            <div className="border-4 border-black bg-surface p-5 shadow-pixel">
              <div className="text-4xl text-center mb-4">{q.emoji}</div>
              <p className="text-white font-game text-base text-center leading-relaxed">{q.question}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, i) => {
            let bg = 'bg-surface hover:bg-white/5';
            if (selected !== null) {
              if (i === q.correct) bg = 'bg-success border-success';
              else if (i === selected) bg = 'bg-pixel-red border-pixel-red';
              else bg = 'bg-surface opacity-40';
            }
            return (
              <motion.button
                key={i}
                whileTap={selected === null ? { scale: 0.97 } : {}}
                onClick={() => handleAnswer(i)}
                className={`w-full border-4 border-black ${bg} p-4 text-left font-body text-sm text-white transition-all shadow-pixel active:translate-y-1 active:shadow-none`}
              >
                <span className="font-pixel text-[10px] text-white/50 mr-2">{String.fromCharCode(65 + i)}.</span>
                {opt}
              </motion.button>
            );
          })}
        </div>

        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border-4 border-black p-3 text-center ${selected === q.correct ? 'bg-success/20 border-success' : 'bg-primary/20'}`}
          >
            <span className="text-white font-game text-sm">
              {selected === q.correct ? '✅ Correct! +' + (mode === 'time-attack' ? q.xp + Math.max(0, timeLeft) : q.xp) + ' XP!' : '💡 The answer was: ' + q.options[q.correct]}
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
