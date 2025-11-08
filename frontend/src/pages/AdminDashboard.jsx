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
    isActive: true,
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
      isActive: user.isActive !== undefined ? user.isActive : true,
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

  const handleUpdateHourlyRate = async (userId, hourlyRate) => {
    try {
      await adminAPI.updateUserHourlyRate(userId, hourlyRate);
      await fetchUsers();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update hourly rate");
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
          <p className="admin-subtitle">Manage users, roles, and hourly rates</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

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
          <Link to="/admin/settings" className="btn btn-secondary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v6m0 6v6M5.64 5.64l4.24 4.24m4.24 4.24l4.24 4.24M1 12h6m6 0h6M5.64 18.36l4.24-4.24m4.24-4.24l4.24-4.24" />
            </svg>
            Global Settings
          </Link>
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
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className={!user.isActive ? "inactive" : ""}>
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
                              setEditForm({
                                ...editForm,
                                hourlyRate: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="form-input-small"
                            min="0"
                            step="0.01"
                          />
                          <span className="unit">/hour</span>
                        </div>
                      ) : (
                        <div className="hourly-rate-display">
                          <span className="rate-value">₹{user.hourlyRate || 0}</span>
                          <span className="rate-unit">/hour</span>
                          <button
                            className="btn-icon"
                            onClick={() => {
                              const newRate = prompt(
                                `Enter new hourly rate for ${user.name}:`,
                                user.hourlyRate || 0
                              );
                              if (newRate !== null) {
                                handleUpdateHourlyRate(user._id, parseFloat(newRate) || 0);
                              }
                            }}
                            title="Update hourly rate"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                    </td>
                    <td>
                      {editingUser === user._id ? (
                        <label className="toggle-switch">
                          <input
                            type="checkbox"
                            checked={editForm.isActive}
                            onChange={(e) =>
                              setEditForm({ ...editForm, isActive: e.target.checked })
                            }
                          />
                          <span className="toggle-slider"></span>
                        </label>
                      ) : (
                        <span
                          className={`status-badge ${user.isActive ? "active" : "inactive"}`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
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
                            ✓
                          </button>
                          <button
                            className="btn-icon cancel"
                            onClick={() => setEditingUser(null)}
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            className="btn-icon edit"
                            onClick={() => handleEdit(user)}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          {user.role !== "Admin" && (
                            <button
                              className="btn-icon delete"
                              onClick={() => handleDelete(user._id)}
                              title="Delete"
                            >
                              🗑️
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

