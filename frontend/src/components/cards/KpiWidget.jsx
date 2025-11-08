import React from 'react';
import './KpiWidget.css';

const KpiWidget = ({ title, value, icon, trend, color }) => {
  return (
    <div className={`kpi-widget ${color || 'blue'}`}>
      <div className="kpi-icon">
        {icon}
      </div>
      <div className="kpi-content">
        <h3 className="kpi-title">{title}</h3>
        <div className="kpi-value-container">
          <span className="kpi-value">{value}</span>
          {trend && (
            <span className={`kpi-trend ${trend > 0 ? 'positive' : 'negative'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default KpiWidget;