import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAdminStatsApi,
  getUsersApi,
  deleteUserApi,
  type AdminStats,
  type User,
} from '../services/api';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

type AdminTab = 'overview' | 'users';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { user, token } = useAuth();

  // Active Sidebar Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch admin overview and users
  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');

      const [statsRes, usersRes] = await Promise.all([
        getAdminStatsApi(token),
        getUsersApi(token),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  // Handle Delete User
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return;
    }

    try {
      await deleteUserApi(userId, token);
      setSuccessMsg(`User "${userName}" deleted successfully.`);
      setUsers((prev) => prev.filter((u) => (u.id || u._id) !== userId));
      // Refresh stats
      const statsRes = await getAdminStatsApi(token);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'role-admin';
      case 'owner':
        return 'role-owner';
      default:
        return 'role-passenger';
    }
  };

  return (
    <div className="admin-layout-wrapper">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-title">
            <span style={{ fontSize: '20px' }}>⚡</span>
            <span>Admin Portal</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            Logged in as {user?.name?.split(' ')[0]}
          </p>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            type="button"
            className={`admin-sidebar-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <div className="admin-nav-label-group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="7" height="9" x="3" y="3" rx="1" />
                <rect width="7" height="5" x="14" y="3" rx="1" />
                <rect width="7" height="9" x="14" y="12" rx="1" />
                <rect width="7" height="5" x="3" y="16" rx="1" />
              </svg>
              <span>Dashboard</span>
            </div>
            <span className="admin-sidebar-badge">Live</span>
          </button>

          <button
            type="button"
            className={`admin-sidebar-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <div className="admin-nav-label-group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span>User Management</span>
            </div>
            <span className="admin-sidebar-badge">{users.length}</span>
          </button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
          <button
            type="button"
            className="nav-link-btn"
            style={{ width: '100%', textAlign: 'center', border: '1px solid #e2e8f0', borderRadius: '10px' }}
            onClick={onBackToHome}
          >
            ← Passenger View
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main-panel">
        {error && (
          <div className="alert-banner alert-error" style={{ marginBottom: '18px' }}>
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert-banner alert-success" style={{ marginBottom: '18px' }}>
            <span>{successMsg}</span>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: OVERVIEW / STATISTICS                         */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'overview' && (
          <div>
            <div className="admin-panel-header">
              <div className="admin-panel-title">
                <h2>System Overview</h2>
                <p>Real-time analytics and transit fleet performance</p>
              </div>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={loadData}
                disabled={loading}
              >
                🔄 Refresh Metrics
              </button>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
                Loading live statistics from backend...
              </div>
            ) : stats ? (
              <>
                <div className="admin-grid">
                  <div className="admin-stat-tile">
                    <div className="stat-tile-top">
                      <span>Total Users</span>
                      <span>👥</span>
                    </div>
                    <span className="stat-tile-value">{stats.totalUsers}</span>
                    <span className="stat-tile-sub">{stats.totalPassengers} Passengers</span>
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
                    <span className="stat-tile-sub">AC & Non-AC</span>
                  </div>

                  <div className="admin-stat-tile">
                    <div className="stat-tile-top">
                      <span>Total Bookings</span>
                      <span>📋</span>
                    </div>
                    <span className="stat-tile-value">{stats.totalBookings}</span>
                    <span className="stat-tile-sub">All reservations</span>
                  </div>

                  <div className="admin-stat-tile">
                    <div className="stat-tile-top">
                      <span>Confirmed Trips</span>
                      <span>✅</span>
                    </div>
                    <span className="stat-tile-value" style={{ color: '#059669' }}>
                      {stats.confirmedBookings}
                    </span>
                    <span className="stat-tile-sub">Active seat locks</span>
                  </div>

                  <div className="admin-stat-tile">
                    <div className="stat-tile-top">
                      <span>Cancelled Trips</span>
                      <span>❌</span>
                    </div>
                    <span className="stat-tile-value" style={{ color: '#dc2626' }}>
                      {stats.cancelledBookings}
                    </span>
                    <span className="stat-tile-sub">Released seats</span>
                  </div>

                  <div className="admin-stat-tile">
                    <div className="stat-tile-top">
                      <span>Database Engine</span>
                      <span>🍃</span>
                    </div>
                    <span className="stat-tile-value" style={{ fontSize: '22px', color: '#059669' }}>
                      Atlas
                    </span>
                    <span className="stat-tile-sub">Connected: routelk db</span>
                  </div>

                  <div className="admin-stat-tile">
                    <div className="stat-tile-top">
                      <span>System Status</span>
                      <span>⚡</span>
                    </div>
                    <span className="stat-tile-value" style={{ fontSize: '20px', color: '#059669', paddingTop: '4px' }}>
                      Operational
                    </span>
                    <span className="stat-tile-sub">Zero downtime</span>
                  </div>
                </div>

                <div className="admin-action-card">
                  <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0d1926', marginBottom: '8px' }}>
                    User Administration
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '16px' }}>
                    Use the <strong>User Management</strong> section on the left sidebar to inspect all registered passenger and owner accounts, verify account roles, and manage user access.
                  </p>
                  <div>
                    <button
                      type="button"
                      className="admin-btn-primary"
                      onClick={() => setActiveTab('users')}
                    >
                      Manage Users ({users.length})
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: USER MANAGEMENT                              */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'users' && (
          <div>
            <div className="admin-panel-header">
              <div className="admin-panel-title">
                <h2>User Management</h2>
                <p>Registered passengers, fleet owners, and system administrators</p>
              </div>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={loadData}
                disabled={loading}
              >
                🔄 Refresh Users
              </button>
            </div>

            <div className="admin-table-container">
              <div className="admin-table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                          No users found in database.
                        </td>
                      </tr>
                    ) : (
                      users.map((u) => {
                        const userId = u.id || u._id || '';
                        const isSelf = u.email === user?.email;
                        return (
                          <tr key={userId}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span className="user-avatar-small" style={{ width: '26px', height: '26px' }}>
                                  {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                                </span>
                                <strong style={{ color: '#0d1926' }}>{u.name}</strong>
                                {isSelf && (
                                  <span style={{ fontSize: '11px', color: '#059669', fontWeight: 600 }}>
                                    (You)
                                  </span>
                                )}
                              </div>
                            </td>
                            <td>{u.email}</td>
                            <td>{u.phone || '—'}</td>
                            <td>
                              <span className={`role-badge ${getRoleBadgeClass(u.role)}`}>
                                {u.role}
                              </span>
                            </td>
                            <td style={{ color: '#64748b', fontSize: '12.5px' }}>
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                            </td>
                            <td>
                              {isSelf ? (
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>Protected</span>
                              ) : (
                                <button
                                  type="button"
                                  className="admin-btn-sm-danger"
                                  onClick={() => handleDeleteUser(userId, u.name)}
                                >
                                  🗑️ Delete
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
