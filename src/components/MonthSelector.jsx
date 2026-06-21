import React from 'react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function MonthSelector({ year, month, onChange }) {
  const now = new Date();
  const isMax = year === now.getFullYear() && month === now.getMonth() + 1;

  function prev() {
    if (month === 1) onChange(year - 1, 12);
    else onChange(year, month - 1);
  }
  function next() {
    if (month === 12) onChange(year + 1, 1);
    else onChange(year, month + 1);
  }

  return (
    <div className="month-selector">
      <button className="month-btn" onClick={prev}>‹</button>
      <span className="month-label">{MONTHS[month - 1]} {year}</span>
      <button className="month-btn" onClick={next} disabled={isMax}>›</button>
    </div>
  );
}
