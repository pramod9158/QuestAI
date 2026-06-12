import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { QUIZ_QUESTIONS } from '@/data/curriculum';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { Timer, Zap, Trophy, RotateCcw, ArrowLeft, HelpCircle } from 'lucide-react';
import { ActivityHelpModal } from '@/components/ui/ActivityHelpModal';
import { useFeedbackEngine } from '@/contexts/FeedbackEngineContext';
import { useLearningCompanion } from '@/contexts/LearningCompanionContext';

type Mode = 'lobby' | 'time-attack' | 'casual' | 'results';

const QUIZ_HINTS: Record<number, string> = {
  1: "Think about things that are made by humans (artificial) and how we measure smartness (intelligence)!",
  2: "Which of these systems learns what you like to watch to suggest similar videos?",
  3: "Machines learn patterns. What do you need to show them so they recognize something?",
  4: "Think of voice assistants that answer questions when you talk to them!",
  5: "Alexa listens to your voice. What kind of technology translates your speech?",
  6: "AI cameras can look at video frames to search for shapes or colors that match your pet!",
  7: "If a computer program makes a mistake, showing it more correct examples helps it learn!",
  8: "AI can calculate, play games, and drive, but does it have real human feelings?",
  9: "AI can look at history and predict future counts, like how many people will eat lunch!",
  10: "This technology scans facial features to lock or unlock your phone screen!",
  101: "This is a subset of AI where computers look at data to find patterns and learn!",
  102: "AI learns from historical examples. If the examples are biased, the AI becomes biased too!",
  103: "This combines 'deep learning' and 'fake' to describe generated face swaps or speech!",
  104: "It starts with P! You type this to instruct ChatGPT or Midjourney.",
  105: "This is the initial collection of examples that the machine learning algorithm learns from!",
  106: "It stands for Open Artificial Intelligence!",
  107: "This happens when training datasets are unbalanced or represent unfair stereotypes.",
  108: "This is the art of writing clear, optimized instructions to get the best responses from LLMs.",
  109: "This is a type of AI designed to 'generate' new creative things (text, code, images).",
  110: "If historic hiring data favored one group, the AI will learn that pattern and replicate it."
};

export default function QuizArena() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const topic = searchParams.get('topic');

  const { profile, guestProfile, isGuest, updateProfile } = useAuth();
  const currentProfile = useCurrentProfile();
  const userZone = currentProfile?.zone || 'junior';
  const { showSuccessCelebration, showPartialSuccessCelebration, showFailureMotivation } = useFeedbackEngine();
  const { speak } = useLearningCompanion();

  const [mode, setMode] = useState<Mode>('lobby');
  const [secondsOnQuestion, setSecondsOnQuestion] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [xpEarned, setXPEarned] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [showXP, setShowXP] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [helpOpen, setHelpOpen] = useState(false);

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

  // Greet user on quiz start
  useEffect(() => {
    if (mode === 'casual' || mode === 'time-attack') {
      speak("Good luck! Read each question carefully and trust your AI knowledge! 🎯", {
        mood: 'excited',
        pose: 'dance',
        outfit: 'default',
        priority: 'high',
      });
    }
  }, [mode]);

  // Reset stuck timer on question change
  useEffect(() => {
    setSecondsOnQuestion(0);
    setHintShown(false);
  }, [currentQ, mode]);

  // Quiz Coach Stuck Timer checking
  useEffect(() => {
    if (mode !== 'casual' && mode !== 'time-attack') return;
    if (selected !== null || hintShown) return;

    const interval = setInterval(() => {
      setSecondsOnQuestion(prev => {
        const triggerTime = mode === 'time-attack' ? 8 : 15;
        if (prev >= triggerTime - 1) {
          setHintShown(true);
          const activeQ = questions[currentQ];
          const questionHint = activeQ ? (QUIZ_HINTS[activeQ.id] || "Read the options carefully and think about how AI behaves!") : "Think about AI patterns!";
          speak(questionHint, {
            mood: 'encouraging',
            pose: 'wave',
            outfit: 'default',
            priority: 'medium',
          });
          clearInterval(interval);
          return prev + 1;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [mode, currentQ, selected, hintShown, questions, speak]);

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

        // Trigger global feedback overlay
        const finalScore = score + (isCorrect ? 1 : 0);
        const pctScore = (finalScore / questions.length) * 100;
        if (pctScore >= 80) {
          showSuccessCelebration({
            title: pctScore === 100 ? "PERFECT SCORE!" : "GREAT JOB!",
            subtitle: `You scored ${finalScore}/${questions.length} on the quiz!`,
            xpGained: currentEarned,
          });
        } else if (pctScore >= 40) {
          showPartialSuccessCelebration({
            title: "GOOD EFFORT!",
            subtitle: `You scored ${finalScore}/${questions.length} on the quiz. Almost there!`,
            xpGained: currentEarned,
          });
        } else {
          showFailureMotivation({
            title: "KEEP TRYING!",
            subtitle: `You scored ${finalScore}/${questions.length} on the quiz. I believe in you!`,
            xpGained: currentEarned,
          });
        }
      }
      else { setCurrentQ(i => i + 1); setSelected(null); setTimeLeft(15); }
    }, 1400);
  };

  const restart = () => {
    setMode('lobby'); setCurrentQ(0); setSelected(null); setScore(0); setXPEarned(0); setTimeLeft(15); setAnswers([]);
  };

  const handleDevSkip = () => {
    const earned = 100;
    setScore(questions.length);
    setXPEarned(earned);
    setAnswers(questions.map(q => q.correct));
    setMode('results');
    setShowXP(true);
    localStorage.setItem('play_completed_quiz', 'true');
    localStorage.setItem('play_progress_quiz', '100');
    if (topic) {
      localStorage.setItem(`play_completed_quiz_${topic}`, 'true');
      localStorage.setItem(`play_progress_quiz_${topic}`, '100');
    }
    const currentProfileXP = isGuest ? (guestProfile?.xp ?? 0) : (profile?.xp ?? 0);
    updateProfile({ xp: currentProfileXP + earned });

    showSuccessCelebration({
      title: "PERFECT SCORE!",
      subtitle: `You skipped with a mock score of ${questions.length}/${questions.length}!`,
      xpGained: earned,
    });
  };

  const q = questions[currentQ];
  const pct = score / questions.length * 100;

  if (mode === 'lobby') return (
    <div className="min-h-full bg-game flex flex-col pb-6">
      <div className="bg-surface-2 p-5">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">
          🎯 Quiz Arena
          <button
            onClick={() => setHelpOpen(true)}
            className="p-1 hover:text-purple-400 transition-colors cursor-pointer text-white/50"
            title="Show how to play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h1>
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
        <div className="flex justify-center pt-4">
          <button
            onClick={handleDevSkip}
            className="text-white/30 hover:text-white/60 font-pixel text-[6px] tracking-wider uppercase border border-white/10 px-2.5 py-1 cursor-pointer transition-colors"
          >
            ⚡ Dev Skip Quiz
          </button>
        </div>
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
      <div className="flex gap-3 w-full max-w-[280px]">
        <Button variant="ghost" className="flex-1" onClick={restart} icon={<RotateCcw className="w-4 h-4" />}>
          Play Again
        </Button>
        <Button variant="success" className="flex-1" onClick={() => navigate('/play')}>
          Next Module →
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-game flex flex-col">
      {/* Quiz Header */}
      <div className={`p-4 border-b-4 border-black ${mode === 'time-attack' ? 'bg-pixel-red/30' : 'bg-success/20'}`}>
        <div className="flex items-center justify-between">
          <button onClick={() => setHelpOpen(true)} className="p-1 text-white/50 hover:text-white mr-2" title="Show instructions">
            <HelpCircle className="w-4 h-4" />
          </button>
          <span className="text-white font-body text-sm mr-auto">{currentQ + 1}/{questions.length}</span>
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

      <ActivityHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Quiz Arena"
        type="play"
        description="Test your general AI knowledge and vocabulary metrics by answering multiple choice questions!"
        steps={[
          "Select either Time Attack (15 seconds per question + speed bonus XP) or Casual Mode (untimed).",
          "Read each AI scenario/question carefully.",
          "Select the correct option from A, B, C, or D.",
          "Complete all questions in the set to save your score and claim your total XP!"
        ]}
        rewards="⚡ Variable XP based on correct answers and speed bonuses"
      />
    </div>
  );
}
