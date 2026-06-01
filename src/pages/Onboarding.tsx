import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

const ZONES = [
  {
    id: 'junior',
    age: '6–11',
    emoji: '🚀',
    title: 'Junior Explorer',
    desc: 'Discover AI magic through games, stories & fun!',
    color: 'bg-blue-game',
    borderColor: 'border-blue-game',
    shadowColor: 'shadow-pixel-blue',
  },
  {
    id: 'innovator',
    age: '12–16',
    emoji: '🧠',
    title: 'Future Innovator',
    desc: 'Dive into AI ethics, prompts, and real-world problem solving!',
    color: 'bg-primary',
    borderColor: 'border-primary-dark',
    shadowColor: 'shadow-pixel-purple',
  },
];

const AVATARS = ['🤖', '🦾', '🧑‍💻', '👾', '🦁', '🐉', '🦊', '🐸'];

export default function Onboarding() {
  const navigate = useNavigate();
  const { continueAsGuest, user } = useAuth();
  const [step, setStep] = useState(0);
  const [zone, setZone] = useState<'junior' | 'innovator' | null>(null);
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);

  const handleZoneSelect = (z: 'junior' | 'innovator') => {
    setZone(z);
    setStep(1);
  };

  const handleStart = () => {
    if (!username.trim() || !zone) return;
    continueAsGuest(username.trim(), zone);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-pixel-darker bg-pixel-grid flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {/* Step 0: Zone Selection */}
          {step === 0 && (
            <motion.div
              key="zone"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Header */}
              <div className="text-center">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                  className="text-8xl mb-4"
                >
                  🤖
                </motion.div>
                <h1 className="font-pixel text-white text-xl leading-relaxed">AI EXPLORER</h1>
                <p className="font-body text-white/60 text-sm mt-2">Your AI Learning Adventure Awaits!</p>
              </div>

              {/* Pixel divider */}
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

              <p className="font-game text-white text-xl text-center">How old are you?</p>

              <div className="w-full flex flex-col gap-4">
                {ZONES.map((z) => (
                  <motion.button
                    key={z.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleZoneSelect(z.id as 'junior' | 'innovator')}
                    className={`w-full border-4 border-black ${z.color} p-5 flex items-center gap-4 ${z.shadowColor} shadow-pixel text-left`}
                  >
                    <span className="text-5xl">{z.emoji}</span>
                    <div>
                      <div className="text-white font-game text-xl">{z.title}</div>
                      <div className="text-white/80 font-body text-xs">Ages {z.age}</div>
                      <div className="text-white/70 font-body text-sm mt-1">{z.desc}</div>
                    </div>
                  </motion.button>
                ))}
              </div>

              <button
                onClick={() => navigate('/auth')}
                className="text-white/40 font-body text-xs hover:text-white/70 underline"
              >
                Already have an account? Sign in
              </button>
            </motion.div>
          )}

          {/* Step 1: Name + Avatar */}
          {step === 1 && (
            <motion.div
              key="name"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              className="flex flex-col items-center gap-6"
            >
              <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="text-7xl">
                {AVATARS[selectedAvatar]}
              </motion.div>
              <h2 className="font-game text-white text-2xl text-center">Choose Your Explorer Name!</h2>

              {/* Avatar Picker */}
              <div className="w-full">
                <p className="text-white/60 font-body text-sm mb-3 text-center">Pick your avatar:</p>
                <div className="grid grid-cols-4 gap-3">
                  {AVATARS.map((a, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedAvatar(i)}
                      className={`border-4 border-black h-16 flex items-center justify-center text-3xl ${i === selectedAvatar ? 'bg-primary shadow-pixel-purple' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                      {a}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Name Input */}
              <div className="w-full">
                <label className="text-white/70 font-body text-sm mb-2 block">Your Explorer Name:</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. SuperCoder123"
                  className="pixel-input"
                  maxLength={20}
                />
              </div>

              <div className="w-full flex gap-3">
                <Button variant="ghost" onClick={() => setStep(0)} className="flex-1">← Back</Button>
                <Button
                  variant="success"
                  onClick={handleStart}
                  disabled={!username.trim()}
                  className="flex-2"
                  fullWidth
                >
                  START ADVENTURE! 🚀
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
