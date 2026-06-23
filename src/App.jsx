import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import TasksPage from './pages/TasksPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import { ToastContainer } from './components/Toast.jsx';

const NAV_ITEMS = [
  { key: 'expenses', label: 'Expenses', emoji: '💸' },
  { key: 'budget', label: 'Budget & Savings', emoji: '🎯' },
  { key: 'tasks', label: 'Tasks', emoji: '📋' },
  { key: 'settings', label: 'Settings', emoji: '⚙️' },
];

export default function App() {
  const { state } = useApp();
  const [activeTab, setActiveTab] = useState('expenses');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Apply dark theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme || 'light');
  }, [state.theme]);

  // Tab router
  const renderPage = () => {
    switch (activeTab) {
      case 'expenses':
        return <ExpensesPage />;
      case 'budget':
        return <BudgetPage />;
      case 'tasks':
        return <TasksPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <ExpensesPage />;
    }
  };

  return (
    <div className="app-shell">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)} style={{ background: 'none', border: 'none' }}>
          ☰
        </button>
        <span className="fw-800" style={{ fontSize: '18px', color: 'var(--primary)' }}>HiSaab</span>
        <div style={{ width: '24px' }} />
      </header>

      {/* Sidebar Drawer Overlay */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={() => setIsSidebarOpen(false)} 
      />

      {/* Left Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span>💸</span> HiSaab
        </div>
        <nav className="sidebar-menu">
          {NAV_ITEMS.map(item => (
            <div
              key={item.key}
              className={`sidebar-link ${activeTab === item.key ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(item.key);
                setIsSidebarOpen(false);
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.emoji}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text2)' }}>HiSaab Web v1.0</span>
          </div>
        </div>
      </aside>

      {/* Page Content */}
      <main className="page-content">
        <div className="container">
          {renderPage()}
        </div>
      </main>
      <ToastContainer />
    </div>
  );
}
