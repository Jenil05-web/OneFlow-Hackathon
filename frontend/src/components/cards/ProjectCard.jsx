// ProjectCard.jsx
import React from 'react';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return 'status-progress';
      case 'completed':
        return 'status-completed';
      case 'on hold':
        return 'status-hold';
      case 'planned':
        return 'status-planned';
      default:
        return 'status-default';
    }
  };

  const getTagClass = (index) => {
    const classes = ['tag-green', 'tag-pink', 'tag-purple', 'tag-blue'];
    return classes[index % classes.length];
  };

  return (
    <div className="project-card">
      {/* Tags Section */}
      <div className="project-tags">
        {project.tags.map((tag, index) => (
          <span key={index} className={`project-tag ${getTagClass(index)}`}>
            {tag}
          </span>
        ))}
      </div>

      {/* Project Header */}
      <div className="project-header">
        <h3 className="project-title">{project.title}</h3>
        <button className="project-menu-btn">⋮</button>
      </div>

      {/* Large Preview Image */}
      <div className="project-preview">
        <img 
          src={project.image} 
          alt={project.title}
        />
        <div className="project-overlay">
          <span className={`project-status-badge ${getStatusClass(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Project Footer */}
      <div className="project-footer">
        <div className="project-meta">
          <div className="meta-item">
            <span className="meta-icon">📅</span>
            <span className="meta-text">{project.dueDate}</span>
          </div>
          <div className="meta-item">
            <span className="meta-icon">📋</span>
            <span className="meta-text">{project.taskCount} tasks</span>
          </div>
        </div>
        
        <div className="project-team-info">
          {project.team && (
            <div className="project-team">
              {project.team.slice(0, 2).map((member, index) => (
                <div key={index} className="team-avatar">
                  {member}
                </div>
              ))}
            </div>
          )}
          <div className="project-id">D-{project.id}</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;