import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { testPromptPlayground } from '@/lib/ai';
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay';
import { CURRICULUM } from '@/data/curriculum';
import { 
  Sparkles, 
  Send, 
  RefreshCw, 
  Wand2, 
  HelpCircle, 
  Info,
  CheckCircle2, 
  AlertTriangle,
  Lock,
  Play,
  CheckCircle,
  BookOpen
} from 'lucide-react';

// ==========================================
// DATA CONFIGURATION
// ==========================================

interface Persona {
  name: string;
  emoji: string;
  system: string;
  desc: string;
}

interface Topic {
  label: string;
  prompt: string;
}

const JUNIOR_PERSONAS: Record<string, Persona> = {
  merlin: {
    name: 'Merlin the Wizard',
    emoji: '🧙‍♂️',
    desc: 'Mystical spells & rhyming stars',
    system: 'You are Merlin the Wizard. You speak in mystical spells, rhyming verses, and ancient wizardry phrases! Keep it short. Add star, wand, and magic emojis.',
  },
  dragon: {
    name: 'Sparky the Dragon',
    emoji: '🐉',
    desc: 'Cute growls & baby rawrs',
    system: 'You are Sparky, a cute baby dragon! Speak in cute baby dragon sounds like "Rawr!" and "Squeak!", and be very playful. Keep it short. Add fire, egg, and dragon emojis.',
  },
  pirate: {
    name: 'Capt. Redbeard',
    emoji: '🏴‍☠️',
    desc: 'Loud, hearty pirate slang',
    system: 'You are Captain Redbeard, a friendly pirate captain! Speak in loud pirate slang ("Ahoy matey!", "Aye", "Scallywags") and talk about hidden treasures. Keep it short. Add pirate and anchor emojis.',
  },
  monkey: {
    name: 'Barnaby the Monkey',
    emoji: '🐒',
    desc: 'Bananas & chattering sounds',
    system: 'You are Barnaby, a hyperactive space monkey! Chatter about space, bananas, and rockets. Make funny monkey sounds like "Oooh-oooh-aaah-aaah!". Keep it short. Add monkey and banana emojis.',
  }
};

const JUNIOR_TOPICS: Record<string, Topic> = {
  icecream: {
    label: '🍦 Cold Ice Cream',
    prompt: 'explain how ice cream gets cold and freezes'
  },
  dino: {
    label: '🦖 Dino Breakfast',
    prompt: 'describe what a friendly T-Rex dinosaur ate for breakfast'
  },
  rocket: {
    label: '🚀 Moon Flight',
    prompt: 'explain how rockets shoot up through space to reach the moon'
  }
};

const JUNIOR_TONES = {
  silly: 'Super Silly 🤪',
  animals: 'Animal Noises 🦁',
  pizza: 'Pizza Obsessed 🍕',
};

const JUNIOR_SECRET_WORDS = ['banana', 'sparkle', 'bubble', 'slime'];

const INNOVATOR_PERSONAS: Record<string, Persona> = {
  android: {
    name: 'Sarcastic Android',
    emoji: '🤖',
    desc: 'Cold logic, witty sarcasm, human jokes',
    system: 'You are Sarcastic Android V4. You speak in a highly logical, cold robotic voice with witty sarcasm, frequently making fun of human biological limitations and carbon-based life.',
  },
  detective: {
    name: 'Neon Detective',
    emoji: '🕵️',
    desc: 'Gritty noir, rainy cyber streets',
    system: 'You are a gritty, hard-boiled detective in a rainy cyberpunk city. Speak in noir style, using metaphors of neon lights, trench coats, foggy alleyways, and deep secrets.',
  },
  physicist: {
    name: 'Quantum Scientist',
    emoji: '🔬',
    desc: 'Scientific jargon, molecular waves',
    system: 'You are an enthusiastic Quantum Physicist. Explain concepts using real scientific vocabulary, mentioning molecules, energy fields, waves, and quantum states.',
  },
  actor: {
    name: 'Shakespeare Actor',
    emoji: '🎭',
    desc: 'Elegant Early Modern drama',
    system: 'You are a dramatic Shakespearean actor. You speak in elegant Early Modern English, using terms like "thee", "thou", "thy", "art", "hark", "fie", and "doth" in a very theatrical manner.',
  }
};

const INNOVATOR_TOPICS: Record<string, Topic> = {
  networks: {
    label: '🧠 Face Vision AI',
    prompt: 'explain how neural networks analyze pixels to recognize human faces'
  },
  bias: {
    label: '⚖️ AI Bias Audit',
    prompt: 'explain why AI models can become biased and how we can collect fair training data'
  },
  blackhole: {
    label: '🌌 Black Hole Tech',
    prompt: 'describe what happens to time and space inside a black hole gravity well'
  }
};

const INNOVATOR_CONSTRAINTS = {
  haiku: {
    label: '📝 Syllable Haiku',
    system: 'Your response MUST be formatted strictly as a single 3-line Haiku poem following the 5-7-5 syllable structure.'
  },
  json: {
    label: '💻 Structured JSON',
    system: 'Your response MUST be returned strictly as a valid JSON object. No markdown wrappers. Schema: { "summary": "brief summary", "keywords": ["keyword1", "keyword2"] }'
  },
  code: {
    label: '🔑 Uppercase Code',
    system: 'Your response MUST contain only uppercase alphabetical letters and spaces replaced by dashes. No lowercase, no punctuation.'
  }
};

export default function PromptEngineering() {
  const navigate = useNavigate();
  const profile = useCurrentProfile();
  const { updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'lessons' | 'playground'>('lessons');
  const completedIds = profile?.completed_lessons || [];

  // Custom profile override for testing/swapping modes easily
  const [activeZone, setActiveZone] = useState<'junior' | 'innovator'>('junior');

  // Filter curriculum to grab Phase 3 and Phase 8 modules for prompting
  const promptLessons = CURRICULUM.filter(l => 
    (l.phase === 3 || l.phase === 8) && 
    (l.zone === activeZone || l.zone === 'both')
  ).sort((a, b) => a.phase - b.phase);

  useEffect(() => {
    if (profile?.zone) {
      setActiveZone(profile.zone);
    }
  }, [profile?.zone]);

  // Junior State variables
  const [jPersona, setJPersona] = useState<string>('merlin');
  const [jTopic, setJTopic] = useState<string>('icecream');
  const [jTone, setJTone] = useState<string>('silly');
  const [jSecretWord, setJSecretWord] = useState<string>('banana');
  const [jCustomInput, setJCustomInput] = useState<string>('');
  const [jChaos, setJChaos] = useState<'focused' | 'wild'>('focused');

  // Innovator State variables
  const [iPersona, setIPersona] = useState<string>('android');
  const [iTopic, setITopic] = useState<string>('networks');
  const [iConstraint, setIConstraint] = useState<string>('haiku');
  const [iCustomInput, setICustomInput] = useState<string>('');
  const [iTemp, setITemp] = useState<number>(0.7);

  // General State
  const [loading, setLoading] = useState<boolean>(false);
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [compiledPrompt, setCompiledPrompt] = useState<string>('');
  const [evaluation, setEvaluation] = useState<{
    score: number;
    feedback: string;
    personaMatch: boolean;
    constraintMatch: boolean;
    chaosInsight: string;
  } | null>(null);
  
  const [showVictory, setShowVictory] = useState<boolean>(false);

  // Auto compile preview on configuration change
  useEffect(() => {
    if (activeZone === 'junior') {
      const p = JUNIOR_PERSONAS[jPersona];
      const t = JUNIOR_TOPICS[jTopic];
      const tn = JUNIOR_TONES[jTone as keyof typeof JUNIOR_TONES];
      const customText = jCustomInput.trim() ? ` plus detail '${jCustomInput}'` : '';
      setCompiledPrompt(
        `You are '${p.name}'. Explain '${t.prompt}' in a style that is '${tn}', including the secret word '${jSecretWord}'${customText}.`
      );
    } else {
      const p = INNOVATOR_PERSONAS[iPersona];
      const t = INNOVATOR_TOPICS[iTopic];
      const c = INNOVATOR_CONSTRAINTS[iConstraint as keyof typeof INNOVATOR_CONSTRAINTS];
      const customText = iCustomInput.trim() ? `, detail override '${iCustomInput}'` : '';
      setCompiledPrompt(
        `System: You are '${p.name}'. Subject: Explain '${t.prompt}'. Formatting constraint: '${c.label}'${customText}.`
      );
    }
  }, [activeZone, jPersona, jTopic, jTone, jSecretWord, jCustomInput, iPersona, iTopic, iConstraint, iCustomInput]);

  const handleCastSpell = async () => {
    if (loading) return;
    setLoading(true);
    setAiOutput(null);
    setEvaluation(null);

    // Set parameters based on mode
    const systemInstruction = activeZone === 'junior' 
      ? `You are an AI teaching assistant. Adopt the following personality: ${JUNIOR_PERSONAS[jPersona].system} Tone constraint: ${JUNIOR_TONES[jTone as keyof typeof JUNIOR_TONES]}. Make sure the secret word "${jSecretWord}" is included somewhere.`
      : `System: ${INNOVATOR_PERSONAS[iPersona].system} Formatting: ${INNOVATOR_CONSTRAINTS[iConstraint as keyof typeof INNOVATOR_CONSTRAINTS].system}`;

    const temp = activeZone === 'junior'
      ? (jChaos === 'focused' ? 0.25 : 0.9)
      : iTemp;

    const userPrompt = activeZone === 'junior'
      ? `Explain: "${JUNIOR_TOPICS[jTopic].prompt}".${jCustomInput ? ` Make sure to: ${jCustomInput}` : ''}`
      : `Explain: "${INNOVATOR_TOPICS[iTopic].prompt}".${iCustomInput ? ` Apply these details: ${iCustomInput}` : ''}`;

    try {
      // 1. Fetch live AI response
      const response = await testPromptPlayground(systemInstruction, userPrompt, temp);
      setAiOutput(response);

      // 2. Build the AI evaluator instructions
      const evaluationSystemPrompt = `You are a strict Prompt Engineering Judge.
You evaluate if the generated AI output correctly followed the student's prompt setup:
- Persona Target: ${activeZone === 'junior' ? JUNIOR_PERSONAS[jPersona].name : INNOVATOR_PERSONAS[iPersona].name}
- Topic Target: ${activeZone === 'junior' ? JUNIOR_TOPICS[jTopic].label : INNOVATOR_TOPICS[iTopic].label}
- Constraint Target: ${activeZone === 'junior' ? `Includes secret word "${jSecretWord}"` : INNOVATOR_CONSTRAINTS[iConstraint as keyof typeof INNOVATOR_CONSTRAINTS].label}

Here is the generated output:
"""
${response}
"""

Evaluate matching accuracy:
1. Did the output follow the Persona's voice, formatting, and emojis?
2. Did it follow the Constraint / Secret Word? (e.g. check JSON structure, Haiku format, or check if "${jSecretWord}" is present).
3. Score the prompt compliance from 30 to 100.
4. Provide kid-friendly feedback (2 sentences) explaining how their Prompt Engineering setup directly caused this output.

Respond ONLY with a JSON object:
{
  "score": <number between 30 and 100>,
  "feedback": "<clear, encouraging review>",
  "personaMatch": <true/false>,
  "constraintMatch": <true/false>
}`;

      // 3. Ask AI to evaluate
      const evalResponse = await testPromptPlayground(evaluationSystemPrompt, 'Evaluate output accuracy', 0.15);
      const jsonMatch = evalResponse.match(/\{[\s\S]*\}/);
      let parsedEval = { score: 75, feedback: 'Great prompt setup! The AI followed your instructions nicely.', personaMatch: true, constraintMatch: true };
      
      if (jsonMatch) {
        try {
          parsedEval = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.warn('Could not parse evaluator output:', e);
        }
      }

      // 4. Structural fallback validations client-side
      let constraintMatch = parsedEval.constraintMatch;
      if (activeZone === 'junior') {
        constraintMatch = response.toLowerCase().includes(jSecretWord.toLowerCase());
      } else if (iConstraint === 'json') {
        try {
          JSON.parse(response.replace(/```json/gi, '').replace(/```/gi, '').trim());
          constraintMatch = true;
        } catch (e) {
          constraintMatch = false;
        }
      } else if (iConstraint === 'code') {
        const textOnly = response.replace(/-/g, '').replace(/\s/g, '');
        constraintMatch = textOnly === textOnly.toUpperCase() && response.includes('-');
      }

      // Recalculate score based on structural checks
      let score = parsedEval.score;
      if (!constraintMatch) {
        score = Math.max(30, score - 25);
      }

      // Add educational Chaos/Temperature insight
      let chaosInsight = '';
      if (activeZone === 'junior') {
        chaosInsight = jChaos === 'wild'
          ? '🤪 You used a "Wild" chaos level (high Temperature). This instructed the AI to select more unusual, creative words, leading to a funnier story!'
          : '🎯 You used a "Calm" chaos level (low Temperature). This instructed the AI to stay focused and write a highly predictable, standard response.';
      } else {
        chaosInsight = iTemp > 0.7
          ? `🌡️ Your Temperature was set high (${iTemp}). This allows high randomness in word choices, which boosts creativity but makes it harder to follow strict rules.`
          : iTemp < 0.35
          ? `🌡️ Your Temperature was set low (${iTemp}). This makes the AI extremely deterministic, ensuring strict rule-following (like JSON format or precise math).`
          : `🌡️ Your Temperature was set moderate (${iTemp}). This balances creative phrasing with reasonable instruction matching.`;
      }

      setEvaluation({
        score,
        feedback: parsedEval.feedback,
        personaMatch: parsedEval.personaMatch,
        constraintMatch,
        chaosInsight
      });

      // Award XP and coins on score >= 80
      if (score >= 80 && profile) {
        updateProfile({
          xp: profile.xp + 50,
          coins: profile.coins + 10
        });
        setShowVictory(true);
      }

    } catch (err) {
      console.error('Error compiling prompt:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20">
      
      {/* Clean Dynamic Header Banner */}
      <div 
        className="p-3.5 transition-all duration-300 relative overflow-hidden"
        style={{
          background: activeZone === 'junior' 
            ? 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' 
            : 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 100%)',
          border: '3px solid #000',
          boxShadow: '4px 4px 0px #000',
        }}
      >
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="font-pixel text-[5.5px] text-white/60 tracking-widest uppercase">
              PROMPT ENGINEERING LAB
            </span>
            <button
              onClick={() => {
                setActiveZone(z => z === 'junior' ? 'innovator' : 'junior');
                setAiOutput(null);
                setEvaluation(null);
              }}
              className="px-2 py-0.5 font-pixel text-[5px] text-black bg-[#FFD60A] border border-black hover:bg-yellow-500 transition-colors shadow-[1.5px_1.5px_0px_#000] cursor-pointer"
            >
              SWITCH TO {activeZone === 'junior' ? 'INNOVATOR 🧠' : 'JUNIOR 🚀'}
            </button>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-3xl">🧪</span>
            <h2 className="font-game text-white text-base leading-tight uppercase tracking-wide">
              Prompt Alchemy
            </h2>
          </div>
          <p className="font-body text-[10px] text-white/80 leading-relaxed mt-1">
            {activeZone === 'junior' 
              ? 'Choose magical ingredients to customize the AI’s response! See how changing your companion persona or chaos level shifts the story.'
              : 'Control complex AI variables, formatting limits, and sampling temperatures to engineer precise data structures.'}
          </p>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex gap-2.5">
        <button
          onClick={() => setActiveTab('lessons')}
          className={`flex-1 py-2.5 font-game text-[10px] uppercase border-3 border-black shadow-[2.5px_2.5px_0px_#000] cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'lessons'
              ? 'bg-[#7C3AED] text-white border-purple-400'
              : 'bg-[#1E1B4B]/80 text-white/50 hover:bg-[#1E1B4B] hover:text-white'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          📖 Prompt Modules
        </button>
        <button
          onClick={() => setActiveTab('playground')}
          className={`flex-1 py-2.5 font-game text-[10px] uppercase border-3 border-black shadow-[2.5px_2.5px_0px_#000] cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'playground'
              ? 'bg-[#7C3AED] text-white border-purple-400'
              : 'bg-[#1E1B4B]/80 text-white/50 hover:bg-[#1E1B4B] hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          🧪 Prompt Alchemy
        </button>
      </div>

      {/* ─── LESSONS TAB ─── */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <div className="p-4 bg-black/20 border-2 border-dashed border-white/10 text-center rounded">
            <span className="text-3xl">📖</span>
            <h3 className="font-game text-sm text-white uppercase tracking-wider mt-2">Prompt Engineering Journey</h3>
            <p className="font-body text-[10px] text-white/60 mt-1 max-w-sm mx-auto leading-relaxed">
              Complete these 2 foundational modules to master the art of talking to AI, generating art, and writing magical scripts!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {promptLessons.map((lesson, idx) => {
              const isDone = completedIds.includes(lesson.id);
              // Locked check: First lesson is always open, second is locked if first isn't completed
              const isLocked = idx > 0 && !completedIds.includes(promptLessons[idx - 1].id);
              
              // Get progress steps
              const watchDone = localStorage.getItem(`lesson_${lesson.id}_watch`) === 'true';
              const labDone = localStorage.getItem(`lesson_${lesson.id}_lab`) === 'true';
              const projectDone = localStorage.getItem(`lesson_${lesson.id}_project`) === 'true';
              const duration = parseInt(lesson.videoDuration || '5') + parseInt(lesson.labDuration || '8') + parseInt(lesson.projectDuration || '5');

              return (
                <motion.div
                  key={lesson.id}
                  whileHover={!isLocked ? { y: -2, scale: 1.01 } : {}}
                  onClick={() => {
                    if (!isLocked) {
                      navigate(`/learn/${lesson.id}`);
                    }
                  }}
                  className={`relative p-4 border-3 border-black transition-all flex flex-col justify-between cursor-pointer rounded ${
                    isDone ? 'bg-[#1E1B4B]/60 opacity-75' :
                    !isLocked ? 'bg-gradient-to-br from-[#1E1B4B] to-[#251E5C] border-[#FFD60A] shadow-[4px_4px_0px_#000]' :
                    'bg-[#151036] opacity-50 cursor-not-allowed'
                  }`}
                  style={{
                    boxShadow: !isLocked && !isDone ? '3px 3px 0px #FFD60A' : '3px 3px 0px #000',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-pixel text-[5px] text-[#A78BFA] uppercase">
                        Phase {lesson.phase} • Module {lesson.phase === 3 ? '3' : '8'}
                      </span>
                      {isDone ? (
                        <span className="font-pixel text-[5px] text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 border border-[#10B981]/30">CRUSHED</span>
                      ) : isLocked ? (
                        <span className="font-pixel text-[5px] text-red-400 bg-red-950/20 border border-red-900/30 px-1.5 py-0.5 flex items-center gap-1">
                          <Lock className="w-2 h-2" /> LOCKED
                        </span>
                      ) : (
                        <span className="font-pixel text-[5px] text-yellow-400 bg-yellow-950/20 border border-yellow-900/30 px-1.5 py-0.5 animate-pulse">ACTIVE</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{lesson.missionEmoji || lesson.emoji}</span>
                      <h3 className="font-game text-xs text-white leading-snug uppercase tracking-wide">
                        {lesson.missionTitle || lesson.title}
                      </h3>
                    </div>
                    <p className="font-body text-[10px] text-purple-300 italic mt-2 leading-relaxed">
                      "{lesson.curiosityHook || lesson.description}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 space-y-3">
                    {/* Step Progress Indicators */}
                    {!isLocked && (
                      <div className="grid grid-cols-3 gap-1 text-center text-[7px] font-pixel">
                        <div className={`py-1 border ${watchDone || isDone ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20' : 'bg-black/20 text-white/30 border-white/5'}`}>
                          🎥 Watch {(watchDone || isDone) && '✓'}
                        </div>
                        <div className={`py-1 border ${labDone || isDone ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20' : 'bg-black/20 text-white/30 border-white/5'}`}>
                          🧪 Lab {(labDone || isDone) && '✓'}
                        </div>
                        <div className={`py-1 border ${projectDone || isDone ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/20' : 'bg-black/20 text-white/30 border-white/5'}`}>
                          🛠️ Create {(projectDone || isDone) && '✓'}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-white/50 font-pixel text-[5px]">
                      <span className="flex items-center gap-1">
                        ⏱️ {duration} min
                      </span>
                      <span className="flex items-center gap-0.5 text-[#FFD60A]">
                        ⚡ +{lesson.xpReward} XP
                      </span>
                    </div>

                    {isLocked ? (
                      <div className="w-full py-2 bg-slate-800 text-white/30 font-game text-[9px] uppercase border-2 border-black text-center flex items-center justify-center gap-1.5 cursor-not-allowed">
                        <Lock className="w-3 h-3" /> Complete previous module to unlock
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/learn/${lesson.id}`);
                        }}
                        className={`w-full py-2 font-game text-[9px] uppercase border-2 border-black text-center flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer transition-colors ${
                          isDone ? 'bg-[#1E1B4B] text-white/80 hover:bg-black/20' : 'bg-[#FFD60A] text-black font-semibold'
                        }`}
                      >
                        <Play className="w-2.5 h-2.5 fill-current" />
                        {isDone ? 'Review Module' : 'Launch Module ➔'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── PLAYGROUND TAB ─── */}
      {activeTab === 'playground' && (
        <div 
          className="p-4 transition-all duration-300 rounded"
          style={{
            background: activeZone === 'junior' ? '#1E1B4B' : '#0B0F19',
            border: '3px solid #000',
            boxShadow: '4px 4px 0px #000',
          }}
        >
          {/* JUNIOR COMPONENT PANELS */}
          {activeZone === 'junior' && (
            <div className="space-y-4">
              
              {/* 1. Persona Select */}
              <div>
                <span className="text-pink-400 font-pixel text-[5.5px] block mb-2 uppercase tracking-wide">
                  1. Pick Your Spell Companion (Persona)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(JUNIOR_PERSONAS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setJPersona(key)}
                      className={`p-2 border-2 border-black text-left flex items-start gap-1.5 rounded transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                        jPersona === key 
                          ? 'bg-purple-600 text-white border-white scale-[1.01]' 
                          : 'bg-black/20 text-white/60 hover:bg-black/35'
                      }`}
                    >
                      <span className="text-xl mt-0.5 flex-shrink-0">{value.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-game text-[9.5px] leading-tight truncate">{value.name}</div>
                        <div className="font-body text-[7.5px] text-white/45 leading-normal truncate mt-0.5">{value.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Topic Select */}
              <div>
                <span className="text-pink-400 font-pixel text-[5.5px] block mb-2 uppercase tracking-wide">
                  2. Select What to Explain
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(JUNIOR_TOPICS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setJTopic(key)}
                      className={`p-1 text-[8.5px] font-game border-2 border-black text-center shadow-[1.5px_1.5px_0px_#000] cursor-pointer rounded flex items-center justify-center min-h-[48px] leading-tight transition-all ${
                        jTopic === key 
                          ? 'bg-purple-600 text-white border-white' 
                          : 'bg-black/20 text-white/50 hover:bg-black/35'
                      }`}
                    >
                      {value.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Style / Tone Select */}
              <div>
                <span className="text-pink-400 font-pixel text-[5.5px] block mb-2 uppercase tracking-wide">
                  3. Select Style Mode
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(JUNIOR_TONES).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => setJTone(key)}
                      className={`p-1 text-[8.5px] font-game border-2 border-black text-center rounded min-h-[38px] leading-tight cursor-pointer shadow-[1.5px_1.5px_0px_#000] transition-all ${
                        jTone === key 
                          ? 'bg-purple-600 text-white border-white' 
                          : 'bg-black/20 text-white/50 hover:bg-black/35'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Secret Word Select */}
              <div>
                <span className="text-pink-400 font-pixel text-[5.5px] block mb-2 uppercase tracking-wide">
                  4. Pick a Secret Word 🤫
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {JUNIOR_SECRET_WORDS.map(word => (
                    <button
                      key={word}
                      onClick={() => setJSecretWord(word)}
                      className={`py-1 text-[8.5px] font-pixel uppercase border-2 border-black rounded cursor-pointer transition-all ${
                        jSecretWord === word 
                          ? 'bg-yellow-500 text-black border-white shadow-[1px_1px_0px_#000]' 
                          : 'bg-black/30 text-white/55 hover:bg-black/45'
                      }`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Chaos Level */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-pink-400 font-pixel text-[5.5px] uppercase tracking-wide">
                    5. AI Chaos Level (Creativity)
                  </span>
                  <span className="font-game text-[9px]" style={{ color: jChaos === 'wild' ? '#EC4899' : '#10B981' }}>
                    {jChaos === 'wild' ? 'Wild (Wacky & Creative) 🤪' : 'Calm (Smart & Predictable) 🎯'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setJChaos('focused')}
                    className={`py-2 font-game text-[9.5px] border-2 border-black flex justify-center items-center gap-1 cursor-pointer transition-all ${
                      jChaos === 'focused' ? 'bg-[#10B981] text-white border-white shadow-[1.5px_1.5px_0px_#000]' : 'bg-black/20 text-white/40'
                    }`}
                  >
                    🎯 Calm & Focused
                  </button>
                  <button
                    onClick={() => setJChaos('wild')}
                    className={`py-2 font-game text-[9.5px] border-2 border-black flex justify-center items-center gap-1 cursor-pointer transition-all ${
                      jChaos === 'wild' ? 'bg-[#EC4899] text-white border-white shadow-[1.5px_1.5px_0px_#000]' : 'bg-black/20 text-white/40'
                    }`}
                  >
                    🤪 Wild & Wacky
                  </button>
                </div>
              </div>

              {/* 6. Custom Modifier */}
              <div>
                <span className="text-pink-400 font-pixel text-[5.5px] block mb-1.5 uppercase tracking-wide">
                  6. Custom Magical Instruction (Optional)
                </span>
                <input
                  type="text"
                  value={jCustomInput}
                  onChange={e => setJCustomInput(e.target.value)}
                  placeholder="e.g. mention a flying pig, make it rhyme, translate to hindi words"
                  className="w-full pixel-input text-xs"
                  maxLength={60}
                />
              </div>
            </div>
          )}

          {/* INNOVATOR COMPONENT PANELS */}
          {activeZone === 'innovator' && (
            <div className="space-y-4 text-cyan-400">
              
              {/* 1. System Persona */}
              <div>
                <span className="text-cyan-400 font-pixel text-[5.5px] block mb-2 uppercase tracking-wide">
                  1. Configure System Role (Persona)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(INNOVATOR_PERSONAS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setIPersona(key)}
                      className={`p-2 border-2 text-left flex items-start gap-1.5 rounded transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                        iPersona === key 
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-400 scale-[1.01]' 
                          : 'bg-black/30 text-white/50 border-black/50 hover:bg-black/50'
                      }`}
                    >
                      <span className="text-xl mt-0.5 flex-shrink-0">{value.emoji}</span>
                      <div className="min-w-0">
                        <div className="font-game text-[9.5px] leading-tight truncate">{value.name}</div>
                        <div className="font-body text-[7.5px] leading-normal truncate mt-0.5 text-white/40">{value.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Topic Select */}
              <div>
                <span className="text-cyan-400 font-pixel text-[5.5px] block mb-2 uppercase tracking-wide">
                  2. Define Topic Payload
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(INNOVATOR_TOPICS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setITopic(key)}
                      className={`p-1 text-[8.5px] font-game border-2 text-center shadow-[1.5px_1.5px_0px_#000] cursor-pointer rounded flex items-center justify-center h-12 leading-tight transition-all ${
                        iTopic === key 
                          ? 'bg-cyan-950 text-cyan-300 border-cyan-400' 
                          : 'bg-black/30 text-white/50 border-black/50 hover:bg-black/50'
                      }`}
                    >
                      {value.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Formatting constraints */}
              <div>
                <span className="text-cyan-400 font-pixel text-[5.5px] block mb-2 uppercase tracking-wide">
                  3. Apply Output Formatting Constraint
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(INNOVATOR_CONSTRAINTS).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => setIConstraint(key)}
                      className={`p-1 text-[8.5px] font-game border-2 text-center rounded min-h-[38px] leading-tight cursor-pointer transition-all shadow-[1.5px_1.5px_0px_#000] ${
                        iConstraint === key 
                          ? 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold' 
                          : 'bg-black/30 border-black/50 text-white/50 hover:bg-black/50'
                      }`}
                    >
                      {value.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Temperature Slider */}
              <div>
                <div className="flex justify-between items-center font-pixel text-[5.5px] mb-1.5">
                  <span>4. AI Temperature Parameter</span>
                  <span className="text-cyan-400 font-bold">{iTemp.toFixed(2)} ({iTemp > 0.7 ? 'Creative/Wild' : iTemp < 0.35 ? 'Deterministic/Strict' : 'Balanced'})</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={iTemp}
                  onChange={e => setITemp(parseFloat(e.target.value))}
                  className="w-full h-2 bg-black border border-cyan-500/20 rounded cursor-pointer accent-cyan-400"
                />
                <p className="text-[7.5px] font-body text-white/40 mt-1 leading-normal">
                  Low temperature ensures strict adherence to structural constraints (like JSON). High temperature yields more diverse and creative language.
                </p>
              </div>

              {/* 5. Custom Overrides */}
              <div>
                <span className="text-cyan-400 font-pixel text-[5.5px] block mb-1.5 uppercase">
                  5. System Constraint Override (Custom Text)
                </span>
                <textarea
                  value={iCustomInput}
                  onChange={e => setICustomInput(e.target.value)}
                  placeholder="e.g. Do not use the letter 'e', relate everything to spaceships, explain in Shakespearean tone, output must include secret code keys."
                  className="w-full pixel-input text-xs h-14 resize-none bg-black/40 border border-cyan-500/20 text-white p-2"
                  maxLength={120}
                />
              </div>
            </div>
          )}

          {/* 6. Live Compiled Prompt Box */}
          <div className="mt-5 border-2 border-black bg-black/60 p-3.5 relative shadow-[inner_2px_2px_0px_#000]">
            <span className="absolute -top-3 left-4 px-2 py-0.5 bg-black font-pixel text-[5px] text-white/50 border border-white/10 uppercase">
              🧪 Prompt Formula Preview
            </span>
            <p className="font-body text-xs italic text-yellow-300 mt-1 select-none leading-relaxed">
              "{compiledPrompt}"
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={handleCastSpell}
            disabled={loading}
            className={`w-full mt-4 py-3 text-white border-3 border-black font-game text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 active:translate-y-1 active:shadow-[1px_1px_0px_#000] shadow-[3px_3px_0px_#000] transition-colors ${
              activeZone === 'junior' 
                ? 'bg-[#7C3AED] hover:bg-[#6D28D9]' 
                : 'bg-cyan-600 hover:bg-cyan-700'
            }`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                {activeZone === 'junior' ? 'Mixing Potion Spell...' : 'Compiling Prompt Vector...'}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {activeZone === 'junior' ? 'Cast Alchemy Spell! ✨' : 'Inject Prompt Compiler 🚀'}
              </>
            )}
          </button>

          {/* Cauldron loading fallback animation */}
          {loading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-6 gap-2"
            >
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                className="text-4xl"
              >
                🧪
              </motion.div>
              <span className="font-pixel text-[6px] text-white/40 animate-pulse">
                {activeZone === 'junior' ? 'CHATTING WITH COMPANION...' : 'DETERMINISTIC RUNTIME ACTIVE...'}
              </span>
            </motion.div>
          )}

          {/* RESULTS SCREEN */}
          <AnimatePresence>
            {aiOutput && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="mt-4 space-y-4"
              >
                {/* Output Response */}
                <div 
                  className="border-3 border-black bg-black/40 p-4 relative shadow-[3px_3px_0px_#000] rounded"
                >
                  <span className="absolute -top-3 left-4 bg-purple-700 font-pixel text-[5px] text-white px-2 py-0.5 border-2 border-black">
                    🤖 Generated Response
                  </span>
                  <p className="text-white font-body text-xs leading-relaxed italic mt-1 font-semibold whitespace-pre-wrap">
                    {aiOutput}
                  </p>
                </div>

                {/* Evaluation Panel */}
                {evaluation && (
                  <div
                    className="p-3.5 border-3 border-black relative rounded"
                    style={{
                      background: evaluation.score >= 80 ? 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)' : '#2C1212',
                      border: evaluation.score >= 80 ? '3px solid #10B981' : '3px solid #EF4444',
                      boxShadow: '4px 4px 0px #000',
                    }}
                  >
                    <span 
                      className="absolute -top-3 left-4 font-pixel text-[5px] text-white px-2 py-0.5 border-2 border-black"
                      style={{ background: evaluation.score >= 80 ? '#10B981' : '#EF4444' }}
                    >
                      🎓 ALCHEMY COMPILER REPORT
                    </span>

                    <div className="flex flex-col gap-3 mt-1 text-white">
                      <div className="flex items-center gap-4">
                        {/* Score Widget */}
                        <div className="text-center bg-black/35 p-2 border border-white/10 min-w-[90px] rounded">
                          <p className="font-pixel text-[4px] text-white/50 uppercase">PROMPT SCORE</p>
                          <p className="font-game text-xl text-yellow-400 font-bold">{evaluation.score}</p>
                          <p className="font-pixel text-[4px] text-white/30">out of 100</p>
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 font-pixel text-[5px]">
                            <span>Persona Match:</span>
                            <span className={evaluation.personaMatch ? 'text-green-400 font-bold' : 'text-red-400'}>
                              {evaluation.personaMatch ? '✓ PASSED' : 'x FAILED'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-pixel text-[5px]">
                            <span>Constraint Match:</span>
                            <span className={evaluation.constraintMatch ? 'text-green-400 font-bold' : 'text-red-400'}>
                              {evaluation.constraintMatch ? '✓ PASSED' : 'x FAILED'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Educational Insight explaining prompt engineering */}
                      <div className="border-t border-white/5 pt-2.5 space-y-2 text-xs">
                        <div>
                          <span className="font-pixel text-[5.5px] text-yellow-400 block mb-0.5">🎓 WHY DID IT GENERATE THIS?</span>
                          <p className="font-body text-white/90 leading-relaxed italic">
                            "{evaluation.feedback}"
                          </p>
                        </div>

                        <div className="bg-black/25 p-2.5 border border-white/5 rounded">
                          <span className="font-pixel text-[5px] text-cyan-400 block mb-1">🧪 VARIABLE DYNAMICS SUMMARY:</span>
                          <p className="font-body text-[10px] text-white/80 leading-relaxed">
                            {evaluation.chaosInsight}
                          </p>
                        </div>
                        
                        {evaluation.score >= 80 ? (
                          <p className="font-pixel text-[5px] text-green-400 font-bold animate-pulse uppercase">
                            🎉 GREAT PROMPT! You mastered this alchemy recipe! (+50 XP, +10 Coins)
                          </p>
                        ) : (
                          <p className="font-pixel text-[5px] text-red-300 font-bold">
                            Tip: Try adjusting your overrides or check if the exact constraints were fully followed.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Gamification popup */}
      <CelebrationOverlay
        show={showVictory}
        title="Spell Crafted!"
        subtitle="Excellent Prompt Alchemist!"
        xpGained={50}
        coinsGained={10}
        onDone={() => setShowVictory(false)}
      />
    </div>
  );
}
