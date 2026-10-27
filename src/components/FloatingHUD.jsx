import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Minus, 
  Plus, 
  Maximize2, 
  Minimize2, 
  RotateCw,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

export function FloatingHUD({
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
  onRestart,
  onRewind,
  onForward,
  elapsedTime,
  progress,
  isFullscreen,
  onToggleFullscreen,
  autoHide = true
}) {
  const [isIdle, setIsIdle] = useState(false);

  // Auto-hide HUD when playing and mouse is still
  useEffect(() => {
    if (!isPlaying || !autoHide) {
      setIsIdle(false);
      return;
    }

    let timeoutId;
    const handleMouseMove = () => {
      setIsIdle(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (isPlaying) {
          setIsIdle(true);
        }
      }, 2500);
    };

    window.addEventListener('mousemove', handleMouseMove);
    timeoutId = setTimeout(() => setIsIdle(true), 2500);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeoutId);
    };
  }, [isPlaying, autoHide]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className={`floating-hud ${isIdle ? 'hud-autohide' : ''}`}
      onMouseEnter={() => setIsIdle(false)}
    >
      {/* Restart */}
      <button 
        className="btn-icon" 
        onClick={onRestart}
        title="Mulai Ulang (Home / R)"
        aria-label="Restart"
      >
        <RotateCcw size={18} />
      </button>

      {/* Rewind 5s / 100px */}
      <button 
        className="btn-icon" 
        onClick={onRewind}
        title="Mundur sedikit (Panah Kiri)"
        aria-label="Rewind"
      >
        <ChevronsLeft size={18} />
      </button>

      {/* Play/Pause Main Button */}
      <button 
        className={`play-pause-btn ${isPlaying ? 'is-playing' : ''}`}
        onClick={onTogglePlay}
        title={isPlaying ? "Jeda (Spasi)" : "Mulai (Spasi)"}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: '2px' }} />}
      </button>

      {/* Forward 5s / 100px */}
      <button 
        className="btn-icon" 
        onClick={onForward}
        title="Maju sedikit (Panah Kanan)"
        aria-label="Fast Forward"
      >
        <ChevronsRight size={18} />
      </button>

      {/* Speed Controls */}
      <div className="hud-speed-control">
        <button 
          className="btn-icon" 
          onClick={() => onSpeedChange(Math.max(1, speed - 1))}
          title="Kurangi Kecepatan (Panah Bawah)"
          disabled={speed <= 1}
        >
          <Minus size={16} />
        </button>

        <div className="hud-speed-val" title="Kecepatan teks">
          {speed}x
        </div>

        <button 
          className="btn-icon" 
          onClick={() => onSpeedChange(Math.min(20, speed + 1))}
          title="Tambah Kecepatan (Panah Atas)"
          disabled={speed >= 20}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Progress & Time */}
      <div className="metric-pill" title="Waktu & Progres Baca">
        <span>{formatTime(elapsedTime)}</span>
        <span style={{ opacity: 0.4 }}>•</span>
        <span style={{ color: 'var(--accent-cyan)' }}>{Math.round(progress)}%</span>
      </div>

      <div className="hud-divider" />

      {/* Fullscreen */}
      <button 
        className="btn-icon" 
        onClick={onToggleFullscreen}
        title={isFullscreen ? "Keluar Fullscreen (Esc)" : "Layar Penuh (F11 / F)"}
        aria-label="Fullscreen"
      >
        {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>
    </div>
  );
}
