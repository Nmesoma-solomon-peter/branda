import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import ConfirmModal from '../../components/common/ConfirmModal';

const ROLE_COLORS = {
  admin: { bg: '#FEE2E2', text: '#DC2626' },
  specialist: { bg: '#EDF3E2', text: '#6f9c3e' },
  sme: { bg: '#EEF2FF', text: '#4F46E5' },
};

const PER_PAGE = 10;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [editRole, setEditRole] = useState('');
  const [savingRole, setSavingRole] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then(res => setUsers(res.data.users || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const counts = useMemo(() => {
    const c = { total: users.length, sme: 0, specialist: 0, admin: 0 };
    users.forEach(u => { if (c[u.role] !== undefined) c[u.role]++; });
    return c;
  }, [users]);

  const filtered = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(u =>
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  }, [users, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  useEffect(() => { setPage(1); }, [search]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/users/${deleteTarget._id}`);
      setUsers(prev => prev.filter(u => u._id !== deleteTarget._id));
      setDeleteTarget(null);
    } catch {} finally { setDeleting(false); }
  };

  const handleRoleChange = async () => {
    if (!editTarget || !editRole) return;
    setSavingRole(true);
    try {
      const res = await api.put(`/admin/users/${editTarget._id}/role`, { role: editRole });
      setUsers(prev => prev.map(u => u._id === editTarget._id ? res.data.user : u));
      setEditTarget(null);
    } catch {} finally { setSavingRole(false); }
  };

  const cardStyle = (color) => ({
    background: 'var(--white)',
    border: '1px solid var(--gray-200)',
    borderRadius: 'var(--radius)',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  });

  const labelStyle = {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--gray-500)',
    fontFamily: 'var(--font-body)',
  };

  const numberStyle = {
    fontSize: 32,
    fontWeight: 700,
    fontFamily: 'var(--font-heading)',
    color: 'var(--black)',
    lineHeight: 1,
  };

  const badgeStyle = (role) => {
    const c = ROLE_COLORS[role] || ROLE_COLORS.sme;
    return {
      display: 'inline-block',
      padding: '3px 10px',
      borderRadius: 100,
      fontSize: 12,
      fontWeight: 500,
      background: c.bg,
      color: c.text,
      fontFamily: 'var(--font-body)',
    };
  };

  const actionBtnStyle = (variant) => {
    const base = {
      padding: '5px 12px',
      borderRadius: 4,
      fontSize: 12,
      fontWeight: 500,
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      border: '1px solid',
      transition: 'background 0.15s',
    };
    if (variant === 'edit') return { ...base, background: 'var(--white)', borderColor: 'var(--gray-300)', color: 'var(--gray-700)' };
    if (variant === 'view') return { ...base, background: 'var(--white)', borderColor: 'var(--gray-300)', color: 'var(--gray-700)' };
    if (variant === 'delete') return { ...base, background: '#FEF2F2', borderColor: '#FECACA', color: '#DC2626' };
    return base;
  };

  if (loading) {
    return (
      <div style={{ padding: '32px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ ...cardStyle(), alignItems: 'center' }}>
              <div className="skeleton" style={{ width: 48, height: 32, marginBottom: 4 }} />
              <div className="skeleton" style={{ width: 80, height: 14 }} />
            </div>
          ))}
        </div>
        <div className="skeleton" style={{ height: 48, marginBottom: 16 }} />
        <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ padding: '16px', borderBottom: i < 4 ? '1px solid var(--gray-100)' : 'none', display: 'flex', gap: 16 }}>
              <div className="skeleton" style={{ width: 120, height: 16 }} />
              <div className="skeleton" style={{ width: 160, height: 16 }} />
              <div className="skeleton" style={{ width: 80, height: 16 }} />
              <div className="skeleton" style={{ width: 72, height: 16 }} />
              <div className="skeleton" style={{ width: 100, height: 16, marginLeft: 'auto' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <div style={cardStyle()}>
          <span style={labelStyle}>Total Users</span>
          <span style={numberStyle}>{counts.total}</span>
        </div>
        <div style={cardStyle()}>
          <span style={labelStyle}>SMEs</span>
          <span style={{ ...numberStyle, color: ROLE_COLORS.sme.text }}>{counts.sme}</span>
        </div>
        <div style={cardStyle()}>
          <span style={labelStyle}>Specialists</span>
          <span style={{ ...numberStyle, color: ROLE_COLORS.specialist.text }}>{counts.specialist}</span>
        </div>
        <div style={cardStyle()}>
          <span style={labelStyle}>Admins</span>
          <span style={{ ...numberStyle, color: ROLE_COLORS.admin.text }}>{counts.admin}</span>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%',
            maxWidth: 360,
            padding: '10px 16px',
            border: '1px solid var(--gray-300)',
            borderRadius: 'var(--radius)',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            color: 'var(--black)',
            outline: 'none',
            background: 'var(--white)',
          }}
        />
      </div>

      <div style={{ background: 'var(--white)', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 540 }}>
            <thead>
              <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: 'var(--gray-500)', fontSize: 13 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: 'var(--gray-500)', fontSize: 13 }}>Email</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: 'var(--gray-500)', fontSize: 13 }}>Role</th>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 500, color: 'var(--gray-500)', fontSize: 13 }}>Joined</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: 500, color: 'var(--gray-500)', fontSize: 13 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--gray-400)', fontSize: 14 }}>
                    No users found.
                  </td>
                </tr>
              ) : paged.map(u => (
                <tr key={u._id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 500 }}>{u.name}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--gray-500)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={badgeStyle(u.role)}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--gray-400)', fontSize: 13 }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => { setEditTarget(u); setEditRole(u.role); }}
                        style={actionBtnStyle('edit')}
                      >Edit</button>
                      <button
                        onClick={() => setViewTarget(u)}
                        style={actionBtnStyle('view')}
                      >View</button>
                      <button
                        onClick={() => setDeleteTarget(u)}
                        style={actionBtnStyle('delete')}
                      >Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginTop: 20 }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => { setPage(p); }}
              style={{
                minWidth: 36,
                height: 36,
                padding: '0 8px',
                border: p === safePage ? 'none' : '1px solid var(--gray-200)',
                borderRadius: 'var(--radius)',
                background: p === safePage ? 'var(--black)' : 'var(--white)',
                color: p === safePage ? 'var(--white)' : 'var(--gray-600)',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
              }}
            >{p}</button>
          ))}
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          open={true}
          title="Delete User"
          message={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
          confirmText={deleting ? 'Deleting...' : 'Delete'}
          cancelText="Cancel"
          danger={true}
          onConfirm={handleDelete}
          onCancel={() => { if (!deleting) setDeleteTarget(null); }}
        />
      )}

      {editTarget && (
        <div
          onClick={() => { if (!savingRole) setEditTarget(null); }}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--white)', borderRadius: 'var(--radius)', padding: 28,
              maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Change Role</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 16 }}>
              Update role for <strong>{editTarget.name}</strong>
            </p>
            <select
              value={editRole}
              onChange={e => setEditRole(e.target.value)}
              disabled={savingRole}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 'var(--radius)',
                border: '1px solid var(--gray-300)', fontSize: 14, fontFamily: 'var(--font-body)',
                color: 'var(--black)', background: 'var(--white)', marginBottom: 24, cursor: 'pointer',
              }}
            >
              <option value="sme">SME</option>
              <option value="specialist">Specialist</option>
              <option value="admin">Admin</option>
            </select>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setEditTarget(null)}
                disabled={savingRole}
                style={{
                  padding: '8px 18px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                  border: '1px solid var(--gray-300)', background: 'var(--white)',
                  color: 'var(--gray-600)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >Cancel</button>
              <button
                onClick={handleRoleChange}
                disabled={savingRole || editRole === editTarget.role}
                style={{
                  padding: '8px 18px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                  border: 'none', background: 'var(--green)',
                  color: 'var(--white)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                  opacity: savingRole || editRole === editTarget.role ? 0.6 : 1,
                }}
              >{savingRole ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {viewTarget && (
        <div
          onClick={() => setViewTarget(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--white)', borderRadius: 'var(--radius)', padding: 28,
              maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>User Details</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Name</span>
                <p style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>{viewTarget.name}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Email</span>
                <p style={{ fontSize: 15, marginTop: 4, color: 'var(--gray-600)' }}>{viewTarget.email}</p>
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Role</span>
                <div style={{ marginTop: 6 }}><span style={badgeStyle(viewTarget.role)}>{viewTarget.role}</span></div>
              </div>
              <div>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Joined</span>
                <p style={{ fontSize: 15, marginTop: 4, color: 'var(--gray-600)' }}>{new Date(viewTarget.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
              <button
                onClick={() => setViewTarget(null)}
                style={{
                  padding: '8px 18px', borderRadius: 6, fontSize: 14, fontWeight: 500,
                  border: '1px solid var(--gray-300)', background: 'var(--white)',
                  color: 'var(--gray-600)', cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
