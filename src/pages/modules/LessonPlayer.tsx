import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CURRICULUM } from '@/data/curriculum';
import { SpeakButton } from '@/components/ui/GameUI';
import { XPToast } from '@/components/ui/GameUI';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, ArrowLeft, ExternalLink } from 'lucide-react';
import { askLessonTutor, testPromptPlayground } from '@/lib/gemini';
import TeachableMachineTrainer from '@/components/teachable/TeachableMachineTrainer';

export default function LessonPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile, guestProfile, isGuest, updateProfile } = useAuth();
  const lesson = CURRICULUM.find(l => l.id === id);
  const [showXP, setShowXP] = useState(false);
  const [replayQuiz, setReplayQuiz] = useState(false);

  // AI Tutor Chat states
  const [tutorInput, setTutorInput] = useState('');
  const [tutorAnswer, setTutorAnswer] = useState<string | null>(null);
  const [askingTutor, setAskingTutor] = useState(false);

  const userZone = profile?.zone || 'junior';
  const completedIds = profile?.completed_lessons || [];
  const filtered = CURRICULUM.filter(l => l.zone === userZone || l.zone === 'both');
  const activeIndex = filtered.findIndex(l => !completedIds.includes(l.id));

  const completed = lesson ? (profile?.completed_lessons?.includes(lesson.id) ?? false) : false;
  const [videoFinished, setVideoFinished] = useState(completed);
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const handleCompleteRef = React.useRef<() => void>(() => {});

  React.useEffect(() => {
    setVideoFinished(completed);
  }, [completed, lesson?.id]);

  React.useEffect(() => {
    if (completed || !lesson) return;

    // Load YouTube API
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

    let player: any = null;
    let checkInterval: ReturnType<typeof setInterval> | null = null;
    let timeTrackingInterval: ReturnType<typeof setInterval> | null = null;
    let maxTimeWatched = 0;

    const initPlayer = () => {
      if (iframeRef.current && (window as any).YT && (window as any).YT.Player) {
        try {
          player = new (window as any).YT.Player(iframeRef.current, {
            events: {
              onStateChange: (event: any) => {
                if (event.data === (window as any).YT.PlayerState.ENDED) {
                  setVideoFinished(true);
                  if (handleCompleteRef.current) {
                    handleCompleteRef.current();
                  }
                }

                // Prevent skipping forward
                if (event.data === (window as any).YT.PlayerState.PLAYING) {
                  if (!timeTrackingInterval) {
                    timeTrackingInterval = setInterval(() => {
                      if (player && typeof player.getCurrentTime === 'function') {
                        const currentTime = player.getCurrentTime();
                        if (currentTime > maxTimeWatched + 2) {
                          player.seekTo(maxTimeWatched, true);
                        } else {
                          if (currentTime > maxTimeWatched) {
                            maxTimeWatched = currentTime;
                          }
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
      const previousCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
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
      if (player && typeof player.destroy === 'function') {
        try {
          player.destroy();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [lesson?.id, completed]);

  React.useEffect(() => {
    if (lesson) {
      const isDone = profile?.completed_lessons?.includes(lesson.id) ?? false;
      if (!isDone) {
        const existing = localStorage.getItem(`lesson_progress_${lesson.id}`);
        if (!existing || existing === '0') {
          localStorage.setItem(`lesson_progress_${lesson.id}`, '50');
        }
      } else {
        localStorage.setItem(`lesson_progress_${lesson.id}`, '100');
      }
    }
  }, [lesson, profile]);

  React.useEffect(() => {
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

  if (!lesson) return <div className="p-6 text-white font-body">Lesson not found.</div>;

  const handleComplete = async () => {
    if (!completed) {
      const currentProfileXP = isGuest ? (guestProfile?.xp ?? 0) : (profile?.xp ?? 0);
      const currentProfileCoins = isGuest ? (guestProfile?.coins ?? 0) : (profile?.coins ?? 0);
      const currentCompletedLessons = profile?.completed_lessons || [];
      
      const newCompleted = [...currentCompletedLessons, lesson.id];

      await updateProfile({
        xp: currentProfileXP + lesson.xpReward,
        coins: currentProfileCoins + (lesson.coinsReward || 0),
        completed_lessons: newCompleted,
      });
      localStorage.setItem(`lesson_progress_${lesson.id}`, '100');
      localStorage.setItem(`lesson_completed_at_${lesson.id}`, new Date().toLocaleDateString());
      setShowXP(true);

      setTimeout(() => {
        const nextIncomplete = filtered.find(l => !newCompleted.includes(l.id));
        if (nextIncomplete) {
          navigate(`/learn/${nextIncomplete.id}`, { replace: true });
        } else {
          navigate('/learn', { replace: true });
        }
      }, 2000);
    }
  };

  React.useEffect(() => {
    handleCompleteRef.current = handleComplete;
  }, [handleComplete]);

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

  const sandboxContent = () => {
    switch (lesson.sandboxType) {
      case 'teachable':
        return <TeachableMachineTrainer />;
      case 'quickdraw':
        return (
          <div className="flex flex-col h-full">
            <p className="text-white/70 font-body text-xs p-3 bg-success/20 border-b-2 border-black">
              🎨 Draw something and let AI guess what it is!
            </p>
            <iframe src="https://quickdraw.withgoogle.com" className="flex-1 w-full" title="Quick Draw" />
          </div>
        );
      case 'dragdrop':
        return <DragDropSandbox />;
      case 'comic':
        return <ComicSandbox />;
      case 'playground':
        return <PlaygroundSandbox />;
      case 'detective':
        return <DetectiveSandbox />;
      case 'quiz':
        if (completed && !replayQuiz) {
          return (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
              <div 
                className="w-16 h-16 bg-[#10B981]/25 border-4 border-[#10B981] flex items-center justify-center text-3xl animate-bounce"
                style={{ boxShadow: '4px 4px 0px #000' }}
              >
                🏆
              </div>
              <h4 className="font-game text-sm text-white">Quiz Completed!</h4>
              <p className="text-white/50 font-body text-xs max-w-[220px] leading-relaxed">
                You've already finished this lesson quiz!
              </p>
              <button
                onClick={() => setReplayQuiz(true)}
                className="btn-success font-game text-xs px-5 py-2.5 shadow-pixel active:translate-y-1"
              >
                Replay Quiz 🔄
              </button>
            </div>
          );
        }
        return <QuizSandbox lessonId={lesson.id} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
            <div className="text-6xl animate-float">{lesson.emoji}</div>
            <p className="text-white/70 font-body text-sm text-center">
              Interactive sandbox coming soon! Complete the video lesson to earn your XP.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      {showXP && <XPToast amount={lesson.xpReward} reason={`${lesson.title} complete!`} onDone={() => setShowXP(false)} />}

      {/* Header */}
      <div
        className="px-4 py-3 flex items-center gap-3"
        style={{ background: '#1E1B4B', borderBottom: '3px solid #000000', boxShadow: '0 4px 0px 0px #000000' }}
      >
        <button onClick={() => navigate('/learn')} className="touch-target text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-heading font-bold text-sm text-white truncate">{lesson.title}</div>
          <div className="text-white/40 font-body text-xs">{lesson.subtitle}</div>
        </div>
        <SpeakButton text={lesson.ttsIntro} />
      </div>

      {/* Split Layout: Video + Sandbox */}
      <div className="flex flex-col md:flex-row flex-1" style={{ minHeight: '60vh' }}>
        {/* Video Panel */}
        <div className="w-full md:w-1/2 flex flex-col" style={{ borderBottom: '1px solid rgba(127,90,240,0.2)' }}>
          <div
            className="p-2 flex items-center justify-between"
            style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-white/50 font-body text-xs">📺 Video Lesson</span>
            <a
              href={`https://www.youtube.com/watch?v=${lesson.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-body text-xs transition-opacity hover:opacity-80"
              style={{ color: '#00C2FF' }}
            >
              Open <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="relative" style={{ paddingBottom: '56.25%' }}>
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${lesson.youtubeId}?enablejsapi=1&rel=0&modestbranding=1&color=white&iv_load_policy=3`}
              className="absolute inset-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={lesson.title}
            />
          </div>
          {/* TTS Intro */}
          <div className="p-3" style={{ background: '#16103A', borderTop: '2px solid #000000' }}>
            <p className="text-white/60 font-body text-xs italic">"{lesson.ttsIntro}"</p>
          </div>
        </div>

        {/* Sandbox Panel */}
        <div className="w-full md:w-1/2 flex flex-col" style={{ minHeight: '300px' }}>
          <div
            className="p-2"
            style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="text-white/50 font-body text-xs">🎮 Try It Yourself</span>
          </div>
          <div className="flex-1 overflow-auto">
            {sandboxContent()}
          </div>
        </div>
      </div>

      {/* AI Lesson Tutor Chat */}
      <div className="p-4 bg-surface-2 border-t-4 border-black">
        <div className="border-4 border-black bg-surface p-4 shadow-pixel">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🤖</span>
            <h3 className="font-game text-sm text-white">Ask AI Tutor</h3>
          </div>
          
          {tutorAnswer && (
            <div className="mb-4 bg-black/20 border-l-4 border-[#7C3AED] p-3">
              <span className="font-pixel text-[6px] text-primary block mb-1">🤖 QUESTBOT AI</span>
              <p className="text-white font-body text-xs leading-relaxed">{tutorAnswer}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <input
              type="text"
              value={tutorInput}
              onChange={(e) => setTutorInput(e.target.value)}
              placeholder="e.g., How does machine learning find patterns?"
              onKeyDown={(e) => e.key === 'Enter' && handleAskTutor()}
              className="flex-1 pixel-input text-xs"
              disabled={askingTutor}
            />
            <Button
              onClick={handleAskTutor}
              loading={askingTutor}
              disabled={!tutorInput.trim()}
              size="sm"
            >
              Ask
            </Button>
          </div>
        </div>
      </div>

      {/* Complete Button */}
      <div
        className="p-4"
        style={{ background: '#16103A', borderTop: '3px solid #000000', boxShadow: '0 -4px 0px 0px #000000' }}
      >
        {completed ? (
          <div
            className="flex items-center justify-center gap-2 py-4 rounded-2xl"
            style={{ background: '#10B981', border: '3px solid #000000', boxShadow: '3px 3px 0px 0px #000000' }}
          >
            <CheckCircle className="w-6 h-6 text-white" />
            <span className="font-heading font-bold text-sm text-white">Lesson Complete! +{lesson.xpReward} XP earned!</span>
          </div>
        ) : (
          <Button 
            variant={videoFinished ? "success" : "primary"} 
            size="lg" 
            fullWidth 
            onClick={handleComplete}
            disabled={!videoFinished}
            className={!videoFinished ? "opacity-50 cursor-not-allowed" : ""}
          >
            {videoFinished 
              ? `✅ Mark as Complete (+${lesson.xpReward} XP)`
              : `🔒 Watch the video lesson to unlock completion (+${lesson.xpReward} XP)`
            }
          </Button>
        )}
        <button
          onClick={() => navigate('/learn')}
          className="w-full text-center text-white/35 font-body text-xs mt-2 hover:text-white/60 transition-colors"
        >
          ← Back to curriculum
        </button>
      </div>
    </div>
  );
}

// Embedded drag-drop "Smart vs Dumb" sorter
function DragDropSandbox() {
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
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-white font-game text-sm text-center">Sort: Smart AI vs Not Smart?</div>
      <div className="grid grid-cols-2 gap-3">
        {items.map(item => {
          const isSelectedSmart = sorted[item] === 'smart';
          const isSelectedDumb = sorted[item] === 'dumb';
          const hasSelected = isSelectedSmart || isSelectedDumb;
          
          const isRight = hasSelected && (
            (answers[item] && isSelectedSmart) || 
            (!answers[item] && isSelectedDumb)
          );
          
          // Card styles
          let cardStyle = 'bg-surface border-black';
          if (score !== null) {
            cardStyle = isRight ? 'bg-success/20 border-success' : 'bg-pixel-red/25 border-pixel-red animate-shake';
          } else {
            if (isSelectedSmart) cardStyle = 'bg-success/25 border-success';
            else if (isSelectedDumb) cardStyle = 'bg-warning/25 border-warning';
          }
          
          // Smart button styles
          let smartBtnStyle = 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white';
          if (isSelectedSmart) {
            if (score !== null) {
              smartBtnStyle = isRight ? 'bg-success text-white shadow-pixel-sm' : 'bg-pixel-red text-white shadow-pixel-sm';
            } else {
              smartBtnStyle = 'bg-success text-white shadow-pixel-sm';
            }
          }
          
          // Dumb button styles
          let dumbBtnStyle = 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white';
          if (isSelectedDumb) {
            if (score !== null) {
              dumbBtnStyle = isRight ? 'bg-success text-white shadow-pixel-sm' : 'bg-pixel-red text-white shadow-pixel-sm';
            } else {
              dumbBtnStyle = 'bg-warning text-black shadow-pixel-sm';
            }
          }

          return (
            <div key={item} className={`border-4 p-3 transition-all ${cardStyle}`}>
              <div className="text-white font-game text-xs text-center mb-2.5">{item}</div>
              <div className="flex gap-2">
                <button 
                  disabled={score !== null} 
                  onClick={() => handleSort(item, 'smart')} 
                  className={`flex-1 border-2 border-black py-1 text-[10px] font-game disabled:opacity-90 disabled:cursor-not-allowed ${smartBtnStyle}`}
                >
                  🤖 Smart
                </button>
                <button 
                  disabled={score !== null} 
                  onClick={() => handleSort(item, 'dumb')} 
                  className={`flex-1 border-2 border-black py-1 text-[10px] font-game disabled:opacity-90 disabled:cursor-not-allowed ${dumbBtnStyle}`}
                >
                  📦 Not
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {Object.keys(sorted).length === items.length && score === null && (
        <button onClick={checkAnswers} className="w-full border-4 border-black bg-primary py-3 text-white font-game text-sm">
          CHECK MY ANSWERS!
        </button>
      )}
      {score !== null && (
        <div className="border-4 border-success bg-success/20 p-4 text-center">
          <div className="text-3xl mb-2">{score >= 6 ? '🏆' : score >= 4 ? '⭐' : '💪'}</div>
          <div className="text-white font-game text-sm">{score}/{items.length} Correct!</div>
          <div className="text-white/70 font-body text-xs mt-1">{score >= 6 ? 'Amazing! You\'re an AI expert!' : 'Good try! Keep learning!'}</div>
        </div>
      )}
    </div>
  );
}

// Quick inline quiz
function QuizSandbox({ lessonId }: { lessonId: string }) {
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
      if (current + 1 >= questions.length) setDone(true);
      else { setCurrent(c => c + 1); setSelected(null); }
    }, 1200);
  };

  if (done) return (
    <div className="flex flex-col items-center justify-center h-full p-6 gap-4">
      <div className="text-5xl">{correct === questions.length ? '🏆' : '⭐'}</div>
      <div className="text-white font-game text-sm">{correct}/{questions.length} Correct!</div>
    </div>
  );

  const q = questions[current];
  return (
    <div className="p-4 space-y-4">
      <div className="text-white/60 font-body text-xs">Question {current + 1}/{questions.length}</div>
      <div className="text-white font-game text-sm leading-relaxed">{q.q}</div>
      <div className="space-y-2">
        {q.opts.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className={`w-full border-4 border-black p-3 text-left font-body text-sm transition-all ${
              selected === null ? 'bg-surface text-white hover:bg-white/10' :
              i === q.a ? 'bg-success text-white' :
              i === selected ? 'bg-pixel-red text-white' :
              'bg-surface text-white/40'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── NEW SANDBOXES ───────────────────────────────────────────

// Comic Builder Sandbox
function ComicSandbox() {
  const [panels, setPanels] = useState<Array<{ hero: string; setting: string; speech: string }>>([
    { hero: '👽', setting: '🪐', speech: 'Hello Earthlings!' },
    { hero: '🤖', setting: '🌆', speech: 'AI makes logic fun!' },
    { hero: '🦸', setting: '🏫', speech: 'Let\'s save the day!' },
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
    <div className="p-4 space-y-4">
      {viewMode === 'edit' ? (
        <>
          <div className="text-white font-game text-xs text-center">Design Panel {activePanel + 1}/3</div>
          
          <div className="flex gap-2">
            {[0, 1, 2].map(idx => (
              <button
                key={idx}
                onClick={() => setActivePanel(idx)}
                className={`flex-1 py-1.5 font-pixel text-[8px] border-2 border-black shadow-[2px_2px_0px_#000] text-center ${
                  activePanel === idx ? 'bg-[#7C3AED] text-white' : 'bg-surface text-white/50'
                }`}
              >
                Panel {idx + 1}
              </button>
            ))}
          </div>

          <div className="border-4 border-black bg-surface p-4 flex flex-col items-center justify-center relative min-h-[160px] shadow-[4px_4px_0px_#000]">
            <div className="text-[100px] leading-none opacity-20 absolute pointer-events-none select-none">
              {panels[activePanel].setting}
            </div>
            
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-7xl z-10"
            >
              {panels[activePanel].hero}
            </motion.div>

            <div className="mt-3 bg-white border-2 border-black text-black px-3 py-1.5 rounded-xl font-body text-xs relative max-w-[80%] text-center shadow-[2px_2px_0px_#000] z-10">
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-t-2 border-l-2 border-black rotate-45" />
              {panels[activePanel].speech || 'Type speech...'}
            </div>
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <span className="text-white/60 font-game text-[9px] block mb-1">1. Choose Hero:</span>
              <div className="flex justify-between gap-1">
                {heroes.map(h => (
                  <button
                    key={h}
                    onClick={() => updateActivePanel('hero', h)}
                    className={`text-2xl p-1 border-2 border-black flex-1 text-center transition-colors ${
                      panels[activePanel].hero === h ? 'bg-[#7C3AED] border-white' : 'bg-surface hover:bg-white/5'
                    }`}
                  >
                    {h}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-white/60 font-game text-[9px] block mb-1">2. Choose Setting:</span>
              <div className="flex justify-between gap-1">
                {settings.map(s => (
                  <button
                    key={s}
                    onClick={() => updateActivePanel('setting', s)}
                    className={`text-2xl p-1 border-2 border-black flex-1 text-center transition-colors ${
                      panels[activePanel].setting === s ? 'bg-[#7C3AED] border-white' : 'bg-surface hover:bg-white/5'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-white/60 font-game text-[9px] block mb-1">3. Write Speech bubble:</span>
              <input
                type="text"
                value={panels[activePanel].speech}
                onChange={e => updateActivePanel('speech', e.target.value)}
                maxLength={45}
                placeholder="e.g. Look at that AI prediction!"
                className="w-full pixel-input text-xs"
              />
            </div>
          </div>

          <button
            onClick={() => setViewMode('preview')}
            className="w-full border-4 border-black bg-[#10B981] py-3 text-white font-game text-xs shadow-pixel active:translate-y-0.5 mt-2 cursor-pointer"
          >
            PREVIEW COMIC STRIP 🎨
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="text-white font-game text-xs text-center">My AI Adventure Strip</div>
          
          <div className="grid grid-cols-3 gap-2">
            {panels.map((p, idx) => (
              <div
                key={idx}
                className="border-3 border-black bg-surface p-3 aspect-[3/4] flex flex-col items-center justify-between relative overflow-hidden shadow-[2px_2px_0px_#000]"
              >
                <div className="text-[60px] opacity-15 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
                  {p.setting}
                </div>
                
                <span className="font-pixel text-[5px] text-[#00C2FF] self-start">#{idx + 1}</span>

                <span className="text-4xl z-10 my-auto">{p.hero}</span>

                <div className="bg-white border border-black text-black px-1.5 py-0.5 rounded-md text-[8px] font-body max-w-full text-center truncate shadow-[1px_1px_0px_#000] z-10">
                  {p.speech || '...'}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('edit')}
              className="flex-1 border-3 border-black bg-surface py-2 text-white/70 font-game text-[10px] cursor-pointer"
            >
              ← Edit Panels
            </button>
            <button
              onClick={() => {
                alert('Saved! Your comic is ready.');
              }}
              className="flex-1 border-3 border-black bg-[#10B981] py-2 text-white font-game text-[10px] cursor-pointer"
            >
              Save Comic ✅
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Prompt Engineering Playground Sandbox
function PlaygroundSandbox() {
  const [role, setRole] = useState('Emoji Translator');
  const [temperature, setTemperature] = useState(0.7);
  const [promptInput, setPromptInput] = useState('');
  const [aiOutput, setAiOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const roles = [
    { name: 'Emoji Translator 🎭', system: 'You translate the user\'s text into emojis ONLY. No words. Be creative!' },
    { name: 'Pirate Captain 🏴‍☠️', system: 'You speak like a salty 17th-century pirate captain in short sentences. Use Pirate slang!' },
    { name: 'Robotic Helper 🤖', system: 'You are a robot. End every word with a BEEP or BOOP. Speak robotically.' },
  ];

  const handleSend = async () => {
    if (!promptInput.trim() || loading) return;
    setLoading(true);
    setAiOutput(null);
    try {
      const selectedSystem = roles.find(r => r.name.includes(role))?.system || '';
      const response = await testPromptPlayground(selectedSystem, promptInput, temperature);
      setAiOutput(response);
    } catch (err) {
      setAiOutput('Beep boop! An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="text-white font-game text-xs text-center">Prompt Engineering Lab</div>

      <div className="space-y-3">
        <div>
          <span className="text-white/60 font-game text-[9px] block mb-1">1. AI System Persona:</span>
          <div className="grid grid-cols-3 gap-1.5">
            {roles.map(r => (
              <button
                key={r.name}
                onClick={() => setRole(r.name)}
                className={`py-2 px-1 text-[8px] font-game border-2 border-black text-center shadow-[1px_1px_0px_#000] leading-tight flex flex-col justify-center items-center h-12 cursor-pointer ${
                  role === r.name ? 'bg-[#7C3AED] text-white border-white' : 'bg-surface text-white/55 hover:text-white/80'
                }`}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-white/60 font-game text-[9px]">2. Creativity (Temperature):</span>
            <span className="font-pixel text-[7px] text-[#FFD60A]">{temperature} ({temperature < 0.4 ? 'Focused' : 'Creative'})</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            value={temperature}
            onChange={e => setTemperature(parseFloat(e.target.value))}
            className="w-full h-2 bg-black border border-white/20 appearance-none rounded cursor-pointer accent-[#7C3AED]"
          />
        </div>

        <div>
          <span className="text-white/60 font-game text-[9px] block mb-1">3. Write Your Prompt:</span>
          <textarea
            value={promptInput}
            onChange={e => setPromptInput(e.target.value)}
            placeholder="e.g. What is the sun made of?"
            className="w-full pixel-input text-xs h-16 resize-none"
            maxLength={100}
          />
        </div>
      </div>

      <button
        onClick={handleSend}
        disabled={!promptInput.trim() || loading}
        className="w-full border-4 border-black bg-[#7C3AED] py-3 text-white font-game text-xs shadow-pixel active:translate-y-0.5 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block mr-1">⚡</span>
            GENERATING AI RESPONSE...
          </>
        ) : (
          'SEND PROMPT TO AI 🚀'
        )}
      </button>

      {aiOutput && (
        <div className="border-4 border-black bg-black/40 p-4 relative shadow-[4px_4px_0px_#000]">
          <span className="absolute -top-3 left-4 bg-[#7C3AED] text-white font-game text-[7px] px-2 py-0.5 border-2 border-black">
            🤖 AI Output
          </span>
          <p className="text-white font-body text-xs leading-relaxed mt-1">{aiOutput}</p>
        </div>
      )}
    </div>
  );
}

// Deepfake Detective Sandbox
function DetectiveSandbox() {
  const challenges = [
    {
      id: 1,
      scenario: 'A video of a famous actor promoting a sketchy investment app on Instagram. The voice audio matches their voice, but their lips look slightly blurred and mismatch the syllables.',
      isDeepfake: true,
      explanation: 'CORRECT! Mismatched lip sync and fuzzy facial edges are dead giveaways for AI voice cloning and face-swapping deepfakes.',
      incorrectMsg: 'NOT QUITE! Why would a famous actor promote a sketchy app? Look closely at the lips — they look blurred and out of sync. This is an AI deepfake!',
    },
    {
      id: 2,
      scenario: 'A photo of the Pope wearing a stylish, oversized white puffer jacket that went viral on Twitter. If you zoom in, the background people have hands with 6 fingers and blurred glasses.',
      isDeepfake: true,
      explanation: 'CORRECT! Current AI image generators struggle with rendering realistic hands, often adding extra fingers or merging details in background objects.',
      incorrectMsg: 'NOT QUITE! Look at the hands of the people in the background — they have 6 fingers! This Pope puffer jacket photo is a famous AI deepfake.',
    },
    {
      id: 3,
      scenario: 'A video news report showing a massive flood in a city. Multiple verified news organizations on the ground are posting photos of the same flooded streets from different angles.',
      isDeepfake: false,
      explanation: 'CORRECT! Multi-angle corroboration from verified, independent on-the-scene journalists confirms the media represents a real-world event.',
      incorrectMsg: 'NOT QUITE! Because multiple independent, verified journalists are reporting it from different perspectives on the ground, this is real media!',
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
      setFeedback(challenge.explanation);
    } else {
      setFeedback(challenge.incorrectMsg);
    }
  };

  const handleNext = () => {
    setSelected(null);
    setFeedback(null);
    if (current + 1 >= challenges.length) {
      setDone(true);
    } else {
      setCurrent(c => c + 1);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 gap-4 text-center">
        <div className="text-6xl animate-bounce">🕵️</div>
        <h4 className="font-game text-sm text-white">Investigation Complete!</h4>
        <div className="border-4 border-black bg-surface p-4 shadow-pixel w-full">
          <div className="text-white font-game text-xs">Case Score: {score}/{challenges.length} Correct</div>
          <p className="text-white/60 font-body text-xs mt-2 leading-relaxed">
            {score === challenges.length 
              ? 'Excellent eye! You can easily spot AI deepfakes like a true detective!' 
              : 'Good job! Pay close attention to hands, ears, and lip synchronization to spot deepfakes.'}
          </p>
        </div>
        <button
          onClick={() => {
            setCurrent(0);
            setSelected(null);
            setFeedback(null);
            setScore(0);
            setDone(false);
          }}
          className="w-full border-4 border-black bg-[#7C3AED] py-3 text-white font-game text-xs shadow-pixel active:translate-y-0.5 mt-2 cursor-pointer"
        >
          Restart Cases 🔁
        </button>
      </div>
    );
  }

  const c = challenges[current];
  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center text-white/50 font-body text-xs">
        <span>Case File {current + 1}/{challenges.length}</span>
        <span className="font-game text-[#FF8906] text-[9px]">🕵️ AI DETECTIVE</span>
      </div>

      <div className="border-4 border-black bg-surface p-4 shadow-[4px_4px_0px_#000]">
        <span className="font-game text-[8px] text-[#00C2FF] uppercase block mb-1">Clue Description:</span>
        <p className="text-white font-body text-xs leading-relaxed">{c.scenario}</p>
      </div>

      {feedback ? (
        <div className="space-y-3">
          <div className={`border-4 border-black p-4 ${
            (selected === 'deepfake' && c.isDeepfake) || (selected === 'real' && !c.isDeepfake)
              ? 'bg-success/20 border-success text-green-300'
              : 'bg-pixel-red/25 border-pixel-red text-red-300'
          }`}>
            <strong className="font-game text-[9px] block mb-1">
              {(selected === 'deepfake' && c.isDeepfake) || (selected === 'real' && !c.isDeepfake)
                ? '✅ CORRECT DETECTION!'
                : '❌ FALSE ALARM / MISSED DEEPFAKE'}
            </strong>
            <p className="font-body text-xs text-white/90 leading-relaxed">{feedback}</p>
          </div>
          <button
            onClick={handleNext}
            className="w-full border-4 border-black bg-primary py-3 text-white font-game text-xs shadow-pixel active:translate-y-0.5 cursor-pointer"
          >
            {current + 1 < challenges.length ? 'NEXT CASE →' : 'FINISH CASE REPORT 📋'}
          </button>
        </div>
      ) : (
        <div className="flex gap-3">
          <button
            onClick={() => handleChoice('deepfake')}
            className="flex-1 border-4 border-black bg-pixel-red text-white py-3 font-game text-xs shadow-pixel hover:brightness-110 active:translate-y-0.5 cursor-pointer"
          >
            🎭 DEEPFAKE
          </button>
          <button
            onClick={() => handleChoice('real')}
            className="flex-1 border-4 border-black bg-success text-white py-3 font-game text-xs shadow-pixel hover:brightness-110 active:translate-y-0.5 cursor-pointer"
          >
            📸 REAL MEDIA
          </button>
        </div>
      )}
    </div>
  );
}

