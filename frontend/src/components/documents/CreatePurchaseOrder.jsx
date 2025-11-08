import React, { useState } from 'react';
import { billingAPI } from '../../services/api';
import './DocumentModal.css';

const CreatePurchaseOrder = ({ projectId, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    orderNumber: '', // Will be auto-generated
    vendorName: '',
    vendorEmail: '',
    vendorPhone: '',
    project: projectId || '',
    lines: [{ product: '', quantity: 1, unit: 'Unit', unitPrice: 0, taxRate: 0, amount: 0 }],
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
    if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
      newLines[index][field] = parseFloat(value) || 0;
    } else {
      newLines[index][field] = value;
    }
    // Calculate amount with tax
    const qty = newLines[index].quantity || 0;
    const price = newLines[index].unitPrice || 0;
    const tax = newLines[index].taxRate || 0;
    const subtotal = qty * price;
    newLines[index].amount = subtotal + (subtotal * tax / 100);
    setFormData(prev => ({ ...prev, lines: newLines }));
  };

  const addLine = () => {
    setFormData(prev => ({
      ...prev,
      lines: [...prev.lines, { product: '', quantity: 1, unit: 'Unit', unitPrice: 0, taxRate: 0, amount: 0 }],
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
    const untaxedAmount = formData.lines.reduce((sum, line) => {
      const qty = line.quantity || 0;
      const price = line.unitPrice || 0;
      return sum + (qty * price);
    }, 0);
    const total = formData.lines.reduce((sum, line) => sum + (line.amount || 0), 0);
    return { untaxedAmount, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.vendorName) {
      setError('Vendor name is required');
      return;
    }

    if (formData.lines.some(line => !line.product || line.quantity <= 0 || line.unitPrice <= 0)) {
      setError('All line items must have product, quantity > 0, and unit price > 0');
      return;
    }

    setLoading(true);

    try {
      const response = await billingAPI.createPurchaseOrder({
        vendorName: formData.vendorName,
        vendorEmail: formData.vendorEmail,
        vendorPhone: formData.vendorPhone,
        project: formData.project || projectId,
        lines: formData.lines.map(line => ({
          description: line.product,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        taxRate: 0,
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

  const { untaxedAmount, total } = calculateTotals();

  return (
    <div className="document-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="document-modal document-modal-large" onClick={(e) => e.stopPropagation()}>
        {/* Header with Action Buttons */}
        <div className="document-header-actions">
          <button type="button" className="btn-create-bills" onClick={() => {/* TODO: Navigate to create vendor bill */}}>
            Create Bills
          </button>
          <button type="button" className="btn-confirm" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Saving...' : 'Confirm'}
          </button>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
        </div>

        <div className="modal-header">
          <h2>Purchase Order</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="document-form">
          {/* Order Number (Read-only) */}
          <div className="form-group">
            <label htmlFor="orderNumber">Order Number</label>
            <input
              type="text"
              id="orderNumber"
              name="orderNumber"
              value={formData.orderNumber || 'P001 (Auto-generated)'}
              readOnly
              className="read-only-field"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="vendorName">Vendor*</label>
              <input
                type="text"
                id="vendorName"
                name="vendorName"
                value={formData.vendorName}
                onChange={handleChange}
                required
                placeholder="Vendor name"
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

          {/* Order Lines Table */}
          <div className="form-group">
            <label>Order Lines</label>
            <div className="order-lines-table-container">
              <table className="order-lines-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit</th>
                    <th>Unit Price</th>
                    <th>Taxes</th>
                    <th>Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {formData.lines.map((line, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={line.product}
                          onChange={(e) => handleLineChange(index, 'product', e.target.value)}
                          placeholder="Product name"
                          required
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                          min="1"
                          step="1"
                          required
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={line.unit}
                          onChange={(e) => handleLineChange(index, 'unit', e.target.value)}
                          placeholder="Unit"
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={line.unitPrice}
                          onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)}
                          min="0"
                          step="0.01"
                          required
                          className="table-input"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={line.taxRate}
                          onChange={(e) => handleLineChange(index, 'taxRate', e.target.value)}
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="0"
                          className="table-input"
                        />
                        <span className="tax-percent">%</span>
                      </td>
                      <td className="amount-cell">₹{(line.amount || 0).toFixed(2)}</td>
                      <td>
                        {formData.lines.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLine(index)}
                            className="remove-line-btn"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button type="button" onClick={addLine} className="add-product-btn">
                Add a product
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="totals-section">
            <div className="total-row">
              <span>UnTaxed Amount:</span>
              <span>₹{untaxedAmount.toFixed(2)}</span>
            </div>
            <div className="total-row total">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePurchaseOrder;

