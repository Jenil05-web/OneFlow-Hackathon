import { useState, useEffect } from "react";
import {
  projectsAPI as projectAPI,
  authAPI,
  tasksAPI,
  timesheetsAPI,
} from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import CreateProject from "../components/CreateProject";
import ProjectOverviewModal from "../components/ProjectOverviewModal";
import "./Dashboard.css";

const DEFAULT_PROJECT_IMAGE =
  "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=500&auto=format&fit=crop";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [teamStats, setTeamStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    hoursLogged: 0,
    pendingTimesheets: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProject, setSelectedProject] = useState(null);
  const [showProjectOverview, setShowProjectOverview] = useState(false);
  const isAdmin = user?.role === "Admin";
  const isManager = user?.role === "Manager";
  const isTeam = user?.role === "Team";
  const canCreateProject = isAdmin || isManager;
  const canEditProject = isAdmin; // Only Admin can edit projects

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
          localStorage.setItem(
            "user",
            JSON.stringify({
              id: latestUser._id || latestUser.id,
              name: latestUser.name,
              email: latestUser.email,
              role: latestUser.role,
            })
          );
          console.log(
            "Dashboard - Latest user role from server:",
            latestUser?.role
          );
        } else {
          // Fallback to localStorage user data
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log(
            "Dashboard - Using localStorage user role:",
            parsedUser?.role
          );
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Fallback to localStorage user data
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log(
          "Dashboard - Using localStorage user role (fallback):",
          parsedUser?.role
        );
      }
    };

    fetchUserProfile();
    fetchProjects();
  }, []);

  // Refresh projects when user is loaded (especially important for team members)
  // This ensures team members see their assigned projects after user data is fetched
  useEffect(() => {
    if (user && user._id) {
      fetchProjects();
    }
  }, [user?._id, user?.role]);

  useEffect(() => {
    if (isTeam && user) {
      fetchTeamStats();
    }
  }, [isTeam, user]);

  const fetchTeamStats = async () => {
    try {
      const userId = user._id || user.id;

      // Fetch assigned tasks - Team members automatically see only their tasks
      const tasksResponse = await tasksAPI.getAll();
      const allTasks = tasksResponse.data.tasks || [];
      // Filter tasks assigned to this user (backend already filters for Team, but we double-check)
      const tasks = allTasks.filter((t) => {
        const assigneeId =
          t.assignedTo?._id || t.assignedTo?.id || t.assignedTo;
        return assigneeId === userId || String(assigneeId) === String(userId);
      });

      // Fetch timesheets
      const timesheetsResponse = await timesheetsAPI.getAll();
      const allTimesheets = timesheetsResponse.data.timesheets || [];
      // Filter timesheets for this user
      const timesheets = allTimesheets.filter((ts) => {
        const tsUserId = ts.user?._id || ts.user?.id || ts.user;
        return tsUserId === userId || String(tsUserId) === String(userId);
      });

      const assignedTasks = tasks.length;
      const completedTasks = tasks.filter(
        (t) => t.status === "Completed"
      ).length;
      const totalHours = timesheets.reduce(
        (sum, ts) => sum + (ts.hours || 0),
        0
      );
      const pendingTimesheets = timesheets.filter((ts) => !ts.approved).length;

      setTeamStats({
        assignedTasks,
        completedTasks,
        hoursLogged: totalHours,
        pendingTimesheets,
      });
    } catch (error) {
      console.error("Failed to fetch team stats:", error);
    }
  };

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
    <div className="min-h-screen" style={{ background: "#f9fafb" }}>
      <div className="dashboard-container">
        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <div className="dashboard-welcome">
                Welcome back,{" "}
                <span className="welcome-name">{user?.name || "User"}</span>!
              </div>
              <h1 className="dashboard-title">Projects</h1>
            </div>
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="create-project-btn"
                  style={{ textDecoration: "none" }}
                >
                  <span className="btn-icon-wrapper">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </span>
                  <span className="btn-text">Admin Panel</span>
                </Link>
              )}
              {canCreateProject && (
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="create-project-btn"
                >
                  <span className="btn-icon-wrapper">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </span>
                  <span className="btn-text">Create New Project</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
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
                <div className="quick-action-icon">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <h3>Manage Users</h3>
                <p>View and manage all users, roles, and hourly rates</p>
              </Link>
            </div>
          </div>
        )}

        {/* Team Member Quick Stats */}
        {isTeam && (
          <div className="team-stats-section">
            <div className="team-stats-grid">
              <div className="team-stat-card">
                <div className="team-stat-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M9 11l3 3L22 4"></path>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                </div>
                <div className="team-stat-content">
                  <div className="team-stat-value">
                    {teamStats.assignedTasks}
                  </div>
                  <div className="team-stat-label">Assigned Tasks</div>
                </div>
              </div>
              <div className="team-stat-card">
                <div className="team-stat-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="team-stat-content">
                  <div className="team-stat-value">
                    {teamStats.completedTasks}
                  </div>
                  <div className="team-stat-label">Completed</div>
                </div>
              </div>
              <div className="team-stat-card">
                <div className="team-stat-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                </div>
                <div className="team-stat-content">
                  <div className="team-stat-value">
                    {teamStats.hoursLogged}h
                  </div>
                  <div className="team-stat-label">Hours Logged</div>
                </div>
              </div>
              <div className="team-stat-card">
                <div className="team-stat-icon">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className="team-stat-content">
                  <div className="team-stat-value">
                    {teamStats.pendingTimesheets}
                  </div>
                  <div className="team-stat-label">Pending Timesheets</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Projects Section */}
        <div className="projects-section">
          {/* Search Bar for Team Members */}
          {isTeam && (
            <div className="projects-search-container">
              <div className="search-input-wrapper">
                <svg
                  className="search-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Search your assigned projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="projects-search-input"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="search-clear-btn"
                    aria-label="Clear search"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Project Cards Grid */}
          <div className="projects-grid">
            {projects
              .filter((project) => {
                if (!searchQuery) return true;
                const query = searchQuery.toLowerCase();
                return (
                  project.name?.toLowerCase().includes(query) ||
                  project.description?.toLowerCase().includes(query) ||
                  project.status?.toLowerCase().includes(query)
                );
              })
              .map((project) => (
                <div
                  key={project._id || project.id}
                  className="project-card"
                  onClick={() => {
                    setSelectedProject(project);
                    setShowProjectOverview(true);
                  }}
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
                      <span
                        className={`project-card-status ${
                          project.status?.toLowerCase().replace(" ", "-") ||
                          "planned"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="progress-section">
                      <div className="progress-header">
                        <span className="progress-label">Progress</span>
                        <span className="progress-value">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${
                            project.status?.toLowerCase().replace(" ", "-") ||
                            "planned"
                          }`}
                          style={{ width: `${project.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Project Details */}
                    <div className="project-card-footer">
                      <div className="project-card-meta">
                        <span className="project-card-meta-icon">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <rect
                              x="3"
                              y="4"
                              width="18"
                              height="18"
                              rx="2"
                              ry="2"
                            ></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                        </span>
                        <span>
                          {project.endDate
                            ? new Date(project.endDate).toLocaleDateString()
                            : "No deadline"}
                        </span>
                      </div>
                      <div className="project-card-meta">
                        <span className="project-card-meta-icon">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                          </svg>
                        </span>
                        <span>
                          {project.teamMembers?.length ||
                            project.members?.length ||
                            0}{" "}
                          members
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
            <div className="empty-state-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <h3 className="empty-state-title">No projects found</h3>
            <p className="empty-state-description">
              {isTeam
                ? "You haven't been assigned to any projects yet. Contact your manager to get assigned to a project."
                : "You don't have any projects yet. Create your first project to get started!"}
            </p>
            {canCreateProject && (
              <button
                onClick={() => setShowCreateProject(true)}
                className="btn btn-primary"
              >
                Create Your First Project
              </button>
            )}
          </div>
        )}

        {/* Create Project Modal */}
        {showCreateProject && (
          <CreateProject
            onClose={() => setShowCreateProject(false)}
            onSuccess={handleProjectCreated}
          />
        )}

        {/* Project Overview Modal */}
        {showProjectOverview && selectedProject && (
          <ProjectOverviewModal
            project={selectedProject}
            onClose={() => {
              setShowProjectOverview(false);
              setSelectedProject(null);
            }}
            onEdit={(project) => {
              // Navigate to edit page or open edit modal
              navigate(`/project/${project._id || project.id}?edit=true`);
            }}
            onDelete={async (project) => {
              try {
                await projectAPI.delete(project._id || project.id);
                await fetchProjects();
              } catch (error) {
                console.error("Error deleting project:", error);
                alert("Failed to delete project");
              }
            }}
            canEdit={canEditProject}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
