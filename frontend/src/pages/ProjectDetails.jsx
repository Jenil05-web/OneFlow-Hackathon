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
    // Simulate API call
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
    }, 500);
  }, [projectId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading...</div>
      </div>
    );
  }

  return (
    <div className="project-details">
      <div className="project-info">
        <div className="project-header">
          <h1>
            {project.title}
            <span className="project-subtitle">Management Dashboard</span>
          </h1>
          <div className="project-actions">
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
            Due: {new Date(project.dueDate).toLocaleDateString()}
          </span>
          <span>
            <i className="fas fa-users"></i>
            Team: {project.team.length} members
          </span>
        </div>
      </div>
      <div className="kanban-container">
        <KanbanBoard tasks={tasks} />
      </div>
    </div>
  );
};

export default ProjectDetails;