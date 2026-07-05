import React from 'react';
import { Link } from 'react-router-dom';

const statusColors = {
  active: { bg: '#EDF3E2', text: '#5a8a28' },
  in_review: { bg: '#FEF3C7', text: '#D97706' },
  completed: { bg: '#ECFDF5', text: '#059669' },
  revision: { bg: '#FEF2F2', text: '#DC2626' }
};

const SMECard = ({ project }) => {
  const status = statusColors[project.status] || statusColors.active;

  return (
    <Link to={`/projects/${project._id}`} style={{ textDecoration: 'none' }}>
      <article style={{
        background: 'var(--white)',
        border: '1px solid var(--gray-200)',
        borderRadius: 'var(--radius)',
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        transition: 'border-color 0.2s'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h4 style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 700, color: 'var(--black)', margin: 0 }}>
            {project.title}
          </h4>
          <span style={{
            fontSize: 12,
            fontWeight: 500,
            padding: '4px 10px',
            borderRadius: 100,
            background: status.bg,
            color: status.text,
            whiteSpace: 'nowrap'
          }}>
            {project.status.replace('_', ' ')}
          </span>
        </div>
        <p style={{ fontSize: 14, color: 'var(--gray-500)', lineHeight: 1.6, margin: 0 }}>
          {project.industry}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTop: '1px solid var(--gray-100)' }}>
          <span style={{ fontSize: 13, color: 'var(--gray-400)' }}>
            {project.assignedSpecialist ? project.assignedSpecialist.name : 'No specialist assigned'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
            {new Date(project.createdAt).toLocaleDateString()}
          </span>
        </div>
      </article>
    </Link>
  );
};

export default SMECard;
