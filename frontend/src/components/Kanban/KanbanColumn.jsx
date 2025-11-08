import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import TaskCard from './TaskCard';
import './KanbanColumn.css';

const KanbanColumn = ({ column, columnId, onTaskClick, viewMode = 'grid' }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: columnId,
    data: {
      columnId,
      type: 'column',
    },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`kanban-column ${isOver ? 'drag-over' : ''} ${viewMode === 'list' ? 'list-view' : ''}`}
    >
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
              onClick={() => onTaskClick && onTaskClick(task)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
