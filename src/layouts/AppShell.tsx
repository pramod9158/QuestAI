import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, BookOpen, Gamepad2, Target, User } from 'lucide-react';
import { useCurrentProfile } from '@/contexts/AuthContext';
import { CoinCounter, StreakFlame, XPBar } from '@/components/ui/GameUI';
import { getLevel, getXPForNextLevel } from '@/lib/gamification';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/learn', label: 'Learn', icon: BookOpen },
  { path: '/play', label: 'Play', icon: Gamepad2 },
  { path: '/missions', label: 'Missions', icon: Target },
  { path: '/profile', label: 'Profile', icon: User },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const profile = useCurrentProfile();
  const location = useLocation();

  const xp = profile?.xp ?? 0;
  const level = getLevel(xp);
  const xpInfo = getXPForNextLevel(xp);

  const hideNav = ['/auth', '/onboarding'].some(p => location.pathname.startsWith(p));

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-game"
      style={{ backgroundAttachment: 'fixed' }}
    >
      {/* Phone container */}
      <div className="w-full max-w-md min-h-screen flex flex-col relative">
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
                <StreakFlame streak={profile.current_streak ?? 0} />
                <CoinCounter coins={profile.coins ?? 0} />
              </div>
            </div>
            <XPBar current={xpInfo.current} needed={xpInfo.needed} level={level} />
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
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

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
