import React, { useState } from 'react';
import { billingAPI } from '../../services/api';
import './DocumentModal.css';

const CreatePurchaseOrder = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    lines: [{ description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 0,
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    status: 'Draft',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'taxRate' ? parseFloat(value) || 0 : value,
    }));
    setError('');
  };

  const handleLineChange = (index, field, value) => {
    const newLines = [...formData.lines];
    newLines[index][field] = field === 'quantity' || field === 'unitPrice' 
      ? parseFloat(value) || 0 
      : value;
    newLines[index].amount = newLines[index].quantity * newLines[index].unitPrice;
    setFormData(prev => ({ ...prev, lines: newLines }));
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { description: '', quantity: 1, unitPrice: 0, amount: 0 }],
    }));
  };

  const removeLine = (index) => {
    if (formData.lines.length > 1) {
      setFormData(prev => ({
        ...prev,
        lines: prev.lines.filter((_, i) => i !== index),
      }));
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.lines.reduce((sum, line) => sum + (line.amount || 0), 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.vendorName) {
      setError('Vendor name is required');
      return;
    }

    if (formData.lines.some(line => !line.description || line.quantity <= 0 || line.unitPrice <= 0)) {
      setError('All line items must have description, quantity > 0, and unit price > 0');
      return;
    }

    setLoading(true);

    try {
      const response = await billingAPI.createPurchaseOrder({
        vendorName: formData.vendorName,
        vendorEmail: formData.vendorEmail,
        vendorPhone: formData.vendorPhone,
        project: projectId,
        lines: formData.lines.map(line => ({
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        taxRate: formData.taxRate,
        orderDate: formData.orderDate,
        deliveryDate: formData.deliveryDate || undefined,
        status: formData.status,
      });

      if (response.data.success) {
        onSuccess(response.data.purchaseOrder);
      } else {
        throw new Error(response.data.message || 'Failed to create purchase order');
      }
    } catch (err) {
      console.error('Create purchase order error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create purchase order');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="document-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="document-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Purchase Order</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="document-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vendorName">Vendor Name*</label>
              <input
                type="text"
                id="vendorName"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                required
                placeholder="Vendor/Supplier name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="vendorEmail">Vendor Email</label>
              <input
                type="email"
                id="vendorEmail"
                name="vendorEmail"
                value={formData.vendorEmail}
                onChange={handleChange}
                placeholder="vendor@example.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vendorPhone">Vendor Phone</label>
              <input
                type="tel"
                id="vendorPhone"
                name="vendorPhone"
                value={formData.vendorPhone}
                onChange={handleChange}
                placeholder="+91 1234567890"
              />
            </div>
            <div className="form-group">
              <label htmlFor="orderDate">Order Date*</label>
              <input
                type="date"
                id="orderDate"
                name="orderDate"
                value={formData.orderDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="deliveryDate">Delivery Date</label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Line Items*</label>
            <div className="line-items">
              {formData.lines.map((line, index) => (
                <div key={index} className="line-item">
                  <input
                    type="text"
                    placeholder="Description"
                    value={line.description}
                    onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                    className="line-description"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={line.quantity}
                    onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                    className="line-quantity"
                    min="1"
                    step="1"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Unit Price"
                    value={line.unitPrice}
                    onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)}
                    className="line-price"
                    min="0"
                    step="0.01"
                    required
                  />
                  <div className="line-amount">₹{(line.amount || 0).toFixed(2)}</div>
                  {formData.lines.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLine(index)}
                      className="remove-line-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addLine} className="add-line-btn">
                + Add Line Item
              </button>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="taxRate">Tax Rate (%)</label>
              <input
                type="number"
                id="taxRate"
                name="taxRate"
                value={formData.taxRate}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                placeholder="0"
              />
            </div>
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Approved">Approved</option>
              </select>
            </div>
          </div>

          <div className="totals-section">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Tax ({formData.taxRate}%):</span>
              <span>₹{taxAmount.toFixed(2)}</span>
            </div>
            <div className="total-row total">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseOrder;

