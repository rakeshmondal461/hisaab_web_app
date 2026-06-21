export const TASK_STATUSES = [
  { key: 'todo', label: 'To Do', emoji: '📋' },
  { key: 'inProgress', label: 'In Progress', emoji: '⚡' },
  { key: 'done', label: 'Done', emoji: '✅' },
];

export const TASK_PRIORITIES = [
  { key: 'low', label: 'Low', color: '#4CAF82' },
  { key: 'medium', label: 'Medium', color: '#FFD93D' },
  { key: 'high', label: 'High', color: '#FF9F43' },
  { key: 'critical', label: 'Critical', color: '#FF6B6B' },
];

export function createTask({ id, title, description = '', status = 'todo', priority = 'medium', deadline = null, tags = [], createdAt, completedAt = null }) {
  return {
    id: id || crypto.randomUUID(),
    title, description, status, priority,
    deadline: deadline instanceof Date ? deadline.toISOString() : deadline,
    tags,
    createdAt: createdAt || new Date().toISOString(),
    completedAt,
  };
}

export function isOverdue(task) {
  return task.deadline && new Date() > new Date(task.deadline) && task.status !== 'done';
}
