export const PRIORITY_WEIGHTS = {
  food: 0.25, transport: 0.15, health: 0.10,
  bills: 0.15, shopping: 0.15, entertainment: 0.10, other: 0.10,
};

export function createBudget({ categoryBudgets = {}, totalBudget = 0, savingsTarget = 0, monthlyIncome = 0, isAutoMode = false, month, year }) {
  return { categoryBudgets, totalBudget, savingsTarget, monthlyIncome, isAutoMode, month, year };
}

export function createBudgetFromSavingsPlan({ income, savingsTarget, month, year }) {
  const spendable = Math.max(0, income - savingsTarget);
  const cats = {};
  Object.entries(PRIORITY_WEIGHTS).forEach(([k, w]) => { cats[k] = spendable * w; });
  return createBudget({ categoryBudgets: cats, totalBudget: spendable, savingsTarget, monthlyIncome: income, isAutoMode: true, month, year });
}

export function budgetKey(year, month) { return `${year}-${month}`; }
