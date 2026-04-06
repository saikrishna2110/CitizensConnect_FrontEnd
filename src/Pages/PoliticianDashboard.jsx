import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Filter } from 'lucide-react';
import '../Dashboard.css';

const PoliticianDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/issues?size=50', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setIssues(data.content || []);
      }
    } catch (e) {
      console.error("Failed to load issues", e);
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (id, status) => {
    try {
      alert("Status updated logic goes here.");
    } catch (e) {}
  };

  return (
    <div className="dashboard">
      <section className="hero-section" style={{marginBottom: '2rem'}}>
        <div className="hero card">
          <div className="hero-content">
            <h1>Politician Dashboard</h1>
            <p>Welcome, Representative {user?.name}. Monitor public issues and provide updates.</p>
          </div>
        </div>
      </section>

      <section className="quick-actions" style={{marginBottom: '2rem'}}>
        <div className="actions-card">
           <a href="/updates" className="action-btn primary" style={{display: 'inline-flex'}}>
              Post Public Update
           </a>
        </div>
      </section>

      <section className="activity-section">
        <div className="activity-card" style={{gridColumn: '1 / -1'}}>
          <div className="activity-header">
            <h2>All Constituent Issues</h2>
            <span className="activity-count">{issues.length}</span>
          </div>

          <div className="activity-list">
            {loading ? <p>Loading issues...</p> : issues.length === 0 ? (
              <div className="empty-state">
                <p>No issues reported.</p>
              </div>
            ) : (
              issues.map(issue => (
                <div key={issue.id} className="activity-item">
                  <div className="activity-content">
                    <h4>{issue.title}</h4>
                    <p style={{fontSize: '12px', color: '#666'}}>By {issue.userName} on {new Date(issue.createdAt).toLocaleDateString()}</p>
                    <p>{issue.description}</p>
                    <div className="activity-meta" style={{marginTop: '10px'}}>
                      <span className={`status-badge ${issue.status.toLowerCase()}`}>{issue.status}</span>
                    </div>
                  </div>
                  <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
                     <button className="action-btn secondary" onClick={() => setStatus(issue.id, 'IN_PROGRESS')}>Mark In Progress</button>
                     <button className="action-btn secondary" onClick={() => setStatus(issue.id, 'RESOLVED')}>Mark Resolved</button>
                     <button className="action-btn primary">Respond</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default PoliticianDashboard;
