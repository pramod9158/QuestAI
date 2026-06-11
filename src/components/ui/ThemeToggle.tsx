import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

// ─────────────────────────────────────────────────────────────────────────────
// ThemeToggle — Pure neumorphic capsule toggle switch as shown in user's ss
// - Light theme (Duolingo): Knob is on the right, revealing yellow Sun on the left
// - Dark theme (Minecraft): Knob is on the left, revealing yellow Moon on the right
// ─────────────────────────────────────────────────────────────────────────────

export function ThemeToggle() {
  const { theme, toggleTheme, isDuolingo } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={`Switch theme (current: ${isDuolingo ? 'Duolingo' : 'Minecraft'})`}
      aria-label={`Switch theme, currently ${isDuolingo ? 'Duolingo' : 'Minecraft'}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        width: 66,
        height: 32,
        borderRadius: 999,
        cursor: 'pointer',
        border: isDuolingo ? '1.5px solid #E2E8F0' : '2.5px solid #000000',
        outline: 'none',
        background: isDuolingo ? '#E2E8F0' : '#2A2A35',
        boxShadow: isDuolingo 
          ? 'inset 0 3px 6px rgba(0,0,0,0.1)' 
          : 'inset 0 3px 6px rgba(0,0,0,0.5)',
        transition: 'all 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
        padding: 0,
      }}
    >
      {/* Sun Icon (Stationary on the left) */}
      <div
        style={{
          position: 'absolute',
          left: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDuolingo ? 1 : 0.2,
          transition: 'opacity 0.3s ease',
        }}
      >
        <Sun className="w-4 h-4" style={{ color: '#FBBF24', fill: '#FBBF24' }} />
      </div>

      {/* Moon Icon (Stationary on the right) */}
      <div
        style={{
          position: 'absolute',
          right: 8,
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: isDuolingo ? 0.2 : 1,
          transition: 'opacity 0.3s ease',
        }}
      >
        <Moon className="w-4 h-4" style={{ color: '#FBBF24', fill: '#FBBF24' }} />
      </div>

      {/* Sliding Knob (Blank white 3D button) */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{
          position: 'absolute',
          top: 2,
          left: isDuolingo ? 'calc(100% - 28px)' : '2px',
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: '#FFFFFF',
          boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
          border: '0.5px solid rgba(0,0,0,0.04)',
        }}
      />
    </button>
  );
}
