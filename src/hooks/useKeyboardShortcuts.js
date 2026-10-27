import { useEffect } from 'react';

export function useKeyboardShortcuts({
  onTogglePlay,
  onSpeedUp,
  onSpeedDown,
  onRewind,
  onForward,
  onRestart,
  onToggleMirror,
  onToggleFullscreen,
  onToggleGuide,
  onOpenSettings,
  isModalOpen = false
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept shortcuts if user is typing in an input, textarea, or contentEditable
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
        return;
      }

      // If a modal is open, don't execute prompter shortcuts except Escape
      if (isModalOpen && e.key !== 'Escape') {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlay?.();
          break;

        case 'ArrowUp':
          e.preventDefault();
          onSpeedUp?.();
          break;

        case 'ArrowDown':
          e.preventDefault();
          onSpeedDown?.();
          break;

        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault();
          onRewind?.();
          break;

        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault();
          onForward?.();
          break;

        case 'KeyB':
        case 'Period':
          e.preventDefault();
          onTogglePlay?.();
          break;

        case 'KeyR':
        case 'Home':
          e.preventDefault();
          onRestart?.();
          break;

        case 'KeyM':
          e.preventDefault();
          onToggleMirror?.();
          break;

        case 'KeyF':
          e.preventDefault();
          onToggleFullscreen?.();
          break;

        case 'KeyG':
          e.preventDefault();
          onToggleGuide?.();
          break;

        case 'KeyS':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            onOpenSettings?.();
          }
          break;

        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onTogglePlay,
    onSpeedUp,
    onSpeedDown,
    onRewind,
    onForward,
    onRestart,
    onToggleMirror,
    onToggleFullscreen,
    onToggleGuide,
    onOpenSettings,
    isModalOpen
  ]);
}
