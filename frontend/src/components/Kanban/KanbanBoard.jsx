import React, { useState } from 'react';
import './KanbanBoard.css';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ tasks }) => {
  const initialColumns = {
    'todo': {
      title: 'To Do',
      tasks: tasks.filter(t => t.status === 'To Do'),
    },
    'in-progress': {
      title: 'In Progress',
      tasks: tasks.filter(t => t.status === 'In Progress'),
    },
    'done': {
      title: 'Done',
      tasks: tasks.filter(t => t.status === 'Done'),
    },
  };

  const [columns, setColumns] = useState(initialColumns);

  // Mock drag and drop functionality
  const handleDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const startColumn = columns[source.droppableId];
    const endColumn = columns[destination.droppableId];

    if (startColumn === endColumn) {
      const newTasks = Array.from(startColumn.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      const newColumn = {
        ...startColumn,
        tasks: newTasks,
      };

      setColumns({
        ...columns,
        [source.droppableId]: newColumn,
      });
    } else {
      const startTasks = Array.from(startColumn.tasks);
      const [removed] = startTasks.splice(source.index, 1);
      const newStartColumn = {
        ...startColumn,
        tasks: startTasks,
      };

      const endTasks = Array.from(endColumn.tasks);
      endTasks.splice(destination.index, 0, removed);
      const newEndColumn = {
        ...endColumn,
        tasks: endTasks,
      };

      setColumns({
        ...columns,
        [source.droppableId]: newStartColumn,
        [destination.droppableId]: newEndColumn,
      });
    }
  };

  return (
    <div className="kanban-board">
      {Object.entries(columns).map(([columnId, column]) => (
        <KanbanColumn key={columnId} columnId={columnId} column={column} />
      ))}
    </div>
  );
};

export default KanbanBoard;
