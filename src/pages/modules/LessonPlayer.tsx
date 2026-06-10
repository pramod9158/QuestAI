import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CURRICULUM, type Lesson } from '@/data/curriculum';
import { SpeakButton } from '@/components/ui/GameUI';
import { XPToast } from '@/components/ui/GameUI';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, ArrowLeft, ExternalLink, Play, HelpCircle, Send, Award, FileText, ChevronRight } from 'lucide-react';
import { askLessonTutor, testPromptPlayground, evaluatePromptLab, evaluateMicroProjectSubmission } from '@/lib/gemini';
import TeachableMachineTrainer from '@/components/teachable/TeachableMachineTrainer';
import { MissionBriefing, AICompanion } from '@/components/ui/AICompanion';
import { VideoCheckpointOverlay, CheckpointTimeline } from '@/components/ui/VideoCheckpoint';
import { MissionComplete } from '@/components/ui/MissionComplete';

export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, guestProfile, isGuest, updateProfile } = useAuth();
  
  const lesson = CURRICULUM.find(l => l.id === id);
  
  const userZone = profile?.zone || 'junior';
  const completedIds = profile?.completed_lessons || [];
  const filtered = CURRICULUM.filter(l => l.zone === userZone || l.zone === 'both');
  const activeIndex = filtered.findIndex(l => !completedIds.includes(l.id));

  // Step state: 1: Briefing/Hook, 2: Watch/Checkpoints, 3: Lab, 4: Project
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [showXPToast, setShowXPToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // Step 2: Video Player & Checkpoints State
  const completed = lesson ? completedIds.includes(lesson.id) : false;
  const [videoFinished, setVideoFinished] = useState(completed);
  const [currentTime, setCurrentTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [completedCheckpoints, setCompletedCheckpoints] = useState<number[]>([]);
  const [activeCheckpoint, setActiveCheckpoint] = useState<{ cp: any; idx: number } | null>(null);
  const [checkpointXp, setCheckpointXp] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  // Step 3: AI Lab State
  const [labCompleted, setLabCompleted] = useState(false);

  // Step 4: Micro Project State
  const [projectText, setProjectText] = useState('');
  const [submittingProject, setSubmittingProject] = useState(false);
  const [projectFeedback, setProjectFeedback] = useState<{ score: number; feedback: string; passed: boolean } | null>(null);
  const [showCompleteOverlay, setShowCompleteOverlay] = useState(false);

  // AI Tutor Chat states
  const [tutorInput, setTutorInput] = useState('');
  const [tutorAnswer, setTutorAnswer] = useState<string | null>(null);
  const [askingTutor, setAskingTutor] = useState(false);

  // Set step state on load based on saved progress
  useEffect(() => {
    if (lesson) {
      if (completed) {
        setCurrentStep(2); // Go straight to play/content
        setVideoFinished(true);
        setLabCompleted(true);
      } else {
        const watchDone = localStorage.getItem(`lesson_${lesson.id}_watch`) === 'true';
        const labDone = localStorage.getItem(`lesson_${lesson.id}_lab`) === 'true';
        if (labDone) {
          setCurrentStep(4);
          setVideoFinished(true);
          setLabCompleted(true);
        } else if (watchDone) {
          setCurrentStep(3);
          setVideoFinished(true);
        } else {
          setCurrentStep(1);
        }
      }
    }
  }, [lesson, completed]);

  // Gating check
  useEffect(() => {
    if (lesson) {
      const lessonIndex = filtered.findIndex(l => l.id === lesson.id);
      if (lessonIndex === -1) {
        navigate('/learn', { replace: true });
        return;
      }
      if (activeIndex !== -1 && lessonIndex > activeIndex) {
        navigate(`/learn/${filtered[activeIndex].id}`, { replace: true });
      }
    }
  }, [lesson, activeIndex, filtered, navigate]);

  // YouTube API Player Initialization for Step 2
  useEffect(() => {
    if (currentStep !== 2 || !lesson) return;

    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }

    let checkInterval: ReturnType<typeof setInterval> | null = null;
    let timeTrackingInterval: ReturnType<typeof setInterval> | null = null;
    let maxTimeWatched = 0;

    const initPlayer = () => {
      if (iframeRef.current && (window as any).YT && (window as any).YT.Player) {
        try {
          playerRef.current = new (window as any).YT.Player(iframeRef.current, {
            events: {
              onReady: (event: any) => {
                if (event.target && typeof event.target.getDuration === 'function') {
                  setVideoDuration(event.target.getDuration());
                }
              },
              onStateChange: (event: any) => {
                if (event.data === (window as any).YT.PlayerState.ENDED) {
                  setVideoFinished(true);
                  localStorage.setItem(`lesson_${lesson.id}_watch`, 'true');
                }

                // Periodic check for checkpoints and skip prevention
                if (event.data === (window as any).YT.PlayerState.PLAYING) {
                  if (!timeTrackingInterval) {
                    timeTrackingInterval = setInterval(() => {
                      if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                        const currentTime = playerRef.current.getCurrentTime();
                        setCurrentTime(currentTime);

                        if (typeof playerRef.current.getDuration === 'function' && videoDuration === 0) {
                          setVideoDuration(playerRef.current.getDuration());
                        }

                        // Check checkpoints
                        lesson.videoCheckpoints?.forEach((cp, idx) => {
                          if (
                            Math.abs(currentTime - cp.timestampSeconds) < 1.5 &&
                            !completedCheckpoints.includes(idx) &&
                            !activeCheckpoint
                          ) {
                            playerRef.current.pauseVideo();
                            setActiveCheckpoint({ cp, idx });
                          }
                        });

                        // Prevent skipping forward
                        if (currentTime > maxTimeWatched + 2.5) {
                          playerRef.current.seekTo(maxTimeWatched, true);
                        } else if (currentTime > maxTimeWatched) {
                          maxTimeWatched = currentTime;
                        }
                      }
                    }, 500);
                  }
                } else {
                  if (timeTrackingInterval) {
                    clearInterval(timeTrackingInterval);
                    timeTrackingInterval = null;
                  }
                }
              },
            },
          });
          if (checkInterval) clearInterval(checkInterval);
        } catch (e) {
          console.warn('Failed to initialize YouTube Player:', e);
        }
      }
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      const prevCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
      checkInterval = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          initPlayer();
          if (checkInterval) clearInterval(checkInterval);
        }
      }, 500);
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
      if (timeTrackingInterval) clearInterval(timeTrackingInterval);
      if (playerRef.current && typeof playerRef.current.destroy === 'function') {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [currentStep, lesson?.id, completedCheckpoints, activeCheckpoint, videoDuration]);

  if (!lesson) return <div className="p-6 text-white font-body">Lesson not found.</div>;

  // Answer checkpoint callback
  const handleCheckpointAnswer = (correct: boolean, xpEarned: number) => {
    if (activeCheckpoint === null) return;
    
    if (correct && xpEarned > 0) {
      setCheckpointXp(prev => prev + xpEarned);
      setToastMessage(`Correct! +${xpEarned} XP`);
      setShowXPToast(true);
    }
    
    setCompletedCheckpoints(prev => [...prev, activeCheckpoint.idx]);
    
    // Play video again
    setTimeout(() => {
      setActiveCheckpoint(null);
      if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
        playerRef.current.playVideo();
      }
    }, 2000);
  };

  // Skip video for development/testing convenience
  const handleSkipVideo = () => {
    setVideoFinished(true);
    localStorage.setItem(`lesson_${lesson.id}_watch`, 'true');
    // Mark checkpoints as completed
    const allCps = lesson.videoCheckpoints?.map((_, idx) => idx) || [];
    setCompletedCheckpoints(allCps);
  };

  // Progress to step 3 (Lab)
  const proceedToLab = () => {
    setCurrentStep(3);
  };

  // Progress to step 4 (Project)
  const proceedToProject = () => {
    setCurrentStep(4);
  };

  // Submit Micro Project
  const handleSubmitProject = async () => {
    if (!projectText.trim() || submittingProject) return;
    setSubmittingProject(true);
    setProjectFeedback(null);

    try {
      const evaluation = await evaluateMicroProjectSubmission(
        lesson.microProject.title,
        lesson.microProject.description,
        projectText
      );

      setProjectFeedback(evaluation);

      if (evaluation.passed) {
        localStorage.setItem(`lesson_${lesson.id}_project`, 'true');
        // Commit full mission complete
        const currentXP = isGuest ? (guestProfile?.xp ?? 0) : (profile?.xp ?? 0);
        const currentCoins = isGuest ? (guestProfile?.coins ?? 0) : (profile?.coins ?? 0);
        const currentCompleted = profile?.completed_lessons || [];
        
        const newCompleted = [...currentCompleted, lesson.id];

        // XP Breakdown values
        const videoXpAward = lesson.xpReward + checkpointXp;
        const labXpAward = lesson.aiLab?.challenges?.reduce((sum, c) => sum + c.xpReward, 0) || 20;
        const projectXpAward = lesson.microProject?.xpReward || 15;
        const streakBonus = Math.round((videoXpAward + labXpAward + projectXpAward) * (profile?.current_streak && profile.current_streak >= 3 ? 0.2 : 0));
        const totalXpGained = videoXpAward + labXpAward + projectXpAward + streakBonus;
        const coinsGained = lesson.coinsReward || 10;

        await updateProfile({
          xp: currentXP + totalXpGained,
          coins: currentCoins + coinsGained,
          completed_lessons: newCompleted,
        });

        localStorage.setItem(`lesson_progress_${lesson.id}`, '100');
        localStorage.setItem(`lesson_completed_at_${lesson.id}`, new Date().toLocaleDateString());

        // Open completion modal
        setShowCompleteOverlay(true);
      }
    } catch (err) {
      console.error('Failed to evaluate project:', err);
    } finally {
      setSubmittingProject(false);
    }
  };

  // Continue back to Learn page / next lesson
  const handleFinalContinue = () => {
    setShowCompleteOverlay(false);
    const nextIncomplete = filtered.find(l => !completedIds.includes(l.id) && l.id !== lesson.id);
    if (nextIncomplete) {
      navigate(`/learn/${nextIncomplete.id}`, { replace: true });
    } else {
      navigate('/learn', { replace: true });
    }
  };

  const handleAskTutor = async () => {
    if (!tutorInput.trim() || askingTutor) return;
    setAskingTutor(true);
    try {
      const ans = await askLessonTutor(lesson.title, lesson.subtitle, tutorInput);
      setTutorAnswer(ans);
      setTutorInput('');
    } catch (err) {
      setTutorAnswer("Beep boop! I had trouble connecting. Try again!");
    } finally {
      setAskingTutor(false);
    }
  };

  // Render current step progress indicator bar
  const renderStepTracker = () => {
    return (
      <div className="bg-[#1E1B4B] border-b-3 border-black py-2.5 px-4 flex justify-between items-center font-pixel text-[8px]">
        <div className="flex items-center gap-1.5">
          <span className="text-[#FFD60A] text-xs">🤖</span>
          <span className="text-white uppercase tracking-wider font-game">Sparky's Mission Flow:</span>
        </div>
        <div className="flex gap-2">
          <span className={`${currentStep >= 1 ? 'text-[#FFD60A]' : 'text-white/30'}`}>Briefing</span>
          <span className="text-white/20">➔</span>
          <span className={`${currentStep >= 2 ? 'text-[#FFD60A]' : 'text-white/30'}`}>🎥 Watch</span>
          <span className="text-white/20">➔</span>
          <span className={`${currentStep >= 3 ? 'text-[#FFD60A]' : 'text-white/30'}`}>🧪 AI Lab</span>
          <span className="text-white/20">➔</span>
          <span className={`${currentStep >= 4 ? 'text-[#FFD60A]' : 'text-white/30'}`}>🛠️ Create</span>
        </div>
      </div>
    );
  };

  // Render specific interactive lab layouts
  const renderAILab = () => {
    switch (lesson.sandboxType) {
      case 'teachable':
        return (
          <div className="space-y-4">
            <div className="bg-[#1E1B4B] border-3 border-black p-3 flex gap-3 shadow-[3px_3px_0px_#000]">
              <AICompanion
                state="teaching"
                message="Train your own machine learning model to recognize faces or items using your camera!"
                size="sm"
              />
            </div>
            <TeachableMachineTrainer onComplete={() => {
              setLabCompleted(true);
              localStorage.setItem(`lesson_${lesson.id}_lab`, 'true');
            }} />
          </div>
        );
      case 'quickdraw':
        return (
          <div className="space-y-4">
            <div className="bg-[#1E1B4B] border-3 border-black p-3 flex gap-3 shadow-[3px_3px_0px_#000]">
              <AICompanion
                state="teaching"
                message="Draw items as fast as you can. Watch the neural network try to classify your doodles!"
                size="sm"
              />
            </div>
            <div className="flex flex-col border-4 border-black aspect-square max-h-[400px] bg-white overflow-hidden relative shadow-[4px_4px_0px_#000]">
              <iframe src="https://quickdraw.withgoogle.com" className="w-full h-full" title="Quick Draw" />
              <button 
                onClick={() => {
                  setLabCompleted(true);
                  localStorage.setItem(`lesson_${lesson.id}_lab`, 'true');
                }}
                className="absolute bottom-2 right-2 px-4 py-2 font-game text-[10px] bg-success border-2 border-black shadow-[2px_2px_0px_#000] text-white"
              >
                Lab Complete ✓
              </button>
            </div>
          </div>
        );
      case 'dragdrop':
        return (
          <div className="space-y-4">
            <div className="bg-[#1E1B4B] border-3 border-black p-3 flex gap-3 shadow-[3px_3px_0px_#000]">
              <AICompanion
                state="teaching"
                message="Sort the devices below. Decrypt which ones contain smart AI sensors vs dumb rule-based programming!"
                size="sm"
              />
            </div>
            <DragDropSandbox onComplete={() => {
              setLabCompleted(true);
              localStorage.setItem(`lesson_${lesson.id}_lab`, 'true');
            }} />
          </div>
        );
      case 'comic':
        return (
          <div className="space-y-4">
            <div className="bg-[#1E1B4B] border-3 border-black p-3 flex gap-3 shadow-[3px_3px_0px_#000]">
              <AICompanion
                state="teaching"
                message="Use prompts to construct a smart story adventure strip starring Sparky!"
                size="sm"
              />
            </div>
            <ComicSandbox onComplete={() => {
              setLabCompleted(true);
              localStorage.setItem(`lesson_${lesson.id}_lab`, 'true');
            }} />
          </div>
        );
      case 'playground':
        return (
          <div className="space-y-4">
            <div className="bg-[#1E1B4B] border-3 border-black p-3 flex gap-3 shadow-[3px_3px_0px_#000]">
              <AICompanion
                state="teaching"
                message="Write customized prompts to shape the AI's personality. Compare prompt modifications side-by-side!"
                size="sm"
              />
            </div>
            <PlaygroundSandbox onComplete={() => {
              setLabCompleted(true);
              localStorage.setItem(`lesson_${lesson.id}_lab`, 'true');
            }} />
          </div>
        );
      case 'detective':
        return (
          <div className="space-y-4">
            <div className="bg-[#1E1B4B] border-3 border-black p-3 flex gap-3 shadow-[3px_3px_0px_#000]">
              <AICompanion
                state="teaching"
                message="Analyze the social feed clues carefully. Spot the AI-generated deepfakes from the genuine news reports!"
                size="sm"
              />
            </div>
            <DetectiveSandbox onComplete={() => {
              setLabCompleted(true);
              localStorage.setItem(`lesson_${lesson.id}_lab`, 'true');
            }} />
          </div>
        );
      case 'quiz':
        return (
          <div className="space-y-4">
            <div className="bg-[#1E1B4B] border-3 border-black p-3 flex gap-3 shadow-[3px_3px_0px_#000]">
              <AICompanion
                state="teaching"
                message="Take the Quick-Quiz to test your intelligence metrics and lock in your score!"
                size="sm"
              />
            </div>
            <QuizSandbox 
              lessonId={lesson.id} 
              onComplete={() => {
                setLabCompleted(true);
                localStorage.setItem(`lesson_${lesson.id}_lab`, 'true');
              }} 
            />
          </div>
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="text-6xl animate-float">{lesson.emoji}</div>
            <p className="text-white/70 font-body text-sm max-w-xs">
              Sparky is cooking up a special sandbox! Click continue to unlock your final micro project.
            </p>
            <button
              onClick={() => {
                setLabCompleted(true);
                localStorage.setItem(`lesson_${lesson.id}_lab`, 'true');
              }}
              className="py-2.5 px-6 font-game text-xs text-black bg-[#FFD60A] border-3 border-black shadow-[3px_3px_0px_#000]"
            >
              Unlock Next Step ➔
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-full flex flex-col bg-[#0F0A2E] text-white">
      {showXPToast && (
        <XPToast 
          amount={checkpointXp} 
          reason={toastMessage} 
          onDone={() => setShowXPToast(false)} 
        />
      )}

      {/* Header Bar */}
      <div
        className="px-4 py-3 flex items-center gap-3 relative z-10"
        style={{ background: '#1E1B4B', borderBottom: '3px solid #000', boxShadow: '0 3px 0px #000' }}
      >
        <button onClick={() => navigate('/learn')} className="touch-target text-white/50 hover:text-white transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-game text-xs text-white uppercase tracking-wide truncate">{lesson.missionTitle || lesson.title}</div>
          <div className="text-white/45 font-pixel text-[6px] uppercase tracking-wider">{lesson.subtitle}</div>
        </div>
        <SpeakButton text={lesson.ttsIntro} />
      </div>

      {/* STEP 1: CURIOSITY HOOK BRIEFING */}
      {currentStep === 1 && (
        <MissionBriefing
          missionTitle={lesson.missionTitle || lesson.title}
          missionEmoji={lesson.missionEmoji || lesson.emoji}
          curiosityHook={lesson.curiosityHook || lesson.description}
          storyContext={lesson.storyContext || lesson.ttsIntro}
          onAccept={() => setCurrentStep(2)}
        />
      )}

      {/* STEP FLOW CONTAINER */}
      {currentStep > 1 && (
        <div className="flex-1 flex flex-col">
          {renderStepTracker()}

          {/* MAIN PLAYER/SANDBOX PANELS */}
          <div className="flex-1 flex flex-col md:flex-row p-4 gap-4">
            
            {/* STEP 2: VIDEO PANEL */}
            {currentStep === 2 && (
              <div className="flex-1 flex flex-col max-w-xl mx-auto w-full gap-4">
                <div
                  className="p-3 relative overflow-hidden"
                  style={{
                    background: '#1E1B4B',
                    border: '3px solid #000',
                    boxShadow: '4px 4px 0px #000',
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-game text-[9px] text-[#A78BFA] uppercase">🎥 Mission Briefing Broadcast</span>
                    <a
                      href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-pixel text-[6px] uppercase text-[#00C2FF]"
                    >
                      YT Mirror <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  {/* YouTube Iframe wrapper */}
                  <div className="relative aspect-video border-2 border-black bg-black overflow-hidden">
                    <iframe
                      ref={iframeRef}
                      src={`https://www.youtube.com/embed/${lesson.youtubeId}?enablejsapi=1&rel=0&modestbranding=1&color=white&iv_load_policy=3&autoplay=1`}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={lesson.title}
                    />

                    {/* Checkpoint Overlays */}
                    <AnimatePresence>
                      {activeCheckpoint && (
                        <VideoCheckpointOverlay
                          checkpoint={activeCheckpoint.cp}
                          onAnswer={handleCheckpointAnswer}
                          onDismiss={() => setActiveCheckpoint(null)}
                        />
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Checkpoint Timeline Dots */}
                  <CheckpointTimeline
                    checkpoints={lesson.videoCheckpoints || []}
                    completedIndices={completedCheckpoints}
                    videoDuration={videoDuration}
                    currentTime={currentTime}
                  />
                </div>

                {/* Video text & skip helper */}
                <div className="flex flex-col gap-2">
                  <p className="text-white/60 font-body text-xs italic bg-black/25 p-3 border-l-4 border-yellow-500">
                    "{lesson.ttsIntro}"
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={handleSkipVideo}
                      className="text-white/30 hover:text-white/60 font-pixel text-[6px] tracking-wider uppercase border border-white/10 px-2.5 py-1 cursor-pointer transition-colors"
                    >
                      ⚡ Dev Skip Video
                    </button>
                  </div>
                </div>

                {/* Continue button to Step 3 */}
                <div className="mt-auto pt-4 border-t border-white/5">
                  <Button
                    variant={videoFinished ? 'success' : 'primary'}
                    size="lg"
                    fullWidth
                    disabled={!videoFinished}
                    onClick={proceedToLab}
                    className="font-game text-xs uppercase"
                  >
                    {videoFinished ? '🧪 Proceed to AI Lab ➔' : '🔒 Finish Watching Video to Unlock Lab'}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: AI LAB PANEL */}
            {currentStep === 3 && (
              <div className="flex-1 flex flex-col max-w-xl mx-auto w-full gap-4">
                <div className="flex-1">
                  {renderAILab()}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <Button
                    variant={labCompleted ? 'success' : 'primary'}
                    size="lg"
                    fullWidth
                    disabled={!labCompleted}
                    onClick={proceedToProject}
                    className="font-game text-xs uppercase"
                  >
                    {labCompleted ? '🛠️ Design Micro Project ➔' : '🔒 Solve AI Lab to Unlock Project'}
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 4: MICRO PROJECT PANEL */}
            {currentStep === 4 && (
              <div className="flex-1 flex flex-col max-w-xl mx-auto w-full gap-4">
                <div 
                  className="p-4"
                  style={{
                    background: '#1E1B4B',
                    border: '3px solid #000',
                    boxShadow: '4px 4px 0px #000',
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Award className="w-5 h-5 text-[#FFD60A]" />
                    <h2 className="font-game text-sm text-[#FFD60A] uppercase tracking-wide">
                      Micro Project: {lesson.microProject?.title}
                    </h2>
                  </div>

                  <p className="font-body text-xs text-white/80 leading-relaxed mb-4">
                    {lesson.microProject?.description}
                  </p>

                  <div className="bg-black/35 p-3 mb-4 border border-white/10 flex items-start gap-2">
                    <FileText className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-pixel text-[6px] text-purple-400 uppercase tracking-wider block">Submit deliverable:</span>
                      <span className="font-body text-xs text-white/50">{lesson.microProject?.deliverable}</span>
                    </div>
                  </div>

                  {/* Submission field */}
                  <textarea
                    value={projectText}
                    onChange={e => setProjectText(e.target.value)}
                    placeholder="Describe your design or project details here..."
                    className="w-full pixel-input text-xs h-28 resize-none mb-3"
                    disabled={submittingProject || (projectFeedback?.passed ?? false)}
                  />

                  {/* Submit Button */}
                  {!(projectFeedback?.passed) && (
                    <Button
                      onClick={handleSubmitProject}
                      loading={submittingProject}
                      disabled={!projectText.trim() || submittingProject}
                      variant="primary"
                      fullWidth
                      className="font-game text-xs uppercase"
                    >
                      ⚡ Submit Project to Sparky
                    </Button>
                  )}

                  {/* Feedback Report */}
                  <AnimatePresence>
                    {projectFeedback && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-4 border-2 p-3 ${
                          projectFeedback.passed 
                            ? 'bg-[#10B981]/10 border-[#10B981]' 
                            : 'bg-[#EF4444]/10 border-[#EF4444]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-base">{projectFeedback.passed ? '✅' : '❌'}</span>
                          <span className="font-game text-[10px] text-white">Sparky's Evaluation:</span>
                          <span className="font-pixel text-[8px] ml-auto text-yellow-400">{projectFeedback.score}/100</span>
                        </div>
                        <p className="font-body text-xs text-white/90 leading-relaxed">{projectFeedback.feedback}</p>
                        
                        {projectFeedback.passed && (
                          <button
                            onClick={() => setShowCompleteOverlay(true)}
                            className="mt-3 w-full py-2.5 font-game text-[10px] uppercase text-black bg-[#FFD60A] border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                          >
                            🚀 Show Celebration!
                          </button>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* SIDEBAR CHAT (Ask AI Tutor) */}
            <div className="w-full md:w-80 flex flex-col gap-3">
              <div 
                className="p-3 flex-1"
                style={{
                  background: '#1E1B4B',
                  border: '3px solid #000',
                  boxShadow: '3px 3px 0px #000',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                  <h3 className="font-game text-xs text-white uppercase tracking-wider">Lesson Transmission</h3>
                </div>

                {tutorAnswer && (
                  <div className="mb-4 bg-black/35 border-l-4 border-[#7C3AED] p-3 text-left">
                    <span className="font-pixel text-[6px] text-primary block mb-1">🤖 SPARKY REPLIES</span>
                    <p className="text-white font-body text-[10px] leading-relaxed">{tutorAnswer}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tutorInput}
                    onChange={(e) => setTutorInput(e.target.value)}
                    placeholder="Ask Sparky a question..."
                    onKeyDown={(e) => e.key === 'Enter' && handleAskTutor()}
                    className="flex-1 pixel-input text-[10px] p-2"
                    disabled={askingTutor}
                  />
                  <button
                    onClick={handleAskTutor}
                    disabled={!tutorInput.trim() || askingTutor}
                    className="px-3 bg-purple-600 border border-black hover:bg-purple-700 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Quick curriculum index indicator */}
              <button
                onClick={() => navigate('/learn')}
                className="w-full text-center py-2.5 font-pixel text-[6px] uppercase text-white/30 hover:text-white/60 border border-white/5 cursor-pointer bg-black/10 transition-colors"
              >
                ← Return to adventure map
              </button>
            </div>

          </div>
        </div>
      )}

      {/* FINAL MISSION COMPLETE OVERLAY */}
      <MissionComplete
        show={showCompleteOverlay}
        lesson={lesson}
        nextLesson={filtered.find(l => !completedIds.includes(l.id) && l.id !== lesson.id)}
        rewards={{
          videoXp: lesson.xpReward + checkpointXp,
          labXp: lesson.aiLab?.challenges?.reduce((sum, c) => sum + c.xpReward, 0) || 20,
          projectXp: lesson.microProject?.xpReward || 15,
          streakBonus: Math.round((lesson.xpReward + checkpointXp + (lesson.aiLab?.challenges?.reduce((sum, c) => sum + c.xpReward, 0) || 20) + (lesson.microProject?.xpReward || 15)) * (profile?.current_streak && profile.current_streak >= 3 ? 0.2 : 0)),
          totalXp: (lesson.xpReward + checkpointXp + (lesson.aiLab?.challenges?.reduce((sum, c) => sum + c.xpReward, 0) || 20) + (lesson.microProject?.xpReward || 15)) + Math.round((lesson.xpReward + checkpointXp + (lesson.aiLab?.challenges?.reduce((sum, c) => sum + c.xpReward, 0) || 20) + (lesson.microProject?.xpReward || 15)) * (profile?.current_streak && profile.current_streak >= 3 ? 0.2 : 0)),
          coins: lesson.coinsReward || 10,
          badgeUnlocked: lesson.aiLab?.badgeId ? { name: lesson.aiLab.title, emoji: '🔬' } : undefined,
        }}
        onContinue={handleFinalContinue}
      />
    </div>
  );
}

// Inline Helper drag-drop "Smart vs Dumb" sorter
function DragDropSandbox({ onComplete }: { onComplete: () => void }) {
  const items = ['Smart Speaker', 'Pencil', 'Netflix', 'Toaster', 'Google Maps', 'Chair', 'Phone Camera', 'Notebook'];
  const answers: Record<string, boolean> = {
    'Smart Speaker': true, 'Pencil': false, 'Netflix': true, 'Toaster': false,
    'Google Maps': true, 'Chair': false, 'Phone Camera': true, 'Notebook': false,
  };
  const [sorted, setSorted] = useState<Record<string, 'smart' | 'dumb' | null>>({});
  const [score, setScore] = useState<number | null>(null);

  const handleSort = (item: string, category: 'smart' | 'dumb') => {
    setSorted(prev => ({ ...prev, [item]: category }));
  };

  const checkAnswers = () => {
    let correct = 0;
    Object.entries(sorted).forEach(([item, cat]) => {
      if ((answers[item] && cat === 'smart') || (!answers[item] && cat === 'dumb')) correct++;
    });
    setScore(correct);
    if (correct >= 6) {
      onComplete();
    }
  };

  return (
    <div className="p-3 border-3 border-black bg-[#16103A] shadow-[3px_3px_0px_#000]">
      <div className="text-white font-game text-[10px] text-center mb-3">Is it powered by smart AI?</div>
      <div className="grid grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
        {items.map(item => {
          const isSelectedSmart = sorted[item] === 'smart';
          const isSelectedDumb = sorted[item] === 'dumb';
          const hasSelected = isSelectedSmart || isSelectedDumb;
          const isRight = hasSelected && ((answers[item] && isSelectedSmart) || (!answers[item] && isSelectedDumb));
          
          let cardStyle = 'bg-black/30 border-white/5';
          if (score !== null) {
            cardStyle = isRight ? 'bg-[#10B981]/15 border-[#10B981]' : 'bg-[#EF4444]/15 border-[#EF4444] animate-shake';
          } else if (isSelectedSmart) {
            cardStyle = 'bg-[#10B981]/10 border-[#10B981]/40';
          } else if (isSelectedDumb) {
            cardStyle = 'bg-[#F59E0B]/10 border-[#F59E0B]/40';
          }

          return (
            <div key={item} className={`border-2 p-2 flex flex-col justify-between ${cardStyle}`}>
              <div className="text-white font-game text-[9px] text-center mb-2">{item}</div>
              <div className="flex gap-1">
                <button 
                  disabled={score !== null} 
                  onClick={() => handleSort(item, 'smart')} 
                  className={`flex-1 py-1 text-[8px] font-game border border-black cursor-pointer ${isSelectedSmart ? 'bg-[#10B981] text-white' : 'bg-black/20 text-white/50'}`}
                >
                  🤖 Yes
                </button>
                <button 
                  disabled={score !== null} 
                  onClick={() => handleSort(item, 'dumb')} 
                  className={`flex-1 py-1 text-[8px] font-game border border-black cursor-pointer ${isSelectedDumb ? 'bg-[#F59E0B] text-black font-bold' : 'bg-black/20 text-white/50'}`}
                >
                  📦 No
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {Object.keys(sorted).length === items.length && score === null && (
        <button onClick={checkAnswers} className="mt-3 w-full py-2.5 bg-purple-600 text-white font-game text-[10px] uppercase border-2 border-black cursor-pointer">
          Verify Sorting Decryption
        </button>
      )}

      {score !== null && (
        <div className={`mt-3 p-3 text-center border-2 ${score >= 6 ? 'border-[#10B981] bg-[#10B981]/10' : 'border-[#EF4444] bg-[#EF4444]/10'}`}>
          <div className="text-white font-game text-[10px]">{score}/{items.length} Correct!</div>
          <p className="font-body text-[10px] text-white/60 mt-0.5">
            {score >= 6 ? 'Nice observation metrics! Sandbox cracked.' : 'Some items mismatched! Try restarting to reach 6+ correct.'}
          </p>
          {score < 6 && (
            <button 
              onClick={() => { setSorted({}); setScore(null); }}
              className="mt-2 px-3 py-1 font-game text-[8px] bg-red-600 text-white border border-black cursor-pointer"
            >
              Restart Decryption
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Quiz sandbox inline helper
function QuizSandbox({ lessonId, onComplete }: { lessonId: string; onComplete: () => void }) {
  const questions = [
    { q: 'What helps YouTube recommend videos?', opts: ['Random choice', 'AI learns your preferences', 'Your location', 'Your age'], a: 1 },
    { q: 'How does face recognition work?', opts: ['Magic', 'By comparing pixel patterns', 'By reading your ID', 'By asking you'], a: 1 },
  ];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const handleAnswer = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (i === questions[current].a) setCorrect(c => c + 1);
    
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true);
        onComplete();
      } else {
        setCurrent(c => c + 1);
        setSelected(null);
      }
    }, 1200);
  };

  if (done) return (
    <div className="p-4 text-center border-2 border-[#10B981] bg-[#10B981]/10">
      <div className="text-2xl mb-1">🏆</div>
      <div className="text-white font-game text-xs">{correct}/{questions.length} Correct!</div>
    </div>
  );

  const q = questions[current];
  return (
    <div className="p-4 bg-[#1E1B4B] border-3 border-black shadow-[3px_3px_0px_#000] space-y-3">
      <div className="text-white/50 font-pixel text-[6px]">QUESTION {current + 1}/{questions.length}</div>
      <div className="text-white font-game text-xs leading-relaxed">{q.q}</div>
      <div className="space-y-2">
        {q.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className={`w-full border-2 border-black p-2.5 text-left font-body text-xs cursor-pointer ${
              selected === null ? 'bg-black/30 text-white/80 hover:bg-black/50' :
              i === q.a ? 'bg-[#10B981] text-white font-bold' :
              i === selected ? 'bg-[#EF4444] text-white font-bold' :
              'bg-black/20 text-white/30'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// Comic Builder sandbox inline helper
function ComicSandbox({ onComplete }: { onComplete: () => void }) {
  const [panels, setPanels] = useState<Array<{ hero: string; setting: string; speech: string }>>([
    { hero: '👽', setting: '🪐', speech: 'Hello Earthlings!' },
    { hero: '🤖', setting: '🌆', speech: 'AI makes logic fun!' },
    { hero: '🦸', setting: '🏫', speech: "Let's save the day!" },
  ]);
  const [activePanel, setActivePanel] = useState(0);
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit');

  const heroes = ['👽', '🤖', '🦸', '🐶', '🐯', '🦄'];
  const settings = ['🪐', '🌆', '🏫', '🌳', '🌾', '🌊'];

  const updateActivePanel = (key: 'hero' | 'setting' | 'speech', value: string) => {
    setPanels(prev => {
      const copy = [...prev];
      copy[activePanel] = { ...copy[activePanel], [key]: value };
      return copy;
    });
  };

  return (
    <div className="p-3 border-3 border-black bg-[#16103A] shadow-[3px_3px_0px_#000] space-y-3">
      {viewMode === 'edit' ? (
        <>
          <div className="text-white font-game text-[10px] text-center">Design Panel {activePanel + 1}/3</div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                onClick={() => setActivePanel(idx)}
                className={`flex-1 py-1 font-pixel text-[6px] border border-black cursor-pointer ${activePanel === idx ? 'bg-purple-600 text-white' : 'bg-black/20 text-white/50'}`}
              >
                Panel {idx + 1}
              </button>
            ))}
          </div>

          <div className="border border-black bg-black/40 p-3 flex flex-col items-center justify-center relative min-h-[120px] aspect-video">
            <div className="text-5xl opacity-10 absolute pointer-events-none select-none">{panels[activePanel].setting}</div>
            <div className="text-4xl z-10">{panels[activePanel].hero}</div>
            <div className="mt-2 bg-white text-black text-[9px] px-2 py-1 rounded border border-black z-10 max-w-[85%] truncate">{panels[activePanel].speech || '...'}</div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-white/40 font-pixel text-[5px] block">HERO:</span>
              <div className="flex gap-1">
                {heroes.map(h => (
                  <button key={h} onClick={() => updateActivePanel('hero', h)} className={`text-lg p-0.5 border flex-1 text-center cursor-pointer ${panels[activePanel].hero === h ? 'bg-purple-600' : 'bg-black/20'}`}>{h}</button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-white/40 font-pixel text-[5px] block">SETTING:</span>
              <div className="flex gap-1">
                {settings.map(s => (
                  <button key={s} onClick={() => updateActivePanel('setting', s)} className={`text-lg p-0.5 border flex-1 text-center cursor-pointer ${panels[activePanel].setting === s ? 'bg-purple-600' : 'bg-black/20'}`}>{s}</button>
                ))}
              </div>
            </div>
            <input
              type="text"
              value={panels[activePanel].speech}
              onChange={e => updateActivePanel('speech', e.target.value)}
              className="w-full pixel-input text-[10px] p-1.5"
              placeholder="Speech text..."
              maxLength={35}
            />
          </div>

          <button onClick={() => setViewMode('preview')} className="w-full py-2 bg-[#10B981] text-white font-game text-[10px] border border-black cursor-pointer">Preview Adventure Comic</button>
        </>
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {panels.map((p, idx) => (
              <div key={idx} className="border border-black bg-black/40 p-2 flex flex-col justify-between items-center aspect-[3/4] relative overflow-hidden">
                <span className="absolute top-0.5 left-1 font-pixel text-[5px] text-purple-400">#{idx+1}</span>
                <span className="text-3xl my-auto z-10">{p.hero}</span>
                <div className="bg-white text-black text-[7px] px-1 py-0.5 rounded truncate max-w-full z-10">{p.speech || '...'}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setViewMode('edit')} className="flex-1 py-1.5 bg-black/20 text-white border border-black font-game text-[9px] cursor-pointer">← Edit</button>
            <button onClick={() => { onComplete(); alert('Comic story compiled successfully!'); }} className="flex-1 py-1.5 bg-[#10B981] text-white border border-black font-game text-[9px] cursor-pointer">Compile Comic Story</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Prompt Engineering playground helper
function PlaygroundSandbox({ onComplete }: { onComplete: () => void }) {
  const [role, setRole] = useState('Emoji Translator');
  const [temperature, setTemperature] = useState(0.7);
  const [promptInput, setPromptInput] = useState('');
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [promptScore, setPromptScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const roles = [
    { name: 'Emoji Translator 🎭', system: "Translate prompt into emojis ONLY. No words." },
    { name: 'Pirate Captain 🏴‍☠️', system: "Speak like a 17th-century pirate captain in short sentences." },
    { name: 'Robotic Helper 🤖', system: "Speak robotically. End every sentence with BEEP or BOOP." }
  ];

  const handleSend = async () => {
    if (!promptInput.trim() || loading) return;
    setLoading(true);
    setAiOutput(null);
    setPromptScore(null);
    try {
      const selectedSystem = roles.find(r => r.name.includes(role))?.system || '';
      
      // 1. Generate text output
      const response = await testPromptPlayground(selectedSystem, promptInput, temperature);
      setAiOutput(response);

      // 2. Evaluate prompt using our new gemini evaluator helper
      const evalRes = await evaluatePromptLab(selectedSystem, promptInput);
      setPromptScore(evalRes.score);
      setFeedback(`${evalRes.feedback} Suggestion: ${evalRes.improvementTip}`);

      if (evalRes.score >= 60) {
        onComplete();
      }
    } catch (err) {
      setAiOutput('Connection timed out. Using fallback helper.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-3 border-3 border-black bg-[#16103A] shadow-[3px_3px_0px_#000] space-y-3">
      <div className="text-white font-game text-[10px] text-center">Prompt Design Sandbox</div>
      
      <div>
        <span className="text-white/40 font-pixel text-[5px] block mb-1">SYSTEM PERSONA:</span>
        <div className="grid grid-cols-3 gap-1">
          {roles.map(r => (
            <button 
              key={r.name} 
              onClick={() => setRole(r.name)} 
              className={`py-1 text-[8px] font-game border border-black cursor-pointer ${role === r.name ? 'bg-purple-600' : 'bg-black/35 text-white/50'}`}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <textarea
        value={promptInput}
        onChange={e => setPromptInput(e.target.value)}
        className="w-full pixel-input text-xs h-12 resize-none"
        placeholder="Type a message or instruction..."
        maxLength={75}
      />

      <button 
        onClick={handleSend}
        disabled={!promptInput.trim() || loading}
        className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-game text-[10px] border-2 border-black cursor-pointer"
      >
        {loading ? 'AI compiles...' : 'Send Prompt to AI 🚀'}
      </button>

      {aiOutput && (
        <div className="border border-black bg-black/40 p-2.5 space-y-1">
          <span className="font-pixel text-[5px] text-[#A78BFA] block">AI Output Response:</span>
          <p className="text-white font-body text-[10px] italic">"{aiOutput}"</p>
        </div>
      )}

      {promptScore !== null && (
        <div className={`border p-2 ${promptScore >= 60 ? 'border-[#10B981] bg-[#10B981]/5' : 'border-[#EF4444] bg-[#EF4444]/5'}`}>
          <div className="flex justify-between font-game text-[9px] text-white">
            <span>Prompt score:</span>
            <span className="text-yellow-400">{promptScore}/100</span>
          </div>
          <p className="font-body text-[9px] text-white/60 mt-1 leading-relaxed">{feedback}</p>
        </div>
      )}
    </div>
  );
}

// Deepfake Detective Sandbox inline helper
function DetectiveSandbox({ onComplete }: { onComplete: () => void }) {
  const challenges = [
    {
      id: 1,
      scenario: 'A video of a famous actor promoting a sketchy investment app on Instagram. The voice audio matches their voice, but their lips look slightly blurred and mismatch the syllables.',
      isDeepfake: true,
      explanation: 'Mismatched lip sync and fuzzy facial edges are dead giveaways for AI voice cloning and face-swapping deepfakes.',
      incorrectMsg: 'Why would a famous actor promote a sketchy app? Look closely at the lips — they look blurred and out of sync.',
    },
    {
      id: 2,
      scenario: 'A photo of the Pope wearing a stylish, oversized white puffer jacket that went viral on Twitter. If you zoom in, the background people have hands with 6 fingers and blurred glasses.',
      isDeepfake: true,
      explanation: 'AI image generators struggle with rendering realistic hands, often adding extra fingers or merging details in background objects.',
      incorrectMsg: 'Look at the hands of the people in the background — they have 6 fingers! This Pope puffer jacket photo is a famous AI deepfake.',
    },
  ];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<'deepfake' | 'real' | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const handleChoice = (choice: 'deepfake' | 'real') => {
    if (selected !== null) return;
    setSelected(choice);
    const challenge = challenges[current];
    const isCorrect = (choice === 'deepfake' && challenge.isDeepfake) || (choice === 'real' && !challenge.isDeepfake);
    
    if (isCorrect) {
      setScore(s => s + 1);
      setFeedback(`✅ CORRECT! ${challenge.explanation}`);
    } else {
      setFeedback(`❌ INCORRECT! ${challenge.incorrectMsg}`);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setFeedback(null);
    if (current + 1 >= challenges.length) {
      setDone(true);
      onComplete();
    } else {
      setCurrent(c => c + 1);
    }
  };

  if (done) return (
    <div className="p-4 text-center border-2 border-[#10B981] bg-[#10B981]/10">
      <div className="text-2xl mb-1">🕵️</div>
      <div className="text-white font-game text-xs">Analysis Complete! Score: {score}/{challenges.length}</div>
    </div>
  );

  const c = challenges[current];
  return (
    <div className="p-3 border-3 border-black bg-[#16103A] shadow-[3px_3px_0px_#000] space-y-3">
      <div className="flex justify-between items-center text-white/50 font-pixel text-[6px]">
        <span>CASE FILE {current + 1}/{challenges.length}</span>
        <span className="font-game text-orange-400">AI DETECTIVE</span>
      </div>

      <div className="border border-black bg-black/40 p-2.5">
        <p className="text-white font-body text-[10px] leading-relaxed">{c.scenario}</p>
      </div>

      {feedback ? (
        <div className="space-y-2">
          <p className="font-body text-[9px] text-white leading-relaxed">{feedback}</p>
          <button onClick={handleNext} className="w-full py-1.5 bg-purple-600 text-white font-game text-[9px] border border-black cursor-pointer">Next Case Clue →</button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button onClick={() => handleChoice('deepfake')} className="flex-1 py-2 bg-red-600 text-white font-game text-[9px] border border-black cursor-pointer">Deepfake 🎭</button>
          <button onClick={() => handleChoice('real')} className="flex-1 py-2 bg-emerald-600 text-white font-game text-[9px] border border-black cursor-pointer">Real Photo 📸</button>
        </div>
      )}
    </div>
  );
}
