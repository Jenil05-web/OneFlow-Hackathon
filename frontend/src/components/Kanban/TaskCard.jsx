import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, index, columnId }) => {
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className={`task-card ${getPriorityColor(task.priority)}`}>
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        {task.priority && (
          <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        )}
      </div>
      
      {task.description && (
        <p className="task-description">{task.description}</p>
      )}
      
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map((tag, idx) => (
            <span key={idx} className="task-tag">{tag}</span>
          ))}
        </div>
      )}
      
      <div className="task-footer">
        {(task.assignedTo || task.assignee) && (
          <div className="task-assignee">
            <div className="assignee-avatar">
              {(() => {
                const assignee = task.assignedTo || task.assignee;
                if (typeof assignee === 'object') {
                  return assignee.avatar ? (
                    <img src={assignee.avatar} alt={assignee.name} />
                  ) : (
                    <span>{assignee.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  );
                }
                return <span>{assignee?.charAt(0)?.toUpperCase() || 'U'}</span>;
              })()}
            </div>
            <span className="assignee-name">
              {(() => {
                const assignee = task.assignedTo || task.assignee;
                return typeof assignee === 'object' 
                  ? assignee.name || 'Unassigned'
                  : assignee || 'Unassigned';
              })()}
            </span>
          </div>
        )}
        
        {task.dueDate && (
          <div className="task-due-date">
            <span className="due-date-icon">📅</span>
            <span>{formatDate(task.dueDate)}</span>
          </div>
        )}
        
        {task.timeLogged > 0 && (
          <div className="task-time">
            <span className="time-icon">⏱️</span>
            <span>{task.timeLogged}h</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
