import React, { useState } from 'react';
import { billingAPI } from '../../services/api';
import './DocumentModal.css';

const CreateExpense = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    expensePeriod: '',
    project: projectId || '',
    image: '',
    description: '',
    category: 'Miscellaneous',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    attachment: '',
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
    if (name === 'image') {
      setImagePreview(value || null);
    }
    setError('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || formData.amount <= 0) {
      setError('Name and amount (> 0) are required');
      return;
    }

    setLoading(true);

    try {
      const response = await billingAPI.createExpense({
        title: formData.name, // Using name as title for API
        description: formData.description,
        category: formData.category,
        amount: formData.amount,
        date: formData.date,
        project: formData.project || projectId,
        attachment: formData.image || formData.attachment || undefined,
      });

      if (response.data.success) {
        onSuccess(response.data.expense);
      } else {
        throw new Error(response.data.message || 'Failed to submit expense');
      }
    } catch (err) {
      console.error('Create expense error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit expense');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Travel',
    'Accommodation',
    'Meals',
    'Supplies',
    'Software',
    'Transportation',
    'Miscellaneous',
  ];

  return (
    <div className="document-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="document-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header with Action Buttons */}
        <div className="document-header-actions">
          <button type="button" className="btn-confirm" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Confirm'}
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div className="modal-header">
          <h2>Expense</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="document-form">
          <div className="form-group">
            <label htmlFor="name">Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Expense name"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="expensePeriod">Expense Period</label>
              <input
                type="text"
                id="expensePeriod"
                name="expensePeriod"
                value={formData.expensePeriod}
                onChange={handleChange}
                placeholder="e.g., January 2025"
              />
            </div>
            <div className="form-group">
              <label htmlFor="project">Project*</label>
              <input
                type="text"
                id="project"
                name="project"
                value={formData.project || projectId || ''}
                onChange={handleChange}
                required
                placeholder="Project"
                disabled={!!projectId}
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
                      alt="Expense preview" 
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

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Expense description"
              rows="4"
            />
          </div>

          {/* Additional fields for API (required but can be collapsed) */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="amount">Amount (₹)*</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpense;

