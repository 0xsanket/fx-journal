import { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function parseDateStr(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function TradeGrowthView({ filteredTrades, startingBalance, variant = 'card' }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { equityData, labels } = useMemo(() => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    const filtered = filteredTrades
      .filter((t) => {
        const d = parseDateStr(t.date);
        if (!d) return false;
        if (start && d < start) return false;
        if (end) {
          const endDay = new Date(end);
          endDay.setHours(23, 59, 59, 999);
          if (d > endDay) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const da = parseDateStr(a.date);
        const db = parseDateStr(b.date);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return da.getTime() - db.getTime();
      });
    let balance = startingBalance;
    const eq = filtered.map((t) => {
      balance += t.pnl;
      return balance;
    });
    const labs = filtered.map((t, i) => t.date || `Trade ${i + 1}`);
    return {
      equityData: [startingBalance, ...eq],
      labels: ['Start', ...labs],
    };
  }, [filteredTrades, startingBalance, startDate, endDate]);

  const lineData = {
    labels: labels.length ? labels : ['Start'],
    datasets: [
      {
        label: 'Equity',
        data: equityData,
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        borderDash: [5, 5],
        pointRadius: 4,
      },
      {
        label: 'Balance',
        data: equityData,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top', align: 'end', labels: { color: '#e5e7eb', usePointStyle: true } },
    },
    scales: {
      x: { ticks: { color: '#e5e7eb', maxRotation: 45 }, grid: { display: false } },
      y: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(148,163,184,0.2)' } },
    },
  };

  const WrapperTag = variant === 'embedded' ? 'div' : 'section';
  const wrapperClass = variant === 'embedded' ? 'trade-growth-embedded' : 'trade-growth-section';

  return (
    <WrapperTag className={wrapperClass}>
      <div className="trade-growth-header">
        <h3 className="trade-growth-title">Trade Growth View</h3>
        <div className="trade-growth-filters">
          <span className="filter-label">Filter By Date:</span>
          <div className="date-input-wrapper">
            <input
              type="date"
              className="date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start date"
            />
          </div>
          <div className="date-input-wrapper">
            <input
              type="date"
              className="date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End date"
            />
          </div>
        </div>
      </div>
      <div className="chart-container trade-growth-chart">
        <Line data={lineData} options={chartOptions} />
      </div>
    </WrapperTag>
  );
}
