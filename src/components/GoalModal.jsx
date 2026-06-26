import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { TASK_STATUSES, TASK_PRIORITIES, createTask } from '../models/taskModel.js';
import { useToast } from './Toast.jsx';

export default function TaskModal({ isOpen, onClose, onSave, onDelete, task }) {
  const showToast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [tagsText, setTagsText] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
      setTagsText((task.tags || []).join(', '));
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setDeadline('');
      setTagsText('');
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a task title', 'error');
      return;
    }

    const tags = tagsText
      ? tagsText
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      : [];

    const payload = createTask({
      id: task?.id,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      deadline: deadline ? new Date(deadline) : null,
      tags,
      createdAt: task?.createdAt,
      completedAt: status === 'done' ? (task?.completedAt || new Date().toISOString()) : null,
    });

    onSave(payload);
    showToast(task ? 'Task updated successfully' : 'Task created successfully', 'success');
    onClose();
  }

  return (
    <Modal onClose={onClose}>
      <form onSubmit={handleSubmit} className="form-page" style={{ padding: 0 }}>
        <h3 className="title-lg mb-16 text-center" style={{ textAlign: 'center' }}>
          {task ? 'Edit Task' : 'Add Task'}
        </h3>

        <div className="form-group">
          <label className="form-label">Task Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="What needs to be done?"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            className="form-input"
            rows="3"
            placeholder="Add some details..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Status</label>
          <select
            className="form-input"
            value={status}
            onChange={e => setStatus(e.target.value)}
          >
            {TASK_STATUSES.map(s => (
              <option key={s.key} value={s.key}>
                {s.emoji} {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Priority</label>
          <div className="priority-row">
            {TASK_PRIORITIES.map(p => {
              const isSelected = priority === p.key;
              return (
                <div
                  key={p.key}
                  className="prio-chip"
                  onClick={() => setPriority(p.key)}
                  style={{
                    borderColor: isSelected ? p.color : 'transparent',
                    backgroundColor: isSelected ? `${p.color}18` : 'var(--card)',
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                  }}
                >
                  <div className="prio-dot" style={{ backgroundColor: p.color }} />
                  <span className="prio-label" style={{ color: isSelected ? p.color : 'var(--text)' }}>
                    {p.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Deadline</label>
          <div className="date-picker-row" style={{ padding: 0, background: 'none' }}>
            <input
              type="date"
              className="form-input"
              value={deadline}
              onChange={e => setDeadline(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Tags (separated by commas)</label>
          <input
            type="text"
            className="form-input"
            placeholder="work, personal, urgent"
            value={tagsText}
            onChange={e => setTagsText(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '24px' }}>
          <button type="submit" className="btn btn-primary btn-block">
            Save Task
          </button>
          
          {task && onDelete && (
            <button
              type="button"
              className="btn btn-danger btn-block"
              onClick={() => {
                onDelete(task.id);
                showToast('Task deleted successfully', 'success');
                onClose();
              }}
            >
              Delete
            </button>
          )}
          
          <button type="button" className="btn btn-outline btn-block" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
}
