import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import "./BecomeAdmin.css";

const BecomeAdmin = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleBecomeAdmin = async () => {
    if (!window.confirm("Are you sure you want to become an Admin? This is for development purposes only.")) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await authAPI.updateRole("Admin");
      if (response.data.success) {
        // Update localStorage with new token and user data
        const newToken = response.data.token;
        const newUser = response.data.user;
        
        console.log("✅ Role updated successfully:", newUser);
        console.log("✅ New token received");
        
        // Clear old data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Set new data
        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(newUser));
        
        // Verify the update
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const storedToken = localStorage.getItem("token");
        
        if (storedUser?.role === "Admin" && storedToken) {
          console.log("✅ Token and user data verified in localStorage");
          // Show success message
          alert("Role updated to Admin! Refreshing page...");
          
          // Refresh the page to show admin features
          window.location.reload();
        } else {
          throw new Error("Failed to verify role update in localStorage");
        }
      } else {
        throw new Error(response.data.message || "Failed to update role");
      }
    } catch (err) {
      console.error("❌ Failed to update role:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to update role. Please try logging out and logging back in.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="become-admin-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="become-admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Become Admin</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="become-admin-content">
          <div className="info-box">
            <h3>⚠️ Development Mode</h3>
            <p>This feature is for development purposes only. In production, only existing Admins can change user roles.</p>
          </div>

          <div className="admin-credentials">
            <h3>Alternative: Use Default Admin Account</h3>
            <div className="credentials-box">
              <p><strong>Email:</strong> admin@gmail.com</p>
              <p><strong>Password:</strong> admin1234</p>
            </div>
            <button
              className="btn btn-secondary"
              onClick={() => {
                onClose();
                navigate("/login");
              }}
            >
              Go to Login
            </button>
          </div>

          <div className="action-section">
            <button
              className="btn btn-primary"
              onClick={handleBecomeAdmin}
              disabled={loading}
            >
              {loading ? "Updating..." : "Make Me Admin"}
            </button>
            <button
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeAdmin;

