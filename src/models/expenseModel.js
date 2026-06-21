export const EXPENSE_CATEGORIES = [
  { key: 'food', label: 'Food & Dining', emoji: '🍔', color: '#6C63FF' },
  { key: 'transport', label: 'Transport', emoji: '🚗', color: '#FF6B6B' },
  { key: 'shopping', label: 'Shopping', emoji: '🛍️', color: '#4ECDC4' },
  { key: 'bills', label: 'Bills & Utilities', emoji: '📄', color: '#FFD93D' },
  { key: 'health', label: 'Health', emoji: '💊', color: '#4CAF82' },
  { key: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#FF9F43' },
  { key: 'other', label: 'Other', emoji: '📦', color: '#A29BFE' },
];

export const INCOME_CATEGORIES = [
  { key: 'salary', label: 'Salary', emoji: '💰', color: '#4CAF82' },
  { key: 'business', label: 'Business', emoji: '💼', color: '#6C63FF' },
  { key: 'freelance', label: 'Freelance', emoji: '💻', color: '#4ECDC4' },
  { key: 'investment', label: 'Investment', emoji: '📈', color: '#FFD93D' },
  { key: 'other', label: 'Other', emoji: '📦', color: '#A29BFE' },
];

export function getCategoryInfo(key, isIncome) {
  const list = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  return list.find(c => c.key === key) || list[list.length - 1];
}

export function createExpense({ id, amount, category, note = '', date, isIncome = false, fromSms = false, bankName = null }) {
  return {
    id: id || crypto.randomUUID(),
    amount: Number(amount),
    category,
    note,
    date: date instanceof Date ? date.toISOString() : date,
    isIncome,
    fromSms,
    bankName,
  };
}
