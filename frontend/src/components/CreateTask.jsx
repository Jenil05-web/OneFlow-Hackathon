import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { tasksAPI, projectsAPI, adminAPI } from '../services/api';
import TimesheetManagement from './TimesheetManagement';
import './CreateTask.css';

const CreateTask = ({ projectId: propProjectId, taskId: propTaskId, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // Get IDs from props, URL params, or location state
  const routeProjectId = params.projectId;
  const routeTaskId = params.taskId;
  const taskId = propTaskId || routeTaskId;
  const isEditMode = !!taskId;
  
  const [projectId, setProjectId] = useState(propProjectId || routeProjectId || location.state?.projectId || '');
  const [project, setProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    project: projectId || '',
    tags: [],
    dueDate: '',
    image: '',
    description: '',
    priority: 'Medium',
    estimatedHours: 0,
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState('description'); // 'description', 'timesheets', 'task-info'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchUsers();
    if (projectId) {
      fetchProject();
    }
    if (isEditMode) {
      fetchTask();
    } else if (projectId) {
      setFormData(prev => ({ ...prev, project: projectId }));
    }
  }, [projectId, taskId]);

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      const response = await projectsAPI.getById(projectId);
      if (response.data.success) {
        setProject(response.data.project);
      }
    } catch (err) {
      console.error('Error fetching project:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      if (response.data.success) {
        setProjects(response.data.projects || []);
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchTask = async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const response = await tasksAPI.getById(taskId);
      if (response.data.success) {
        const task = response.data.task;
        setFormData({
          title: task.title || '',
          assignedTo: task.assignedTo?._id || task.assignedTo || '',
          project: task.project?._id || task.project || '',
          tags: task.tags || [],
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
          image: task.image || '',
          description: task.description || '',
          priority: task.priority || 'Medium',
          estimatedHours: task.estimatedHours || 0,
        });
        setProjectId(task.project?._id || task.project || '');
        if (task.image) {
          setImagePreview(task.image);
        }
      }
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err.response?.data?.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'image') {
      setImagePreview(value || null);
    }
    if (name === 'project') {
      setProjectId(value);
      fetchProject();
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          image: result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title || !formData.project) {
      setError('Title and Project are required');
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title: formData.title,
        description: formData.description || '',
        project: formData.project,
        assignedTo: formData.assignedTo || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        dueDate: formData.dueDate || undefined,
        image: formData.image || undefined,
        priority: formData.priority,
        estimatedHours: formData.estimatedHours || 0,
      };

      let response;
      if (isEditMode) {
        response = await tasksAPI.update(taskId, taskData);
      } else {
        response = await tasksAPI.create(taskData);
      }

      if (response.data.success) {
        if (onSuccess) {
          onSuccess(response.data.task);
        }
        if (onClose) {
          onClose();
        } else {
          navigate(`/project/${formData.project}`);
        }
      } else {
        throw new Error(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} task`);
      }
    } catch (err) {
      console.error('Task save error:', err);
      setError(err.response?.data?.message || err.message || `Failed to ${isEditMode ? 'update' : 'create'} task`);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (onClose) {
      onClose();
    } else {
      navigate(-1);
    }
  };

  // Build breadcrumbs dynamically
  const getBreadcrumbs = () => {
    const crumbs = ['Projects'];
    if (project) {
      crumbs.push(project.name);
    }
    crumbs.push(isEditMode ? 'Edit Task' : 'New Task');
    return crumbs.join(' > ');
  };

  // Get task info for Task Info tab
  const getTaskInfo = () => {
    // This would be populated from the task data when editing
    return {
      createdBy: 'System',
      createdAt: new Date().toLocaleString(),
      lastModifiedBy: 'System',
      lastModifiedAt: new Date().toLocaleString(),
      totalWorkingHours: formData.estimatedHours || 0,
    };
  };

  const taskInfo = getTaskInfo();

  return (
    <div className="create-task-page">
      <div className="task-form-container">
        {/* Header with Breadcrumbs, Search, and Actions */}
        <div className="task-form-header">
          <div className="breadcrumbs">
            {getBreadcrumbs()}
          </div>
          <div className="header-actions">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="action-buttons">
              <button
                type="button"
                className="btn-discard"
                onClick={handleDiscard}
              >
                Discard
              </button>
              <button
                type="button"
                className="btn-save"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="task-form">
          {/* Task Title */}
          <div className="form-group">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Task Title"
              className="task-title-input"
              required
            />
          </div>

          {/* Task Fields Row */}
          <div className="task-fields-row">
            <div className="form-group">
              <label htmlFor="assignedTo">Assignee</label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
              >
                <option value="">Select assignee</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="project">Project</label>
              <select
                id="project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                required
                disabled={!!propProjectId} // Auto-set when from project view
              >
                <option value="">Select project</option>
                {projects.map(proj => (
                  <option key={proj._id} value={proj._id}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="tags">Tags</label>
              <div className="tags-input-container">
                <div className="tags-list">
                  {formData.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)}>×</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  placeholder="Type and press Enter to add tags"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Deadline</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="image">Image</label>
              <div className="image-upload-section">
                <div className="image-preview-container">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img 
                        src={imagePreview} 
                        alt="Task preview" 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => {
                          setImagePreview(null);
                          setFormData(prev => ({ ...prev, image: '' }));
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <span>📷</span>
                      <span>No image uploaded</span>
                    </div>
                  )}
                </div>
                <div className="image-upload-options">
                  <input
                    type="url"
                    id="imageUrl"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="Enter image URL"
                    className="image-url-input"
                  />
                  <label htmlFor="imageFile" className="upload-button-label">
                    <span className="upload-icon">📤</span>
                    <span>Upload Image</span>
                    <input
                      type="file"
                      id="imageFile"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <div className="task-tabs-section">
            <div className="task-tabs">
              <button
                type="button"
                className={`task-tab ${activeTab === 'description' ? 'active' : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button
                type="button"
                className={`task-tab ${activeTab === 'timesheets' ? 'active' : ''}`}
                onClick={() => setActiveTab('timesheets')}
                disabled={!isEditMode || !taskId}
              >
                Timesheets
              </button>
              <button
                type="button"
                className={`task-tab ${activeTab === 'task-info' ? 'active' : ''}`}
                onClick={() => setActiveTab('task-info')}
                disabled={!isEditMode}
              >
                Task Info
              </button>
            </div>

            <div className="task-tab-content">
              {activeTab === 'description' && (
                <div className="tab-panel">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter task description..."
                    rows="10"
                    className="description-textarea"
                  />
                </div>
              )}

              {activeTab === 'timesheets' && isEditMode && taskId && (
                <div className="tab-panel">
                  <TimesheetManagement 
                    projectId={formData.project} 
                    taskId={taskId}
                    onRefresh={() => {}}
                  />
                </div>
              )}

              {activeTab === 'task-info' && isEditMode && (
                <div className="tab-panel task-info-panel">
                  <div className="info-item">
                    <label>Created By:</label>
                    <span>{taskInfo.createdBy}</span>
                  </div>
                  <div className="info-item">
                    <label>Created At:</label>
                    <span>{taskInfo.createdAt}</span>
                  </div>
                  <div className="info-item">
                    <label>Last Modified By:</label>
                    <span>{taskInfo.lastModifiedBy}</span>
                  </div>
                  <div className="info-item">
                    <label>Last Modified At:</label>
                    <span>{taskInfo.lastModifiedAt}</span>
                  </div>
                  <div className="info-item">
                    <label>Total Working Hours:</label>
                    <span>{taskInfo.totalWorkingHours} hours</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTask;

