import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Star, Sparkles, Check, CheckCircle2, Award, ChevronRight } from 'lucide-react';
import { AICompanion } from '../ui/AICompanion';
import { useThemeStyles } from '@/lib/useThemeStyles';

interface ExploreLabProps {
  onComplete: () => void;
}

type TabType = 'labeling' | 'recommendation' | 'tree' | 'pattern';

export default function ExploreLab({ onComplete }: ExploreLabProps) {
  const ts = useThemeStyles();
  const D = ts.duo;
  const [activeTab, setActiveTab] = useState<TabType>('labeling');
  const [completedSims, setCompletedSims] = useState<string[]>([]);

  // Simulation Completion Helper
  const markSimCompleted = (id: string) => {
    if (!completedSims.includes(id)) {
      const next = [...completedSims, id];
      setCompletedSims(next);
      // Trigger lab complete if at least 2 simulations are finished!
      if (next.length >= 2) {
        setTimeout(() => {
          onComplete();
        }, 2500);
      }
    }
  };

  // 1. Data Labeling Game State
  const labelingItems = [
    { name: 'Apple 🍎', isFruit: true },
    { name: 'Tesla Car 🚗', isFruit: false },
    { name: 'Banana 🍌', isFruit: true },
    { name: 'Book 📚', isFruit: false },
    { name: 'Orange 🍊', isFruit: true },
    { name: 'Computer 💻', isFruit: false },
  ];
  const [sortedLabels, setSortedLabels] = useState<Record<string, 'fruit' | 'object' | null>>({});
  const [labelingScore, setLabelingScore] = useState<number | null>(null);

  const handleLabelSort = (item: string, category: 'fruit' | 'object') => {
    setSortedLabels(prev => ({ ...prev, [item]: category }));
  };

  const checkLabelingAnswers = () => {
    let correct = 0;
    labelingItems.forEach(item => {
      const selected = sortedLabels[item.name];
      if ((item.isFruit && selected === 'fruit') || (!item.isFruit && selected === 'object')) {
        correct++;
      }
    });
    setLabelingScore(correct);
    if (correct === labelingItems.length) {
      markSimCompleted('labeling');
    }
  };

  // 2. Recommendation Engine Sim State
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const movies = [
    { id: 'avengers', name: 'Avengers: Endgame 🦸', genre: 'Action' },
    { id: 'toy-story', name: 'Toy Story 🧸', genre: 'Family' },
    { id: 'inception', name: 'Inception 🌀', genre: 'Sci-Fi' },
    { id: 'frozen', name: 'Frozen ❄️', genre: 'Family' },
  ];
  const [recommendedMovie, setRecommendedMovie] = useState<string | null>(null);

  const handleRateMovie = (movieId: string, rating: number) => {
    setRatings(prev => ({ ...prev, [movieId]: rating }));
  };

  const getAIRecommendation = () => {
    // Basic logic: if Family movies are rated high, recommend "Coco" or "Moana"
    // If Action is rated high, recommend "Spider-Man"
    // If Sci-Fi is rated high, recommend "Interstellar"
    let actionSum = 0;
    let familySum = 0;
    let sciFiSum = 0;

    movies.forEach(m => {
      const r = ratings[m.id] || 0;
      if (m.genre === 'Action') actionSum += r;
      if (m.genre === 'Family') familySum += r;
      if (m.genre === 'Sci-Fi') sciFiSum += r;
    });

    let rec = "Spider-Man: Into the Spider-Verse 🕸️"; // default
    if (familySum > actionSum && familySum > sciFiSum) {
      rec = "Coco: A Musical Adventure 💀🎸";
    } else if (sciFiSum > actionSum && sciFiSum > familySum) {
      rec = "Interstellar Space Voyage 🚀";
    }

    setRecommendedMovie(rec);
    markSimCompleted('recommendation');
  };

  // 3. Decision Tree Builder State
  // Scenario: Should we play football outside?
  // User selects node answers: Sunny -> Yes, Raining -> No
  const [treeAnswers, setTreeAnswers] = useState<Record<string, string>>({});
  const [treeResult, setTreeResult] = useState<string | null>(null);

  const handleTreeAnswer = (node: string, val: string) => {
    setTreeAnswers(prev => ({ ...prev, [node]: val }));
  };

  const runDecisionTree = () => {
    if (!treeAnswers.weather || !treeAnswers.homework) return;
    
    if (treeAnswers.weather === 'rainy') {
      setTreeResult("Stay indoors and play Video Games! 🎮");
    } else if (treeAnswers.homework === 'no') {
      setTreeResult("Finish homework first! 📚");
    } else {
      setTreeResult("Go outside and score goals! ⚽");
    }
    markSimCompleted('tree');
  };

  // 4. Pattern Finder State
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null);
  const correctCluster = 2; // say cluster 2 is correct

  const handleSelectCluster = (id: number) => {
    setSelectedCluster(id);
    if (id === correctCluster) {
      markSimCompleted('pattern');
    }
  };

  return (
    <div className="space-y-4">
      {/* Simulation Selector Tab */}
      <div 
        className="p-3"
        style={D ? {
          background: '#FFFFFF',
          border: '1.5px solid #E0E0E0',
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        } : {
          background: 'linear-gradient(135deg, #1E1B4B 0%, #150E36 100%)',
          border: '3px solid #3B82F6',
          boxShadow: '4px 4px 0px #000',
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-pixel text-[6px] text-blue-400 tracking-wider uppercase">AI SIMULATION LAB</span>
          <span className="font-pixel text-[5px] text-[#FFD60A]">
            SIMS: {completedSims.length}/2 CRACKED
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          <button
            onClick={() => setActiveTab('labeling')}
            className={D ? `py-1.5 font-game text-[10px] flex justify-center items-center gap-1 cursor-pointer transition-all rounded-xl ${
              activeTab === 'labeling' ? 'bg-[#B366FF] text-white shadow-sm' : 'bg-[#F5F5F5] text-[#999999]'
            }` : `py-1.5 font-game text-[10px] border-2 border-black flex justify-center items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'labeling' ? 'bg-[#3B82F6] text-white' : 'bg-black/20 text-white/50'
            }`}
          >
            🏷️ Labeling
          </button>
          <button
            onClick={() => setActiveTab('recommendation')}
            className={D ? `py-1.5 font-game text-[10px] flex justify-center items-center gap-1 cursor-pointer transition-all rounded-xl ${
              activeTab === 'recommendation' ? 'bg-[#B366FF] text-white shadow-sm' : 'bg-[#F5F5F5] text-[#999999]'
            }` : `py-1.5 font-game text-[10px] border-2 border-black flex justify-center items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'recommendation' ? 'bg-[#3B82F6] text-white' : 'bg-black/20 text-white/50'
            }`}
          >
            🍿 Rec Engine
          </button>
          <button
            onClick={() => setActiveTab('tree')}
            className={D ? `py-1.5 font-game text-[10px] flex justify-center items-center gap-1 cursor-pointer transition-all rounded-xl ${
              activeTab === 'tree' ? 'bg-[#B366FF] text-white shadow-sm' : 'bg-[#F5F5F5] text-[#999999]'
            }` : `py-1.5 font-game text-[10px] border-2 border-black flex justify-center items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'tree' ? 'bg-[#3B82F6] text-white' : 'bg-black/20 text-white/50'
            }`}
          >
            🌳 Tree Builder
          </button>
          <button
            onClick={() => setActiveTab('pattern')}
            className={D ? `py-1.5 font-game text-[10px] flex justify-center items-center gap-1 cursor-pointer transition-all rounded-xl ${
              activeTab === 'pattern' ? 'bg-[#B366FF] text-white shadow-sm' : 'bg-[#F5F5F5] text-[#999999]'
            }` : `py-1.5 font-game text-[10px] border-2 border-black flex justify-center items-center gap-1 cursor-pointer transition-all ${
              activeTab === 'pattern' ? 'bg-[#3B82F6] text-white' : 'bg-black/20 text-white/50'
            }`}
          >
            📈 Pattern Finder
          </button>
        </div>
      </div>

      {/* Main Simulation Area */}
      <div 
        className="p-4"
        style={D ? {
          background: '#FFFFFF',
          border: '1.5px solid #E0E0E0',
          borderRadius: 14,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        } : {
          background: '#1E1B4B',
          border: '3px solid #000',
          boxShadow: '4px 4px 0px #000',
        }}
      >
        {/* 1. DATA LABELING GAME */}
        {activeTab === 'labeling' && (
          <div className="space-y-4">
            <h4 className="font-game text-xs text-white uppercase tracking-wider flex items-center gap-1">
              <span>🏷️</span> Classification Labeling Game
            </h4>
            <p className="font-body text-xs text-white/70">
              Drag-and-drop or sort these items into their correct classifications so the AI can train!
            </p>

            <div className="grid grid-cols-2 gap-2 max-h-[180px] overflow-y-auto pr-1">
              {labelingItems.map(item => {
                const selected = sortedLabels[item.name];
                let btnClass = 'bg-black/20 border-white/5';
                if (labelingScore !== null) {
                  const isRight = (item.isFruit && selected === 'fruit') || (!item.isFruit && selected === 'object');
                  btnClass = isRight ? 'bg-[#10B981]/10 border-[#10B981]' : 'bg-[#EF4444]/10 border-[#EF4444] animate-shake';
                } else if (selected) {
                  btnClass = 'bg-purple-600/10 border-purple-500/50';
                }

                return (
                  <div key={item.name} className={`border-2 p-2 flex flex-col justify-between ${btnClass}`}>
                    <span className="font-game text-[10px] text-white text-center mb-2">{item.name}</span>
                    <div className="flex gap-1 font-pixel text-[6px]">
                      <button
                        onClick={() => handleLabelSort(item.name, 'fruit')}
                        className={`flex-1 py-1 border border-black cursor-pointer ${selected === 'fruit' ? 'bg-[#3B82F6] text-white' : 'bg-black/20 text-white/40'}`}
                        disabled={labelingScore !== null}
                      >
                        🍎 Fruit
                      </button>
                      <button
                        onClick={() => handleLabelSort(item.name, 'object')}
                        className={`flex-1 py-1 border border-black cursor-pointer ${selected === 'object' ? 'bg-[#3B82F6] text-white' : 'bg-black/20 text-white/40'}`}
                        disabled={labelingScore !== null}
                      >
                        📦 Object
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {Object.keys(sortedLabels).length === labelingItems.length && labelingScore === null && (
              <button
                onClick={checkLabelingAnswers}
                className="w-full py-2.5 bg-[#3B82F6] text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                Inspect Classification Weights
              </button>
            )}

            {labelingScore !== null && (
              <div className={`p-3 text-center border-2 ${labelingScore === labelingItems.length ? 'border-[#10B981] bg-[#10B981]/10' : 'border-[#EF4444] bg-[#EF4444]/10'}`}>
                <div className="font-game text-xs text-white">Score: {labelingScore}/{labelingItems.length} Correct</div>
                {labelingScore === labelingItems.length ? (
                  <p className="font-body text-[10px] text-white/60 mt-1">✓ Excellent training data! simulation solved.</p>
                ) : (
                  <button 
                    onClick={() => { setSortedLabels({}); setLabelingScore(null); }}
                    className="mt-2 px-3 py-1 font-game text-[8px] bg-red-600 text-white border border-black cursor-pointer"
                  >
                    Recalibrate Labels
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* 2. RECOMMENDATION ENGINE */}
        {activeTab === 'recommendation' && (
          <div className="space-y-4">
            <h4 className="font-game text-xs text-white uppercase tracking-wider flex items-center gap-1">
              <span>🍿</span> Movie Recommendation Engine
            </h4>
            <p className="font-body text-xs text-white/70">
              Rate these film feeds. Watch the AI build your neural recommendation profile!
            </p>

            <div className="space-y-2">
              {movies.map(m => (
                <div key={m.id} className="flex items-center justify-between p-2 bg-black/20 border border-white/5">
                  <span className="font-game text-[10px] text-white">{m.name}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3].map(star => {
                      const active = (ratings[m.id] || 0) >= star;
                      return (
                        <button
                          key={star}
                          onClick={() => handleRateMovie(m.id, star)}
                          className={`text-sm cursor-pointer transition-colors ${active ? 'text-yellow-400' : 'text-white/20'}`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {Object.keys(ratings).length === movies.length && !recommendedMovie && (
              <button
                onClick={getAIRecommendation}
                className="w-full py-2.5 bg-[#3B82F6] text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                Trigger Recommendation Predictor
              </button>
            )}

            {recommendedMovie && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 border-2 border-[#10B981] bg-[#10B981]/10 text-center"
              >
                <span className="font-pixel text-[6px] text-emerald-400 block mb-1">AI RECOMMENDS FOR YOU:</span>
                <h5 className="font-game text-xs text-white uppercase">{recommendedMovie}</h5>
                <p className="font-body text-[10px] text-white/60 mt-1 leading-relaxed">
                  The recommender noticed your preferences and mapped this item with a 98% matching index!
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* 3. DECISION TREE BUILDER */}
        {activeTab === 'tree' && (
          <div className="space-y-4">
            <h4 className="font-game text-xs text-white uppercase tracking-wider flex items-center gap-1">
              <span>🌳</span> Visual Decision Tree Simulator
            </h4>
            <p className="font-body text-xs text-white/70">
              Build a rule-based decision logic tree to determine outdoor activity options.
            </p>

            <div className="space-y-3 p-3 bg-black/25 border border-white/5 relative">
              {/* Node 1 */}
              <div>
                <span className="font-pixel text-[5px] text-[#A78BFA] block mb-1">NODE A: WEATHER STATUS</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleTreeAnswer('weather', 'sunny')} 
                    className={`flex-1 py-1 font-pixel text-[6px] border border-black cursor-pointer ${treeAnswers.weather === 'sunny' ? 'bg-[#3B82F6]' : 'bg-black/20 text-white/40'}`}
                  >
                    🌞 Sunny
                  </button>
                  <button 
                    onClick={() => handleTreeAnswer('weather', 'rainy')} 
                    className={`flex-1 py-1 font-pixel text-[6px] border border-black cursor-pointer ${treeAnswers.weather === 'rainy' ? 'bg-[#3B82F6]' : 'bg-black/20 text-white/40'}`}
                  >
                    🌧️ Rainy
                  </button>
                </div>
              </div>

              {/* Node 2 */}
              {treeAnswers.weather === 'sunny' && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                  <span className="font-pixel text-[5px] text-[#A78BFA] block mb-1">NODE B: HOMEWORK COMPLETED?</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleTreeAnswer('homework', 'yes')} 
                      className={`flex-1 py-1 font-pixel text-[6px] border border-black cursor-pointer ${treeAnswers.homework === 'yes' ? 'bg-[#3B82F6]' : 'bg-black/20 text-white/40'}`}
                    >
                      ✓ Yes
                    </button>
                    <button 
                      onClick={() => handleTreeAnswer('homework', 'no')} 
                      className={`flex-1 py-1 font-pixel text-[6px] border border-black cursor-pointer ${treeAnswers.homework === 'no' ? 'bg-[#3B82F6]' : 'bg-black/20 text-white/40'}`}
                    >
                      x No
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {((treeAnswers.weather === 'rainy') || (treeAnswers.weather === 'sunny' && treeAnswers.homework)) && !treeResult && (
              <button
                onClick={runDecisionTree}
                className="w-full py-2.5 bg-[#3B82F6] text-white font-game text-[10px] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                Traverse Decision Node Tree
              </button>
            )}

            {treeResult && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 border-2 border-[#10B981] bg-[#10B981]/10 text-center"
              >
                <span className="font-pixel text-[6px] text-emerald-400 block mb-0.5">DECISION ALGORITHM OUTPUT:</span>
                <h5 className="font-game text-xs text-white uppercase leading-snug">{treeResult}</h5>
                <button
                  onClick={() => { setTreeAnswers({}); setTreeResult(null); }}
                  className="mt-2.5 px-3 py-1 font-game text-[8px] bg-black/20 border border-white/10 text-white/80 cursor-pointer"
                >
                  Rebuild Tree Rules
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* 4. PATTERN FINDER */}
        {activeTab === 'pattern' && (
          <div className="space-y-4">
            <h4 className="font-game text-xs text-white uppercase tracking-wider flex items-center gap-1">
              <span>📈</span> Cluster Pattern Finder Game
            </h4>
            <p className="font-body text-xs text-white/70">
              An AI grouping algorithm identifies visual patterns. Pick which cluster contains the abnormal data anomaly!
            </p>

            {/* Visual Cluster graph */}
            <div className="h-32 bg-black/45 border-2 border-black relative flex items-center justify-center">
              {/* Cluster 1 dots */}
              <div className="absolute top-4 left-6 flex flex-wrap w-8 h-8 gap-1 opacity-70">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />)}
              </div>
              {/* Cluster 2 (Correct anomaly) dots */}
              <div className="absolute bottom-6 right-8 flex flex-wrap w-8 h-8 gap-1 opacity-70 border border-red-500/20 p-0.5">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 bg-red-400 rounded-full" />)}
                <div className="w-2 h-2 bg-yellow-400 animate-pulse rounded-full" title="Anomaly!" />
              </div>
              {/* Cluster 3 dots */}
              <div className="absolute top-6 right-16 flex flex-wrap w-8 h-8 gap-1 opacity-70">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="w-1.5 h-1.5 bg-green-400 rounded-full" />)}
              </div>
              <span className="font-pixel text-[5px] text-white/10 select-none">AI VECTOR SCATTER MAP</span>
            </div>

            <div className="flex gap-2">
              {[1, 2, 3].map(id => (
                <button
                  key={id}
                  onClick={() => handleSelectCluster(id)}
                  className={`flex-1 py-2 font-game text-[10px] border border-black cursor-pointer transition-all ${
                    selectedCluster === id
                      ? id === correctCluster
                        ? 'bg-[#10B981] text-white'
                        : 'bg-[#EF4444] text-white animate-shake'
                      : 'bg-black/30 text-white/50 hover:bg-black/45'
                  }`}
                >
                  Cluster {id} {id === 2 && selectedCluster === 2 ? '✓' : ''}
                </button>
              ))}
            </div>

            {selectedCluster === correctCluster && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-2.5 text-center bg-[#10B981]/10 border border-[#10B981] text-emerald-300 font-body text-[10px]"
              >
                Anomaly detected! Your pattern identifier resolved the system metrics correctly.
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Completion status notification */}
      {completedSims.length >= 2 && (
        <div 
          className="p-3 text-center border-2 border-[#10B981] bg-[#10B981]/15 shadow-[3px_3px_0px_#000]"
        >
          <p className="font-game text-xs text-white">🎉 Simulation requirements fully satisfied! Ready to submit.</p>
          <button
            onClick={onComplete}
            className="mt-2 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            Submit Lab ➔
          </button>
        </div>
      )}
    </div>
  );
}
