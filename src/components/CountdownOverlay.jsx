import React, { useState, useEffect } from 'react';

export function CountdownOverlay({ onFinish, onCancel, seconds = 3 }) {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      onFinish();
      return;
    }

    const timer = setTimeout(() => {
      setCount((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count, onFinish]);

  return (
    <div className="countdown-overlay" onClick={onFinish} title="Klik untuk langsung mulai">
      <div className="countdown-number">
        {count > 0 ? count : 'GO!'}
      </div>
      <div className="countdown-subtext">
        Tatap Lensa Kamera • Mulai Bicara
      </div>
      <button 
        className="btn-secondary" 
        style={{ marginTop: '24px', opacity: 0.7 }}
        onClick={(e) => {
          e.stopPropagation();
          onCancel();
        }}
      >
        Batalkan (Esc)
      </button>
    </div>
  );
}
