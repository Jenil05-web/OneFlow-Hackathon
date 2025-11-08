import React, { useState } from "react";
import { adminAPI } from "../services/api";
import "./CreateUser.css";

const CreateUser = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Team",
    hourlyRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "hourlyRate" ? parseFloat(value) || 0 : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.email || !formData.name) {
      setError("Name and email are required");
      return;
    }

    setLoading(true);

    try {
      const response = await adminAPI.createUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        hourlyRate: formData.hourlyRate,
      });

      if (response.data.success) {
        onSuccess(response.data.user);
        onClose();
      } else {
        throw new Error(response.data.message || "Failed to create user");
      }
    } catch (err) {
      console.error("Create user error:", err);
      setError(err.response?.data?.message || err.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="create-user-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New User</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-user-form">
          <div className="form-group">
            <label htmlFor="name">Full Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address*</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role*</label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} required>
              <option value="Team">Team Member</option>
              <option value="Manager">Project Manager</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="hourlyRate">Hourly Rate (₹)</label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password*</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter password (min 6 characters)"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password*</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm password"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;

