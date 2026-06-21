import React from 'react';
import { TASK_PRIORITIES, isOverdue } from '../models/taskModel.js';

export default function TaskCard({ task, onClick, onDragStart }) {
  const priority = TASK_PRIORITIES.find(p => p.key === task.priority) || TASK_PRIORITIES[1];
  const overdue = isOverdue(task);
  const deadline = task.deadline ? new Date(task.deadline) : null;

  return (
    <div
      className="task-card"
      style={{ borderLeftColor: priority.color }}
      onClick={onClick}
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task.id)}
    >
      <div className="task-header">
        <div className={`task-title ${task.status === 'done' ? 'done' : ''}`}>{task.title}</div>
        <span
          className="priority-badge"
          style={{ background: priority.color + '22', color: priority.color }}
        >
          {priority.label}
        </span>
      </div>
      {task.description ? <div className="task-desc">{task.description}</div> : null}
      <div className="task-footer">
        {overdue && (
          <span className="deadline-chip text-error">⚠️ Overdue</span>
        )}
        {deadline && !overdue && (
          <span className="deadline-chip text-muted">
            📅 {deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        )}
        {(task.tags || []).slice(0, 3).map(tag => (
          <span key={tag} className="tag-chip">{tag}</span>
        ))}
      </div>
    </div>
  );
}
