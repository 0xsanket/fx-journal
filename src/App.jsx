import { useState, useEffect } from 'react';
import { useTrades } from './hooks/useTrades';
import { Sidebar } from './components/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { AnalyticsSection } from './components/AnalyticsSection';
import { LogTradeForm } from './components/LogTradeForm';
import { TradeHistoryTable } from './components/TradeHistoryTable';

function useLiveDate() {
  const [dateStr, setDateStr] = useState(() =>
    new Date().toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  );
  useEffect(() => {
    const id = setInterval(() => {
      setDateStr(
        new Date().toLocaleString(undefined, {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    }, 60000);
    return () => clearInterval(id);
  }, []);
  return dateStr;
}

export default function App() {
  const liveDate = useLiveDate();
  const {
    filteredTrades,
    filters,
    setFilters,
    stats,
    uniquePairs,
    addTrade,
    deleteTrade,
    updateTrade,
    exportData,
  } = useTrades();

  return (
    <div className="app-container">
      <Sidebar onExport={exportData} />
      <main className="main-content">
        <header className="top-bar">
          <div>
            <p className="page-subtitle">Alpha Challenge Dashboard</p>
            <h2>Trading Overview</h2>
          </div>
          <div className="user-profile">
            <div className="badge-live">Live Session</div>
            <span>{liveDate}</span>
          </div>
        </header>

        <StatsGrid stats={stats} />

        <AnalyticsSection
          stats={stats}
          filteredTrades={filteredTrades}
          uniquePairs={uniquePairs}
        />

        <LogTradeForm onAddTrade={addTrade} />

        <TradeHistoryTable
          filteredTrades={filteredTrades}
          filters={filters}
          setFilters={setFilters}
          uniquePairs={uniquePairs}
          onDeleteTrade={deleteTrade}
          onUpdateTrade={updateTrade}
        />
      </main>
    </div>
  );
}
