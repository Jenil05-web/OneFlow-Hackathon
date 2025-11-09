import React, { useState, useEffect } from 'react';
import { billingAPI, projectsAPI, adminAPI } from '../services/api';
import CreateSalesOrder from './documents/CreateSalesOrder';
import CreatePurchaseOrder from './documents/CreatePurchaseOrder';
import CreateInvoice from './documents/CreateInvoice';
import CreateVendorBill from './documents/CreateVendorBill';
import CreateExpense from './documents/CreateExpense';
import TimesheetManagement from './TimesheetManagement';
import jsPDF from 'jspdf';
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
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [assigningMembers, setAssigningMembers] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchAllDocuments();
      fetchUsers();
      fetchProjectTeamMembers();
    }
  }, [projectId, project]);

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

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProjectTeamMembers = () => {
    if (project) {
      const members = project.teamMembers || project.members || [];
      setTeamMembers(members.map(m => (m._id || m).toString()));
    }
  };

  const handleTeamMemberChange = async (userId, isChecked) => {
    let newTeamMembers;
    if (isChecked) {
      newTeamMembers = [...teamMembers, userId];
    } else {
      newTeamMembers = teamMembers.filter(id => id !== userId);
    }

    // Optimistically update UI
    setTeamMembers(newTeamMembers);
    setAssigningMembers(true);

    try {
      const response = await projectsAPI.assignMembers(projectId, newTeamMembers);
      if (response.data.success) {
        // Update team members from response
        const updatedProject = response.data.project;
        const members = updatedProject.teamMembers || updatedProject.members || [];
        setTeamMembers(members.map(m => (m._id || m).toString()));
      }
    } catch (error) {
      console.error('Error assigning team members:', error);
      alert(error.response?.data?.message || 'Failed to update team members. Please try again.');
      // Revert on error
      fetchProjectTeamMembers();
    } finally {
      setAssigningMembers(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'team', label: 'Team', icon: '👥' },
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

          {/* Team Tab */}
          {activeTab === 'team' && !loading && (
            <div className="team-tab">
              <h2>Team Members</h2>
              <p className="team-description">Assign team members to this project. They will be able to view and work on project tasks.</p>
              <div className="team-members-selector" style={{ marginTop: '20px' }}>
                {users.filter(user => user.role === 'Team').map(user => {
                  const userId = user._id || user.id;
                  const isAssigned = teamMembers.includes(userId.toString());
                  return (
                    <div key={userId} className="team-member-item" style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '12px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      marginBottom: '8px',
                      backgroundColor: isAssigned ? '#f0f9ff' : '#fff'
                    }}>
                      <input
                        type="checkbox"
                        checked={isAssigned}
                        onChange={(e) => handleTeamMemberChange(userId.toString(), e.target.checked)}
                        disabled={assigningMembers}
                        style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', color: '#1f2937' }}>{user.name}</div>
                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>{user.email}</div>
                      </div>
                      {isAssigned && (
                        <span style={{ 
                          padding: '4px 8px', 
                          backgroundColor: '#10b981', 
                          color: 'white', 
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}>
                          Assigned
                        </span>
                      )}
                    </div>
                  );
                })}
                {users.filter(user => user.role === 'Team').length === 0 && (
                  <p style={{ color: '#6b7280', fontStyle: 'italic', marginTop: '20px' }}>
                    No team members available. Team members can be created in the Admin Dashboard.
                  </p>
                )}
              </div>
              {assigningMembers && (
                <div style={{ marginTop: '20px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#92400e' }}>
                  Updating team members...
                </div>
              )}
            </div>
          )}

          {/* Timesheets Tab */}
          {activeTab === 'timesheets' && !loading && (
            <TimesheetManagement projectId={projectId} onRefresh={fetchAllDocuments} />
          )}

          {/* Document Tabs */}
          {activeTab !== 'overview' && activeTab !== 'timesheets' && activeTab !== 'team' && !loading && (
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
                  <div data-tab="sales-orders">
                    <SalesOrdersList salesOrders={salesOrders} />
                  </div>
                )}
                {activeTab === 'purchase-orders' && (
                  <div data-tab="purchase-orders">
                    <PurchaseOrdersList purchaseOrders={purchaseOrders} />
                  </div>
                )}
                {activeTab === 'invoices' && (
                  <div data-tab="invoices">
                    <InvoicesList invoices={invoices} />
                  </div>
                )}
                {activeTab === 'vendor-bills' && (
                  <div data-tab="vendor-bills">
                    <VendorBillsList vendorBills={vendorBills} />
                  </div>
                )}
                {activeTab === 'expenses' && (
                  <div data-tab="expenses">
                    <ExpensesList expenses={expenses} onRefresh={fetchAllDocuments} />
                  </div>
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
  const [downloading, setDownloading] = useState(null);

  const downloadInvoicePDF = async (invoiceId) => {
    setDownloading(invoiceId);
    try {
      // Fetch full invoice details
      const response = await billingAPI.getInvoice(invoiceId);
      const invoice = response.data.invoice || response.data;
      
      // Fetch project details if not populated
      let projectName = null;
      if (invoice.project) {
        if (typeof invoice.project === 'string') {
          try {
            const projectRes = await projectsAPI.getById(invoice.project);
            if (projectRes.data.success) {
              projectName = projectRes.data.project?.name;
            }
          } catch (err) {
            console.error('Error fetching project:', err);
          }
        } else {
          projectName = invoice.project?.name;
        }
      }
      
      // Fetch sales order details if not populated
      let salesOrderNumber = null;
      if (invoice.salesOrder) {
        if (typeof invoice.salesOrder === 'string') {
          try {
            const soRes = await billingAPI.getSalesOrder(invoice.salesOrder);
            if (soRes.data.success) {
              salesOrderNumber = soRes.data.salesOrder?.number;
            }
          } catch (err) {
            console.error('Error fetching sales order:', err);
          }
        } else {
          salesOrderNumber = invoice.salesOrder?.number;
        }
      }

      // Create PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = margin;

      // Header
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('INVOICE', pageWidth - margin, yPos, { align: 'right' });
      yPos += 10;

      // Invoice details
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Invoice #: ${invoice.number || 'N/A'}`, margin, yPos);
      yPos += 6;
      doc.text(`Date: ${invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}`, margin, yPos);
      yPos += 6;
      if (invoice.dueDate) {
        doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, margin, yPos);
        yPos += 6;
      }
      doc.text(`Status: ${invoice.status || 'N/A'}`, margin, yPos);
      yPos += 6;
      
      // Project and Sales Order links
      if (projectName) {
        doc.setFont(undefined, 'normal');
        doc.text(`Project: ${projectName}`, margin, yPos);
        yPos += 6;
      }
      if (salesOrderNumber) {
        doc.text(`Sales Order: ${salesOrderNumber}`, margin, yPos);
        yPos += 6;
      }
      yPos += 9;

      // Client information
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Bill To:', margin, yPos);
      yPos += 7;
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      if (invoice.clientName) {
        doc.text(invoice.clientName, margin, yPos);
        yPos += 6;
      }
      if (invoice.clientEmail) {
        doc.text(invoice.clientEmail, margin, yPos);
        yPos += 6;
      }
      if (invoice.clientAddress) {
        const addressLines = doc.splitTextToSize(invoice.clientAddress, pageWidth - 2 * margin);
        doc.text(addressLines, margin, yPos);
        yPos += addressLines.length * 6;
      }
      yPos += 10;

      // Line items table
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Items', margin, yPos);
      yPos += 8;

      // Table header
      doc.setFontSize(10);
      doc.setFont(undefined, 'bold');
      doc.text('Description', margin, yPos);
      doc.text('Qty', margin + 100, yPos);
      doc.text('Price', margin + 120, yPos);
      doc.text('Amount', pageWidth - margin, yPos, { align: 'right' });
      yPos += 6;
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 5;

      // Table rows
      doc.setFont(undefined, 'normal');
      const subtotal = invoice.lines?.reduce((sum, line) => {
        const amount = (line.quantity || 0) * (line.unitPrice || 0);
        const description = line.description || 'N/A';
        const qty = line.quantity || 0;
        const price = line.unitPrice || 0;

        // Check if we need a new page
        if (yPos > 250) {
          doc.addPage();
          yPos = margin;
        }

        doc.text(description.substring(0, 40), margin, yPos);
        doc.text(qty.toString(), margin + 100, yPos);
        doc.text(`₹${price.toFixed(2)}`, margin + 120, yPos);
        doc.text(`₹${amount.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 6;

        return sum + amount;
      }, 0) || 0;

      yPos += 5;
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 8;

      // Totals
      doc.setFont(undefined, 'normal');
      doc.text('Subtotal:', pageWidth - margin - 40, yPos, { align: 'right' });
      doc.text(`₹${subtotal.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
      yPos += 6;

      if (invoice.taxRate && invoice.taxRate > 0) {
        const tax = subtotal * (invoice.taxRate / 100);
        doc.text(`Tax (${invoice.taxRate}%):`, pageWidth - margin - 40, yPos, { align: 'right' });
        doc.text(`₹${tax.toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });
        yPos += 6;
      }

      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Total:', pageWidth - margin - 40, yPos, { align: 'right' });
      doc.text(`₹${(invoice.total || subtotal).toFixed(2)}`, pageWidth - margin, yPos, { align: 'right' });

      // Save PDF
      const fileName = `Invoice_${invoice.number || invoice._id}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

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
            <th>Actions</th>
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
              <td>
                <button
                  onClick={() => downloadInvoicePDF(inv._id)}
                  disabled={downloading === inv._id}
                  className="btn-download"
                  title="Download PDF"
                >
                  {downloading === inv._id ? '...' : '📥'}
                </button>
              </td>
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

