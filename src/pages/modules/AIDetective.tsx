import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { DETECTIVE_CASES } from '@/data/curriculum';
import { Button } from '@/components/ui/Button';
import { XPToast, SpeakButton } from '@/components/ui/GameUI';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, XCircle, HelpCircle, ChevronRight, ArrowLeft } from 'lucide-react';

type Answer = 'yes' | 'no' | 'maybe';

const ANSWER_CONFIG = {
  yes: { label: '✅ YES, AI Can Help!', color: 'btn-success', bg: 'bg-success', icon: CheckCircle },
  no: { label: '❌ NO, AI Cannot Help', color: 'btn-danger', bg: 'bg-pixel-red', icon: XCircle },
  maybe: { label: '🤔 MAYBE, Partially', color: 'btn-warning', bg: 'bg-warning', icon: HelpCircle },
};

export default function AIDetective() {
  const navigate = useNavigate();
  const { profile, guestProfile, isGuest, updateProfile } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<Answer | null>(null);
  const [totalXP, setTotalXP] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXPAmount] = useState(0);
  const [done, setDone] = useState(false);

  const caseData = DETECTIVE_CASES[currentIndex];

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
    if (currentIndex + 1 >= DETECTIVE_CASES.length) setDone(true);
    else setCurrentIndex(i => i + 1);
  };

  if (done) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6 gap-6 bg-pixel-darker">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
          <div className="text-8xl text-center">🕵️</div>
        </motion.div>
        <div className="text-center border-4 border-black p-6 rounded-3xl shadow-[0px_6px_0px_0px_#000000] w-full"
          style={{
            backgroundImage: 'linear-gradient(180deg, #1B3D34 0%, #1E1B4B 100%)'
          }}
        >
          <h2 className="text-white font-game text-xl">Case Files Solved!</h2>
          <p className="text-white/60 font-body text-sm mt-2">You completed all {DETECTIVE_CASES.length} cases</p>
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
    <div className="min-h-full bg-pixel-darker flex flex-col">
      {showXP && <XPToast amount={xpAmount} onDone={() => setShowXP(false)} />}

      {/* Header */}
      <div className="bg-gradient-to-b from-[#0C2417] to-pixel-darker p-5">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">🕵️ AI Detective</h1>
        <p className="text-white/60 font-body text-sm mt-1">Can AI help in this real situation?</p>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex gap-1.5">
            {DETECTIVE_CASES.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 border border-black rounded-full ${i < currentIndex ? 'bg-success' : i === currentIndex ? 'bg-warning animate-pulse' : 'bg-white/20'}`} />
            ))}
          </div>
          <span className="text-white/50 font-body text-xs ml-auto">{currentIndex + 1}/{DETECTIVE_CASES.length}</span>
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
            className="border-4 border-black rounded-3xl shadow-[0px_6px_0px_0px_#000000] overflow-hidden"
            style={{
              backgroundImage: 'linear-gradient(180deg, #1B3D34 0%, #1E1B4B 100%)'
            }}
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

              <div className="mt-4 bg-[#281D0A] border-2 border-warning p-3 rounded-2xl">
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
              <Button
                key={answer}
                variant={answer === 'yes' ? 'success' : answer === 'no' ? 'danger' : 'warning'}
                onClick={() => handleAnswer(answer)}
                fullWidth
                size="lg"
              >
                {ANSWER_CONFIG[answer].label}
              </Button>
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
              <div className={`border-4 border-black p-5 text-center rounded-3xl shadow-[0px_4px_0px_0px_rgba(0,0,0,0.85)] ${
                selected === caseData.canAIHelp ? 'bg-[#122A1C] border-success' : 'bg-[#241740] border-primary'
              }`}>
                <div className="text-4xl mb-2">
                  {selected === caseData.canAIHelp ? '🎯' : '💡'}
                </div>
                <div className="text-white font-game text-sm">
                  {selected === caseData.canAIHelp ? 'Great Detective Work!' : 'Here\'s the real answer:'}
                </div>
              </div>

              {/* Explanation Card */}
              <div className="border-4 border-black p-5 rounded-3xl shadow-[0px_6px_0px_0px_#000000]"
                style={{
                  backgroundImage: 'linear-gradient(180deg, #1B3D34 0%, #1E1B4B 100%)'
                }}
              >
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
                  <div className="mt-3 bg-[#281D0A] border-2 border-warning px-3 py-2 text-center rounded-xl">
                    <span className="text-warning font-pixel text-[10px]">+{caseData.xp} XP EARNED!</span>
                  </div>
                )}
              </div>

              <Button variant="primary" fullWidth onClick={handleNext}>
                {currentIndex + 1 >= DETECTIVE_CASES.length ? '🏆 See Results!' : 'Next Case →'}
              </Button>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
