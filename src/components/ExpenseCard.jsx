import React from 'react';
import { getCategoryInfo } from '../models/expenseModel.js';

function fmt(n) { return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

export default function ExpenseCard({ expense, symbol, onDelete, onClick }) {
  const info = getCategoryInfo(expense.category, expense.isIncome);
  return (
    <div className="expense-card" onClick={onClick}>
      <span className="expense-emoji">{info.emoji}</span>
      <div className="expense-info">
        <div className="expense-cat title-md">{info.label}</div>
        {expense.note ? <div className="expense-note body-sm">{expense.note}</div> : null}
      </div>
      <span className={`expense-amount ${expense.isIncome ? 'income' : 'expense'}`}>
        {expense.isIncome ? '+' : '-'}{symbol}{fmt(expense.amount)}
      </span>
    </div>
  );
}
