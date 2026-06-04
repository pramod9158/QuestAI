import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface WebcamCaptureHandle {
  getVideoElement: () => HTMLVideoElement | null;
}

interface Props {
  active: boolean;
  mirrored?: boolean;
}

const WebcamCapture = forwardRef<WebcamCaptureHandle, Props>(({ active, mirrored = true }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 224, height: 224, facingMode: 'user' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      } catch (e) {
        console.warn('Webcam not available:', e);
      }
    };

    if (active) startCam();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [active]);

  useImperativeHandle(ref, () => ({
    getVideoElement: () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2) return null;
      return video;
    },
  }));

  return (
    <div className="relative w-full aspect-square overflow-hidden"
      style={{ border: '3px solid #000', boxShadow: '3px 3px 0px #000', background: '#0F0A2E' }}>
      {active ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
          <div className="text-5xl opacity-30">📷</div>
          <p className="text-white/30 font-body text-xs text-center px-4">
            Camera will activate when you start training
          </p>
        </div>
      )}

      {/* Corner decorations */}
      {active && (
        <>
          <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-[#7C3AED]" />
          <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-[#7C3AED]" />
          <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-[#7C3AED]" />
          <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-[#7C3AED]" />
          {/* Scanning line animation */}
          <div
            className="absolute left-0 right-0 h-0.5 opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent, #7C3AED, transparent)',
              animation: 'scanline 2s linear infinite',
            }}
          />
        </>
      )}
    </div>
  );
});

WebcamCapture.displayName = 'WebcamCapture';
export default WebcamCapture;
