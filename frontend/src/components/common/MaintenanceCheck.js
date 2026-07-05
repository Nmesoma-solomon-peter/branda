import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Maintenance from '../../pages/Maintenance';

const MaintenanceCheck = ({ children }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const fetched = useRef(false);

  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    api.get('/maintenance-status')
      .then(res => setMaintenance(res.data.maintenance))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--gray-50)' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (maintenance && user?.role !== 'admin') {
    return <Maintenance />;
  }

  return children;
};

export default MaintenanceCheck;
