import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { STORY_QUESTS } from '@/data/curriculum';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Star, ChevronRight, ArrowLeft } from 'lucide-react';
import { SpeakButton } from '@/components/ui/GameUI';

const QUEST_STEPS = {
  canteen: [
    { step: 'problem', title: 'The Problem 🍱', content: 'Every day, the school canteen cooks 200 meals. But only 150 students come. 50 meals get thrown away every single day — that\'s 250 meals wasted every week!', emoji: '🍱', question: 'What is the main problem here?' },
    { step: 'causes', title: 'Root Causes 🔍', content: 'The canteen manager has no way of knowing how many students will show up. Maybe there\'s a school trip. Maybe it\'s raining and fewer students come. No data = wrong amount of food!', emoji: '🔍', question: 'Why does the problem happen?' },
    { step: 'brainstorm', title: 'Brainstorm 💡', content: 'What if someone could COUNT students entering school every morning and tell the canteen? What if we tracked food waste every day? What if we checked weather AND school events before cooking?', emoji: '💡', question: 'How might we solve it?' },
    { step: 'ai', title: 'AI to the Rescue! 🤖', content: 'An AI system monitors entry gates, checks the school calendar for events and holidays, and analyses 2 years of food waste data. Every morning at 7AM, it tells the canteen exactly how many meals to cook — reducing waste by 80%!', emoji: '🤖', question: 'How does AI help?' },
    { step: 'hero', title: 'You\'re a Hero! 🏆', content: 'The school saves 200 meals per week, saving ₹15,000 every month! You\'ve completed the Canteen Detective mission. The food that was wasted now feeds underprivileged children in the neighbourhood!', emoji: '🎉', question: null },
  ],
  pet: [
    { step: 'problem', title: 'Missing Fluffy! 🐕', content: 'Raja\'s dog Fluffy ran away during Diwali. She has been missing for 3 days. Raja has put up posters everywhere, but the city is huge!', emoji: '🐕', question: 'What is the problem?' },
    { step: 'causes', title: 'The Challenge 🔍', content: 'The city has 5 million people and thousands of lanes. It\'s impossible to search everywhere manually. CCTV cameras capture footage but no one can watch hours of it!', emoji: '🔍', question: 'Why is it so hard to find Fluffy?' },
    { step: 'brainstorm', title: 'Brainstorm 💡', content: 'What if cameras could automatically scan for dogs that match Fluffy\'s appearance? What if neighbours could upload photos and AI matched them? What if chip scanners at vet clinics could alert us?', emoji: '💡', question: 'What ideas do you have?' },
    { step: 'ai', title: 'AI Pet Finder! 🤖', content: 'An AI app lets Raja upload Fluffy\'s photo. AI scans 500 CCTV cameras across the city for matching dogs — checking size, color, breed, and markings. Within 2 hours, Fluffy is spotted 3km away at a playground!', emoji: '🤖', question: 'How does AI solve this?' },
    { step: 'hero', title: 'Fluffy Found! 🎉', content: 'Raja and Fluffy are reunited! You\'ve completed the Pet Detective mission. This same technology is used to help find missing children around the world!', emoji: '🎉', question: null },
  ],
};

export default function StoryAdventures() {
  const navigate = useNavigate();
  const { profile, guestProfile, isGuest, updateProfile } = useAuth();
  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const completedQuests = profile?.completed_quests || [];

  const handleQuestComplete = async (questId: string, xpReward: number) => {
    if (!completedQuests.includes(questId)) {
      const currentProfileXP = isGuest ? (guestProfile?.xp ?? 0) : (profile?.xp ?? 0);
      await updateProfile({
        xp: currentProfileXP + xpReward,
        completed_quests: [...completedQuests, questId],
      });
    }
    setShowXP(true);
  };

  if (selectedQuest) {
    const steps = QUEST_STEPS[selectedQuest as keyof typeof QUEST_STEPS];
    const quest = STORY_QUESTS.find(q => q.id === selectedQuest)!;
    if (!steps) {
      return (
        <div className="min-h-full flex flex-col items-center justify-center p-6 gap-4 bg-pixel-darker">
          <div className="text-6xl">🚧</div>
          <div className="text-white font-game text-lg text-center">Coming Soon!</div>
          <div className="text-white/60 font-body text-sm text-center">This quest is being prepared. Check back soon!</div>
          <Button variant="ghost" onClick={() => setSelectedQuest(null)}>← Back to Map</Button>
        </div>
      );
    }

    const step = steps[currentStep];
    const isDone = currentStep >= steps.length - 1;

    return (
      <div className="min-h-full bg-pixel-darker flex flex-col">
        {showXP && <XPToast amount={quest.xpReward} reason={`${quest.title} complete!`} onDone={() => setShowXP(false)} />}

        {/* Quest Header */}
        <div className="bg-gradient-to-b from-primary/40 to-pixel-darker p-5">
          <button onClick={() => { setSelectedQuest(null); setCurrentStep(0); }} className="flex items-center gap-2 text-white/60 hover:text-white font-body text-sm mb-3">
            <ArrowLeft className="w-4 h-4" /> Quest Map
          </button>
          <h1 className="text-white font-game text-lg">{quest.title}</h1>
          <div className="flex gap-1 mt-3">
            {steps.map((_, i) => (
              <div key={i} className={`flex-1 h-2 border-2 border-black ${i <= currentStep ? 'bg-primary' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 p-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="space-y-5"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-7xl text-center"
              >
                {step.emoji}
              </motion.div>

              <div className="border-4 border-black bg-pixel-dark p-5 shadow-pixel">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-game text-base">{step.title}</h2>
                  <SpeakButton text={step.content} />
                </div>
                <p className="text-white/80 font-body text-sm leading-relaxed">{step.content}</p>
              </div>

              {step.question && (
                <div className="border-4 border-warning bg-warning/10 p-4">
                  <p className="text-warning font-game text-xs">🤔 Think about it:</p>
                  <p className="text-white font-body text-sm mt-1">{step.question}</p>
                </div>
              )}

              {isDone ? (
                <div className="space-y-3">
                  <div className="border-4 border-success bg-success/20 p-5 text-center">
                    <div className="text-5xl mb-2">🏆</div>
                    <div className="text-white font-game text-lg">Quest Complete!</div>
                    <div className="text-warning font-pixel text-sm mt-1">+{quest.xpReward} XP Earned!</div>
                  </div>
                  <Button variant="success" fullWidth onClick={() => { handleQuestComplete(quest.id, quest.xpReward); setSelectedQuest(null); setCurrentStep(0); }}>
                    Claim Reward & Return! 🗺️
                  </Button>
                </div>
              ) : (
                <Button variant="primary" fullWidth onClick={() => setCurrentStep(s => s + 1)}>
                  Continue the Story <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Quest Map
  return (
    <div className="min-h-full bg-pixel-darker pb-6">
      <div className="bg-gradient-to-b from-primary/40 to-pixel-darker p-5 pb-8">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">⚔️ Story Adventures</h1>
        <p className="text-white/60 font-body text-sm mt-1">Become an AI hero — solve real-world quests!</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {STORY_QUESTS.map((quest, i) => {
          const isDone = completedQuests.includes(quest.id);
          const isLocked = i > 1 && !completedQuests.includes(STORY_QUESTS[i - 1].id);
          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => !isLocked && setSelectedQuest(quest.id)}
              className={`border-4 border-black p-4 flex items-center gap-4 ${
                isDone ? 'bg-success/20 border-success cursor-pointer' :
                isLocked ? 'bg-white/5 opacity-50 cursor-not-allowed' :
                'bg-pixel-dark cursor-pointer shadow-pixel hover:bg-white/5'
              }`}
            >
              <div className={`w-16 h-16 border-4 border-black flex items-center justify-center text-3xl flex-shrink-0 ${
                isDone ? 'bg-success' : isLocked ? 'bg-gray-700' : 'bg-primary/30 animate-pulse-glow'
              }`}>
                {isLocked ? <Lock className="w-7 h-7 text-gray-400" /> : quest.emoji}
              </div>
              <div className="flex-1">
                <div className="text-white font-game text-sm">{quest.title}</div>
                <div className="text-white/60 font-body text-xs mt-1 line-clamp-2">{quest.description}</div>
                <div className="flex items-center gap-2 mt-1.5">
                  {[...Array(quest.difficulty)].map((_, d) => <Star key={d} className="w-3 h-3 text-warning" fill="#F59E0B" />)}
                  <span className="text-warning font-body text-xs">+{quest.xpReward} XP</span>
                </div>
              </div>
              {isDone && <Star className="w-6 h-6 text-warning flex-shrink-0" fill="#F59E0B" />}
              {!isDone && !isLocked && <ChevronRight className="w-5 h-5 text-white/40 flex-shrink-0" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
