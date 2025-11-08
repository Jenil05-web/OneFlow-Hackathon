import React, { useState } from 'react';
import { projectsAPI } from '../services/api';
import './CreateProject.css';

const CreateProject = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    client: '',
    status: 'Planned',
    startDate: '',
    endDate: '',
    budget: 0,
    tags: [],
    image: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update image preview when image URL changes
    if (name === 'image') {
      setImagePreview(value || null);
    }
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // For file upload, we'll create a local preview
      // In a production app, you'd upload to a server first
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setImagePreview(result);
        setFormData(prev => ({
          ...prev,
          image: result // Store as data URL for now (or upload to server)
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
    setLoading(true);

    try {
      // Prepare data for API
      const projectData = {
        name: formData.name,
        code: formData.code || undefined,
        description: formData.description || '',
        client: formData.client || '',
        status: formData.status,
        startDate: formData.startDate || undefined,
        endDate: formData.endDate || undefined,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        image: formData.image || undefined,
      };

      const response = await projectsAPI.create(projectData);

      if (response.data.success) {
        onSuccess(response.data.project);
        onClose();
      } else {
        throw new Error(response.data.message || 'Failed to create project');
      }
    } catch (err) {
      console.error('Create project error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-project-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="create-project-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="close-button" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-project-form">
          <div className="form-group">
            <label htmlFor="name">Project Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter project name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">Project Code</label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Enter project code (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="client">Client Name</label>
            <input
              type="text"
              id="client"
              name="client"
              value={formData.client}
              onChange={handleChange}
              placeholder="Enter client name (optional)"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="budget">Budget</label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Image</label>
            <div className="image-upload-section">
              <div className="image-preview-container">
                {imagePreview ? (
                  <div className="image-preview">
                    <img 
                      src={imagePreview} 
                      alt="Project preview" 
                      onError={(e) => {
                        console.error('Image failed to load:', imagePreview);
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
                      aria-label="Remove image"
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
                  placeholder="Enter image URL (https://example.com/image.jpg)"
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

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter project description"
              rows="4"
            />
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

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject;
