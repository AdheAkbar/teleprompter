import React from 'react';

export function ReadingGuide({ isVisible = true, position = 33, showFocusBand = true }) {
  if (!isVisible) return null;

  return (
    <div 
      className="reading-guide-container" 
      style={{ top: `${position}%` }}
      aria-hidden="true"
    >
      {showFocusBand && <div className="guide-focus-band" />}
      <div className="guide-arrow-left" />
      <div className="guide-line" />
      <div className="guide-arrow-right" />
    </div>
  );
}
