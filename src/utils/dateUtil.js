const now = new Date();

const year = now.getFullYear();
const month = now.getMonth() + 1;

const currentDate = `${year}-${String(month).padStart(2, "0")}-${String(
  now.getDate()
).padStart(2, "0")}`;

const currentDateDay = now.getDate(); // Current day of the month (1-31)

const firstDay = new Date(year, now.getMonth(), 1).getDate();
const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

console.log({
  year,
  month,
  currentDateDay,
  currentDate, // "2026-06-26"
  firstDay,
  lastDay,
});

export {year, month, currentDate, currentDateDay, firstDay, lastDay };