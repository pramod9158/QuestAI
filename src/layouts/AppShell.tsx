import React from 'react';
import { NavLink, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Gamepad2, Target, User, ChevronRight } from 'lucide-react';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { CoinCounter, StreakFlame, XPBar } from '@/components/ui/GameUI';
import { getLevel, getXPForNextLevel, getPlatformProgress } from '@/lib/gamification';
import { CURRICULUM } from '@/data/curriculum';
import { getUnopenedCount } from '@/lib/treasureChest';
import { Map } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/play', label: 'Play', icon: Gamepad2 },
  { path: '/missions', label: 'Missions', icon: Target },
  { path: '/profile', label: 'Profile', icon: User },
];

export function AppShell({ children }: { children?: React.ReactNode }) {
  const profile = useCurrentProfile();
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = React.useState(() => localStorage.getItem('app-theme') || 'dark');

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const xp = profile?.xp ?? 0;
  const level = getLevel(xp);
  const xpInfo = getXPForNextLevel(xp);
  const stats = getPlatformProgress(profile);
  const overallPercent = stats.overallPercent;

  const hideNav = ['/auth', '/onboarding'].some(p => location.pathname.startsWith(p));
  const isMainTab = ['/', '/learn', '/play', '/missions', '/profile'].includes(location.pathname);

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
        icon: '🎁',
        color: '#FFD60A',
        badge: 'CLAIM REWARD'
      };
    }
    
    // 2. Find first incomplete lesson
    const userZone = profile.zone || 'junior';
    const completedIds: string[] = profile.completed_lessons || [];
    const filtered = CURRICULUM.filter(l => l.zone === userZone || l.zone === 'both');
    
    const nextIncompleteIdx = filtered.findIndex(l => !completedIds.includes(l.id));
    if (nextIncompleteIdx !== -1) {
      const nextLesson = filtered[nextIncompleteIdx];
      return {
        text: `Continue Module ${nextIncompleteIdx + 1}: ${nextLesson.title}`,
        path: `/learn/${nextLesson.id}`,
        icon: '⚡',
        color: '#7C3AED',
        badge: 'CONTINUE LEARNING'
      };
    }
    
    // 3. Check quiz progress
    const playCompleted = localStorage.getItem('play_completed_quiz') === 'true';
    if (!playCompleted) {
      return {
        text: 'Test your skills in the Quiz Arena!',
        path: '/play/quiz',
        icon: '🎯',
        color: '#10B981',
        badge: 'ATTEMPT QUIZ'
      };
    }
    
    return {
      text: 'Create a design in Brainstorm Lab!',
      path: '/play/brainstorm',
      icon: '💡',
      color: '#00C2FF',
      badge: 'OPEN PLAYGROUND'
    };
  };

  const nextAction = getNextAction();

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-game"
      style={{ backgroundAttachment: 'fixed' }}
    >
      {/* Phone container */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative bg-[#0F0A2E]">
        {/* Top Status Bar — Pixel Style */}
        {!hideNav && profile && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="sticky top-0 z-40 px-4 py-3 flex flex-col gap-2"
            style={{
              background: 'linear-gradient(180deg, #1E1B4B 0%, #16103A 100%)',
              borderBottom: '3px solid #000000',
              boxShadow: '0 4px 0px 0px #000000',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🤖</span>
                <span className="font-pixel text-[8px] text-white tracking-wider grad-text-primary">
                  AI EXPLORER
                </span>
              </div>
              <div className="flex items-center gap-2">
                {/* Theme Toggle Button */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleTheme}
                  className="w-8 h-8 flex items-center justify-center cursor-pointer font-body"
                  style={{
                    background: theme === 'dark' ? '#16103A' : '#FFFFFF',
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px #000',
                  }}
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <span className="text-sm select-none">{theme === 'dark' ? '☀️' : '🌙'}</span>
                </motion.button>
                {/* World Map shortcut */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigate('/worlds')}
                  className="w-8 h-8 flex items-center justify-center cursor-pointer"
                  style={{
                    background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
                    border: '2px solid #000',
                    boxShadow: '2px 2px 0px #000',
                  }}
                  title="World Map"
                >
                  <Map className="w-3.5 h-3.5 text-white" />
                </motion.button>
                {/* Chest notification badge */}
                {(() => {
                  const count = getUnopenedCount();
                  return count > 0 ? (
                    <motion.button
                      animate={{ rotate: [-3, 3, -3], y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => navigate('/')}
                      className="relative cursor-pointer text-lg"
                      title={`${count} treasure chest${count > 1 ? 's' : ''} waiting!`}
                    >
                      📦
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center font-pixel text-[5px] text-white"
                        style={{ background: '#EF4444', border: '1.5px solid #000' }}
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
            <XPBar current={xpInfo.current} needed={xpInfo.needed} level={level} />
            
            {/* Overall Journey Progress Bar */}
            <div className="flex items-center gap-2 mt-1">
              <div
                className="px-1.5 py-0.5 font-pixel text-[6px] text-white whitespace-nowrap uppercase"
                style={{
                  background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                  border: '2px solid #000000',
                  boxShadow: '1.5px 1.5px 0px 0px #000000',
                }}
              >
                Overall
              </div>
              <div className="flex-1 h-3 bg-[#0F0A2E] border-2 border-black p-[1px] flex items-center shadow-[inset_1px_1px_0px_rgba(0,0,0,0.5)]">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400" 
                  style={{ width: `${overallPercent}%`, transition: 'width 0.8s ease' }} 
                />
              </div>
              <span className="text-success font-pixel text-[6px] whitespace-nowrap">{overallPercent}%</span>
            </div>
          </motion.div>
        )}

        {/* Main Content */}
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

        {/* Recommended Next Action Section */}
        {!hideNav && profile && isMainTab && nextAction && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            onClick={() => navigate(nextAction.path)}
            className="cursor-pointer flex items-center justify-between gap-3 px-4 py-2.5 hover:brightness-110 active:scale-[0.99] transition-all select-none"
            style={{
              background: 'linear-gradient(90deg, #1E1B4B 0%, #16103A 100%)',
              borderTop: '3px solid #000000',
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: nextAction.color,
                  border: '2px solid #000000',
                  boxShadow: '2px 2px 0px #000000',
                }}
              >
                {nextAction.icon}
              </div>
              <div className="min-w-0">
                <div className="font-pixel text-[6px] tracking-wider text-warning">
                  RECOMMENDED NEXT STEP
                </div>
                <div className="text-white font-game text-[11px] mt-0.5 truncate leading-tight">
                  {nextAction.text}
                </div>
              </div>
            </div>
            <div
              className="flex-shrink-0 px-2 py-1 flex items-center gap-0.5 bg-black/35 border border-white/10 text-white font-game text-[9px] uppercase tracking-wider hover:bg-white/10 transition-colors"
              style={{ boxShadow: '2px 2px 0px #000' }}
            >
              Go <ChevronRight className="w-3 h-3 text-[#FFD60A]" />
            </div>
          </motion.div>
        )}

        {/* Bottom Navigation — Pixel Style */}
        {!hideNav && (
          <nav
            className="sticky bottom-0 z-40 pb-safe"
            style={{
              background: 'linear-gradient(180deg, #16103A 0%, #1E1B4B 100%)',
              borderTop: '3px solid #000000',
              boxShadow: '0 -4px 0px 0px #000000',
            }}
          >
            <div className="flex items-center justify-around px-2">
              {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
                const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
                return (
                  <NavLink key={path} to={path} className={`nav-tab ${isActive ? 'active' : ''}`}>
                    <motion.div
                      animate={isActive ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="relative"
                    >
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
                    </motion.div>
                    <span
                      className="font-pixel text-[6px] tracking-wide"
                      style={isActive ? {
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
