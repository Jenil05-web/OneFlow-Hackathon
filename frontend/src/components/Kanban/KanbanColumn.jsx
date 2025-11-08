import React from 'react';
import TaskCard from './TaskCard';
import './KanbanColumn.css';

const KanbanColumn = ({ column, columnId, onDragEnd }) => {
  return (
    <div className="kanban-column">
      <div className="column-title">
        <span>{column.title}</span>
        {column.tasks.length > 0 && (
          <span className="task-count">{column.tasks.length}</span>
        )}
      </div>
      <div className="task-list">
        {column.tasks.length === 0 ? (
          <div className="empty-column">No tasks</div>
        ) : (
          column.tasks.map((task, index) => (
            <TaskCard 
              key={task.id || task._id || index} 
              task={task} 
              index={index}
              columnId={columnId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
