import React, { useState } from 'react';
import { billingAPI } from '../../services/api';
import './DocumentModal.css';

const CreateExpense = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Miscellaneous',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    attachment: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || formData.amount <= 0) {
      setError('Title and amount (> 0) are required');
      return;
    }

    setLoading(true);

    try {
      const response = await billingAPI.createExpense({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        amount: formData.amount,
        date: formData.date,
        project: projectId,
        attachment: formData.attachment || undefined,
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
        <div className="modal-header">
          <h2>Submit Expense</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="document-form">
          <div className="form-group">
            <label htmlFor="title">Expense Title*</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Client travel expense"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Additional details about the expense"
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category*</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
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
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="date">Expense Date*</label>
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
              <label htmlFor="attachment">Receipt URL (Optional)</label>
              <input
                type="url"
                id="attachment"
                name="attachment"
                value={formData.attachment}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExpense;

