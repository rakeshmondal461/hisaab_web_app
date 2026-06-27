import React, { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { TASK_STATUSES, TASK_PRIORITIES, createTask } from '../models/taskModel.js';
import { useToast } from './Toast.jsx';

export default function GoalModal({ isOpen, onClose, onSave, onDelete, goal }) {
  const showToast = useToast();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagsText, setTagsText] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description || '');
      setTagsText((goal.tags || []).join(', '));
    } else {
      setTitle('');
      setDescription('');
      setTagsText('');
    }
  }, [goal, isOpen]);

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a goal title', 'error');
      return;
    }

    const tags = tagsText
      ? tagsText
          .split(',')
          .map(t => t.trim())
          .filter(Boolean)
      : [];

    const payload = createTask({
      id: goal?.id,
      title: title.trim(),
      description: description.trim(),
      tags,
      createdAt: goal?.createdAt,
      completedAt: status === 'done' ? (goal?.completedAt || new Date().toISOString()) : null,
    });

    onSave(payload);
    showToast(goal ? 'Goal updated successfully' : 'Goal created successfully', 'success');
    onClose();
  }

  return (
    <Modal onClose={onClose} center>
      <form onSubmit={handleSubmit} className="form-page" style={{ padding: 0 }}>
        <h3 className="title-lg mb-16 text-center" style={{ textAlign: 'center' }}>
          {goal ? 'Edit Goal' : 'Add Goal'}
        </h3>

        <div className="form-group">
          <label className="form-label">Goal Title</label>
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
            Save Goal
          </button>
          
          {goal && onDelete && (
            <button
              type="button"
              className="btn btn-danger btn-block"
              onClick={() => {
                onDelete(goal.id);
                showToast('Goal deleted successfully', 'success');
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
