import React from 'react';
import { 
  X, 
  Type, 
  Gauge, 
  Layout, 
  FlipHorizontal, 
  Palette, 
  Keyboard,
  Compass,
  Sparkles
} from 'lucide-react';

export function ControlDrawer({
  isOpen,
  onClose,
  settings,
  onUpdateSettings
}) {
  if (!isOpen) return null;

  const update = (key, value) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const fontPresets = [
    { label: 'S (36px)', val: 36 },
    { label: 'M (54px)', val: 54 },
    { label: 'L (72px)', val: 72 },
    { label: 'XL (96px)', val: 96 }
  ];

  const speedPresets = [
    { label: 'Santai (2x)', val: 2 },
    { label: 'Normal (5x)', val: 5 },
    { label: 'Cepat (9x)', val: 9 },
    { label: 'Express (14x)', val: 14 }
  ];

  const colorThemes = [
    { id: 'oled', name: 'OLED Studio', bg: '#000000', text: '#FFFFFF', cue: '#00E5FF' },
    { id: 'amber', name: 'News Amber', bg: '#080808', text: '#FFB300', cue: '#FF5722' },
    { id: 'emerald', name: 'Matrix Green', bg: '#050D0A', text: '#00E676', cue: '#76FF03' },
    { id: 'cyan', name: 'Cyber Cyan', bg: '#060B14', text: '#00E5FF', cue: '#E040FB' },
    { id: 'paper', name: 'Light Paper', bg: '#F1F5F9', text: '#0F172A', cue: '#2563EB' }
  ];

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="control-drawer" aria-label="Pengaturan Prompter">
        <div className="drawer-header">
          <div className="drawer-title">
            <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} />
            <span>Pengaturan Studio</span>
          </div>
          <button className="btn-icon" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="drawer-body">
          {/* 1. Speed Control */}
          <section className="setting-section">
            <div className="section-label">
              <Gauge size={14} />
              <span>Kecepatan Scroll</span>
            </div>
            <div className="slider-group">
              <div className="slider-header">
                <span>Laju Gerak</span>
                <span>{settings.speed}x</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="20" 
                step="1"
                value={settings.speed}
                onChange={(e) => update('speed', Number(e.target.value))}
              />
            </div>
            <div className="btn-group">
              {speedPresets.map((p) => (
                <button
                  key={p.val}
                  className={`btn-group-item ${settings.speed === p.val ? 'active' : ''}`}
                  onClick={() => update('speed', p.val)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </section>

          {/* 2. Typography */}
          <section className="setting-section">
            <div className="section-label">
              <Type size={14} />
              <span>Ukuran & Tipe Huruf</span>
            </div>

            <div className="slider-group">
              <div className="slider-header">
                <span>Ukuran Font</span>
                <span>{settings.fontSize}px</span>
              </div>
              <input 
                type="range" 
                min="24" 
                max="128" 
                step="2"
                value={settings.fontSize}
                onChange={(e) => update('fontSize', Number(e.target.value))}
              />
            </div>

            <div className="btn-group">
              {fontPresets.map((p) => (
                <button
                  key={p.val}
                  className={`btn-group-item ${settings.fontSize === p.val ? 'active' : ''}`}
                  onClick={() => update('fontSize', p.val)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Font Family */}
            <div className="slider-header" style={{ marginTop: '6px' }}>
              <span>Font Style</span>
            </div>
            <div className="btn-group">
              {[
                { label: 'Inter (Sans)', val: 'var(--font-sans)' },
                { label: 'Outfit (Modern)', val: 'var(--font-display)' },
                { label: 'Mono', val: 'var(--font-mono)' },
                { label: 'Serif', val: 'var(--font-serif)' }
              ].map((f) => (
                <button
                  key={f.val}
                  className={`btn-group-item ${settings.fontFamily === f.val ? 'active' : ''}`}
                  onClick={() => update('fontFamily', f.val)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Line Spacing */}
            <div className="slider-header" style={{ marginTop: '6px' }}>
              <span>Jarak Spasi Baris</span>
              <span>{settings.lineHeight}x</span>
            </div>
            <div className="btn-group">
              {[1.2, 1.5, 1.8, 2.2].map((lh) => (
                <button
                  key={lh}
                  className={`btn-group-item ${settings.lineHeight === lh ? 'active' : ''}`}
                  onClick={() => update('lineHeight', lh)}
                >
                  {lh}x
                </button>
              ))}
            </div>

            {/* Bold Toggle */}
            <div 
              className="toggle-row"
              onClick={() => update('isBold', !settings.isBold)}
            >
              <span style={{ fontSize: '0.85rem' }}>Tebalkan Huruf (Bold)</span>
              <div className={`toggle-switch ${settings.isBold ? 'on' : ''}`}>
                <div className="toggle-knob" />
              </div>
            </div>
          </section>

          {/* 3. Layout & Margins */}
          <section className="setting-section">
            <div className="section-label">
              <Layout size={14} />
              <span>Tata Letak & Margin</span>
            </div>

            <div className="slider-header">
              <span>Lebar Area Teks</span>
            </div>
            <div className="btn-group">
              {[
                { label: 'Sempit (40%)', val: 'narrow' },
                { label: 'Sedang (60%)', val: 'medium' },
                { label: 'Lebar (80%)', val: 'wide' },
                { label: 'Penuh (94%)', val: 'full' }
              ].map((w) => (
                <button
                  key={w.val}
                  className={`btn-group-item ${settings.containerWidth === w.val ? 'active' : ''}`}
                  onClick={() => update('containerWidth', w.val)}
                >
                  {w.label}
                </button>
              ))}
            </div>

            <div className="slider-header" style={{ marginTop: '6px' }}>
              <span>Perataan Teks (Alignment)</span>
            </div>
            <div className="btn-group">
              {['left', 'center'].map((a) => (
                <button
                  key={a}
                  className={`btn-group-item ${settings.textAlign === a ? 'active' : ''}`}
                  onClick={() => update('textAlign', a)}
                  style={{ textTransform: 'capitalize' }}
                >
                  {a === 'left' ? 'Rata Kiri' : 'Rata Tengah'}
                </button>
              ))}
            </div>
          </section>

          {/* 4. Reading Guide / Eye-Line */}
          <section className="setting-section">
            <div className="section-label">
              <Compass size={14} />
              <span>Garis Panduan Mata (Eye-Line)</span>
            </div>

            <div 
              className="toggle-row"
              onClick={() => update('showGuide', !settings.showGuide)}
            >
              <span style={{ fontSize: '0.85rem' }}>Tampilkan Garis Panduan</span>
              <div className={`toggle-switch ${settings.showGuide ? 'on' : ''}`}>
                <div className="toggle-knob" />
              </div>
            </div>

            {settings.showGuide && (
              <div className="slider-group">
                <div className="slider-header">
                  <span>Posisi Garis Lensa</span>
                  <span>{settings.guidePosition}%</span>
                </div>
                <input 
                  type="range" 
                  min="15" 
                  max="65" 
                  step="1"
                  value={settings.guidePosition}
                  onChange={(e) => update('guidePosition', Number(e.target.value))}
                />
              </div>
            )}
          </section>

          {/* 5. Mirror & Display */}
          <section className="setting-section">
            <div className="section-label">
              <FlipHorizontal size={14} />
              <span>Mode Cermin (Beam Splitter Glass)</span>
            </div>

            <div className="btn-group">
              {[
                { label: 'Normal', val: 'none' },
                { label: 'Cermin H', val: 'horizontal' },
                { label: 'Cermin V', val: 'vertical' },
                { label: 'Kedua (180°)', val: 'both' }
              ].map((m) => (
                <button
                  key={m.val}
                  className={`btn-group-item ${settings.mirrorMode === m.val ? 'active' : ''}`}
                  onClick={() => update('mirrorMode', m.val)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div 
              className="toggle-row"
              onClick={() => update('useCountdown', !settings.useCountdown)}
            >
              <span style={{ fontSize: '0.85rem' }}>Hitung Mundur 3 Detik (Pre-Roll)</span>
              <div className={`toggle-switch ${settings.useCountdown ? 'on' : ''}`}>
                <div className="toggle-knob" />
              </div>
            </div>
          </section>

          {/* 6. Voice Follow Sync (PRD V2 Feature) */}
          <section className="setting-section">
            <div className="section-label">
              <Sparkles size={14} />
              <span>Voice Follow (Sinkronisasi Suara)</span>
            </div>

            <div 
              className="toggle-row"
              onClick={() => update('voiceFollow', !settings.voiceFollow)}
            >
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>Ikuti Suara Mikrofon</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Prompter otomatis scroll saat Anda bicara, dan jeda saat Anda diam
                </div>
              </div>
              <div className={`toggle-switch ${settings.voiceFollow ? 'on' : ''}`}>
                <div className="toggle-knob" />
              </div>
            </div>
          </section>

          {/* 7. Dual-Screen / Operator Console */}
          <section className="setting-section">
            <div className="section-label">
              <Layout size={14} />
              <span>Dual Screen (Layar Terpisah)</span>
            </div>
            <button 
              className="btn-secondary"
              style={{ justifyContent: 'center', width: '100%', padding: '10px' }}
              onClick={() => {
                window.open(`${window.location.origin}${window.location.pathname}?mode=glass`, 'telecast_glass', 'width=1280,height=720');
              }}
            >
              <FlipHorizontal size={16} />
              <span>Buka Jendela Kaca Prompter</span>
            </button>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Buka tampilan teks bersih di layar monitor sekunder/kaca kamera, sementara Anda mengontrol dari laptop.
            </div>
          </section>

          {/* 6. Themes & Colors */}
          <section className="setting-section">
            <div className="section-label">
              <Palette size={14} />
              <span>Tema Warna Studio</span>
            </div>

            <div className="color-presets-grid">
              {colorThemes.map((theme) => {
                const isCurrent = settings.themeId === theme.id;
                return (
                  <div
                    key={theme.id}
                    className={`color-preset-card ${isCurrent ? 'active' : ''}`}
                    style={{ backgroundColor: theme.bg, color: theme.text }}
                    onClick={() => {
                      update('themeId', theme.id);
                      update('prompterBg', theme.bg);
                      update('prompterText', theme.text);
                      update('prompterCue', theme.cue);
                    }}
                  >
                    <span>{theme.name}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7. Keyboard Shortcuts Cheat Sheet */}
          <section className="setting-section">
            <div className="section-label">
              <Keyboard size={14} />
              <span>Pintasan Keyboard</span>
            </div>
            <div className="shortcut-list">
              <div className="shortcut-item">
                <span>Mulai / Jeda</span>
                <span className="kbd-badge">Spasi</span>
              </div>
              <div className="shortcut-item">
                <span>Ubah Kecepatan</span>
                <span className="kbd-badge">↑ / ↓</span>
              </div>
              <div className="shortcut-item">
                <span>Lompat Baris</span>
                <span className="kbd-badge">← / →</span>
              </div>
              <div className="shortcut-item">
                <span>Mulai Ulang (Top)</span>
                <span className="kbd-badge">R / Home</span>
              </div>
              <div className="shortcut-item">
                <span>Mode Cermin Kaca</span>
                <span className="kbd-badge">M</span>
              </div>
              <div className="shortcut-item">
                <span>Garis Lensa Mata</span>
                <span className="kbd-badge">G</span>
              </div>
              <div className="shortcut-item">
                <span>Layar Penuh (Fullscreen)</span>
                <span className="kbd-badge">F / F11</span>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
