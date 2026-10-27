import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Sliders, 
  FileText, 
  FolderOpen, 
  FlipHorizontal, 
  Maximize, 
  Minimize, 
  Clock, 
  Type,
  Eye,
  Mic,
  MicOff,
  ExternalLink
} from 'lucide-react';

export function Navbar({
  activeScript,
  onOpenLibrary,
  onOpenEditor,
  onOpenSettings,
  isPlaying,
  mirrorMode,
  onToggleMirror,
  showGuide,
  onToggleGuide,
  isFullscreen,
  onToggleFullscreen,
  elapsedTime,
  wordCount,
  hideOnPlay = true,
  isVoiceFollow = false,
  onToggleVoiceFollow,
  micVolume = 0,
  onOpenGlassMode
}) {
  const [isHovered, setIsHovered] = useState(false);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isHidden = isPlaying && hideOnPlay && !isHovered;

  return (
    <header 
      className={`top-navbar ${isHidden ? 'hidden-on-play' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left: Brand */}
      <div className="nav-brand" onClick={onOpenLibrary} title="Buka Koleksi Naskah">
        <div className="brand-icon">
          <Tv size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-title">TeleCast Pro</span>
            <span className="brand-badge">Local</span>
          </div>
        </div>
      </div>

      {/* Center: Script Selector & Status */}
      <div className="nav-center">
        <button 
          className="script-selector-btn"
          onClick={onOpenLibrary}
          title="Ganti Naskah (Klik untuk melihat daftar)"
        >
          <FolderOpen size={16} style={{ color: 'var(--accent-cyan)' }} />
          <span>{activeScript ? activeScript.title : 'Pilih Naskah...'}</span>
        </button>

        {/* Live Status Pill */}
        <div className={`metric-pill ${isPlaying ? 'recording' : ''}`}>
          {isPlaying && <div className="rec-dot" />}
          <span>{isPlaying ? 'ON AIR' : 'READY'}</span>
        </div>

        {/* Voice Follow Pill if active */}
        {isVoiceFollow && (
          <div 
            className="metric-pill" 
            style={{ 
              borderColor: 'var(--accent-emerald)', 
              color: 'var(--accent-emerald)',
              background: 'rgba(0, 230, 118, 0.1)' 
            }}
            title={`Voice Follow Aktif (Level suara: ${micVolume}%)`}
          >
            <Mic size={12} />
            <span>VOICE MIC {micVolume > 15 ? '●' : '○'}</span>
          </div>
        )}

        {/* Words and Time */}
        <div className="metric-pill">
          <Type size={13} style={{ opacity: 0.6 }} />
          <span>{wordCount} kata</span>
        </div>

        <div className="metric-pill">
          <Clock size={13} style={{ opacity: 0.6 }} />
          <span>{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="nav-right">
        {/* Voice Follow Toggle */}
        <button 
          className={`btn-icon ${isVoiceFollow ? 'active' : ''}`}
          onClick={onToggleVoiceFollow}
          title={isVoiceFollow ? "Matikan Voice Follow Mic" : "Aktifkan Voice Follow Mic (Prompter ikuti suara bicara Anda)"}
          style={isVoiceFollow ? { color: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' } : {}}
        >
          {isVoiceFollow ? <Mic size={18} /> : <MicOff size={18} />}
        </button>

        {/* Dual Screen Glass Launcher */}
        <button 
          className="btn-icon" 
          onClick={onOpenGlassMode}
          title="Buka Layar Kaca Prompter (Jendela Baru Dual Monitor)"
        >
          <ExternalLink size={18} />
        </button>

        {/* Quick Edit */}
        <button 
          className="btn-icon" 
          onClick={onOpenEditor}
          title="Edit Naskah Ini"
        >
          <FileText size={18} />
        </button>

        {/* Guide Toggle */}
        <button 
          className={`btn-icon ${showGuide ? 'active' : ''}`}
          onClick={onToggleGuide}
          title="Garis Panduan Mata (G)"
        >
          <Eye size={18} />
        </button>

        {/* Mirror Mode Quick Toggle */}
        <button 
          className={`btn-icon ${mirrorMode !== 'none' ? 'active' : ''}`}
          onClick={onToggleMirror}
          title={`Mode Cermin / Kaca: ${mirrorMode === 'none' ? 'Normal' : mirrorMode} (M)`}
        >
          <FlipHorizontal size={18} />
        </button>

        {/* Fullscreen */}
        <button 
          className="btn-icon" 
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Keluar Layar Penuh (Esc)" : "Layar Penuh (F11 / F)"}
        >
          {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
        </button>

        {/* Settings Drawer */}
        <button 
          className="btn-icon" 
          onClick={onOpenSettings}
          title="Pengaturan Prompter (S)"
        >
          <Sliders size={18} />
        </button>
      </div>
    </header>
  );
}
