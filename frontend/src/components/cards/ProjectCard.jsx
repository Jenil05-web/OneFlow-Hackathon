import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProjectCard.css';

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

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
        return '';
    }
  };

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <div className="project-card" onClick={handleClick}>
      <div className="project-image">
        <img src={project.image || 'https://via.placeholder.com/300x150'} alt={project.title} />
      </div>
      <div className="project-content">
        <div className="project-header">
          <h3 className="project-title">{project.title}</h3>
          <span className={`project-status ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
        <p className="project-description">{project.description}</p>
        <div className="project-progress">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${project.progress}%` }}
            ></div>
          </div>
          <span className="progress-text">{project.progress}% Complete</span>
        </div>
        <div className="project-footer">
          <div className="project-due-date">
            <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
          </div>
          <div className="project-team">
            {project.team && project.team.map((member, index) => (
              <img 
                key={index} 
                src={member.avatar} 
                alt={member.name} 
                className="team-member-avatar"
                title={member.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;