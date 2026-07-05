import React from 'react';
import SMECard from '../dashboard/SMECard';
import SpecialistCard from '../dashboard/SpecialistCard';

const ProjectList = ({ projects, role }) => {
  if (!projects || projects.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px 20px' }}>
        <p style={{ fontSize: 15, color: 'var(--gray-400)' }}>No projects found</p>
      </div>
    );
  }

  return (
    <div className="dashboard-grid">
      {projects.map(project => (
        role === 'specialist' ? (
          <SpecialistCard key={project._id} project={project} />
        ) : (
          <SMECard key={project._id} project={project} />
        )
      ))}
    </div>
  );
};

export default ProjectList;
