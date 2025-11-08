import React, { useState } from 'react';
import { billingAPI } from '../../services/api';
import './DocumentModal.css';

const CreateInvoice = ({ projectId, salesOrders = [], onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientAddress: '',
    salesOrder: '',
    lines: [{ description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 0,
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: '',
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

  const handleSalesOrderChange = (e) => {
    const soId = e.target.value;
    if (soId) {
      const selectedSO = salesOrders.find(so => so._id === soId);
      if (selectedSO) {
        setFormData(prev => ({
          ...prev,
          salesOrder: soId,
          clientName: selectedSO.partnerName || prev.clientName,
          clientEmail: selectedSO.partnerEmail || prev.clientEmail,
          lines: selectedSO.lines && selectedSO.lines.length > 0
            ? selectedSO.lines.map(line => ({
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                amount: line.amount || (line.quantity * line.unitPrice),
              }))
            : prev.lines,
          taxRate: selectedSO.taxRate || prev.taxRate,
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, salesOrder: '' }));
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

    if (!formData.clientName) {
      setError('Client name is required');
      return;
    }

    if (formData.lines.some(line => !line.description || line.quantity <= 0 || line.unitPrice <= 0)) {
      setError('All line items must have description, quantity > 0, and unit price > 0');
      return;
    }

    setLoading(true);

    try {
      const response = await billingAPI.createInvoice({
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientAddress: formData.clientAddress,
        project: projectId,
        salesOrder: formData.salesOrder || undefined,
        lines: formData.lines.map(line => ({
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        taxRate: formData.taxRate,
        invoiceDate: formData.invoiceDate,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
      });

      if (response.data.success) {
        onSuccess(response.data.invoice);
      } else {
        throw new Error(response.data.message || 'Failed to create invoice');
      }
    } catch (err) {
      console.error('Create invoice error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="document-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="document-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Customer Invoice</h2>
          <button className="close-button" onClick={onClose} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="document-form">
          {salesOrders.length > 0 && (
            <div className="form-group">
              <label htmlFor="salesOrder">Link to Sales Order (Optional)</label>
              <select
                id="salesOrder"
                name="salesOrder"
                value={formData.salesOrder}
                onChange={handleSalesOrderChange}
              >
                <option value="">None</option>
                {salesOrders.map(so => (
                  <option key={so._id} value={so._id}>
                    {so.number || so._id} - {so.partnerName} (₹{so.total?.toLocaleString('en-IN') || 0})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="clientName">Client Name*</label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                value={formData.clientName}
                onChange={handleChange}
                required
                placeholder="Client/Customer name"
              />
            </div>
            <div className="form-group">
              <label htmlFor="clientEmail">Client Email</label>
              <input
                type="email"
                id="clientEmail"
                name="clientEmail"
                value={formData.clientEmail}
                onChange={handleChange}
                placeholder="client@example.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="clientAddress">Client Address</label>
            <textarea
              id="clientAddress"
              name="clientAddress"
              value={formData.clientAddress}
              onChange={handleChange}
              placeholder="Client address"
              rows="2"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="invoiceDate">Invoice Date*</label>
              <input
                type="date"
                id="invoiceDate"
                name="invoiceDate"
                value={formData.invoiceDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
              />
            </div>
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
                <option value="Sent">Sent</option>
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
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoice;

