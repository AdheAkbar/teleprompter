import { useState, useEffect, useRef, useCallback } from 'react';

export function useVoiceSync({ isEnabled, onVoiceActive, onVoicePause }) {
  const [isListening, setIsListening] = useState(false);
  const [micVolume, setMicVolume] = useState(0); // 0 to 100
  const [error, setError] = useState(null);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const animFrameRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const isSpeakingRef = useRef(false);

  // Stop microphone
  const stopListening = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    setIsListening(false);
    setMicVolume(0);
    isSpeakingRef.current = false;
  }, []);

  // Start microphone
  const startListening = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioCtx();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.4;
      source.connect(analyser);
      analyserRef.current = analyser;

      setIsListening(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkAudio = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(normalized);

        // Voice detection threshold (~12/100)
        if (normalized > 12) {
          if (!isSpeakingRef.current) {
            isSpeakingRef.current = true;
            onVoiceActive?.();
          }
          // Reset silence timer
          if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = setTimeout(() => {
            isSpeakingRef.current = false;
            onVoicePause?.();
          }, 900); // 900ms silence tolerance
        }

        animFrameRef.current = requestAnimationFrame(checkAudio);
      };

      checkAudio();
    } catch (err) {
      console.warn('Microphone access failed:', err);
      setError('Akses mikrofon ditolak atau tidak tersedia.');
      setIsListening(false);
    }
  }, [onVoiceActive, onVoicePause]);

  useEffect(() => {
    if (isEnabled) {
      startListening();
    } else {
      stopListening();
    }

    return () => stopListening();
  }, [isEnabled, startListening, stopListening]);

  return {
    isListening,
    micVolume,
    error,
    startListening,
    stopListening
  };
}
