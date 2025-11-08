import React, { useState, useEffect } from 'react';
import { billingAPI } from '../services/api';
import CreateSalesOrder from './documents/CreateSalesOrder';
import CreatePurchaseOrder from './documents/CreatePurchaseOrder';
import CreateInvoice from './documents/CreateInvoice';
import CreateVendorBill from './documents/CreateVendorBill';
import CreateExpense from './documents/CreateExpense';
import TimesheetManagement from './TimesheetManagement';
import './ProjectSettings.css';

const ProjectSettings = ({ projectId, project }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [salesOrders, setSalesOrders] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [vendorBills, setVendorBills] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(null); // 'sales-order', 'purchase-order', 'invoice', 'vendor-bill', 'expense'

  useEffect(() => {
    if (projectId) {
      fetchAllDocuments();
    }
  }, [projectId]);

  const fetchAllDocuments = async () => {
    setLoading(true);
    try {
      const [soRes, poRes, invRes, vbRes, expRes] = await Promise.all([
        billingAPI.getSalesOrders({ project: projectId }),
        billingAPI.getPurchaseOrders({ project: projectId }),
        billingAPI.getInvoices({ project: projectId }),
        billingAPI.getVendorBills({ project: projectId }),
        billingAPI.getExpenses({ project: projectId }),
      ]);

      if (soRes.data.success) setSalesOrders(soRes.data.salesOrders || []);
      if (poRes.data.success) setPurchaseOrders(poRes.data.purchaseOrders || []);
      if (invRes.data.success) setInvoices(invRes.data.invoices || []);
      if (vbRes.data.success) setVendorBills(vbRes.data.bills || []);
      if (expRes.data.success) setExpenses(expRes.data.expenses || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentCreated = () => {
    setShowCreateModal(null);
    fetchAllDocuments();
    // Refresh project data to update financials
    if (window.location) {
      window.location.reload();
    }
  };

  // Calculate financials
  const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
  const totalCost = [...vendorBills, ...expenses.filter(e => e.status === 'Approved' || e.status === 'Paid')]
    .reduce((sum, item) => sum + (item.total || item.amount || 0), 0);
  const profit = totalRevenue - totalCost;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'timesheets', label: 'Timesheets', icon: '⏱️' },
    { id: 'sales-orders', label: 'Sales Orders', icon: '📋', count: salesOrders.length },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: '🛒', count: purchaseOrders.length },
    { id: 'invoices', label: 'Invoices', icon: '🧾', count: invoices.length },
    { id: 'vendor-bills', label: 'Vendor Bills', icon: '💳', count: vendorBills.length },
    { id: 'expenses', label: 'Expenses', icon: '💰', count: expenses.length },
  ];

  const getCreateButtonLabel = (tabId) => {
    const labels = {
      'sales-orders': 'Create Sales Order',
      'purchase-orders': 'Create Purchase Order',
      'invoices': 'Create Invoice',
      'vendor-bills': 'Create Vendor Bill',
      'expenses': 'Submit Expense',
    };
    return labels[tabId] || 'Create';
  };

  return (
    <div className="project-settings">
      <div className="settings-container">
        {/* Tab Navigation */}
        <div className="settings-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
              {tab.count !== undefined && (
                <span className="tab-count">{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="settings-content">
          {loading && (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading documents...</p>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && !loading && (
            <div className="overview-tab">
              <div className="financial-summary">
                <h2>Financial Summary</h2>
                <div className="financial-cards">
                  <div className="financial-card revenue">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                      <div className="card-label">Total Revenue</div>
                      <div className="card-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div className="financial-card cost">
                    <div className="card-icon">💸</div>
                    <div className="card-content">
                      <div className="card-label">Total Cost</div>
                      <div className="card-value">₹{totalCost.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div className={`financial-card profit ${profit >= 0 ? 'positive' : 'negative'}`}>
                    <div className="card-icon">{profit >= 0 ? '📈' : '📉'}</div>
                    <div className="card-content">
                      <div className="card-label">Net Profit</div>
                      <div className="card-value">₹{Math.abs(profit).toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="links-summary">
                <h2>Quick Links</h2>
                <div className="links-grid">
                  <div className="link-card" onClick={() => setActiveTab('sales-orders')}>
                    <div className="link-icon">📋</div>
                    <div className="link-info">
                      <div className="link-title">Sales Orders</div>
                      <div className="link-count">{salesOrders.length} orders</div>
                    </div>
                  </div>
                  <div className="link-card" onClick={() => setActiveTab('purchase-orders')}>
                    <div className="link-icon">🛒</div>
                    <div className="link-info">
                      <div className="link-title">Purchase Orders</div>
                      <div className="link-count">{purchaseOrders.length} orders</div>
                    </div>
                  </div>
                  <div className="link-card" onClick={() => setActiveTab('invoices')}>
                    <div className="link-icon">🧾</div>
                    <div className="link-info">
                      <div className="link-title">Invoices</div>
                      <div className="link-count">{invoices.length} invoices</div>
                    </div>
                  </div>
                  <div className="link-card" onClick={() => setActiveTab('vendor-bills')}>
                    <div className="link-icon">💳</div>
                    <div className="link-info">
                      <div className="link-title">Vendor Bills</div>
                      <div className="link-count">{vendorBills.length} bills</div>
                    </div>
                  </div>
                  <div className="link-card" onClick={() => setActiveTab('expenses')}>
                    <div className="link-icon">💰</div>
                    <div className="link-info">
                      <div className="link-title">Expenses</div>
                      <div className="link-count">{expenses.length} expenses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timesheets Tab */}
          {activeTab === 'timesheets' && !loading && (
            <TimesheetManagement projectId={projectId} onRefresh={fetchAllDocuments} />
          )}

          {/* Document Tabs */}
          {activeTab !== 'overview' && activeTab !== 'timesheets' && !loading && (
            <div className="documents-tab">
              <div className="documents-header">
                <h2>{tabs.find(t => t.id === activeTab)?.label}</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowCreateModal(activeTab)}
                >
                  <span>+</span>
                  {getCreateButtonLabel(activeTab)}
                </button>
              </div>

              <div className="documents-list">
                {activeTab === 'sales-orders' && (
                  <SalesOrdersList salesOrders={salesOrders} />
                )}
                {activeTab === 'purchase-orders' && (
                  <PurchaseOrdersList purchaseOrders={purchaseOrders} />
                )}
                {activeTab === 'invoices' && (
                  <InvoicesList invoices={invoices} />
                )}
                {activeTab === 'vendor-bills' && (
                  <VendorBillsList vendorBills={vendorBills} />
                )}
                {activeTab === 'expenses' && (
                  <ExpensesList expenses={expenses} onRefresh={fetchAllDocuments} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modals */}
      {showCreateModal === 'sales-orders' && (
        <CreateSalesOrder
          projectId={projectId}
          onClose={() => setShowCreateModal(null)}
          onSuccess={handleDocumentCreated}
        />
      )}
      {showCreateModal === 'purchase-orders' && (
        <CreatePurchaseOrder
          projectId={projectId}
          onClose={() => setShowCreateModal(null)}
          onSuccess={handleDocumentCreated}
        />
      )}
      {showCreateModal === 'invoices' && (
        <CreateInvoice
          projectId={projectId}
          salesOrders={salesOrders}
          onClose={() => setShowCreateModal(null)}
          onSuccess={handleDocumentCreated}
        />
      )}
      {showCreateModal === 'vendor-bills' && (
        <CreateVendorBill
          projectId={projectId}
          purchaseOrders={purchaseOrders}
          onClose={() => setShowCreateModal(null)}
          onSuccess={handleDocumentCreated}
        />
      )}
      {showCreateModal === 'expenses' && (
        <CreateExpense
          projectId={projectId}
          onClose={() => setShowCreateModal(null)}
          onSuccess={handleDocumentCreated}
        />
      )}
    </div>
  );
};

// List Components
const SalesOrdersList = ({ salesOrders }) => {
  if (salesOrders.length === 0) {
    return <div className="empty-state">No sales orders found. Create one to get started.</div>;
  }

  return (
    <div className="documents-table">
      <table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Partner</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {salesOrders.map((so) => (
            <tr key={so._id}>
              <td>{so.number || 'N/A'}</td>
              <td>{so.partnerName}</td>
              <td>₹{so.total?.toLocaleString('en-IN') || 0}</td>
              <td><span className={`status-badge ${so.status?.toLowerCase()}`}>{so.status}</span></td>
              <td>{new Date(so.orderDate || so.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const PurchaseOrdersList = ({ purchaseOrders }) => {
  if (purchaseOrders.length === 0) {
    return <div className="empty-state">No purchase orders found. Create one to get started.</div>;
  }

  return (
    <div className="documents-table">
      <table>
        <thead>
          <tr>
            <th>Order Number</th>
            <th>Vendor</th>
            <th>Total</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {purchaseOrders.map((po) => (
            <tr key={po._id}>
              <td>{po.number || 'N/A'}</td>
              <td>{po.vendorName}</td>
              <td>₹{po.total?.toLocaleString('en-IN') || 0}</td>
              <td><span className={`status-badge ${po.status?.toLowerCase()}`}>{po.status}</span></td>
              <td>{new Date(po.orderDate || po.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const InvoicesList = ({ invoices }) => {
  if (invoices.length === 0) {
    return <div className="empty-state">No invoices found. Create one to get started.</div>;
  }

  return (
    <div className="documents-table">
      <table>
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Client</th>
            <th>Total</th>
            <th>Status</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv._id}>
              <td>{inv.number || 'N/A'}</td>
              <td>{inv.clientName}</td>
              <td>₹{inv.total?.toLocaleString('en-IN') || 0}</td>
              <td><span className={`status-badge ${inv.status?.toLowerCase()}`}>{inv.status}</span></td>
              <td>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const VendorBillsList = ({ vendorBills }) => {
  if (vendorBills.length === 0) {
    return <div className="empty-state">No vendor bills found. Create one to get started.</div>;
  }

  return (
    <div className="documents-table">
      <table>
        <thead>
          <tr>
            <th>Bill Number</th>
            <th>Vendor</th>
            <th>Total</th>
            <th>Status</th>
            <th>Due Date</th>
          </tr>
        </thead>
        <tbody>
          {vendorBills.map((vb) => (
            <tr key={vb._id}>
              <td>{vb.number || 'N/A'}</td>
              <td>{vb.vendorName}</td>
              <td>₹{vb.total?.toLocaleString('en-IN') || 0}</td>
              <td><span className={`status-badge ${vb.status?.toLowerCase()}`}>{vb.status}</span></td>
              <td>{vb.dueDate ? new Date(vb.dueDate).toLocaleDateString() : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const ExpensesList = ({ expenses, onRefresh }) => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isManagerOrAdmin = user.role === 'Manager' || user.role === 'Admin';

  const handleApprove = async (expenseId, status) => {
    try {
      await billingAPI.approveExpense(expenseId, status);
      onRefresh();
    } catch (error) {
      console.error('Error approving expense:', error);
      alert('Failed to approve expense');
    }
  };

  if (expenses.length === 0) {
    return <div className="empty-state">No expenses found. Submit one to get started.</div>;
  }

  return (
    <div className="documents-table">
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Title</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Submitted By</th>
            {isManagerOrAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {expenses.map((exp) => (
            <tr key={exp._id}>
              <td>{exp.reference || 'N/A'}</td>
              <td>{exp.title}</td>
              <td>{exp.category}</td>
              <td>₹{exp.amount?.toLocaleString('en-IN') || 0}</td>
              <td><span className={`status-badge ${exp.status?.toLowerCase()}`}>{exp.status}</span></td>
              <td>{exp.user?.name || 'N/A'}</td>
              {isManagerOrAdmin && exp.status === 'Submitted' && (
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-approve"
                      onClick={() => handleApprove(exp._id, 'Approved')}
                    >
                      Approve
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleApprove(exp._id, 'Rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectSettings;

