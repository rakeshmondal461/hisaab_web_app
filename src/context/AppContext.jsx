import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';
import { db } from '../services/db.js';
import { budgetKey, createBudgetFromSavingsPlan } from '../models/budgetModel.js';

const AppContext = createContext(null);

const initialState = {
  expenses: [],
  budgets: {},
  tasks: [],
  theme: 'dark',
  currency: '₹',
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOAD': return { ...state, ...action.payload };

    case 'ADD_EXPENSE': return { ...state, expenses: [action.expense, ...state.expenses] };
    case 'UPDATE_EXPENSE': return { ...state, expenses: state.expenses.map(e => e.id === action.expense.id ? action.expense : e) };
    case 'DELETE_EXPENSE': return { ...state, expenses: state.expenses.filter(e => e.id !== action.id) };
    case 'IMPORT_EXPENSES': {
      const ids = new Set(state.expenses.map(e => e.id));
      const newOnes = action.expenses.filter(e => !ids.has(e.id));
      return { ...state, expenses: [...newOnes, ...state.expenses] };
    }

    case 'SAVE_BUDGET': {
      const key = budgetKey(action.budget.year, action.budget.month);
      return { ...state, budgets: { ...state.budgets, [key]: action.budget } };
    }
    case 'IMPORT_BUDGETS': {
      const merged = { ...state.budgets };
      Object.entries(action.budgets).forEach(([k, v]) => { if (!merged[k]) merged[k] = v; });
      return { ...state, budgets: merged };
    }

    case 'ADD_TASK': return { ...state, tasks: [action.task, ...state.tasks] };
    case 'UPDATE_TASK': return { ...state, tasks: state.tasks.map(t => t.id === action.task.id ? action.task : t) };
    case 'DELETE_TASK': return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    case 'IMPORT_TASKS': {
      const ids = new Set(state.tasks.map(t => t.id));
      const newOnes = action.tasks.filter(t => !ids.has(t.id));
      return { ...state, tasks: [...newOnes, ...state.tasks] };
    }

    case 'SET_THEME': return { ...state, theme: action.theme };
    case 'SET_CURRENCY': return { ...state, currency: action.currency };
    case 'CLEAR_ALL_DATA': return { ...initialState, theme: state.theme, currency: state.currency };

    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isLoading, setIsLoading] = useState(true);
  // Tracks whether the initial async load from IndexedDB has finished.
  // Using a ref (not state) so toggling it doesn't trigger an extra render.
  const isLoaded = useRef(false);

  // ── Initial load from IndexedDB (async) ─────────────────────────────
  useEffect(() => {
    async function loadFromDB() {
      try {
        const [expenses, budgets, tasks, theme, currency] = await Promise.all([
          db.get('expenses', []),
          db.get('budgets', {}),
          db.get('tasks', []),
          db.get('theme', 'dark'),
          db.get('currency', '₹'),
        ]);
        dispatch({ type: 'LOAD', payload: { expenses, budgets, tasks, theme, currency } });
      } finally {
        // Mark as loaded BEFORE setIsLoading so write effects activate correctly
        isLoaded.current = true;
        setIsLoading(false);
      }
    }
    loadFromDB();
  }, []);

  // ── Persist each slice to IndexedDB on change ────────────────────────
  // Guard: skip the very first run (initial mount with empty state) so we
  // don't overwrite IndexedDB before the async read above has finished.
  useEffect(() => { if (isLoaded.current) db.set('expenses', state.expenses); }, [state.expenses]);
  useEffect(() => { if (isLoaded.current) db.set('budgets',  state.budgets);  }, [state.budgets]);
  useEffect(() => { if (isLoaded.current) db.set('tasks',    state.tasks);    }, [state.tasks]);
  useEffect(() => { if (isLoaded.current) db.set('theme',    state.theme);    }, [state.theme]);
  useEffect(() => { if (isLoaded.current) db.set('currency', state.currency); }, [state.currency]);

  // ── Computed helpers ──────────────────────────────────────────────────────
  function expensesForMonth(year, month) {
    return state.expenses
      .filter(e => { const d = new Date(e.date); return d.getFullYear() === year && d.getMonth() + 1 === month; })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  function totalSpentForMonth(year, month) {
    return expensesForMonth(year, month).filter(e => !e.isIncome).reduce((s, e) => s + e.amount, 0);
  }

  function totalIncomeForMonth(year, month) {
    return expensesForMonth(year, month).filter(e => e.isIncome).reduce((s, e) => s + e.amount, 0);
  }

  function spendByCategory(year, month) {
    const map = {};
    expensesForMonth(year, month).filter(e => !e.isIncome).forEach(e => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }

  function budgetFor(year, month) {
    return state.budgets[budgetKey(year, month)] || { categoryBudgets: {}, totalBudget: 0, savingsTarget: 0, monthlyIncome: 0, isAutoMode: false, month, year };
  }

  function dailyBudgetLimit(year, month) {
    const b = budgetFor(year, month);
    if (!b.totalBudget) return 0;
    const now = new Date();
    const daysInMonth = new Date(year, month, 0).getDate();
    const isCurrentMonth = now.getFullYear() === year && now.getMonth() + 1 === month;
    if (!isCurrentMonth) return b.totalBudget / daysInMonth;
    const remainingDays = daysInMonth - now.getDate() + 1;
    if (remainingDays <= 0) return 0;
    const spent = totalSpentForMonth(year, month);
    return Math.max(0, b.totalBudget - spent) / remainingDays;
  }

  function totalSpentForDay(date) {
    const d = new Date(date);
    return state.expenses.filter(e => {
      const ed = new Date(e.date);
      return !e.isIncome && ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth() && ed.getDate() === d.getDate();
    }).reduce((s, e) => s + e.amount, 0);
  }

  function actualSavingsForMonth(year, month) {
    return totalIncomeForMonth(year, month) - totalSpentForMonth(year, month);
  }

  function savingsProgressForMonth(year, month) {
    const b = budgetFor(year, month);
    if (!b.savingsTarget) return 0;
    return Math.min(1, Math.max(0, actualSavingsForMonth(year, month) / b.savingsTarget));
  }

  const value = {
    state, dispatch,
    expensesForMonth, totalSpentForMonth, totalIncomeForMonth,
    spendByCategory, budgetFor, dailyBudgetLimit, totalSpentForDay,
    actualSavingsForMonth, savingsProgressForMonth,
  };

  // Block rendering until the first DB load completes to avoid a
  // flash of empty/default state on startup.
  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: '12px'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          border: '3px solid var(--primary)', borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span style={{ color: 'var(--text2)', fontSize: '14px' }}>Loading HiSaab…</span>
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() { return useContext(AppContext); }
