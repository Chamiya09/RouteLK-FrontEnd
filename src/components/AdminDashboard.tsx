import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAdminStatsApi, type AdminStats } from '../services/api';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await getAdminStatsApi(token);
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load admin metrics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  return (
    <div className="admin-dashboard-wrapper">
      {/* Header */}
      <div className="admin-header-row">
        <div className="admin-title-group">
          <h2>Platform Admin Dashboard</h2>
          <p>
            Logged in as <strong>{user?.name}</strong> ({user?.email}) • System Administrator
          </p>
        </div>
        <button
          className="search-submit-btn"
          style={{ height: '42px', padding: '0 20px', fontSize: '13.5px' }}
          onClick={onBackToHome}
        >
          ← Return to Passenger View
        </button>
      </div>

      {error && (
        <div className="alert-banner alert-error" style={{ marginBottom: '24px' }}>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
          Loading real-time platform metrics from backend...
        </div>
      ) : stats ? (
        <>
          {/* Stat Metric Tiles */}
          <div className="admin-grid">
            <div className="admin-stat-tile">
              <div className="stat-tile-top">
                <span>Total Users</span>
                <span>👥</span>
              </div>
              <span className="stat-tile-value">{stats.totalUsers}</span>
              <span className="stat-tile-sub">Registered accounts</span>
            </div>

            <div className="admin-stat-tile">
              <div className="stat-tile-top">
                <span>Passengers</span>
                <span>🎫</span>
              </div>
              <span className="stat-tile-value">{stats.totalPassengers}</span>
              <span className="stat-tile-sub">Active travelers</span>
            </div>

            <div className="admin-stat-tile">
              <div className="stat-tile-top">
                <span>Bus Owners</span>
                <span>🏢</span>
              </div>
              <span className="stat-tile-value">{stats.totalOwners}</span>
              <span className="stat-tile-sub">Fleet operators</span>
            </div>

            <div className="admin-stat-tile">
              <div className="stat-tile-top">
                <span>Active Buses</span>
                <span>🚌</span>
              </div>
              <span className="stat-tile-value">{stats.totalBuses}</span>
              <span className="stat-tile-sub">AC & Non-AC fleets</span>
            </div>

            <div className="admin-stat-tile">
              <div className="stat-tile-top">
                <span>Total Bookings</span>
                <span>📋</span>
              </div>
              <span className="stat-tile-value">{stats.totalBookings}</span>
              <span className="stat-tile-sub">All-time reservations</span>
            </div>

            <div className="admin-stat-tile">
              <div className="stat-tile-top">
                <span>Confirmed</span>
                <span>✅</span>
              </div>
              <span className="stat-tile-value" style={{ color: '#059669' }}>
                {stats.confirmedBookings}
              </span>
              <span className="stat-tile-sub">Active confirmed trips</span>
            </div>

            <div className="admin-stat-tile">
              <div className="stat-tile-top">
                <span>Cancelled</span>
                <span>❌</span>
              </div>
              <span className="stat-tile-value" style={{ color: '#dc2626' }}>
                {stats.cancelledBookings}
              </span>
              <span className="stat-tile-sub">User cancellations</span>
            </div>

            <div className="admin-stat-tile">
              <div className="stat-tile-top">
                <span>System Status</span>
                <span>⚡</span>
              </div>
              <span className="stat-tile-value" style={{ fontSize: '20px', color: '#059669', paddingTop: '8px' }}>
                Operational
              </span>
              <span className="stat-tile-sub">MongoDB Atlas Connected</span>
            </div>
          </div>

          {/* Action Overview Card */}
          <div className="admin-action-card">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0d1926', marginBottom: '10px' }}>
              University Hackathon Demonstration Guide
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '16px' }}>
              This dashboard fetches live metrics directly from your backend <code>GET /api/admin/statistics</code> endpoint.
              Whenever passengers book or cancel seats on routes like Colombo → Kandy or Colombo → Galle, these numbers update instantly in MongoDB.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span className="feat-chip">Endpoint: /api/admin/statistics</span>
              <span className="feat-chip">Auth: Bearer JWT</span>
              <span className="feat-chip">Role Guard: authorize('admin')</span>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
