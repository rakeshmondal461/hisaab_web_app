import React, { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import MonthSelector from "../components/MonthSelector.jsx";
import PieChart from "../components/PieChart.jsx";
import ExpenseCard from "../components/ExpenseCard.jsx";
import TransactionModal from "../components/TransactionModal.jsx";
import { getCategoryInfo } from "../models/expenseModel.js";

function formatSeparatorDate(dateStr) {
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmt(n) {
  return Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function ExpensesPage() {
  const {
    state,
    dispatch,
    expensesForMonth,
    totalSpentForMonth,
    totalIncomeForMonth,
    spendByCategory,
    dailyBudgetLimit,
    totalSpentForDay,
    budgetFor,
  } = useApp();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const monthExpenses = expensesForMonth(year, month);
  const spentThisMonth = totalSpentForMonth(year, month);
  const incomeThisMonth = totalIncomeForMonth(year, month);

  // Daily alert calculations
  const dailyLimit = dailyBudgetLimit(year, month);
  const budget = budgetFor(year, month);
  const hasBudget = budget.totalBudget > 0;
  const spentToday = totalSpentForDay(new Date());
  const spent = totalSpentForMonth(year, month);
  const remainingBudget = budget.totalBudget - spentThisMonth;

  const dailyAlertClass = () => {
    if (spentToday > dailyLimit) return "daily-alert over-limit";
    if (spentToday >= dailyLimit * 0.8) return "daily-alert near-limit";
    return "daily-alert on-track";
  };

  const dailyAlertContent = () => {
    if (spentToday > dailyLimit) {
      return (
        <>
          <span>⚠️</span>
          <div>
            <div className="title-md fw-700">Over Limit</div>
            <div className="body-sm text-error">
              Spent {state.currency}
              {fmt(spentToday)} of {state.currency}
              {fmt(dailyLimit)} daily budget.
            </div>
          </div>
        </>
      );
    }
    if (spentToday >= dailyLimit * 0.8) {
      return (
        <>
          <span>⚡</span>
          <div>
            <div className="title-md fw-700">Near Limit</div>
            <div className="body-sm text-warning">
              Spent {state.currency}
              {fmt(spentToday)} of {state.currency}
              {fmt(dailyLimit)} daily budget.
            </div>
          </div>
        </>
      );
    }
    return (
      <>
        <span>🌿</span>
        <div>
          <div className="title-md fw-700">On Track</div>
          <div className="body-sm text-success">
            Daily Budget: {state.currency}
            {fmt(dailyLimit)}. Spent today: {state.currency}
            {fmt(spentToday)}.
          </div>
        </div>
      </>
    );
  };

  // Pie chart calculation
  const categorySpent = spendByCategory(year, month);
  const chartData = Object.entries(categorySpent).map(([key, val]) => {
    const info = getCategoryInfo(key, false);
    return {
      key,
      label: info.label,
      value: val,
      color: info.color,
    };
  });

  // Grouping expenses by Date
  const groupedExpenses = {};
  monthExpenses.forEach((e) => {
    const key = new Date(e.date).toDateString();
    if (!groupedExpenses[key]) {
      groupedExpenses[key] = [];
    }
    groupedExpenses[key].push(e);
  });

  // Handle month change
  const handleMonthChange = (newYear, newMonth) => {
    setYear(newYear);
    setMonth(newMonth);
  };

  // Dispatch functions
  const handleSaveExpense = (expense) => {
    if (selectedExpense) {
      dispatch({ type: "UPDATE_EXPENSE", expense });
    } else {
      dispatch({ type: "ADD_EXPENSE", expense });
    }
  };

  const handleDeleteExpense = (id) => {
    dispatch({ type: "DELETE_EXPENSE", id });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 className="title-lg fw-700" style={{ margin: 0 }}>
          Expenses Dashboard
        </h2>
      </div>

      <MonthSelector year={year} month={month} onChange={handleMonthChange} />

      <div className="dashboard-grid two-col" style={{ marginTop: "20px" }}>
        {/* 1. Remaining Balance Card (Left Column) */}
        <div
          className="card-gradient summary-card col-left"
          style={{ margin: 0 }}
        >
          <span className="label">Total Spent</span>
          <div className="amount-sm" style={{ margin: "8px 0" }}>
            {state.currency}
            {fmt(spentThisMonth)}
          </div>

          <div className="stat-chips">
            <div className="stat-chip">
              <div className="chip-label">Total Income</div>
              <div className="chip-value text-success">
                +{state.currency}
                {fmt(incomeThisMonth)}
              </div>
            </div>
            <div className="stat-chip">
              <div className="chip-label">Budget</div>
              <div className="chip-value text-error">
                {state.currency}
                {fmt(budget.totalBudget)}
              </div>
            </div>
            <div className="stat-chip">
              <div className="chip-label">Remaining Balance</div>
              <div className="chip-value text-success">
                +{state.currency}
                {fmt(Math.abs(remainingBudget))}
              </div>
            </div>
          </div>
        </div>

        {/* 2. Daily Alert Card (Right Column) */}
        {hasBudget && dailyLimit > 0 && (
          <div
            className={`${dailyAlertClass()} col-right`}
            style={{ margin: 0 }}
          >
            {dailyAlertContent()}
          </div>
        )}

        {/* 3. Monthly Spending Card (Right Column) */}
        {chartData.length > 0 && (
          <div className="card col-right" style={{ marginTop: '60px' }}>
            <h3 className="title-md mb-12 fw-700">Monthly Spending Analysis</h3>
            <PieChart data={chartData} symbol={state.currency} />
          </div>
        )}

        {/* 4. Transactions List (Left Column) */}
        <div className="col-left">
          <div
            className="section-header"
            style={{ marginTop: 0, paddingLeft: 0 }}
          >
            Transactions
          </div>

          {monthExpenses.length === 0 ? (
            <div className="empty-state">
              <span className="empty-emoji">💸</span>
              <h3 className="empty-title">No transactions yet</h3>
              <p className="empty-sub">Add one using the + button below.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {Object.keys(groupedExpenses).map((dateStr) => (
                <div key={dateStr}>
                  <div className="date-separator">
                    {formatSeparatorDate(dateStr)}
                  </div>
                  {groupedExpenses[dateStr].map((e) => (
                    <ExpenseCard
                      key={e.id}
                      expense={e}
                      symbol={state.currency}
                      onClick={() => {
                        setSelectedExpense(e);
                        setIsModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        className="fab"
        onClick={() => {
          setSelectedExpense(null);
          setIsModalOpen(true);
        }}
      >
        <span>➕</span> Add Transaction
      </button>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        onDelete={handleDeleteExpense}
        expense={selectedExpense}
        currency={state.currency}
      />
    </div>
  );
}
