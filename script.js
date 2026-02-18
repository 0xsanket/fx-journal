// Initialize or Load Data
let trades = JSON.parse(localStorage.getItem('trades')) || [];

// Chart instances (to avoid duplicates)
let equityChartInstance = null;
let pairChartInstance = null;
let winLossChartInstance = null;
let weekdayChartInstance = null;
let monthlyChartInstance = null;

function addTrade() {
    const pair = document.getElementById('pair').value.toUpperCase();
    const entry = parseFloat(document.getElementById('entry').value);
    const exit = parseFloat(document.getElementById('exit').value);
    const lots = parseFloat(document.getElementById('lots').value);
    const strategy = document.getElementById('strategy').value;
    const tradeType = document.getElementById('trade-type').value;
    const pnl = parseFloat(document.getElementById('pnl').value);
    const date = new Date().toLocaleDateString();

    if (pair && !isNaN(entry) && !isNaN(exit) && !isNaN(lots) && !isNaN(pnl)) {
        const action = exit >= entry ? 'Buy' : 'Sell';

        trades.push({ pair, entry, exit, lots, pnl, date, action, strategy, tradeType });
        localStorage.setItem('trades', JSON.stringify(trades));
        updateDashboard();

        // Reset inputs
        document.getElementById('pair').value = '';
        document.getElementById('entry').value = '';
        document.getElementById('exit').value = '';
        document.getElementById('lots').value = '';
        document.getElementById('strategy').value = '';
        document.getElementById('trade-type').value = '';
        document.getElementById('pnl').value = '';
    }
}

function updateDashboard() {
    // Date display
    const dateEl = document.getElementById('date-display');
    if (dateEl) {
        const now = new Date();
        dateEl.textContent = now.toLocaleString(undefined, {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Apply filters for stats / table / charts
    const pairFilter = document.getElementById('filter-pair')?.value || '';
    const resultFilter = document.getElementById('filter-result')?.value || '';

    let filteredTrades = trades.slice();

    if (pairFilter) {
        filteredTrades = filteredTrades.filter(t => t.pair === pairFilter);
    }
    if (resultFilter === 'win') {
        filteredTrades = filteredTrades.filter(t => t.pnl > 0);
    } else if (resultFilter === 'loss') {
        filteredTrades = filteredTrades.filter(t => t.pnl < 0);
    }

    // 1. Calculate Stats
    const startingBalance = 5000;
    const totalPnl = filteredTrades.reduce((sum, t) => sum + t.pnl, 0);
    const wins = filteredTrades.filter(t => t.pnl > 0);
    const losses = filteredTrades.filter(t => t.pnl < 0);
    
    const winRate = filteredTrades.length > 0 ? (wins.length / filteredTrades.length) * 100 : 0;
    
    const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss === 0 ? grossProfit : (grossProfit / grossLoss);

    const avgPnl = filteredTrades.length > 0 ? totalPnl / filteredTrades.length : 0;

    const avgWinning = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLosing = losses.length > 0 ? -grossLoss / losses.length : 0;

    const bestTrade = filteredTrades.length > 0 ? Math.max(...filteredTrades.map(t => t.pnl)) : 0;
    const worstTrade = filteredTrades.length > 0 ? Math.min(...filteredTrades.map(t => t.pnl)) : 0;

    const equityNow = startingBalance + totalPnl;
    const equityChangePct = ((equityNow - startingBalance) / startingBalance) * 100;

    // Update UI
    document.getElementById('total-equity').innerText = `$${equityNow.toFixed(2)}`;

    const equityChangeEl = document.getElementById('equity-change');
    if (equityChangeEl) {
        equityChangeEl.innerText = `${equityChangePct >= 0 ? '+' : ''}${equityChangePct.toFixed(2)}%`;
        equityChangeEl.classList.remove('up', 'down');
        equityChangeEl.classList.add(equityChangePct >= 0 ? 'up' : 'down');
    }

    document.getElementById('win-rate').innerText = `${winRate.toFixed(1)}%`;
    document.getElementById('profit-factor').innerText = profitFactor.toFixed(2);

    const summaryEl = document.getElementById('trades-summary');
    if (summaryEl) {
        summaryEl.innerText = `${wins.length} wins / ${losses.length} losses`;
    }

    const avgPnlEl = document.getElementById('avg-pnl');
    if (avgPnlEl) {
        avgPnlEl.innerText = `Avg trade: $${avgPnl.toFixed(2)}`;
    }

    // Detailed stats panel
    document.getElementById('detail-equity').innerText = `$${equityNow.toFixed(2)}`;
    document.getElementById('detail-balance').innerText = `$${equityNow.toFixed(2)}`;
    document.getElementById('detail-gross-profit').innerText = `$${grossProfit.toFixed(2)}`;
    document.getElementById('detail-gross-loss').innerText = `-$${grossLoss.toFixed(2)}`;
    document.getElementById('detail-avg-win').innerText = `$${avgWinning.toFixed(2)}`;
    document.getElementById('detail-avg-loss').innerText = `$${avgLosing.toFixed(2)}`;
    document.getElementById('detail-best').innerText = `$${bestTrade.toFixed(2)}`;
    document.getElementById('detail-worst').innerText = `$${worstTrade.toFixed(2)}`;
    document.getElementById('detail-trades').innerText = `${filteredTrades.length}`;

    // Long/short breakdown
    const longTrades = filteredTrades.filter(t => t.action === 'Buy');
    const shortTrades = filteredTrades.filter(t => t.action === 'Sell');
    const longWins = longTrades.filter(t => t.pnl > 0);
    const shortWins = shortTrades.filter(t => t.pnl > 0);

    const longWinRate = longTrades.length > 0 ? (longWins.length / longTrades.length) * 100 : 0;
    const shortWinRate = shortTrades.length > 0 ? (shortWins.length / shortTrades.length) * 100 : 0;

    document.getElementById('detail-long-win').innerText = `${longWinRate.toFixed(1)}%`;
    document.getElementById('detail-short-win').innerText = `${shortWinRate.toFixed(1)}%`;
    document.getElementById('detail-profit-factor').innerText = profitFactor.toFixed(2);

    // Populate filters (pair dropdown)
    const pairFilterSelect = document.getElementById('filter-pair');
    if (pairFilterSelect) {
        const uniquePairs = Array.from(new Set(trades.map(t => t.pair))).sort();
        const currentSelection = pairFilterSelect.value;

        pairFilterSelect.innerHTML = '<option value="">All Pairs</option>';
        uniquePairs.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p;
            opt.textContent = p;
            pairFilterSelect.appendChild(opt);
        });

        // Restore selection if still exists
        if (currentSelection && uniquePairs.includes(currentSelection)) {
            pairFilterSelect.value = currentSelection;
        }
    }

    // Populate table
    const tbody = document.getElementById('trade-rows');
    if (tbody) {
        tbody.innerHTML = '';
        filteredTrades
            .slice()
            .reverse()
            .forEach(t => {
                const tr = document.createElement('tr');
                const pnlClass = t.pnl >= 0 ? 'pnl-positive' : 'pnl-negative';
                const sideClass = t.action === 'Sell' ? 'sell' : 'buy';

                tr.innerHTML = `
                    <td>${t.date}</td>
                    <td>${t.pair}</td>
                    <td>${t.strategy || '-'}</td>
                    <td><span class="side-badge ${sideClass}">${t.action || '-'}</span></td>
                    <td class="${pnlClass}">${t.pnl.toFixed(2)}</td>
                `;
                tbody.appendChild(tr);
            });
    }

    renderCharts(filteredTrades, startingBalance);
}

function renderCharts(currentTrades, startingBalance) {
    const ctx1 = document.getElementById('equityChart')?.getContext('2d');
    const ctx2 = document.getElementById('pairChart')?.getContext('2d');
    const ctx3 = document.getElementById('winLossChart')?.getContext('2d');
    const ctx4 = document.getElementById('weekdayChart')?.getContext('2d');
    const ctx5 = document.getElementById('monthlyChart')?.getContext('2d');

    if (!ctx1 || !ctx2) return;

    // Destroy previous charts to avoid stacking
    if (equityChartInstance) {
        equityChartInstance.destroy();
    }
    if (pairChartInstance) {
        pairChartInstance.destroy();
    }
    if (winLossChartInstance && ctx3) {
        winLossChartInstance.destroy();
    }
    if (weekdayChartInstance && ctx4) {
        weekdayChartInstance.destroy();
    }
    if (monthlyChartInstance && ctx5) {
        monthlyChartInstance.destroy();
    }

    // Equity Curve Chart
    let balance = startingBalance;
    const equityData = currentTrades.map(t => {
        balance += t.pnl;
        return balance;
    });

    equityChartInstance = new Chart(ctx1, {
        type: 'line',
        data: {
            labels: currentTrades.map((t, i) => t.date || `Trade ${i + 1}`),
            datasets: [{
                label: 'Equity Curve',
                data: [startingBalance, ...equityData],
                borderColor: '#6366f1',
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(99, 102, 241, 0.1)'
            }]
        }
    });

    // Pair Distribution Chart
    const pairCounts = {};
    currentTrades.forEach(t => {
        if (!t.pair) return;
        pairCounts[t.pair] = (pairCounts[t.pair] || 0) + 1;
    });

    pairChartInstance = new Chart(ctx2, {
        type: 'doughnut',
        data: {
            labels: Object.keys(pairCounts),
            datasets: [{
                data: Object.values(pairCounts),
                backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#14b8a6']
            }]
        }
    });

    // Win / Loss Ratio pie
    if (ctx3) {
        const winCount = currentTrades.filter(t => t.pnl > 0).length;
        const lossCount = currentTrades.filter(t => t.pnl < 0).length;
        const breakevenCount = currentTrades.filter(t => t.pnl === 0).length;

        winLossChartInstance = new Chart(ctx3, {
            type: 'doughnut',
            data: {
                labels: ['Wins', 'Losses', 'Breakeven'],
                datasets: [{
                    data: [winCount, lossCount, breakevenCount],
                    backgroundColor: ['#22c55e', '#ef4444', '#e5e7eb']
                }]
            }
        });
    }

    // PnL by weekday bar
    if (ctx4) {
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weekdayPnl = new Array(7).fill(0);

        currentTrades.forEach(t => {
            if (!t.date) return;
            const d = new Date(t.date);
            const day = isNaN(d.getDay()) ? null : d.getDay();
            if (day !== null) {
                weekdayPnl[day] += t.pnl;
            }
        });

        weekdayChartInstance = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels: weekdays,
                datasets: [{
                    label: 'PnL',
                    data: weekdayPnl,
                    backgroundColor: weekdayPnl.map(v => v >= 0 ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.75)')
                }]
            },
            options: {
                scales: {
                    y: {
                        ticks: { color: '#e5e7eb' },
                        grid: { color: 'rgba(148,163,184,0.2)' }
                    },
                    x: {
                        ticks: { color: '#e5e7eb' },
                        grid: { display: false }
                    }
                }
            }
        });
    }

    // PnL by month bar
    if (ctx5) {
        const monthlyMap = new Map();

        currentTrades.forEach(t => {
            if (!t.date) return;
            const d = new Date(t.date);
            if (isNaN(d.getTime())) return;
            const key = `${d.getFullYear()}-${d.getMonth()}`;
            const label = d.toLocaleString(undefined, { month: 'short', year: '2-digit' });
            const existing = monthlyMap.get(key) || { label, pnl: 0 };
            existing.pnl += t.pnl;
            monthlyMap.set(key, existing);
        });

        const sortedEntries = Array.from(monthlyMap.entries()).sort((a, b) => {
            const [ay, am] = a[0].split('-').map(Number);
            const [by, bm] = b[0].split('-').map(Number);
            return ay === by ? am - bm : ay - by;
        }).map(entry => entry[1]);

        const labels = sortedEntries.map(e => e.label);
        const data = sortedEntries.map(e => e.pnl);

        monthlyChartInstance = new Chart(ctx5, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Monthly PnL',
                    data,
                    backgroundColor: data.map(v => v >= 0 ? 'rgba(79,70,229,0.8)' : 'rgba(248,113,113,0.85)')
                }]
            },
            options: {
                scales: {
                    y: {
                        ticks: { color: '#e5e7eb' },
                        grid: { color: 'rgba(148,163,184,0.2)' }
                    },
                    x: {
                        ticks: { color: '#e5e7eb' },
                        grid: { display: false }
                    }
                }
            }
        });
    }
}

function exportData() {
    const blob = new Blob([JSON.stringify(trades)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'journal_backup.json';
    a.click();
}

function importFromLink() {
    const inputEl = document.getElementById('import-link-input');
    const url = inputEl ? inputEl.value.trim() : '';
    if (!url) return;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(parsed => {
            let importedTrades = [];
            if (Array.isArray(parsed)) {
                importedTrades = parsed;
            } else if (parsed && Array.isArray(parsed.trades)) {
                importedTrades = parsed.trades;
            } else {
                alert('Invalid backup format from link. Expected an array of trades.');
                return;
            }

            trades = importedTrades;
            localStorage.setItem('trades', JSON.stringify(trades));
            updateDashboard();
            if (inputEl) {
                inputEl.value = '';
            }
        })
        .catch(err => {
            console.error('Failed to import from link', err);
            alert('Could not fetch this JSON link. Please check that it is correct and accessible.');
        });
}

function importData(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target.result;
            const parsed = JSON.parse(text);

            let importedTrades = [];
            if (Array.isArray(parsed)) {
                importedTrades = parsed;
            } else if (parsed && Array.isArray(parsed.trades)) {
                importedTrades = parsed.trades;
            } else {
                alert('Invalid backup format. Expected an array of trades.');
                return;
            }

            trades = importedTrades;
            localStorage.setItem('trades', JSON.stringify(trades));
            updateDashboard();
        } catch (err) {
            console.error('Failed to import data', err);
            alert('Could not read this JSON file. Please check the format.');
        } finally {
            event.target.value = '';
        }
    };

    reader.readAsText(file);
}

// Tab switching for analytics section
document.querySelectorAll('.analytics-tab').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.analytics-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const target = btn.getAttribute('data-tab');
        document.querySelectorAll('.analytics-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        const panel = document.getElementById(`panel-${target}`);
        if (panel) panel.classList.add('active');
    });
});

// Run on load
updateDashboard();