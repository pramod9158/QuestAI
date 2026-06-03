import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { DETECTIVE_CASES } from '@/data/curriculum';
import { Button } from '@/components/ui/Button';
import { XPToast, SpeakButton } from '@/components/ui/GameUI';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, HelpCircle, ChevronRight, ArrowLeft } from 'lucide-react';

type Answer = 'yes' | 'no' | 'maybe';

const ANSWER_CONFIG = {
  yes: { label: '✅ YES, AI Can Help!', color: 'btn-success', bg: 'bg-success', icon: CheckCircle },
  no: { label: '❌ NO, AI Cannot Help', color: 'btn-danger', bg: 'bg-pixel-red', icon: XCircle },
  maybe: { label: '🤔 MAYBE, Partially', color: 'btn-warning', bg: 'bg-warning', icon: HelpCircle },
};

export default function AIDetective() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');

  const { profile, guestProfile, isGuest, updateProfile } = useAuth();
  const currentProfile = useCurrentProfile();
  const userZone = currentProfile?.zone || 'junior';

  // Filter cases by age zone and category
  let zoneCases = DETECTIVE_CASES.filter(c => c.zone === userZone || c.zone === 'both');
  if (category) {
    const filtered = zoneCases.filter(c => 
      c.scenario.toLowerCase().includes(category.toLowerCase()) || 
      c.explanation.toLowerCase().includes(category.toLowerCase())
    );
    if (filtered.length > 0) {
      zoneCases = filtered;
    }
  }

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Answer | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXPAmount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const progKey = category ? `play_progress_detective_${category}` : 'play_progress_detective';
    const percent = done 
      ? 100 
      : Math.max(10, Math.round((currentIndex / zoneCases.length) * 100));
    localStorage.setItem(progKey, percent.toString());
    if (done) {
      localStorage.setItem('play_completed_detective', 'true');
      localStorage.setItem('play_progress_detective', '100');
      if (category) {
        localStorage.setItem(`play_completed_detective_${category}`, 'true');
        localStorage.setItem(`play_progress_detective_${category}`, '100');
      }
    }
  }, [currentIndex, done, category, zoneCases.length]);

  const caseData = zoneCases[currentIndex];

  const handleAnswer = (answer: Answer) => {
    if (selected) return;
    setSelected(answer);
    const isCorrect = answer === caseData.canAIHelp;
    if (isCorrect) {
      setTotalXP(xp => xp + caseData.xp);
      setXPAmount(caseData.xp);
      setShowXP(true);
      // Award XP to user profile
      const currentProfileXP = isGuest ? (guestProfile?.xp ?? 0) : (profile?.xp ?? 0);
      updateProfile({ xp: currentProfileXP + caseData.xp });
    }
  };

  const handleNext = () => {
    setSelected(null);
    if (currentIndex + 1 >= zoneCases.length) setDone(true);
    else setCurrentIndex(i => i + 1);
  };

  if (done) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6 gap-6 bg-game">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="text-8xl text-center">🕵️</div>
        </motion.div>
        <div className="text-center border-4 border-black bg-surface p-6 shadow-pixel-lg w-full">
          <h2 className="text-white font-game text-xl">Case Files Solved!</h2>
          <p className="text-white/60 font-body text-sm">You completed all {zoneCases.length} cases</p>
          <div className="text-warning font-pixel text-2xl mt-3">+{totalXP} XP</div>
          <p className="text-white/40 font-body text-xs mt-1">Total earned</p>
        </div>
        <Button variant="primary" onClick={() => { setCurrentIndex(0); setDone(false); setSelected(null); setTotalXP(0); }}>
          🔁 Play Again
        </Button>
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
        <h1 className="text-white font-game text-xl flex items-center gap-2">🕵️ AI Detective</h1>
        <p className="text-white/60 font-body text-sm mt-1">
          {userZone === 'junior' ? 'Can AI help in these everyday situations?' : 'Analyse complex real-world AI scenarios!'}
        </p>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex gap-1">
            {zoneCases.map((_, i) => (
              <div key={i} className={`w-2 h-2 border border-black ${i < currentIndex ? 'bg-success' : i === currentIndex ? 'bg-warning animate-pulse' : 'bg-white/20'}`} />
            ))}
          </div>
          <span className="text-white/50 font-body text-xs ml-auto">{currentIndex + 1}/{zoneCases.length}</span>
        </div>
      </div>

      {/* Case Card */}
      <div className="flex-1 flex flex-col px-4 gap-5 pt-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="border-4 border-black bg-surface shadow-pixel-lg"
          >
            {/* Scene visualization */}
            <div className="bg-black/30 p-8 text-center border-b-4 border-black">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-6xl leading-none"
                style={{ letterSpacing: '-4px' }}
              >
                {caseData.imageEmoji}
              </motion.div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-white/50 font-body text-xs mb-1">Case #{currentIndex + 1}</div>
                  <p className="text-white font-body text-sm leading-relaxed">{caseData.scenario}</p>
                </div>
                <SpeakButton text={caseData.scenario} />
              </div>

              <div className="mt-4 bg-warning/10 border-2 border-warning p-3">
                <p className="text-warning font-game text-xs">🔍 Your Detective Question:</p>
                <p className="text-white font-body text-sm mt-1">"Can AI help solve this problem?"</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Answer Buttons */}
        {!selected ? (
          <div className="space-y-3">
            {(Object.keys(ANSWER_CONFIG) as Answer[]).map(answer => (
              <motion.button
                key={answer}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleAnswer(answer)}
                className={`w-full border-4 border-black py-4 font-game text-sm ${
                  answer === 'yes' ? 'bg-success text-white shadow-pixel-green' :
                  answer === 'no' ? 'bg-pixel-red text-white shadow-pixel-red' :
                  'bg-warning text-black shadow-pixel'
                } shadow-pixel hover:opacity-90 active:translate-y-1 active:shadow-none transition-all`}
              >
                {ANSWER_CONFIG[answer].label}
              </motion.button>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-4"
            >
              {/* Verdict */}
              <div className={`border-4 border-black p-5 text-center ${
                selected === caseData.canAIHelp ? 'bg-success/20 border-success' : 'bg-primary/20 border-primary'
              }`}>
                <div className="text-4xl mb-2">
                  {selected === caseData.canAIHelp ? '🎯' : '💡'}
                </div>
                <div className="text-white font-game text-sm">
                  {selected === caseData.canAIHelp ? 'Great Detective Work!' : 'Here\'s the real answer:'}
                </div>
              </div>

              {/* Explanation Card */}
              <div className="border-4 border-black bg-surface p-5 shadow-pixel">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">
                    {caseData.canAIHelp === 'yes' ? '✅' : caseData.canAIHelp === 'no' ? '❌' : '🤔'}
                  </span>
                  <span className="text-white font-game text-sm">
                    {caseData.canAIHelp === 'yes' ? 'YES — AI Can Help!' : caseData.canAIHelp === 'no' ? 'NOT THIS TIME!' : 'MAYBE — Partially!'}
                  </span>
                  <SpeakButton text={caseData.explanation} />
                </div>
                <p className="text-white/80 font-body text-sm leading-relaxed">{caseData.explanation}</p>
                {selected === caseData.canAIHelp && (
                  <div className="mt-3 bg-warning/20 border-2 border-warning px-3 py-2 text-center">
                    <span className="text-warning font-pixel text-[10px]">+{caseData.xp} XP EARNED!</span>
                  </div>
                )}
              </div>

              <Button variant="primary" fullWidth onClick={handleNext}>
                {currentIndex + 1 >= zoneCases.length ? '🏆 See Results!' : 'Next Case →'}
              </Button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
