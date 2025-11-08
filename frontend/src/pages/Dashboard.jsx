import { useState, useEffect } from "react";
import { dashboardAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  // Mock projects data (replace with API data when available)
  const [projects] = useState([
    { id: 1, title: 'Project Alpha', status: 'In Progress', progress: 75, dueDate: '2025-12-15', team: 5, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=500&auto=format&fit=crop' },
    { id: 2, title: 'Project Beta', status: 'Planned', progress: 0, dueDate: '2025-11-20', team: 3, image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=500&auto=format&fit=crop' },
    { id: 3, title: 'Project Gamma', status: 'Completed', progress: 100, dueDate: '2025-10-30', team: 8, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=500&auto=format&fit=crop' },
    { id: 4, title: 'Project Delta', status: 'In Progress', progress: 45, dueDate: '2025-11-25', team: 6, image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=500&auto=format&fit=crop' },
    { id: 5, title: 'Project Epsilon', status: 'On Hold', progress: 30, dueDate: '2025-12-01', team: 4, image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=500&auto=format&fit=crop' },
    { id: 6, title: 'Project Zeta', status: 'In Progress', progress: 60, dueDate: '2025-11-18', team: 7, image: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=500&auto=format&fit=crop' },
  ]);

  const filters = ["All", "Planned", "In Progress", "Completed", "On Hold"];

  useEffect(() => {
    // Check for authentication
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No token found");
      }

      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Handle unauthorized access
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on active filter
  const filteredProjects = activeFilter === "All" 
    ? projects 
    : projects.filter(project => project.status === activeFilter);

  // Calculate KPIs
  const activeProjects = projects.filter(p => p.status === "In Progress").length;
  const delayedTasks = 3; // This should come from your API
  const hoursLogged = 128; // This should come from your API
  const revenueEarned = 12.5; // This should come from your API

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your projects today
          </p>
        </div>

        {/* KPI Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Active Projects</p>
                <h3 className="text-3xl font-bold text-gray-900">{activeProjects}</h3>
                <p className="text-xs text-green-600 mt-2">↗ 2 more than last week</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Delayed Tasks</p>
                <h3 className="text-3xl font-bold text-gray-900">{delayedTasks}</h3>
                <p className="text-xs text-red-600 mt-2">⚠ Needs attention</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <span className="text-2xl">⏰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Hours Logged</p>
                <h3 className="text-3xl font-bold text-gray-900">{hoursLogged}</h3>
                <p className="text-xs text-green-600 mt-2">↗ 12% increase</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <span className="text-2xl">⏱️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Revenue Earned</p>
                <h3 className="text-3xl font-bold text-gray-900">${revenueEarned}k</h3>
                <p className="text-xs text-green-600 mt-2">↗ On track</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    activeFilter === filter
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            >
              {/* Project Image */}
              <div className="w-full h-48 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="p-6">
                {/* Project Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {project.title}
                  </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    project.status === "In Progress"
                      ? "bg-blue-100 text-blue-700"
                      : project.status === "Completed"
                      ? "bg-green-100 text-green-700"
                      : project.status === "Planned"
                      ? "bg-gray-100 text-gray-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {project.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-gray-900">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      project.status === "Completed"
                        ? "bg-green-500"
                        : project.status === "In Progress"
                        ? "bg-blue-500"
                        : project.status === "On Hold"
                        ? "bg-yellow-500"
                        : "bg-gray-400"
                    }`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Project Details */}
              <div className="flex items-center justify-between text-sm text-gray-600 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <span>📅</span>
                  <span>{project.dueDate}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>👥</span>
                  <span>{project.team} members</span>
                </div>
              </div>
            </div>
          </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">
              No projects match the selected filter. Try selecting a different filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;