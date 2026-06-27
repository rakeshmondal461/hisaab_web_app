import React, { useState, useCallback } from "react";
import { useApp } from "../context/AppContext.jsx";
import GoalModal from "../components/GoalModal.jsx";

// ── Date helpers ──────────────────────────────────────────────────────────────
const now = new Date();
const YEAR = now.getFullYear();
const MONTH = now.getMonth() + 1; // 1-based
const TODAY = now.getDate();
const LAST_DAY = new Date(YEAR, MONTH, 0).getDate();
const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function toDateStr(day) {
  return `${YEAR}-${String(MONTH).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

// ── Storage key for progress ──────────────────────────────────────────────────
// progress shape: { "2026-06-01": { goalId: true|false }, … }
// We store it in a top-level key in the app's dispatch so it is persisted
// alongside everything else. If you prefer a separate localStorage fallback,
// swap the two helpers below.

export default function GoalsPage() {
  const { state, dispatch } = useApp();

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // progress lives in state.goalProgress (add it to your reducer + initialState)
  const progress = state.goalProgress ?? {};

  // ── Checkbox toggle ───────────────────────────────────────────────────────
  const handleToggle = useCallback(
    (dateStr, goalId, checked) => {
      dispatch({
        type: "SET_GOAL_PROGRESS",
        dateStr,
        goalId,
        value: checked,
      });
    },
    [dispatch],
  );

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const handleSaveGoal = (goal) => {
    dispatch({ type: selectedGoal ? "UPDATE_GOAL" : "ADD_GOAL", goal });
  };

  const handleDeleteGoal = (id) => {
    dispatch({ type: "DELETE_GOAL", id });
  };

  const openAdd = () => {
    setSelectedGoal(null);
    setIsModalOpen(true);
  };
  const openEdit = (goal) => {
    setSelectedGoal(goal);
    setIsModalOpen(true);
  };

  const goals = state.goals;

  // ── Per-goal completion % (past + today only) ─────────────────────────────
  function completionPct(goalId) {
    const tracked = Math.min(TODAY, LAST_DAY);
    if (tracked === 0) return 0;
    let done = 0;
    for (let d = 1; d <= tracked; d++) {
      const ds = toDateStr(d);
      if (progress[ds]?.[goalId]) done++;
    }
    return Math.round((done / tracked) * 100);
  }

  return (
    <div style={{ paddingBottom: "80px" }}>
      {/* ── Page header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <h2 className="title-lg fw-700" style={{ margin: 0 }}>
          Goals
        </h2>
        <span style={{ fontSize: "13px", color: "var(--text2)" }}>
          {MONTHS_SHORT[MONTH - 1]} {YEAR}
        </span>
      </div>

      {goals.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "48px 0",
            color: "var(--text2)",
          }}
        >
          <p style={{ margin: 0 }}>No goals yet. Add one below!</p>
        </div>
      ) : (
        <>
          {/* ── Summary pills ── */}
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            {goals.map((g) => {
              const pct = completionPct(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => openEdit(g)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    cursor: "pointer",
                    fontSize: "13px",
                    color: "var(--text1)",
                  }}
                >
                  <span>{g.title ?? g.name}</span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color:
                        pct >= 80
                          ? "var(--green)"
                          : pct >= 50
                            ? "var(--yellow)"
                            : "var(--text2)",
                    }}
                  >
                    {pct}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── Tracker grid ── */}
          <div
            style={{
              overflowX: "auto",
              borderRadius: "10px",
              border: "1px solid var(--border)",
            }}
          >
            <table
              style={{
                borderCollapse: "collapse",
                width: "max-content",
                minWidth: "100%",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  {/* Date column header */}
                  <th style={thStyle({ sticky: true, minW: "90px" })}>Date</th>

                  {/* One column per goal */}
                  {goals.map((g) => (
                    <th
                      key={g.id}
                      style={thStyle({ center: true })}
                      title={g.title ?? g.name}
                    >
                      {truncate(g.title ?? g.name, 14)}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {Array.from({ length: LAST_DAY }, (_, i) => i + 1).map(
                  (day) => {
                    const dateStr = toDateStr(day);
                    const isToday = day === TODAY;
                    const isFuture = day > TODAY;
                    const rowBg = isToday
                      ? "var(--primary-alpha, rgba(99,102,241,.08))"
                      : "transparent";

                    return (
                      <tr key={day}>
                        {/* Date cell */}
                        <td
                          style={{
                            ...tdStyle(),
                            fontVariantNumeric: "tabular-nums",
                            color: isToday ? "var(--primary)" : "var(--text2)",
                            fontWeight: isToday ? 600 : 400,
                            background: rowBg,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {String(day).padStart(2, "0")}{" "}
                          {MONTHS_SHORT[MONTH - 1]}
                          {isToday && (
                            <span
                              style={{
                                marginLeft: "6px",
                                fontSize: "10px",
                                opacity: 0.7,
                              }}
                            >
                              today
                            </span>
                          )}
                        </td>

                        {/* One checkbox cell per goal */}
                        {goals.map((g) => {
                          const checked = !!progress[dateStr]?.[g.id];
                          return (
                            <td
                              key={g.id}
                              style={{
                                ...tdStyle({ center: true }),
                                background: rowBg,
                              }}
                            >
                              <input
                                type="checkbox"
                                disabled={isFuture}
                                checked={checked}
                                onChange={(e) =>
                                  handleToggle(dateStr, g.id, e.target.checked)
                                }
                                style={{
                                  width: "17px",
                                  height: "17px",
                                  cursor: isFuture ? "default" : "pointer",
                                  accentColor: "var(--primary)",
                                  opacity: isFuture ? 0.3 : 1,
                                }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── FAB ── */}
      <button className="fab" onClick={openAdd}>
        <span>➕</span> Add Goal
      </button>

      {/* ── Modal ── */}
      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        goal={selectedGoal}
      />
    </div>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────
function thStyle({ sticky = false, center = false, minW } = {}) {
  return {
    padding: "8px 12px",
    textAlign: center ? "center" : "left",
    fontWeight: 500,
    color: "var(--text2)",
    background: "var(--card)",
    borderBottom: "1px solid var(--border)",
    borderRight: "1px solid var(--border)",
    position: sticky ? "sticky" : undefined,
    left: sticky ? 0 : undefined,
    zIndex: sticky ? 2 : 1,
    whiteSpace: "nowrap",
    minWidth: minW,
  };
}

function tdStyle({ center = false } = {}) {
  return {
    padding: "6px 12px",
    textAlign: center ? "center" : "left",
    borderBottom: "1px solid var(--border)",
    borderRight: "1px solid var(--border)",
    color: "var(--text1)",
  };
}

function truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + "…" : str;
}
