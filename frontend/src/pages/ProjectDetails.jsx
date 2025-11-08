import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import KanbanBoard from '../components/Kanban/KanbanBoard';

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data for demonstration
    // Replace this with actual API call to fetch project and tasks
    const mockProject = {
      id: projectId,
      title: "Project Alpha",
      description: "A sample project to demonstrate Kanban view",
      status: "In Progress",
      progress: 60,
      dueDate: "2023-12-31"
    };

    const mockTasks = [
      {
        id: 1,
        title: "Design UI",
        description: "Create UI mockups",
        status: "Done",
        assignee: "John Doe"
      },
      {
        id: 2,
        title: "Implement Backend",
        description: "Set up Express server",
        status: "In Progress",
        assignee: "Jane Smith"
      },
      {
        id: 3,
        title: "Write Tests",
        description: "Create unit tests",
        status: "To Do",
        assignee: "Mike Johnson"
      }
    ];

    setProject(mockProject);
    setTasks(mockTasks);
    setLoading(false);
  }, [projectId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="project-details">
      <div className="project-info">
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <div className="project-metadata">
          <span>Status: {project.status}</span>
          <span>Progress: {project.progress}%</span>
          <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
        </div>
      </div>
      <div className="kanban-container">
        <KanbanBoard tasks={tasks} />
      </div>
    </div>
  );
};

export default ProjectDetails;