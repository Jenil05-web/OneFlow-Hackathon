import { useState, useEffect } from "react";
import { dashboardAPI } from "../services/api";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
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
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name}! 🎉</h1>
          <p>You've successfully logged in to your dashboard</p>
        </div>

        <div className="dashboard-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">👤</div>
              <div className="stat-info">
                <h3>Full Name</h3>
                <p>{user?.name}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">📧</div>
              <div className="stat-info">
                <h3>Email</h3>
                <p>{user?.email}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>Status</h3>
                <p
                  className={
                    user?.isVerified ? "status-verified" : "status-unverified"
                  }
                >
                  {user?.isVerified ? "Verified" : "Unverified"}
                </p>
              </div>
            </div>
          </div>

          <div className="card quick-start">
            <h2>🚀 Quick Start Guide</h2>
            <ul className="check-list">
              <li className="check-item">
                <span className="check-mark">✓</span>
                Your account has been successfully created and verified
              </li>
              <li className="check-item">
                <span className="check-mark">✓</span>
                You're now logged in and can access protected routes
              </li>
              <li className="check-item">
                <span className="arrow-mark">→</span>
                Start building your hackathon project by integrating this auth
                system
              </li>
            </ul>
          </div>

          {dashboardData && (
            <div className="api-response-card">
              <strong>Protected Route Response:</strong> {dashboardData.message}
            </div>
          )}

          <div className="info-grid">
            <div className="card">
              <h3>📚 Features</h3>
              <ul className="feature-list">
                <li>JWT-based authentication</li>
                <li>Email OTP verification</li>
                <li>Password reset functionality</li>
                <li>Protected routes</li>
                <li>Modern UI with CSS</li>
              </ul>
            </div>

            <div className="card">
              <h3>🛠️ Tech Stack</h3>
              <ul className="feature-list">
                <li>Node.js + Express</li>
                <li>MongoDB + Mongoose</li>
                <li>React.js + Vite</li>
                <li>Vanilla CSS</li>
                <li>Axios for API calls</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
