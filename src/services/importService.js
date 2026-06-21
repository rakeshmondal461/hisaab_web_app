import { createExpense } from '../models/expenseModel.js';
import { createTask } from '../models/taskModel.js';

function pickFile(accept) {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = accept;
    input.onchange = (e) => resolve(e.target.files[0] || null);
    input.click();
  });
}

function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res(e.target.result);
    r.onerror = rej;
    r.readAsText(file);
  });
}

function parseCsvRows(text) {
  const lines = text.split('\n').filter(l => l.trim());
  return lines.map(line => {
    const cols = []; let cur = ''; let inQ = false;
    for (const ch of line) {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
      else { cur += ch; }
    }
    cols.push(cur.trim());
    return cols;
  });
}

// ── JSON import ──────────────────────────────────────────────────────────────
export async function importExpensesFromJson() {
  const file = await pickFile('.json');
  if (!file) return null;
  const data = JSON.parse(await readFile(file));
  const list = Array.isArray(data) ? data : (data.expenses || []);
  return list.map(e => createExpense(e));
}

export async function importTasksFromJson() {
  const file = await pickFile('.json');
  if (!file) return null;
  const data = JSON.parse(await readFile(file));
  const list = Array.isArray(data) ? data : (data.tasks || []);
  return list.map(t => createTask(t));
}

export async function importAllFromJson() {
  const file = await pickFile('.json');
  if (!file) return null;
  const data = JSON.parse(await readFile(file));
  return {
    expenses: (data.expenses || []).map(e => createExpense(e)),
    tasks: (data.tasks || []).map(t => createTask(t)),
    budgets: data.budgets || {},
  };
}

// ── CSV import ───────────────────────────────────────────────────────────────
export async function importExpensesFromCsv() {
  const file = await pickFile('.csv');
  if (!file) return null;
  const rows = parseCsvRows(await readFile(file));
  if (rows.length < 2) return [];
  const hdr = rows[0].map(h => h.toLowerCase());
  const ci = k => hdr.indexOf(k);
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    try {
      const isIncome = (r[ci('type')] || '').toLowerCase() === 'income';
      results.push(createExpense({
        amount: parseFloat(r[ci('amount')]) || 0,
        category: r[ci('category')] || 'other',
        note: r[ci('note')] || '',
        date: r[ci('date')] || new Date().toISOString(),
        isIncome,
        bankName: r[ci('bank')] || null,
      }));
    } catch {}
  }
  return results;
}

export async function importTasksFromCsv() {
  const file = await pickFile('.csv');
  if (!file) return null;
  const rows = parseCsvRows(await readFile(file));
  if (rows.length < 2) return [];
  const hdr = rows[0].map(h => h.toLowerCase());
  const ci = k => hdr.indexOf(k);
  const results = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    try {
      const tagsStr = r[ci('tags')] || '';
      results.push(createTask({
        title: r[ci('title')] || '',
        status: r[ci('status')] || 'todo',
        priority: r[ci('priority')] || 'medium',
        deadline: r[ci('deadline')] || null,
        tags: tagsStr ? tagsStr.split(';').map(t => t.trim()).filter(Boolean) : [],
      }));
    } catch {}
  }
  return results;
}
