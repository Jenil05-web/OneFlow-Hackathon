import React, { useState, useEffect } from 'react';
import { timesheetsAPI, projectsAPI, tasksAPI } from '../services/api';
import CreateTimesheet from './timesheets/CreateTimesheet';
import './TimesheetManagement.css';

const TimesheetManagement = ({ projectId, onRefresh }) => {
  const [timesheets, setTimesheets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterProject, setFilterProject] = useState(projectId || '');
  const [filterTask, setFilterTask] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'approved', 'pending', 'rejected'
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManagerOrAdmin = user.role === 'Manager' || user.role === 'Admin';

  useEffect(() => {
    fetchTimesheets();
    if (!projectId) {
      fetchProjects();
    }
  }, [projectId, filterProject, filterTask, filterStatus]);

  useEffect(() => {
    if (filterProject) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [filterProject]);

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      if (response.data.success) {
        setProjects(response.data.projects || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasks = async () => {
    if (!filterProject) return;
    try {
      const response = await tasksAPI.getByProject(filterProject);
      if (response.data.success) {
        setTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchTimesheets = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterProject) params.project = filterProject;
      if (filterTask) params.task = filterTask;

      const response = await timesheetsAPI.getAll(params);
      if (response.data.success) {
        let filtered = response.data.timesheets || [];

        // Apply status filter
        if (filterStatus === 'approved') {
          filtered = filtered.filter(t => t.approved === true);
        } else if (filterStatus === 'pending') {
          filtered = filtered.filter(t => t.approved === false);
        }

        setTimesheets(filtered);
      }
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimesheetCreated = () => {
    setShowCreateModal(false);
    fetchTimesheets();
    if (onRefresh) onRefresh();
  };

  const handleApprove = async (timesheetId, approved) => {
    try {
      await timesheetsAPI.updateStatus(timesheetId, approved);
      fetchTimesheets();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error approving timesheet:', error);
      alert('Failed to update timesheet status');
    }
  };

  const handleDelete = async (timesheetId) => {
    if (!window.confirm('Are you sure you want to delete this timesheet?')) return;

    try {
      await timesheetsAPI.delete(timesheetId);
      fetchTimesheets();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      alert('Failed to delete timesheet');
    }
  };

  const totalHours = timesheets.reduce((sum, t) => sum + (t.hours || 0), 0);
  const totalCost = timesheets.reduce((sum, t) => sum + (t.cost || 0), 0);
  const billableHours = timesheets.filter(t => t.billable).reduce((sum, t) => sum + (t.hours || 0), 0);
  const nonBillableHours = totalHours - billableHours;

  return (
    <div className="timesheet-management">
      <div className="timesheet-header">
        <div className="header-left">
          <h2>Timesheets</h2>
          <div className="timesheet-stats">
            <div className="stat-item">
              <span className="stat-label">Total Hours:</span>
              <span className="stat-value">{totalHours.toFixed(1)}h</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Billable:</span>
              <span className="stat-value billable">{billableHours.toFixed(1)}h</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Non-Billable:</span>
              <span className="stat-value non-billable">{nonBillableHours.toFixed(1)}h</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Cost:</span>
              <span className="stat-value cost">₹{totalCost.toFixed(2)}</span>
            </div>
          </div>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
          <span>+</span> Log Time
        </button>
      </div>

      <div className="timesheet-filters">
        {!projectId && (
          <div className="filter-group">
            <label>Project</label>
            <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)}>
              <option value="">All Projects</option>
              {projects.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}
        {filterProject && (
          <div className="filter-group">
            <label>Task</label>
            <select value={filterTask} onChange={(e) => setFilterTask(e.target.value)}>
              <option value="">All Tasks</option>
              {tasks.map(t => (
                <option key={t._id} value={t._id}>{t.title}</option>
              ))}
            </select>
          </div>
        )}
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading timesheets...</p>
        </div>
      ) : timesheets.length === 0 ? (
        <div className="empty-state">
          <p>No timesheets found. Log your first time entry to get started.</p>
        </div>
      ) : (
        <div className="timesheet-table-container">
          <table className="timesheet-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Project</th>
                <th>Task</th>
                <th>User</th>
                <th>Hours</th>
                <th>Rate</th>
                <th>Cost</th>
                <th>Billable</th>
                <th>Status</th>
                {isManagerOrAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {timesheets.map((timesheet) => (
                <tr key={timesheet._id}>
                  <td>{new Date(timesheet.date).toLocaleDateString()}</td>
                  <td>{timesheet.project?.name || 'N/A'}</td>
                  <td>{timesheet.task?.title || 'General'}</td>
                  <td>{timesheet.user?.name || 'N/A'}</td>
                  <td>{timesheet.hours?.toFixed(1) || 0}h</td>
                  <td>₹{timesheet.hourlyRate?.toFixed(2) || 0}</td>
                  <td>₹{timesheet.cost?.toFixed(2) || 0}</td>
                  <td>
                    <span className={`billable-badge ${timesheet.billable ? 'yes' : 'no'}`}>
                      {timesheet.billable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${timesheet.approved ? 'approved' : 'pending'}`}>
                      {timesheet.approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  {isManagerOrAdmin && (
                    <td>
                      <div className="action-buttons">
                        {!timesheet.approved && (
                          <button
                            className="btn-approve"
                            onClick={() => handleApprove(timesheet._id, true)}
                            title="Approve"
                          >
                            ✓
                          </button>
                        )}
                        {timesheet.approved && (
                          <button
                            className="btn-reject"
                            onClick={() => handleApprove(timesheet._id, false)}
                            title="Reject"
                          >
                            ✗
                          </button>
                        )}
                        {user.role === 'Admin' && (
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(timesheet._id)}
                            title="Delete"
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreateModal && (
        <CreateTimesheet
          projectId={filterProject || projectId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleTimesheetCreated}
        />
      )}
    </div>
  );
};

export default TimesheetManagement;

