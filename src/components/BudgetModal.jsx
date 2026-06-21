import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { EXPENSE_CATEGORIES } from '../models/expenseModel.js';
import { PRIORITY_WEIGHTS, createBudget, createBudgetFromSavingsPlan } from '../models/budgetModel.js';
import { useToast } from './Toast.jsx';

export default function BudgetModal({ isOpen, onClose, onSave, year, month, initialBudget, currency }) {
  const showToast = useToast();
  const [isAutoMode, setIsAutoMode] = useState(true);
  
  // Auto Mode State
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [savingsPct, setSavingsPct] = useState(20);

  // Manual Mode State
  const [manualBudgets, setManualBudgets] = useState({
    food: '', transport: '', shopping: '', bills: '', health: '', entertainment: '', other: ''
  });

  useEffect(() => {
    if (initialBudget && initialBudget.totalBudget > 0) {
      setIsAutoMode(initialBudget.isAutoMode);
      setMonthlyIncome(initialBudget.monthlyIncome ? initialBudget.monthlyIncome.toString() : '');
      if (initialBudget.monthlyIncome > 0) {
        setSavingsPct(Math.round((initialBudget.savingsTarget / initialBudget.monthlyIncome) * 100));
      } else {
        setSavingsPct(20);
      }
      
      const newManual = {};
      EXPENSE_CATEGORIES.forEach(c => {
        newManual[c.key] = initialBudget.categoryBudgets[c.key] ? initialBudget.categoryBudgets[c.key].toString() : '';
      });
      setManualBudgets(newManual);
    } else {
      setIsAutoMode(true);
      setMonthlyIncome('');
      setSavingsPct(20);
      setManualBudgets({
        food: '', transport: '', shopping: '', bills: '', health: '', entertainment: '', other: ''
      });
    }
  }, [initialBudget, isOpen]);

  if (!isOpen) return null;

  const incomeVal = parseFloat(monthlyIncome) || 0;
  const savingsTarget = Math.round(incomeVal * (savingsPct / 100));
  const spendableBudget = Math.max(0, incomeVal - savingsTarget);

  // Auto allocations preview
  const autoAllocations = {};
  Object.entries(PRIORITY_WEIGHTS).forEach(([key, weight]) => {
    autoAllocations[key] = spendableBudget * weight;
  });

  // Manual sum
  const manualTotal = Object.values(manualBudgets).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

  function handleManualChange(key, value) {
    setManualBudgets(prev => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    let finalBudget;

    if (isAutoMode) {
      if (incomeVal <= 0) {
        showToast('Please enter a valid monthly income', 'error');
        return;
      }
      finalBudget = createBudgetFromSavingsPlan({
        income: incomeVal,
        savingsTarget,
        month,
        year
      });
    } else {
      if (manualTotal <= 0) {
        showToast('Please allocate budget to at least one category', 'error');
        return;
      }

      const categoryBudgets = {};
      EXPENSE_CATEGORIES.forEach(c => {
        categoryBudgets[c.key] = parseFloat(manualBudgets[c.key]) || 0;
      });

      finalBudget = createBudget({
        categoryBudgets,
        totalBudget: manualTotal,
        savingsTarget: 0, // no savings target defined in simple manual mode
        monthlyIncome: 0,
        isAutoMode: false,
        month,
        year
      });
    }

    onSave(finalBudget);
    showToast('Budget saved successfully', 'success');
    onClose();
  }

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="form-page" style={{ padding: 0 }}>
        <h3 className="title-lg mb-8 text-center" style={{ textAlign: 'center' }}>
          Budget Setup
        </h3>
        <p className="body-sm text-center mb-16" style={{ textAlign: 'center' }}>
          For {MONTHS[month - 1]} {year}
        </p>

        <div className="type-toggle">
          <button
            type="button"
            className={`type-tab ${isAutoMode ? 'active-income' : ''}`}
            onClick={() => setIsAutoMode(true)}
          >
            ⚡ Auto Plan
          </button>
          <button
            type="button"
            className={`type-tab ${!isAutoMode ? 'active-expense' : ''}`}
            onClick={() => setIsAutoMode(false)}
          >
            ✏️ Manual
          </button>
        </div>

        {isAutoMode ? (
          <div>
            <div className="form-group">
              <label className="form-label">Monthly Income</label>
              <div className="amount-input-row">
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={monthlyIncome}
                  onChange={e => setMonthlyIncome(e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="row justify-between mb-8" style={{ justifyContent: 'space-between' }}>
                <label className="form-label">Savings Target: <span className="text-primary fw-700">{savingsPct}%</span></label>
                <span className="pct-badge">{currency}{savingsTarget.toLocaleString()}</span>
              </div>
              <div className="slider-wrap">
                <input
                  type="range"
                  min="0"
                  max="90"
                  step="5"
                  value={savingsPct}
                  onChange={e => setSavingsPct(parseInt(e.target.value))}
                />
                <div className="slider-labels">
                  <span>0%</span>
                  <span>45%</span>
                  <span>90%</span>
                </div>
              </div>
            </div>

            <div className="alloc-summary">
              <div className="alloc-box">
                <div className="al">Monthly Income</div>
                <div className="av text-primary">{currency}{incomeVal.toLocaleString()}</div>
              </div>
              <div className="alloc-box">
                <div className="al">Savings Target</div>
                <div className="av text-success">{currency}{savingsTarget.toLocaleString()}</div>
              </div>
              <div className="alloc-box">
                <div className="al">Spendable Budget</div>
                <div className="av text-warning">{currency}{spendableBudget.toLocaleString()}</div>
              </div>
            </div>

            <div className="section-header" style={{ paddingLeft: 0 }}>Allocation Preview</div>
            <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '20px' }}>
              {EXPENSE_CATEGORIES.map(c => {
                const allocated = autoAllocations[c.key] || 0;
                return (
                  <div key={c.key} className="budget-preview-row">
                    <span style={{ fontSize: '20px' }}>{c.emoji}</span>
                    <div className="budget-preview-info">
                      <div className="title-md">{c.label}</div>
                      <div className="body-sm">{Math.round(PRIORITY_WEIGHTS[c.key] * 100)}% weight</div>
                    </div>
                    <span className="fw-700">{currency}{Math.round(allocated).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div>
            <div className="section-header" style={{ paddingLeft: 0 }}>Category Budgets</div>
            <div style={{ maxHeight: '350px', overflowY: 'auto', marginBottom: '20px', paddingRight: '4px' }}>
              {EXPENSE_CATEGORIES.map(c => (
                <div key={c.key} className="form-group" style={{ marginBottom: '12px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{c.emoji}</span> {c.label}
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={manualBudgets[c.key]}
                    onChange={e => handleManualChange(c.key, e.target.value)}
                    className="form-input"
                  />
                </div>
              ))}
            </div>

            <div className="alloc-summary" style={{ gridTemplateColumns: '1fr', margin: '0 0 20px' }}>
              <div className="alloc-box">
                <div className="al">Total Budget Limit</div>
                <div className="av text-primary">{currency}{manualTotal.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
          <button type="submit" className="btn btn-primary btn-block">
            Save Budget
          </button>
          <button type="button" className="btn btn-outline btn-block" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
