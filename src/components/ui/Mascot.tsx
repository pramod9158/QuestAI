import React from 'react';
import { motion } from 'framer-motion';

export interface MascotProps {
  type?: 'success' | 'partial' | 'failure' | 'module' | 'mission' | 'chapter' | 'streak' | 'onboarding' | 'header';
  mood?: 'guiding' | 'encouraging' | 'celebrating' | 'thinking' | 'curious' | 'proud' | 'excited';
  outfit?: 'default' | 'scientist' | 'prompt-master' | 'mission-guide';
  pose?: 'idle' | 'wave' | 'walk' | 'run' | 'fly' | 'jump' | 'dance' | 'point-left' | 'point-right' | 'thinking';
  size?: number;
  customMarquee?: string;
  className?: string;
}

export function Mascot({
  type = 'success',
  mood,
  outfit,
  pose,
  size = 100,
  customMarquee,
  className,
}: MascotProps) {
  // 1. Resolve outfit from props or fallback to type
  const activeOutfit = outfit || (
    type === 'module' || type === 'chapter' ? 'default' :
    type === 'mission' ? 'mission-guide' : 'default'
  );

  // 2. Resolve pose from props or fallback to type
  const activePose = pose || (
    ['success', 'module', 'chapter', 'streak'].includes(type) ? 'dance' :
    type === 'failure' ? 'thinking' :
    type === 'onboarding' ? 'wave' : 'idle'
  );

  // 3. Resolve mood
  const activeMood = mood || (
    type === 'failure' ? 'encouraging' :
    ['success', 'module', 'chapter', 'streak'].includes(type) ? 'celebrating' : 'guiding'
  );

  // Determine Mascot Animation States based on resolved pose
  let mascotAnim = {};
  if (activePose === 'dance' || activePose === 'jump') {
    mascotAnim = {
      y: [0, -14, 0, -8, 0],
      rotate: [0, -4, 4, -4, 0],
      scale: [1, 1.05, 0.95, 1.02, 1],
    };
  } else if (activePose === 'fly') {
    mascotAnim = {
      y: [-2, 4, -2, 2, -2],
      x: [-1, 1, -1, 1, -1],
      rotate: [-1, 2, -1, 1, -1],
    };
  } else if (activePose === 'walk' || activePose === 'run') {
    mascotAnim = {
      y: [0, -4, 0, -4, 0],
      x: activePose === 'run' ? [-2, 2, -2, 2, -2] : [-1, 1, -1, 1, -1],
      rotate: activePose === 'run' ? [-3, 3, -3, 3, -3] : [-1.5, 1.5, -1.5, 1.5, -1.5],
    };
  } else if (activePose === 'thinking') {
    mascotAnim = {
      y: [0, -2, 0],
      rotate: [0, 3, -3, 0],
    };
  } else if (activePose === 'point-left' || activePose === 'point-right') {
    mascotAnim = {
      y: [0, -3, 0],
      rotate: activePose === 'point-left' ? [-2, 0, -2] : [0, 2, 0],
    };
  } else {
    // idle / wave
    mascotAnim = {
      y: [0, -3, 0],
      rotate: [0, -1, 1, 0],
    };
  }

  // Marquee text based on mood / type / custom text
  let marqueeText = "★ HELLO EXPLORER! ★";
  if (customMarquee) {
    marqueeText = customMarquee;
  } else if (activeMood === 'celebrating') {
    marqueeText = "★ SUCCESS! ★ YOU ARE AN AI HERO! ★";
  } else if (activeMood === 'encouraging') {
    marqueeText = "★ KEEP TRYING! ★ MISTAKES HELP US LEARN! ★";
  } else if (activeMood === 'thinking') {
    marqueeText = "★ ANALYZING DETAILS... ★ HMMM... ★";
  } else if (activeMood === 'proud' || activeMood === 'excited') {
    marqueeText = "★ AMAZING! ★ PLATFORM UNLOCKED! ★";
  } else if (type === 'onboarding') {
    marqueeText = "★ CHOOSE YOUR CATEGORY! ★ BECOME AN AI HERO! ★";
  } else if (type === 'header') {
    marqueeText = "★ QUEST AI ★ LEARN & PLAY ★";
  }

  // Antennas properties based on active mood
  let antennaColor = '#00E5FF';
  let flickerTimes = [1, 0.3, 1, 0.3, 1];
  let flickerDuration = 0.5; // fast
  if (activeMood === 'encouraging' || activeMood === 'thinking') {
    antennaColor = '#EF4444';
    flickerTimes = [1, 0.1, 0.7, 0.1, 1];
    flickerDuration = 1.2; // slow warning pulse
  } else if (activeMood === 'celebrating' || activeMood === 'proud') {
    antennaColor = '#10B981';
    flickerTimes = [1, 0.2, 1, 0.2, 1];
    flickerDuration = 0.35; // rapid happy flicker
  } else {
    antennaColor = '#F59E0B';
    flickerTimes = [1, 0.4, 0.8, 0.4, 1];
    flickerDuration = 0.8;
  }

  // Determine outfit color accents
  const isScientist = activeOutfit === 'scientist';
  const isPromptMaster = activeOutfit === 'prompt-master';
  const isMissionGuide = activeOutfit === 'mission-guide';

  return (
    <motion.div
      animate={mascotAnim}
      transition={{ repeat: Infinity, duration: 2.0, ease: 'easeInOut' }}
      className={className}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-block',
      }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        <defs>
          <filter id="mascotVisorGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <clipPath id="mascotVisorClip">
            <rect x="23" y="17" width="54" height="26" rx="11" />
          </clipPath>
        </defs>

        {/* Antennas */}
        <line x1="38" y1="12" x2="32" y2="4" stroke="#0F172A" strokeWidth="2" />
        <motion.circle
          cx="32"
          cy="4"
          r="3"
          fill={antennaColor}
          stroke="#0F172A"
          strokeWidth="1"
          animate={{ opacity: flickerTimes }}
          transition={{ repeat: Infinity, duration: flickerDuration, ease: "linear" }}
          filter="url(#mascotVisorGlow)"
        />
        
        <line x1="62" y1="12" x2="68" y2="4" stroke="#0F172A" strokeWidth="2" />
        <motion.circle
          cx="68"
          cy="4"
          r="3"
          fill={antennaColor}
          stroke="#0F172A"
          strokeWidth="1"
          animate={{ opacity: flickerTimes }}
          transition={{ repeat: Infinity, duration: flickerDuration, ease: "linear" }}
          filter="url(#mascotVisorGlow)"
        />

        {/* Feet */}
        <rect x="30" y="86" width="14" height="7" rx="3.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="56" y="86" width="14" height="7" rx="3.5" fill="#1E293B" stroke="#0F172A" strokeWidth="1.5" />

        {/* Legs */}
        <rect x="34" y="76" width="6" height="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="60" y="76" width="6" height="12" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />

        {/* Body Base */}
        <rect x="28" y="52" width="44" height="30" rx="14" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />

        {/* Costume Overlays */}
        {isScientist && (
          <>
            {/* White Lab Coat Collar & Buttons */}
            <path d="M 33,52 Q 50,68 67,52 M 43,52 L 43,80 M 57,52 L 57,80" stroke="#0F172A" strokeWidth="1.5" fill="none" />
            <polygon points="28,54 40,64 40,52" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
            <polygon points="72,54 60,64 60,52" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
            <circle cx="50" cy="62" r="1.5" fill="#0F172A" />
            <circle cx="50" cy="70" r="1.5" fill="#0F172A" />
          </>
        )}

        {isPromptMaster && (
          <>
            {/* Glowing magic stars or scroll strap */}
            <path d="M 28,66 C 35,62 65,62 72,66" stroke="#8B5CF6" strokeWidth="2.5" fill="none" strokeDasharray="2,2" />
          </>
        )}

        {isMissionGuide && (
          <>
            {/* Binocular Shoulder Strap */}
            <path d="M 28,56 L 72,78" stroke="#78350F" strokeWidth="2.5" fill="none" />
          </>
        )}

        {/* Chest Display screen */}
        <rect x="35" y="58" width="30" height="18" rx="6" fill="#F8FAFC" stroke={activeMood === 'encouraging' ? '#EF4444' : '#00E5FF'} strokeWidth="1.5" filter="url(#mascotVisorGlow)" />
        <text x="50" y="71" textAnchor="middle" fill="#0F172A" fontSize="9" fontWeight="extrabold" fontFamily="monospace">
          {isScientist ? 'LAB' : isPromptMaster ? '🪄' : isMissionGuide ? 'EXP' : 'AI'}
        </text>

        {/* Headphones (Left/Right) */}
        <rect x="10" y="26" width="8" height="20" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
        <rect x="82" y="26" width="8" height="20" rx="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />

        {/* Neck */}
        <rect x="44" y="46" width="12" height="8" fill="#1E293B" />

        {/* Head */}
        <rect x="18" y="12" width="64" height="38" rx="19" fill="#FFFFFF" stroke="#0F172A" strokeWidth="2" />
        
        {/* Head Costume Overlays */}
        {isScientist && (
          <>
            {/* AI Goggles around the eyes/visor */}
            <rect x="20" y="20" width="60" height="20" rx="6" fill="rgba(16, 185, 129, 0.3)" stroke="#10B981" strokeWidth="2" filter="url(#mascotVisorGlow)" />
            <line x1="20" y1="30" x2="18" y2="30" stroke="#10B981" strokeWidth="3" />
            <line x1="80" y1="30" x2="82" y2="30" stroke="#10B981" strokeWidth="3" />
          </>
        )}

        {isPromptMaster && (
          <>
            {/* Purple Wizard Hat */}
            <polygon points="50,-8 28,13 72,13" fill="#7C3AED" stroke="#0F172A" strokeWidth="2" />
            {/* Gold stars on wizard hat */}
            <circle cx="44" cy="5" r="1.5" fill="#FFD60A" />
            <circle cx="56" cy="5" r="1.5" fill="#FFD60A" />
            <circle cx="50" cy="0" r="1.2" fill="#FFD60A" />
          </>
        )}

        {isMissionGuide && (
          <>
            {/* Brown Explorer Cap */}
            <path d="M 22,14 L 78,14 L 64,5 L 36,5 Z" fill="#B45309" stroke="#0F172A" strokeWidth="2" />
            <ellipse cx="50" cy="14" rx="29" ry="2" fill="#B45309" stroke="#0F172A" strokeWidth="1.5" />
          </>
        )}

        {/* Visor Screen */}
        <rect
          x="22" y="16" width="56" height="28" rx="12"
          fill="#0B132B"
          stroke={activeMood === 'encouraging' ? '#EF4444' : activeMood === 'celebrating' ? '#10B981' : '#00E5FF'}
          strokeWidth="1.8"
          filter="url(#mascotVisorGlow)"
        />

        {/* Visor Marquee text display */}
        <g clipPath="url(#mascotVisorClip)">
          <motion.text
            y="32"
            fill={activeMood === 'encouraging' ? '#EF4444' : activeMood === 'celebrating' ? '#10B981' : '#00E5FF'}
            fontSize="7"
            fontWeight="bold"
            fontFamily="monospace"
            style={{ textShadow: `0 0 3px ${activeMood === 'encouraging' ? '#EF4444' : activeMood === 'celebrating' ? '#10B981' : '#00E5FF'}` }}
            animate={{ x: [80, -220] }}
            transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
          >
            {marqueeText}
          </motion.text>
        </g>

        {/* Interactive Pointer SVG overlays (only when pointing) */}
        {activePose === 'point-left' && (
          <motion.path
            d="M 15,60 L 0,60"
            stroke="#00E5FF"
            strokeWidth="2.5"
            strokeDasharray="3,3"
            animate={{ strokeDashoffset: [0, -10] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        )}
        {activePose === 'point-right' && (
          <motion.path
            d="M 85,60 L 100,60"
            stroke="#00E5FF"
            strokeWidth="2.5"
            strokeDasharray="3,3"
            animate={{ strokeDashoffset: [0, 10] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        )}
      </svg>
    </motion.div>
  );
}
