import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import { TASK_STATUSES, isOverdue } from '../models/taskModel.js';

export default function TasksPage() {
  const { state, dispatch } = useApp();
  const [activeStatus, setActiveStatus] = useState('todo');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  const filteredTasks = state.tasks.filter(t => t.status === activeStatus);
  const hasOverdue = state.tasks.some(isOverdue);

  const handleSaveTask = (task) => {
    if (selectedTask) {
      dispatch({ type: 'UPDATE_TASK', task });
    } else {
      dispatch({ type: 'ADD_TASK', task });
    }
  };

  const handleDeleteTask = (id) => {
    dispatch({ type: 'DELETE_TASK', id });
  };

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    const task = state.tasks.find(t => t.id === taskId);
    if (task && task.status !== targetStatus) {
      dispatch({ type: 'UPDATE_TASK', task: { ...task, status: targetStatus } });
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 className="title-lg fw-700" style={{ margin: 0 }}>Tasks Planner</h2>
      </div>

      {hasOverdue && (
        <div className="overdue-banner" style={{ margin: '0 0 16px 0' }}>
          <span>⚠️</span>
          <span className="body-sm text-error fw-600">You have overdue tasks! Please check them.</span>
        </div>
      )}

      {/* MOBILE ONLY VIEW */}
      <div className="mobile-only">
        <div className="tab-bar" style={{ margin: '0 0 16px 0' }}>
          {TASK_STATUSES.map(s => {
            const count = state.tasks.filter(t => t.status === s.key).length;
            const isActive = activeStatus === s.key;
            return (
              <button
                key={s.key}
                className={`tab-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveStatus(s.key)}
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
                {count > 0 && <span className="tab-badge">{count}</span>}
              </button>
            );
          })}
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <span className="empty-emoji">🎯</span>
            <h3 className="empty-title">All caught up!</h3>
            <p className="empty-sub">
              {activeStatus === 'done' 
                ? 'No tasks completed yet.' 
                : 'No pending tasks here.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTasks.map(t => (
              <TaskCard
                key={t.id}
                task={t}
                onClick={() => {
                  setSelectedTask(t);
                  setIsModalOpen(true);
                }}
                onDragStart={handleDragStart}
              />
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP KANBAN BOARD */}
      <div className="desktop-only">
        <div className="kanban-board">
          {TASK_STATUSES.map(s => {
            const colTasks = state.tasks.filter(t => t.status === s.key);
            const isDraggedOver = draggedOverCol === s.key;
            return (
              <div 
                key={s.key} 
                className={`kanban-column ${isDraggedOver ? 'drag-over' : ''}`}
                onDragOver={(e) => e.preventDefault()}
                onDragEnter={(e) => { e.preventDefault(); setDraggedOverCol(s.key); }}
                onDragLeave={() => setDraggedOverCol(null)}
                onDrop={(e) => { handleDrop(e, s.key); setDraggedOverCol(null); }}
              >
                <div className="kanban-column-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>{s.emoji}</span>
                    <span className="title-md fw-700">{s.label}</span>
                  </div>
                  <span className="tab-badge" style={{ padding: '2px 8px' }}>{colTasks.length}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {colTasks.length === 0 ? (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100px',
                      border: '1.5px dashed var(--divider)',
                      borderRadius: '8px',
                      color: 'var(--text2)',
                      fontSize: '13px'
                    }}>
                      No tasks
                    </div>
                  ) : (
                    colTasks.map(t => (
                      <TaskCard
                        key={t.id}
                        task={t}
                        onClick={() => {
                          setSelectedTask(t);
                          setIsModalOpen(true);
                        }}
                        onDragStart={handleDragStart}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="fab"
        onClick={() => {
          setSelectedTask(null);
          setIsModalOpen(true);
        }}
      >
        <span>➕</span> Add Task
      </button>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        task={selectedTask}
      />
    </div>
  );
}
