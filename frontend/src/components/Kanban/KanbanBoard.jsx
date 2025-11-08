import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import './KanbanBoard.css';
import KanbanColumn from './KanbanColumn';

const KanbanBoard = ({ tasks = [], onTaskStatusUpdate, projectId, onTaskClick }) => {
  const navigate = useNavigate();
  const [showMyTasksOnly, setShowMyTasksOnly] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(12);
  const [activeId, setActiveId] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || user.id;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before dragging starts
      },
    })
  );

  // Map API statuses to simplified Kanban columns (matching image)
  const statusToColumnMap = {
    'To Do': 'new',
    'In Progress': 'in-progress',
    'Review': 'in-progress', // Review tasks go to In Progress
    'Completed': 'done',
    'Blocked': 'in-progress', // Blocked tasks go to In Progress
  };

  const columnToStatusMap = {
    'new': 'To Do',
    'in-progress': 'In Progress',
    'done': 'Completed',
  };

  // Priority-based sorting function (as per image requirements)
  const sortTasksByPriority = (taskList) => {
    return [...taskList].sort((a, b) => {
      // 1. Priority field (High > Medium > Low)
      const priorityOrder = { High: 3, Medium: 2, Low: 1 };
      const priorityDiff = (priorityOrder[b.priority] || 2) - (priorityOrder[a.priority] || 2);
      if (priorityDiff !== 0) return priorityDiff;

      // 2. Number of assignees (more assignees = higher priority)
      const aAssignees = Array.isArray(a.assignedTo) ? a.assignedTo.length : (a.assignedTo ? 1 : 0);
      const bAssignees = Array.isArray(b.assignedTo) ? b.assignedTo.length : (b.assignedTo ? 1 : 0);
      const assigneeDiff = bAssignees - aAssignees;
      if (assigneeDiff !== 0) return assigneeDiff;

      // 3. Deadline (earlier deadline = higher priority)
      if (a.dueDate && b.dueDate) {
        const dateDiff = new Date(a.dueDate) - new Date(b.dueDate);
        if (dateDiff !== 0) return dateDiff;
      } else if (a.dueDate) return -1;
      else if (b.dueDate) return 1;

      // 4. Creation date (newer = higher priority)
      const aCreated = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const bCreated = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return bCreated - aCreated;
    });
  };

  const getFilteredTasks = useMemo(() => {
    let filtered = tasks;
    
    if (showMyTasksOnly) {
      // Filter to show only tasks assigned to current user
      filtered = tasks.filter(task => {
        const assignee = task.assignedTo || task.assignee;
        if (typeof assignee === 'object') {
          return assignee._id === userId || assignee.id === userId;
        }
        return assignee === userId;
      });
    }
    
    // Sort by priority
    return sortTasksByPriority(filtered);
  }, [tasks, showMyTasksOnly, userId]);


  const columns = useMemo(() => {
    const filteredTasks = getFilteredTasks;
    const cols = {
      'new': {
        title: 'New',
        tasks: filteredTasks.filter(t => {
          const status = t.status || 'To Do';
          return status === 'To Do' || !status;
        }),
      },
      'in-progress': {
        title: 'In Progress',
        tasks: filteredTasks.filter(t => {
          const status = t.status || '';
          return status === 'In Progress' || status === 'Review' || status === 'Blocked';
        }),
      },
      'done': {
        title: 'Done',
        tasks: filteredTasks.filter(t => {
          const status = t.status || '';
          return status === 'Completed';
        }),
      },
    };
    return cols;
  }, [getFilteredTasks]);

  // Pagination logic - apply to all tasks across all columns
  const allTasks = getFilteredTasks;
  const totalPages = Math.ceil(allTasks.length / tasksPerPage);
  const startIndex = (currentPage - 1) * tasksPerPage;
  const endIndex = startIndex + tasksPerPage;

  // Apply pagination to columns
  const paginatedColumns = useMemo(() => {
    const cols = { ...columns };
    // Get all tasks from all columns
    const allColumnTasks = Object.values(columns).flatMap(col => col.tasks);
    const paginatedTaskIds = new Set(
      allColumnTasks.slice(startIndex, endIndex).map(t => t.id || t._id)
    );
    
    // Filter each column to only show paginated tasks
    Object.keys(cols).forEach(colId => {
      cols[colId].tasks = cols[colId].tasks.filter(t => 
        paginatedTaskIds.has(t.id || t._id)
      );
    });
    
    return cols;
  }, [columns, startIndex, endIndex]);

  useEffect(() => {
    // Reset to page 1 if current page is out of bounds
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handleTaskStatusUpdate = async (taskId, newColumnId) => {
    const newStatus = columnToStatusMap[newColumnId];
    if (!newStatus) return;

    // Update via API
    if (onTaskStatusUpdate) {
      try {
        await onTaskStatusUpdate(taskId, newStatus);
      } catch (error) {
        console.error('Failed to update task status:', error);
      }
    }
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id;
    const sourceColumnId = active.data.current?.columnId;
    const destinationColumnId = over.data.current?.columnId || over.id;

    if (sourceColumnId && destinationColumnId && sourceColumnId !== destinationColumnId) {
      // Different column - update status
      handleTaskStatusUpdate(taskId, destinationColumnId);
    }
  };

  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return allTasks.find(t => (t.id || t._id) === activeId);
  }, [activeId, allTasks]);

  return (
    <div className="kanban-board">
      <div className="kanban-header">
        <div className="kanban-header-left">
          <button
            className="new-task-btn"
            onClick={() => projectId && navigate(`/project/${projectId}/task/new`)}
          >
            New
          </button>
        </div>
        <div className="kanban-header-right">
          <div className="pagination-controls">
            <span className="pagination-info">
              {startIndex + 1}-{Math.min(endIndex, allTasks.length)}/{allTasks.length}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              ←
            </button>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
            >
              →
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              ⬜
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              ☰
            </button>
          </div>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className={`kanban-columns-container ${viewMode === 'list' ? 'list-view' : ''}`}>
          {Object.entries(paginatedColumns).map(([columnId, column]) => (
            <KanbanColumn 
              key={columnId} 
              columnId={columnId} 
              column={column}
              onTaskClick={onTaskClick}
              viewMode={viewMode}
            />
          ))}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="task-card-drag-preview">
              <div className="task-title">{activeTask.title}</div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default KanbanBoard;
