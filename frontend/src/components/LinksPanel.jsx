import React, { useState, useEffect } from 'react';
import { billingAPI } from '../services/api';
import './LinksPanel.css';

const LinksPanel = ({ projectId }) => {
  const [documents, setDocuments] = useState({
    salesOrders: [],
    invoices: [],
    purchaseOrders: [],
    vendorBills: [],
    expenses: []
  });
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchDocuments();
    }
  }, [projectId]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const [soRes, invRes, poRes, vbRes, expRes] = await Promise.all([
        billingAPI.getSalesOrders({ project: projectId }),
        billingAPI.getInvoices({ project: projectId }),
        billingAPI.getPurchaseOrders({ project: projectId }),
        billingAPI.getVendorBills({ project: projectId }),
        billingAPI.getExpenses({ project: projectId }),
      ]);

      setDocuments({
        salesOrders: soRes.data.success ? (soRes.data.salesOrders || []) : [],
        invoices: invRes.data.success ? (invRes.data.invoices || []) : [],
        purchaseOrders: poRes.data.success ? (poRes.data.purchaseOrders || []) : [],
        vendorBills: vbRes.data.success ? (vbRes.data.bills || []) : [],
        expenses: expRes.data.success ? (expRes.data.expenses || []) : [],
      });
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = 
    documents.salesOrders.length +
    documents.invoices.length +
    documents.purchaseOrders.length +
    documents.vendorBills.length +
    documents.expenses.length;

  if (totalCount === 0 && !loading) {
    return null;
  }

  return (
    <div className="links-panel">
      <button 
        className="links-panel-toggle"
        onClick={() => setExpanded(!expanded)}
        title="Quick Links"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <span className="links-count">{totalCount}</span>
        <svg 
          width="12" 
          height="12" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
          className={`expand-icon ${expanded ? 'expanded' : ''}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {expanded && (
        <div className="links-panel-content">
          {documents.salesOrders.length > 0 && (
            <div className="links-section">
              <div className="links-section-header">Sales Orders ({documents.salesOrders.length})</div>
              <div className="links-list">
                {documents.salesOrders.slice(0, 5).map((so) => (
                  <a 
                    key={so._id} 
                    href={`#settings`}
                    onClick={(e) => {
                      e.preventDefault();
                      // Scroll to settings tab and highlight sales orders
                      const settingsTab = document.querySelector('.project-tab[onclick*="settings"]');
                      if (settingsTab) settingsTab.click();
                      setTimeout(() => {
                        const salesOrdersTab = document.querySelector('[data-tab="sales-orders"]');
                        if (salesOrdersTab) salesOrdersTab.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="link-item"
                  >
                    <span className="link-icon">📋</span>
                    <span className="link-text">{so.number || 'N/A'}</span>
                    <span className="link-amount">₹{so.total?.toLocaleString('en-IN') || 0}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {documents.invoices.length > 0 && (
            <div className="links-section">
              <div className="links-section-header">Invoices ({documents.invoices.length})</div>
              <div className="links-list">
                {documents.invoices.slice(0, 5).map((inv) => (
                  <a 
                    key={inv._id} 
                    href={`#settings`}
                    onClick={(e) => {
                      e.preventDefault();
                      const settingsTab = document.querySelector('.project-tab[onclick*="settings"]');
                      if (settingsTab) settingsTab.click();
                      setTimeout(() => {
                        const invoicesTab = document.querySelector('[data-tab="invoices"]');
                        if (invoicesTab) invoicesTab.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="link-item"
                  >
                    <span className="link-icon">🧾</span>
                    <span className="link-text">{inv.number || 'N/A'}</span>
                    <span className="link-amount">₹{inv.total?.toLocaleString('en-IN') || 0}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {documents.purchaseOrders.length > 0 && (
            <div className="links-section">
              <div className="links-section-header">Purchase Orders ({documents.purchaseOrders.length})</div>
              <div className="links-list">
                {documents.purchaseOrders.slice(0, 5).map((po) => (
                  <a 
                    key={po._id} 
                    href={`#settings`}
                    onClick={(e) => {
                      e.preventDefault();
                      const settingsTab = document.querySelector('.project-tab[onclick*="settings"]');
                      if (settingsTab) settingsTab.click();
                      setTimeout(() => {
                        const purchaseOrdersTab = document.querySelector('[data-tab="purchase-orders"]');
                        if (purchaseOrdersTab) purchaseOrdersTab.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="link-item"
                  >
                    <span className="link-icon">🛒</span>
                    <span className="link-text">{po.number || 'N/A'}</span>
                    <span className="link-amount">₹{po.total?.toLocaleString('en-IN') || 0}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {documents.vendorBills.length > 0 && (
            <div className="links-section">
              <div className="links-section-header">Vendor Bills ({documents.vendorBills.length})</div>
              <div className="links-list">
                {documents.vendorBills.slice(0, 5).map((vb) => (
                  <a 
                    key={vb._id} 
                    href={`#settings`}
                    onClick={(e) => {
                      e.preventDefault();
                      const settingsTab = document.querySelector('.project-tab[onclick*="settings"]');
                      if (settingsTab) settingsTab.click();
                      setTimeout(() => {
                        const vendorBillsTab = document.querySelector('[data-tab="vendor-bills"]');
                        if (vendorBillsTab) vendorBillsTab.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="link-item"
                  >
                    <span className="link-icon">💳</span>
                    <span className="link-text">{vb.number || 'N/A'}</span>
                    <span className="link-amount">₹{vb.total?.toLocaleString('en-IN') || 0}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {documents.expenses.length > 0 && (
            <div className="links-section">
              <div className="links-section-header">Expenses ({documents.expenses.length})</div>
              <div className="links-list">
                {documents.expenses.slice(0, 5).map((exp) => (
                  <a 
                    key={exp._id} 
                    href={`#settings`}
                    onClick={(e) => {
                      e.preventDefault();
                      const settingsTab = document.querySelector('.project-tab[onclick*="settings"]');
                      if (settingsTab) settingsTab.click();
                      setTimeout(() => {
                        const expensesTab = document.querySelector('[data-tab="expenses"]');
                        if (expensesTab) expensesTab.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="link-item"
                  >
                    <span className="link-icon">💰</span>
                    <span className="link-text">{exp.description || 'Expense'}</span>
                    <span className="link-amount">₹{exp.amount?.toLocaleString('en-IN') || 0}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LinksPanel;

