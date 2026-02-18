import { useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = 'trades';
const STARTING_BALANCE = 5000;

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function normalizePair(pair) {
  if (!pair || typeof pair !== 'string') return '';
  return pair.trim().toUpperCase();
}

function loadTrades() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const trades = raw ? JSON.parse(raw) : [];
    // Ensure all trades have IDs and normalized pairs for backwards compatibility
    return trades.map((t) => {
      const id = t.id || generateId();
      const pair = normalizePair(t.pair);
      const strategy = typeof t.strategy === 'string' ? t.strategy.trim() : t.strategy;
      const tradeType = typeof t.tradeType === 'string' ? t.tradeType.trim() : t.tradeType;
      return {
        ...t,
        id,
        ...(pair ? { pair } : {}),
        ...(strategy ? { strategy } : {}),
        ...(tradeType ? { tradeType } : {}),
      };
    });
  } catch {
    return [];
  }
}

function saveTrades(trades) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
}

export function useTrades() {
  const [trades, setTrades] = useState(loadTrades);
  const [filters, setFilters] = useState({ pair: '', result: '' });

  useEffect(() => {
    saveTrades(trades);
  }, [trades]);

  const filteredTrades = useMemo(() => {
    let list = [...trades];
    if (filters.pair) list = list.filter((t) => t.pair === filters.pair);
    if (filters.result === 'win') list = list.filter((t) => t.pnl > 0);
    if (filters.result === 'loss') list = list.filter((t) => t.pnl < 0);
    return list;
  }, [trades, filters.pair, filters.result]);

  const stats = useMemo(() => {
    const totalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = filteredTrades.filter((t) => t.pnl > 0);
    const losses = filteredTrades.filter((t) => t.pnl < 0);
    const winRate = filteredTrades.length > 0 ? (wins.length / filteredTrades.length) * 100 : 0;
    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
    const avgPnl = filteredTrades.length > 0 ? totalPnl / filteredTrades.length : 0;
    const avgWinning = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLosing = losses.length > 0 ? grossLoss / losses.length : 0;
    const bestTrade = filteredTrades.length > 0 ? Math.max(...filteredTrades.map((t) => t.pnl)) : 0;
    const worstTrade = filteredTrades.length > 0 ? Math.min(...filteredTrades.map((t) => t.pnl)) : 0;
    const equityNow = STARTING_BALANCE + totalPnl;
    const equityChangePct = ((equityNow - STARTING_BALANCE) / STARTING_BALANCE) * 100;
    const longTrades = filteredTrades.filter((t) => t.action === 'Buy');
    const shortTrades = filteredTrades.filter((t) => t.action === 'Sell');
    const longWinRate = longTrades.length > 0 ? (longTrades.filter((t) => t.pnl > 0).length / longTrades.length) * 100 : 0;
    const shortWinRate = shortTrades.length > 0 ? (shortTrades.filter((t) => t.pnl > 0).length / shortTrades.length) * 100 : 0;

    return {
      startingBalance: STARTING_BALANCE,
      totalPnl,
      wins,
      losses,
      winRate,
      grossProfit,
      grossLoss,
      profitFactor,
      avgPnl,
      avgWinning,
      avgLosing,
      bestTrade,
      worstTrade,
      equityNow,
      equityChangePct,
      longWinRate,
      shortWinRate,
    };
  }, [filteredTrades]);

  const uniquePairs = useMemo(() => {
    const seen = new Set();
    const result = [];
    trades.forEach((t) => {
      const p = normalizePair(t.pair);
      if (!p || seen.has(p)) return;
      seen.add(p);
      result.push(p);
    });
    return result.sort();
  }, [trades]);

  function addTrade(trade) {
    const { tradeDate, tradeTime, ...rest } = trade;
    let tradeMoment;
    if (tradeDate) {
      const [y, m, d] = tradeDate.split('-').map((v) => parseInt(v, 10));
      const [hh = 0, mm = 0] = (tradeTime || '00:00').split(':').map((v) => parseInt(v, 10));
      tradeMoment = new Date(y, (m || 1) - 1, d || 1, hh, mm);
    } else {
      tradeMoment = new Date();
    }
    const date = tradeMoment.toLocaleDateString();
    const hour = tradeMoment.getHours();
    const action = trade.exit >= trade.entry ? 'Buy' : 'Sell';
    const id = rest.id || generateId();
    const pair = normalizePair(rest.pair);
    const strategy = typeof rest.strategy === 'string' ? rest.strategy.trim() : rest.strategy;
    const tradeType = typeof rest.tradeType === 'string' ? rest.tradeType.trim() : rest.tradeType;
    const normalizedTrade = {
      ...rest,
      ...(pair ? { pair } : {}),
      ...(strategy ? { strategy } : {}),
      ...(tradeType ? { tradeType } : {}),
    };
    setTrades((prev) => [...prev, { ...normalizedTrade, id, date, hour, action }]);
  }

  function deleteTrade(id) {
    setTrades((prev) => prev.filter((t) => t.id !== id));
  }

  function updateTrade(updated) {
    setTrades((prev) =>
      prev.map((t) => {
        if (t.id !== updated.id) return t;
        const pair = normalizePair(updated.pair ?? t.pair);
        const strategy =
          typeof updated.strategy === 'string'
            ? updated.strategy.trim()
            : updated.strategy ?? t.strategy;
        const tradeType =
          typeof updated.tradeType === 'string'
            ? updated.tradeType.trim()
            : updated.tradeType ?? t.tradeType;
        return {
          ...t,
          ...updated,
          ...(pair ? { pair } : {}),
          ...(strategy ? { strategy } : {}),
          ...(tradeType ? { tradeType } : {}),
          id: t.id,
        };
      })
    );
  }

  function exportData() {
    const blob = new Blob([JSON.stringify(trades)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'journal_backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return {
    trades,
    filteredTrades,
    filters,
    setFilters,
    stats,
    uniquePairs,
    addTrade,
    deleteTrade,
    updateTrade,
    exportData,
  };
}
