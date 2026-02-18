import { useState, useEffect } from 'react';

export function TradeHistoryTable({
  filteredTrades,
  filters,
  setFilters,
  uniquePairs,
  onDeleteTrade,
  onUpdateTrade,
}) {
  const displayTrades = [...filteredTrades].reverse();
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [editingTrade, setEditingTrade] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 15;

  function handleDelete(trade) {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      onDeleteTrade(trade.id);
    }
  }

  function openMetadataModal(trade) {
    setSelectedTrade(trade);
  }

  function closeMetadataModal() {
    setSelectedTrade(null);
  }

  function openEditModal(trade) {
    setEditingTrade(trade);
  }

  function closeEditModal() {
    setEditingTrade(null);
  }

  const timeframeLabels = {
    d1: 'Daily',
    h4: '4H',
    h1: '1H',
    m30: '30m',
    m15: '15m',
  };

  const sessionLabels = {
    asian: 'Asian',
    pre_london: 'Pre London',
    london: 'London',
    pre_new_york: 'Pre New York',
    new_york: 'New York',
  };

  const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.pair, filters.result]);

  const totalPages = Math.max(1, Math.ceil(displayTrades.length / PAGE_SIZE));
  const start = (currentPage - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  const pagedTrades = displayTrades.slice(start, end);

  return (
    <section className="table-section">
      <div className="section-header">
        <h3>Trade History</h3>
        <div className="table-filters">
          <select
            value={filters.pair}
            onChange={(e) => setFilters((f) => ({ ...f, pair: e.target.value }))}
          >
            <option value="">All Pairs</option>
            {uniquePairs.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={filters.result}
            onChange={(e) => setFilters((f) => ({ ...f, result: e.target.value }))}
          >
            <option value="">All Results</option>
            <option value="win">Winning</option>
            <option value="loss">Losing</option>
          </select>
        </div>
      </div>
      <div className="table-wrapper">
        <table className="trades-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Pair</th>
              <th>Strategy</th>
              <th>Type</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Lots</th>
              <th>Session</th>
              <th>Side</th>
              <th>PnL ($)</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pagedTrades.map((t) => (
              <tr key={t.id || `${t.date}-${t.pair}`}>
                <td>{t.date}</td>
                <td>
                  {(() => {
                    const d = t.date ? new Date(t.date) : null;
                    return d && !Number.isNaN(d.getTime())
                      ? weekdayLabels[d.getDay()]
                      : '-';
                  })()}
                </td>
                <td>{t.pair}</td>
                <td>{t.strategy || '-'}</td>
                <td>{t.tradeType || '-'}</td>
                <td>{t.entry != null ? t.entry : '-'}</td>
                <td>{t.exit != null ? t.exit : '-'}</td>
                <td>{t.lots != null ? t.lots : '-'}</td>
                <td>{t.session ? sessionLabels[t.session] || t.session : '-'}</td>
                <td>
                  <span className={`side-badge ${t.action === 'Sell' ? 'sell' : 'buy'}`}>
                    {t.action || '-'}
                  </span>
                </td>
                <td className={t.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                  {typeof t.pnl === 'number' ? t.pnl.toFixed(2) : '-'}
                </td>
                <td className="row-actions">
                  <div className="row-metadata">
                    {t.tvLink && (
                      <a
                        href={t.tvLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="metadata-icon tv-link"
                        title="TradingView Chart"
                      >
                        TV
                      </a>
                    )}
                    {(t.learning ||
                      (t.chartLinks && Object.keys(t.chartLinks).length > 0) ||
                      (typeof t.emotion === 'number' && t.emotion > 0)) && (
                      <button
                        type="button"
                        className="metadata-icon learning-icon"
                        onClick={() => openMetadataModal(t)}
                        title="View learning notes and charts"
                      >
                        📝
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    className="row-edit-btn"
                    onClick={() => openEditModal(t)}
                    aria-label="Edit trade"
                  >
                    ✏️
                  </button>
                  <button
                    type="button"
                    className="row-delete-btn"
                    onClick={() => handleDelete(t)}
                    aria-label="Delete trade"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination-bar">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {selectedTrade && (
        <div className="metadata-modal-overlay" onClick={closeMetadataModal}>
          <div className="metadata-modal" onClick={(e) => e.stopPropagation()}>
            <div className="metadata-modal-header">
              <h4>Trade Details - {selectedTrade.pair}</h4>
              <button type="button" className="modal-close" onClick={closeMetadataModal}>
                ×
              </button>
            </div>
            <div className="metadata-modal-content">
              {selectedTrade.learning && (
                <div className="metadata-section">
                  <h5>Learning Notes</h5>
                  <p className="learning-text">{selectedTrade.learning}</p>
                </div>
              )}
              {typeof selectedTrade.emotion === 'number' && selectedTrade.emotion > 0 && (
                <div className="metadata-section">
                  <h5>Emotion Rating</h5>
                  <div className="emotion-stars-modal">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`emotion-star ${selectedTrade.emotion >= star ? 'filled' : ''}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="emotion-score">{selectedTrade.emotion}/5</span>
                  </div>
                </div>
              )}
              {selectedTrade.chartLinks && Object.keys(selectedTrade.chartLinks).length > 0 && (
                <div className="metadata-section">
                  <h5>Chart Links</h5>
                  <div className="chart-links-list">
                    {Object.entries(selectedTrade.chartLinks).map(([timeframe, url]) => (
                      <a
                        key={timeframe}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="chart-link-item-modal"
                      >
                        {timeframeLabels[timeframe]} Chart
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {editingTrade && (
        <div className="metadata-modal-overlay" onClick={closeEditModal}>
          <div className="metadata-modal" onClick={(e) => e.stopPropagation()}>
            <div className="metadata-modal-header">
              <h4>Edit Trade - {editingTrade.pair}</h4>
              <button type="button" className="modal-close" onClick={closeEditModal}>
                ×
              </button>
            </div>
            <div className="metadata-modal-content">
              <div className="learning-input-group">
                <label className="learning-label">Pair</label>
                <input
                  type="text"
                  value={editingTrade.pair || ''}
                  onChange={(e) =>
                    setEditingTrade((prev) => ({ ...prev, pair: e.target.value }))
                  }
                />
              </div>
              <div className="learning-input-group">
                <label className="learning-label">Entry / Exit / Lots</label>
                <div className="chart-links-grid">
                  <input
                    type="number"
                    step="any"
                    placeholder="Entry"
                    value={editingTrade.entry ?? ''}
                    onChange={(e) =>
                      setEditingTrade((prev) => ({
                        ...prev,
                        entry: e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Exit"
                    value={editingTrade.exit ?? ''}
                    onChange={(e) =>
                      setEditingTrade((prev) => ({
                        ...prev,
                        exit: e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Lots"
                    value={editingTrade.lots ?? ''}
                    onChange={(e) =>
                      setEditingTrade((prev) => ({
                        ...prev,
                        lots: e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="learning-input-group">
                <label className="learning-label">Strategy / Type / PnL ($)</label>
                <div className="chart-links-grid">
                  <input
                    type="text"
                    placeholder="Strategy"
                    value={editingTrade.strategy || ''}
                    onChange={(e) =>
                      setEditingTrade((prev) => ({ ...prev, strategy: e.target.value }))
                    }
                  />
                  <input
                    type="text"
                    placeholder="Type"
                    value={editingTrade.tradeType || ''}
                    onChange={(e) =>
                      setEditingTrade((prev) => ({ ...prev, tradeType: e.target.value }))
                    }
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="PnL"
                    value={editingTrade.pnl ?? ''}
                    onChange={(e) =>
                      setEditingTrade((prev) => ({
                        ...prev,
                        pnl: e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="pagination-bar">
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={closeEditModal}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="pagination-btn"
                  onClick={() => {
                    if (!editingTrade.pair || editingTrade.entry == null || editingTrade.exit == null || editingTrade.lots == null || editingTrade.pnl == null) {
                      return;
                    }
                    onUpdateTrade(editingTrade);
                    closeEditModal();
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
