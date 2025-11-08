import { useState, useEffect } from "react";
import { dashboardAPI, projectsAPI as projectAPI, adminAPI, authAPI } from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import CreateProject from "../components/CreateProject";
import BecomeAdmin from "../components/BecomeAdmin";
import "./Dashboard.css";

const DEFAULT_PROJECT_IMAGE = "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=500&auto=format&fit=crop";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showBecomeAdmin, setShowBecomeAdmin] = useState(false);
  const [adminStats, setAdminStats] = useState(null);
  const isAdmin = user?.role === "Admin";

  const filters = ["All", "Planned", "In Progress", "Completed", "On Hold"];

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
          
          // Fetch admin stats if user is Admin
          if (latestUser?.role === "Admin") {
            console.log("Dashboard - Fetching admin stats");
            fetchAdminStats();
          }
        } else {
          // Fallback to localStorage user data
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log("Dashboard - Using localStorage user role:", parsedUser?.role);
          if (parsedUser?.role === "Admin") {
            fetchAdminStats();
          }
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Fallback to localStorage user data
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log("Dashboard - Using localStorage user role (fallback):", parsedUser?.role);
        if (parsedUser?.role === "Admin") {
          fetchAdminStats();
        }
      }
    };

    fetchUserProfile();
    fetchDashboardData();
    fetchProjects();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      const data = response.data.data || response.data;
      setDashboardData(data);
      console.log("Dashboard data:", data); // Debug log
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setError("Failed to load dashboard data");
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
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

  const fetchAdminStats = async () => {
    try {
      const response = await adminAPI.getUsers();
      if (response.data.success) {
        const users = response.data.users || [];
        const activeUsers = users.filter(u => u.isActive !== false).length;
        const managers = users.filter(u => u.role === "Manager").length;
        const teamMembers = users.filter(u => u.role === "Team").length;
        
        setAdminStats({
          totalUsers: users.length,
          activeUsers,
          managers,
          teamMembers,
        });
      }
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    }
  };

  const handleProjectCreated = async (newProject) => {
    // Refresh projects list
    await fetchProjects();
    setShowCreateProject(false);
  };

  // Filter projects based on active filter
  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(project => project.status === activeFilter);

  // Calculate KPIs from dashboard data and projects
  const getKPIs = () => {
    if (dashboardData) {
      const role = dashboardData.role;
      const summary = dashboardData.summary || {};

      if (role === "Admin") {
        return {
          activeProjects: summary.totalProjects || 0,
          delayedTasks: 0, // Calculate from tasks
          hoursLogged: summary.totalTimesheets || 0,
          revenueEarned: (summary.totalRevenue || 0) / 1000, // Convert to thousands
          totalCost: (summary.totalCost || 0) / 1000,
          totalProfit: ((summary.totalProfit || 0) / 1000),
          totalUsers: adminStats?.totalUsers || 0,
        };
      } else if (role === "Manager") {
        return {
          activeProjects: summary.managedProjects || 0,
          delayedTasks: 0,
          hoursLogged: summary.totalHours || 0,
          revenueEarned: (summary.totalRevenue || 0) / 1000,
        };
      } else if (role === "Team") {
        return {
          activeProjects: summary.totalProjects || 0,
          delayedTasks: 0,
          hoursLogged: summary.totalHours || 0,
          revenueEarned: 0,
        };
      }
    }

    // Fallback to calculated values from projects
    return {
      activeProjects: projects.filter(p => p.status === "In Progress").length,
      delayedTasks: 0,
      hoursLogged: 0,
      revenueEarned: 0,
    };
  };

  const kpis = getKPIs();

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
                Welcome back, {user?.name || "User"}! 👋
              </h1>
              <p className="dashboard-subtitle">
                {isAdmin 
                  ? "Complete overview of all projects, users, and financials"
                  : "Here's what's happening with your projects today"
                }
              </p>
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
              {!isAdmin && (
                <button
                  onClick={() => setShowBecomeAdmin(true)}
                  className="create-project-btn"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}
                >
                  <span className="btn-icon-wrapper">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </span>
                  <span className="btn-text">Become Admin</span>
                </button>
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

        {/* KPI Widgets */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-card-header">
              <div>
                <div className="kpi-card-title">Active Projects</div>
                <div className="kpi-card-value">{kpis.activeProjects}</div>
                <div className="kpi-card-change positive">
                  <span>↗</span>
                  <span>{projects.filter(p => p.status === "In Progress").length} in progress</span>
                </div>
              </div>
              <div className="kpi-card-icon">
                <span>📊</span>
              </div>
            </div>
          </div>

          {isAdmin && adminStats && (
            <div className="kpi-card">
              <div className="kpi-card-header">
                <div>
                  <div className="kpi-card-title">Total Users</div>
                  <div className="kpi-card-value">{adminStats.totalUsers}</div>
                  <div className="kpi-card-change positive">
                    <span>↗</span>
                    <span>{adminStats.activeUsers} active</span>
                  </div>
                </div>
                <div className="kpi-card-icon">
                  <span>👥</span>
                </div>
              </div>
            </div>
          )}

          <div className="kpi-card">
            <div className="kpi-card-header">
              <div>
                <div className="kpi-card-title">Hours Logged</div>
                <div className="kpi-card-value">{kpis.hoursLogged}</div>
                <div className="kpi-card-change positive">
                  <span>↗</span>
                  <span>Total hours</span>
                </div>
              </div>
              <div className="kpi-card-icon">
                <span>⏱️</span>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-card-header">
              <div>
                <div className="kpi-card-title">Revenue Earned</div>
                <div className="kpi-card-value">
                  {kpis.revenueEarned > 0 ? `₹${kpis.revenueEarned.toFixed(1)}k` : "₹0"}
                </div>
                <div className="kpi-card-change positive">
                  <span>↗</span>
                  <span>On track</span>
                </div>
              </div>
              <div className="kpi-card-icon">
                <span>💰</span>
              </div>
            </div>
          </div>

          {isAdmin && kpis.totalCost !== undefined && (
            <>
              <div className="kpi-card">
                <div className="kpi-card-header">
                  <div>
                    <div className="kpi-card-title">Total Cost</div>
                    <div className="kpi-card-value">
                      {kpis.totalCost > 0 ? `₹${kpis.totalCost.toFixed(1)}k` : "₹0"}
                    </div>
                    <div className="kpi-card-change negative">
                      <span>↘</span>
                      <span>Expenses</span>
                    </div>
                  </div>
                  <div className="kpi-card-icon">
                    <span>💸</span>
                  </div>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-card-header">
                  <div>
                    <div className="kpi-card-title">Net Profit</div>
                    <div className={`kpi-card-value ${kpis.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                      {kpis.totalProfit !== undefined 
                        ? `₹${Math.abs(kpis.totalProfit).toFixed(1)}k`
                        : "₹0"
                      }
                    </div>
                    <div className={`kpi-card-change ${kpis.totalProfit >= 0 ? 'positive' : 'negative'}`}>
                      <span>{kpis.totalProfit >= 0 ? '↗' : '↘'}</span>
                      <span>{kpis.totalProfit >= 0 ? 'Profitable' : 'Loss'}</span>
                    </div>
                  </div>
                  <div className="kpi-card-icon">
                    <span>📈</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {!isAdmin && (
            <div className="kpi-card">
              <div className="kpi-card-header">
                <div>
                  <div className="kpi-card-title">Delayed Tasks</div>
                  <div className="kpi-card-value">{kpis.delayedTasks}</div>
                  <div className="kpi-card-change negative">
                    <span>⚠</span>
                    <span>Needs attention</span>
                  </div>
                </div>
                <div className="kpi-card-icon">
                  <span>⏰</span>
                </div>
              </div>
            </div>
          )}
        </div>

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
          <div className="projects-header">
            <h2 className="projects-title">Projects</h2>
            <div className="filter-group">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`filter-btn ${activeFilter === filter ? "active" : ""}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="projects-grid">
            {filteredProjects.map((project) => (
              <div
                key={project._id || project.id}
                className="project-card"
                onClick={() => navigate(`/project/${project._id || project.id}`)}
              >
                {/* Project Image */}
                <div className="project-card-image">
                  <img 
                    src={DEFAULT_PROJECT_IMAGE} 
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
        {filteredProjects.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3 className="empty-state-title">No projects found</h3>
            <p className="empty-state-description">
              {activeFilter === "All" 
                ? "You don't have any projects yet. Create your first project to get started!"
                : `No projects match the "${activeFilter}" filter. Try selecting a different filter.`
              }
            </p>
            {activeFilter === "All" && (
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

        {/* Become Admin Modal */}
        {showBecomeAdmin && (
          <BecomeAdmin
            onClose={() => setShowBecomeAdmin(false)}
            onSuccess={() => {
              setShowBecomeAdmin(false);
              window.location.reload();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
