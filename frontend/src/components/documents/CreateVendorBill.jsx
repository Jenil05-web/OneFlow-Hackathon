import React, { useState } from 'react';
import { billingAPI } from '../../services/api';
import './DocumentModal.css';

const CreateVendorBill = ({ projectId, purchaseOrders = [], onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    vendorName: '',
    vendorEmail: '',
    vendorAddress: '',
    purchaseOrder: '',
    lines: [{ description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 0,
    billDate: new Date().toISOString().split('T')[0],
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

  const handlePurchaseOrderChange = (e) => {
    const poId = e.target.value;
    if (poId) {
      const selectedPO = purchaseOrders.find(po => po._id === poId);
      if (selectedPO) {
        setFormData(prev => ({
          ...prev,
          purchaseOrder: poId,
          vendorName: selectedPO.vendorName || prev.vendorName,
          vendorEmail: selectedPO.vendorEmail || prev.vendorEmail,
          lines: selectedPO.lines && selectedPO.lines.length > 0
            ? selectedPO.lines.map(line => ({
                description: line.description,
                quantity: line.quantity,
                unitPrice: line.unitPrice,
                amount: line.amount || (line.quantity * line.unitPrice),
              }))
            : prev.lines,
          taxRate: selectedPO.taxRate || prev.taxRate,
        }));
      }
    } else {
      setFormData(prev => ({ ...prev, purchaseOrder: '' }));
    }
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
      const response = await billingAPI.createVendorBill({
        vendorName: formData.vendorName,
        vendorEmail: formData.vendorEmail,
        vendorAddress: formData.vendorAddress,
        project: projectId,
        purchaseOrder: formData.purchaseOrder || undefined,
        lines: formData.lines.map(line => ({
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
        })),
        taxRate: formData.taxRate,
        billDate: formData.billDate,
        dueDate: formData.dueDate || undefined,
        status: formData.status,
      });

      if (response.data.success) {
        onSuccess(response.data.bill);
      } else {
        throw new Error(response.data.message || 'Failed to create vendor bill');
      }
    } catch (err) {
      console.error('Create vendor bill error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to create vendor bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="document-modal document-modal-large" onClick={(e) => e.stopPropagation()}>
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
          <h2>Vendor Bill</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="document-form">
          <div className="form-group">
            <label htmlFor="vendorName">Vendor Bill*</label>
            <input
              type="text"
              id="vendorName"
              name="vendorName"
              value={formData.vendorName}
              onChange={handleChange}
              required
              placeholder="Vendor Bill"
            />
          </div>

          {/* Invoice Lines Section */}
          <div className="form-group">
            <label>Invoice Lines</label>
            <div className="invoice-lines-section">
              <div className="invoice-lines-header">
                <span>Product</span>
              </div>
              <div className="invoice-lines-content">
                {formData.lines.map((line, index) => (
                  <div key={index} className="invoice-line-item">
                    <input
                      type="text"
                      value={line.description}
                      onChange={(e) => handleLineChange(index, 'description', e.target.value)}
                      placeholder="Product"
                      required
                      className="invoice-line-product"
                    />
                    <input
                      type="number"
                      value={line.quantity}
                      onChange={(e) => handleLineChange(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      min="1"
                      step="1"
                      required
                      className="invoice-line-qty"
                    />
                    <input
                      type="number"
                      value={line.unitPrice}
                      onChange={(e) => handleLineChange(index, 'unitPrice', e.target.value)}
                      placeholder="Price"
                      min="0"
                      step="0.01"
                      required
                      className="invoice-line-price"
                    />
                    <span className="invoice-line-amount">₹{(line.amount || 0).toFixed(2)}</span>
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
              </div>
              <button type="button" onClick={addLine} className="add-product-btn">
                Add a product
              </button>
            </div>
          </div>

          {/* Hidden fields for API */}
          {purchaseOrders.length > 0 && (
            <div className="form-group" style={{ display: 'none' }}>
              <select
                id="purchaseOrder"
                name="purchaseOrder"
                value={formData.purchaseOrder}
                onChange={handlePurchaseOrderChange}
              >
                <option value="">None</option>
                {purchaseOrders.map(po => (
                  <option key={po._id} value={po._id}>
                    {po.number || po._id} - {po.vendorName}
                  </option>
                ))}
              </select>
            </div>
          )}
          <input type="hidden" name="project" value={projectId} />
          <input type="hidden" name="taxRate" value={formData.taxRate} />
        </form>
      </div>
    </div>
  );
};

export default CreateVendorBill;

