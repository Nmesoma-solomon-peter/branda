import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/projects/ProjectDetail';

const ProjectDetailPage = () => {
  return (
    <div style={{ maxWidth: 1120, margin: '0 auto', padding: '100px 32px 60px' }}>
      <Link to="/dashboard" style={{ fontSize: 14, color: 'var(--green)', marginBottom: 24, display: 'inline-block' }}>
        Back to Dashboard
      </Link>
      <ProjectDetail />
    </div>
  );
};

export default ProjectDetailPage;
