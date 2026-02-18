export function StatsGrid({ stats }) {
  const { equityNow, equityChangePct, winRate, wins, losses, profitFactor, avgPnl } = stats;
  return (
    <div className="stats-grid">
      <div className="stat-card">
        <div className="stat-label-row">
          <p>Total Equity</p>
          <span className="stat-tag">Account</span>
        </div>
        <h3>${equityNow.toFixed(2)}</h3>
        <span className={`trend ${equityChangePct >= 0 ? 'up' : 'down'}`}>
          {equityChangePct >= 0 ? '+' : ''}{equityChangePct.toFixed(2)}%
        </span>
      </div>
      <div className="stat-card">
        <div className="stat-label-row">
          <p>Win Rate</p>
          <span className="stat-tag neutral">Performance</span>
        </div>
        <h3>{winRate.toFixed(1)}%</h3>
        <p className="stat-subtext">{wins.length} wins / {losses.length} losses</p>
      </div>
      <div className="stat-card">
        <div className="stat-label-row">
          <p>Profit Factor</p>
          <span className="stat-tag">Risk</span>
        </div>
        <h3>{profitFactor.toFixed(2)}</h3>
        <p className="stat-subtext">Avg trade: ${avgPnl.toFixed(2)}</p>
      </div>
    </div>
  );
}
