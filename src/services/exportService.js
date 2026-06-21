// ── Export helpers ────────────────────────────────────────────────────────────
function downloadFile(filename, content, mime = 'text/plain') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function ts() { return new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19); }
function tsShort() { return new Date().toISOString().slice(0, 10); }

function escapeCsv(v) {
  const s = String(v ?? '');
  return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
}

// ── JSON exports ──────────────────────────────────────────────────────────────
export function exportAllToJson({ expenses, tasks, budgets }) {
  const data = { exportedAt: ts(), expenses, budgets, tasks };
  downloadFile(`all_data_${ts()}.json`, JSON.stringify(data, null, 2), 'application/json');
}

export function exportExpensesToJson(expenses) {
  downloadFile(`expenses_${tsShort()}.json`, JSON.stringify(expenses, null, 2), 'application/json');
}

export function exportTasksToJson(tasks) {
  downloadFile(`tasks_${tsShort()}.json`, JSON.stringify(tasks, null, 2), 'application/json');
}

// ── CSV exports ───────────────────────────────────────────────────────────────
export function exportExpensesToCsv(expenses) {
  const rows = ['Date,Amount,Category,Note,Type,Bank'];
  expenses.forEach(e => rows.push([
    escapeCsv(e.date), e.amount, escapeCsv(e.category),
    escapeCsv(e.note), e.isIncome ? 'Income' : 'Expense', escapeCsv(e.bankName),
  ].join(',')));
  downloadFile(`expenses_${tsShort()}.csv`, rows.join('\n'), 'text/csv');
}

export function exportTasksToCsv(tasks) {
  const rows = ['Title,Status,Priority,Deadline,Tags'];
  tasks.forEach(t => rows.push([
    escapeCsv(t.title), escapeCsv(t.status), escapeCsv(t.priority),
    escapeCsv(t.deadline), escapeCsv((t.tags || []).join('; ')),
  ].join(',')));
  downloadFile(`tasks_${tsShort()}.csv`, rows.join('\n'), 'text/csv');
}

export function exportAllToCsv({ expenses, tasks }) {
  let out = '=== EXPENSES ===\nDate,Amount,Category,Note,Type\n';
  expenses.forEach(e => out += [escapeCsv(e.date), e.amount, escapeCsv(e.category), escapeCsv(e.note), e.isIncome ? 'Income' : 'Expense'].join(',') + '\n');
  out += '\n=== TASKS ===\nTitle,Status,Priority,Deadline,Tags\n';
  tasks.forEach(t => out += [escapeCsv(t.title), escapeCsv(t.status), escapeCsv(t.priority), escapeCsv(t.deadline), escapeCsv((t.tags || []).join('; '))].join(',') + '\n');
  downloadFile(`all_data_${ts()}.csv`, out, 'text/csv');
}
