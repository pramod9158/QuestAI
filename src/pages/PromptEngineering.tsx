import React, { useState, useEffect, useRef } from 'react';
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
  BookOpen,
  Music
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useThemeStyles } from '@/lib/useThemeStyles';
import { ActivityHelpModal } from '@/components/ui/ActivityHelpModal';
import { useLearningCompanion } from '@/contexts/LearningCompanionContext';

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
  const { isDuolingo } = useTheme();
  const D = isDuolingo;
  const ts = useThemeStyles();

  const { speak, setOutfit } = useLearningCompanion();
  
  useEffect(() => {
    setOutfit('prompt-master');
    speak("Welcome to the Prompt Kingdom! I am Sparky, the Prompt Master. Let's write some magical AI spells! 🪄", {
      mood: 'excited',
      pose: 'dance',
      outfit: 'prompt-master',
      priority: 'high',
    });
    return () => setOutfit('default');
  }, [setOutfit]);
  
  const [activeTab, setActiveTab] = useState<'lessons' | 'playground' | 'music'>('lessons');
  const completedIds = profile?.completed_lessons || [];

  // Custom profile override for testing/swapping modes easily
  const [activeZone, setActiveZone] = useState<'junior' | 'innovator'>('junior');
  const [helpLesson, setHelpLesson] = useState<any>(null);

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
              : D
                ? 'bg-[#FFFFFF] text-[#777777] hover:bg-[#F7F7F7] hover:text-black border-black'
                : 'bg-[#1E1B4B]/80 text-white/50 hover:bg-[#1E1B4B] hover:text-white border-black'
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
              : D
                ? 'bg-[#FFFFFF] text-[#777777] hover:bg-[#F7F7F7] hover:text-black border-black'
                : 'bg-[#1E1B4B]/80 text-white/50 hover:bg-[#1E1B4B] hover:text-white border-black'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          🧪 Prompt Alchemy
        </button>
        <button
          onClick={() => setActiveTab('music')}
          className={`flex-1 py-2.5 font-game text-[10px] uppercase border-3 border-black shadow-[2.5px_2.5px_0px_#000] cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'music'
              ? 'bg-[#7C3AED] text-white border-purple-400'
              : D
                ? 'bg-[#FFFFFF] text-[#777777] hover:bg-[#F7F7F7] hover:text-black border-black'
                : 'bg-[#1E1B4B]/80 text-white/50 hover:bg-[#1E1B4B] hover:text-white border-black'
          }`}
        >
          <Music className="w-3.5 h-3.5" />
          🎵 AI Music
        </button>
      </div>

      {/* ─── LESSONS TAB ─── */}
      {activeTab === 'lessons' && (
        <div className="space-y-6">
          <div 
            className="p-4 text-center rounded transition-all duration-300"
            style={D ? {
              background: '#FFFFFF',
              border: '2px dashed #CBD5E1',
            } : {
              background: 'rgba(0, 0, 0, 0.2)',
              border: '2px dashed rgba(255, 255, 255, 0.1)',
            }}
          >
            <span className="text-3xl">📖</span>
            <h3 
              className="font-game text-sm uppercase tracking-wider mt-2"
              style={{ color: D ? '#3C3C3C' : '#FFFFFF' }}
            >
              Prompt Engineering Journey
            </h3>
            <p 
              className="font-body text-[10px] mt-1 max-w-sm mx-auto leading-relaxed"
              style={{ color: D ? '#777777' : 'rgba(255, 255, 255, 0.6)' }}
            >
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
                  className={`relative p-4 border-3 transition-all flex flex-col justify-between cursor-pointer rounded ${
                    D ? (
                      isDone ? 'bg-[#F1F5F9] border-[#CBD5E1] opacity-75' :
                      !isLocked ? 'bg-[#FFFFFF] border-black' :
                      'bg-[#F7F7F7] border-[#E0E0E0] opacity-60 cursor-not-allowed'
                    ) : (
                      isDone ? 'bg-[#1E1B4B]/60 border-black opacity-75' :
                      !isLocked ? 'bg-gradient-to-br from-[#1E1B4B] to-[#251E5C] border-[#FFD60A]' :
                      'bg-[#151036] border-black opacity-50 cursor-not-allowed'
                    )
                  }`}
                  style={{
                    boxShadow: !isLocked && !isDone 
                      ? (D ? '3px 3px 0px #7C3AED' : '3px 3px 0px #FFD60A') 
                      : '3px 3px 0px #000',
                  }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span 
                        className="font-pixel text-[5px] uppercase"
                        style={{ color: D ? '#7C3AED' : '#A78BFA' }}
                      >
                        Phase {lesson.phase} • Module {lesson.phase === 3 ? '3' : '8'}
                      </span>
                      {isDone ? (
                        <span 
                          className="font-pixel text-[5px] px-2 py-0.5 border"
                          style={D ? {
                            color: '#2E7D32',
                            backgroundColor: '#E8F5E9',
                            borderColor: '#C8E6C9',
                          } : {
                            color: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.15)',
                            borderColor: 'rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          CRUSHED
                        </span>
                      ) : isLocked ? (
                        <span 
                          className="font-pixel text-[5px] px-1.5 py-0.5 flex items-center gap-1 border"
                          style={D ? {
                            color: '#D32F2F',
                            backgroundColor: '#FFEBEE',
                            borderColor: '#FFCDD2',
                          } : {
                            color: '#F87171',
                            backgroundColor: 'rgba(127, 29, 29, 0.2)',
                            borderColor: 'rgba(127, 29, 29, 0.3)',
                          }}
                        >
                          <Lock className="w-2 h-2" /> LOCKED
                        </span>
                      ) : (
                        <span 
                          className="font-pixel text-[5px] px-1.5 py-0.5 animate-pulse border"
                          style={D ? {
                            color: '#7C3AED',
                            backgroundColor: '#F3E8FF',
                            borderColor: '#E9D5FF',
                          } : {
                            color: '#FBBF24',
                            backgroundColor: 'rgba(120, 53, 4, 0.2)',
                            borderColor: 'rgba(120, 53, 4, 0.3)',
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>

                     <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-2xl">{lesson.missionEmoji || lesson.emoji}</span>
                      <h3 
                        className="font-game text-xs leading-snug uppercase tracking-wide flex items-center gap-1.5"
                        style={{ color: D ? '#3C3C3C' : '#FFFFFF' }}
                      >
                        <span>{lesson.missionTitle || lesson.title}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setHelpLesson(lesson);
                          }}
                          className="p-1 hover:opacity-85 text-[#7C3AED] transition-opacity cursor-pointer"
                          title="Show how to complete this lesson"
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                        </button>
                      </h3>
                    </div>
                    <p 
                      className="font-body text-[10px] italic mt-2 leading-relaxed"
                      style={{ color: D ? '#777777' : '#C084FC' }}
                    >
                      "{lesson.curiosityHook || lesson.description}"
                    </p>
                  </div>

                  <div 
                    className="mt-4 pt-3 border-t space-y-3"
                    style={{ borderColor: D ? '#E2E8F0' : 'rgba(255, 255, 255, 0.05)' }}
                  >
                    {/* Step Progress Indicators */}
                    {!isLocked && (
                      <div className="grid grid-cols-3 gap-1 text-center text-[7px] font-pixel">
                        <div 
                          className="py-1 border"
                          style={D ? {
                            backgroundColor: watchDone || isDone ? '#E8F5E9' : '#F5F5F5',
                            color: watchDone || isDone ? '#2E7D32' : '#9E9E9E',
                            borderColor: watchDone || isDone ? '#C8E6C9' : '#E0E0E0',
                          } : {
                            backgroundColor: watchDone || isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                            color: watchDone || isDone ? '#10B981' : 'rgba(255, 255, 255, 0.3)',
                            borderColor: watchDone || isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          🎥 Watch {(watchDone || isDone) && '✓'}
                        </div>
                        <div 
                          className="py-1 border"
                          style={D ? {
                            backgroundColor: labDone || isDone ? '#E8F5E9' : '#F5F5F5',
                            color: labDone || isDone ? '#2E7D32' : '#9E9E9E',
                            borderColor: labDone || isDone ? '#C8E6C9' : '#E0E0E0',
                          } : {
                            backgroundColor: labDone || isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                            color: labDone || isDone ? '#10B981' : 'rgba(255, 255, 255, 0.3)',
                            borderColor: labDone || isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          🧪 Lab {(labDone || isDone) && '✓'}
                        </div>
                        <div 
                          className="py-1 border"
                          style={D ? {
                            backgroundColor: projectDone || isDone ? '#E8F5E9' : '#F5F5F5',
                            color: projectDone || isDone ? '#2E7D32' : '#9E9E9E',
                            borderColor: projectDone || isDone ? '#C8E6C9' : '#E0E0E0',
                          } : {
                            backgroundColor: projectDone || isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(0, 0, 0, 0.2)',
                            color: projectDone || isDone ? '#10B981' : 'rgba(255, 255, 255, 0.3)',
                            borderColor: projectDone || isDone ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                          }}
                        >
                          🛠️ Create {(projectDone || isDone) && '✓'}
                        </div>
                      </div>
                    )}

                    <div 
                      className="flex items-center justify-between font-pixel text-[5px]"
                      style={{ color: D ? '#777777' : 'rgba(255, 255, 255, 0.5)' }}
                    >
                      <span className="flex items-center gap-1">
                        ⏱️ {duration} min
                      </span>
                      <span className="flex items-center gap-0.5 text-[#FFD60A]">
                        ⚡ +{lesson.xpReward} XP
                      </span>
                    </div>

                    {isLocked ? (
                      <div 
                        className="w-full py-2 font-game text-[9px] uppercase border-2 border-black text-center flex items-center justify-center gap-1.5 cursor-not-allowed"
                        style={D ? {
                          backgroundColor: '#E0E0E0',
                          color: '#9E9E9E',
                        } : {
                          backgroundColor: '#1E293B',
                          color: 'rgba(255, 255, 255, 0.3)',
                        }}
                      >
                        <Lock className="w-3 h-3" /> Complete previous module to unlock
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/learn/${lesson.id}`);
                        }}
                        className={`w-full py-2 font-game text-[9px] uppercase border-2 border-black text-center flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000] cursor-pointer transition-colors ${
                          D ? (
                            isDone ? 'bg-[#F3E8FF] text-[#7C3AED] hover:bg-[#E9D5FF]' : 'bg-[#FFD60A] text-black font-semibold hover:bg-yellow-500'
                          ) : (
                            isDone ? 'bg-[#1E1B4B] text-white/80 hover:bg-black/20' : 'bg-[#FFD60A] text-black font-semibold hover:bg-yellow-500'
                          )
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
          className="p-4 transition-all duration-300"
          style={D ? {
            background: '#FFFFFF',
            border: '1.5px solid #E0E0E0',
            borderRadius: 16,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          } : {
            background: activeZone === 'junior' ? '#1E1B4B' : '#0B0F19',
            border: '3px solid #000',
            borderRadius: 4,
            boxShadow: '4px 4px 0px #000',
          }}
        >
          {/* JUNIOR COMPONENT PANELS */}
          {activeZone === 'junior' && (
            <div className="space-y-4">
              
              {/* 1. Persona Select */}
              <div>
                <span 
                  className="font-pixel text-[5.5px] block mb-2 uppercase tracking-wide"
                  style={{ color: D ? '#7C3AED' : '#EC4899' }}
                >
                  1. Pick Your Spell Companion (Persona)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(JUNIOR_PERSONAS).map(([key, value]) => {
                    const isSelected = jPersona === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setJPersona(key)}
                        className="p-2 text-left flex items-start gap-1.5 transition-all cursor-pointer"
                        style={D ? {
                          background: isSelected ? '#F3E8FF' : '#F7F7F7',
                          border: isSelected ? '2px solid #7C3AED' : '1.5px solid #E0E0E0',
                          borderRadius: 12,
                          color: isSelected ? '#7C3AED' : '#333333',
                        } : {
                          background: isSelected ? '#9333EA' : 'rgba(0, 0, 0, 0.2)',
                          border: isSelected ? '2px solid #FFFFFF' : '2px solid #000000',
                          borderRadius: 4,
                          boxShadow: '2px 2px 0px #000',
                          color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                        }}
                      >
                        <span className="text-xl mt-0.5 flex-shrink-0">{value.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-game text-[9.5px] leading-tight truncate">{value.name}</div>
                          <div 
                            className="font-body text-[7.5px] leading-normal truncate mt-0.5"
                            style={{ color: D ? (isSelected ? '#7C3AED' : '#666666') : (isSelected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)') }}
                          >
                            {value.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Topic Select */}
              <div>
                <span 
                  className="font-pixel text-[5.5px] block mb-2 uppercase tracking-wide"
                  style={{ color: D ? '#7C3AED' : '#EC4899' }}
                >
                  2. Select What to Explain
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(JUNIOR_TOPICS).map(([key, value]) => {
                    const isSelected = jTopic === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setJTopic(key)}
                        className="p-1 text-[8.5px] font-game text-center flex items-center justify-center min-h-[48px] leading-tight transition-all cursor-pointer"
                        style={D ? {
                          background: isSelected ? '#F3E8FF' : '#F7F7F7',
                          border: isSelected ? '2px solid #7C3AED' : '1.5px solid #E0E0E0',
                          borderRadius: 12,
                          color: isSelected ? '#7C3AED' : '#333333',
                        } : {
                          background: isSelected ? '#9333EA' : 'rgba(0, 0, 0, 0.2)',
                          border: isSelected ? '2px solid #FFFFFF' : '2px solid #000000',
                          borderRadius: 4,
                          boxShadow: '1.5px 1.5px 0px #000',
                          color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        {value.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Style / Tone Select */}
              <div>
                <span 
                  className="font-pixel text-[5.5px] block mb-2 uppercase tracking-wide"
                  style={{ color: D ? '#7C3AED' : '#EC4899' }}
                >
                  3. Select Style Mode
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(JUNIOR_TONES).map(([key, label]) => {
                    const isSelected = jTone === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setJTone(key)}
                        className="p-1 text-[8.5px] font-game text-center min-h-[38px] leading-tight cursor-pointer transition-all"
                        style={D ? {
                          background: isSelected ? '#F3E8FF' : '#F7F7F7',
                          border: isSelected ? '2px solid #7C3AED' : '1.5px solid #E0E0E0',
                          borderRadius: 12,
                          color: isSelected ? '#7C3AED' : '#333333',
                        } : {
                          background: isSelected ? '#9333EA' : 'rgba(0, 0, 0, 0.2)',
                          border: isSelected ? '2px solid #FFFFFF' : '2px solid #000000',
                          borderRadius: 4,
                          boxShadow: '1.5px 1.5px 0px #000',
                          color: isSelected ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Secret Word Select */}
              <div>
                <span 
                  className="font-pixel text-[5.5px] block mb-2 uppercase tracking-wide"
                  style={{ color: D ? '#7C3AED' : '#EC4899' }}
                >
                  4. Pick a Secret Word 🤫
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {JUNIOR_SECRET_WORDS.map(word => {
                    const isSelected = jSecretWord === word;
                    return (
                      <button
                        key={word}
                        onClick={() => setJSecretWord(word)}
                        className="py-1 text-[8.5px] font-pixel uppercase cursor-pointer transition-all"
                        style={D ? {
                          background: isSelected ? '#FFD60A' : '#F7F7F7',
                          border: isSelected ? '2px solid #FFB84D' : '1.5px solid #E0E0E0',
                          borderRadius: 8,
                          color: '#000000',
                        } : {
                          background: isSelected ? '#EAB308' : 'rgba(0, 0, 0, 0.3)',
                          border: isSelected ? '2px solid #FFFFFF' : '2px solid #000000',
                          borderRadius: 4,
                          boxShadow: isSelected ? '1px 1px 0px #000' : 'none',
                          color: isSelected ? '#000000' : 'rgba(255, 255, 255, 0.55)',
                        }}
                      >
                        {word}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Chaos Level */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span 
                    className="font-pixel text-[5.5px] uppercase tracking-wide"
                    style={{ color: D ? '#7C3AED' : '#EC4899' }}
                  >
                    5. AI Chaos Level (Creativity)
                  </span>
                  <span className="font-game text-[9px]" style={{ color: jChaos === 'wild' ? '#EC4899' : (D ? '#1EBC6B' : '#10B981') }}>
                    {jChaos === 'wild' ? 'Wild (Wacky & Creative) 🤪' : 'Calm (Smart & Predictable) 🎯'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setJChaos('focused')}
                    className="py-2 font-game text-[9.5px] flex justify-center items-center gap-1 cursor-pointer transition-all"
                    style={D ? {
                      background: jChaos === 'focused' ? '#5FCC5F' : '#F7F7F7',
                      border: jChaos === 'focused' ? '2px solid #5FCC5F' : '1.5px solid #E0E0E0',
                      borderRadius: 12,
                      color: jChaos === 'focused' ? '#FFFFFF' : '#666666',
                    } : {
                      background: jChaos === 'focused' ? '#10B981' : 'rgba(0, 0, 0, 0.2)',
                      border: jChaos === 'focused' ? '2px solid #FFFFFF' : '2px solid #000000',
                      borderRadius: 4,
                      boxShadow: jChaos === 'focused' ? '1.5px 1.5px 0px #000' : 'none',
                      color: jChaos === 'focused' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    🎯 Calm & Focused
                  </button>
                  <button
                    onClick={() => setJChaos('wild')}
                    className="py-2 font-game text-[9.5px] flex justify-center items-center gap-1 cursor-pointer transition-all"
                    style={D ? {
                      background: jChaos === 'wild' ? '#EC4899' : '#F7F7F7',
                      border: jChaos === 'wild' ? '2px solid #EC4899' : '1.5px solid #E0E0E0',
                      borderRadius: 12,
                      color: jChaos === 'wild' ? '#FFFFFF' : '#666666',
                    } : {
                      background: jChaos === 'wild' ? '#EC4899' : 'rgba(0, 0, 0, 0.2)',
                      border: jChaos === 'wild' ? '2px solid #FFFFFF' : '2px solid #000000',
                      borderRadius: 4,
                      boxShadow: jChaos === 'wild' ? '1.5px 1.5px 0px #000' : 'none',
                      color: jChaos === 'wild' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    🤪 Wild & Wacky
                  </button>
                </div>
              </div>

              {/* 6. Custom Modifier */}
              <div>
                <span 
                  className="font-pixel text-[5.5px] block mb-1.5 uppercase tracking-wide"
                  style={{ color: D ? '#7C3AED' : '#EC4899' }}
                >
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
            <div className="space-y-4">
              
              {/* 1. System Persona */}
              <div>
                <span 
                  className="font-pixel text-[5.5px] block mb-2 uppercase tracking-wide"
                  style={{ color: D ? '#0891B2' : '#22D3EE' }}
                >
                  1. Configure System Role (Persona)
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(INNOVATOR_PERSONAS).map(([key, value]) => {
                    const isSelected = iPersona === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setIPersona(key)}
                        className="p-2 border-2 text-left flex items-start gap-1.5 rounded transition-all cursor-pointer"
                        style={D ? {
                          background: isSelected ? '#ECFEFF' : '#F7F7F7',
                          border: isSelected ? '2px solid #0891B2' : '1.5px solid #E0E0E0',
                          borderRadius: 12,
                          color: isSelected ? '#0891B2' : '#333333',
                        } : {
                          background: isSelected ? '#083344' : 'rgba(0, 0, 0, 0.3)',
                          border: isSelected ? '2px solid #22D3EE' : '2px solid rgba(0,0,0,0.5)',
                          borderRadius: 4,
                          boxShadow: '2px 2px 0px #000',
                          color: isSelected ? '#22D3EE' : 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        <span className="text-xl mt-0.5 flex-shrink-0">{value.emoji}</span>
                        <div className="min-w-0">
                          <div className="font-game text-[9.5px] leading-tight truncate">{value.name}</div>
                          <div 
                            className="font-body text-[7.5px] leading-normal truncate mt-0.5"
                            style={{ color: D ? (isSelected ? '#0891B2' : '#666666') : (isSelected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)') }}
                          >
                            {value.desc}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Topic Select */}
              <div>
                <span 
                  className="font-pixel text-[5.5px] block mb-2 uppercase tracking-wide"
                  style={{ color: D ? '#0891B2' : '#22D3EE' }}
                >
                  2. Define Topic Payload
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(INNOVATOR_TOPICS).map(([key, value]) => {
                    const isSelected = iTopic === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setITopic(key)}
                        className="p-1 text-[8.5px] font-game text-center flex items-center justify-center h-12 leading-tight transition-all cursor-pointer"
                        style={D ? {
                          background: isSelected ? '#ECFEFF' : '#F7F7F7',
                          border: isSelected ? '2px solid #0891B2' : '1.5px solid #E0E0E0',
                          borderRadius: 12,
                          color: isSelected ? '#0891B2' : '#333333',
                        } : {
                          background: isSelected ? '#083344' : 'rgba(0, 0, 0, 0.3)',
                          border: isSelected ? '2px solid #22D3EE' : '2px solid rgba(0,0,0,0.5)',
                          borderRadius: 4,
                          boxShadow: '1.5px 1.5px 0px #000',
                          color: isSelected ? '#22D3EE' : 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        {value.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Formatting constraints */}
              <div>
                <span 
                  className="font-pixel text-[5.5px] block mb-2 uppercase tracking-wide"
                  style={{ color: D ? '#0891B2' : '#22D3EE' }}
                >
                  3. Apply Output Formatting Constraint
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(INNOVATOR_CONSTRAINTS).map(([key, value]) => {
                    const isSelected = iConstraint === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setIConstraint(key)}
                        className="p-1 text-[8.5px] font-game text-center min-h-[38px] leading-tight cursor-pointer transition-all"
                        style={D ? {
                          background: isSelected ? '#ECFEFF' : '#F7F7F7',
                          border: isSelected ? '2px solid #0891B2' : '1.5px solid #E0E0E0',
                          borderRadius: 12,
                          color: isSelected ? '#0891B2' : '#333333',
                        } : {
                          background: isSelected ? '#083344' : 'rgba(0, 0, 0, 0.3)',
                          border: isSelected ? '2px solid #22D3EE' : '2px solid rgba(0,0,0,0.5)',
                          borderRadius: 4,
                          boxShadow: '1.5px 1.5px 0px #000',
                          color: isSelected ? '#22D3EE' : 'rgba(255, 255, 255, 0.5)',
                        }}
                      >
                        {value.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Temperature Slider */}
              <div>
                <div className="flex justify-between items-center font-pixel text-[5.5px] mb-1.5">
                  <span style={{ color: D ? '#0891B2' : '#22D3EE' }}>4. AI Temperature Parameter</span>
                  <span style={{ color: D ? '#0891B2' : '#22D3EE' }} className="font-bold">{iTemp.toFixed(2)} ({iTemp > 0.7 ? 'Creative/Wild' : iTemp < 0.35 ? 'Deterministic/Strict' : 'Balanced'})</span>
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
                <p 
                  className="text-[7.5px] font-body mt-1 leading-normal"
                  style={{ color: D ? '#555555' : 'rgba(255,255,255,0.4)' }}
                >
                  Low temperature ensures strict adherence to structural constraints (like JSON). High temperature yields more diverse and creative language.
                </p>
              </div>

              {/* 5. Custom Overrides */}
              <div>
                <span 
                  className="font-pixel text-[5.5px] block mb-1.5 uppercase"
                  style={{ color: D ? '#0891B2' : '#22D3EE' }}
                >
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
          <div 
            className="mt-5 p-3.5 relative"
            style={D ? {
              background: '#F9F9F9',
              border: '1.5px solid #E0E0E0',
              borderRadius: 12,
            } : {
              background: 'rgba(0, 0, 0, 0.6)',
              border: '2px solid #000000',
              boxShadow: 'inset 2px 2px 0px #000',
            }}
          >
            <span 
              className="absolute -top-3 left-4 px-2 py-0.5 font-pixel text-[5px] uppercase"
              style={D ? {
                background: '#FFFFFF',
                color: '#888888',
                border: '1.5px solid #E0E0E0',
                borderRadius: 4,
              } : {
                background: '#000000',
                color: 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              🧪 Prompt Formula Preview
            </span>
            <p 
              className="font-body text-xs italic mt-1 select-none leading-relaxed"
              style={{ color: D ? '#7C3AED' : '#FFD60A' }}
            >
              "{compiledPrompt}"
            </p>
          </div>

          {/* Action button */}
          <button
            onClick={handleCastSpell}
            disabled={loading}
            className="w-full mt-4 py-3 font-game text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all text-white font-semibold"
            style={D ? {
              background: activeZone === 'junior' ? '#7C3AED' : '#0891B2',
              borderRadius: 12,
              boxShadow: '0 4px 0px rgba(0,0,0,0.15)',
              border: 'none',
            } : {
              background: activeZone === 'junior' ? '#7C3AED' : '#0891B2',
              border: '3px solid #000000',
              boxShadow: '3px 3px 0px #000000',
            }}
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
              <span 
                className="font-pixel text-[6px] animate-pulse"
                style={{ color: D ? '#888888' : 'rgba(255,255,255,0.4)' }}
              >
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
                  className="p-4 relative rounded"
                  style={D ? {
                    background: '#FFFFFF',
                    border: '1.5px solid #E0E0E0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  } : {
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '3px solid #000000',
                    boxShadow: '3px 3px 0px #000',
                  }}
                >
                  <span 
                    className="absolute -top-3 left-4 font-pixel text-[5px] text-white px-2 py-0.5"
                    style={D ? {
                      background: '#7C3AED',
                      borderRadius: 4,
                      border: '1px solid #7C3AED',
                    } : {
                      background: '#7C3AED',
                      border: '2px solid #000000',
                    }}
                  >
                    🤖 Generated Response
                  </span>
                  <p 
                    className="font-body text-xs leading-relaxed italic mt-1 font-semibold whitespace-pre-wrap"
                    style={{ color: D ? '#333333' : '#FFFFFF' }}
                  >
                    {aiOutput}
                  </p>
                </div>

                {/* Evaluation Panel */}
                {evaluation && (
                  <div
                    className="p-3.5 relative rounded"
                    style={D ? {
                      background: evaluation.score >= 80 ? '#F0FDF4' : '#FEF2F2',
                      border: evaluation.score >= 80 ? '1.5px solid #5FCC5F' : '1.5px solid #EF4444',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    } : {
                      background: evaluation.score >= 80 ? 'linear-gradient(135deg, #064E3B 0%, #022C22 100%)' : '#2C1212',
                      border: evaluation.score >= 80 ? '3px solid #10B981' : '3px solid #EF4444',
                      boxShadow: '4px 4px 0px #000',
                    }}
                  >
                    <span 
                      className="absolute -top-3 left-4 font-pixel text-[5px] text-white px-2 py-0.5"
                      style={D ? {
                        background: evaluation.score >= 80 ? '#5FCC5F' : '#EF4444',
                        borderRadius: 4,
                        border: evaluation.score >= 80 ? '1px solid #5FCC5F' : '1px solid #EF4444',
                      } : {
                        background: evaluation.score >= 80 ? '#10B981' : '#EF4444',
                        border: '2px solid #000000',
                      }}
                    >
                      🎓 ALCHEMY COMPILER REPORT
                    </span>

                    <div 
                      className="flex flex-col gap-3 mt-1"
                      style={{ color: D ? '#333333' : '#FFFFFF' }}
                    >
                      <div className="flex items-center gap-4">
                        {/* Score Widget */}
                        <div 
                          className="text-center p-2 min-w-[90px] rounded"
                          style={D ? {
                            background: '#FFFFFF',
                            border: '1.5px solid #E0E0E0',
                          } : {
                            background: 'rgba(0,0,0,0.35)',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          <p className="font-pixel text-[4px] text-gray-500 uppercase">PROMPT SCORE</p>
                          <p 
                            className="font-game text-xl font-bold"
                            style={{ color: D ? '#C8960C' : '#FFD60A' }}
                          >
                            {evaluation.score}
                          </p>
                          <p className="font-pixel text-[4px] text-gray-400">out of 100</p>
                        </div>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 font-pixel text-[5px]">
                            <span>Persona Match:</span>
                            <span className={evaluation.personaMatch ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {evaluation.personaMatch ? '✓ PASSED' : 'x FAILED'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-pixel text-[5px]">
                            <span>Constraint Match:</span>
                            <span className={evaluation.constraintMatch ? 'text-green-600 font-bold' : 'text-red-600'}>
                              {evaluation.constraintMatch ? '✓ PASSED' : 'x FAILED'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Educational Insight explaining prompt engineering */}
                      <div className="border-t border-gray-200/50 pt-2.5 space-y-2 text-xs">
                        <div>
                          <span 
                            className="font-pixel text-[5.5px] block mb-0.5"
                            style={{ color: D ? '#C8960C' : '#FFD60A' }}
                          >
                            🎓 WHY DID IT GENERATE THIS?
                          </span>
                          <p className="font-body leading-relaxed italic" style={{ color: D ? '#444444' : '#E2E8F0' }}>
                            "{evaluation.feedback}"
                          </p>
                        </div>

                        <div 
                          className="p-2.5 rounded"
                          style={D ? {
                            background: '#FFFFFF',
                            border: '1.5px solid #E0E0E0',
                          } : {
                            background: 'rgba(0,0,0,0.25)',
                            border: '1px solid rgba(255,255,255,0.05)',
                          }}
                        >
                          <span 
                            className="font-pixel text-[5px] block mb-1"
                            style={{ color: D ? '#0891B2' : '#22D3EE' }}
                          >
                            🧪 VARIABLE DYNAMICS SUMMARY:
                          </span>
                          <p className="font-body text-[10px] leading-relaxed" style={{ color: D ? '#555555' : 'rgba(255,255,255,0.8)' }}>
                            {evaluation.chaosInsight}
                          </p>
                        </div>
                        
                        {evaluation.score >= 80 ? (
                          <p className="font-pixel text-[5px] text-green-600 font-bold animate-pulse uppercase">
                            🎉 GREAT PROMPT! You mastered this alchemy recipe! (+50 XP, +10 Coins)
                          </p>
                        ) : (
                          <p className="font-pixel text-[5px] text-red-500 font-bold">
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

      {/* ─── MUSIC TAB ─── */}
      {activeTab === 'music' && <PromptsMusicStudio D={D} ts={ts} />}

      <ActivityHelpModal
        isOpen={!!helpLesson}
        onClose={() => setHelpLesson(null)}
        title={helpLesson?.missionTitle || helpLesson?.title || ''}
        type="prompt"
        description={helpLesson?.description || ''}
        steps={[
          "🎥 Watch: Play the video lesson and complete all interactive checkpoint questions.",
          `🧪 AI Lab: Perform the hands-on lab task: "${helpLesson?.aiLab?.title || ''}" (${helpLesson?.aiLab?.description || ''}).`,
          `🛠️ Create: Build and document your micro-project: "${helpLesson?.microProject?.title || ''}" (${helpLesson?.microProject?.description || ''}).`
        ]}
        deliverable={helpLesson?.microProject?.deliverable}
        rewards={`⚡ +${helpLesson?.xpReward || 0} XP, 🪙 +${helpLesson?.coinsReward || 0} Coins`}
      />

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

// ─── Prompts Music Studio (embedded in the Prompts section) ─────────────────
function PromptsMusicStudio({ D, ts }: { D: boolean; ts: any }) {
  const genres = ['Cyber Synthwave 🌌', '8-Bit Retro 👾', 'Lo-Fi Chill ☕'];
  const tempos = ['Relaxed (80 BPM) 🐢', 'Groovy (115 BPM) 🦊', 'Fast (140 BPM) ⚡'];
  const leads = ['Retro Synthesizer 🎹', 'Electric Lead Guitar 🎸', 'Square Wave Chip ⚡'];
  const drums = ['LinnDrum Classic 🥁', 'Acoustic Punchy 🥁', 'No Beats (Ambient) 🔇'];

  const [genre, setGenre] = useState('');
  const [tempo, setTempo] = useState('');
  const [lead, setLead] = useState('');
  const [drum, setDrum] = useState('');

  const [generating, setGenerating] = useState(false);
  const [composedTrack, setComposedTrack] = useState<string | null>(null);
  const [generationSteps] = useState<string[]>([
    'Setting tempo grid...',
    'Loading generative MIDI model...',
    'Composing synth melodies...',
    'Mixing drum backing pattern...',
    'Applying final EQ & rendering...',
  ]);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackTitle, setTrackTitle] = useState('');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const schedulerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeNodesRef = useRef<AudioNode[]>([]);

  const stopPlayback = () => {
    if (schedulerRef.current) {
      clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
    activeNodesRef.current.forEach(n => {
      try { (n as OscillatorNode).stop?.(); } catch (_) {}
      try { n.disconnect(); } catch (_) {}
    });
    activeNodesRef.current = [];
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => () => { stopPlayback(); }, []);

  const playTrack = () => {
    stopPlayback();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioCtxRef.current = ctx;

    const bpm = tempo.includes('80') ? 80 : tempo.includes('115') ? 115 : 140;
    const beatDur = 60 / bpm;
    const isRetro = genre.includes('8-Bit');
    const isChill = genre.includes('Lo-Fi');

    const waveType: OscillatorType = lead.includes('Square') ? 'square' : lead.includes('Guitar') ? 'sawtooth' : 'sine';
    const melodyPatterns = {
      synth:  [261.6, 329.6, 392.0, 493.9, 392.0, 329.6, 261.6, 220.0],
      retro:  [261.6, 261.6, 329.6, 0,     392.0, 0,     329.6, 261.6],
      chill:  [196.0, 220.0, 261.6, 293.7, 261.6, 220.0, 196.0, 164.8],
    };
    const melody = isChill ? melodyPatterns.chill : isRetro ? melodyPatterns.retro : melodyPatterns.synth;
    const chordNotes = isChill ? [[130.8, 164.8, 196.0], [146.8, 185.0, 220.0]] : [[130.8, 164.8, 196.0, 246.9], [110.0, 138.6, 164.8, 207.7]];

    const createReverb = () => {
      const conv = ctx.createConvolver();
      const len = ctx.sampleRate * 1.5;
      const buf = ctx.createBuffer(2, len, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
      }
      conv.buffer = buf;
      return conv;
    };

    const master = ctx.createGain();
    master.gain.value = 0.35;
    master.connect(ctx.destination);
    activeNodesRef.current.push(master);

    let effectNode: AudioNode = master;
    if (isChill) {
      const rev = createReverb();
      const dry = ctx.createGain(); dry.gain.value = 0.6;
      const wet = ctx.createGain(); wet.gain.value = 0.4;
      dry.connect(master); rev.connect(wet); wet.connect(master);
      const mid = ctx.createGain(); mid.gain.value = 1; mid.connect(dry); mid.connect(rev);
      const lpf = ctx.createBiquadFilter(); lpf.type = 'lowpass'; lpf.frequency.value = 2200;
      const preLpf = ctx.createGain(); preLpf.gain.value = 1; preLpf.connect(lpf); lpf.connect(mid);
      effectNode = preLpf;
      activeNodesRef.current.push(rev, dry, wet, mid, lpf, preLpf);
    }

    let beatIndex = 0;
    const scheduleNote = () => {
      const now = ctx.currentTime;
      const noteFreq = melody[beatIndex % melody.length];
      const step = beatIndex % 16;
      if (noteFreq > 0) {
        const osc = ctx.createOscillator(); const env = ctx.createGain();
        osc.type = isRetro ? 'square' : waveType; osc.frequency.value = isRetro ? noteFreq * 2 : noteFreq;
        env.gain.setValueAtTime(0, now); env.gain.linearRampToValueAtTime(0.6, now + 0.01); env.gain.exponentialRampToValueAtTime(0.001, now + beatDur * 0.8);
        osc.connect(env); env.connect(effectNode as AudioNode); osc.start(now); osc.stop(now + beatDur);
        activeNodesRef.current.push(osc, env);
      }
      if (step % 4 === 0) {
        const chord = chordNotes[(step / 4) % chordNotes.length];
        chord.forEach(freq => {
          const co = ctx.createOscillator(); const ce = ctx.createGain();
          co.type = isChill ? 'sine' : 'sawtooth'; co.frequency.value = freq;
          ce.gain.setValueAtTime(0, now); ce.gain.linearRampToValueAtTime(0.18, now + 0.05); ce.gain.exponentialRampToValueAtTime(0.001, now + beatDur * 3.5);
          co.connect(ce); ce.connect(effectNode as AudioNode); co.start(now); co.stop(now + beatDur * 4);
          activeNodesRef.current.push(co, ce);
        });
      }
      if (step % 2 === 0) {
        const bassFreq = melody[beatIndex % melody.length] / 2;
        const bo = ctx.createOscillator(); const be = ctx.createGain();
        bo.type = 'sine'; bo.frequency.value = bassFreq || 65.4;
        be.gain.setValueAtTime(0, now); be.gain.linearRampToValueAtTime(0.4, now + 0.02); be.gain.exponentialRampToValueAtTime(0.001, now + beatDur * 1.5);
        bo.connect(be); be.connect(effectNode as AudioNode); bo.start(now); bo.stop(now + beatDur * 2);
        activeNodesRef.current.push(bo, be);
      }
      if (!drum.includes('Ambient')) {
        const isHard = drum.includes('Acoustic');
        if (step === 0 || step === 8) {
          const kick = ctx.createOscillator(); const ke = ctx.createGain();
          kick.frequency.setValueAtTime(isHard ? 150 : 100, now); kick.frequency.exponentialRampToValueAtTime(0.001, now + 0.3);
          ke.gain.setValueAtTime(1.0, now); ke.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
          kick.connect(ke); ke.connect(master); kick.start(now); kick.stop(now + 0.35); activeNodesRef.current.push(kick, ke);
        }
        if (step === 4 || step === 12) {
          const snareBuf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
          const data = snareBuf.getChannelData(0); for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, isHard ? 1.5 : 3);
          const snare = ctx.createBufferSource(); snare.buffer = snareBuf; const se = ctx.createGain(); se.gain.value = isHard ? 0.7 : 0.45;
          snare.connect(se); se.connect(master); snare.start(now); activeNodesRef.current.push(snare, se);
        }
        const hatEvery = isChill ? 2 : 1;
        if (step % hatEvery === 0) {
          const hatBuf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
          const hd = hatBuf.getChannelData(0); for (let i = 0; i < hd.length; i++) hd[i] = Math.random() * 2 - 1;
          const hat = ctx.createBufferSource(); hat.buffer = hatBuf; const hpf = ctx.createBiquadFilter(); hpf.type = 'highpass'; hpf.frequency.value = 8000;
          const he = ctx.createGain(); he.gain.value = 0.2; hat.connect(hpf); hpf.connect(he); he.connect(master); hat.start(now); activeNodesRef.current.push(hat, hpf, he);
        }
      }
      beatIndex++;
    };
    scheduleNote(); schedulerRef.current = setInterval(scheduleNote, beatDur * 1000); setIsPlaying(true);
  };

  const startComposition = () => {
    if (!genre || !tempo || !lead || !drum) return;
    setGenerating(true); setComposedTrack(null); setActiveStep(0); stopPlayback();
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= 5) {
        clearInterval(interval); setGenerating(false);
        const titles = ['Neon Spark Explorer', 'Cyber Forest Groove', '8-Bit Quest Beats', 'Pixel Sunset Loop', 'Lofi AI Cozy Corner'];
        const title = titles[Math.floor(Math.random() * titles.length)];
        setTrackTitle(title); setComposedTrack(`✨ '${title}'`);
      } else setActiveStep(step);
    }, 800);
  };

  const buttonStyle = (active: boolean, color: string) => ({
    fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace',
    fontWeight: active ? 900 : 700,
    fontSize: D ? 11 : 5.5,
    background: active 
      ? (D ? color + '15' : color + '33') 
      : (D ? '#F8FAFC' : 'rgba(0, 0, 0, 0.25)'),
    border: `1.5px solid ${active ? color : (D ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)')}`,
    borderRadius: D ? 10 : 0,
    padding: '8px 4px',
    color: active ? color : (D ? '#64748B' : 'rgba(255, 255, 255, 0.5)'),
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Introduction Card */}
      <div style={D ? {
        background: 'linear-gradient(135deg, #FFF0FA, #F5F3FF)',
        border: '1.5px solid #EC4899',
        borderRadius: 14,
        padding: 16,
      } : {
        background: '#1E1B4B',
        border: '3px solid #000',
        padding: 12,
        boxShadow: '4px 4px 0px #000',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>🎵</span>
          <div>
            <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 16, color: '#EC4899' } : { fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: '#EC4899' }}>AI Music Studio</div>
            <div style={D ? { fontFamily: '"Nunito", sans-serif', fontSize: 12, color: '#64748B', marginTop: 2 } : { fontFamily: '"Fredoka One", cursive', fontSize: 5.5, color: 'rgba(255, 255, 255, 0.6)', marginTop: 2 }}>Pick prompt parameters → compose & play real music!</div>
          </div>
        </div>
      </div>

      {/* Editor & Control Panel */}
      {!composedTrack && !generating && (
        <div style={D ? {
          background: '#FFFFFF',
          border: '1.5px solid #E2E8F0',
          borderRadius: 14,
          padding: 16,
        } : {
          background: '#120E30',
          border: '2px solid #000',
          padding: 12,
        }} className="space-y-4">
          {[
            { label: '1. Genre Mood (AI Persona)', items: genres, val: genre, set: setGenre, color: '#EC4899' },
            { label: '2. Tempo Speed', items: tempos, val: tempo, set: setTempo, color: '#8B5CF6' },
            { label: '3. Lead Instrument', items: leads, val: lead, set: setLead, color: '#3B82F6' },
            { label: '4. Backing Beats', items: drums, val: drum, set: setDrum, color: '#10B981' },
          ].map(({ label, items, val, set, color }) => (
            <div key={label}>
              <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12, color, marginBottom: 6 } : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color, marginBottom: 4 }}>{label}</div>
              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: 6 }}>
                {items.map(item => (
                  <button key={item} onClick={() => set(item)} style={buttonStyle(val === item, color)}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {genre && tempo && lead && drum && (
            <button
              onClick={startComposition}
              style={{
                width: '100%',
                padding: '12px 0',
                background: D ? '#EC4899' : 'linear-gradient(90deg, #EC4899, #8B5CF6)',
                color: '#fff',
                border: 'none',
                borderRadius: D ? 12 : 0,
                fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace',
                fontWeight: 900,
                fontSize: D ? 13 : 5.5,
                cursor: 'pointer',
                boxShadow: D ? '0 4px 0px rgba(236, 72, 153, 0.3)' : '3px 3px 0px #000',
                marginTop: 8,
              }}
            >
              🎹 Generate AI Music Track!
            </button>
          )}
        </div>
      )}

      {/* Generating composition */}
      {generating && (
        <div style={D ? {
          background: '#FFF0FA',
          border: '1.5px solid #EC4899',
          borderRadius: 14,
          padding: 20,
          textAlign: 'center',
        } : {
          background: '#1E1B4B',
          border: '2px solid #EC4899',
          padding: 20,
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 4, height: 48, marginBottom: 12 }}>
            {[...Array(6)].map((_, i) => (
              <motion.div key={i} animate={{ height: [12, 48, 12] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} style={{ width: 6, background: '#EC4899', borderRadius: 3 }} />
            ))}
          </div>
          <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 13, color: '#EC4899' } : { fontFamily: '"Press Start 2P", monospace', fontSize: 5.5, color: '#EC4899' }}>
            🤖 {generationSteps[activeStep]}
          </div>
        </div>
      )}

      {/* Composition Result Ready */}
      {composedTrack && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={D ? {
            background: '#F0FFF9',
            border: '2px solid #10B981',
            borderRadius: 14,
            padding: 16,
            textAlign: 'center',
          } : {
            background: '#0A2E1B',
            border: '2px solid #10B981',
            padding: 16,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 32, marginBottom: 8 }}>🎵</div>
          <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 900, fontSize: 13, color: '#10B981' } : { fontFamily: '"Press Start 2P", monospace', fontSize: 5.5, color: '#10B981' }}>AI TRACK READY — HIT PLAY</div>
          <div style={D ? { fontFamily: '"Nunito", sans-serif', fontSize: 13, color: '#475569', marginTop: 4 } : { fontFamily: '"Fredoka One", cursive', fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 }}>{composedTrack}</div>
          
          {/* Visualizer bars */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 3, height: 32, margin: '12px 0' }}>
            {[...Array(12)].map((_, i) => (
              isPlaying ? (
                <motion.div key={i} animate={{ height: [4, 20 + (i % 3) * 6, 4] }} transition={{ duration: 0.35 + (i % 4) * 0.1, repeat: Infinity, delay: i * 0.06 }} style={{ width: 4, background: '#EC4899', borderRadius: 2 }} />
              ) : (
                <div key={i} style={{ width: 4, height: 6, background: '#10B981', opacity: 0.4, borderRadius: 2 }} />
              )
            ))}
          </div>

          {isPlaying && (
            <div style={D ? { fontFamily: '"Nunito", sans-serif', fontSize: 11, color: '#EC4899', fontWeight: 800, marginBottom: 8 } : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#EC4899', marginBottom: 8 }}>
              ▶ NOW PLAYING: {trackTitle.toUpperCase()}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={isPlaying ? stopPlayback : playTrack}
              style={{
                flex: 1,
                padding: '10px 0',
                background: isPlaying ? '#EF4444' : '#EC4899',
                color: '#fff',
                border: 'none',
                borderRadius: D ? 10 : 0,
                fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace',
                fontWeight: 900,
                fontSize: D ? 13 : 5.5,
                cursor: 'pointer',
              }}
            >
              {isPlaying ? '⏸ STOP' : '▶ PLAY TRACK'}
            </button>
            <button
              onClick={() => { stopPlayback(); setComposedTrack(null); setGenre(''); setTempo(''); setLead(''); setDrum(''); }}
              style={{
                padding: '10px 14px',
                background: D ? '#F1F5F9' : 'rgba(255, 255, 255, 0.1)',
                color: D ? '#475569' : 'rgba(255, 255, 255, 0.6)',
                border: D ? '1.5px solid #E2E8F0' : '1.5px solid rgba(255, 255, 255, 0.15)',
                borderRadius: D ? 10 : 0,
                fontFamily: D ? '"Nunito", sans-serif' : '"Press Start 2P", monospace',
                fontWeight: 700,
                fontSize: D ? 12 : 5.5,
                cursor: 'pointer',
              }}
            >
              🔄 Remix
            </button>
          </div>
        </motion.div>
      )}

      {/* How this teaches section */}
      <div style={D ? {
        background: '#FFFBEB',
        border: '1.5px solid #FCD34D',
        borderRadius: 12,
        padding: '10px 14px',
      } : {
        background: '#1A1500',
        border: '1.5px solid #FFB84D',
        padding: '8px 12px',
      }}>
        <div style={D ? { fontFamily: '"Nunito", sans-serif', fontWeight: 800, fontSize: 12, color: '#B45309' } : { fontFamily: '"Press Start 2P", monospace', fontSize: 5, color: '#FFD60A' }}>
          💡 HOW THIS TEACHES PROMPT ENGINEERING
        </div>
        <div style={D ? { fontFamily: '"Nunito", sans-serif', fontSize: 11, color: '#475569', marginTop: 4, lineHeight: 1.5 } : { fontFamily: '"Fredoka One", cursive', fontSize: 5.5, color: 'rgba(255, 255, 255, 0.7)', marginTop: 4, lineHeight: 1.5 }}>
          Each selection is a <strong>parameter in your prompt</strong>. Genre = AI personality, Tempo = rhythm, Instrument = output voice — just like system prompts control AI behavior!
        </div>
      </div>
    </motion.div>
  );
}
