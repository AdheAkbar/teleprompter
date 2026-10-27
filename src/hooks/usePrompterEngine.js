import { useState, useEffect, useRef, useCallback } from 'react';

export function usePrompterEngine({ speed = 5, isPlaying = false, onComplete }) {
  const containerRef = useRef(null);
  const scrollPosRef = useRef(0);
  const lastTimeRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [progress, setProgress] = useState(0); // 0 to 100
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Speed mapping: speed 1 = 16px/s, speed 5 = 48px/s, speed 10 = 92px/s, speed 20 = 190px/s
  const getPixelsPerSecond = useCallback((spd) => {
    return Math.max(8, spd * 9.5 + 5);
  }, []);

  // Update progress helper
  const updateProgress = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) {
      setProgress(0);
      setIsAtBottom(false);
      return;
    }
    const current = el.scrollTop;
    const pct = Math.min(100, Math.max(0, (current / maxScroll) * 100));
    setProgress(pct);

    if (current >= maxScroll - 5) {
      setIsAtBottom(true);
    } else {
      setIsAtBottom(false);
    }
  }, []);

  // Handle manual user scroll (wheel, drag, touch)
  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      scrollPosRef.current = containerRef.current.scrollTop;
      updateProgress();
    }
  }, [updateProgress]);

  // Jump relative pixels (e.g. forward/backward 100px)
  const jump = useCallback((deltaPx) => {
    if (containerRef.current) {
      const newPos = Math.max(0, containerRef.current.scrollTop + deltaPx);
      containerRef.current.scrollTop = newPos;
      scrollPosRef.current = newPos;
      updateProgress();
    }
  }, [updateProgress]);

  // Restart back to top
  const restart = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      scrollPosRef.current = 0;
      setElapsedTime(0);
      setIsAtBottom(false);
      setProgress(0);
    }
  }, []);

  // Seek to specific percentage (0 to 100)
  const seekTo = useCallback((pct) => {
    if (containerRef.current) {
      const maxScroll = containerRef.current.scrollHeight - containerRef.current.clientHeight;
      const targetPos = (pct / 100) * maxScroll;
      containerRef.current.scrollTop = targetPos;
      scrollPosRef.current = targetPos;
      updateProgress();
    }
  }, [updateProgress]);

  // Main 60 FPS animation loop
  useEffect(() => {
    if (!isPlaying) {
      lastTimeRef.current = null;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      return;
    }

    const animate = (time) => {
      if (lastTimeRef.current == null) {
        lastTimeRef.current = time;
        animFrameIdRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaMs = time - lastTimeRef.current;
      lastTimeRef.current = time;

      // Cap deltaMs to avoid massive jumps if tab was backgrounded
      const safeDeltaMs = Math.min(deltaMs, 100);
      const pxPerSec = getPixelsPerSecond(speed);
      const pxToMove = (pxPerSec * safeDeltaMs) / 1000;

      if (containerRef.current) {
        const el = containerRef.current;
        const maxScroll = el.scrollHeight - el.clientHeight;

        if (maxScroll > 0) {
          scrollPosRef.current += pxToMove;

          if (scrollPosRef.current >= maxScroll) {
            scrollPosRef.current = maxScroll;
            el.scrollTop = maxScroll;
            updateProgress();
            setIsAtBottom(true);
            if (onComplete) onComplete();
            return; // Finished scrolling
          }

          el.scrollTop = scrollPosRef.current;
          updateProgress();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, speed, getPixelsPerSecond, updateProgress, onComplete]);

  // Elapsed timer ticker
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return {
    containerRef,
    progress,
    elapsedTime,
    isAtBottom,
    handleScroll,
    jump,
    restart,
    seekTo,
    updateProgress
  };
}
