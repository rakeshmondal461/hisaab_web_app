import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { useToast } from '../components/Toast.jsx';
import Modal from '../components/Modal.jsx';
import { db } from '../services/db.js';
import {
  exportAllToJson,
  exportExpensesToCsv,
  exportTasksToCsv
} from '../services/exportService.js';
import {
  importAllFromJson,
  importExpensesFromCsv,
  importTasksFromCsv
} from '../services/importService.js';

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const showToast = useToast();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isDark = state.theme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    dispatch({ type: 'SET_THEME', theme: nextTheme });
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  const handleCurrencyChange = (e) => {
    dispatch({ type: 'SET_CURRENCY', currency: e.target.value });
    showToast(`Currency changed to ${e.target.value}`, 'success');
  };

  const handleExportAll = () => {
    try {
      exportAllToJson({
        expenses: state.expenses,
        tasks: state.tasks,
        budgets: state.budgets
      });
      showToast('Full backup generated successfully', 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const handleExportExpensesCsv = () => {
    try {
      exportExpensesToCsv(state.expenses);
      showToast('Expenses CSV exported successfully', 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const handleExportTasksCsv = () => {
    try {
      exportTasksToCsv(state.tasks);
      showToast('Tasks CSV exported successfully', 'success');
    } catch {
      showToast('Export failed', 'error');
    }
  };

  const handleImportAll = async () => {
    try {
      const data = await importAllFromJson();
      if (data) {
        dispatch({ type: 'IMPORT_EXPENSES', expenses: data.expenses });
        dispatch({ type: 'IMPORT_BUDGETS', budgets: data.budgets });
        dispatch({ type: 'IMPORT_TASKS', tasks: data.tasks });
        showToast('Full backup imported successfully!', 'success');
      }
    } catch {
      showToast('Import failed. Invalid JSON structure.', 'error');
    }
  };

  const handleImportExpensesCsv = async () => {
    try {
      const list = await importExpensesFromCsv();
      if (list) {
        dispatch({ type: 'IMPORT_EXPENSES', expenses: list });
        showToast(`${list.length} expenses imported successfully!`, 'success');
      }
    } catch {
      showToast('CSV parsing failed. Ensure header format.', 'error');
    }
  };

  const handleImportTasksCsv = async () => {
    try {
      const list = await importTasksFromCsv();
      if (list) {
        dispatch({ type: 'IMPORT_TASKS', tasks: list });
        showToast(`${list.length} tasks imported successfully!`, 'success');
      }
    } catch {
      showToast('CSV parsing failed. Ensure header format.', 'error');
    }
  };

  const handleClearAllData = async () => {
    await db.clear();
    dispatch({ type: 'CLEAR_ALL_DATA' });
    showToast('All local data cleared successfully', 'success');
    setShowClearConfirm(false);
  };

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="title-lg fw-700" style={{ margin: 0 }}>Settings & Preferences</h2>
      </div>

      <div className="section-header">Preferences</div>

      <div className="settings-tile" onClick={toggleTheme}>
        <div className="settings-icon" style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--primary)' }}>
          🌙
        </div>
        <div className="settings-info">
          <div className="settings-title">Dark Mode</div>
          <div className="settings-sub">Toggle application theme</div>
        </div>
        <div className="settings-trailing">
          <div className={`switch ${isDark ? 'on' : ''}`}>
            <div className="switch-thumb" />
          </div>
        </div>
      </div>

      <div className="settings-tile" style={{ cursor: 'default' }}>
        <div className="settings-icon" style={{ background: 'rgba(255,159,67,0.1)', color: 'var(--warning)' }}>
          🪙
        </div>
        <div className="settings-info">
          <div className="settings-title">Currency Symbol</div>
          <div className="settings-sub">Display currency prefix</div>
        </div>
        <div className="settings-trailing" onClick={e => e.stopPropagation()}>
          <select
            className="form-input"
            style={{ width: 'auto', padding: '6px 12px', borderRadius: '8px' }}
            value={state.currency}
            onChange={handleCurrencyChange}
          >
            <option value="₹">₹ INR</option>
            <option value="$">$ USD</option>
            <option value="€">€ EUR</option>
            <option value="£">£ GBP</option>
            <option value="¥">¥ JPY</option>
          </select>
        </div>
      </div>

      <div className="section-header">Backup & Export</div>

      <div className="settings-tile" onClick={handleExportAll}>
        <div className="settings-icon" style={{ background: 'rgba(76,175,130,0.1)', color: 'var(--success)' }}>
          📥
        </div>
        <div className="settings-info">
          <div className="settings-title">Backup All (JSON)</div>
          <div className="settings-sub">Export tasks, budgets, and expenses</div>
        </div>
        <div className="settings-trailing">❯</div>
      </div>

      <div className="settings-tile" onClick={handleExportExpensesCsv}>
        <div className="settings-icon" style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--primary)' }}>
          📊
        </div>
        <div className="settings-info">
          <div className="settings-title">Export Expenses (CSV)</div>
          <div className="settings-sub">Save transaction log to spreadsheet</div>
        </div>
        <div className="settings-trailing">❯</div>
      </div>

      <div className="settings-tile" onClick={handleExportTasksCsv}>
        <div className="settings-icon" style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--primary)' }}>
          📋
        </div>
        <div className="settings-info">
          <div className="settings-title">Export Tasks (CSV)</div>
          <div className="settings-sub">Save list of tasks to spreadsheet</div>
        </div>
        <div className="settings-trailing">❯</div>
      </div>

      <div className="section-header">Restore & Import</div>

      <div className="settings-tile" onClick={handleImportAll}>
        <div className="settings-icon" style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--error)' }}>
          📤
        </div>
        <div className="settings-info">
          <div className="settings-title">Import JSON Backup</div>
          <div className="settings-sub">Restore all data from backup file</div>
        </div>
        <div className="settings-trailing">❯</div>
      </div>

      <div className="settings-tile" onClick={handleImportExpensesCsv}>
        <div className="settings-icon" style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--primary)' }}>
          📥
        </div>
        <div className="settings-info">
          <div className="settings-title">Import Expenses (CSV)</div>
          <div className="settings-sub">Upload CSV transaction records</div>
        </div>
        <div className="settings-trailing">❯</div>
      </div>

      <div className="settings-tile" onClick={handleImportTasksCsv}>
        <div className="settings-icon" style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--primary)' }}>
          📥
        </div>
        <div className="settings-info">
          <div className="settings-title">Import Tasks (CSV)</div>
          <div className="settings-sub">Upload CSV task list records</div>
        </div>
        <div className="settings-trailing">❯</div>
      </div>

      <div className="section-header text-error">Danger Zone</div>

      <div className="settings-tile" onClick={() => setShowClearConfirm(true)}>
        <div className="settings-icon" style={{ background: 'rgba(255,107,107,0.12)', color: 'var(--error)' }}>
          🗑️
        </div>
        <div className="settings-info">
          <div className="settings-title text-error fw-700">Clear All Data</div>
          <div className="settings-sub text-error">Delete all local tasks and data permanently</div>
        </div>
        <div className="settings-trailing">❯</div>
      </div>

      {showClearConfirm && (
        <Modal onClose={() => setShowClearConfirm(false)} center={true}>
          <div className="dialog-content" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '48px' }}>⚠️</span>
            <h3 className="title-lg mt-8 mb-8 text-error">Are you sure?</h3>
            <p className="body-md text-muted mb-16">
              This action will permanently delete all your expenses, budgets, and tasks from this device. This cannot be undone.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button className="btn btn-danger btn-block fw-700" onClick={handleClearAllData}>
                Yes, Delete Everything
              </button>
              <button className="btn btn-outline btn-block" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
