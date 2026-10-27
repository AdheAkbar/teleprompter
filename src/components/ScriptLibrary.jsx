import React, { useState, useRef } from 'react';
import { 
  X, 
  Plus, 
  Search, 
  Trash2, 
  Edit3, 
  Copy, 
  Download, 
  Upload, 
  FolderCheck,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { DEFAULT_SCRIPTS } from '../data/defaultScripts';

export function ScriptLibrary({
  isOpen,
  onClose,
  scripts,
  activeScriptId,
  onSelectScript,
  onCreateNew,
  onEditScript,
  onDeleteScript,
  onDuplicateScript,
  onResetDefaults,
  onImportBackup
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Filter scripts based on search
  const filteredScripts = scripts.filter((s) => {
    const q = searchQuery.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q);
  });

  // Export all scripts to JSON backup
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scripts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telecast_prompter_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Koleksi naskah berhasil di-export ke JSON!');
  };

  // Export single script as TXT
  const handleExportTxt = (script, e) => {
    e.stopPropagation();
    const blob = new Blob([script.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${script.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Naskah "${script.title}" berhasil diunduh sebagai TXT!`);
  };

  // Handle importing backup JSON
  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportBackup(parsed);
          showToast(`Berhasil mengimpor ${parsed.length} naskah!`);
        } else {
          alert('Format backup tidak valid: harus berupa array naskah.');
        }
      } catch (err) {
        alert('Gagal membaca file backup JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '960px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FolderCheck size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span className="modal-title">Koleksi Naskah Anda</span>
          </div>
          <button className="btn-icon" onClick={onClose} title="Tutup">
            <X size={18} />
          </button>
        </div>

        {/* Toolbar: Search + Actions */}
        <div style={{ 
          padding: '16px 24px', 
          borderBottom: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
          background: 'rgba(0, 0, 0, 0.15)'
        }}>
          {/* Search box */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            background: 'rgba(0,0,0,0.3)', 
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-md)',
            padding: '6px 12px',
            flex: '1',
            minWidth: '220px'
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Cari naskah atau kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%',
                fontSize: '0.88rem'
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Import Backup */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".json" 
              style={{ display: 'none' }}
              onChange={handleFileImport}
            />
            <button 
              className="btn-secondary" 
              onClick={() => fileInputRef.current?.click()}
              title="Pulihkan naskah dari file backup JSON"
            >
              <Upload size={14} />
              <span>Impor JSON</span>
            </button>

            {/* Export Backup */}
            <button 
              className="btn-secondary" 
              onClick={handleExportBackup}
              title="Cadangkan seluruh naskah ke file JSON"
            >
              <Download size={14} />
              <span>Ekspor Semua</span>
            </button>

            {/* New Script Button */}
            <button className="btn-primary" onClick={onCreateNew}>
              <Plus size={16} />
              <span>Tulis Naskah Baru</span>
            </button>
          </div>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div style={{ 
            background: 'rgba(0, 229, 255, 0.15)', 
            borderBottom: '1px solid rgba(0, 229, 255, 0.3)',
            padding: '8px 24px',
            color: 'var(--accent-cyan)',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Scripts Grid */}
        <div className="modal-body">
          {filteredScripts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              Tidak ditemukan naskah yang cocok dengan pencarian "{searchQuery}".
            </div>
          ) : (
            <div className="script-grid">
              {filteredScripts.map((item) => {
                const isActive = item.id === activeScriptId;
                const words = item.content.trim() ? item.content.trim().split(/\s+/).length : 0;
                const estMin = (words / 130).toFixed(1);

                return (
                  <div 
                    key={item.id} 
                    className={`script-card ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      onSelectScript(item);
                      onClose();
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ 
                          fontSize: '0.7rem', 
                          fontWeight: '700', 
                          color: 'var(--accent-cyan)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {item.category || 'Naskah'}
                        </span>
                        {isActive && (
                          <span className="brand-badge" style={{ fontSize: '0.6rem' }}>
                            Sedang Dipilih
                          </span>
                        )}
                      </div>
                      <h4 className="script-card-title">{item.title}</h4>
                      <p className="script-card-snippet">{item.content}</p>
                    </div>

                    <div>
                      <div className="script-card-meta">
                        <span>{words} kata (~{estMin}m)</span>
                        <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
                      </div>

                      {/* Card Action Buttons */}
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'flex-end', 
                        gap: '6px', 
                        marginTop: '10px' 
                      }}>
                        <button 
                          className="btn-icon" 
                          style={{ width: '30px', height: '30px' }}
                          title="Unduh TXT"
                          onClick={(e) => handleExportTxt(item, e)}
                        >
                          <Download size={14} />
                        </button>
                        <button 
                          className="btn-icon" 
                          style={{ width: '30px', height: '30px' }}
                          title="Duplikat Naskah"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateScript(item);
                            showToast(`Naskah "${item.title}" diduplikat!`);
                          }}
                        >
                          <Copy size={14} />
                        </button>
                        <button 
                          className="btn-icon" 
                          style={{ width: '30px', height: '30px' }}
                          title="Edit Naskah"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditScript(item);
                          }}
                        >
                          <Edit3 size={14} />
                        </button>
                        {scripts.length > 1 && (
                          <button 
                            className="btn-icon" 
                            style={{ width: '30px', height: '30px', color: 'var(--accent-red)' }}
                            title="Hapus Naskah"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm(`Hapus naskah "${item.title}"?`)) {
                                onDeleteScript(item.id);
                                showToast(`Naskah "${item.title}" dihapus.`);
                              }
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button 
            className="btn-secondary"
            style={{ fontSize: '0.8rem', opacity: 0.8 }}
            onClick={() => {
              if (window.confirm('Muat ulang naskah bawaan studio (Tech Review, Berita, Keynote)?')) {
                onResetDefaults();
                showToast('Naskah contoh bawaan berhasil dimuat ulang!');
              }
            }}
          >
            <RotateCcw size={14} />
            <span>Muat Naskah Contoh Bawaan</span>
          </button>

          <button className="btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
