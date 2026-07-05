import React from 'react';

const statusConfig = {
  active: { label: 'Active', bg: '#EDF3E2', text: '#5a8a28' },
  in_review: { label: 'In Review', bg: '#FEF3C7', text: '#D97706' },
  completed: { label: 'Completed', bg: '#ECFDF5', text: '#059669' },
  revision: { label: 'Revision', bg: '#FEF2F2', text: '#DC2626' }
};

const ProjectStatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.active;

  return (
    <span style={{
      fontSize: 12,
      fontWeight: 500,
      padding: '4px 12px',
      borderRadius: 100,
      background: config.bg,
      color: config.text,
      display: 'inline-block'
    }}>
      {config.label}
    </span>
  );
};

export default ProjectStatusBadge;
