import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testPromptPlayground, modifySvgWithInstruction, evaluateSvgDrawing } from '@/lib/ai';
import { BookOpen, MessageSquare, Paintbrush, Send, RefreshCw, Sparkles, Award } from 'lucide-react';
import { AICompanion } from '../ui/AICompanion';
import { useCurrentProfile } from '@/contexts/AuthContext';

interface CreateLabProps {
  onComplete: () => void;
}

type Mode = 'story' | 'chatbot' | 'art';

export interface ArtChallenge {
  id: string;
  name: string;
  emoji: string;
  difficulty: 'Simple' | 'Medium' | 'Advanced';
  minPrompts: number;
  maxPrompts: number;
  description: string;
  referenceSvg: string;
}

export const JUNIOR_ART_CHALLENGES: ArtChallenge[] = [
  {
    id: 'triangle_in_circle',
    name: 'Triangle within Circle',
    emoji: '🎯',
    difficulty: 'Simple',
    minPrompts: 2,
    maxPrompts: 5,
    description: 'Draw a triangle inside a circle. Do not fill them with any color (only use outlines/strokes!).',
    referenceSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="none" stroke="black" stroke-width="2"/>
      <polygon points="50,23 28,65 72,65" fill="none" stroke="black" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'three_colored_shapes',
    name: 'Three Colored Shapes',
    emoji: '🔺',
    difficulty: 'Medium',
    minPrompts: 3,
    maxPrompts: 6,
    description: 'Draw a triangle, a circle, and a square side-by-side, filled with three different colors.',
    referenceSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,65 25,35 40,65" fill="#EF4444" stroke="black" stroke-width="2"/>
      <circle cx="55" cy="50" r="15" fill="#FFD60A" stroke="black" stroke-width="2"/>
      <rect x="75" y="35" width="20" height="20" fill="#3B82F6" stroke="black" stroke-width="2"/>
    </svg>`
  }
];

export const INNOVATOR_ART_CHALLENGES: ArtChallenge[] = [
  {
    id: 'triangle_in_circle',
    name: 'Triangle within Circle',
    emoji: '🎯',
    difficulty: 'Simple',
    minPrompts: 2,
    maxPrompts: 5,
    description: 'Draw a triangle inside a circle. Do not fill them with any color (only use outlines/strokes!).',
    referenceSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="35" fill="none" stroke="black" stroke-width="2"/>
      <polygon points="50,23 28,65 72,65" fill="none" stroke="black" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'three_colored_shapes',
    name: 'Three Colored Shapes',
    emoji: '🔺',
    difficulty: 'Medium',
    minPrompts: 3,
    maxPrompts: 6,
    description: 'Draw a triangle, a circle, and a square side-by-side, filled with three different colors.',
    referenceSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <polygon points="10,65 25,35 40,65" fill="#EF4444" stroke="black" stroke-width="2"/>
      <circle cx="55" cy="50" r="15" fill="#FFD60A" stroke="black" stroke-width="2"/>
      <rect x="75" y="35" width="20" height="20" fill="#3B82F6" stroke="black" stroke-width="2"/>
    </svg>`
  },
  {
    id: 'split_color_square',
    name: 'Split Color Square',
    emoji: '🟥',
    difficulty: 'Advanced',
    minPrompts: 2,
    maxPrompts: 5,
    description: 'Draw a square filled half with one color (Red) and the other half with another color (Blue).',
    referenceSvg: `<svg viewBox="0 0 100 100" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <rect x="25" y="25" width="25" height="50" fill="#EF4444" stroke="black" stroke-width="2"/>
      <rect x="50" y="25" width="25" height="50" fill="#3B82F6" stroke="black" stroke-width="2"/>
    </svg>`
  }
];

export const ART_CHALLENGES: ArtChallenge[] = [...JUNIOR_ART_CHALLENGES, ...INNOVATOR_ART_CHALLENGES];

export default function CreateLab({ onComplete }: CreateLabProps) {
  const profile = useCurrentProfile();
  const zone = profile?.zone || 'junior';
  const activeChallenges = zone === 'innovator' ? INNOVATOR_ART_CHALLENGES : JUNIOR_ART_CHALLENGES;

  const [activeMode, setActiveMode] = useState<Mode>('story');
  const [loading, setLoading] = useState(false);

  // 1. Story Generator State
  const [storyGenre, setStoryGenre] = useState('Fantasy 🌌');
  const [storyTopic, setStoryTopic] = useState('');
  const [generatedStory, setGeneratedStory] = useState<string | null>(null);

  // 2. Chatbot Builder State
  const [botName, setBotName] = useState('Gizmo');
  const [botPersonality, setBotPersonality] = useState('Sarcastic 🤖');
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'bot'; text: string }>>([]);

  // 3. SVG Art Studio State
  const [activeChallenge, setActiveChallenge] = useState<ArtChallenge | null>(null);
  const [artPrompt, setArtPrompt] = useState('');
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [svgHistory, setSvgHistory] = useState<string[]>([]);
  const [gradeResult, setGradeResult] = useState<{ score: number; rawScore?: number; penalty?: number; feedback: string } | null>(null);
  const [grading, setGrading] = useState(false);

  // General counts to trigger complete
  const [storyCount, setStoryCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [artCount, setArtCount] = useState(0);

  const checkCompletion = (s: number, c: number, a: number) => {
    if (s > 0 && c > 0 && a > 0) {
      onComplete();
    }
  };

  // Generate Story
  const handleGenerateStory = async () => {
    if (!storyTopic.trim() || loading) return;
    setLoading(true);
    setGeneratedStory(null);

    const systemPrompt = `You are a creative children's storyteller. 
    Write an exciting, educational 3-sentence story in the genre of ${storyGenre} based on the topic: "${storyTopic}". 
    Make the protagonist a robot explorer named Sparky. Use fun emojis!`;

    try {
      const story = await testPromptPlayground(systemPrompt, 'Begin the story.', 0.85);
      setGeneratedStory(story);
      const nextStoryCount = storyCount + 1;
      setStoryCount(nextStoryCount);
      checkCompletion(nextStoryCount, chatCount, artCount);
    } catch (err) {
      setGeneratedStory('Once upon a time, Sparky went offline. But then Sparky rebooted and lived happily ever after!');
    } finally {
      setLoading(false);
    }
  };

  // Chatbot Response
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || loading) return;
    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setLoading(true);

    const systemPrompt = `You are a chatbot named "${botName}" with a "${botPersonality}" personality. 
    Respond to the student in exactly one short, fun, kid-friendly sentence. Use emojis!`;

    try {
      const reply = await testPromptPlayground(systemPrompt, userMsg, 0.8);
      setChatHistory(prev => [...prev, { sender: 'bot', text: reply }]);
      const nextChatCount = chatCount + 1;
      setChatCount(nextChatCount);
      checkCompletion(storyCount, nextChatCount, artCount);
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'bot', text: 'BZZZT! Internal connection reset!' }]);
    } finally {
      setLoading(false);
    }
  };

  // Art SVG Generator
  const handleGenerateArt = async () => {
    if (!artPrompt.trim() || !activeChallenge || loading) return;
    setLoading(true);

    try {
      const nextSvg = await modifySvgWithInstruction(
        generatedSvg || '',
        activeChallenge.name,
        artPrompt
      );
      
      // Save current state to history for Undo
      setSvgHistory(prev => [...prev, generatedSvg || '']);
      setPromptHistory(prev => [...prev, artPrompt]);
      setGeneratedSvg(nextSvg);
      setArtPrompt('');
      // Reset grade state since drawing changed
      setGradeResult(null);
    } catch (err) {
      console.error('Error modifying SVG canvas:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUndoArt = () => {
    if (svgHistory.length === 0) return;
    const previousSvg = svgHistory[svgHistory.length - 1];
    setSvgHistory(prev => prev.slice(0, -1));
    setPromptHistory(prev => prev.slice(0, -1));
    setGeneratedSvg(previousSvg || null);
    setGradeResult(null);
  };

  const handleResetArt = () => {
    setGeneratedSvg(null);
    setSvgHistory([]);
    setPromptHistory([]);
    setGradeResult(null);
    setArtPrompt('');
  };

  const handleGradeDrawing = async () => {
    if (!activeChallenge || !generatedSvg || promptHistory.length === 0 || grading) return;
    setGrading(true);
    try {
      const result = await evaluateSvgDrawing(
        activeChallenge.name,
        promptHistory,
        generatedSvg,
        activeChallenge.referenceSvg
      );
      
      // Calculate efficiency penalty based on prompt count:
      // -3 points per extra prompt beyond target minPrompts, uncapped
      const extraPrompts = Math.max(0, promptHistory.length - activeChallenge.minPrompts);
      const efficiencyPenalty = extraPrompts * 3;
      const finalScore = Math.max(10, result.score - efficiencyPenalty);

      setGradeResult({
        score: finalScore,
        rawScore: result.score,
        penalty: efficiencyPenalty,
        feedback: result.feedback
      });

      if (finalScore >= 70) {
        // Complete the art tab
        const nextArtCount = 1;
        setArtCount(nextArtCount);
        checkCompletion(storyCount, chatCount, nextArtCount);
      }
    } catch (err) {
      console.error('Error grading SVG drawing:', err);
    } finally {
      setGrading(false);
    }
  };

  const isLabFinished = storyCount > 0 && chatCount > 0 && artCount > 0;

  return (
    <div className="space-y-4">
      {/* Tab selection */}
      <div 
        className="p-3"
        style={{
          background: 'linear-gradient(135deg, #1E1B4B 0%, #150E36 100%)',
          border: '3px solid #EC4899',
          boxShadow: '4px 4px 0px #000',
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-pixel text-[6px] text-pink-400 tracking-wider uppercase">AI CREATION PLAYGROUND</span>
          {isLabFinished ? (
            <span className="font-pixel text-[5px] text-[#10B981] animate-pulse">LAB COMPLETED! 🏆</span>
          ) : (
            <span className="font-pixel text-[5px] text-white/50">STEPS: Story {storyCount > 0 ? '✓':'x'} | Chat {chatCount > 0 ? '✓':'x'} | Art {artCount > 0 ? '✓':'x'}</span>
          )}
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => { setActiveMode('story'); setGeneratedStory(null); }}
            className={`flex-1 py-2 font-game text-[10px] border-2 border-black flex justify-center items-center gap-1 cursor-pointer transition-all ${
              activeMode === 'story' ? 'bg-[#EC4899] text-white' : 'bg-black/20 text-white/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Story
          </button>
          <button
            onClick={() => { setActiveMode('chatbot'); setChatHistory([]); }}
            className={`flex-1 py-2 font-game text-[10px] border-2 border-black flex justify-center items-center gap-1 cursor-pointer transition-all ${
              activeMode === 'chatbot' ? 'bg-[#EC4899] text-white' : 'bg-black/20 text-white/50'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Chatbot
          </button>
          <button
            onClick={() => { setActiveMode('art'); setGeneratedSvg(null); }}
            className={`flex-1 py-2 font-game text-[10px] border-2 border-black flex justify-center items-center gap-1 cursor-pointer transition-all ${
              activeMode === 'art' ? 'bg-[#EC4899] text-white' : 'bg-black/20 text-white/50'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            Art Studio
          </button>
        </div>
      </div>

      {/* Main Interactive Screen */}
      <div 
        className="p-4"
        style={{
          background: '#1E1B4B',
          border: '3px solid #000',
          boxShadow: '4px 4px 0px #000',
        }}
      >
        {/* STORY GENERATOR */}
        {activeMode === 'story' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="flex-1">
                <span className="text-white/40 font-pixel text-[5px] block mb-1">STORY THEME:</span>
                <select 
                  value={storyGenre}
                  onChange={e => setStoryGenre(e.target.value)}
                  className="w-full pixel-input text-xs p-2.5 h-10"
                >
                  <option>Fantasy 🌌</option>
                  <option>Sci-Fi 🚀</option>
                  <option>Cyberpunk 🌆</option>
                  <option>Dino Jungle 🌴</option>
                </select>
              </div>
            </div>

            <div>
              <span className="text-white/40 font-pixel text-[5px] block mb-1">WHAT IS THE STORY ABOUT?</span>
              <input
                type="text"
                value={storyTopic}
                onChange={e => setStoryTopic(e.target.value)}
                placeholder="e.g. visiting a chocolate planet, saving a lost kitty"
                className="w-full pixel-input text-xs"
                maxLength={80}
              />
            </div>

            <button
              onClick={handleGenerateStory}
              disabled={!storyTopic.trim() || loading}
              className="w-full py-3 bg-[#EC4899] hover:bg-pink-700 text-white font-game text-xs border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  AI Writing Story...
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5" />
                  Generate Story 🚀
                </>
              )}
            </button>

            {generatedStory && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-3 border-black bg-black/40 p-4 text-center relative shadow-[3px_3px_0px_#000]"
              >
                <span className="absolute -top-3 left-4 bg-pink-600 font-pixel text-[5px] text-white px-2 py-0.5 border-2 border-black">
                  📖 Generated Story
                </span>
                <p className="text-white font-body text-xs leading-relaxed italic mt-1">
                  "{generatedStory}"
                </p>
              </motion.div>
            )}
          </div>
        )}

        {/* CHATBOT BUILDER */}
        {activeMode === 'chatbot' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-white/40 font-pixel text-[5px] block mb-1">BOT NAME:</span>
                <input
                  type="text"
                  value={botName}
                  onChange={e => setBotName(e.target.value)}
                  placeholder="Bot name..."
                  className="w-full pixel-input text-xs p-2.5 h-10"
                  maxLength={12}
                />
              </div>
              <div>
                <span className="text-white/40 font-pixel text-[5px] block mb-1">PERSONALITY:</span>
                <select 
                  value={botPersonality}
                  onChange={e => setBotPersonality(e.target.value)}
                  className="w-full pixel-input text-xs p-2.5 h-10"
                >
                  <option>Funny 🤪</option>
                  <option>Grumpy 😡</option>
                  <option>Polite 😇</option>
                  <option>Sarcastic 🤖</option>
                </select>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="h-44 overflow-y-auto border-2 border-black bg-black/35 p-3.5 space-y-2 flex flex-col no-scrollbar">
              {chatHistory.length === 0 && (
                <p className="text-white/30 font-body text-xs text-center my-auto">
                  Type a message below to initialize conversation with {botName}!
                </p>
              )}
              {chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`max-w-[80%] p-2 rounded-lg text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-purple-600 text-white self-end rounded-br-none' 
                      : 'bg-black/40 text-pink-300 border border-[#EC4899]/30 self-start rounded-bl-none'
                  }`}
                >
                  <span className="font-pixel text-[4px] block text-white/40 uppercase mb-0.5">
                    {msg.sender === 'user' ? 'YOU' : botName.toUpperCase()}
                  </span>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask your chatbot something..."
                className="flex-1 pixel-input text-xs"
                onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                disabled={loading}
              />
              <button
                onClick={handleSendChatMessage}
                disabled={!chatInput.trim() || loading}
                className="px-4 bg-[#EC4899] text-white border-2 border-black hover:bg-pink-700 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* AI ART STUDIO */}
        {activeMode === 'art' && (
          <div className="space-y-4 text-white">
            {!activeChallenge ? (
              // Challenge Setup/Selection Phase
              <div className="space-y-4 py-2">
                <div 
                  className="p-3 bg-indigo-950/40 border-2 border-dashed border-pink-500/40 rounded-lg text-left"
                >
                  <p className="font-game text-xs text-pink-400 mb-1">🎮 Shape Matching Challenges</p>
                  <p className="font-body text-xs text-white/70 leading-relaxed">
                    Select a drawing challenge below. Your goal is to guide the AI to match the target reference shape by giving structured English prompts (e.g., "draw a red rectangle in the center"). You have unlimited attempts, but using fewer prompts gets higher marks!
                  </p>
                </div>
                
                {['Simple', 'Medium', 'Advanced'].map(diff => {
                  const filtered = activeChallenges.filter(c => c.difficulty === diff);
                  if (filtered.length === 0) return null;
                  return (
                    <div key={diff} className="space-y-2">
                      <h4 className="font-game text-[10px] uppercase tracking-wider text-pink-500 border-b border-white/5 pb-1">
                        {diff} Challenges
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {filtered.map(challenge => (
                          <div
                            key={challenge.id}
                            onClick={() => setActiveChallenge(challenge)}
                            className="p-3 bg-black/45 hover:bg-pink-600/15 border-2 border-black hover:border-pink-500 transition-all cursor-pointer rounded flex flex-col justify-between shadow-[3px_3px_0px_#000]"
                          >
                            <div>
                              <div className="flex justify-between items-start">
                                <span className="font-game text-xs text-white">{challenge.emoji} {challenge.name}</span>
                                <span 
                                  className="font-pixel text-[4px] px-1.5 py-0.5 border border-black rounded"
                                  style={{
                                    background: challenge.difficulty === 'Simple' ? '#064E3B' : challenge.difficulty === 'Medium' ? '#78350F' : '#7F1D1D',
                                    color: '#fff'
                                  }}
                                >
                                  {challenge.difficulty}
                                </span>
                              </div>
                              <p className="font-body text-[10px] text-white/60 mt-1 leading-normal">
                                {challenge.description}
                              </p>
                            </div>
                            <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5 font-pixel text-[5px] text-white/40">
                              <span>Min Prompts: {challenge.minPrompts}</span>
                              <span className="text-yellow-400">Target Budget: {challenge.minPrompts} prompts</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Active Challenge Drawing & Feedback Phase
              <div className="space-y-4">
                {/* Challenge Header */}
                <div className="flex justify-between items-center bg-black/20 p-2.5 border-2 border-black">
                  <div className="flex items-center gap-1.5">
                    <span className="font-game text-xs text-pink-400">Mission: {activeChallenge.emoji} {activeChallenge.name}</span>
                    <span className="font-pixel text-[5px] text-white/40">({activeChallenge.difficulty} Mode)</span>
                  </div>
                  <button
                    onClick={() => {
                      handleResetArt();
                      setActiveChallenge(null);
                    }}
                    className="font-pixel text-[5px] text-white/40 hover:text-pink-400 border border-white/10 px-2 py-0.5 cursor-pointer"
                  >
                    Change Mission ✕
                  </button>
                </div>

                {/* Prompt Budget Dashboard */}
                {(() => {
                  const used = promptHistory.length;
                  const target = activeChallenge.minPrompts;
                  const extra = Math.max(0, used - target);
                  const penalty = extra * 3;
                  return (
                    <div className="p-3 bg-black/25 border-2 border-black space-y-1">
                      <div className="flex justify-between items-center font-pixel text-[5px]">
                        <span className="text-white/60">PROMPTS USED: {used} (TARGET: {target})</span>
                        {penalty > 0 ? (
                          <span className="text-red-400 font-bold animate-pulse">
                            EFFICIENCY DEDUCTION: -{penalty} MARKS
                          </span>
                        ) : (
                          <span className="text-green-400 font-bold">
                            EFFICIENCY BONUS: PERFECT STEP BUDGET!
                          </span>
                        )}
                      </div>
                      <div className="text-[7px] font-body text-white/40">
                        {penalty > 0 
                          ? `Using ${extra} extra prompts. Every extra prompt reduces your final score by 3 marks. Try to keep your instructions clear and concise!`
                          : `Great job! You are within the target shape prompt budget. Clear instructions get full marks!`
                        }
                      </div>
                    </div>
                  );
                })()}

                {/* Grid layout for Canvas & Chat history */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Left Column: Side-by-side Canvases */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* Student SVG Canvas */}
                    <div className="flex flex-col items-center">
                      <span className="font-pixel text-[5px] text-white/45 mb-1 uppercase">Your Drawing</span>
                      <div
                        className="border-3 border-black bg-white/5 relative shadow-[3px_3px_0px_#000] aspect-square w-full flex items-center justify-center overflow-hidden"
                      >
                        {generatedSvg ? (
                          <div 
                            className="w-full h-full flex items-center justify-center"
                            dangerouslySetInnerHTML={{ __html: generatedSvg }}
                          />
                        ) : (
                          <div className="text-center p-2">
                            <p className="text-2xl animate-bounce mb-1">✨</p>
                            <p className="text-white/20 font-body text-[8px]">
                              Empty Canvas.<br/>Enter first prompt!
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Reference target Canvas */}
                    <div className="flex flex-col items-center">
                      <span className="font-pixel text-[5px] text-yellow-400/70 mb-1 uppercase">Target Shape Goal</span>
                      <div
                        className="border-3 border-yellow-500/40 bg-white/5 relative shadow-[3px_3px_0px_#000] aspect-square w-full flex items-center justify-center overflow-hidden"
                      >
                        <div 
                          className="w-full h-full flex items-center justify-center opacity-85"
                          dangerouslySetInnerHTML={{ __html: activeChallenge.referenceSvg }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Chat/Prompt Steps Log */}
                  <div className="flex flex-col h-[260px] border-2 border-black bg-black/30 p-2.5 justify-between">
                    <span className="font-pixel text-[5px] text-white/40 border-b border-white/5 pb-1 block">
                      BUILD STEPS ({promptHistory.length})
                    </span>

                    {/* Chat log overflow wrapper */}
                    <div className="flex-1 overflow-y-auto py-2 space-y-2 no-scrollbar text-xs">
                      {/* Starter prompt */}
                      <div className="bg-pink-900/10 border border-pink-500/10 p-2 rounded text-pink-300">
                        <span className="font-pixel text-[4px] block text-pink-400">SPARKY BOT</span>
                        Let's draw a {activeChallenge.name}! What mathematical shape (like square, circle, or triangle) should we start with?
                      </div>

                      {promptHistory.map((step, idx) => (
                        <React.Fragment key={idx}>
                          <div className="bg-purple-900/20 p-2 rounded text-purple-200 self-end">
                            <span className="font-pixel text-[4px] block text-purple-400">YOU (STEP {idx + 1})</span>
                            {step}
                          </div>
                          <div className="bg-pink-900/10 border border-pink-500/10 p-2 rounded text-pink-300">
                            <span className="font-pixel text-[4px] block text-pink-400">SPARKY BOT</span>
                            Added shape successfully! What should we add next?
                          </div>
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Prompt input field */}
                    <div className="flex flex-col gap-1.5 pt-1.5 border-t border-white/5">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={artPrompt}
                          onChange={e => setArtPrompt(e.target.value)}
                          placeholder={
                            promptHistory.length === 0 
                              ? "e.g. Draw a large red rectangle in the center" 
                              : "e.g. Add a yellow triangle on top of the rectangle"
                          }
                          className="flex-1 pixel-input text-xs px-2 py-1.5 h-8 bg-black/40 border border-white/20 text-white"
                          onKeyDown={e => e.key === 'Enter' && handleGenerateArt()}
                          disabled={loading || grading}
                        />
                        <button
                          onClick={handleGenerateArt}
                          disabled={!artPrompt.trim() || loading || grading}
                          className="px-3 bg-pink-600 hover:bg-pink-700 text-white border-2 border-black flex items-center justify-center cursor-pointer disabled:opacity-50"
                        >
                          {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Control Panel Buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleUndoArt}
                    disabled={svgHistory.length === 0 || loading || grading}
                    className="flex-1 min-w-[80px] py-1.5 bg-black/40 hover:bg-black/60 text-white/80 disabled:opacity-30 border-2 border-black font-game text-[10px] cursor-pointer"
                  >
                    ↩️ Undo Step
                  </button>

                  <button
                    onClick={handleResetArt}
                    disabled={(promptHistory.length === 0 && !generatedSvg) || loading || grading}
                    className="flex-1 min-w-[80px] py-1.5 bg-black/40 hover:bg-black/60 text-white/80 disabled:opacity-30 border-2 border-black font-game text-[10px] cursor-pointer"
                  >
                    🔄 Clear Canvas
                  </button>

                  <button
                    onClick={handleGradeDrawing}
                    disabled={promptHistory.length === 0 || loading || grading}
                    className="flex-[2] min-w-[120px] py-1.5 bg-[#FFD60A] text-black hover:bg-yellow-500 disabled:opacity-40 border-2 border-black font-game text-[10px] cursor-pointer font-bold shadow-[2px_2px_0px_#000]"
                  >
                    {grading ? 'Evaluating Work...' : '🏆 Grade My Drawing!'}
                  </button>
                </div>

                {/* Grading Scorecard Panel */}
                {gradeResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 border-3 border-black relative"
                    style={{
                      background: gradeResult.score >= 70 ? 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)' : '#311010',
                      border: gradeResult.score >= 70 ? '3px solid #10B981' : '3px solid #EF4444',
                      boxShadow: '4px 4px 0px #000',
                    }}
                  >
                    <span 
                      className="absolute -top-3 left-4 font-pixel text-[5px] text-white px-2 py-0.5 border-2 border-black"
                      style={{ background: gradeResult.score >= 70 ? '#10B981' : '#EF4444' }}
                    >
                      🎓 AI ART TEACHER REPORT
                    </span>

                    <div className="flex flex-col gap-2.5 mt-1">
                      <div className="flex items-center gap-4">
                        <div className="text-center bg-black/30 p-2 border border-white/10 min-w-[85px] rounded">
                          <p className="font-pixel text-[5px] text-white/50 uppercase">Final Grade</p>
                          <p className="font-game text-xl text-yellow-400 font-bold">{gradeResult.score}</p>
                          <p className="font-pixel text-[4px] text-white/30">out of 100</p>
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <div className="flex text-yellow-400 text-sm gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => {
                              const starThreshold = (i + 1) * 20;
                              return (
                                <span key={i}>
                                  {gradeResult.score >= starThreshold ? '★' : '☆'}
                                </span>
                              );
                            })}
                          </div>
                          
                          {/* Score breakdown metrics */}
                          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 font-pixel text-[4.5px] text-white/60">
                            <span>Base Shape Match:</span>
                            <span className="text-white font-bold">{gradeResult.rawScore}%</span>
                            <span>Prompt Steps taken:</span>
                            <span className="text-white font-bold">{promptHistory.length}</span>
                            <span>Efficiency Penalty:</span>
                            <span className="text-red-400 font-bold">-{gradeResult.penalty || 0}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 pt-2 space-y-1">
                        <p className="text-white font-body text-xs italic leading-relaxed">
                          "{gradeResult.feedback}"
                        </p>
                        <p className="font-pixel text-[5px] pt-1">
                          {gradeResult.score >= 70 
                            ? '🎉 PASSING GRADE! Art Studio Lab Step completed successfully!' 
                            : 'Try using fewer prompts or editing your shapes to resemble the reference better.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Completion alert button if completed all three */}
      {isLabFinished && (
        <div 
          className="p-3 text-center border-2 border-[#10B981] bg-[#10B981]/15"
          style={{ boxShadow: '3px 3px 0px #000' }}
        >
          <p className="font-game text-xs text-white">🎉 Creation Lab fully solved! Click continue to proceed.</p>
          <button
            onClick={onComplete}
            className="mt-2.5 px-6 py-1.5 font-game text-[10px] text-black bg-[#FFD60A] border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            Submit Lab ➔
          </button>
        </div>
      )}
    </div>
  );
}
