import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Send, Square, Volume2, VolumeX, Sparkles, AlertCircle } from 'lucide-react';
import { Mascot } from './Mascot';

interface SparkyMessage {
  role: 'user' | 'model';
  content: string;
}

interface SparkyChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: SparkyMessage[];
  isRecording: boolean;
  isGenerating: boolean;
  isSpeaking: boolean;
  realtimeTranscript: string;
  startVoiceInput: () => void;
  stopVoiceInput: () => void;
  sendMessage: (text: string) => void;
  triggerSparkyAction: (actionType: 'explain' | 'simplify' | 'example' | 'quiz' | 'hint') => void;
  stopAudioPlayback: () => void;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  isDuolingo: boolean;
  ageGroup: '6-8' | '9-12';
}

export function SparkyChatPanel({
  isOpen,
  onClose,
  messages,
  isRecording,
  isGenerating,
  isSpeaking,
  realtimeTranscript,
  startVoiceInput,
  stopVoiceInput,
  sendMessage,
  triggerSparkyAction,
  stopAudioPlayback,
  isMuted,
  setIsMuted,
  isDuolingo,
  ageGroup,
}: SparkyChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive or when typing/generating
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isGenerating, realtimeTranscript]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleReplayLastMessage = () => {
    // Find the last model message and speak it
    const modelMessages = messages.filter(m => m.role === 'model');
    if (modelMessages.length > 0) {
      const lastMsg = modelMessages[modelMessages.length - 1];
      // Simply trigger speaking by sending a dummy speak signal, or rather calling parent audio playback
      // For simplicity, we re-invoke playResponseSpeech through parent trigger or trigger replay
      // We'll let stopAudioPlayback trigger then re-speak in parent context.
      // Let's implement speaking the last text by calling sendMessage with special replay prompt or direct playback.
      // A clean way is to stop current speech and let the parent re-trigger speaking the last text.
      // We can also let the parent context handle a replay method, which we can call.
      // Here, we can trigger playResponseSpeech on the text. Since it's handled in the context, we can add it or just re-trigger it.
      // Let's call the parent stopAudioPlayback first, then trigger custom action or speaking.
      // Actually, we can just trigger a prompt like "Can you repeat that?" or let parent handle replay.
      sendMessage("Can you repeat that last explanation?");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="fixed bottom-[96px] right-4 left-4 max-w-[calc(100%-32px)] md:max-w-[380px] h-[500px] z-[160] flex flex-col pointer-events-auto"
          style={
            isDuolingo
              ? {
                  background: '#FFFFFF',
                  border: '2px solid #E0E0E0',
                  borderRadius: '24px',
                  boxShadow: '0 12px 36px rgba(0,0,0,0.15)',
                  fontFamily: '"Nunito", sans-serif',
                }
              : {
                  background: '#1A1144',
                  border: '4px solid #000000',
                  borderRadius: '0px',
                  boxShadow: '6px 6px 0px #000000',
                  fontFamily: '"Fredoka One", cursive',
                }
          }
        >
          {/* Header */}
          <div
            className="p-3 flex items-center justify-between border-b"
            style={{
              borderColor: isDuolingo ? '#E5E7EB' : '#000000',
              borderWidth: isDuolingo ? '0 0 1.5px 0' : '0 0 4px 0',
              background: isDuolingo ? '#F9FAFB' : '#110933',
              borderRadius: isDuolingo ? '22px 22px 0 0' : '0px',
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center relative overflow-visible"
                style={{
                  background: isDuolingo ? 'linear-gradient(135deg, #7C3AED, #3B82F6)' : 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                  border: isDuolingo ? '1.5px solid #FFFFFF' : '2.5px solid #000000',
                }}
              >
                <Mascot
                  mood={isGenerating ? 'thinking' : isSpeaking ? 'excited' : 'guiding'}
                  pose={isGenerating ? 'thinking' : isSpeaking ? 'speaking' : 'idle'}
                  size={32}
                />
              </div>
              <div>
                <h3 className={isDuolingo ? "font-bold text-sm text-gray-800" : "font-pixel text-[8px] text-white tracking-wider"}>
                  {isDuolingo ? 'Sparky' : 'SPARKY'}
                </h3>
                <span className={isDuolingo ? "text-[10px] text-gray-500 font-semibold" : "font-pixel text-[6px] text-purple-300"}>
                  {isDuolingo 
                    ? `AI Learning Partner (${ageGroup === '6-8' ? 'Grade 6-8' : 'Grade 9-12'})` 
                    : `LEARNING COMPANION (${ageGroup === '6-8' ? 'JR' : 'SR'})`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Playback Interrupter / Replay / Mute Controls */}
              {isSpeaking && (
                <button
                  onClick={stopAudioPlayback}
                  className="p-1.5 rounded-lg border hover:bg-gray-100 dark:hover:bg-purple-950/20 text-red-500 cursor-pointer"
                  style={{ borderColor: isDuolingo ? '#E5E7EB' : '#000000', borderWidth: isDuolingo ? 1.5 : 2 }}
                  title="Stop Audio Playback"
                >
                  <Square className="w-3.5 h-3.5 fill-red-500" />
                </button>
              )}

              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`p-1.5 rounded-lg border cursor-pointer ${isMuted ? 'text-gray-400 bg-gray-100' : 'text-purple-600 hover:bg-purple-50'}`}
                style={{ borderColor: isDuolingo ? '#E5E7EB' : '#000000', borderWidth: isDuolingo ? 1.5 : 2 }}
                title={isMuted ? 'Unmute voice responses' : 'Mute voice responses'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={onClose}
                className={isDuolingo ? "text-gray-400 hover:text-gray-600 transition-colors text-sm font-bold p-1 cursor-pointer" : "text-white/60 hover:text-white transition-colors text-[9px] p-1 font-mono cursor-pointer"}
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto p-3 flex flex-col gap-3"
            style={{
              backgroundColor: isDuolingo ? '#FFFFFF' : '#0D082A',
            }}
          >
            {messages.map((msg, index) => {
              const isSparky = msg.role === 'model';
              return (
                <div
                  key={index}
                  className={`flex ${isSparky ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className="max-w-[85%] p-3 text-xs leading-relaxed"
                    style={
                      isSparky
                        ? isDuolingo
                          ? {
                              background: '#F3F4F6',
                              color: '#374151',
                              borderRadius: '16px 16px 16px 4px',
                            }
                          : {
                              background: '#22155C',
                              color: '#FFFFFF',
                              border: '2px solid #000000',
                              boxShadow: '3px 3px 0px #000',
                              borderRadius: '0px',
                            }
                        : isDuolingo
                        ? {
                            background: '#5FCC5F',
                            color: '#FFFFFF',
                            borderRadius: '16px 16px 4px 16px',
                            fontWeight: 600,
                          }
                        : {
                            background: '#7C3AED',
                            color: '#FFFFFF',
                            border: '2px solid #000000',
                            boxShadow: '3px 3px 0px #000',
                            borderRadius: '0px',
                          }
                    }
                  >
                    <p>{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {/* Realtime voice input feedback */}
            {isRecording && realtimeTranscript && (
              <div className="flex justify-end">
                <div
                  className="max-w-[85%] p-3 text-xs leading-relaxed italic opacity-80"
                  style={
                    isDuolingo
                      ? {
                          background: '#E8FBE8',
                          color: '#1EBC6B',
                          borderRadius: '16px 16px 4px 16px',
                        }
                      : {
                          background: '#1F3C2C',
                          color: '#5FCC5F',
                          border: '2px solid #000000',
                          borderRadius: '0px',
                        }
                  }
                >
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    "{realtimeTranscript}"
                  </span>
                </div>
              </div>
            )}

            {/* AI thinking state */}
            {isGenerating && (
              <div className="flex justify-start">
                <div
                  className="max-w-[85%] p-3 text-xs flex items-center gap-2"
                  style={
                    isDuolingo
                      ? {
                          background: '#F3F4F6',
                          color: '#6B7280',
                          borderRadius: '16px 16px 16px 4px',
                        }
                      : {
                          background: '#22155C',
                          color: '#A78BFA',
                          border: '2px solid #000000',
                          borderRadius: '0px',
                        }
                  }
                >
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                    className="text-base"
                  >
                    🧠
                  </motion.span>
                  <span>{isDuolingo ? 'Sparky is thinking...' : 'SPARKY IS THINKING...'}</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Analogies / Actions Bar */}
          <div
            className="px-2.5 py-1.5 overflow-x-auto flex gap-1.5 whitespace-nowrap scrollbar-none"
            style={{
              background: isDuolingo ? '#F9FAFB' : '#150E3E',
              borderTop: isDuolingo ? '1px solid #E5E7EB' : '2px solid #000000',
            }}
          >
            <button
              onClick={() => triggerSparkyAction('explain')}
              disabled={isGenerating || isRecording}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border cursor-pointer hover:bg-purple-100 disabled:opacity-50 transition-colors"
              style={
                isDuolingo
                  ? { borderColor: '#E0E0E0', color: '#7C3AED', background: '#FFFFFF', fontWeight: 700 }
                  : { borderColor: '#000000', borderWidth: 2, color: '#FFD60A', background: '#000000' }
              }
            >
              <Sparkles className="w-3 h-3 text-[#B366FF]" />
              Explain Differently
            </button>

            <button
              onClick={() => triggerSparkyAction('simplify')}
              disabled={isGenerating || isRecording}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border cursor-pointer hover:bg-purple-100 disabled:opacity-50 transition-colors"
              style={
                isDuolingo
                  ? { borderColor: '#E0E0E0', color: '#7C3AED', background: '#FFFFFF', fontWeight: 700 }
                  : { borderColor: '#000000', borderWidth: 2, color: '#FFD60A', background: '#000000' }
              }
            >
              Make It Easier
            </button>

            <button
              onClick={() => triggerSparkyAction('example')}
              disabled={isGenerating || isRecording}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border cursor-pointer hover:bg-purple-100 disabled:opacity-50 transition-colors"
              style={
                isDuolingo
                  ? { borderColor: '#E0E0E0', color: '#7C3AED', background: '#FFFFFF', fontWeight: 700 }
                  : { borderColor: '#000000', borderWidth: 2, color: '#FFD60A', background: '#000000' }
              }
            >
              Show Example
            </button>

            <button
              onClick={() => triggerSparkyAction('quiz')}
              disabled={isGenerating || isRecording}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border cursor-pointer hover:bg-purple-100 disabled:opacity-50 transition-colors"
              style={
                isDuolingo
                  ? { borderColor: '#E0E0E0', color: '#7C3AED', background: '#FFFFFF', fontWeight: 700 }
                  : { borderColor: '#000000', borderWidth: 2, color: '#FFD60A', background: '#000000' }
              }
            >
              Quiz Me
            </button>

            <button
              onClick={() => triggerSparkyAction('hint')}
              disabled={isGenerating || isRecording}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border cursor-pointer hover:bg-purple-100 disabled:opacity-50 transition-colors"
              style={
                isDuolingo
                  ? { borderColor: '#E0E0E0', color: '#7C3AED', background: '#FFFFFF', fontWeight: 700 }
                  : { borderColor: '#000000', borderWidth: 2, color: '#FFD60A', background: '#000000' }
              }
            >
              Give Hint
            </button>
          </div>

          {/* Input Panel */}
          <div
            className="p-3 flex items-center gap-2"
            style={{
              background: isDuolingo ? '#FFFFFF' : '#1A1144',
              borderRadius: isDuolingo ? '0 0 22px 22px' : '0px',
              borderTop: isDuolingo ? '1.5px solid #E5E7EB' : '4px solid #000000',
            }}
          >
            {/* Recording Button */}
            <motion.button
              onClick={isRecording ? stopVoiceInput : startVoiceInput}
              disabled={isGenerating}
              whileTap={{ scale: 0.9 }}
              animate={isRecording ? { scale: [1, 1.1, 1], rotate: [0, -2, 2, 0] } : {}}
              transition={isRecording ? { repeat: Infinity, duration: 1 } : {}}
              className="w-10 h-10 flex items-center justify-center cursor-pointer rounded-full disabled:opacity-50 transition-all flex-shrink-0"
              style={
                isRecording
                  ? {
                      background: '#FF4D4D',
                      boxShadow: '0 0 12px rgba(255, 77, 77, 0.6)',
                      border: isDuolingo ? 'none' : '2.5px solid #000000',
                    }
                  : isDuolingo
                  ? {
                      background: '#7C3AED',
                      color: '#FFFFFF',
                      border: 'none',
                    }
                  : {
                      background: '#10B981',
                      border: '2.5px solid #000000',
                      boxShadow: '2px 2px 0px #000',
                    }
              }
            >
              {isRecording ? (
                <Square className="w-4.5 h-4.5 text-white fill-white" />
              ) : (
                <Mic className="w-4.5 h-4.5 text-white" />
              )}
            </motion.button>

            {/* Recording visualizer overlay or standard input box */}
            <div className="flex-1 relative flex items-center">
              {isRecording ? (
                <div className="flex-1 h-9 px-3 rounded-full flex items-center justify-between overflow-hidden bg-red-50 text-[10px] text-red-500 font-semibold animate-pulse">
                  <span>Listening... Talk to Sparky!</span>
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-0.5 bg-red-500 rounded-full"
                        style={{
                          height: 12,
                          animation: `soundwave-pulse 0.4s ease-in-out infinite alternate ${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <input
                  type="text"
                  placeholder={isDuolingo ? "Ask Sparky a doubt..." : "ASK SPARKY A DOUBT..."}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isGenerating}
                  className="w-full h-9 px-3 text-xs outline-none"
                  style={
                    isDuolingo
                      ? {
                          background: '#F3F4F6',
                          border: '1.5px solid #E5E7EB',
                          borderRadius: '18px',
                          color: '#374151',
                        }
                      : {
                          background: '#0D082A',
                          border: '2.5px solid #000000',
                          color: '#FFFFFF',
                          borderRadius: '0px',
                        }
                  }
                />
              )}
            </div>

            {/* Send Button */}
            {!isRecording && (
              <motion.button
                onClick={handleSend}
                disabled={isGenerating || !inputText.trim()}
                whileTap={{ scale: 0.9 }}
                className="w-9 h-9 flex items-center justify-center cursor-pointer rounded-full disabled:opacity-50 flex-shrink-0"
                style={
                  isDuolingo
                    ? {
                        background: '#5FCC5F',
                        color: '#FFFFFF',
                      }
                    : {
                        background: '#FFD60A',
                        border: '2px solid #000000',
                        boxShadow: '2px 2px 0px #000',
                        color: '#000000',
                      }
                }
              >
                <Send className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Styled animation for voice soundwaves */}
      <style>{`
        @keyframes soundwave-pulse {
          from { height: 4px; }
          to { height: 16px; }
        }
      `}</style>
    </AnimatePresence>
  );
}
