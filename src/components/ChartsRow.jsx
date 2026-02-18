import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { ticks: { color: '#e5e7eb' }, grid: { display: false } },
    y: { ticks: { color: '#e5e7eb' }, grid: { color: 'rgba(148,163,184,0.2)' } },
  },
};

export function ChartsRow({ filteredTrades, startingBalance }) {
  let balance = startingBalance;
  const equityData = filteredTrades.map((t) => {
    balance += t.pnl;
    return balance;
  });

  const pairCounts = {};
  filteredTrades.forEach((t) => {
    if (t.pair) pairCounts[t.pair] = (pairCounts[t.pair] || 0) + 1;
  });

  const lineData = {
    labels: filteredTrades.map((t, i) => t.date || `Trade ${i + 1}`),
    datasets: [
      {
        label: 'Equity Curve',
        data: [startingBalance, ...equityData],
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const doughnutData = {
    labels: Object.keys(pairCounts),
    datasets: [
      {
        data: Object.values(pairCounts),
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6'],
      },
    ],
  };

  return (
    <div className="charts-row">
      <div className="chart-container main-chart">
        <div className="chart-header">
          <h4>Trade Growth View</h4>
          <span className="chart-subtitle">Equity evolution across all trades</span>
        </div>
        <Line data={lineData} options={chartOptions} />
      </div>
      <div className="chart-container side-chart">
        <div className="chart-header">
          <h4>Symbol Performance</h4>
          <span className="chart-subtitle">Distribution of trades per pair</span>
        </div>
        <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
      </div>
    </div>
  );
}
