import React, { useState } from "react";
import { Link } from "react-router-dom";
import { adminAPI } from "../services/api";
import "./AdminSettings.css";

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState("sales-orders");

  const tabs = [
    { id: "sales-orders", label: "Sales Orders", icon: "📋" },
    { id: "purchase-orders", label: "Purchase Orders", icon: "🛒" },
    { id: "invoices", label: "Customer Invoices", icon: "🧾" },
    { id: "vendor-bills", label: "Vendor Bills", icon: "💳" },
    { id: "expenses", label: "Expenses", icon: "💰" },
  ];

  return (
    <div className="admin-settings">
      <div className="admin-settings-container">
        <div className="settings-header">
          <div>
            <Link to="/admin" className="back-link">
              ← Back to Admin Dashboard
            </Link>
            <h1 className="settings-title">Global Settings</h1>
            <p className="settings-subtitle">
              Manage all Sales Orders, Purchase Orders, Invoices, Vendor Bills, and Expenses
            </p>
          </div>
        </div>

        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`settings-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          <div className="coming-soon">
            <div className="coming-soon-icon">🚧</div>
            <h2>Coming Soon</h2>
            <p>
              The {tabs.find(t => t.id === activeTab)?.label} management interface is under development.
              This will include search, filter, group by, and link to project functionality.
            </p>
            <Link to="/admin" className="btn btn-primary">
              Return to Admin Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;

