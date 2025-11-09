import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../services/api";
import CreateUser from "../components/CreateUser";
import CreateProject from "../components/CreateProject";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all", "managers", "team"
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "Team",
    hourlyRate: 0,
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers();
      setUsers(response.data.users);
      setError("");
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user._id);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role,
      hourlyRate: user.hourlyRate || 0,
    });
  };

  const handleSave = async (userId) => {
    try {
      await adminAPI.updateUser(userId, editForm);
      await fetchUsers();
      setEditingUser(null);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminAPI.deleteUser(userId);
      await fetchUsers();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleUserCreated = () => {
    fetchUsers();
  };

  const handleProjectCreated = () => {
    // Project created successfully
    setShowCreateProject(false);
  };

  // Filter users based on active tab
  const filteredUsers = users.filter((user) => {
    if (activeTab === "managers") return user.role === "Manager";
    if (activeTab === "team") return user.role === "Team";
    return true; // "all"
  });

  const managersCount = users.filter((u) => u.role === "Manager").length;
  const teamCount = users.filter((u) => u.role === "Team").length;
  const adminCount = users.filter((u) => u.role === "Admin").length;

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "Admin":
        return "role-badge admin";
      case "Manager":
        return "role-badge manager";
      default:
        return "role-badge team";
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Manage users and roles</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Statistics Cards */}
        <div className="admin-stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-primary">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{managersCount}</div>
              <div className="stat-label">Managers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-success">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{teamCount}</div>
              <div className="stat-label">Team Members</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon stat-icon-warning">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div className="stat-content">
              <div className="stat-value">{adminCount}</div>
              <div className="stat-label">Administrators</div>
            </div>
          </div>
        </div>

        <div className="admin-actions">
          <button
            onClick={() => setShowCreateUser(true)}
            className="btn btn-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create User
          </button>
          <button
            onClick={() => setShowCreateProject(true)}
            className="btn btn-primary"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create Project
          </button>
        </div>

        <div className="users-section">
          <div className="section-header">
            <h2>User Management</h2>
            <div className="users-count">
              Total: {users.length} users ({managersCount} Managers, {teamCount} Team)
            </div>
          </div>

          {/* Role Filter Tabs */}
          <div className="role-tabs">
            <button
              className={`tab-button ${activeTab === "all" ? "active" : ""}`}
              onClick={() => setActiveTab("all")}
            >
              All Users ({users.length})
            </button>
            <button
              className={`tab-button ${activeTab === "managers" ? "active" : ""}`}
              onClick={() => setActiveTab("managers")}
            >
              Managers ({managersCount})
            </button>
            <button
              className={`tab-button ${activeTab === "team" ? "active" : ""}`}
              onClick={() => setActiveTab("team")}
            >
              Team Members ({teamCount})
            </button>
          </div>

          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Hourly Rate</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      {editingUser === user._id ? (
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="form-input-small"
                        />
                      ) : (
                        <strong>{user.name}</strong>
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="form-input-small"
                        />
                      ) : (
                        user.email
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <select
                          value={editForm.role}
                          onChange={(e) =>
                            setEditForm({ ...editForm, role: e.target.value })
                          }
                          className="form-select-small"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Manager">Manager</option>
                          <option value="Team">Team</option>
                        </select>
                      ) : (
                        <span className={getRoleBadgeClass(user.role)}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <div className="hourly-rate-input">
                          <span className="currency">₹</span>
                          <input
                            type="number"
                            value={editForm.hourlyRate}
                            onChange={(e) =>
                              setEditForm({ ...editForm, hourlyRate: parseFloat(e.target.value) || 0 })
                            }
                            className="form-input-small"
                            style={{ width: '100px' }}
                            min="0"
                            step="0.01"
                          />
                          <span className="unit">/hr</span>
                        </div>
                      ) : (
                        <div className="hourly-rate-display">
                          <span className="currency">₹</span>
                          <span className="rate-value">{user.hourlyRate || 0}</span>
                          <span className="rate-unit">/hr</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <div className="action-buttons">
                          <button
                            className="btn-icon save"
                            onClick={() => handleSave(user._id)}
                            title="Save"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </button>
                          <button
                            className="btn-icon cancel"
                            onClick={() => setEditingUser(null)}
                            title="Cancel"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            className="btn-icon edit"
                            onClick={() => handleEdit(user)}
                            title="Edit"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                          {user.role !== "Admin" && (
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDelete(user._id)}
                              title="Delete"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateUser && (
        <CreateUser
          onClose={() => setShowCreateUser(false)}
          onSuccess={handleUserCreated}
        />
      )}

      {/* Create Project Modal */}
      {showCreateProject && (
        <CreateProject
          onClose={() => setShowCreateProject(false)}
          onSuccess={handleProjectCreated}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

