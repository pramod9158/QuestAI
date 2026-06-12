import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { generateBrainstormIdea } from '@/lib/ai';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Lightbulb, ChevronRight, Save, Loader2, ArrowLeft, HelpCircle } from 'lucide-react';
import { ActivityHelpModal } from '@/components/ui/ActivityHelpModal';
import { useFeedbackEngine } from '@/contexts/FeedbackEngineContext';

const CATEGORIES = [
  { id: 'school', label: 'School', emoji: '🏫', color: 'bg-blue-game' },
  { id: 'sports', label: 'Sports', emoji: '⚽', color: 'bg-success' },
  { id: 'animals', label: 'Animals', emoji: '🐾', color: 'bg-warning' },
  { id: 'environment', label: 'Environment', emoji: '🌿', color: 'bg-green-600' },
  { id: 'farming', label: 'Farming', emoji: '🌾', color: 'bg-yellow-600' },
  { id: 'transport', label: 'Transport', emoji: '🚌', color: 'bg-orange-600' },
  { id: 'health', label: 'Health', emoji: '❤️', color: 'bg-red-600' },
  { id: 'home', label: 'Home', emoji: '🏠', color: 'bg-purple-600' },
];

const AUDIENCE_OPTIONS = ['Students', 'Farmers', 'Teachers', 'Doctors', 'Everyone', 'Children', 'Elderly People', 'Shopkeepers'];

export default function BrainstormPlayground() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode');

  const { user } = useAuth();
  const { showSuccessCelebration, showModuleCompletionCelebration } = useFeedbackEngine();
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState('');
  const [problem, setProblem] = useState('');
  const [audience, setAudience] = useState('');
  const [result, setResult] = useState<{ name: string; description: string; innovation_score: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const progKey = mode ? `play_progress_brainstorm_${mode}` : 'play_progress_brainstorm';
    const percent = step === 3
      ? 100
      : Math.max(10, Math.round((step / 3) * 100));
    localStorage.setItem(progKey, percent.toString());
    
    if (step === 3) {
      if (mode) {
        localStorage.setItem(`play_completed_brainstorm_${mode}`, 'true');
      } else {
        localStorage.setItem('play_completed_brainstorm', 'true');
      }
    }
  }, [step, mode]);

  const handleGenerate = async () => {
    setLoading(true);
    const idea = await generateBrainstormIdea(category, problem, audience);
    setResult(idea);
    setLoading(false);
    setStep(3);
    
    showModuleCompletionCelebration({
      title: "INVENTION CREATED!",
      subtitle: `Your AI solution "${idea.name}" is generated!`,
      xpGained: 60,
    });
  };

  const handleSave = async () => {
    if (!result) return;
    if (user) {
      await supabase.from('user_inventions').insert({
        user_id: user.id,
        category,
        problem,
        target_audience: audience,
        ai_solution_name: result.name,
        ai_solution_description: result.description,
        innovation_score: result.innovation_score,
      });
    } else {
      const inventions = JSON.parse(localStorage.getItem('guest_inventions') || '[]');
      inventions.push({ category, problem, audience, ...result, created_at: new Date().toISOString() });
      localStorage.setItem('guest_inventions', JSON.stringify(inventions));
    }
    setSaved(true);
    showSuccessCelebration({
      title: "SAVED TO HALL!",
      subtitle: "Your invention is published to the Inventor Hall!",
    });
  };

  const handleDevSkip = () => {
    setCategory('school');
    setProblem('Always arriving late');
    setAudience('Students');
    const mockResult = {
      name: "Smart Schedule Bot",
      description: "Dev Skip used! Bypassed brainstorm steps with perfect diagnostic blueprints.",
      innovation_score: 95
    };
    setResult(mockResult);
    setStep(3);
    
    showModuleCompletionCelebration({
      title: "INVENTION CREATED!",
      subtitle: `Your AI solution "${mockResult.name}" is generated!`,
      xpGained: 60,
    });
  };

  return (
    <div className="min-h-full bg-game flex flex-col pb-6">
      {showXP && <XPToast amount={60} reason="Brainstorm complete!" onDone={() => setShowXP(false)} />}

      {/* Header */}
      <div className="bg-surface-2 p-5">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">
          💡 Brainstorm Lab
          <button
            onClick={() => setHelpOpen(true)}
            className="p-1 hover:text-purple-400 transition-colors cursor-pointer text-white/50"
            title="Show how to brainstorm"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h1>
        <p className="text-white/60 font-body text-sm mt-1">Turn your ideas into AI-powered inventions!</p>
        {/* Steps indicator */}
        <div className="flex gap-2 mt-4">
          {['Category', 'Problem', 'Who', 'Idea!'].map((s, i) => (
            <div key={s} className={`flex-1 text-center py-1.5 border-2 border-black font-body text-[10px] transition-all ${
              i <= step ? 'bg-warning text-black' : 'bg-white/10 text-white/40'
            }`}>
              {i + 1}. {s}
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-3">
          <div className="text-white/40 font-pixel text-[5px]">STAGE PROGRESSION</div>
          {step < 3 && (
            <button
              onClick={handleDevSkip}
              className="text-white/30 hover:text-white/60 font-pixel text-[6px] tracking-wider uppercase border border-white/10 px-2 py-0.5 cursor-pointer transition-colors"
            >
              ⚡ Dev Skip Brainstorm
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pt-4">
        <AnimatePresence mode="wait">
          {/* Step 0: Category */}
          {step === 0 && (
            <motion.div key="cat" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }}>
              <h2 className="text-white font-game text-base mb-4">Step 1: Pick a Category 🗂️</h2>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setCategory(cat.id); setStep(1); }}
                    className={`border-4 border-black ${cat.color} p-5 flex flex-col items-center gap-2 shadow-pixel hover:opacity-90 active:translate-y-1 transition-all`}
                  >
                    <span className="text-4xl">{cat.emoji}</span>
                    <span className="text-white font-game text-sm">{cat.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 1: Problem */}
          {step === 1 && (
            <motion.div key="prob" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} className="space-y-5">
              <h2 className="text-white font-game text-base">Step 2: What's the Problem? 🔍</h2>
              <div className="border-4 border-black bg-surface p-4 flex items-center gap-3">
                <span className="text-3xl">{CATEGORIES.find(c => c.id === category)?.emoji}</span>
                <span className="text-white font-game text-sm capitalize">{category}</span>
              </div>
              <div>
                <label className="text-white/70 font-body text-sm mb-2 block">Describe the problem you see:</label>
                <textarea
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  placeholder="e.g. School buses are always late and parents don't know where the bus is..."
                  className="pixel-input h-32 resize-none"
                  maxLength={200}
                />
                <div className="text-right text-white/30 font-body text-xs mt-1">{problem.length}/200</div>
              </div>

              {/* Quick prompt chips */}
              <div>
                <p className="text-white/50 font-body text-xs mb-2">Or tap a quick example:</p>
                <div className="flex flex-wrap gap-2">
                  {['Always arriving late', 'Too much waste', 'Hard to find information', 'Takes too long', 'No one knows about it'].map(chip => (
                    <button key={chip} onClick={() => setProblem(chip)}
                      className="border-2 border-white/20 bg-white/10 px-3 py-1.5 text-white/70 font-body text-xs hover:bg-white/20">
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(0)}>← Back</Button>
                <Button variant="primary" fullWidth disabled={problem.length < 5} onClick={() => setStep(2)}>
                  Next: Who Faces It? <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Audience */}
          {step === 2 && (
            <motion.div key="aud" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -100, opacity: 0 }} className="space-y-5">
              <h2 className="text-white font-game text-base">Step 3: Who Faces This Problem? 👥</h2>
              <div className="grid grid-cols-2 gap-3">
                {AUDIENCE_OPTIONS.map(aud => (
                  <motion.button
                    key={aud}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAudience(aud)}
                    className={`border-4 border-black p-4 font-game text-sm transition-all shadow-pixel ${
                      audience === aud ? 'bg-primary text-white border-primary-dark' : 'bg-surface text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {aud}
                  </motion.button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                <Button variant="warning" fullWidth disabled={!audience} loading={loading} onClick={handleGenerate}>
                  <Lightbulb className="w-4 h-4" /> Generate AI Idea! ✨
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: AI Result */}
          {step === 3 && result && (
            <motion.div key="result" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-5">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="text-6xl mb-3"
                >
                  💡
                </motion.div>
                <h2 className="text-white font-game text-base">Your AI Invention Idea!</h2>
              </div>

              <motion.div
                initial={{ y: 30 }} animate={{ y: 0 }}
                className="border-4 border-warning bg-warning/10 p-6 shadow-pixel space-y-4"
              >
                <div className="border-b-2 border-warning/30 pb-3">
                  <div className="text-warning font-body text-xs">🤖 AI Solution Name:</div>
                  <div className="text-white font-game text-xl mt-1">{result.name}</div>
                </div>
                <div className="border-b-2 border-warning/30 pb-3">
                  <div className="text-warning font-body text-xs">💡 How It Works:</div>
                  <div className="text-white/80 font-body text-sm mt-1 leading-relaxed">{result.description}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-warning font-body text-xs">📊 Innovation Score:</div>
                    <div className="flex gap-1 mt-1">
                      {[...Array(10)].map((_, i) => (
                        <div key={i} className={`h-3 flex-1 border border-black ${i < Math.round(result.innovation_score / 10) ? 'bg-warning' : 'bg-white/20'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="text-warning font-pixel text-lg">{result.innovation_score}</div>
                </div>
                <div className="flex gap-2 text-xs font-body text-white/50">
                  <span>📁 {category}</span>
                  <span>•</span>
                  <span>👥 {audience}</span>
                </div>
              </motion.div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => { setStep(2); setResult(null); setSaved(false); }}>🔄 Try Again</Button>
                {saved ? (
                  <Button variant="success" className="flex-1" onClick={() => navigate('/play')}>
                    Next Module →
                  </Button>
                ) : (
                  <Button variant="success" className="flex-1" onClick={handleSave}>
                    <Save className="w-4 h-4" /> Save Invention
                  </Button>
                )}
              </div>
              {saved && (
                <p className="text-success font-body text-xs text-center">
                  🏛️ Saved to your Inventor Hall profile!
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ActivityHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Brainstorm Lab"
        type="play"
        description="Turn your ideas into AI-powered inventions! Pick a topic category, detail a real-world problem, select your target audience, and let AI outline a solution."
        steps={[
          "Select a domain category (e.g. School, Health, Environment).",
          "Enter a clear description of a real problem you observed, or tap a quick prompt chip example.",
          "Identify the target audience who faces this issue.",
          "Click 'Generate AI Idea!' to view a custom solution description and innovation score.",
          "Save the invention to display it in your Inventor Hall portfolio!"
        ]}
        rewards="⚡ +60 XP upon completed generation & save"
      />
    </div>
  );
}
