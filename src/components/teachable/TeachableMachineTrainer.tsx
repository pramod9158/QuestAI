import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XPToast } from '@/components/ui/GameUI';
import MissionSelector, { Mission } from './MissionSelector';
import WebcamCapture, { WebcamCaptureHandle } from './WebcamCapture';
import ClassTrainer from './ClassTrainer';
import PredictionDisplay from './PredictionDisplay';
import TrainingNarrator from './TrainingNarrator';
import type { MobileNet } from '@tensorflow-models/mobilenet';
import type { KNNClassifier } from '@tensorflow-models/knn-classifier';

type Phase = 'mission' | 'training' | 'predicting' | 'complete';

interface PredictionResult {
  label: string;
  emoji: string;
  confidence: number;
}

const MIN_SAMPLES_PER_CLASS = 10;
const CLASS_COLORS = ['#7C3AED', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];

// XP milestones
const MILESTONES = [
  { samples: 10, xp: 20, msg: 'First 10 samples!' },
  { samples: 30, xp: 30, msg: '30 training samples!' },
  { samples: 60, xp: 50, msg: '60 samples — AI expert!' },
];

interface TeachableMachineTrainerProps {
  onComplete?: () => void;
}

export default function TeachableMachineTrainer({ onComplete }: TeachableMachineTrainerProps = {}) {
  const [phase, setPhase] = useState<Phase>('mission');
  const [mission, setMission] = useState<Mission | null>(null);
  const [loadingModel, setLoadingModel] = useState(false);
  const [modelReady, setModelReady] = useState(false);
  const [sampleCounts, setSampleCounts] = useState<number[]>([]);
  const [capturingClass, setCapturingClass] = useState<number | null>(null);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [xpAmount, setXpAmount] = useState(0);
  const [xpMsg, setXpMsg] = useState('');
  const [earnedXP, setEarnedXP] = useState(0);
  const [milestonesHit, setMilestonesHit] = useState<Set<number>>(new Set());
  const [firstPrediction, setFirstPrediction] = useState(false);
  const [customLabels, setCustomLabels] = useState<string[]>([]);
  const [editingCustom, setEditingCustom] = useState(false);

  // TF refs (lazy loaded)
  const tfRef = useRef<typeof import('@tensorflow/tfjs') | null>(null);
  const mobileNetRef = useRef<MobileNet | null>(null);
  const knnRef = useRef<KNNClassifier | null>(null);
  const webcamRef = useRef<WebcamCaptureHandle>(null);
  const capturingRef = useRef(false);
  const predictingRef = useRef(false);
  const captureIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const predictIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const totalSamplesRef = useRef(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (captureIntervalRef.current) clearInterval(captureIntervalRef.current);
      if (predictIntervalRef.current) clearInterval(predictIntervalRef.current);
    };
  }, []);

  const loadModels = useCallback(async () => {
    setLoadingModel(true);
    try {
      // Lazy import for code splitting
      const [tf, mobilenet, knnClassifier] = await Promise.all([
        import('@tensorflow/tfjs'),
        import('@tensorflow-models/mobilenet'),
        import('@tensorflow-models/knn-classifier'),
      ]);

      await tf.ready();
      tfRef.current = tf;

      // Load MobileNet (feature extractor)
      const net = await mobilenet.load();
      mobileNetRef.current = net;

      // Create KNN classifier
      knnRef.current = knnClassifier.create();

      setModelReady(true);
    } catch (err) {
      console.error('Failed to load TF models:', err);
    } finally {
      setLoadingModel(false);
    }
  }, []);

  const handleSelectMission = useCallback((m: Mission) => {
    setMission(m);
    setSampleCounts(new Array(m.classes.length).fill(0));
    if (m.id === 'custom') {
      setCustomLabels(m.classes.map(c => c.label));
      setEditingCustom(true);
    }
    setPhase('training');
    loadModels();
  }, [loadModels]);

  // Hold-to-capture
  const startCapture = useCallback((classIndex: number) => {
    if (!modelReady || !mobileNetRef.current || !knnRef.current) return;
    setCapturingClass(classIndex);
    capturingRef.current = true;

    captureIntervalRef.current = setInterval(async () => {
      if (!capturingRef.current) return;
      const video = webcamRef.current?.getVideoElement();
      if (!video || !mobileNetRef.current || !knnRef.current || !tfRef.current) return;

      try {
        const tf = tfRef.current;
        // Get embeddings from MobileNet intermediate layer
        const embedding = mobileNetRef.current.infer(video, true) as any;
        knnRef.current.addExample(embedding, classIndex);

        setSampleCounts(prev => {
          const next = [...prev];
          next[classIndex] = (next[classIndex] || 0) + 1;
          return next;
        });

        totalSamplesRef.current += 1;

        // Check milestones
        const total = totalSamplesRef.current;
        MILESTONES.forEach(m => {
          if (total === m.samples && !milestonesHit.has(m.samples)) {
            setMilestonesHit(prev => new Set([...prev, m.samples]));
            setXpAmount(m.xp);
            setXpMsg(m.msg);
            setEarnedXP(prev => prev + m.xp);
            setShowXP(true);
          }
        });

        tf.dispose(embedding);
      } catch (e) {
        console.warn('Capture error:', e);
      }
    }, 150); // Capture ~6 frames per second
  }, [modelReady, milestonesHit]);

  const stopCapture = useCallback(() => {
    capturingRef.current = false;
    setCapturingClass(null);
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }
  }, []);

  const classesReady = sampleCounts.filter(c => c >= MIN_SAMPLES_PER_CLASS).length;
  const allReady = mission ? classesReady === mission.classes.length : false;

  const startPredicting = useCallback(() => {
    if (!modelReady || !knnRef.current || !mobileNetRef.current) return;
    setPhase('predicting');
    setIsPredicting(true);
    predictingRef.current = true;

    predictIntervalRef.current = setInterval(async () => {
      if (!predictingRef.current || !knnRef.current || !mobileNetRef.current || !tfRef.current) return;
      const numClasses = knnRef.current.getNumClasses();
      if (numClasses === 0) return;

      const video = webcamRef.current?.getVideoElement();
      if (!video) return;

      const tf = tfRef.current;
      try {
        const embedding = mobileNetRef.current.infer(video, true) as any;
        const result = await knnRef.current.predictClass(embedding, 3);

        if (mission) {
          const preds: PredictionResult[] = mission.classes.map((cls, i) => ({
            label: (mission.id === 'custom' && customLabels[i]) ? customLabels[i] : cls.label,
            emoji: cls.emoji,
            confidence: result.confidences[i] ?? 0,
          }));
          setPredictions(preds);

          if (!firstPrediction) {
            setFirstPrediction(true);
            setXpAmount(40);
            setXpMsg('First AI Prediction! 🔮');
            setEarnedXP(prev => prev + 40);
            setShowXP(true);
          }
        }

        tf.dispose(embedding);
      } catch (e) {
        console.warn('Prediction error:', e);
      }
    }, 200);
  }, [modelReady, mission, firstPrediction, customLabels]);

  const stopPredicting = useCallback(() => {
    predictingRef.current = false;
    setIsPredicting(false);
    if (predictIntervalRef.current) {
      clearInterval(predictIntervalRef.current);
      predictIntervalRef.current = null;
    }
    setPhase('complete');
    setXpAmount(100);
    setXpMsg('Mission Complete! 🏆');
    setEarnedXP(prev => prev + 100);
    setShowXP(true);
    onComplete?.();
  }, [onComplete]);

  const resetAll = useCallback(() => {
    stopCapture();
    stopPredicting();
    knnRef.current?.clearAllClasses();
    setPhase('mission');
    setMission(null);
    setSampleCounts([]);
    setPredictions([]);
    setFirstPrediction(false);
    setEarnedXP(0);
    setMilestonesHit(new Set());
    totalSamplesRef.current = 0;
    setCustomLabels([]);
    setEditingCustom(false);
  }, [stopCapture, stopPredicting]);

  const totalSamples = sampleCounts.reduce((a, b) => a + b, 0);
  const topPrediction = predictions.length > 0
    ? predictions.reduce((a, b) => a.confidence > b.confidence ? a : b)
    : null;

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" style={{ background: '#0F0A2E', minHeight: '300px' }}>
      {showXP && <XPToast amount={xpAmount} reason={xpMsg} onDone={() => setShowXP(false)} />}

      {/* ── MISSION SELECTION ── */}
      {phase === 'mission' && (
        <MissionSelector onSelect={handleSelectMission} />
      )}

      {/* ── TRAINING + PREDICTING ── */}
      {(phase === 'training' || phase === 'predicting') && mission && (
        <div className="flex flex-col flex-1">
          {/* Narrator */}
          <TrainingNarrator
            phase={phase}
            totalSamples={totalSamples}
            classesReady={classesReady}
            totalClasses={mission.classes.length}
            topConfidence={topPrediction?.confidence}
          />

          {/* Main content */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Mission badge */}
            <div
              className="px-4 py-2 flex items-center justify-between"
              style={{ background: '#16103A', borderBottom: '2px solid #000' }}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl">{mission.emoji}</span>
                <span className="font-game text-xs text-white">{mission.title}</span>
              </div>
              <div className="flex items-center gap-2">
                {earnedXP > 0 && (
                  <span className="font-pixel text-[7px] text-[#F59E0B]">+{earnedXP} XP earned</span>
                )}
                <button
                  onClick={resetAll}
                  className="font-pixel text-[7px] text-white/30 hover:text-white/60 border border-white/10 px-2 py-1"
                >
                  ← Change
                </button>
              </div>
            </div>

            {/* Webcam */}
            <div className="px-4 pt-3">
              <WebcamCapture
                ref={webcamRef}
                active={phase === 'training' || phase === 'predicting'}
              />
            </div>

            {/* Loading model indicator */}
            {loadingModel && (
              <div className="flex items-center justify-center gap-3 py-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="text-2xl"
                >
                  🧠
                </motion.div>
                <div>
                  <p className="text-white font-game text-xs">Loading AI Brain...</p>
                  <p className="text-white/40 font-body text-[10px]">Downloading MobileNet model (~8MB)</p>
                </div>
              </div>
            )}

            {/* TRAINING PHASE */}
            {phase === 'training' && (
              <div className="px-4 py-3 space-y-3">
                {/* Custom label editor */}
                {mission.id === 'custom' && editingCustom && (
                  <div
                    className="p-3 space-y-2"
                    style={{ background: '#16103A', border: '2px solid #7C3AED' }}
                  >
                    <p className="font-game text-xs text-white">✏️ Name Your Classes:</p>
                    {mission.classes.map((cls, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-lg">{cls.emoji}</span>
                        <input
                          type="text"
                          value={customLabels[i] || ''}
                          onChange={e => {
                            const next = [...customLabels];
                            next[i] = e.target.value;
                            setCustomLabels(next);
                          }}
                          placeholder={`Class ${i + 1} name...`}
                          maxLength={20}
                          className="flex-1 px-2 py-1 font-body text-xs text-white bg-black/40 border border-white/20 outline-none focus:border-[#7C3AED]"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => setEditingCustom(false)}
                      className="w-full py-1.5 font-game text-xs text-white"
                      style={{ background: '#7C3AED', border: '2px solid #000', boxShadow: '2px 2px 0px #000' }}
                    >
                      ✅ Save Names & Start Training
                    </button>
                  </div>
                )}

                {!editingCustom && mission.classes.map((cls, i) => (
                  <ClassTrainer
                    key={i}
                    classInfo={
                      mission.id === 'custom'
                        ? { ...cls, label: customLabels[i] || cls.label }
                        : cls
                    }
                    classIndex={i}
                    sampleCount={sampleCounts[i] || 0}
                    isCapturing={capturingClass === i}
                    isActive={capturingClass === i}
                    color={CLASS_COLORS[i % CLASS_COLORS.length]}
                    onStartCapture={() => {
                      if (modelReady) startCapture(i);
                    }}
                    onStopCapture={stopCapture}
                  />
                ))}

                {/* Start Predicting CTA */}
                {!editingCustom && (
                  <AnimatePresence>
                    {allReady ? (
                      <motion.button
                        key="start-pred"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={startPredicting}
                        className="w-full py-4 font-game text-sm text-white"
                        style={{
                          background: `linear-gradient(135deg, ${mission.gradFrom}, ${mission.gradTo})`,
                          border: '3px solid #000',
                          boxShadow: '4px 4px 0px #000',
                        }}
                      >
                        🔮 Test My AI! ({totalSamples} samples trained)
                      </motion.button>
                    ) : (
                      <div
                        className="py-3 text-center"
                        style={{ background: '#16103A', border: '2px dashed rgba(255,255,255,0.1)' }}
                      >
                        <p className="text-white/40 font-body text-xs">
                          Train all {mission.classes.length} classes to unlock prediction
                        </p>
                        <p className="text-white/25 font-pixel text-[7px] mt-1">
                          {classesReady}/{mission.classes.length} classes ready
                        </p>
                      </div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            )}

            {/* PREDICTING PHASE */}
            {phase === 'predicting' && (
              <div className="px-4 py-3">
                <PredictionDisplay
                  predictions={predictions}
                  topPrediction={topPrediction}
                  missionColor={mission.gradFrom}
                />

                <button
                  onClick={stopPredicting}
                  className="w-full mt-3 py-3 font-game text-xs text-white/70"
                  style={{ background: '#16103A', border: '2px solid rgba(255,255,255,0.1)' }}
                >
                  🏆 Finish & Claim XP
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMPLETE PHASE ── */}
      {phase === 'complete' && (
        <div className="flex flex-col items-center justify-center flex-1 p-6 gap-5 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className="text-7xl"
          >
            🏆
          </motion.div>
          <div>
            <h2 className="font-game text-lg text-white">Mission Complete!</h2>
            <p className="text-white/60 font-body text-sm mt-2">
              You trained a real AI model using Machine Learning!
            </p>
          </div>

          <div
            className="w-full p-4 space-y-2"
            style={{ background: '#16103A', border: '3px solid #10B981', boxShadow: '4px 4px 0px #000' }}
          >
            <p className="font-pixel text-[8px] text-[#10B981] uppercase tracking-wider">🎓 What You Learned:</p>
            <ul className="text-white/70 font-body text-xs space-y-1 text-left">
              <li>✅ Training data makes AI smarter</li>
              <li>✅ More examples = higher confidence</li>
              <li>✅ AI uses patterns — not memory!</li>
              <li>✅ You can train AI on anything visual</li>
            </ul>
          </div>

          <div className="font-game text-[#F59E0B] text-sm">
            Total XP earned: +{earnedXP} XP
          </div>

          <button
            onClick={resetAll}
            className="w-full py-3 font-game text-sm text-white"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #3B82F6)',
              border: '3px solid #000',
              boxShadow: '4px 4px 0px #000',
            }}
          >
            🔄 Train a New Mission
          </button>
        </div>
      )}

      {/* Scanline CSS */}
      <style>{`
        @keyframes scanline {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
}
