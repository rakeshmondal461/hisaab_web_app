import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, createExpense } from '../models/expenseModel.js';
import { useToast } from './Toast.jsx';

export default function TransactionModal({ isOpen, onClose, onSave, onDelete, expense, currency }) {
  const showToast = useToast();
  const [isIncome, setIsIncome] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankName, setBankName] = useState('');

  useEffect(() => {
    if (expense) {
      setIsIncome(expense.isIncome);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setNote(expense.note || '');
      setDate(new Date(expense.date).toISOString().split('T')[0]);
      setBankName(expense.bankName || '');
    } else {
      setIsIncome(false);
      setAmount('');
      setCategory('food');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setBankName('');
    }
  }, [expense, isOpen]);

  useEffect(() => {
    // When switching tabs, adjust category if not valid for selected mode
    if (!expense) {
      setCategory(isIncome ? 'salary' : 'food');
    }
  }, [isIncome, expense]);

  if (!isOpen) return null;

  const categories = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  function handleSubmit(e) {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (!category) {
      showToast('Please select a category', 'error');
      return;
    }

    const payload = createExpense({
      id: expense?.id,
      amount: parsedAmount,
      category,
      note,
      date: new Date(date),
      isIncome,
      bankName: bankName || null,
      fromSms: expense?.fromSms || false,
    });

    onSave(payload);
    showToast(expense ? 'Expense updated successfully' : 'Expense saved successfully', 'success');
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="form-page" style={{ padding: 0 }}>
        <h3 className="title-lg mb-16" style={{ textAlign: 'center' }}>
          {expense ? 'Edit Transaction' : 'Add Transaction'}
        </h3>

        <div className="type-toggle">
          <button
            type="button"
            className={`type-tab ${!isIncome ? 'active-expense' : ''}`}
            onClick={() => setIsIncome(false)}
          >
            💸 Expense
          </button>
          <button
            type="button"
            className={`type-tab ${isIncome ? 'active-income' : ''}`}
            onClick={() => setIsIncome(true)}
          >
            💰 Income
          </button>
        </div>

        <div className="form-group">
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <span style={{ fontSize: '24px', fontWeight: '700', marginRight: '8px', color: 'var(--primary)' }}>
              {currency}
            </span>
            <input
              type="number"
              step="any"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="form-input amount-big"
              required
              autoFocus
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Category</label>
          <div className="category-wrap">
            {categories.map(c => {
              const isSelected = category === c.key;
              return (
                <div
                  key={c.key}
                  className={`cat-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => setCategory(c.key)}
                  style={{
                    backgroundColor: isSelected ? c.color : '',
                    borderColor: isSelected ? c.color : 'transparent',
                    color: isSelected ? (['#FFD93D', '#4ECDC4'].includes(c.color) ? '#1A1A2E' : '#ffffff') : '',
                  }}
                >
                  <span>{c.emoji}</span>
                  <span>{c.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Date</label>
          <div className="date-picker-row" style={{ padding: 0, background: 'none' }}>
            <input
              type="date"
              className="form-input"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Note</label>
          <input
            type="text"
            className="form-input"
            placeholder="What was this for?"
            value={note}
            onChange={e => setNote(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Bank Name (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. HDFC Bank"
            value={bankName}
            onChange={e => setBankName(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
          <button type="submit" className="btn btn-primary btn-block">
            Save
          </button>
          
          {expense && onDelete && (
            <button
              type="button"
              className="btn btn-danger btn-block"
              onClick={() => {
                onDelete(expense.id);
                showToast('Transaction deleted successfully', 'success');
                onClose();
              }}
            >
              Delete
            </button>
          )}
          
          <button type="button" className="btn btn-outline btn-block" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
