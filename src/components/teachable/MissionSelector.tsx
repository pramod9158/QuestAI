import React from 'react';
import { motion } from 'framer-motion';

export interface Mission {
  id: string;
  emoji: string;
  title: string;
  description: string;
  hint: string;
  difficulty: 1 | 2 | 3;
  classes: { label: string; emoji: string; instruction: string }[];
  color: string;
  gradFrom: string;
  gradTo: string;
}

export const MISSIONS: Mission[] = [
  {
    id: 'emotion',
    emoji: '😊',
    title: 'Emotion Detector',
    description: 'Teach AI to read your face and detect your mood!',
    hint: 'Make each face clearly — exaggerate your expression!',
    difficulty: 1,
    classes: [
      { label: 'Happy', emoji: '😊', instruction: 'Smile big and look at the camera!' },
      { label: 'Sad', emoji: '😢', instruction: 'Make your saddest face — frown and look down.' },
      { label: 'Surprised', emoji: '😮', instruction: 'Open your eyes wide and drop your jaw!' },
    ],
    color: '#F59E0B',
    gradFrom: '#F59E0B',
    gradTo: '#EF4444',
  },
  {
    id: 'hand',
    emoji: '✋',
    title: 'Hand Signal Language',
    description: 'Create your own robot control signals with hand poses!',
    hint: 'Hold your hand steady and close to camera for best results.',
    difficulty: 2,
    classes: [
      { label: 'Thumbs Up', emoji: '👍', instruction: 'Show a big thumbs up — this means YES!' },
      { label: 'Thumbs Down', emoji: '👎', instruction: 'Point thumb down clearly — this means NO!' },
      { label: 'Open Hand', emoji: '✋', instruction: 'Open palm facing camera — this means STOP!' },
    ],
    color: '#8B5CF6',
    gradFrom: '#8B5CF6',
    gradTo: '#3B82F6',
  },
  {
    id: 'light',
    emoji: '☀️',
    title: 'Light Level Detector',
    description: 'No props needed! Teach AI to sense room brightness.',
    hint: 'Cover the camera lens with your hand for darkness!',
    difficulty: 1,
    classes: [
      { label: 'Bright', emoji: '☀️', instruction: 'Point camera at a bright light or window.' },
      { label: 'Normal', emoji: '💡', instruction: 'Point camera at a normal lit room.' },
      { label: 'Dark', emoji: '🌑', instruction: 'Cover the lens gently with your palm.' },
    ],
    color: '#10B981',
    gradFrom: '#10B981',
    gradTo: '#3B82F6',
  },
  {
    id: 'fruit',
    emoji: '🍎',
    title: 'Fruit Spotter',
    description: 'Grab some fruits and teach the AI to identify them!',
    hint: 'Hold each fruit in front of camera against a plain background.',
    difficulty: 2,
    classes: [
      { label: 'Round Fruit', emoji: '🍎', instruction: 'Hold a round fruit (apple/orange) up to camera.' },
      { label: 'Long Fruit', emoji: '🍌', instruction: 'Hold a banana or cucumber up to camera.' },
      { label: 'No Fruit', emoji: '🤲', instruction: 'Show empty hands — no fruit!' },
    ],
    color: '#EC4899',
    gradFrom: '#EC4899',
    gradTo: '#F59E0B',
  },
  {
    id: 'custom',
    emoji: '🎨',
    title: 'Free Creator Mode',
    description: 'You decide what to teach! Name your own AI categories.',
    hint: 'Be creative — teach AI anything you can show on camera!',
    difficulty: 3,
    classes: [
      { label: 'Class A', emoji: '🔵', instruction: 'Show anything you want for Class A!' },
      { label: 'Class B', emoji: '🟢', instruction: 'Show something different for Class B!' },
      { label: 'Class C', emoji: '🔴', instruction: 'Show a third thing for Class C!' },
    ],
    color: '#7C3AED',
    gradFrom: '#7C3AED',
    gradTo: '#EC4899',
  },
];

const DIFFICULTY_STARS = { 1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐' };
const DIFFICULTY_LABEL = { 1: 'Easy', 2: 'Medium', 3: 'Advanced' };

interface Props {
  onSelect: (mission: Mission) => void;
}

export default function MissionSelector({ onSelect }: Props) {
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="text-center py-3">
        <div className="text-4xl mb-2">🤖</div>
        <h2 className="font-game text-base text-white">Choose Your Training Mission</h2>
        <p className="text-white/50 font-body text-xs mt-1">
          You're a Robot Engineer — pick what you want to teach your AI!
        </p>
      </div>

      {/* Mission Cards */}
      <div className="space-y-3">
        {MISSIONS.map((mission, i) => (
          <motion.button
            key={mission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSelect(mission)}
            className="w-full text-left"
          >
            <div
              className="flex items-center gap-3 p-3"
              style={{
                background: '#1E1B4B',
                border: `3px solid ${mission.color}`,
                boxShadow: `3px 3px 0px 0px #000000`,
              }}
            >
              {/* Emoji icon */}
              <div
                className="w-12 h-12 flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${mission.gradFrom}, ${mission.gradTo})`,
                  border: '2px solid #000',
                  boxShadow: '2px 2px 0px #000',
                }}
              >
                {mission.emoji}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-white font-game text-sm">{mission.title}</span>
                  <span className="font-pixel text-[7px] px-1 py-0.5 border border-black"
                    style={{ background: mission.color, color: '#000' }}>
                    {DIFFICULTY_LABEL[mission.difficulty]}
                  </span>
                </div>
                <p className="text-white/50 font-body text-xs mt-0.5 line-clamp-1">{mission.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px]">{DIFFICULTY_STARS[mission.difficulty]}</span>
                  <span className="text-white/30 font-body text-[9px]">{mission.classes.length} classes to train</span>
                </div>
              </div>

              {/* Arrow */}
              <div className="text-white/40 font-game text-sm flex-shrink-0">→</div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Footer note */}
      <div className="text-center py-2">
        <p className="text-white/25 font-body text-[10px]">
          🎓 Real machine learning — trained live in your browser!
        </p>
      </div>
    </div>
  );
}
