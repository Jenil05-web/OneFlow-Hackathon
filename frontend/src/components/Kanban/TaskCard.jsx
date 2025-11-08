import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import './TaskCard.css';

const TaskCard = ({ task, index, columnId, onClick }) => {
  const taskId = task.id || task._id;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: taskId,
    data: {
      task,
      columnId,
      type: 'task',
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'priority-high';
      case 'medium':
        return 'priority-medium';
      case 'low':
        return 'priority-low';
      default:
        return 'priority-medium';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
  };

  // Get assignee count
  const getAssigneeCount = () => {
    if (Array.isArray(task.assignedTo)) {
      return task.assignedTo.length;
    }
    if (Array.isArray(task.assignee)) {
      return task.assignee.length;
    }
    return (task.assignedTo || task.assignee) ? 1 : 0;
  };

  // Get comments count
  const commentsCount = task.comments?.length || 0;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`task-card ${getPriorityColor(task.priority)} ${onClick ? 'clickable' : ''} ${isDragging ? 'dragging' : ''}`}
      onClick={onClick}
    >
      {/* Title */}
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
      </div>

      {/* Status and Tags */}
      <div className="task-status-tags">
        <span className={`task-status-badge status-${task.status?.toLowerCase().replace(' ', '-') || 'new'}`}>
          {task.status === 'To Do' || !task.status ? 'New' : 
           task.status === 'In Progress' || task.status === 'Review' || task.status === 'Blocked' ? 'In Progress' :
           task.status === 'Completed' ? 'Done' : task.status}
        </span>
        {task.tags && task.tags.length > 0 && (
          <span className="task-tag-badge">{task.tags[0]}</span>
        )}
      </div>

      {/* Task Images */}
      {task.image && (
        <div className="task-images">
          <img src={task.image} alt={task.title} onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}

      {/* Metadata Footer */}
      <div className="task-footer-metadata">
        <div className="task-meta-item">
          <span className="meta-icon">👤</span>
          <span className="meta-value">{getAssigneeCount()}</span>
        </div>
        {task.dueDate && (
          <div className="task-meta-item">
            <span className="meta-icon">🕐</span>
            <span className="meta-value">{formatDate(task.dueDate)}</span>
          </div>
        )}
        <div className="task-meta-item">
          <span className="meta-icon">💬</span>
          <span className="meta-value">{commentsCount}</span>
        </div>
        <div className="task-meta-icons">
          <span className="meta-icon-small">🚩</span>
          <span className="meta-icon-small">📅</span>
          <span className="meta-icon-small">🕐</span>
          <span className="meta-icon-small">❤️</span>
          <span className="meta-icon-small">🔗</span>
          <span className="meta-icon-small">⋯</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
