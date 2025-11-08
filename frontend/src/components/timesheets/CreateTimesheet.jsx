import React, { useState, useEffect } from 'react';
import { timesheetsAPI, projectsAPI, tasksAPI } from '../../services/api';
import '../documents/DocumentModal.css';

const CreateTimesheet = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    project: projectId || '',
    task: '',
    hours: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    billable: true,
  });
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) {
      fetchProjects();
    }
  }, [projectId]);

  useEffect(() => {
    if (formData.project) {
      fetchTasks();
    } else {
      setTasks([]);
    }
  }, [formData.project]);

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
    if (!formData.project) return;
    try {
      const response = await tasksAPI.getByProject(formData.project);
      if (response.data.success) {
        setTasks(response.data.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value),
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.project || !formData.hours || formData.hours <= 0 || !formData.date) {
      setError('Project, hours (> 0), and date are required');
      return;
    }

    setLoading(true);

    try {
      const response = await timesheetsAPI.create({
        project: formData.project,
        task: formData.task || undefined,
        hours: formData.hours,
        date: formData.date,
        description: formData.description,
        billable: formData.billable,
      });

      if (response.data.success) {
        onSuccess(response.data.timesheet);
      } else {
        throw new Error(response.data.message || 'Failed to log timesheet');
      }
    } catch (err) {
      console.error('Create timesheet error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to log timesheet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="document-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Log Time</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="document-form">
          {!projectId && (
            <div className="form-group">
              <label htmlFor="project">Project*</label>
              <select
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
              >
                <option value="">Select a project</option>
                {projects.map(p => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}

          {formData.project && (
            <div className="form-group">
              <label htmlFor="task">Task (Optional)</label>
              <select
                id="task"
                name="task"
                value={formData.task}
                onChange={handleChange}
              >
                <option value="">General / No specific task</option>
                {tasks.map(t => (
                  <option key={t._id} value={t._id}>{t.title}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Date*</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="hours">Hours*</label>
              <input
                type="number"
                id="hours"
                name="hours"
                value={formData.hours}
                onChange={handleChange}
                required
                min="0"
                step="0.25"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What did you work on?"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="billable"
                checked={formData.billable}
                onChange={handleChange}
              />
              <span>Billable to client</span>
            </label>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Logging...' : 'Log Time'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTimesheet;

