import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getAdminStatsApi,
  getUsersApi,
  deleteUserApi,
  getBusesApi,
  deleteBusApi,
  createBusApi,
  type AdminStats,
  type User,
  type Bus,
} from '../services/api';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

type AdminTab = 'overview' | 'buses' | 'users';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { user, token } = useAuth();

  // Active Sidebar Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  // Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);

  // UI States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Add Bus Modal State
  const [showAddBusModal, setShowAddBusModal] = useState(false);
  const [newBusNumber, setNewBusNumber] = useState('');
  const [newOperatorName, setNewOperatorName] = useState('');
  const [newBusType, setNewBusType] = useState<'AC' | 'NON_AC'>('AC');
  const [newFrom, setNewFrom] = useState('Colombo');
  const [newTo, setNewTo] = useState('Kandy');
  const [newDeparture, setNewDeparture] = useState('08:00');
  const [newArrival, setNewArrival] = useState('11:00');
  const [newFare, setNewFare] = useState('500');
  const [newSeats, setNewSeats] = useState('40');
  const [isSubmittingBus, setIsSubmittingBus] = useState(false);

  // Fetch all admin data
  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');

      const [statsRes, usersRes, busesRes] = await Promise.all([
        getAdminStatsApi(token),
        getUsersApi(token),
        getBusesApi(),
      ]);

      if (statsRes.success) setStats(statsRes.data);
      if (usersRes.success) setUsers(usersRes.data);
      if (busesRes.success) setBuses(busesRes.data);
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

  // Handle Delete Bus
  const handleDeleteBus = async (busId: string, busNumber: string) => {
    if (!token) return;
    if (!window.confirm(`Are you sure you want to delete bus "${busNumber}"?`)) {
      return;
    }

    try {
      await deleteBusApi(busId, token);
      setSuccessMsg(`Bus "${busNumber}" deleted successfully.`);
      setBuses((prev) => prev.filter((b) => (b.id || b._id) !== busId));
      // Refresh stats
      const statsRes = await getAdminStatsApi(token);
      if (statsRes.success) setStats(statsRes.data);
    } catch (err: any) {
      setError(err.message || 'Failed to delete bus.');
    }
  };

  // Handle Add Bus Submit
  const handleAddBusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!newBusNumber.trim() || !newOperatorName.trim()) {
      setError('Please fill in all bus information.');
      return;
    }

    if (newFrom.trim().toLowerCase() === newTo.trim().toLowerCase()) {
      setError('Departure and destination locations cannot be identical.');
      return;
    }

    setIsSubmittingBus(true);
    setError('');

    try {
      const res = await createBusApi(
        {
          busNumber: newBusNumber.trim().toUpperCase(),
          operatorName: newOperatorName.trim(),
          busType: newBusType,
          from: newFrom.trim(),
          to: newTo.trim(),
          departureTime: newDeparture,
          arrivalTime: newArrival,
          fare: Number(newFare),
          totalSeats: Number(newSeats),
          routeStops: [newFrom.trim(), newTo.trim()],
          isActive: true,
        },
        token
      );

      if (res.success) {
        setSuccessMsg(`Bus "${newBusNumber.toUpperCase()}" added successfully!`);
        setShowAddBusModal(false);
        // Reset form
        setNewBusNumber('');
        setNewOperatorName('');
        // Reload buses and stats
        const [busesRes, statsRes] = await Promise.all([getBusesApi(), getAdminStatsApi(token)]);
        if (busesRes.success) setBuses(busesRes.data);
        if (statsRes.success) setStats(statsRes.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create bus.');
    } finally {
      setIsSubmittingBus(false);
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
            className={`admin-sidebar-btn ${activeTab === 'buses' ? 'active' : ''}`}
            onClick={() => setActiveTab('buses')}
          >
            <div className="admin-nav-label-group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6v6" />
                <path d="M15 6v6" />
                <path d="M2 12h19.6" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="16" cy="18" r="2" />
              </svg>
              <span>Bus Management</span>
            </div>
            <span className="admin-sidebar-badge">{buses.length}</span>
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
                    Admin Quick Actions
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '16px' }}>
                    Use the sidebar on the left to add, inspect, or delete buses from the transit network, and manage all passenger & owner accounts.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="admin-btn-primary"
                      onClick={() => setActiveTab('buses')}
                    >
                      Manage Buses ({buses.length})
                    </button>
                    <button
                      type="button"
                      className="nav-link-btn"
                      style={{ border: '1px solid #e2e8f0', borderRadius: '10px' }}
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
        {/* TAB 2: BUS MANAGEMENT                               */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'buses' && (
          <div>
            <div className="admin-panel-header">
              <div className="admin-panel-title">
                <h2>Bus Management</h2>
                <p>View, add, and remove buses across Sri Lanka routes</p>
              </div>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={() => setShowAddBusModal(true)}
              >
                + Add New Bus
              </button>
            </div>

            <div className="admin-table-container">
              <div className="admin-table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Bus Number</th>
                      <th>Operator</th>
                      <th>Type</th>
                      <th>Route</th>
                      <th>Schedule</th>
                      <th>Fare</th>
                      <th>Seats</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buses.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                          No buses registered in the system.
                        </td>
                      </tr>
                    ) : (
                      buses.map((bus) => {
                        const busId = bus.id || bus._id || '';
                        return (
                          <tr key={busId}>
                            <td>
                              <strong style={{ color: '#0d1926' }}>{bus.busNumber}</strong>
                            </td>
                            <td>{bus.operatorName}</td>
                            <td>
                              <span
                                className="bus-type-tag"
                                style={{
                                  backgroundColor: bus.busType === 'AC' ? '#e8f8f0' : '#f1f5f9',
                                  color: bus.busType === 'AC' ? '#059669' : '#475569',
                                }}
                              >
                                {bus.busType}
                              </span>
                            </td>
                            <td>
                              {bus.from} <span style={{ color: '#059669' }}>→</span> {bus.to}
                            </td>
                            <td>
                              {bus.departureTime} - {bus.arrivalTime}
                            </td>
                            <td>
                              <strong>Rs. {bus.fare}</strong>
                            </td>
                            <td>{bus.totalSeats}</td>
                            <td>
                              <button
                                type="button"
                                className="admin-btn-sm-danger"
                                onClick={() => handleDeleteBus(busId, bus.busNumber)}
                              >
                                🗑️ Delete
                              </button>
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

        {/* ---------------------------------------------------- */}
        {/* TAB 3: USER MANAGEMENT                              */}
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

      {/* ---------------------------------------------------- */}
      {/* ADD BUS MODAL                                        */}
      {/* ---------------------------------------------------- */}
      {showAddBusModal && (
        <div className="modal-overlay" onClick={() => setShowAddBusModal(false)}>
          <div
            className="modal-content-card"
            style={{ maxWidth: '540px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <h3 className="modal-route-title">Add New Bus</h3>
                <p className="modal-route-sub">Register an intercity express bus to RouteLK</p>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowAddBusModal(false)}
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleAddBusSubmit} className="auth-form">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Bus Number</label>
                    <input
                      type="text"
                      className="auth-input"
                      style={{ paddingLeft: '14px' }}
                      placeholder="e.g. NB-9999"
                      value={newBusNumber}
                      onChange={(e) => setNewBusNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Operator Name</label>
                    <input
                      type="text"
                      className="auth-input"
                      style={{ paddingLeft: '14px' }}
                      placeholder="e.g. Express Travels"
                      value={newOperatorName}
                      onChange={(e) => setNewOperatorName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">From</label>
                    <select
                      className="auth-input"
                      style={{ paddingLeft: '14px' }}
                      value={newFrom}
                      onChange={(e) => setNewFrom(e.target.value)}
                    >
                      <option value="Colombo">Colombo</option>
                      <option value="Kandy">Kandy</option>
                      <option value="Galle">Galle</option>
                      <option value="Matara">Matara</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Negombo">Negombo</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">To</label>
                    <select
                      className="auth-input"
                      style={{ paddingLeft: '14px' }}
                      value={newTo}
                      onChange={(e) => setNewTo(e.target.value)}
                    >
                      <option value="Kandy">Kandy</option>
                      <option value="Colombo">Colombo</option>
                      <option value="Galle">Galle</option>
                      <option value="Matara">Matara</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Negombo">Negombo</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Departure Time</label>
                    <input
                      type="time"
                      className="auth-input"
                      style={{ paddingLeft: '14px' }}
                      value={newDeparture}
                      onChange={(e) => setNewDeparture(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Arrival Time</label>
                    <input
                      type="time"
                      className="auth-input"
                      style={{ paddingLeft: '14px' }}
                      value={newArrival}
                      onChange={(e) => setNewArrival(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <div className="form-group">
                    <label className="form-label">Type</label>
                    <select
                      className="auth-input"
                      style={{ paddingLeft: '14px' }}
                      value={newBusType}
                      onChange={(e) => setNewBusType(e.target.value as 'AC' | 'NON_AC')}
                    >
                      <option value="AC">AC</option>
                      <option value="NON_AC">Non-AC</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fare (LKR)</label>
                    <input
                      type="number"
                      className="auth-input"
                      style={{ paddingLeft: '14px' }}
                      value={newFare}
                      onChange={(e) => setNewFare(e.target.value)}
                      min="50"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Seats</label>
                    <input
                      type="number"
                      className="auth-input"
                      style={{ paddingLeft: '14px' }}
                      value={newSeats}
                      onChange={(e) => setNewSeats(e.target.value)}
                      min="10"
                      max="60"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="nav-link-btn"
                    style={{ flex: 1, border: '1px solid #e2e8f0', borderRadius: '10px' }}
                    onClick={() => setShowAddBusModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="auth-submit-btn"
                    style={{ flex: 2, marginTop: 0 }}
                    disabled={isSubmittingBus}
                  >
                    {isSubmittingBus ? 'Creating...' : 'Save Bus to Fleet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
