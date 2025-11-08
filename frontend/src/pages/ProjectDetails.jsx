import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../components/Kanban/KanbanBoard';
import './ProjectDetails.css';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      const mockProject = {
        id: projectId,
        title: "Project Alpha",
        description: "A comprehensive project management system with Kanban board functionality. This project aims to streamline task management and improve team collaboration through an intuitive interface.",
        status: "In Progress",
        progress: 60,
        dueDate: "2023-12-31",
        team: [
          { id: 1, name: "John Doe", avatar: "https://i.pravatar.cc/150?img=1" },
          { id: 2, name: "Jane Smith", avatar: "https://i.pravatar.cc/150?img=2" },
          { id: 3, name: "Mike Johnson", avatar: "https://i.pravatar.cc/150?img=3" }
        ]
      };

      const mockTasks = [
        {
          id: 1,
          title: "Design System Implementation",
          description: "Create and implement a comprehensive design system including color palette, typography, and component library",
          status: "Done",
          assignee: { name: "John Doe", avatar: "https://i.pravatar.cc/150?img=1" },
          priority: "high",
          dueDate: "2023-11-15",
          tags: ["design", "ui/ux"]
        },
        {
          id: 2,
          title: "Backend API Development",
          description: "Develop RESTful API endpoints for user authentication, task management, and project analytics",
          status: "In Progress",
          assignee: { name: "Jane Smith", avatar: "https://i.pravatar.cc/150?img=2" },
          priority: "medium",
          dueDate: "2023-11-20",
          tags: ["backend", "api"]
        },
        {
          id: 3,
          title: "Test Suite Implementation",
          description: "Write comprehensive unit tests and integration tests for all major components",
          status: "To Do",
          assignee: { name: "Mike Johnson", avatar: "https://i.pravatar.cc/150?img=3" },
          priority: "low",
          dueDate: "2023-11-25",
          tags: ["testing", "qa"]
        },
        {
          id: 4,
          title: "Performance Optimization",
          description: "Optimize application performance, including load times, database queries, and frontend rendering",
          status: "To Do",
          assignee: { name: "John Doe", avatar: "https://i.pravatar.cc/150?img=1" },
          priority: "medium",
          dueDate: "2023-11-30",
          tags: ["optimization", "performance"]
        }
      ];

      setProject(mockProject);
      setTasks(mockTasks);
      setLoading(false);
    }, 800);
  }, [projectId]);

  const getTaskStats = () => {
    const stats = {
      total: tasks.length,
      todo: tasks.filter(task => task.status === "To Do").length,
      inProgress: tasks.filter(task => task.status === "In Progress").length,
      done: tasks.filter(task => task.status === "Done").length
    };
    return stats;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading Project Details...</div>
      </div>
    );
  }

  const stats = getTaskStats();

  return (
    <div className="project-details">
      <div className="project-info">
        <div className="project-header">
          <h1>
            {project.title}
            <span className="project-subtitle">Management Dashboard</span>
          </h1>
          <div className="project-actions">
            <button 
              className="project-action-button btn-secondary"
              onClick={() => console.log('Add member clicked')}
            >
              <i className="fas fa-user-plus"></i>
              <span>Add Member</span>
            </button>
            <button 
              className="project-action-button btn-primary"
              onClick={() => console.log('Add task clicked')}
            >
              <i className="fas fa-plus"></i>
              <span>Add Task</span>
            </button>
          </div>
        </div>

        <p>{project.description}</p>

        <div className="project-metadata">
          <span>
            <i className="fas fa-chart-line"></i>
            Status: {project.status}
          </span>
          <span>
            <i className="fas fa-tasks"></i>
            Progress: {project.progress}%
          </span>
          <span>
            <i className="fas fa-calendar"></i>
            Due: {formatDate(project.dueDate)}
          </span>
          <span>
            <i className="fas fa-users"></i>
            Team: {project.team.length} members
          </span>
        </div>

        {/* Task Statistics */}
        <div className="project-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-value">{stats.todo}</div>
            <div className="stat-label">To Do</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🚀</div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-value">{stats.done}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Team Members Section */}
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ 
            fontSize: '1.3rem', 
            fontWeight: '700', 
            color: '#475569',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <i className="fas fa-users" style={{ color: '#667eea' }}></i>
            Team Members
          </h3>
          <div className="project-team-members">
            {project.team.map((member) => (
              <div 
                key={member.id} 
                className="team-member"
                onClick={() => console.log('Team member clicked:', member.name)}
              >
                <img 
                  src={member.avatar} 
                  alt={member.name} 
                  className="team-member-img"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=667eea&color=fff`;
                  }}
                />
                <span className="team-member-name">{member.name}</span>
              </div>
            ))}
            <button 
              className="team-member"
              style={{ border: '2px dashed rgba(102, 126, 234, 0.3)' }}
              onClick={() => console.log('Add team member clicked')}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}>
                +
              </div>
              <span className="team-member-name">Add Member</span>
            </button>
          </div>
        </div>
      </div>

      <div className="kanban-container">
        <div className="kanban-header">
          <h2 className="kanban-title">Task Board</h2>
        </div>
        <KanbanBoard tasks={tasks} />
      </div>
    </div>
  );
};

export default ProjectDetails;