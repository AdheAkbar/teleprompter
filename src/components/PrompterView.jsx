import React from 'react';
import { ReadingGuide } from './ReadingGuide';

export function PrompterView({
  containerRef,
  onScroll,
  content,
  settings,
  progress,
  isPlaying
}) {
  // Parse content into regular text lines and stage cues [LIKE THIS]
  const renderFormattedContent = () => {
    if (!content) return null;

    // Split by lines
    const lines = content.split('\n');

    return lines.map((line, lineIndex) => {
      const trimmed = line.trim();

      // Check if the entire line is a stage cue [XYZ]
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return (
          <div key={lineIndex} style={{ margin: '14px 0' }}>
            <span className="stage-cue">
              {trimmed}
            </span>
          </div>
        );
      }

      // Check if line is empty (paragraph break)
      if (!trimmed) {
        return <div key={lineIndex} style={{ height: `${settings.fontSize * 0.8}px` }} />;
      }

      // If line contains inline cues like "Hello [SMILE] everyone"
      const parts = line.split(/(\[[^\]]+\])/g);

      return (
        <div 
          key={lineIndex} 
          style={{ 
            marginBottom: `${settings.fontSize * 0.3}px`,
            lineHeight: settings.lineHeight
          }}
        >
          {parts.map((part, partIdx) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              return (
                <span key={partIdx} className="stage-cue">
                  {part}
                </span>
              );
            }
            return <span key={partIdx}>{part}</span>;
          })}
        </div>
      );
    });
  };

  const getMirrorClass = () => {
    if (settings.mirrorMode === 'horizontal') return 'mirror-horizontal';
    if (settings.mirrorMode === 'vertical') return 'mirror-vertical';
    if (settings.mirrorMode === 'both') return 'mirror-both';
    return '';
  };

  return (
    <main 
      className={`prompter-viewport ${isPlaying ? 'hide-scrollbar' : ''}`}
      ref={containerRef}
      onScroll={onScroll}
      style={{
        backgroundColor: settings.prompterBg || '#000000',
        cursor: isPlaying ? 'none' : 'default'
      }}
    >
      {/* Eye-line Reading Guide overlay */}
      <ReadingGuide 
        isVisible={settings.showGuide}
        position={settings.guidePosition}
      />

      {/* Main text container with width and mirror transform */}
      <div 
        className={`prompter-inner-canvas width-${settings.containerWidth} ${getMirrorClass()}`}
        style={{
          fontSize: `${settings.fontSize}px`,
          fontFamily: settings.fontFamily,
          fontWeight: settings.isBold ? '700' : '400',
          textAlign: settings.textAlign,
          color: settings.prompterText || '#FFFFFF'
        }}
      >
        <div className="prompter-text">
          {renderFormattedContent()}
        </div>
      </div>

      {/* Progress Bar along bottom of prompter */}
      <div 
        className="prompter-progress-bar" 
        style={{ width: `${progress}%` }} 
      />
    </main>
  );
}
