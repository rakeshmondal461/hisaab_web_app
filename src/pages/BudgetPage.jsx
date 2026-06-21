import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import MonthSelector from '../components/MonthSelector.jsx';
import BudgetModal from '../components/BudgetModal.jsx';
import { EXPENSE_CATEGORIES } from '../models/expenseModel.js';

function fmt(n) {
  return Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function BudgetPage() {
  const {
    state,
    dispatch,
    budgetFor,
    totalSpentForMonth,
    totalIncomeForMonth,
    spendByCategory,
    actualSavingsForMonth,
    savingsProgressForMonth,
  } = useApp();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const budget = budgetFor(year, month);
  const hasBudget = budget.totalBudget > 0;

  const spent = totalSpentForMonth(year, month);
  const remainingBudget = budget.totalBudget - spent;
  const actualSavings = actualSavingsForMonth(year, month);
  const savingsProgress = savingsProgressForMonth(year, month);
  const categorySpent = spendByCategory(year, month);

  const handleMonthChange = (newYear, newMonth) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  const handleSaveBudget = (savedBudget) => {
    dispatch({ type: 'SAVE_BUDGET', budget: savedBudget });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="title-lg fw-700" style={{ margin: 0 }}>Budget & Savings</h2>
      </div>

      <MonthSelector year={year} month={month} onChange={handleMonthChange} />

      {!hasBudget ? (
        <div className="empty-state" style={{ marginTop: '24px' }}>
          <span className="empty-emoji">🎯</span>
          <h3 className="empty-title">No budget set for this month</h3>
          <p className="empty-sub">Set up a budget to track your spending and savings goals.</p>
          <button className="btn btn-primary mt-16" onClick={() => setIsModalOpen(true)}>
            Setup Budget
          </button>
        </div>
      ) : (
        <div className="dashboard-grid two-col" style={{ marginTop: '20px' }}>
          {/* Left Column: Summary & Progress */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card-gradient summary-card" style={{ margin: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="label">Monthly Budget Summary</span>
                <span style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  color: '#fff',
                  fontWeight: 'bold'
                }}>
                  {budget.isAutoMode ? '⚡ Auto' : '✏️ Manual'}
                </span>
              </div>

              <div className="spendable-card" style={{ padding: 0, background: 'none', boxShadow: 'none', margin: '16px 0 0 0' }}>
                <div className="overview-stat-box">
                  <div className="label">Budget</div>
                  <div className="val">{state.currency}{fmt(budget.totalBudget)}</div>
                </div>
                <div className="overview-stat-box">
                  <div className="label">Spent</div>
                  <div className="val">{state.currency}{fmt(spent)}</div>
                </div>
                <div className="overview-stat-box">
                  <div className="label">Remaining</div>
                  <div className="val" style={{ color: remainingBudget >= 0 ? '#3ddf96ff' : '#FF6B6B' }}>
                    {remainingBudget >= 0 ? '' : '-'}{state.currency}{fmt(Math.abs(remainingBudget))}
                  </div>
                </div>
              </div>

              {budget.isAutoMode && budget.savingsTarget > 0 && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'rgba(255,255,255,0.8)' }}>
                    <span>Savings Target Progress</span>
                    <span>{state.currency}{fmt(actualSavings)} / {state.currency}{fmt(budget.savingsTarget)}</span>
                  </div>
                  <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, savingsProgress * 100)}%`,
                        background: savingsProgress >= 1 ? 'var(--success)' : savingsProgress >= 0.5 ? 'var(--warning)' : 'var(--error)'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Category Budgets List */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="section-header" style={{ marginTop: 0, paddingLeft: 0 }}>Category Budgets</div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {EXPENSE_CATEGORIES.map(c => {
                const allocated = budget.categoryBudgets[c.key] || 0;
                const currentSpent = categorySpent[c.key] || 0;
                const pct = allocated > 0 ? (currentSpent / allocated) * 100 : 0;
                const remaining = allocated - currentSpent;

                let barColor = 'var(--success)';
                if (pct > 100) barColor = 'var(--error)';
                else if (pct > 80) barColor = 'var(--warning)';

                return (
                  <div key={c.key} className="cat-budget-row" style={{ margin: 0, marginBottom: '8px' }}>
                    <span style={{ fontSize: '24px' }}>{c.emoji}</span>
                    <div className="cat-budget-info">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="title-md fw-600">{c.label}</span>
                        <span className="body-sm fw-600">
                          {state.currency}{fmt(currentSpent)} / {state.currency}{fmt(allocated)}
                        </span>
                      </div>
                      <div className="cat-bar">
                        <div
                          className="cat-bar-fill"
                          style={{
                            width: `${Math.min(100, pct)}%`,
                            backgroundColor: barColor
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginTop: '4px', color: 'var(--text2)' }}>
                        <span>{pct.toFixed(0)}% Spent</span>
                        <span style={{ color: remaining >= 0 ? 'var(--success)' : 'var(--error)', fontWeight: '500' }}>
                          {remaining >= 0 ? `Remaining: ${state.currency}${fmt(remaining)}` : `Over by: ${state.currency}${fmt(Math.abs(remaining))}`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {hasBudget && (
        <button
          className="fab"
          onClick={() => setIsModalOpen(true)}
        >
          <span>✏️</span> Edit Budget
        </button>
      )}

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBudget}
        year={year}
        month={month}
        initialBudget={budget}
        currency={state.currency}
      />
    </div>
  );
}
