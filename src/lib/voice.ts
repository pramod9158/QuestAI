// Centralized Speech-to-Text and Text-to-Speech helpers

// Retrieve API keys from env
const GROQ_KEYS = [
  import.meta.env.VITE_GROQ_API_KEY || '',
  import.meta.env.VITE_GROQ_API_KEY_2 || '',
  import.meta.env.VITE_GROQ_API_KEY_3 || '',
].filter(key => key !== '' && key !== 'your_groq_api_key_from_groq_console');

// Configurable Endpoints (can be adjusted by users if needed)
const LOCAL_STT_ENDPOINT = 'http://localhost:8000/v1/audio/transcriptions';
const LOCAL_TTS_ENDPOINT = 'http://localhost:8880/v1/audio/speech';
const LOCAL_TTS_FALLBACK = 'http://localhost:8000/v1/audio/speech';

/**
 * Helper to get active Groq API key (rotates if first fails)
 */
let groqKeyIndex = 0;
function getGroqKey(): string {
  if (GROQ_KEYS.length === 0) return '';
  return GROQ_KEYS[groqKeyIndex % GROQ_KEYS.length];
}
function rotateGroqKey() {
  groqKeyIndex++;
}

/**
 * Transcribe recorded audio blob using local faster-whisper or fallback to Groq Whisper API
 */
/**
 * Helper to fetch with a timeout
 */
async function fetchWithTimeout(resource: RequestInfo | URL, options: RequestInit & { timeout?: number }) {
  const { timeout = 800 } = options;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  // 1. Try local faster-whisper endpoint first
  try {
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');
    formData.append('model', 'whisper-1');

    const res = await fetchWithTimeout(LOCAL_STT_ENDPOINT, {
      method: 'POST',
      body: formData,
      timeout: 800,
    });
    if (res.ok) {
      const data = await res.json();
      if (data.text) return data.text.trim();
    }
  } catch (err) {
    console.warn('Local faster-whisper STT failed, trying Groq fallback...', err);
  }

  // 2. Try Groq Whisper API (whisper-large-v3-turbo is extremely fast and accurate)
  if (GROQ_KEYS.length > 0) {
    for (let attempt = 0; attempt < GROQ_KEYS.length; attempt++) {
      const key = getGroqKey();
      try {
        const formData = new FormData();
        // Groq expects the file with a valid audio extension
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('model', 'whisper-large-v3-turbo');
        formData.append('language', 'en'); // 'en' handles Indian accents perfectly on Groq

        const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${key}`,
          },
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          if (data.text) return data.text.trim();
        } else {
          console.warn(`Groq STT failed with key index ${groqKeyIndex}. Rotating key.`);
          rotateGroqKey();
        }
      } catch (err) {
        console.warn(`Groq STT attempt failed with key index ${groqKeyIndex}. Rotating key.`, err);
        rotateGroqKey();
      }
    }
  }

  throw new Error('All speech-to-text endpoints failed. Fallback to real-time speech recognition.');
}

/**
 * Text-to-Speech: Generate spoken audio from text using Kokoro TTS (local) falling back to browser SpeechSynthesis
 */
export async function playSpeech(
  text: string,
  options?: {
    voice?: string;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
): Promise<() => void> {
  const defaultVoice = options?.voice || 'af_heart';
  let audioPlayer: HTMLAudioElement | null = null;
  let isCancelled = false;

  const cancelSpeech = () => {
    isCancelled = true;
    if (audioPlayer) {
      audioPlayer.pause();
      audioPlayer.src = '';
    }
    // Cancel browser synthesis if it was used
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // 1. Try local Kokoro TTS Server (either port 8880 or 8000)
  const ttsEndpoints = [LOCAL_TTS_ENDPOINT, LOCAL_TTS_FALLBACK];
  let speechBlobUrl: string | null = null;

  for (const endpoint of ttsEndpoints) {
    try {
      const res = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'kokoro',
          input: text,
          voice: defaultVoice,
          response_format: 'mp3',
        }),
        timeout: 800,
      });

      if (res.ok) {
        const audioBlob = await res.blob();
        if (isCancelled) return cancelSpeech;
        speechBlobUrl = URL.createObjectURL(audioBlob);
        break; // Successfully got the audio blob!
      }
    } catch (err) {
      console.warn(`Kokoro TTS at ${endpoint} failed, trying next...`);
    }
  }

  // 2. Play the Kokoro audio if successfully generated
  if (speechBlobUrl) {
    try {
      options?.onStart?.();
      audioPlayer = new Audio(speechBlobUrl);
      
      // Pitch-shift to sound cute, clear, and Emo-like:
      // Turn off pitch preservation so speed-up shifts pitch up
      if ('preservesPitch' in audioPlayer) {
        audioPlayer.preservesPitch = false;
      } else if ('webkitPreservesPitch' in audioPlayer) {
        (audioPlayer as any).webkitPreservesPitch = false;
      } else if ('mozPreservesPitch' in audioPlayer) {
        (audioPlayer as any).mozPreservesPitch = false;
      }
      audioPlayer.playbackRate = 1.15; // 15% speed and pitch boost for that cute pet-like sound
      
      audioPlayer.onended = () => {
        if (speechBlobUrl) URL.revokeObjectURL(speechBlobUrl);
        options?.onEnd?.();
      };
      
      audioPlayer.onerror = (e) => {
        if (speechBlobUrl) URL.revokeObjectURL(speechBlobUrl);
        console.warn('Audio playback error, falling back to Web Speech Synthesis:', e);
        playBrowserSynthesis(text, options);
      };

      await audioPlayer.play();
      return cancelSpeech;
    } catch (err) {
      console.warn('Failed playing Kokoro audio, falling back to Web Speech Synthesis:', err);
      if (speechBlobUrl) URL.revokeObjectURL(speechBlobUrl);
      if (isCancelled) return cancelSpeech;
    }
  }

  // 3. Fallback to Browser Speech Synthesis (zero latency, fully local fallback)
  playBrowserSynthesis(text, options);
  return cancelSpeech;
}

/**
 * Browser SpeechSynthesis fallback
 */
function playBrowserSynthesis(
  text: string,
  options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  }
) {
  if (!('speechSynthesis' in window)) {
    console.error('Speech synthesis not supported in this browser.');
    options?.onError?.(new Error('Speech synthesis not supported'));
    return;
  }

  // Cancel any active speech first
  window.speechSynthesis.cancel();

  // Create utterance. We strip out emojis/markdown to make TTS speak cleaner.
  const cleanText = text
    .replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD00-\uDFFF]/g, '')
    .replace(/\*+/g, '') // remove markdown bold/italic asterisks
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  
  // Custom cute, clear, and Emo-like voice settings:
  utterance.rate = 1.12;  // Crisper, energetic speed pacing
  utterance.pitch = 1.35; // Shifted pitch for a cute, child/robot companion timbre

  // Find a friendly English voice (preferably female to match af_heart)
  const voices = window.speechSynthesis.getVoices();
  const femaleVoice = voices.find(
    v =>
      (v.name.toLowerCase().includes('google') || v.name.toLowerCase().includes('natural')) &&
      v.lang.startsWith('en-') &&
      v.name.toLowerCase().includes('female')
  ) || voices.find(
    v => v.lang.startsWith('en-') && (v.name.includes('Zira') || v.name.includes('Samantha') || v.name.includes('Hazel'))
  ) || voices.find(
    v => v.lang.startsWith('en-')
  );

  if (femaleVoice) {
    utterance.voice = femaleVoice;
  }

  utterance.onstart = () => options?.onStart?.();
  utterance.onend = () => options?.onEnd?.();
  utterance.onerror = (e) => options?.onError?.(e);

  window.speechSynthesis.speak(utterance);
}

/**
 * Speech Recognition Wrapper for real-time local transcript feedback while recording
 */
export function createSpeechRecognizer(callbacks: {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (err: any) => void;
  onEnd?: () => void;
}) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  if (!SpeechRecognition) {
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-IN'; // Default to English (India) to support accents nicely

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const fullTranscript = finalTranscript || interimTranscript;
    callbacks.onTranscript(fullTranscript, !!finalTranscript);
  };

  recognition.onerror = (event: any) => {
    if (event.error !== 'no-speech') {
      console.warn('Speech recognition error:', event.error);
      callbacks.onError?.(event);
    }
  };

  recognition.onend = () => {
    callbacks.onEnd?.();
  };

  return recognition;
}
