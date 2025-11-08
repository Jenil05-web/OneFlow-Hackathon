import { useState, useEffect } from "react";
import { projectsAPI as projectAPI, authAPI } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import CreateProject from "../components/CreateProject";
import "./Dashboard.css";

const DEFAULT_PROJECT_IMAGE = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=500&auto=format&fit=crop";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const isAdmin = user?.role === "Admin";


  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      window.location.href = "/login";
      return;
    }

    // Fetch latest user profile from server to ensure we have the most up-to-date role
    const fetchUserProfile = async () => {
      try {
        const response = await authAPI.getMe();
        if (response.data.success) {
          const latestUser = response.data.user;
          setUser(latestUser);
          // Update localStorage with latest user data
          localStorage.setItem("user", JSON.stringify({
            id: latestUser._id || latestUser.id,
            name: latestUser.name,
            email: latestUser.email,
            role: latestUser.role,
          }));
          console.log("Dashboard - Latest user role from server:", latestUser?.role);
        } else {
          // Fallback to localStorage user data
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log("Dashboard - Using localStorage user role:", parsedUser?.role);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Fallback to localStorage user data
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log("Dashboard - Using localStorage user role (fallback):", parsedUser?.role);
      }
    };

    fetchUserProfile();
    fetchProjects();
  }, []);


  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      if (response.data.success) {
        setProjects(response.data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };


  const handleProjectCreated = async (newProject) => {
    // Refresh projects list
    await fetchProjects();
    setShowCreateProject(false);
  };



  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <div className="loading-text">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#f9fafb' }}>
      <div className="dashboard-container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="dashboard-title">
                Projects
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {isAdmin && (
                <Link to="/admin" className="create-project-btn" style={{ textDecoration: 'none' }}>
                  <span className="btn-icon-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </span>
                  <span className="btn-text">Admin Panel</span>
                </Link>
              )}
              <button
                onClick={() => setShowCreateProject(true)}
                className="create-project-btn"
              >
                <span className="btn-icon-wrapper">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </span>
                <span className="btn-text">Create New Project</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* Admin Quick Actions */}
        {isAdmin && (
          <div className="admin-quick-actions">
            <div className="section-header">
              <h2 className="projects-title">Admin Quick Actions</h2>
            </div>
            <div className="quick-actions-grid">
              <Link to="/admin" className="quick-action-card">
                <div className="quick-action-icon">👥</div>
                <h3>Manage Users</h3>
                <p>View and manage all users, roles, and hourly rates</p>
              </Link>
              <Link to="/admin/settings" className="quick-action-card">
                <div className="quick-action-icon">⚙️</div>
                <h3>Global Settings</h3>
                <p>Manage Sales Orders, Purchase Orders, Invoices, and more</p>
              </Link>
              <div className="quick-action-card" onClick={() => setShowCreateProject(true)} style={{ cursor: 'pointer' }}>
                <div className="quick-action-icon">📊</div>
                <h3>System Analytics</h3>
                <p>View comprehensive system-wide analytics and reports</p>
              </div>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="projects-section">
          {/* Project Cards Grid */}
          <div className="projects-grid">
            {projects.map((project) => (
              <div
                key={project._id || project.id}
                className="project-card"
                onClick={() => navigate(`/project/${project._id || project.id}`)}
              >
                {/* Project Image */}
                <div className="project-card-image">
                  <img 
                    src={project.image || DEFAULT_PROJECT_IMAGE} 
                    alt={project.name}
                    onError={(e) => {
                      e.target.src = DEFAULT_PROJECT_IMAGE;
                    }}
                  />
                </div>
                
                <div className="project-card-content">
                  {/* Project Header */}
                  <div className="project-card-header">
                    <h3 className="project-card-title">{project.name}</h3>
                    <span className={`project-card-status ${project.status?.toLowerCase().replace(' ', '-') || 'planned'}`}>
                      {project.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Progress</span>
                      <span className="progress-value">{project.progress || 0}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${project.status?.toLowerCase().replace(' ', '-') || 'planned'}`}
                        style={{ width: `${project.progress || 0}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Project Details */}
                  <div className="project-card-footer">
                    <div className="project-card-meta">
                      <span className="project-card-meta-icon">📅</span>
                      <span>
                        {project.endDate 
                          ? new Date(project.endDate).toLocaleDateString()
                          : "No deadline"
                        }
                      </span>
                    </div>
                    <div className="project-card-meta">
                      <span className="project-card-meta-icon">👥</span>
                      <span>
                        {project.teamMembers?.length || project.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Empty State */}
        {projects.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state-title">No projects found</h3>
            <p className="empty-state-description">
              You don't have any projects yet. Create your first project to get started!
            </p>
            <button
              onClick={() => setShowCreateProject(true)}
              className="btn btn-primary"
            >
              Create Your First Project
            </button>
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateProject && (
          <CreateProject
            onClose={() => setShowCreateProject(false)}
            onSuccess={handleProjectCreated}
          />
        )}

      </div>
    </div>
  );
};

export default Dashboard;
