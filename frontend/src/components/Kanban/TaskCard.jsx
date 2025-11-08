import React from 'react';
import './TaskCard.css';

const TaskCard = ({ task, index }) => {
  return (
    <div className="task-card">
      <h4 className="task-title">{task.title}</h4>
      <p className="task-description">{task.description}</p>
    </div>
  );
};

export default TaskCard;
