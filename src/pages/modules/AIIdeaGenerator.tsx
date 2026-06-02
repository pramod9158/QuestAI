import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { generateAIIdeas } from '@/lib/gemini';
import { Zap, Lightbulb, ChevronRight, ArrowLeft } from 'lucide-react';

const QUICK_PROBLEMS = [
  'Plants die because people forget to water them',
  'Students forget to do homework',
  'Traffic jams near school every morning',
  'Hospital queues take 4 hours',
  'Farmers don\'t know when crops are sick',
  'Library books go missing',
  'Old people feel lonely at home',
  'Food gets wasted in the canteen',
];

const CATEGORIES = ['school', 'health', 'farming', 'environment', 'transport', 'home', 'animals', 'sports'];

export default function AIIdeaGenerator() {
  const navigate = useNavigate();
  const [problem, setProblem] = useState('');
  const [category, setCategory] = useState('school');
  const [ideas, setIdeas] = useState<{ name: string; description: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    setIdeas([]);
    const result = await generateAIIdeas(problem, category);
    setIdeas(result);
    setLoading(false);
    setShowXP(true);
  };

  const handleSave = (i: number) => {
    const saved = JSON.parse(localStorage.getItem('saved_ideas') || '[]');
    saved.push({ ...ideas[i], problem, category, saved_at: new Date().toISOString() });
    localStorage.setItem('saved_ideas', JSON.stringify(saved));
    setSavedIdeas(prev => new Set([...prev, i]));
  };

  const IDEA_COLORS = [
    { border: 'border-primary', bg: 'bg-primary/20', badge: 'bg-primary', emoji: '💜' },
    { border: 'border-blue-game', bg: 'bg-blue-game/20', badge: 'bg-blue-game', emoji: '💙' },
    { border: 'border-success', bg: 'bg-success/20', badge: 'bg-success', emoji: '💚' },
  ];

  return (
    <div className="min-h-full bg-pixel-darker flex flex-col pb-6">
      {showXP && <XPToast amount={40} reason="3 AI ideas generated!" onDone={() => setShowXP(false)} />}

      {/* Header */}
      <div className="bg-gradient-to-b from-pixel-pink/30 to-pixel-darker p-5">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">⚡ AI Idea Generator</h1>
        <p className="text-white/60 font-body text-sm mt-1">Describe any problem — AI gives you 3 solutions!</p>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Category */}
        <div>
          <label className="text-white/70 font-body text-sm mb-2 block">Category:</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`border-4 border-black px-4 py-2 font-game text-xs uppercase rounded-2xl transition-all cursor-pointer hover:scale-[1.05] hover:-rotate-1 active:scale-95 active:translate-y-0.5 shadow-[0px_4px_0px_0px_#000000] ${
                  category === c 
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-[0px_4px_0px_0px_#000000,inset_0px_3px_0px_0px_rgba(255,255,255,0.4)]' 
                    : 'bg-pixel-dark text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Problem Input */}
        <div>
          <label className="text-white/70 font-body text-sm mb-2 block">Describe a real-world problem:</label>
          <textarea
            value={problem}
            onChange={e => setProblem(e.target.value)}
            placeholder="Type any problem you've noticed in school, home, or your neighbourhood..."
            className="pixel-input h-28 resize-none"
            maxLength={250}
          />
        </div>

        {/* Quick problem chips */}
        <div>
          <p className="text-white/40 font-body text-xs mb-2">💡 Try one of these:</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROBLEMS.map(p => (
              <motion.button
                key={p}
                whileTap={{ scale: 0.96 }}
                onClick={() => setProblem(p)}
                className="border-2 border-black bg-pixel-dark px-4 py-2 text-white/80 font-body text-xs rounded-2xl hover:bg-white/10 hover:text-white transition-all text-left shadow-[0px_3px_0px_0px_rgba(0,0,0,0.85)] cursor-pointer"
              >
                {p}
              </motion.button>
            ))}
          </div>
        </div>

        <Button variant="warning" size="lg" fullWidth loading={loading} onClick={handleGenerate} disabled={problem.length < 5}>
          <Zap className="w-5 h-5" /> Generate 3 AI Ideas! ✨
        </Button>

        {/* Results */}
        <AnimatePresence>
          {ideas.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-warning" />
                <h2 className="text-white font-game text-base">3 AI-Powered Ideas:</h2>
              </div>

              {ideas.map((idea, i) => {
                const colors = IDEA_COLORS[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={`border-4 border-black ${colors.bg} ${colors.border} p-5 rounded-3xl shadow-[0px_6px_0px_0px_rgba(0,0,0,0.85)] hover:scale-[1.01] transition-all`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`${colors.badge} border-2 border-black w-7 h-7 flex items-center justify-center font-pixel text-[9px] text-white rounded-lg shadow-[0px_2px_0px_0px_rgba(0,0,0,1)]`}>
                          {i + 1}
                        </div>
                        <h3 className="text-white font-game text-sm leading-tight">{idea.name}</h3>
                      </div>
                      <Button
                        size="sm"
                        variant={savedIdeas.has(i) ? 'success' : 'ghost'}
                        onClick={() => handleSave(i)}
                        disabled={savedIdeas.has(i)}
                        className="flex-shrink-0"
                      >
                        {savedIdeas.has(i) ? '✅ Saved!' : '💾 Save'}
                      </Button>
                    </div>
                    <p className="text-white/80 font-body text-sm leading-relaxed">{idea.description}</p>
                  </motion.div>
                );
              })}

              <Button variant="ghost" fullWidth onClick={handleGenerate} loading={loading}>
                🔄 Generate 3 More Ideas
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
