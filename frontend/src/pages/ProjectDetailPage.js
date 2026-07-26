import React from 'react';
import { Link } from 'react-router-dom';
import ProjectDetail from '../components/projects/ProjectDetail';

const ProjectDetailPage = () => {
  return (
    <div className="pdp-page" style={{ maxWidth: 1120, margin: '0 auto', padding: '100px 32px 60px' }}>
      <style>{`
        @media (max-width: 768px) { .pdp-page { padding: 80px 20px 40px !important; } }
        @media (max-width: 480px) { .pdp-page { padding: 70px 12px 32px !important; } }
      `}</style>
      <Link to="/dashboard" style={{ fontSize: 14, color: 'var(--green)', marginBottom: 24, display: 'inline-block' }}>
        Back to Dashboard
      </Link>
      <ProjectDetail />
    </div>
  );
};

export default ProjectDetailPage;
