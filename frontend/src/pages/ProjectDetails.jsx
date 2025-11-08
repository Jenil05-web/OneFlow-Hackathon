import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI, tasksAPI } from '../services/api';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import ProjectSettings from '../components/ProjectSettings';
import TaskDetails from '../components/TaskDetails';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('tasks'); // 'project', 'tasks', or 'settings'
  const [selectedTask, setSelectedTask] = useState(null);

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
          _id: task._id || task.id,
          title: task.title,
          description: task.description || '',
          status: task.status || 'To Do',
          assignedTo: task.assignedTo,
          assignee: task.assignedTo ? {
            name: task.assignedTo.name || 'Unassigned',
            avatar: task.assignedTo.avatar || `https://ui-avatars.com/api/?name=${task.assignedTo.name || 'User'}&background=random`
          } : null,
          priority: task.priority || 'Medium',
          dueDate: task.dueDate || null,
          tags: task.tags || [],
          progress: task.progress || 0,
          timeLogged: task.timeLogged || 0,
          estimatedHours: task.estimatedHours || 0,
          image: task.image || '',
          comments: task.comments || [],
          createdAt: task.createdAt || task.created_at || new Date().toISOString(),
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
          </div>
        </div>

        {/* Tab Navigation - Matching image design */}
        <div className="project-tabs">
          <button
            className={`project-tab ${activeTab === 'project' ? 'active' : ''}`}
            onClick={() => setActiveTab('project')}
          >
            Project
          </button>
          <button
            className={`project-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          <button
            className={`project-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'project' && (
        <div className="project-overview">
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
                Budget: ₹{project.budget.toLocaleString('en-IN')}
              </span>
            )}
            {project.revenue !== undefined && (
              <span>
                <i className="fas fa-chart-line"></i>
                Revenue: ₹{(project.revenue || 0).toLocaleString('en-IN')}
              </span>
            )}
            {project.cost !== undefined && (
              <span>
                <i className="fas fa-chart-line"></i>
                Cost: ₹{(project.cost || 0).toLocaleString('en-IN')}
              </span>
            )}
            {project.profit !== undefined && (
              <span>
                <i className="fas fa-chart-line"></i>
                Profit: ₹{(project.profit || 0).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && !selectedTask && (
        <div className="kanban-container">
          <KanbanBoard 
            tasks={tasks} 
            onTaskStatusUpdate={handleTaskStatusUpdate}
            projectId={projectId}
            onTaskClick={(task) => setSelectedTask(task)}
          />
        </div>
      )}

      {activeTab === 'tasks' && selectedTask && (
        <TaskDetails
          taskId={selectedTask.id || selectedTask._id}
          projectId={projectId}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            fetchTasks();
            setSelectedTask(null);
          }}
        />
      )}

      {activeTab === 'settings' && (
        <ProjectSettings projectId={projectId} project={project} />
      )}
    </div>
  );
};

export default ProjectDetails;
