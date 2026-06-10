import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testPromptPlayground, evaluatePromptLab } from '@/lib/ai';
import { HelpCircle, Star, Sparkles, RefreshCw, Send, CheckCircle2, BookOpen } from 'lucide-react';
import { AICompanion } from '../ui/AICompanion';

interface PromptLabProps {
  onComplete: () => void;
}

interface PromptAttempt {
  id: string;
  role: string;
  prompt: string;
  response: string;
  score: number;
  feedback: string;
  tip: string;
}

const TEMPLATES = [
  { name: '🧙 Wizard Tutor', system: 'You are a wise fantasy wizard tutor. Explain everything using magical metaphors and spells!' },
  { name: '🏴‍☠️ Pirate Captain', system: 'You are a gritty pirate captain. Speak in salty pirate slang, and address the student as matey!' },
  { name: '🚀 Space Commander', system: 'You are a sci-fi space commander. Use space agency terminology, talking about rockets, launchpads, and cosmic orbits.' },
  { name: '🦖 Dino Guide', system: 'You are a talking T-Rex dinosaur explorer. Roar occasionally and relate science concepts to prehistoric times!' },
];

const CHALLENGES = [
  {
    id: 'challenge-1',
    title: 'Mission 1: The Magic Spellbook',
    instruction: 'Select the Wizard Tutor. Write a prompt asking it how stars are formed, and get it to sound extremely magical!',
    requiredKeywords: ['magic', 'star', 'spell'],
    minScore: 70,
  },
  {
    id: 'challenge-2',
    title: 'Mission 2: Space Logistics Briefing',
    instruction: 'Choose the Space Commander. Ask it to explain gravity in a short, military-style briefing (max 2 sentences) containing the word "orbit".',
    requiredKeywords: ['gravity', 'orbit'],
    minScore: 75,
  },
  {
    id: 'challenge-3',
    title: 'Mission 3: Dino Discovery',
    instruction: 'Use the Dino Guide to describe a black hole, making sure the explanation mentions prehistoric plants or fossils!',
    requiredKeywords: ['hole', 'dino', 'prehistoric'],
    minScore: 80,
  },
];

export default function PromptLab({ onComplete }: PromptLabProps) {
  const [activeChallengeIdx, setActiveChallengeIdx] = useState(0);
  const [selectedTemplateIdx, setSelectedTemplateIdx] = useState(0);
  const [temperature, setTemperature] = useState(0.7);
  const [promptInput, setPromptInput] = useState('');
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState<PromptAttempt[]>([]);
  const [currentRating, setCurrentRating] = useState<{ score: number; feedback: string; tip: string } | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);

  const activeChallenge = CHALLENGES[activeChallengeIdx];
  const activeTemplate = TEMPLATES[selectedTemplateIdx];

  const handleSendPrompt = async () => {
    if (!promptInput.trim() || loading) return;
    setLoading(true);
    setAiOutput(null);
    setCurrentRating(null);

    try {
      // 1. Fetch AI Text response
      const response = await testPromptPlayground(activeTemplate.system, promptInput, temperature);
      setAiOutput(response);

      // 2. Evaluate prompt using our custom Gemini reviewer
      const evaluation = await evaluatePromptLab(activeTemplate.system, promptInput);
      setCurrentRating(evaluation);

      // Check keywords
      const lowerPrompt = promptInput.toLowerCase();
      const hasKeywords = activeChallenge.requiredKeywords.every(kw => lowerPrompt.includes(kw));
      
      let finalScore = evaluation.score;
      let feedback = evaluation.feedback;
      if (!hasKeywords) {
        finalScore = Math.max(40, finalScore - 25);
        feedback = `Great styling, but you forgot to include some required terms: ${activeChallenge.requiredKeywords.join(', ')}!`;
      }

      const newAttempt: PromptAttempt = {
        id: Math.random().toString(),
        role: activeTemplate.name,
        prompt: promptInput,
        response,
        score: finalScore,
        feedback,
        tip: evaluation.tip,
      };

      setAttempts(prev => [newAttempt, ...prev].slice(0, 3)); // Keep last 3 for comparison

      // If they passed the score threshold, mark the current challenge as solved!
      if (finalScore >= activeChallenge.minScore) {
        if (!completedChallenges.includes(activeChallenge.id)) {
          const newCompleted = [...completedChallenges, activeChallenge.id];
          setCompletedChallenges(newCompleted);

          // If all 3 challenges are done, trigger lab completion!
          if (newCompleted.length === CHALLENGES.length) {
            setTimeout(() => {
              onComplete();
            }, 3000);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setAiOutput('Sparky telemetry offline. Using fallback compiler.');
    } finally {
      setLoading(false);
    }
  };

  const selectChallenge = (idx: number) => {
    setActiveChallengeIdx(idx);
    setPromptInput('');
    setAiOutput(null);
    setCurrentRating(null);
  };

  return (
    <div className="space-y-4">
      {/* Challenge Description Board */}
      <div 
        className="p-4"
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #150E36 100%)',
          border: '3px solid #7C3AED',
          boxShadow: '4px 4px 0px #000',
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-pixel text-[6px] text-[#A78BFA] tracking-wider uppercase">PROMPT LAB SIMULATION</span>
          <span className="font-game text-[10px] text-[#FFD60A]">
            CHALLENGES: {completedChallenges.length}/{CHALLENGES.length} SOLVED
          </span>
        </div>

        {/* Tab selection */}
        <div className="flex gap-1.5 mb-3.5">
          {CHALLENGES.map((ch, idx) => {
            const isCompleted = completedChallenges.includes(ch.id);
            const isActive = activeChallengeIdx === idx;
            return (
              <button
                key={ch.id}
                onClick={() => selectChallenge(idx)}
                className={`flex-1 py-1.5 font-pixel text-[6px] tracking-wide uppercase border text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#7C3AED] text-white border-white'
                    : isCompleted
                    ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/35'
                    : 'bg-black/30 text-white/40 border-white/5'
                }`}
              >
                {isCompleted ? '✓ ' : ''}Task {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="bg-black/30 border border-white/5 p-3 relative">
          <h4 className="font-game text-xs text-white uppercase tracking-wide flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-[#FFD60A]" />
            {activeChallenge.title}
          </h4>
          <p className="font-body text-xs text-white/80 leading-relaxed mb-2.5">
            {activeChallenge.instruction}
          </p>
          <div className="flex gap-3 text-[9px] font-pixel text-[#A78BFA]">
            <span>🎯 Keywords: <strong className="text-white">{activeChallenge.requiredKeywords.join(', ')}</strong></span>
            <span>⚡ Min Target: <strong className="text-[#FFD60A]">{activeChallenge.minScore} Score</strong></span>
          </div>
        </div>
      </div>

      {/* Lab Interface Form */}
      <div 
        className="p-4 space-y-4"
        style={{
          background: '#1E1B4B',
          border: '3px solid #000',
          boxShadow: '4px 4px 0px #000',
        }}
      >
        {/* Template Selector */}
        <div>
          <span className="text-white/50 font-pixel text-[6px] tracking-wide block mb-1.5 uppercase">
            1. Select AI Companion Persona
          </span>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {TEMPLATES.map((t, idx) => (
              <button
                key={t.name}
                onClick={() => setSelectedTemplateIdx(idx)}
                className={`py-2 px-1 text-[8px] font-game border-2 border-black text-center shadow-[1px_1px_0px_#000] cursor-pointer flex flex-col justify-center items-center h-11 transition-all ${
                  selectedTemplateIdx === idx
                    ? 'bg-[#7C3AED] text-white border-white'
                    : 'bg-black/25 text-white/50 hover:bg-black/40'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature slider */}
        <div>
          <div className="flex justify-between font-pixel text-[5px] text-white/40 mb-1">
            <span>2. Temperature (Creativity)</span>
            <span className="text-[#FFD60A]">{temperature} ({temperature < 0.4 ? 'Focused' : 'Creative'})</span>
          </div>
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.1"
            value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-black border border-white/20 rounded cursor-pointer accent-[#7C3AED]"
          />
        </div>

        {/* Prompt Input Area */}
        <div>
          <span className="text-white/50 font-pixel text-[6px] tracking-wide block mb-1.5 uppercase">
            3. Write Your Prompt Command
          </span>
          <textarea
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            placeholder="Type your structured prompt command here..."
            className="w-full pixel-input text-xs h-20 resize-none"
            maxLength={180}
            disabled={loading}
          />
        </div>

        {/* Action Button */}
        <button
          onClick={handleSendPrompt}
          disabled={!promptInput.trim() || loading}
          className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-game text-xs border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:translate-y-1 active:shadow-[1px_1px_0px_#000]"
        >
          {loading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Sparky runs simulation...
            </>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              Compile & Inject Prompt 🚀
            </>
          )}
        </button>

        {/* Current output response */}
        <AnimatePresence>
          {aiOutput && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-3 border-black bg-black/40 p-3.5 relative shadow-[3px_3px_0px_#000]"
            >
              <span className="absolute -top-3 left-4 bg-purple-700 font-pixel text-[5px] text-white px-2 py-0.5 border-2 border-black">
                🤖 AI Output Response
              </span>
              <p className="text-white font-body text-xs leading-relaxed italic mt-1">
                "{aiOutput}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Rating feedback */}
        <AnimatePresence>
          {currentRating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-3 border-2 ${
                currentRating.score >= activeChallenge.minScore
                  ? 'border-[#10B981] bg-[#10B981]/10'
                  : 'border-[#EF4444] bg-[#EF4444]/10'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">
                  {currentRating.score >= activeChallenge.minScore ? '✅ CHALLENGE CRACKED!' : '❌ NOT QUITE PASSED'}
                </span>
                <span className="font-pixel text-[8px] ml-auto text-yellow-400">Score: {currentRating.score}/100</span>
              </div>
              <p className="font-body text-xs text-white/90 leading-relaxed mb-1">{currentRating.feedback}</p>
              <p className="font-body text-[10px] text-white/50 leading-relaxed italic">Sparky Hint: {currentRating.tip}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt Comparison Side-By-Side */}
      {attempts.length > 1 && (
        <div 
          className="p-4"
          style={{
            background: 'linear-gradient(180deg, #1E1B4B 0%, #140E36 100%)',
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          <div className="flex items-center gap-1.5 mb-3">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <h3 className="font-game text-xs text-white uppercase tracking-wider">Side-by-Side Prompt Compare</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {attempts.slice(0, 2).map((att, idx) => (
              <div key={att.id} className="border border-white/10 bg-black/25 p-3 relative flex flex-col justify-between">
                <span className="absolute top-2 right-2 font-pixel text-[5px] text-white/30">
                  {idx === 0 ? 'LATEST ATTEMPT' : 'PREVIOUS ATTEMPT'}
                </span>
                <div>
                  <div className="font-game text-[9px] text-[#A78BFA] uppercase mb-1">{att.role}</div>
                  <p className="font-body text-[11px] text-white/80 leading-relaxed truncate mb-1">Prompt: "{att.prompt}"</p>
                  <p className="font-body text-[10px] text-white/50 leading-relaxed italic line-clamp-2">Response: "{att.response}"</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/5 flex justify-between items-center">
                  <span className="font-pixel text-[5px] text-[#10B981] bg-[#10B981]/10 px-1 py-0.5 border border-[#10B981]/20">Score: {att.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
