import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DEFAULT_SCRIPTS } from './data/defaultScripts';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePrompterEngine } from './hooks/usePrompterEngine';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useVoiceSync } from './hooks/useVoiceSync';
import { Navbar } from './components/Navbar';
import { PrompterView } from './components/PrompterView';
import { FloatingHUD } from './components/FloatingHUD';
import { ControlDrawer } from './components/ControlDrawer';
import { EditorModal } from './components/EditorModal';
import { ScriptLibrary } from './components/ScriptLibrary';
import { CountdownOverlay } from './components/CountdownOverlay';

const DEFAULT_SETTINGS = {
  fontSize: 54,
  speed: 5,
  lineHeight: 1.5,
  fontFamily: 'var(--font-sans)',
  isBold: true,
  containerWidth: 'medium',
  textAlign: 'left',
  mirrorMode: 'none', // 'none' | 'horizontal' | 'vertical' | 'both'
  showGuide: true,
  guidePosition: 33, // 33% from top
  themeId: 'oled',
  prompterBg: '#000000',
  prompterText: '#FFFFFF',
  prompterCue: '#00E5FF',
  useCountdown: true,
  autoHideControls: true,
  voiceFollow: false
};

export default function App() {
  // Check if opened as secondary Dual-Screen glass display
  const isGlassMode = useMemo(() => {
    return new URLSearchParams(window.location.search).get('mode') === 'glass';
  }, []);

  // Persistence
  const [scripts, setScripts] = useLocalStorage('telecast_scripts_v1', DEFAULT_SCRIPTS);
  const [activeScriptId, setActiveScriptId] = useLocalStorage('telecast_active_id_v1', DEFAULT_SCRIPTS[0]?.id);
  const [settings, setSettings] = useLocalStorage('telecast_settings_v1', DEFAULT_SETTINGS);

  // Modals & Drawers
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);

  // Active script object
  const activeScript = useMemo(() => {
    return scripts.find((s) => s.id === activeScriptId) || scripts[0] || {
      id: 'default',
      title: 'Naskah Kosong',
      content: 'Belum ada naskah terpilih. Buka Koleksi Naskah untuk memilih naskah.'
    };
  }, [scripts, activeScriptId]);

  // Word count
  const wordCount = useMemo(() => {
    return activeScript.content.trim() ? activeScript.content.trim().split(/\s+/).length : 0;
  }, [activeScript]);

  // Engine Hook
  const {
    containerRef,
    progress,
    elapsedTime,
    isAtBottom,
    handleScroll,
    jump,
    restart: engineRestart
  } = usePrompterEngine({
    speed: settings.speed,
    isPlaying: isPlaying,
    onComplete: () => {
      setIsPlaying(false);
    }
  });

  // Broadcast Action helper
  const broadcastAction = useCallback((type, payload) => {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('telecast_prompter_sync');
        channel.postMessage({ type, payload });
        channel.close();
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Dual-screen Broadcast Channel sync listener
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('telecast_prompter_sync');

    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'SYNC_PLAY') setIsPlaying(true);
      if (type === 'SYNC_PAUSE') setIsPlaying(false);
      if (type === 'SYNC_SPEED') setSettings((prev) => ({ ...prev, speed: payload }));
      if (type === 'SYNC_RESTART') engineRestart();
      if (type === 'SYNC_SCRIPT') setActiveScriptId(payload);
      if (type === 'SYNC_SETTINGS') setSettings(payload);
    };

    return () => channel.close();
  }, [engineRestart, setActiveScriptId, setSettings]);

  // Voice Sync / Microphone Follow
  const { isListening, micVolume } = useVoiceSync({
    isEnabled: settings.voiceFollow,
    onVoiceActive: () => {
      setIsPlaying(true);
      broadcastAction('SYNC_PLAY');
    },
    onVoicePause: () => {
      setIsPlaying(false);
      broadcastAction('SYNC_PAUSE');
    }
  });

  // Fullscreen state listener
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  };

  // Play / Pause toggle with Countdown option
  const togglePlay = useCallback(() => {
    if (isPlaying) {
      setIsPlaying(false);
      broadcastAction('SYNC_PAUSE');
    } else {
      // If at start and countdown is enabled, show countdown first
      if (settings.useCountdown && progress < 1) {
        setIsCountingDown(true);
      } else {
        setIsPlaying(true);
        broadcastAction('SYNC_PLAY');
      }
    }
  }, [isPlaying, settings.useCountdown, progress, broadcastAction]);

  const handleCountdownFinish = () => {
    setIsCountingDown(false);
    setIsPlaying(true);
    broadcastAction('SYNC_PLAY');
  };

  const handleCountdownCancel = () => {
    setIsCountingDown(false);
  };

  const handleRestart = useCallback(() => {
    setIsPlaying(false);
    engineRestart();
    broadcastAction('SYNC_RESTART');
  }, [engineRestart, broadcastAction]);

  const handleSpeedChange = useCallback((newSpeed) => {
    const clamped = Math.max(1, Math.min(20, newSpeed));
    setSettings((prev) => ({ ...prev, speed: clamped }));
    broadcastAction('SYNC_SPEED', clamped);
  }, [setSettings, broadcastAction]);

  const handleToggleMirror = useCallback(() => {
    setSettings((prev) => {
      const nextMode = prev.mirrorMode === 'none' 
        ? 'horizontal' 
        : prev.mirrorMode === 'horizontal' 
          ? 'vertical' 
          : prev.mirrorMode === 'vertical' 
            ? 'both' 
            : 'none';
      const updated = { ...prev, mirrorMode: nextMode };
      broadcastAction('SYNC_SETTINGS', updated);
      return updated;
    });
  }, [setSettings, broadcastAction]);

  const handleToggleGuide = useCallback(() => {
    setSettings((prev) => {
      const updated = { ...prev, showGuide: !prev.showGuide };
      broadcastAction('SYNC_SETTINGS', updated);
      return updated;
    });
  }, [setSettings, broadcastAction]);

  const handleToggleVoiceFollow = useCallback(() => {
    setSettings((prev) => {
      const updated = { ...prev, voiceFollow: !prev.voiceFollow };
      return updated;
    });
  }, [setSettings]);

  // Open Glass Prompter Window
  const handleOpenGlassWindow = () => {
    window.open(`${window.location.origin}${window.location.pathname}?mode=glass`, 'telecast_glass', 'width=1280,height=720');
  };

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onTogglePlay: togglePlay,
    onSpeedUp: () => handleSpeedChange(settings.speed + 1),
    onSpeedDown: () => handleSpeedChange(settings.speed - 1),
    onRewind: () => jump(-80),
    onForward: () => jump(80),
    onRestart: handleRestart,
    onToggleMirror: handleToggleMirror,
    onToggleFullscreen: toggleFullscreen,
    onToggleGuide: handleToggleGuide,
    onOpenSettings: () => setIsSettingsOpen((prev) => !prev),
    isModalOpen: isEditorOpen || isLibraryOpen || isSettingsOpen || isCountingDown
  });

  // Script Management Handlers
  const handleSaveScript = (savedScript) => {
    setScripts((prev) => {
      const exists = prev.some((s) => s.id === savedScript.id);
      if (exists) {
        return prev.map((s) => s.id === savedScript.id ? savedScript : s);
      }
      return [savedScript, ...prev];
    });
    setActiveScriptId(savedScript.id);
    broadcastAction('SYNC_SCRIPT', savedScript.id);
  };

  const handleDeleteScript = (scriptId) => {
    setScripts((prev) => {
      const filtered = prev.filter((s) => s.id !== scriptId);
      if (activeScriptId === scriptId && filtered.length > 0) {
        setActiveScriptId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleDuplicateScript = (scriptToCopy) => {
    const duplicate = {
      ...scriptToCopy,
      id: `script-${Date.now()}`,
      title: `${scriptToCopy.title} (Salinan)`,
      updatedAt: new Date().toISOString()
    };
    setScripts((prev) => [duplicate, ...prev]);
  };

  const handleResetDefaults = () => {
    setScripts(DEFAULT_SCRIPTS);
    setActiveScriptId(DEFAULT_SCRIPTS[0].id);
  };

  const handleImportBackup = (imported) => {
    setScripts(imported);
    if (imported[0]?.id) {
      setActiveScriptId(imported[0].id);
    }
  };

  // If in Glass Mode (secondary mirror screen for camera)
  if (isGlassMode) {
    return (
      <div className="app-container" style={{ backgroundColor: settings.prompterBg }}>
        {/* Minimal top status badge in glass mode */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 60,
          opacity: 0.3,
          fontSize: '0.7rem',
          color: 'var(--text-muted)'
        }}>
          GLASS PROMPTER SYNC • F11 FULLSCREEN
        </div>

        <PrompterView 
          containerRef={containerRef}
          onScroll={handleScroll}
          content={activeScript.content}
          settings={settings}
          progress={progress}
          isPlaying={isPlaying}
        />

        {/* Minimal floating indicator */}
        <FloatingHUD 
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          speed={settings.speed}
          onSpeedChange={handleSpeedChange}
          onRestart={handleRestart}
          onRewind={() => jump(-80)}
          onForward={() => jump(80)}
          elapsedTime={elapsedTime}
          progress={progress}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          autoHide={true}
        />
      </div>
    );
  }

  return (
    <div className="app-container" style={{ backgroundColor: settings.prompterBg }}>
      {/* Top Navbar */}
      <Navbar 
        activeScript={activeScript}
        onOpenLibrary={() => setIsLibraryOpen(true)}
        onOpenEditor={() => setIsEditorOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isPlaying={isPlaying}
        mirrorMode={settings.mirrorMode}
        onToggleMirror={handleToggleMirror}
        showGuide={settings.showGuide}
        onToggleGuide={handleToggleGuide}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        elapsedTime={elapsedTime}
        wordCount={wordCount}
        hideOnPlay={settings.autoHideControls}
        isVoiceFollow={settings.voiceFollow}
        onToggleVoiceFollow={handleToggleVoiceFollow}
        micVolume={micVolume}
        onOpenGlassMode={handleOpenGlassWindow}
      />

      {/* Scrolling Prompter Canvas */}
      <PrompterView 
        containerRef={containerRef}
        onScroll={handleScroll}
        content={activeScript.content}
        settings={settings}
        progress={progress}
        isPlaying={isPlaying}
      />

      {/* Floating HUD Playback Controls */}
      <FloatingHUD 
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        speed={settings.speed}
        onSpeedChange={handleSpeedChange}
        onRestart={handleRestart}
        onRewind={() => jump(-80)}
        onForward={() => jump(80)}
        elapsedTime={elapsedTime}
        progress={progress}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        autoHide={settings.autoHideControls}
      />

      {/* Pre-roll Countdown Animation */}
      {isCountingDown && (
        <CountdownOverlay 
          onFinish={handleCountdownFinish}
          onCancel={handleCountdownCancel}
          seconds={3}
        />
      )}

      {/* Settings Control Drawer */}
      <ControlDrawer 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => {
          setSettings(newSettings);
          broadcastAction('SYNC_SETTINGS', newSettings);
        }}
      />

      {/* Text Editor Modal */}
      <EditorModal 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        script={activeScript}
        onSave={handleSaveScript}
      />

      {/* Script Library Modal */}
      <ScriptLibrary 
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        scripts={scripts}
        activeScriptId={activeScriptId}
        onSelectScript={(s) => {
          setActiveScriptId(s.id);
          broadcastAction('SYNC_SCRIPT', s.id);
        }}
        onCreateNew={() => {
          setIsLibraryOpen(false);
          setIsEditorOpen(true);
        }}
        onEditScript={(s) => {
          setActiveScriptId(s.id);
          setIsLibraryOpen(false);
          setIsEditorOpen(true);
        }}
        onDeleteScript={handleDeleteScript}
        onDuplicateScript={handleDuplicateScript}
        onResetDefaults={handleResetDefaults}
        onImportBackup={handleImportBackup}
      />
    </div>
  );
}
