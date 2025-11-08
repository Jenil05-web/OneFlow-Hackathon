import React, { useState, useEffect } from 'react';
import './KanbanBoard.css';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ tasks = [], onTaskStatusUpdate, projectId }) => {
  // Map API statuses to Kanban columns
  const statusToColumnMap = {
    'To Do': 'todo',
    'In Progress': 'in-progress',
    'Review': 'review',
    'Completed': 'completed',
    'Blocked': 'blocked',
  };

  const columnToStatusMap = {
    'todo': 'To Do',
    'in-progress': 'In Progress',
    'review': 'Review',
    'completed': 'Completed',
    'blocked': 'Blocked',
  };

  const getColumns = () => {
    const columns = {
      'todo': {
        title: 'To Do',
        tasks: tasks.filter(t => t.status === 'To Do' || !t.status),
      },
      'in-progress': {
        title: 'In Progress',
        tasks: tasks.filter(t => t.status === 'In Progress'),
      },
      'review': {
        title: 'Review',
        tasks: tasks.filter(t => t.status === 'Review'),
      },
      'blocked': {
        title: 'Blocked',
        tasks: tasks.filter(t => t.status === 'Blocked'),
      },
      'completed': {
        title: 'Completed',
        tasks: tasks.filter(t => t.status === 'Completed'),
      },
    };
    return columns;
  };

  const [columns, setColumns] = useState(getColumns());

  useEffect(() => {
    setColumns(getColumns());
  }, [tasks]);

  const handleTaskStatusUpdate = async (taskId, newColumnId) => {
    const newStatus = columnToStatusMap[newColumnId];
    if (!newStatus) return;

    // Optimistically update UI
    const updatedColumns = { ...columns };
    let movedTask = null;

    // Find and remove task from current column
    Object.keys(updatedColumns).forEach(columnId => {
      const taskIndex = updatedColumns[columnId].tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        movedTask = updatedColumns[columnId].tasks[taskIndex];
        updatedColumns[columnId].tasks.splice(taskIndex, 1);
      }
    });

    // Add task to new column
    if (movedTask) {
      movedTask.status = newStatus;
      if (updatedColumns[newColumnId]) {
        updatedColumns[newColumnId].tasks.push(movedTask);
      }
      setColumns(updatedColumns);
    }

    // Update via API
    if (onTaskStatusUpdate) {
      try {
        await onTaskStatusUpdate(taskId, newStatus);
      } catch (error) {
        // Revert on error
        setColumns(getColumns());
        console.error('Failed to update task status:', error);
      }
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // Same column, just reorder (optional - can be implemented later)
      return;
    }

    // Different column - update status
    handleTaskStatusUpdate(draggableId, destination.droppableId);
  };

  return (
    <div className="kanban-board">
      {Object.entries(columns).map(([columnId, column]) => (
        <KanbanColumn 
          key={columnId} 
          columnId={columnId} 
          column={column}
          onDragEnd={handleDragEnd}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
