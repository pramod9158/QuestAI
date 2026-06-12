import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { STORY_QUESTS } from '@/data/curriculum';
import { Button } from '@/components/ui/Button';
import { XPToast } from '@/components/ui/GameUI';
import { useAuth, useCurrentProfile } from '@/contexts/AuthContext';
import { Lock, Star, ChevronRight, ArrowLeft, Zap, HelpCircle } from 'lucide-react';
import { SpeakButton } from '@/components/ui/GameUI';
import { evaluateStoryReflection } from '@/lib/ai';
import { ActivityHelpModal } from '@/components/ui/ActivityHelpModal';
import { useFeedbackEngine } from '@/contexts/FeedbackEngineContext';

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
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const questParam = searchParams.get('quest');

  const { profile, guestProfile, isGuest, updateProfile } = useAuth();
  const currentProfile = useCurrentProfile();
  const userZone = currentProfile?.zone || 'junior';
  const { showSuccessCelebration } = useFeedbackEngine();

  // Filter quests by age zone
  const zoneQuests = STORY_QUESTS.filter(q => q.zone === userZone || q.zone === 'both');

  const [selectedQuest, setSelectedQuest] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showXP, setShowXP] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const completedQuests = profile?.completed_quests || [];

  React.useEffect(() => {
    if (questParam && QUEST_STEPS[questParam as keyof typeof QUEST_STEPS]) {
      setSelectedQuest(questParam);
    } else {
      setSelectedQuest(null);
    }
  }, [questParam]);

  // Interactive Reflection states
  const [reflectionText, setReflectionText] = useState('');
  const [evaluatingReflection, setEvaluatingReflection] = useState(false);
  const [reflectionFeedback, setReflectionFeedback] = useState<string | null>(null);
  const [reflectionBonusXp, setReflectionBonusXp] = useState(0);

  React.useEffect(() => {
    if (selectedQuest) {
      const steps = QUEST_STEPS[selectedQuest as keyof typeof QUEST_STEPS];
      if (steps) {
        const isDone = completedQuests.includes(selectedQuest);
        if (isDone) {
          localStorage.setItem(`play_progress_story_${selectedQuest}`, '100');
        } else {
          const percent = Math.max(10, Math.round((currentStep / (steps.length - 1)) * 100));
          localStorage.setItem(`play_progress_story_${selectedQuest}`, percent.toString());
        }
      }
    }
  }, [selectedQuest, currentStep, completedQuests]);

  const handleSubmitReflection = async () => {
    if (!selectedQuest || !reflectionText.trim() || evaluatingReflection) return;
    setEvaluatingReflection(true);

    const steps = QUEST_STEPS[selectedQuest as keyof typeof QUEST_STEPS];
    const step = steps[currentStep];
    const quest = STORY_QUESTS.find(q => q.id === selectedQuest)!;

    try {
      const res = await evaluateStoryReflection(quest.title, step.question || '', reflectionText);

      // Update XP
      const currentProfileXP = isGuest ? (guestProfile?.xp ?? 0) : (profile?.xp ?? 0);
      await updateProfile({
        xp: currentProfileXP + res.bonusXp
      });

      setReflectionFeedback(res.feedback);
      setReflectionBonusXp(res.bonusXp);
    } catch (err) {
      console.error('Failed to evaluate reflection:', err);
    } finally {
      setEvaluatingReflection(false);
    }
  };

  const handleNextStep = () => {
    setReflectionText('');
    setReflectionFeedback(null);
    setReflectionBonusXp(0);
    setCurrentStep(s => s + 1);
  };

  const handleDevSkip = () => {
    if (!selectedQuest) return;
    const qInfo = STORY_QUESTS.find(q => q.id === selectedQuest);
    if (!qInfo) return;
    const steps = QUEST_STEPS[selectedQuest as keyof typeof QUEST_STEPS] || [];
    setCurrentStep(steps.length - 1);
    handleQuestComplete(selectedQuest, qInfo.xpReward);
  };

  const handleQuestComplete = async (questId: string, xpReward: number) => {
    if (!completedQuests.includes(questId)) {
      const currentProfileXP = isGuest ? (guestProfile?.xp ?? 0) : (profile?.xp ?? 0);
      await updateProfile({
        xp: currentProfileXP + xpReward,
        completed_quests: [...completedQuests, questId],
      });
    }
    localStorage.setItem(`quests_${questId}`, 'true');
    localStorage.setItem(`play_progress_story_${questId}`, '100');
    setShowXP(true);
    
    const questInfo = STORY_QUESTS.find(q => q.id === questId);
    showSuccessCelebration({
      title: "QUEST COMPLETE!",
      subtitle: `Successfully finished quest: ${questInfo?.title || 'Story Quest'}!`,
      xpGained: xpReward,
    });
  };

  if (selectedQuest) {
    const steps = QUEST_STEPS[selectedQuest as keyof typeof QUEST_STEPS];
    const quest = STORY_QUESTS.find(q => q.id === selectedQuest)!;
    if (!steps) {
      return (
        <div className="min-h-full flex flex-col items-center justify-center p-6 gap-4 bg-game">
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
      <div className="min-h-full bg-game flex flex-col">
        {showXP && <XPToast amount={quest.xpReward} reason={`${quest.title} complete!`} onDone={() => setShowXP(false)} />}

        {/* Quest Header */}
      <div className="bg-surface-2 p-5">
          <button onClick={() => { navigate('/play/story'); setSelectedQuest(null); setCurrentStep(0); handleNextStep(); }} className="flex items-center gap-2 text-white/60 hover:text-white font-body text-sm mb-3">
            <ArrowLeft className="w-4 h-4" /> Quest Map
          </button>
          <h1 className="text-white font-game text-lg flex items-center gap-2 justify-between">
            <span className="flex items-center gap-2">
              <span>{quest.title}</span>
              <button
                onClick={() => setHelpOpen(true)}
                className="p-1 hover:text-purple-400 transition-colors cursor-pointer text-white/50"
                title="Show instructions"
              >
                <HelpCircle className="w-4.5 h-4.5" />
              </button>
            </span>
            <button
              onClick={handleDevSkip}
              className="text-white/30 hover:text-white/60 font-pixel text-[6px] tracking-wider uppercase border border-white/10 px-2 py-0.5 cursor-pointer transition-colors"
            >
              ⚡ Dev Skip Quest
            </button>
          </h1>
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

              <div className="border-4 border-black bg-surface p-5 shadow-pixel">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-white font-game text-base">{step.title}</h2>
                  <SpeakButton text={step.content} />
                </div>
                <p className="text-white/80 font-body text-sm leading-relaxed">{step.content}</p>
              </div>

              {step.question && (
                <div className="border-4 border-warning bg-warning/10 p-4 space-y-3">
                  <div>
                    <p className="text-warning font-game text-xs">🤔 Think about it:</p>
                    <p className="text-white font-body text-sm mt-1">{step.question}</p>
                  </div>
                  {reflectionFeedback ? (
                    <div className="border-2 border-black bg-black/40 p-3 relative mt-2 rounded">
                      <div className="absolute -top-2.5 left-3 bg-primary text-black font-game text-[8px] px-1.5 py-0.5 border border-black">
                        🤖 AI Tutor Feedback
                      </div>
                      <p className="text-white/95 font-body text-xs leading-relaxed mt-1">
                        {reflectionFeedback}
                      </p>
                      <div className="text-[10px] font-game text-warning mt-2 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-warning animate-bounce" /> +{reflectionBonusXp} XP Awarded!
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        value={reflectionText}
                        onChange={(e) => setReflectionText(e.target.value)}
                        placeholder="Write down your thoughts or suggestions here..."
                        className="pixel-input h-20 resize-none text-xs"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        fullWidth
                        loading={evaluatingReflection}
                        disabled={reflectionText.trim().length < 5}
                        onClick={handleSubmitReflection}
                      >
                        🧠 Submit Reflection for Feedback
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {isDone ? (
                <div className="space-y-3">
                  <div className="border-4 border-success bg-success/20 p-5 text-center">
                    <div className="text-5xl mb-2">🏆</div>
                    <div className="text-white font-game text-lg">Quest Complete!</div>
                    <div className="text-warning font-pixel text-sm mt-1">+{quest.xpReward} XP Earned!</div>
                  </div>
                  <Button variant="success" fullWidth onClick={() => { handleQuestComplete(quest.id, quest.xpReward); setSelectedQuest(null); setCurrentStep(0); handleNextStep(); navigate('/play'); }}>
                    Claim Reward & Return! 🗺️
                  </Button>
                </div>
              ) : (
                <Button variant="primary" fullWidth onClick={handleNextStep}>
                  Continue the Story <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <ActivityHelpModal
          isOpen={helpOpen}
          onClose={() => setHelpOpen(false)}
          title={quest?.title || "Story Adventures"}
          type="play"
          description={quest?.description || "Solve real-world problems and help local citizens by resolving interactive story quests."}
          steps={[
            "Choose a story quest to embark on (e.g. Canteen Waste or Lost Dog).",
            "Read each story section (problem, root cause, brainstorm, and AI solution).",
            "Formulate your thoughts and write your reflection answers to get feedback from the AI Tutor.",
            "Complete all steps to claim the mission rewards!"
          ]}
          rewards={quest ? `⚡ +${quest.xpReward} Quest completion XP + Bonus Reflection XP!` : ''}
        />
      </div>
    );
  }

  // Quest Map
  return (
    <div className="min-h-full bg-game pb-6">
      <div className="bg-surface-2 p-5 pb-8">
        <button onClick={() => navigate('/play')} className="flex items-center gap-2 text-white/60 hover:text-white mb-3 font-body text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Play
        </button>
        <h1 className="text-white font-game text-xl flex items-center gap-2">
          <span>⚔️ Story Adventures</span>
          <button
            onClick={() => setHelpOpen(true)}
            className="p-1 hover:text-purple-400 transition-colors cursor-pointer text-white/50"
            title="Show how to play"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </h1>
        <p className="text-white/60 font-body text-sm mt-1">
          {userZone === 'junior' ? 'Become an AI hero — solve fun everyday quests!' : 'Tackle complex real-world AI challenges!'}
        </p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {zoneQuests.map((quest, i) => {
          const isDone = completedQuests.includes(quest.id);
          const isLocked = false;
          return (
            <motion.div
              key={quest.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => {
                if (!isLocked) {
                  navigate(`/play/story?quest=${quest.id}`);
                }
              }}
              className={`border-4 border-black p-4 flex items-center gap-4 ${
                isDone ? 'bg-success/20 border-success cursor-pointer' :
                isLocked ? 'bg-white/5 opacity-50 cursor-not-allowed' :
                'bg-surface cursor-pointer shadow-pixel hover:bg-white/5'
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

      <ActivityHelpModal
        isOpen={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Story Adventures"
        type="play"
        description="Solve real-world problems and help local citizens by resolving interactive story quests."
        steps={[
          "Choose a story quest to embark on (e.g. Canteen Waste or Lost Dog).",
          "Read each story section (problem, root cause, brainstorm, and AI solution).",
          "Formulate your thoughts and write your reflection answers to get feedback from the AI Tutor.",
          "Complete all steps to claim the mission rewards!"
        ]}
        rewards="⚡ +30 to +40 Quest completion XP + Bonus Reflection XP!"
      />
    </div>
  );
}
