import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI, projectsAPI } from '../services/api';
import './ProjectOverviewModal.css';

const ProjectOverviewModal = ({ project, onClose, onEdit, onDelete, canEdit }) => {
  const navigate = useNavigate();
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (project) {
      fetchTaskCount();
    }
  }, [project]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.project-overview-menu')) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  const fetchTaskCount = async () => {
    try {
      const response = await tasksAPI.getByProject(project._id || project.id);
      if (response.data.success) {
        setTaskCount(response.data.tasks?.length || 0);
      }
    } catch (error) {
      console.error('Error fetching task count:', error);
      setTaskCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    navigate(`/project/${project._id || project.id}`);
    onClose();
  };

  const handleEdit = () => {
    setShowMenu(false);
    if (onEdit) {
      onEdit(project);
    }
    onClose();
  };

  const handleDelete = () => {
    setShowMenu(false);
    if (window.confirm(`Are you sure you want to delete "${project.name}"?`)) {
      if (onDelete) {
        onDelete(project);
      }
    }
    onClose();
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' });
  };

  const getManagerAvatar = (manager) => {
    if (manager?.avatar) return manager.avatar;
    if (manager?.name) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(manager.name)}&background=random&color=fff&size=128`;
    }
    return 'https://ui-avatars.com/api/?name=Manager&background=667eea&color=fff&size=128';
  };

  if (!project) return null;

  return (
    <div className="project-overview-overlay" onClick={onClose}>
      <div className="project-overview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="project-overview-card">
          {/* Header with Tags and Menu */}
          <div className="project-overview-header">
            <div className="project-overview-tags">
              {project.tags && project.tags.length > 0 ? (
                project.tags.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index} 
                    className={`project-overview-tag ${index % 2 === 0 ? 'tag-green' : 'tag-red'}`}
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <>
                  <span className="project-overview-tag tag-green">Project</span>
                  <span className="project-overview-tag tag-red">{project.status || 'Planned'}</span>
                </>
              )}
            </div>
            {canEdit && (
              <div className="project-overview-menu">
                <button 
                  className="project-overview-menu-btn"
                  onClick={() => setShowMenu(!showMenu)}
                  aria-label="More options"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="1"/>
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
                {showMenu && (
                  <div className="project-overview-menu-dropdown">
                    <button onClick={handleEdit} className="menu-item">
                      Edit
                    </button>
                    <div className="menu-divider"></div>
                    <button onClick={handleDelete} className="menu-item menu-item-danger">
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Project Name */}
          <h2 className="project-overview-title">{project.name}</h2>

          {/* Cover Image */}
          <div className="project-overview-image">
            <img 
              src={project.image || 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=500&auto=format&fit=crop'} 
              alt={project.name}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=500&auto=format&fit=crop';
              }}
            />
          </div>

          {/* Footer with Deadline, Manager, and Task Count */}
          <div className="project-overview-footer">
            <div className="project-overview-footer-item">
              <span className="project-overview-icon">🚩</span>
              <span className="project-overview-text">
                {formatDate(project.endDate) || 'No deadline'}
              </span>
            </div>
            <div className="project-overview-footer-item">
              <img 
                src={getManagerAvatar(project.manager)} 
                alt={project.manager?.name || 'Manager'}
                className="project-overview-avatar"
              />
            </div>
            <div className="project-overview-footer-item">
              <span className="project-overview-icon">📄</span>
              <span className="project-overview-text">
                {loading ? '...' : `${taskCount} tasks`}
              </span>
            </div>
          </div>

          {/* View Details Button */}
          <button 
            className="project-overview-view-btn"
            onClick={handleViewDetails}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectOverviewModal;

