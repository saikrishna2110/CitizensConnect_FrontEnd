import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Clock, CheckCircle } from 'lucide-react';
import '../Dashboard.css';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/issues/my-issues?size=50', {
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

  return (
    <div className="dashboard">
      <section className="hero-section" style={{marginBottom: '2rem'}}>
        <div className="hero card">
          <div className="hero-content">
            <h1>Citizen Dashboard</h1>
            <p>Welcome back, {user?.name}. Here you can report new issues and track their progress.</p>
          </div>
        </div>
      </section>

      <section className="quick-actions" style={{marginBottom: '2rem'}}>
        <div className="actions-card">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <a href="/issues" className="action-btn primary">
              <PlusCircle size={20} />
              <span>Report New Issue</span>
            </a>
          </div>
        </div>
      </section>

      <section className="activity-section">
        <div className="activity-card">
          <div className="activity-header">
            <h2>My Reported Issues & Status Tracking</h2>
            <span className="activity-count">{issues.length}</span>
          </div>

          <div className="activity-list">
            {loading ? <p>Loading issues...</p> : issues.length === 0 ? (
              <div className="empty-state">
                <p>You haven't reported any issues yet.</p>
              </div>
            ) : (
              issues.map(issue => (
                <div key={issue.id} className={`activity-item ${issue.status === 'RESOLVED' ? 'solved' : ''}`}>
                  <div className="activity-content">
                    <h4>{issue.title}</h4>
                    <p>{issue.description.substring(0, 100)}...</p>
                    <div className="activity-meta" style={{marginTop: '10px'}}>
                      <span className={`status-badge ${issue.status.toLowerCase()}`}>
                        {issue.status === 'PENDING' ? <Clock size={14} style={{marginRight: '4px'}}/> : null}
                        {issue.status}
                      </span>
                    </div>
                  </div>
                  <div className="activity-actions">
                     <button className="btn-secondary">Give Feedback</button>
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

export default CitizenDashboard;
