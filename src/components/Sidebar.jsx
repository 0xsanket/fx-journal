export function Sidebar({ onExport }) {
  return (
    <nav className="sidebar">
      <div className="logo">Alpha<span>Journal</span></div>
      <ul className="nav-links">
        <li className="active">Dashboard</li>
        <li onClick={onExport} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onExport()}>
          Backup Data
        </li>
      </ul>
    </nav>
  );
}
