import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

export interface MascotProps {
  type?: 'success' | 'partial' | 'failure' | 'module' | 'mission' | 'chapter' | 'streak' | 'onboarding' | 'header';
  mood?: 'guiding' | 'encouraging' | 'celebrating' | 'thinking' | 'curious' | 'proud' | 'excited';
  outfit?: 'default' | 'scientist' | 'prompt-master' | 'mission-guide';
  pose?: 'idle' | 'wave' | 'walk' | 'run' | 'fly' | 'jump' | 'dance' | 'point-left' | 'point-right' | 'thinking' | 'speaking';
  size?: number;
  customMarquee?: string;
  className?: string;
  isWakeWordListening?: boolean;
  
  // Dynamic VAD states (for Rio)
  isPeaking?: boolean;
  isThinking?: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;

  // Mascot selection
  mascotName?: 'sparky' | 'rio';
}

export function Mascot({
  type = 'success',
  mood,
  outfit,
  pose,
  size = 100,
  customMarquee,
  className,
  isWakeWordListening = false,
  isPeaking = false,
  isThinking = false,
  isListening = false,
  isSpeaking = false,
  mascotName = 'rio',
}: MascotProps) {
  const { isDuolingo } = useTheme();

  // ==========================================================================
  // RIO MASCOT
  // ==========================================================================
  if (mascotName === 'rio') {
    const isDormant = false;

    // Theme-specific color configurations to ensure high contrast and premium aesthetics
    const legFill = isDuolingo ? '#64748B' : '#1A2130';
    const legStroke = isDuolingo ? '#1E293B' : '#0F172A';
    const stripeColor = isDuolingo ? '#3B82F6' : '#00ffd8';
    const bootFill = isDuolingo ? '#1E293B' : '#111827';
    const bootStroke = isDuolingo ? '#0F172A' : '#00ffd8';

    const shellFill = isDuolingo ? '#475569' : '#1F2836';
    const shellStroke = isDuolingo ? '#1E293B' : '#00ffd8';
    const shellStrokeWidth = isDuolingo ? '2.5' : '2.0';

    const visorBezelFill = isDuolingo ? '#F1F5F9' : '#1E2937';
    const visorBezelStroke = isDuolingo ? '#1E293B' : '#00ffd8';

    const headphoneFill = isDuolingo ? '#4F46E5' : '#6366F1';
    const headphoneStroke = isDuolingo ? '#1E293B' : '#00ffd8';
    const headphoneDetail = isDuolingo ? '#06B6D4' : '#00ffd8';

    return (
      <motion.div
        className={className}
        style={{
          width: size,
          height: size,
          position: 'relative',
          display: 'inline-block',
        }}
        animate={
          isPeaking
            ? {
                y: [0, -6, 0],
                rotate: [-2, 2, -2],
              }
            : isThinking
            ? {
                y: [0, -2, 0],
                rotate: [-1, 1, -1],
              }
            : isSpeaking
            ? {
                y: [0, -6, 0, -3, 0],
                rotate: [-2, 2, -2, 1, -1, 0],
              }
            : {
                y: [0, -2, 0],
                rotate: [0, -0.5, 0.5, 0],
              }
        }
        transition={{
          repeat: Infinity,
          duration: isPeaking ? 3.0 : isSpeaking ? 0.8 : isThinking ? 1.2 : 2.0,
          ease: 'easeInOut',
        }}
      >
        {/* Self-contained CSS animations for smooth blinking and eye movements */}
        <style>{`
          @keyframes rioBlinkCycle {
            0%, 90%, 100% { transform: scaleY(1); }
            95% { transform: scaleY(0.08); }
          }
          @keyframes rioFastBlinkCycle {
            0%, 85%, 100% { transform: scaleY(1); }
            90% { transform: scaleY(0.08); }
          }
          @keyframes rioEyeMovement {
            0%, 100% { transform: translate(0px, 0px); }
            25% { transform: translate(-1px, 0.5px); }
            75% { transform: translate(1px, -0.5px); }
          }
          @keyframes soundwaveWave {
            0%, 100% { transform: scaleY(0.3); }
            50% { transform: scaleY(1.1); }
          }

          .rio-eye-left {
            transform-origin: 34px 43px;
            animation: rioBlinkCycle 1.0s infinite ease-in-out;
          }
          .rio-eye-right {
            transform-origin: 66px 43px;
            animation: rioBlinkCycle 1.0s infinite ease-in-out;
          }
          .rio-eye-fast-left {
            transform-origin: 33.5px 42.5px;
            animation: rioFastBlinkCycle 1.0s infinite ease-in-out;
          }
          .rio-eye-fast-right {
            transform-origin: 66.5px 42.5px;
            animation: rioFastBlinkCycle 1.0s infinite ease-in-out;
          }
          .rio-eye-active-left {
            transform-origin: 34.5px 43.5px;
            animation: rioBlinkCycle 1.0s infinite ease-in-out;
          }
          .rio-eye-active-right {
            transform-origin: 65.5px 43.5px;
            animation: rioBlinkCycle 1.0s infinite ease-in-out;
          }
          .rio-eye-movement-g {
            animation: rioEyeMovement 4s infinite ease-in-out;
          }
          .rio-wave-bar {
            transform-origin: 50% 100%;
            animation: soundwaveWave 0.5s infinite ease-in-out;
          }

        `}</style>

        <svg width="100%" height="100%" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
          <defs>
            <filter id="visorCyanGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>



          {/* 2. Legs & Boots */}
          {/* Left Leg */}
          <rect x="33" y="74" width="8" height="14" rx="2" fill={legFill} stroke={legStroke} strokeWidth="1.5" />
          <rect x="33" y="79" width="8" height="2" fill={stripeColor} opacity="0.8" />
          
          {/* Right Leg */}
          <rect x="59" y="74" width="8" height="14" rx="2" fill={legFill} stroke={legStroke} strokeWidth="1.5" />
          <rect x="59" y="79" width="8" height="2" fill={stripeColor} opacity="0.8" />

          {/* Left Boot */}
          <path
            d="M 27,87 L 45,87 C 47,87 47,91 45,91 L 27,91 C 25,91 25,87 27,87 Z"
            fill={bootFill}
            stroke={bootStroke}
            strokeWidth="1.5"
          />
          {/* Right Boot */}
          <path
            d="M 53,87 L 71,87 C 73,87 73,91 71,91 L 53,91 C 51,91 51,87 53,87 Z"
            fill={bootFill}
            stroke={bootStroke}
            strokeWidth="1.5"
          />

          {/* 3. Head (Rio's Body) */}
          {/* Dark Grey-Blue Main Shell */}
          <rect
            x="15" y="16" width="70" height="60" rx="18"
            fill={shellFill}
            stroke={shellStroke}
            strokeWidth={shellStrokeWidth}
          />

          {/* Visor White Outer Bezel Frame */}
          <rect
            x="19" y="20" width="62" height="52" rx="14"
            fill={visorBezelFill}
            stroke={visorBezelStroke}
            strokeWidth="1.5"
          />

          {/* Black Visor Face Screen */}
          <rect
            x="23" y="24" width="54" height="44" rx="11"
            fill="#070A10"
          />

          {/* 4. Eyes Screen Display */}
          {isThinking ? (
            // --- THINKING / COMPREHENDING STATE ---
            <g>
              <rect
                className="rio-eye-fast-left"
                x="29" y="38" width="9" height="9" rx="2"
                fill="#00ffd8"
                filter="url(#visorCyanGlow)"
              />
              <rect
                className="rio-eye-fast-right"
                x="62" y="38" width="9" height="9" rx="2"
                fill="#00ffd8"
                filter="url(#visorCyanGlow)"
              />
              {/* Processing Circular Loop in Center */}
              <circle
                cx="50" cy="46" r="6"
                fill="none"
                stroke="#00ffd8"
                strokeWidth="1.5"
                strokeDasharray="3,3"
                filter="url(#visorCyanGlow)"
              />
            </g>
          ) : isListening ? (
            // --- ACTIVE LISTENING STATE ---
            <g className="rio-eye-movement-g">
              <rect
                className="rio-eye-active-left"
                x="29" y="38" width="11" height="11" rx="2.5"
                fill="#00ffd8"
                filter="url(#visorCyanGlow)"
              />
              <rect
                className="rio-eye-active-right"
                x="60" y="38" width="11" height="11" rx="2.5"
                fill="#00ffd8"
                filter="url(#visorCyanGlow)"
              />
            </g>
          ) : isSpeaking ? (
            // --- SPEAKING STATE ---
            <g>
              <rect
                className="rio-eye-fast-left"
                x="29" y="38" width="9" height="9" rx="2"
                fill="#00ffd8"
                filter="url(#visorCyanGlow)"
              />
              <rect
                className="rio-eye-fast-right"
                x="62" y="38" width="9" height="9" rx="2"
                fill="#00ffd8"
                filter="url(#visorCyanGlow)"
              />
              {/* Embedded Mini Audio Wave Visualizer */}
              <g transform="translate(43, 40)" filter="url(#visorCyanGlow)">
                <rect className="rio-wave-bar" x="2" y="0" width="1.5" height="10" fill="#00ffd8" style={{ animationDelay: '0.1s' }} />
                <rect className="rio-wave-bar" x="6" y="0" width="1.5" height="14" fill="#00ffd8" style={{ animationDelay: '0.2s' }} />
                <rect className="rio-wave-bar" x="10" y="0" width="1.5" height="8" fill="#00ffd8" style={{ animationDelay: '0.3s' }} />
              </g>
            </g>
          ) : isDormant ? (
            // --- SLEEP / PEAKING STATE ---
            <g filter="url(#visorCyanGlow)">
              <path d="M 28,45 L 40,45" stroke="#00ffd8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 60,45 L 72,45" stroke="#00ffd8" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M 34,45 A 3,3 0 0 1 34,39" stroke="#00ffd8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          ) : (
            // --- IDLE STATE ---
            <g>
              <rect
                className="rio-eye-left"
                x="29" y="38" width="10" height="10" rx="2"
                fill="#00ffd8"
                filter="url(#visorCyanGlow)"
              />
              <rect
                className="rio-eye-right"
                x="61" y="38" width="10" height="10" rx="2"
                fill="#00ffd8"
                filter="url(#visorCyanGlow)"
              />
            </g>
          )}

          {/* 5. Headphones (Over Head) */}
          {/* Headband Arch */}
          <path
            d="M 12,28 A 38,38 0 0 1 88,28"
            fill="none"
            stroke={headphoneFill}
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Headband stripes details (turquoise) */}
          <path
            d="M 32,11.5 A 35,35 0 0 1 68,11.5"
            fill="none"
            stroke={headphoneDetail}
            strokeWidth="1.5"
          />

          {/* Left Ear Cup */}
          <rect
            x="6" y="21" width="10" height="26" rx="5"
            fill={headphoneFill}
            stroke={headphoneStroke}
            strokeWidth="1.5"
          />
          <circle cx="11" cy="34" r="3" fill="none" stroke={headphoneDetail} strokeWidth="1.5" filter="url(#visorCyanGlow)" />

          {/* Right Ear Cup */}
          <rect
            x="84" y="21" width="10" height="26" rx="5"
            fill={headphoneFill}
            stroke={headphoneStroke}
            strokeWidth="1.5"
          />
          <circle cx="89" cy="34" r="3" fill="none" stroke={headphoneDetail} strokeWidth="1.5" filter="url(#visorCyanGlow)" />


        </svg>
      </motion.div>
    );
  }

  // ==========================================================================
  // SPARKY MASCOT (ORIGINAL GUIDE)
  // ==========================================================================
  const activeOutfit = outfit || (
    type === 'module' || type === 'chapter' ? 'default' :
    type === 'mission' ? 'mission-guide' : 'default'
  );

  const activePose = pose || (
    ['success', 'module', 'chapter', 'streak'].includes(type) ? 'dance' :
    type === 'failure' ? 'thinking' :
    type === 'onboarding' ? 'wave' : 'idle'
  );

  const activeMood = mood || (
    type === 'failure' ? 'encouraging' :
    ['success', 'module', 'chapter', 'streak'].includes(type) ? 'celebrating' : 'guiding'
  );

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
  } else if (activePose === 'wave') {
    mascotAnim = {
      y: [0, -2, 0],
      rotate: [-3, 3, -3, 3, 0],
    };
  } else {
    // idle
    mascotAnim = {
      y: [0, -3, 0],
    };
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

  const isScientist = activeOutfit === 'scientist';
  const isPromptMaster = activeOutfit === 'prompt-master';
  const isMissionGuide = activeOutfit === 'mission-guide';

  const marqueeText = customMarquee || (
    isWakeWordListening ? '★ SAY "SPARKY" OR CLICK ME! ★' :
    activeMood === 'thinking' ? '★ ANALYZING... ★' :
    activeMood === 'excited' ? '★ LEVEL UP! ★' :
    '★ AI LEARNING CO-PILOT ★'
  );

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
            <path d="M 33,52 Q 50,68 67,52 M 43,52 L 43,80 M 57,52 L 57,80" stroke="#0F172A" strokeWidth="1.5" fill="none" />
            <polygon points="28,54 40,64 40,52" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
            <polygon points="72,54 60,64 60,52" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
            <circle cx="50" cy="62" r="1.5" fill="#0F172A" />
            <circle cx="50" cy="70" r="1.5" fill="#0F172A" />
          </>
        )}

        {isPromptMaster && (
          <>
            <path d="M 28,66 C 35,62 65,62 72,66" stroke="#8B5CF6" strokeWidth="2.5" fill="none" strokeDasharray="2,2" />
          </>
        )}

        {isMissionGuide && (
          <>
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
            <rect x="20" y="20" width="60" height="20" rx="6" fill="rgba(16, 185, 129, 0.3)" stroke="#10B981" strokeWidth="2" filter="url(#mascotVisorGlow)" />
            <line x1="20" y1="30" x2="18" y2="30" stroke="#10B981" strokeWidth="3" />
            <line x1="80" y1="30" x2="82" y2="30" stroke="#10B981" strokeWidth="3" />
          </>
        )}

        {isPromptMaster && (
          <>
            <polygon points="50,-8 28,13 72,13" fill="#7C3AED" stroke="#0F172A" strokeWidth="2" />
            <circle cx="44" cy="5" r="1.5" fill="#FFD60A" />
            <circle cx="56" cy="5" r="1.5" fill="#FFD60A" />
            <circle cx="50" cy="0" r="1.2" fill="#FFD60A" />
          </>
        )}

        {isMissionGuide && (
          <>
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
