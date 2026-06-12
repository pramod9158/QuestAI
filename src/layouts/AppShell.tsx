import React from 'react';
import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Gamepad2, Target, User, ChevronRight, Sparkles } from 'lucide-react';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { CoinCounter, StreakFlame, XPBar } from '@/components/ui/GameUI';
import { getLevel, getXPForNextLevel, getPlatformProgress } from '@/lib/gamification';
import { CURRICULUM } from '@/data/curriculum';
import { getUnopenedCount } from '@/lib/treasureChest';
import { Map } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { DuoConfetti } from '@/components/ui/DuoConfetti';
import { Mascot } from '@/components/ui/Mascot';
import { useLearningCompanion } from '@/contexts/LearningCompanionContext';

// ── Nav items with both icon and emoji labels ─────────────────────────────────
const NAV_ITEMS = [
  { path: '/',         label: 'Home',     icon: Home,     emoji: '🏠' },
  { path: '/learn',   label: 'Learn',    icon: BookOpen, emoji: '📚' },
  { path: '/play',    label: 'Play',     icon: Gamepad2, emoji: '🎮' },
  { path: '/prompts', label: 'Prompts',  icon: Sparkles, emoji: '✨' },
  { path: '/missions',label: 'Missions', icon: Target,   emoji: '🎯' },
  { path: '/profile', label: 'Profile',  icon: User,     emoji: '👤' },
];

export function AppShell({ children }: { children?: React.ReactNode }) {
  const profile = useCurrentProfile();
  const location = useLocation();
  const navigate = useNavigate();
  const { isDuolingo } = useTheme();
  const { triggerTravel } = useLearningCompanion();

  const handleNav = (targetPath: string) => {
    if (location.pathname === targetPath) return;
    const type = ['/play', '/worlds', '/prompts'].some(p => targetPath.startsWith(p)) ? 'portal' : 'rocket';
    triggerTravel(type, () => {
      navigate(targetPath);
    });
  };

  const xp = profile?.xp ?? 0;
  const level = getLevel(xp);
  const xpInfo = getXPForNextLevel(xp);
  const stats = getPlatformProgress(profile);
  const overallPercent = stats.overallPercent;

  const hideNav = ['/auth', '/onboarding'].some(p => location.pathname.startsWith(p));
  const isMainTab = ['/', '/learn', '/play', '/missions', '/profile', '/prompts'].includes(location.pathname);

  // Compute next action
  const getNextAction = () => {
    if (!profile) return null;
    
    // 1. Check parent endorsement (Claim Reward)
    const endorsements = JSON.parse(localStorage.getItem('parent_endorsements') || '[]');
    const unread = endorsements.find((e: any) => !e.claimed);
    if (unread) {
      return {
        text: 'Claim Parent Stamp Reward!',
        path: '/',
        icon: isDuolingo ? '🎁' : '🎁',
        color: isDuolingo ? '#5FCC5F' : '#FFD60A',
        badge: isDuolingo ? '🎁 Claim Reward' : 'CLAIM REWARD'
      };
    }
    
    // 2. Find first incomplete lesson
    const userZone = profile.zone || 'junior';
    const completedIds: string[] = profile.completed_lessons || [];
    const filtered = CURRICULUM.filter(l => (l.zone === userZone || l.zone === 'both') && l.phase !== 3 && l.phase !== 8 && l.phase !== 2);
    
    const nextIncompleteIdx = filtered.findIndex(l => !completedIds.includes(l.id));
    if (nextIncompleteIdx !== -1) {
      const nextLesson = filtered[nextIncompleteIdx];
      return {
        text: `Continue Module ${nextIncompleteIdx + 1}: ${nextLesson.title}`,
        path: `/learn/${nextLesson.id}`,
        icon: isDuolingo ? '📚' : '⚡',
        color: isDuolingo ? '#5FCC5F' : '#7C3AED',
        badge: isDuolingo ? '📚 Continue Learning' : 'CONTINUE LEARNING'
      };
    }
    
    // 3. Check quiz progress
    const playCompleted = localStorage.getItem('play_completed_quiz') === 'true';
    if (!playCompleted) {
      return {
        text: 'Test your skills in the Quiz Arena!',
        path: '/play/quiz',
        icon: isDuolingo ? '🎯' : '🎯',
        color: isDuolingo ? '#5FCC5F' : '#10B981',
        badge: isDuolingo ? '🎯 Attempt Quiz' : 'ATTEMPT QUIZ'
      };
    }
    
    return {
      text: 'Create a design in Brainstorm Lab!',
      path: '/play/brainstorm',
      icon: isDuolingo ? '💡' : '💡',
      color: isDuolingo ? '#B366FF' : '#00C2FF',
      badge: isDuolingo ? '💡 Open Playground' : 'OPEN PLAYGROUND'
    };
  };

  const nextAction = getNextAction();

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-game"
      style={{ backgroundAttachment: 'fixed' }}
    >
      {/* Duolingo confetti overlay — only active in Duolingo theme */}
      <DuoConfetti />

      {/* Phone container */}
      <div
        className="w-full max-w-md min-h-screen flex flex-col relative"
        style={{ background: isDuolingo ? '#FFFFFF' : '#0F0A2E' }}
      >
        {/* ── Top Status Bar ─────────────────────────────────────────────── */}
        {!hideNav && profile && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className={`sticky top-0 z-40 px-4 py-3 flex flex-col gap-2 ${isDuolingo ? 'duo-header' : ''}`}
            style={isDuolingo ? {} : {
              background: 'linear-gradient(180deg, #1E1B4B 0%, #16103A 100%)',
              borderBottom: '3px solid #000000',
              boxShadow: '0 4px 0px 0px #000000',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <motion.div
                    animate={{ y: [0, -2, 0], rotate: [0, -3, 3, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  >
                    <Mascot type="header" size={24} />
                  </motion.div>
                  <span
                    style={
                      isDuolingo
                        ? {
                            fontFamily: '"Nunito", sans-serif',
                            fontWeight: 900,
                            fontSize: 15,
                            color: '#5FCC5F',
                            letterSpacing: '-0.3px',
                          }
                        : {}
                    }
                    className={isDuolingo ? '' : 'font-pixel text-[8px] text-white tracking-wider grad-text-primary'}
                  >
                    {isDuolingo ? 'AI Explorer' : 'AI EXPLORER'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Theme Toggle */}
                <ThemeToggle />

                {/* World Map shortcut */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleNav('/worlds')}
                  className="w-8 h-8 flex items-center justify-center cursor-pointer"
                  style={isDuolingo ? {
                    background: '#F0FAF0',
                    border: '1.5px solid #E0E0E0',
                    borderRadius: 8,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  } : {
                    background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px #000',
                  }}
                  title="World Map"
                >
                  {isDuolingo
                    ? <span style={{ fontSize: 16 }}>🗺️</span>
                    : <Map className="w-3.5 h-3.5 text-white" />
                  }
                </motion.button>

                {/* Chest notification badge */}
                {(() => {
                  const count = getUnopenedCount();
                  return count > 0 ? (
                    <motion.button
                      animate={{ rotate: [-3, 3, -3], y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleNav('/')}
                      className="relative cursor-pointer text-lg"
                      title={`${count} treasure chest${count > 1 ? 's' : ''} waiting!`}
                    >
                      📦
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center font-pixel text-[5px] text-white"
                        style={isDuolingo
                          ? { background: '#FF6B6B', borderRadius: '999px', fontSize: 8, fontFamily: '"Nunito", sans-serif', fontWeight: 800 }
                          : { background: '#EF4444', border: '1.5px solid #000' }
                        }
                      >
                        {count}
                      </span>
                    </motion.button>
                  ) : null;
                })()}

                <StreakFlame streak={profile.current_streak ?? 0} />
                <CoinCounter coins={profile.coins ?? 0} />
              </div>
            </div>

            {/* XP Bar */}
            <XPBar current={xpInfo.current} needed={xpInfo.needed} level={level} />
            
            {/* Overall Journey Progress Bar */}
            <div className="flex items-center gap-2 mt-1">
              <div
                className="px-1.5 py-0.5 whitespace-nowrap uppercase"
                style={isDuolingo ? {
                  background: 'linear-gradient(135deg, #5FCC5F, #1EBC6B)',
                  borderRadius: 6,
                  fontFamily: '"Nunito", sans-serif',
                  fontSize: 9,
                  fontWeight: 800,
                  color: '#000',
                  padding: '2px 8px',
                } : {
                  background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                  border: '2px solid #000000',
                  boxShadow: '1.5px 1.5px 0px 0px #000000',
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 6,
                  color: 'white',
                }}
              >
                {isDuolingo ? '🌟 Overall' : 'Overall'}
              </div>
              <div
                className="flex-1 flex items-center"
                style={isDuolingo ? {
                  height: 10,
                  background: '#E0E0E0',
                  borderRadius: 999,
                  overflow: 'hidden',
                  padding: 1,
                } : {
                  height: 12,
                  background: '#0F0A2E',
                  border: '2px solid black',
                  padding: '1px',
                }}
              >
                <div
                  style={{
                    width: `${overallPercent}%`,
                    height: '100%',
                    background: isDuolingo
                      ? 'linear-gradient(90deg, #5FCC5F, #1EBC6B)'
                      : 'linear-gradient(90deg, #10B981, #34D399)',
                    borderRadius: isDuolingo ? 999 : 0,
                    transition: 'width 0.8s ease',
                  }}
                />
              </div>
              <span
                style={isDuolingo
                  ? { fontFamily: '"Nunito", sans-serif', fontSize: 10, fontWeight: 800, color: '#5FCC5F' }
                  : { fontFamily: '"Press Start 2P", monospace', fontSize: 6, color: '#10B981' }
                }
              >
                {overallPercent}%
              </span>
            </div>
          </motion.div>
        )}

        {/* ── Main Content ────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="h-full"
            >
              {children || <Outlet />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* ── Recommended Next Action ─────────────────────────────────────── */}
        {!hideNav && profile && isMainTab && nextAction && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => handleNav(nextAction.path)}
            className={`cursor-pointer flex items-center justify-between gap-3 px-4 py-2.5 hover:brightness-[0.97] active:scale-[0.99] transition-all select-none ${isDuolingo ? 'duo-next-action' : ''}`}
            style={isDuolingo ? {} : {
              background: 'linear-gradient(90deg, #1E1B4B 0%, #16103A 100%)',
              borderTop: '3px solid #000000',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 flex items-center justify-center text-lg flex-shrink-0"
                style={isDuolingo ? {
                  background: nextAction.color,
                  borderRadius: 10,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
                } : {
                  background: nextAction.color,
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                }}
              >
                {nextAction.icon}
              </div>
              <div className="min-w-0">
                {isDuolingo ? (
                  <div
                    style={{
                      fontFamily: '"Nunito", sans-serif',
                      fontSize: 9,
                      fontWeight: 800,
                      color: '#5FCC5F',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    ⭐ RECOMMENDED NEXT STEP
                  </div>
                ) : (
                  <div className="font-pixel text-[6px] tracking-wider text-warning">
                    RECOMMENDED NEXT STEP
                  </div>
                )}
                <div
                  className="mt-0.5 truncate leading-tight"
                  style={isDuolingo
                    ? { fontFamily: '"Nunito", sans-serif', fontSize: 12, fontWeight: 700, color: '#000' }
                    : { fontFamily: '"Fredoka One", cursive', fontSize: 11, color: 'white' }
                  }
                >
                  {nextAction.text}
                </div>
              </div>
            </div>
            <div
              className="flex-shrink-0 px-2 py-1 flex items-center gap-0.5 transition-colors"
              style={isDuolingo ? {
                background: '#5FCC5F',
                borderRadius: 8,
                fontFamily: '"Nunito", sans-serif',
                fontSize: 11,
                fontWeight: 800,
                color: '#000',
                boxShadow: '0 2px 0px rgba(0,0,0,0.15)',
              } : {
                background: 'rgba(0,0,0,0.35)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                fontFamily: '"Fredoka One", cursive',
                fontSize: 9,
                boxShadow: '2px 2px 0px #000',
              }}
            >
              Go <ChevronRight className="w-3 h-3" style={{ color: isDuolingo ? '#000' : '#FFD60A' }} />
            </div>
          </motion.div>
        )}

        {/* ── Bottom Navigation ───────────────────────────────────────────── */}
        {!hideNav && (
          <nav
            className={`sticky bottom-0 z-40 pb-safe ${isDuolingo ? 'duo-nav' : ''}`}
            style={isDuolingo ? {} : {
              background: 'linear-gradient(180deg, #16103A 0%, #1E1B4B 100%)',
              borderTop: '3px solid #000000',
              boxShadow: '0 -4px 0px 0px #000000',
            }}
          >
            <div className="flex items-center justify-around px-2">
              {NAV_ITEMS.map(({ path, label, icon: Icon, emoji }) => {
                const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
                return (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNav(path);
                    }}
                    className={`nav-tab ${isActive ? 'active' : ''}`}
                  >
                    <motion.div
                      animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
                      {isDuolingo ? (
                        /* Duolingo nav: green pill highlight on active item */
                        <div
                          className="flex flex-col items-center justify-center transition-all duration-150"
                          style={{
                            position: 'relative',
                            padding: '6px 10px 4px',
                            background: isActive ? '#E8FBE8' : 'transparent',
                            borderRadius: isActive ? 14 : 0,
                            borderBottom: isActive ? '2.5px solid #5FCC5F' : '2.5px solid transparent',
                          }}
                        >
                          <span style={{ fontSize: 20, filter: isActive ? 'none' : 'saturate(0.4) opacity(0.6)' }}>{emoji}</span>
                        </div>
                      ) : (
                        /* Minecraft nav: icon in colored box */
                        <div
                          className="p-2 transition-all duration-150"
                          style={isActive ? {
                            background: 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)',
                            boxShadow: '3px 3px 0px 0px #000000',
                            border: '2px solid #000000',
                          } : {}}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                      )}
                    </motion.div>
                    <span
                      className={isDuolingo ? '' : 'font-pixel text-[6px] tracking-wide'}
                      style={isDuolingo ? {
                        fontFamily: '"Nunito", sans-serif',
                        fontSize: 10,
                        fontWeight: 700,
                        color: isActive ? '#5FCC5F' : '#999999',
                        marginTop: 2,
                      } : isActive ? {
                        color: '#F59E0B',
                        textShadow: '0 0 8px rgba(245,158,11,0.6)',
                      } : {}}
                    >
                      {label}
                    </span>
                  </NavLink>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}
