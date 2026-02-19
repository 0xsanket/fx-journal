import { useState, useMemo } from 'react';

export function PnLCalendar({ filteredTrades }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const calendarData = useMemo(() => {
    const days = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const data = {};

    filteredTrades.forEach((t) => {
      const d = new Date(t.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!data[day]) {
            data[day] = { pnl: 0, count: 0, wins: 0, losses: 0 };
        }
        data[day].pnl += t.pnl;
        data[day].count += 1;
        if (t.pnl > 0) data[day].wins += 1;
        if (t.pnl < 0) data[day].losses += 1;
      }
    });

    const calendarGrid = [];
    let dayCounter = 1;

    // Create 6 weeks even if not all used
    for (let i = 0; i < 6; i++) {
        const week = [];
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < startDay) {
                week.push(null); // Empty slot before start of month
            } else if (dayCounter > days) {
                week.push(null); // Empty slot after end of month
            } else {
                week.push({ day: dayCounter, ...data[dayCounter] });
                dayCounter++;
            }
        }
        calendarGrid.push(week);
        if (dayCounter > days) break;
    }

    return calendarGrid;
  }, [year, month, filteredTrades]);

  return (
    <div className="pnl-calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="calendar-nav-btn">&lt;</button>
        <h3>{monthName} {year}</h3>
        <button onClick={nextMonth} className="calendar-nav-btn">&gt;</button>
      </div>
      <div className="calendar-grid">
        <div className="calendar-day-header">Sun</div>
        <div className="calendar-day-header">Mon</div>
        <div className="calendar-day-header">Tue</div>
        <div className="calendar-day-header">Wed</div>
        <div className="calendar-day-header">Thu</div>
        <div className="calendar-day-header">Fri</div>
        <div className="calendar-day-header">Sat</div>
        
        {calendarData.flat().map((item, idx) => {
            if (!item) return <div key={`empty-${idx}`} className="calendar-day empty"></div>;
            
            const isProfit = item.pnl > 0;
            const isLoss = item.pnl < 0;
            const pnlClass = isProfit ? 'profit' : isLoss ? 'loss' : 'neutral';
            
            return (
                <div key={`day-${item.day}`} className={`calendar-day ${pnlClass}`}>
                    <div className="day-number">{item.day}</div>
                    {item.count > 0 && (
                        <div className="day-stats">
                            <span className="day-pnl">${item.pnl.toFixed(0)}</span>
                            <span className="day-trades">{item.count} trades</span>
                        </div>
                    )}
                </div>
            );
        })}
      </div>
    </div>
  );
}
