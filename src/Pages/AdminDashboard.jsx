import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, ShieldAlert, Activity, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import '../Dashboard.css';

const API_BASE = 'http://localhost:8080/api/admin';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [pendingPoliticians, setPendingPoliticians] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const getAuthHeader = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json',
  });

  const fetchPendingPoliticians = useCallback(async () => {
    setLoadingList(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/pending-politicians`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setPendingPoliticians(data);
    } catch (err) {
      setError('Failed to load pending politicians: ' + err.message);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingPoliticians();
  }, [fetchPendingPoliticians]);

  const handleAction = async (id, action) => {
    setProcessingId(id);
    setActionMsg('');
    setError('');
    try {
      const res = await fetch(`${API_BASE}/${action}-politician/${id}`, {
        method: 'POST',
        headers: getAuthHeader(),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || `Server error: ${res.status}`);
      setActionMsg(data.message || `Politician ${action}d successfully!`);
      // Remove processed row immediately
      setPendingPoliticians(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="dashboard">
      {/* Hero */}
      <section className="hero-section" style={{ marginBottom: '2rem' }}>
        <div className="hero card">
          <div className="hero-content">
            <h1>Admin Dashboard</h1>
            <p>System Administration Interface. Manage politicians, users, and platform activities.</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon"><Users size={24} /></div>
            <div className="stat-content">
              <h3>Users</h3>
              <p>Manage Accounts</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><Activity size={24} /></div>
            <div className="stat-content">
              <h3>System Data</h3>
              <p>View All Data</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending"><ShieldAlert size={24} /></div>
            <div className="stat-content">
              <h3>Pending</h3>
              <p>{loadingList ? '…' : pendingPoliticians.length} politicians</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pending Politician Approvals */}
      <section className="activity-section">
        <div className="activity-card" style={{ gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2>Pending Politician Approvals</h2>
            <button
              onClick={fetchPendingPoliticians}
              disabled={loadingList}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', fontSize: '0.9rem', background: '#6a5cff', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              <RefreshCw size={14} style={{ animation: loadingList ? 'spin 1s linear infinite' : 'none' }} />
              Refresh
            </button>
          </div>

          {error && (
            <div style={{ color: 'red', background: '#ffe6e6', padding: '10px', borderRadius: '6px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          {actionMsg && (
            <div style={{ color: 'green', background: '#e6ffe6', padding: '10px', borderRadius: '6px', marginBottom: '1rem' }}>
              {actionMsg}
            </div>
          )}

          {loadingList ? (
            <p style={{ textAlign: 'center', color: '#777' }}>Loading…</p>
          ) : pendingPoliticians.length === 0 ? (
            <p className="empty-state">No pending politician registrations.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                <thead>
                  <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                    <th style={th}>Name</th>
                    <th style={th}>Aadhaar</th>
                    <th style={th}>Party</th>
                    <th style={th}>Constituency</th>
                    <th style={th}>Status</th>
                    <th style={th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingPoliticians.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={td}>{p.name}</td>
                      <td style={td}>****{p.aadhaar?.slice(-4)}</td>
                      <td style={td}>{p.partyName || '—'}</td>
                      <td style={td}>{p.constituency || '—'}</td>
                      <td style={td}>
                        <span style={{ background: '#fff3cd', color: '#856404', padding: '2px 10px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {p.status}
                        </span>
                      </td>
                      <td style={td}>
                        <button
                          onClick={() => handleAction(p.id, 'approve')}
                          disabled={processingId === p.id}
                          style={{ background: '#22c55e', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', marginRight: '8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'reject')}
                          disabled={processingId === p.id}
                          style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

const th = { padding: '10px 14px', fontWeight: 'bold', borderBottom: '2px solid #ddd' };
const td = { padding: '10px 14px', verticalAlign: 'middle' };

export default AdminDashboard;
