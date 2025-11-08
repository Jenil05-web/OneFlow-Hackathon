import { useState, useEffect } from "react";
import styled from "styled-components";
import ProjectCard from "../components/cards/ProjectCard";
import KpiWidget from "../components/cards/KpiWidget";
import StatusFilter from "../components/filters/StatusFilter";
import { dashboardAPI } from "../services/api";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [kpiData, setKpiData] = useState({
    activeProjects: 0,
    delayedTasks: 0,
    hoursLogged: 0,
    revenueEarned: 0,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setDashboardData(response.data);
      setProjects(response.data.projects); // Assuming the response contains projects data
      setFilteredProjects(response.data.projects); // Initialize filteredProjects
      calculateKpiData(response.data.projects); // Calculate KPI data
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKpiData = (projects) => {
    const activeProjects = projects.filter((project) => project.status === "active").length;
    const delayedTasks = projects.filter((project) => project.status === "delayed").length;
    const hoursLogged = projects.reduce((total, project) => total + project.hoursLogged, 0);
    const revenueEarned = projects.reduce((total, project) => total + project.revenue, 0);

    setKpiData({
      activeProjects,
      delayedTasks,
      hoursLogged,
      revenueEarned,
    });
  };

  const handleFilterChange = (status) => {
    setActiveFilter(status);
    if (status === "all") {
      setFilteredProjects(projects);
    } else {
      setFilteredProjects(projects.filter((project) => project.status === status));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <DashboardContainer>
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}! 🎉</h1>
        <p>You've successfully logged in to your dashboard</p>
      </div>

      <KpiSection>
        <KpiWidget title="Active Projects" value={kpiData.activeProjects} icon="project" />
        <KpiWidget title="Delayed Tasks" value={kpiData.delayedTasks} icon="warning" />
        <KpiWidget title="Hours Logged" value={kpiData.hoursLogged} icon="clock" />
        <KpiWidget title="Revenue Earned" value={kpiData.revenueEarned} icon="dollar" />
      </KpiSection>

      <FilterSection>
        <StatusFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />
      </FilterSection>

      <ProjectsGrid>
        {filteredProjects.map((project) => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </ProjectsGrid>
    </DashboardContainer>
  );
};

const DashboardContainer = styled.div`
  padding: 2rem;
`;

const KpiSection = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const FilterSection = styled.div`
  margin-bottom: 2rem;
`;

const ProjectsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

export default Dashboard;
