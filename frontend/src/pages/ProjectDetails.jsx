import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../services/api';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProjectData();
    fetchTasks();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const response = await projectsAPI.getById(projectId);
      if (response.data.success) {
        setProject(response.data.project);
      } else {
        setError('Failed to load project');
      }
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err.response?.data?.message || 'Failed to load project');
      if (err.response?.status === 404) {
        navigate('/dashboard');
      }
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await tasksAPI.getByProject(projectId);
      if (response.data.success) {
        // Map tasks to match KanbanBoard expected format
        const mappedTasks = (response.data.tasks || []).map(task => ({
          id: task._id || task.id,
          title: task.title,
          description: task.description || '',
          status: task.status || 'To Do',
          assignee: task.assignedTo ? {
            name: task.assignedTo.name || 'Unassigned',
            avatar: task.assignedTo.avatar || `https://ui-avatars.com/api/?name=${task.assignedTo.name || 'User'}&background=random`
          } : null,
          priority: task.priority?.toLowerCase() || 'medium',
          dueDate: task.dueDate || null,
          tags: task.tags || [],
          progress: task.progress || 0,
          timeLogged: task.timeLogged || 0,
          estimatedHours: task.estimatedHours || 0,
        }));
        setTasks(mappedTasks);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    try {
      await tasksAPI.updateStatus(taskId, newStatus);
      // Refresh tasks
      fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      alert('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading project...</div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  return (
    <div className="project-details">
      <div className="project-info">
        <div className="project-header">
          <div>
            <h1>
              {project.name}
              <span className="project-subtitle">Management Dashboard</span>
            </h1>
          </div>
          <div className="project-actions">
            <button 
              className="project-action-button btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Dashboard
            </button>
            <button className="project-action-button btn-secondary">
              <i className="fas fa-user-plus"></i>
              Add Member
            </button>
            <button className="project-action-button btn-primary">
              <i className="fas fa-plus"></i>
              Add Task
            </button>
          </div>
        </div>
        <p>{project.description || 'No description provided'}</p>
        <div className="project-metadata">
          <span>
            <i className="fas fa-chart-line"></i>
            Status: {project.status}
          </span>
          <span>
            <i className="fas fa-tasks"></i>
            Progress: {project.progress || 0}%
          </span>
          <span>
            <i className="fas fa-calendar"></i>
            Due: {project.endDate 
              ? new Date(project.endDate).toLocaleDateString()
              : 'No deadline'
            }
          </span>
          <span>
            <i className="fas fa-users"></i>
            Team: {project.teamMembers?.length || project.members?.length || 0} members
          </span>
          {project.budget > 0 && (
            <span>
              <i className="fas fa-dollar-sign"></i>
              Budget: ${project.budget.toLocaleString()}
            </span>
          )}
          {project.revenue !== undefined && (
            <span>
              <i className="fas fa-chart-line"></i>
              Revenue: ${project.revenue?.toLocaleString() || 0}
            </span>
          )}
        </div>
      </div>
      <div className="kanban-container">
        <KanbanBoard 
          tasks={tasks} 
          onTaskStatusUpdate={handleTaskStatusUpdate}
          projectId={projectId}
        />
      </div>
    </div>
  );
};

export default ProjectDetails;
