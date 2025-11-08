import React from 'react';
import TaskCard from './TaskCard';
import './KanbanColumn.css';

const KanbanColumn = ({ column, columnId }) => {
  return (
    <div className="kanban-column">
      <h3 className="column-title">{column.title}</h3>
      <div className="task-list">
        {column.tasks.map((task, index) => (
          <TaskCard key={task.id} task={task} index={index} />
        ))}
      </div>
    </div>
  );
};

export default KanbanColumn;
