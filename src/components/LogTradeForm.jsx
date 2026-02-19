import { useState } from 'react';

export function LogTradeForm({ onAddTrade }) {
  const [formTab, setFormTab] = useState('details');
  const [pair, setPair] = useState('');
  const [entry, setEntry] = useState('');
  const [exit, setExit] = useState('');
  const [lots, setLots] = useState('');
  const [strategy, setStrategy] = useState('');
  const [tradeType, setTradeType] = useState('');
  const [pnl, setPnl] = useState('');
  const [learning, setLearning] = useState('');
  const [tvLink, setTvLink] = useState('');
  const [chartLinks, setChartLinks] = useState({
    d1: '',
    h4: '',
    h1: '',
    m30: '',
    m15: '',
  });
  const [session, setSession] = useState('');
  const [emotion, setEmotion] = useState(0);
  const [tradeDate, setTradeDate] = useState('');
  const [tradeTime, setTradeTime] = useState('');
  const [timeframe, setTimeframe] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    const entryNum = parseFloat(entry);
    const exitNum = parseFloat(exit);
    const lotsNum = parseFloat(lots);
    const pnlNum = parseFloat(pnl);
    if (!pair.trim() || isNaN(entryNum) || isNaN(exitNum) || isNaN(lotsNum) || isNaN(pnlNum)) return;

    const tradeData = {
      pair: pair.toUpperCase(),
      entry: entryNum,
      exit: exitNum,
      lots: lotsNum,
      strategy: strategy || undefined,
      tradeType: tradeType || undefined,
      pnl: pnlNum,
    };

    // Add optional metadata fields only if they have values
    if (learning.trim()) tradeData.learning = learning.trim();
    if (tvLink.trim()) tradeData.tvLink = tvLink.trim();
    if (session) tradeData.session = session;
    if (emotion > 0) tradeData.emotion = emotion;
    if (tradeDate) tradeData.tradeDate = tradeDate;
    if (tradeTime) tradeData.tradeTime = tradeTime;
    if (timeframe) tradeData.timeframe = timeframe;

    const chartLinksFiltered = {};
    if (chartLinks.d1.trim()) chartLinksFiltered.d1 = chartLinks.d1.trim();
    if (chartLinks.h4.trim()) chartLinksFiltered.h4 = chartLinks.h4.trim();
    if (chartLinks.h1.trim()) chartLinksFiltered.h1 = chartLinks.h1.trim();
    if (chartLinks.m30.trim()) chartLinksFiltered.m30 = chartLinks.m30.trim();
    if (chartLinks.m15.trim()) chartLinksFiltered.m15 = chartLinks.m15.trim();

    if (Object.keys(chartLinksFiltered).length > 0) {
      tradeData.chartLinks = chartLinksFiltered;
    }

    onAddTrade(tradeData);

    // Reset all fields
    setPair('');
    setEntry('');
    setExit('');
    setLots('');
    setStrategy('');
    setTradeType('');
    setPnl('');
    setLearning('');
    setTvLink('');
    setChartLinks({ d1: '', h4: '', h1: '', m30: '', m15: '' });
    setSession('');
    setEmotion(0);
    setTradeDate('');
    setTradeTime('');
    setTimeframe('');
    setFormTab('details');
  }

  function updateChartLink(timeframe, value) {
    setChartLinks((prev) => ({ ...prev, [timeframe]: value }));
  }

  return (
    <section className="form-section">
      <div className="section-header">
        <div>
          <h3>Log New Trade</h3>
          <p className="section-subtitle">Quickly journal each position to keep your metrics accurate.</p>
        </div>
      </div>

      <div className="form-tabs">
        <button
          type="button"
          className={`form-tab ${formTab === 'details' ? 'active' : ''}`}
          onClick={() => setFormTab('details')}
        >
          Trade
        </button>
        <button
          type="button"
          className={`form-tab ${formTab === 'learning' ? 'active' : ''}`}
          onClick={() => setFormTab('learning')}
        >
          Learning
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {formTab === 'details' && (
          <>
            <div className="input-group">
              <input
                type="text"
                placeholder="Pair (e.g. XAUUSD, EURUSD)"
                value={pair}
                onChange={(e) => setPair(e.target.value)}
              />
              <input
                type="number"
                step="any"
                placeholder="Entry price"
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
              />
              <input
                type="number"
                step="any"
                placeholder="Exit price"
                value={exit}
                onChange={(e) => setExit(e.target.value)}
              />
              <input
                type="number"
                step="any"
                placeholder="Lot size"
                value={lots}
                onChange={(e) => setLots(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                type="date"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
              />
              <input
                type="time"
                value={tradeTime}
                onChange={(e) => setTradeTime(e.target.value)}
              />
            </div>
            <div className="input-group">
              <select value={strategy} onChange={(e) => setStrategy(e.target.value)}>
                <option value="">Strategy</option>
                <option value="Impulse">Impulse</option>
                <option value="Breakout Closing">Breakout Closing</option>
              </select>
              <select value={tradeType} onChange={(e) => setTradeType(e.target.value)}>
                <option value="">Trade type</option>
                <option value="Continuation">Continuation</option>
                <option value="Reversal">Reversal</option>
              </select>
              <select value={session} onChange={(e) => setSession(e.target.value)}>
                <option value="">Session</option>
                <option value="asian">Asian</option>
                <option value="pre_london">Pre London</option>
                <option value="london">London</option>
                <option value="pre_new_york">Pre New York</option>
                <option value="new_york">New York</option>
              </select>
              <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                <option value="">Timeframe</option>
                <option value="Daily">Daily</option>
                <option value="4H">4 Hour</option>
                <option value="1H">1 Hour</option>
                <option value="30m">30 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="5m">5 Minutes</option>
              </select>
              <input
                type="number"
                step="any"
                placeholder="PnL ($)"
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
              />
              <button type="submit" className="btn-primary">Add Trade</button>
            </div>
          </>
        )}

        {formTab === 'learning' && (
          <>
            <div className="learning-input-group">
              <label className="learning-label">Learning Notes</label>
              <textarea
                className="learning-textarea"
                placeholder="What went well? What could be improved? Key takeaways from this trade..."
                value={learning}
                onChange={(e) => setLearning(e.target.value)}
                rows={4}
              />
            </div>
            <div className="learning-input-group">
              <label className="learning-label">Emotion Rating</label>
              <div className="emotion-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`emotion-star ${emotion >= star ? 'filled' : ''}`}
                    onClick={() => setEmotion(star)}
                    aria-label={`Emotion rating ${star} star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <div className="learning-input-group">
              <label className="learning-label">TradingView Link</label>
              <input
                type="url"
                placeholder="https://www.tradingview.com/chart/..."
                value={tvLink}
                onChange={(e) => setTvLink(e.target.value)}
              />
            </div>
            <div className="learning-input-group">
              <label className="learning-label">Chart Links (Image URLs)</label>
              <div className="chart-links-grid">
                <div className="chart-link-item">
                  <span className="chart-link-label">Daily</span>
                  <input
                    type="url"
                    placeholder="Daily chart URL"
                    value={chartLinks.d1}
                    onChange={(e) => updateChartLink('d1', e.target.value)}
                  />
                </div>
                <div className="chart-link-item">
                  <span className="chart-link-label">4H</span>
                  <input
                    type="url"
                    placeholder="4H chart URL"
                    value={chartLinks.h4}
                    onChange={(e) => updateChartLink('h4', e.target.value)}
                  />
                </div>
                <div className="chart-link-item">
                  <span className="chart-link-label">1H</span>
                  <input
                    type="url"
                    placeholder="1H chart URL"
                    value={chartLinks.h1}
                    onChange={(e) => updateChartLink('h1', e.target.value)}
                  />
                </div>
                <div className="chart-link-item">
                  <span className="chart-link-label">30m</span>
                  <input
                    type="url"
                    placeholder="30m chart URL"
                    value={chartLinks.m30}
                    onChange={(e) => updateChartLink('m30', e.target.value)}
                  />
                </div>
                <div className="chart-link-item">
                  <span className="chart-link-label">15m</span>
                  <input
                    type="url"
                    placeholder="15m chart URL"
                    value={chartLinks.m15}
                    onChange={(e) => updateChartLink('m15', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="input-group">
              <button type="submit" className="btn-primary">Add Trade</button>
            </div>
          </>
        )}
      </form>
    </section>
  );
}
