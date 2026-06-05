import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { generateAIIdeas } from '@/lib/gemini';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { Zap, Lightbulb, ChevronRight, ArrowLeft } from 'lucide-react';

const JUNIOR_QUICK_PROBLEMS = [
  'My dog always runs away and gets lost',
  'I forget to water my plants and they die',
  'The school canteen runs out of my favourite food',
  'My school bag is very heavy to carry every day',
  'I always forget which homework is due tomorrow',
  'The playground gets muddy when it rains',
  'My pet cat keeps scratching the furniture',
  'The library books always go missing',
];

const INNOVATOR_QUICK_PROBLEMS = [
  'Plants die because people forget to water them',
  'Students forget to do homework',
  'Traffic jams near school every morning',
  'Hospital queues take 4 hours',
  "Farmers don't know when crops are sick",
  'Library books go missing',
  'Old people feel lonely at home',
  'Food gets wasted in the canteen',
];

const JUNIOR_CATEGORIES = ['home', 'animals', 'school', 'garden', 'food'];
const INNOVATOR_CATEGORIES = ['school', 'health', 'farming', 'environment', 'transport', 'home', 'animals', 'sports'];

export default function AIIdeaGenerator() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const mode = searchParams.get('mode');

  const currentProfile = useCurrentProfile();
  const userZone = currentProfile?.zone || 'junior';

  const QUICK_PROBLEMS = userZone === 'junior' ? JUNIOR_QUICK_PROBLEMS : INNOVATOR_QUICK_PROBLEMS;
  const CATEGORIES = userZone === 'junior' ? JUNIOR_CATEGORIES : INNOVATOR_CATEGORIES;

  const [problem, setProblem] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [ideas, setIdeas] = useState<{ name: string; description: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<Set<number>>(new Set());

  useEffect(() => {
    const progKey = mode ? `play_progress_idea-generator_${mode}` : 'play_progress_idea-generator';
    const percent = ideas.length > 0
      ? 100
      : problem.trim().length > 0
      ? 50
      : 0;
    localStorage.setItem(progKey, percent.toString());
    
    if (ideas.length > 0) {
      if (mode) {
        localStorage.setItem(`play_completed_idea-generator_${mode}`, 'true');
      } else {
        localStorage.setItem('play_completed_idea-generator', 'true');
      }
    }
  }, [problem, ideas, mode]);

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
    <div className="min-h-full bg-game flex flex-col pb-6">
      {showXP && <XPToast amount={40} reason="3 AI ideas generated!" onDone={() => setShowXP(false)} />}

      {/* Header */}
      <div className="bg-surface-2 p-5">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">⚡ AI Idea Generator</h1>
        <p className="text-white/60 font-body text-sm mt-1">
          {userZone === 'junior' ? 'Describe a problem — AI gives you 3 fun solutions!' : 'Describe any problem — AI gives you 3 solutions!'}
        </p>
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
                className={`border-2 border-black px-3 py-1.5 font-body text-xs capitalize transition-all ${category === c ? 'bg-primary text-white' : 'bg-white/10 text-white/60 hover:text-white'}`}
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
                whileTap={{ scale: 0.95 }}
                onClick={() => setProblem(p)}
                className="border-2 border-white/20 bg-white/5 px-3 py-1.5 text-white/60 font-body text-xs hover:bg-white/15 hover:text-white transition-all text-left"
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
                    className={`border-4 border-black ${colors.bg} ${colors.border} p-5 shadow-pixel`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`${colors.badge} border-2 border-black w-7 h-7 flex items-center justify-center font-pixel text-[10px] text-white`}>
                          {i + 1}
                        </div>
                        <h3 className="text-white font-game text-sm leading-tight">{idea.name}</h3>
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSave(i)}
                        disabled={savedIdeas.has(i)}
                        className={`border-2 border-black px-3 py-1 font-body text-xs flex-shrink-0 ${savedIdeas.has(i) ? 'bg-success text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                      >
                        {savedIdeas.has(i) ? '✅ Saved!' : '💾 Save'}
                      </motion.button>
                    </div>
                    <p className="text-white/80 font-body text-sm leading-relaxed">{idea.description}</p>
                  </motion.div>
                );
              })}

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={handleGenerate} loading={loading}>
                  🔄 More Ideas
                </Button>
                <Button variant="success" className="flex-1" onClick={() => navigate('/play')}>
                  Next Module →
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
