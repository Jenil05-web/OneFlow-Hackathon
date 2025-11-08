import React, { useState, useEffect } from 'react';
import { billingAPI } from '../../services/api';
import './DocumentModal.css';

const CreateProduct = ({ productId, onClose, onSuccess }) => {
  const isEditMode = !!productId;
  const [formData, setFormData] = useState({
    name: '',
    types: {
      sales: false,
      purchase: false,
      expenses: false,
    },
    salesPrice: 0,
    salesTaxes: 0,
    cost: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && productId) {
      fetchProduct();
    }
  }, [productId, isEditMode]);

  const fetchProduct = async () => {
    if (!productId) return;
    setLoading(true);
    try {
      const response = await billingAPI.getProduct(productId);
      if (response.data.success) {
        const product = response.data.product;
        setFormData({
          name: product.name || '',
          types: product.types || { sales: false, purchase: false, expenses: false },
          salesPrice: product.salesPrice || 0,
          salesTaxes: product.salesTaxes || 0,
          cost: product.cost || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.message || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('type-')) {
      const typeKey = name.replace('type-', '');
      setFormData(prev => ({
        ...prev,
        types: {
          ...prev.types,
          [typeKey]: checked,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value,
      }));
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name) {
      setError('Product name is required');
      return;
    }

    if (!formData.types.sales && !formData.types.purchase && !formData.types.expenses) {
      setError('At least one product type must be selected');
      return;
    }

    setLoading(true);

    try {
      let response;
      if (isEditMode) {
        response = await billingAPI.updateProduct(productId, formData);
      } else {
        response = await billingAPI.createProduct(formData);
      }

      if (response.data.success) {
        if (onSuccess) {
          onSuccess(response.data.product);
        }
        if (onClose) {
          onClose();
        }
      } else {
        throw new Error(response.data.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
      }
    } catch (err) {
      console.error('Product save error:', err);
      setError(err.response?.data?.message || err.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="document-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? 'Edit Product' : 'Create Product'}</h2>
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
            <label htmlFor="name">Product name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <div className="product-types">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="type-sales"
                  checked={formData.types.sales}
                  onChange={handleChange}
                />
                <span>Sales</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="type-purchase"
                  checked={formData.types.purchase}
                  onChange={handleChange}
                />
                <span>Purchase</span>
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="type-expenses"
                  checked={formData.types.expenses}
                  onChange={handleChange}
                />
                <span>Expenses</span>
              </label>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="salesPrice">Sales price</label>
              <input
                type="number"
                id="salesPrice"
                name="salesPrice"
                value={formData.salesPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label htmlFor="salesTaxes">Sales Taxes</label>
              <input
                type="number"
                id="salesTaxes"
                name="salesTaxes"
                value={formData.salesTaxes}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="cost">Cost</label>
            <input
              type="number"
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;

