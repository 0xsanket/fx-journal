import { useRef } from 'react';

export function Sidebar({ onExport, onImport, onLogout }) {
  const fileInputRef = useRef(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        onImport(data);
      } catch (err) {
        alert('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = null; // Reset input
  };

  return (
    <nav className="sidebar">
      <div className="logo">Alpha<span>Journal</span></div>
      <ul className="nav-links">
        <li className="active">Dashboard</li>
        <li onClick={onExport} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onExport()}>
          Backup Data
        </li>
        <li onClick={handleImportClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && handleImportClick()}>
          Import Data
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </li>
      </ul>
      <div style={{ marginTop: 'auto', padding: '12px 0', borderTop: '1px solid #334155' }}>
        <button
          onClick={onLogout}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            padding: '12px',
            width: '100%',
            textAlign: 'left',
            borderRadius: '8px',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.target.style.background = 'transparent'}
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </nav>
  );
}
