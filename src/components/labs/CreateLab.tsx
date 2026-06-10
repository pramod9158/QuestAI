import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { testPromptPlayground } from '@/lib/gemini';
import { BookOpen, MessageSquare, Paintbrush, Send, RefreshCw, Sparkles, Award } from 'lucide-react';
import { AICompanion } from '../ui/AICompanion';

interface CreateLabProps {
  onComplete: () => void;
}

type Mode = 'story' | 'chatbot' | 'art';

export default function CreateLab({ onComplete }: CreateLabProps) {
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
  const [artPrompt, setArtPrompt] = useState('');
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null);

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
    if (!artPrompt.trim() || loading) return;
    setLoading(true);
    setGeneratedSvg(null);

    const systemPrompt = `You are a creative SVG artist coder. 
    Write ONLY raw SVG code representing: "${artPrompt}". 
    Do NOT include markdown formatting like \`\`\`xml or \`\`\`svg. Start directly with <svg ...> and end with </svg>. 
    Make it colorful, cute, and simplified for children. Avoid complex shapes. Only output valid SVG elements.`;

    try {
      const rawResponse = await testPromptPlayground(systemPrompt, 'Generate the SVG markup.', 0.6);
      
      // Clean up response from markdown tags if the model returned them
      let cleaned = rawResponse.replace(/```xml/gi, '').replace(/```svg/gi, '').replace(/```/g, '').trim();
      const startIdx = cleaned.indexOf('<svg');
      const endIdx = cleaned.lastIndexOf('</svg>');
      if (startIdx !== -1 && endIdx !== -1) {
        cleaned = cleaned.substring(startIdx, endIdx + 6);
      }

      setGeneratedSvg(cleaned);
      const nextArtCount = artCount + 1;
      setArtCount(nextArtCount);
      checkCompletion(storyCount, chatCount, nextArtCount);
    } catch (err) {
      console.error(err);
      // Fallback simple cute house SVG
      setGeneratedSvg(`<svg viewBox="0 0 100 100" width="100%" height="100%">
        <rect x="25" y="45" width="50" height="40" fill="#3B82F6" stroke="black" stroke-width="2"/>
        <polygon points="20,45 50,20 80,45" fill="#EF4444" stroke="black" stroke-width="2"/>
        <rect x="42" y="55" width="16" height="30" fill="#FFD60A" stroke="black" stroke-width="2"/>
        <circle cx="50" cy="35" r="5" fill="#fff" stroke="black" stroke-width="1.5"/>
      </svg>`);
    } finally {
      setLoading(false);
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
          <div className="space-y-4">
            <div>
              <span className="text-white/40 font-pixel text-[5px] block mb-1">DESCRIBE YOUR ARTWORK DREAM:</span>
              <input
                type="text"
                value={artPrompt}
                onChange={e => setArtPrompt(e.target.value)}
                placeholder="e.g. A happy green frog wearing a gold crown on a leaf"
                className="w-full pixel-input text-xs"
                maxLength={80}
              />
            </div>

            <button
              onClick={handleGenerateArt}
              disabled={!artPrompt.trim() || loading}
              className="w-full py-3 bg-[#EC4899] hover:bg-pink-700 text-white font-game text-xs border-3 border-black shadow-[3px_3px_0px_#000] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  AI Painting SVG Art...
                </>
              ) : (
                <>
                  <Paintbrush className="w-3.5 h-3.5" />
                  Paint SVG Canvas 🎨
                </>
              )}
            </button>

            {generatedSvg && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-3 border-black bg-white/10 p-4 relative shadow-[3px_3px_0px_#000] aspect-square max-w-[280px] mx-auto flex items-center justify-center"
              >
                <span className="absolute -top-3 left-4 bg-pink-600 font-pixel text-[5px] text-white px-2 py-0.5 border-2 border-black">
                  🎨 Vector Code Canvas
                </span>
                
                {/* SVG Render Box */}
                <div 
                  className="w-full h-full flex items-center justify-center text-white font-body text-xs"
                  dangerouslySetInnerHTML={{ __html: generatedSvg }}
                />
              </motion.div>
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
