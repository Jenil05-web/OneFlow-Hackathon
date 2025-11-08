import React from 'react';
import './StatusFilter.css';

const StatusFilter = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: 'all', label: 'All Projects' },
    { id: 'planned', label: 'Planned' },
    { id: 'in-progress', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'on-hold', label: 'On Hold' }
  ];

  return (
    <div className="status-filter">
      <div className="filter-container">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`filter-button ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => onFilterChange(filter.id)}
          >
            <span className={`status-dot ${filter.id}`}></span>
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StatusFilter;