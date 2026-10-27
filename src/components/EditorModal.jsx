import React, { useState, useEffect, useRef } from 'react';
import mammoth from 'mammoth';
import { 
  X, 
  Upload, 
  Sparkles, 
  Save, 
  Type, 
  Clock, 
  FileText,
  AlertCircle,
  FileCheck
} from 'lucide-react';

export function EditorModal({
  isOpen,
  onClose,
  script,
  onSave
}) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loadingFile, setLoadingFile] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (script) {
      setTitle(script.title || '');
      setContent(script.content || '');
    } else {
      setTitle('Naskah Baru');
      setContent('');
    }
    setError('');
  }, [script, isOpen]);

  if (!isOpen) return null;

  // Calculate statistics
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  // Average speaking pace ~130 WPM
  const estSeconds = Math.round((words / 130) * 60);
  const estMinutes = (estSeconds / 60).toFixed(1);

  // Handle local file loading (.txt, .md, .docx)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingFile(true);
    setError('');

    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const extension = file.name.split('.').pop().toLowerCase();

    try {
      if (extension === 'docx') {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setContent(result.value);
        if (!title || title === 'Naskah Baru') setTitle(cleanName);
      } else {
        // Plain text (.txt, .md, etc)
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result;
          if (typeof text === 'string') {
            setContent(text);
            if (!title || title === 'Naskah Baru') setTitle(cleanName);
          }
        };
        reader.readAsText(file);
      }
    } catch (err) {
      setError('Gagal membaca file: ' + err.message);
    } finally {
      setLoadingFile(false);
      if (e.target) e.target.value = '';
    }
  };

  // AI & Speech Rhythm Teleprompter Formatter
  const handleSmartFormat = () => {
    if (!content.trim()) return;

    let formatted = content
      // Normalize line breaks
      .replace(/\r\n/g, '\n')
      // Clean up multiple spaces
      .replace(/[ \t]+/g, ' ')
      // Break after sentence endings (. ? !) if followed by space & Capital letter
      .replace(/([.?!])\s+(?=[A-Z0-9"“])/g, '$1\n\n')
      // Break after commas if the clause is long (> 60 chars)
      .replace(/(.{40,80},)\s+/g, '$1\n')
      // Clean up duplicate blank lines
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    setContent(formatted);
  };

  // Insert stage cue helper
  const handleInsertCue = (cueText) => {
    setContent((prev) => {
      return prev ? `${prev}\n\n[${cueText}]\n\n` : `[${cueText}]\n\n`;
    });
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Judul naskah wajib diisi.');
      return;
    }
    if (!content.trim()) {
      setError('Isi naskah tidak boleh kosong.');
      return;
    }

    onSave({
      id: script?.id || `script-${Date.now()}`,
      title: title.trim(),
      content: content.trim(),
      category: script?.category || 'Custom',
      updatedAt: new Date().toISOString()
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FileText size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span className="modal-title">
              {script ? 'Edit Naskah' : 'Tulis Naskah Baru'}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div style={{ 
              padding: '10px 14px', 
              background: 'rgba(255, 51, 102, 0.15)', 
              border: '1px solid rgba(255, 51, 102, 0.3)',
              borderRadius: '8px',
              color: 'var(--accent-red)',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Title Field */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-secondary)' }}>
              JUDUL NASKAH
            </label>
            <input 
              type="text" 
              className="editor-input-title"
              placeholder="Contoh: Sambutan Pembukaan Acara..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError('');
              }}
            />
          </div>

          {/* Toolbar Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            {/* Quick cue inserts */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CUE:</span>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => handleInsertCue('JEDA 2 DETIK')}
              >
                + [JEDA]
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => handleInsertCue('SENYUM & TATAP KAMERA')}
              >
                + [SENYUM]
              </button>
              <button 
                type="button" 
                className="btn-secondary" 
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                onClick={() => handleInsertCue('TEKANKAN KALIMAT INI')}
              >
                + [TEKANAN]
              </button>
            </div>

            {/* Smart Format & File Load */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                type="button" 
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={handleSmartFormat}
                title="Rapikan kalimat panjang agar nyaman dibaca saat bernapas"
              >
                <Sparkles size={14} style={{ color: 'var(--accent-cyan)' }} />
                <span>Format Cerdas</span>
              </button>

              <input 
                type="file" 
                ref={fileInputRef}
                accept=".txt,.md,.docx" 
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />

              <button 
                type="button" 
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => fileInputRef.current?.click()}
                title="Buka file teks dari komputer Anda (.txt, .md, .docx)"
                disabled={loadingFile}
              >
                <Upload size={14} />
                <span>{loadingFile ? 'Membaca File...' : 'Muat File (TXT / DOCX)'}</span>
              </button>
            </div>
          </div>

          {/* Text Area */}
          <div>
            <textarea 
              className="editor-textarea"
              placeholder="Ketik atau tempelkan (Ctrl+V) naskah presentasi Anda di sini..."
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setError('');
              }}
            />
          </div>

          {/* Metadata Statistics */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '16px', 
            fontSize: '0.8rem', 
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Type size={14} />
              <span>{words} Kata</span>
            </div>
            <span>•</span>
            <div>{chars} Karakter</div>
            <span>•</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Clock size={14} />
              <span>Estimasi: ~{estMinutes} menit ({estSeconds}s)</span>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <Save size={16} />
            <span>Simpan Naskah</span>
          </button>
        </div>
      </div>
    </div>
  );
}
