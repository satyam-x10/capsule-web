import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  onClose: () => void;
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDateToYYYYMMDD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function Calendar({ selectedDate, onDateSelect, onClose }: CalendarProps) {
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (selectedDate && selectedDate.includes('-')) {
      const [y, m] = selectedDate.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Calendar calculations
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

  const now = new Date();
  const todayStr = formatDateToYYYYMMDD(now);

  const daysInGrid: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const prevDate = new Date(currentYear, currentMonth - 1, prevMonthTotalDays - i);
    daysInGrid.push({
      dateStr: formatDateToYYYYMMDD(prevDate),
      dayNum: prevDate.getDate(),
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    const currDate = new Date(currentYear, currentMonth, i);
    daysInGrid.push({
      dateStr: formatDateToYYYYMMDD(currDate),
      dayNum: i,
      isCurrentMonth: true,
    });
  }

  // Next month padding days to fill 42 cells (6 rows of 7 days)
  const remainingCells = 42 - daysInGrid.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextDate = new Date(currentYear, currentMonth + 1, i);
    daysInGrid.push({
      dateStr: formatDateToYYYYMMDD(nextDate),
      dayNum: i,
      isCurrentMonth: false,
    });
  }

  return (
    <div className="calendar-overlay" onClick={onClose}>
      <div className="calendar-box" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="calendar-header">
          <h2 className="calendar-title">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          <div className="calendar-nav">
            <button onClick={handlePrevMonth} className="date-nav-btn" title="Previous Month">
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleNextMonth} className="date-nav-btn" title="Next Month">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Weekday labels */}
        <div className="calendar-grid">
          {WEEKDAYS.map((label, idx) => (
            <div key={`weekday-${idx}`} className="calendar-weekday">
              {label}
            </div>
          ))}

          {/* Days */}
          {daysInGrid.map((item, idx) => {
            const isSelected = item.dateStr === selectedDate;
            const isToday = item.dateStr === todayStr;
            const classes = [
              'calendar-day-btn',
              !item.isCurrentMonth ? 'other-month' : '',
              isSelected ? 'selected' : '',
              isToday ? 'today' : ''
            ].filter(Boolean).join(' ');

            return (
              <button
                key={`day-${idx}`}
                className={classes}
                onClick={() => {
                  onDateSelect(item.dateStr);
                  onClose();
                }}
              >
                {item.dayNum}
              </button>
            );
          })}
        </div>

        {/* Close Button */}
        <button onClick={onClose} className="calendar-close-btn">
          Close Calendar
        </button>
      </div>
    </div>
  );
}
