import React, { useState, useEffect } from 'react';
import { tasksAPI } from '../services/api';
import './TaskDetails.css';

const TaskDetails = ({ taskId, projectId, onClose, onUpdate }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentText, setCommentText] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentFilename, setAttachmentFilename] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const response = await tasksAPI.getById(taskId);
      if (response.data.success) {
        setTask(response.data.task);
      } else {
        setError('Failed to load task');
      }
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err.response?.data?.message || 'Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      const response = await tasksAPI.addComment(taskId, commentText);
      if (response.data.success) {
        setTask(response.data.task);
        setCommentText('');
      } else {
        alert('Failed to add comment');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAttachment = async (e) => {
    e.preventDefault();
    if (!attachmentUrl.trim() || !attachmentFilename.trim()) {
      alert('Please provide both filename and URL');
      return;
    }

    setSubmitting(true);
    try {
      const response = await tasksAPI.addAttachment(taskId, attachmentFilename, attachmentUrl);
      if (response.data.success) {
        setTask(response.data.task);
        setAttachmentUrl('');
        setAttachmentFilename('');
      } else {
        alert('Failed to add attachment');
      }
    } catch (err) {
      console.error('Error adding attachment:', err);
      alert('Failed to add attachment');
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'status-completed';
      case 'In Progress': return 'status-in-progress';
      case 'Blocked': return 'status-blocked';
      case 'Review': return 'status-review';
      default: return 'status-todo';
    }
  };

  if (loading) {
    return (
      <div className="task-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading task details...</p>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="task-details-error">
        <p>{error || 'Task not found'}</p>
        <button onClick={onClose} className="btn-secondary">Go Back</button>
      </div>
    );
  }

  return (
    <div className="task-details">
      <div className="task-details-header">
        <div className="header-left">
          <button onClick={onClose} className="back-button">
            <span>←</span> Back
          </button>
          <h1>{task.title}</h1>
        </div>
        <div className="header-right">
          <span className={`status-badge ${getStatusColor(task.status)}`}>
            {task.status || 'To Do'}
          </span>
          <span className={`priority-badge ${getPriorityColor(task.priority)}`}>
            {task.priority || 'Medium'}
          </span>
        </div>
      </div>

      <div className="task-details-content">
        <div className="task-main">
          <div className="task-section">
            <h2>Description</h2>
            <p className="task-description">{task.description || 'No description provided'}</p>
          </div>

          <div className="task-section">
            <h2>Details</h2>
            <div className="task-meta">
              <div className="meta-item">
                <span className="meta-label">Project:</span>
                <span className="meta-value">{task.project?.name || 'N/A'}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Assigned To:</span>
                <span className="meta-value">
                  {task.assignedTo?.name || task.assignee?.name || 'Unassigned'}
                </span>
              </div>
              {task.dueDate && (
                <div className="meta-item">
                  <span className="meta-label">Due Date:</span>
                  <span className="meta-value">
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">Time Logged:</span>
                <span className="meta-value">{task.timeLogged || 0}h</span>
              </div>
              {task.estimatedHours > 0 && (
                <div className="meta-item">
                  <span className="meta-label">Estimated:</span>
                  <span className="meta-value">{task.estimatedHours}h</span>
                </div>
              )}
              {task.progress !== undefined && (
                <div className="meta-item">
                  <span className="meta-label">Progress:</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${task.progress}%` }}
                    ></div>
                  </div>
                  <span className="meta-value">{task.progress}%</span>
                </div>
              )}
            </div>
          </div>

          <div className="task-section">
            <h2>Comments ({task.comments?.length || 0})</h2>
            <div className="comments-list">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comment, index) => (
                  <div key={index} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">
                        {comment.user?.name || 'Unknown'}
                      </span>
                      <span className="comment-date">
                        {new Date(comment.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="comment-text">{comment.text}</div>
                  </div>
                ))
              ) : (
                <p className="empty-message">No comments yet</p>
              )}
            </div>
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
                required
              />
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Comment'}
              </button>
            </form>
          </div>

          <div className="task-section">
            <h2>Attachments ({task.attachments?.length || 0})</h2>
            <div className="attachments-list">
              {task.attachments && task.attachments.length > 0 ? (
                task.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    <span className="attachment-icon">📎</span>
                    <a 
                      href={attachment.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="attachment-link"
                    >
                      {attachment.filename || 'Attachment'}
                    </a>
                    <span className="attachment-date">
                      {new Date(attachment.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="empty-message">No attachments yet</p>
              )}
            </div>
            <form onSubmit={handleAddAttachment} className="attachment-form">
              <div className="form-row">
                <input
                  type="text"
                  value={attachmentFilename}
                  onChange={(e) => setAttachmentFilename(e.target.value)}
                  placeholder="Filename"
                  required
                />
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="URL"
                  required
                />
              </div>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Attachment'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;

