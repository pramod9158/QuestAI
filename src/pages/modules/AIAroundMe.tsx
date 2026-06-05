import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { SpeakButton } from '@/components/ui/GameUI';
import { Zap, ArrowLeft } from 'lucide-react';

const SWIPE_CARDS = [
  { id: 1, emoji: '📱', title: 'Your Phone\'s Face Unlock', question: 'Is this AI?', answer: true, explanation: 'YES! Your phone uses AI-powered facial recognition — scanning 30,000 invisible dots on your face every time!', xp: 15 },
  { id: 2, emoji: '🔦', title: 'A Regular Torch', question: 'Is this AI?', answer: false, explanation: 'NO! A torch just converts electrical energy to light. No learning, no AI — just physics!', xp: 10 },
  { id: 3, emoji: '📺', title: 'Netflix Recommendations', question: 'Is this AI?', answer: true, explanation: 'YES! Netflix AI studies millions of viewer habits to guess exactly what you\'ll want to watch next!', xp: 15 },
  { id: 4, emoji: '⌚', title: 'A Classic Wall Clock', question: 'Is this AI?', answer: false, explanation: 'NO! A clock just measures time using gears or circuits. It cannot learn or make decisions!', xp: 10 },
  { id: 5, emoji: '🌡️', title: 'Smart Thermostat', question: 'Is this AI?', answer: true, explanation: 'YES! Smart thermostats learn your schedule and automatically adjust temperature before you need it!', xp: 15 },
  { id: 6, emoji: '🪑', title: 'A Wooden Chair', question: 'Is this AI?', answer: false, explanation: 'NO! A chair is just furniture. No sensors, no learning, no AI — just wood and nails!', xp: 10 },
  { id: 7, emoji: '🗺️', title: 'Google Maps Traffic Prediction', question: 'Is this AI?', answer: true, explanation: 'YES! Google Maps AI processes data from millions of phones to predict traffic jams before they form!', xp: 20 },
  { id: 8, emoji: '📷', title: 'Auto Photo Tagging (Facebook)', question: 'Is this AI?', answer: true, explanation: 'YES! AI scans millions of facial features to recognize your friends in photos automatically!', xp: 15 },
];

export default function AIAroundMe() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const type = searchParams.get('type');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXPAmount] = useState(0);
  const [done, setDone] = useState(false);

  React.useEffect(() => {
    const progKey = type ? `play_progress_around-me_${type}` : 'play_progress_around-me';
    const percent = done
      ? 100
      : Math.max(10, Math.round((currentIndex / SWIPE_CARDS.length) * 100));
    localStorage.setItem(progKey, percent.toString());
    if (done) {
      localStorage.setItem('play_completed_around-me', 'true');
      localStorage.setItem('play_progress_around-me', '100');
      if (type) {
        localStorage.setItem(`play_completed_around-me_${type}`, 'true');
        localStorage.setItem(`play_progress_around-me_${type}`, '100');
      }
    }
  }, [currentIndex, done, type, SWIPE_CARDS.length]);

  const card = SWIPE_CARDS[currentIndex];

  const handleAnswer = (isAI: boolean) => {
    if (answered !== null) return;
    setAnswered(isAI);
    const isCorrect = isAI === card.answer;
    if (isCorrect) {
      setScore(s => s + 1);
      setTotalXP(xp => xp + card.xp);
      setXPAmount(card.xp);
      setShowXP(true);
    }
  };

  const handleNext = () => {
    setAnswered(null);
    if (currentIndex + 1 >= SWIPE_CARDS.length) setDone(true);
    else setCurrentIndex(i => i + 1);
  };

  if (done) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6 gap-6 bg-game">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }} className="text-8xl">
          {score >= 6 ? '🏆' : score >= 4 ? '🥈' : '🥉'}
        </motion.div>
        <div className="text-center">
          <h2 className="text-white font-game text-xl">Mission Complete!</h2>
          <p className="text-white/70 font-body text-sm mt-2">{score}/{SWIPE_CARDS.length} correct answers</p>
          <p className="text-warning font-game text-lg mt-2">+{totalXP} XP earned!</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="ghost" className="flex-1" onClick={() => { setCurrentIndex(0); setDone(false); setScore(0); setTotalXP(0); setAnswered(null); }}>
            Play Again 🔄
          </Button>
          <Button variant="success" className="flex-1" onClick={() => navigate('/play')}>
            Next Module →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-game flex flex-col">
      {showXP && <XPToast amount={xpAmount} onDone={() => setShowXP(false)} />}

      {/* Header */}
      <div className="bg-surface-2 p-5">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">🌍 AI Around Me</h1>
        <p className="text-white/60 font-body text-sm mt-1">Swipe cards — Is this AI or not?</p>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex gap-1">
            {SWIPE_CARDS.map((_, i) => (
              <div key={i} className={`w-2 h-2 border border-black ${i < currentIndex ? 'bg-success' : i === currentIndex ? 'bg-warning' : 'bg-white/20'}`} />
            ))}
          </div>
          <span className="text-white/50 font-body text-xs">{currentIndex + 1}/{SWIPE_CARDS.length}</span>
          <div className="ml-auto flex items-center gap-1">
            <Zap className="w-4 h-4 text-warning" />
            <span className="text-warning font-pixel text-[10px]">{totalXP} XP</span>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ x: 200, opacity: 0, rotate: 5 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={{ x: -200, opacity: 0, rotate: -5 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="w-full border-4 border-black bg-surface shadow-pixel-lg"
          >
            {/* Card front */}
            <div className="p-8 text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-7xl mb-4"
              >
                {card.emoji}
              </motion.div>
              <h2 className="text-white font-game text-lg leading-relaxed">{card.title}</h2>
              <p className="text-white/60 font-body text-sm mt-2">{card.question}</p>
              <SpeakButton text={`${card.title}. ${card.question}`} />
            </div>

            {/* Answer reveal */}
            <AnimatePresence>
              {answered !== null && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  className={`border-t-4 border-black p-4 ${card.answer === answered ? 'bg-success/20' : 'bg-pixel-red/20'}`}
                >
                  <div className="text-center mb-2">
                    <span className="text-3xl">{card.answer === answered ? '✅' : '❌'}</span>
                    <span className="text-white font-game text-sm ml-2">{card.answer === answered ? 'Correct!' : 'Not quite!'}</span>
                  </div>
                  <p className="text-white/80 font-body text-sm text-center">{card.explanation}</p>
                  {card.answer === answered && (
                    <p className="text-warning text-center font-pixel text-[10px] mt-2">+{card.xp} XP!</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Answer Buttons */}
        {answered === null ? (
          <div className="w-full flex gap-4">
            <Button variant="success" size="lg" fullWidth onClick={() => handleAnswer(true)}>
              🤖 YES, AI!
            </Button>
            <Button variant="ghost" size="lg" fullWidth onClick={() => handleAnswer(false)}>
              📦 NOT AI
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="lg" fullWidth onClick={handleNext}>
            {currentIndex + 1 >= SWIPE_CARDS.length ? 'See Results! 🏆' : 'Next Card →'}
          </Button>
        )}
      </div>
    </div>
  );
}
