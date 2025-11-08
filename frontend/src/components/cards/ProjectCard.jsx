import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getStatusColor = (status) => {
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
        return 'status-progress';
    }
  };

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  const getPlaceholderGradient = () => {
    const gradients = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    ];
    const index = project.id ? project.id % gradients.length : 0;
    return gradients[index];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const getStatusEmoji = (status) => {
    switch (status.toLowerCase()) {
      case 'in progress':
        return '🚀';
      case 'completed':
        return '✅';
      case 'on hold':
        return '⏸️';
      case 'planned':
        return '📋';
      default:
        return '📌';
    }
  };

  return (
    <div 
      className={`project-card ${!imageLoaded ? 'loading' : ''}`} 
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`View project: ${project.title}`}
    >
      <div 
        className="project-image"
        style={imageError ? { background: getPlaceholderGradient() } : {}}
      >
        {!imageError ? (
          <img 
            src={project.image || 'https://via.placeholder.com/300x150'} 
            alt={project.title}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            fontSize: '4rem',
            color: 'white',
            textShadow: '0 4px 12px rgba(0,0,0,0.2)'
          }}>
            {getStatusEmoji(project.status)}
          </div>
        )}
      </div>

      <div className="project-content">
        <div className="project-header">
          <h3 className="project-title">{project.title}</h3>
          <span 
            className={`project-status ${getStatusColor(project.status)}`}
            aria-label={`Status: ${project.status}`}
          >
            {project.status}
          </span>
        </div>

        <p className="project-description">
          {project.description || 'No description available for this project.'}
        </p>

        <div className="project-progress">
          <div 
            className="progress-bar-container"
            role="progressbar"
            aria-valuenow={project.progress || 0}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label="Project progress"
          >
            <div 
              className="progress-bar-fill" 
              style={{ width: `${project.progress || 0}%` }}
            ></div>
          </div>
          <span className="progress-text">
            {project.progress || 0}% Complete
          </span>
        </div>

        <div className="project-footer">
          <div className="project-due-date">
            <span>{formatDate(project.dueDate)}</span>
          </div>

          <div className="project-team">
            {project.team && project.team.length > 0 ? (
              project.team.slice(0, 4).map((member, index) => (
                <img 
                  key={index} 
                  src={member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=667eea&color=fff`}
                  alt={member.name} 
                  className="team-member-avatar"
                  title={member.name}
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=667eea&color=fff`;
                  }}
                />
              ))
            ) : (
              <img 
                src="https://ui-avatars.com/api/?name=Team&background=667eea&color=fff"
                alt="Team"
                className="team-member-avatar"
                title="Team"
              />
            )}
            {project.team && project.team.length > 4 && (
              <div 
                className="team-member-avatar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '700'
                }}
                title={`+${project.team.length - 4} more members`}
              >
                +{project.team.length - 4}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;