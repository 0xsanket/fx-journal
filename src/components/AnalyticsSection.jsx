import { useState, useMemo, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { TradeGrowthView } from './TradeGrowthView';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const scaleOptions = {
  y: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(148,163,184,0.2)' } },
  x: { ticks: { color: '#e5e7eb' }, grid: { display: false } },
};

const PIE_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AnalyticsSection({ stats, filteredTrades, uniquePairs }) {
  const [mainTab, setMainTab] = useState('detailed');
  const [graphTab, setGraphTab] = useState('growth');
  const [symbolSearch, setSymbolSearch] = useState('');
  const [selectedSymbols, setSelectedSymbols] = useState(() => new Set(uniquePairs));

  useEffect(() => {
    setSelectedSymbols((prev) => {
      const next = new Set(prev);
      uniquePairs.forEach((p) => next.add(p));
      return next;
    });
  }, [uniquePairs]);

  const pairsForSidebar = useMemo(() => {
    const q = symbolSearch.trim().toLowerCase();
    return q ? uniquePairs.filter((p) => p.toLowerCase().includes(q)) : uniquePairs;
  }, [uniquePairs, symbolSearch]);

  const symbolsToShow = useMemo(() => {
    if (selectedSymbols.size === 0) return uniquePairs;
    return uniquePairs.filter((p) => selectedSymbols.has(p));
  }, [uniquePairs, selectedSymbols]);

  const toggleSymbol = (pair) => {
    setSelectedSymbols((prev) => {
      const next = new Set(prev);
      if (next.has(pair)) next.delete(pair);
      else next.add(pair);
      return next;
    });
  };

  const resetAllSymbols = () => {
    setSelectedSymbols(new Set(uniquePairs));
    setSymbolSearch('');
  };

  const tradesForSymbolChart = useMemo(
    () => filteredTrades.filter((t) => t.pair && symbolsToShow.includes(t.pair)),
    [filteredTrades, symbolsToShow]
  );

  const pairCounts = useMemo(() => {
    const o = {};
    tradesForSymbolChart.forEach((t) => {
      o[t.pair] = (o[t.pair] || 0) + 1;
    });
    return o;
  }, [tradesForSymbolChart]);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekdayPnl = useMemo(() => {
    const a = new Array(7).fill(0);
    filteredTrades.forEach((t) => {
      const d = t.date ? new Date(t.date) : null;
      if (d && !isNaN(d.getDay())) a[d.getDay()] += t.pnl;
    });
    return a;
  }, [filteredTrades]);

  const hoursPnl = useMemo(() => {
    const a = new Array(24).fill(0);
    filteredTrades.forEach((t) => {
      const h = typeof t.hour === 'number' ? t.hour : 0;
      a[h] += t.pnl;
    });
    return a;
  }, [filteredTrades]);

  const orderTypePnl = useMemo(() => {
    let buy = 0,
      sell = 0;
    filteredTrades.forEach((t) => {
      if (t.action === 'Buy') buy += t.pnl;
      else sell += t.pnl;
    });
    return { buy, sell };
  }, [filteredTrades]);

  const winCount = filteredTrades.filter((t) => t.pnl > 0).length;
  const lossCount = filteredTrades.filter((t) => t.pnl < 0).length;
  const winPct = filteredTrades.length > 0 ? (winCount / filteredTrades.length) * 100 : 0;
  const lossPct = filteredTrades.length > 0 ? (lossCount / filteredTrades.length) * 100 : 0;

  const sessionIds = ['asian', 'pre_london', 'london', 'pre_new_york', 'new_york'];
  const sessionLabels = ['Asian', 'Pre London', 'London', 'Pre New York', 'New York'];
  const sessionPnl = useMemo(() => {
    const base = {
      asian: 0,
      pre_london: 0,
      london: 0,
      pre_new_york: 0,
      new_york: 0,
    };
    filteredTrades.forEach((t) => {
      if (t.session && Object.prototype.hasOwnProperty.call(base, t.session)) {
        base[t.session] += t.pnl;
      }
    });
    return sessionIds.map((id) => base[id]);
  }, [filteredTrades]);

  const symbolData = {
    labels: Object.keys(pairCounts),
    datasets: [
      {
        data: Object.values(pairCounts),
        backgroundColor: Object.keys(pairCounts).map((_, i) => PIE_COLORS[i % PIE_COLORS.length]),
      },
    ],
  };

  const weekdayBarData = {
    labels: weekdays,
    datasets: [
      {
        label: 'PnL',
        data: weekdayPnl,
        backgroundColor: weekdayPnl.map((v) => (v >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)')),
      },
    ],
  };

  const formatHourLabel = (h) => {
    const display = h % 12 || 12;
    const suffix = h < 12 ? 'AM' : 'PM';
    return `${display} ${suffix}`;
  };

  const hourLabels = Array.from({ length: 24 }, (_, i) => formatHourLabel(i));
  const hoursBarData = {
    labels: hourLabels,
    datasets: [
      {
        label: 'PnL',
        data: hoursPnl,
        backgroundColor: hoursPnl.map((v) => (v >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)')),
      },
    ],
  };

  const orderTypeData = {
    labels: ['Buy', 'Sell'],
    datasets: [
      {
        label: 'PnL',
        data: [orderTypePnl.buy, orderTypePnl.sell],
        backgroundColor: [orderTypePnl.buy >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)', orderTypePnl.sell >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)'],
      },
    ],
  };

  const winLossPieData = {
    labels: ['Win Ratio (%)', 'Loss Ratio (%)'],
    datasets: [
      {
        data: [winPct, lossPct],
        backgroundColor: ['#6366f1', '#a5b4fc'],
      },
    ],
  };

  const s = stats;
  const graphTabs = [
    { id: 'growth', label: 'Trade Growth View' },
    { id: 'symbol', label: 'Symbol Performance' },
    { id: 'weekday', label: 'PnL by Weekday' },
    { id: 'hours', label: 'PnL by Hours' },
    { id: 'session', label: 'PnL by Session' },
    { id: 'orderType', label: 'PnL Order Type' },
    { id: 'winloss', label: 'Win/Loss Ratio' },
  ];

  return (
    <section className="analytics-section">
      <div className="analytics-tabs">
        <button
          type="button"
          className={`analytics-tab ${mainTab === 'detailed' ? 'active' : ''}`}
          onClick={() => setMainTab('detailed')}
        >
          Detailed Stats
        </button>
        <button
          type="button"
          className={`analytics-tab ${mainTab === 'graph' ? 'active' : ''}`}
          onClick={() => setMainTab('graph')}
        >
          Analytics
        </button>
      </div>

      <div className="analytics-panels">
        <div className={`analytics-panel ${mainTab === 'detailed' ? 'active' : ''}`}>
          <div className="detail-grid">
            <div className="detail-group">
              <div className="detail-row"><span>Equity</span><strong>${s.equityNow.toFixed(2)}</strong></div>
              <div className="detail-row"><span>Balance</span><strong>${s.equityNow.toFixed(2)}</strong></div>
              <div className="detail-row"><span>Gross Profit</span><strong>${s.grossProfit.toFixed(2)}</strong></div>
              <div className="detail-row"><span>Gross Loss</span><strong>-${s.grossLoss.toFixed(2)}</strong></div>
            </div>
            <div className="detail-group">
              <div className="detail-row"><span>Avg. Winning Trade</span><strong>${s.avgWinning.toFixed(2)}</strong></div>
              <div className="detail-row"><span>Avg. Losing Trade</span><strong>${s.avgLosing.toFixed(2)}</strong></div>
              <div className="detail-row"><span>Best Trade</span><strong>${s.bestTrade.toFixed(2)}</strong></div>
              <div className="detail-row"><span>Worst Trade</span><strong>${s.worstTrade.toFixed(2)}</strong></div>
            </div>
            <div className="detail-group">
              <div className="detail-row"><span>Trades</span><strong>{filteredTrades.length}</strong></div>
              <div className="detail-row"><span>Long Win Rate</span><strong>{s.longWinRate.toFixed(1)}%</strong></div>
              <div className="detail-row"><span>Short Win Rate</span><strong>{s.shortWinRate.toFixed(1)}%</strong></div>
              <div className="detail-row"><span>Profit Factor</span><strong>{s.profitFactor.toFixed(2)}</strong></div>
            </div>
          </div>
        </div>

        <div className={`analytics-panel ${mainTab === 'graph' ? 'active' : ''}`}>
          <div className="graph-block">
            <h4 className="graph-heading">Graph</h4>
            <div className="graph-tabs">
              {graphTabs.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  className={`graph-tab ${graphTab === id ? 'active' : ''}`}
                  onClick={() => setGraphTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="graph-content">
              {graphTab === 'growth' && (
                <TradeGrowthView
                  filteredTrades={filteredTrades}
                  startingBalance={s.startingBalance}
                  variant="embedded"
                />
              )}

              {graphTab === 'symbol' && (
                <div className="symbol-performance-layout">
                  <div className="symbol-chart-wrap">
                    <div className="chart-container mini-chart">
                      {Object.keys(pairCounts).length > 0 ? (
                        <Doughnut
                          data={symbolData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom', labels: { color: '#e5e7eb', usePointStyle: true } } },
                          }}
                        />
                      ) : (
                        <div className="chart-placeholder">Select symbols to see performance</div>
                      )}
                    </div>
                  </div>
                  <aside className="symbol-sidebar">
                    <div className="symbol-search-wrap">
                      <input
                        type="text"
                        className="symbol-search"
                        placeholder="Search"
                        value={symbolSearch}
                        onChange={(e) => setSymbolSearch(e.target.value)}
                      />
                    </div>
                    <button type="button" className="symbol-reset" onClick={resetAllSymbols}>
                      Reset All
                    </button>
                    <ul className="symbol-list">
                      {pairsForSidebar.map((pair) => (
                        <li key={pair} className="symbol-item">
                          <label>
                            <input
                              type="checkbox"
                              checked={selectedSymbols.has(pair)}
                              onChange={() => toggleSymbol(pair)}
                            />
                            <span>{pair}</span>
                          </label>
                        </li>
                      ))}
                      {pairsForSidebar.length === 0 && (
                        <li className="symbol-item muted">No symbols match</li>
                      )}
                    </ul>
                  </aside>
                </div>
              )}

              {graphTab === 'weekday' && (
                <div className="chart-container mini-chart">
                  <Bar data={weekdayBarData} options={{ responsive: true, maintainAspectRatio: false, scales: scaleOptions }} />
                </div>
              )}

              {graphTab === 'hours' && (
                <div className="chart-container mini-chart chart-wide">
                  <div className="chart-subtitle chart-zone-label">Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local'}</div>
                  <Bar data={hoursBarData} options={{ responsive: true, maintainAspectRatio: false, scales: scaleOptions }} />
                </div>
              )}

              {graphTab === 'session' && (
                <div className="chart-container mini-chart">
                  <Bar
                    data={{
                      labels: sessionLabels,
                      datasets: [
                        {
                          label: 'PnL',
                          data: sessionPnl,
                          backgroundColor: sessionPnl.map((v) =>
                            v >= 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(239, 68, 68, 0.8)'
                          ),
                        },
                      ],
                    }}
                    options={{ responsive: true, maintainAspectRatio: false, scales: scaleOptions }}
                  />
                </div>
              )}

              {graphTab === 'orderType' && (
                <div className="chart-container mini-chart">
                  <Bar data={orderTypeData} options={{ responsive: true, maintainAspectRatio: false, scales: scaleOptions }} />
                </div>
              )}

              {graphTab === 'winloss' && (
                <div className="chart-container mini-chart">
                  <Doughnut
                    data={winLossPieData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { position: 'bottom', labels: { color: '#e5e7eb', usePointStyle: true } },
                        tooltip: {
                          callbacks: {
                            label: (ctx) => {
                              const value =
                                typeof ctx.raw === 'number' ? ctx.raw : 0;
                              return `${ctx.label}: ${value.toFixed(1)}%`;
                            },
                          },
                        },
                      },
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
