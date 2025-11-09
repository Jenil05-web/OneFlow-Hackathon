import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksAPI, projectsAPI } from '../services/api';
import './ProjectOverviewModal.css';

const ProjectOverviewModal = ({ project, onClose, onEdit, onDelete, canEdit }) => {
  const navigate = useNavigate();
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const justOpenedRef = useRef(false);
  const buttonClickedRef = useRef(false);
  const openingClickTimeRef = useRef(0);

  useEffect(() => {
    if (project) {
      fetchTaskCount();
    }
  }, [project]);

  useEffect(() => {
    if (!showMenu) {
      justOpenedRef.current = false;
      buttonClickedRef.current = false;
      return;
    }

    const handleClickOutside = (event) => {
      // Ignore clicks that happened within 500ms of opening (the opening click)
      const timeSinceOpening = Date.now() - openingClickTimeRef.current;
      if (timeSinceOpening < 500) {
        return;
      }

      // Ignore if button was just clicked
      if (buttonClickedRef.current) {
        buttonClickedRef.current = false;
        return;
      }

      // Ignore clicks that happen immediately after opening
      if (justOpenedRef.current) {
        return;
      }

      // Check if click is outside the menu container
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    // Set flag that menu just opened
    justOpenedRef.current = true;
    
    // Clear the flag after a delay
    const clearFlagTimer = setTimeout(() => {
      justOpenedRef.current = false;
    }, 200);

    // Add listener after a delay to ensure the opening click has been processed
    // Don't use capture phase so button's onClick can set the flag first
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 100);
    
    return () => {
      clearTimeout(clearFlagTimer);
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
      justOpenedRef.current = false;
      buttonClickedRef.current = false;
    };
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
    onClose();
    // Small delay to allow modal to close before navigation
    setTimeout(() => {
      if (onEdit) {
        onEdit(project);
      } else {
        // Fallback navigation
        navigate(`/project/${project._id || project.id}?edit=true`);
      }
    }, 100);
  };

  const handleDelete = () => {
    setShowMenu(false);
    const confirmed = window.confirm(`Are you sure you want to delete project "${project.name}"? This action cannot be undone.`);
    if (confirmed) {
      if (onDelete) {
        onDelete(project);
      }
      onClose();
    }
    // If cancelled, don't close the menu - it will be handled by the click outside handler
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

  const handleModalClick = (e) => {
    // Don't close modal when clicking inside, but allow menu clicks
    e.stopPropagation();
  };

  const handleOverlayClick = (e) => {
    // Only close if clicking directly on overlay, not on modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="project-overview-overlay" onClick={handleOverlayClick}>
      <div 
        className="project-overview-modal" 
        onClick={handleModalClick}
      >
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
              <div className="project-overview-menu" ref={menuRef}>
                <button 
                  ref={buttonRef}
                  type="button"
                  className="project-overview-menu-btn"
                  onClick={(e) => {
                    // Record the time of the click
                    openingClickTimeRef.current = Date.now();
                    // Mark that button was clicked first
                    buttonClickedRef.current = true;
                    e.stopPropagation();
                    const newValue = !showMenu;
                    setShowMenu(newValue);
                    // Clear the flag after a delay to allow the click event to be processed
                    setTimeout(() => {
                      buttonClickedRef.current = false;
                    }, 500);
                  }}
                  aria-label="More options"
                  aria-expanded={showMenu}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="5" r="1"/>
                    <circle cx="12" cy="12" r="1"/>
                    <circle cx="12" cy="19" r="1"/>
                  </svg>
                </button>
                {showMenu && (
                  <div 
                    className="project-overview-menu-dropdown"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <button 
                      type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleEdit();
                    }}
                      className="menu-item"
                    >
                      Edit
                    </button>
                    <div className="menu-divider"></div>
                    <button 
                      type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDelete();
                    }}
                      className="menu-item menu-item-danger"
                    >
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

