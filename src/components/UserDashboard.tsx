import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getMyBookingsApi,
  cancelBookingApi,
  type Booking,
} from '../services/api';

interface UserDashboardProps {
  onBackToSearch: () => void;
}

type UserTab = 'bookings' | 'profile';

export const UserDashboard: React.FC<UserDashboardProps> = ({ onBackToSearch }) => {
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState<UserTab>('bookings');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch current user bookings
  const loadBookings = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const res = await getMyBookingsApi(token);
      if (res.success) {
        setBookings(res.data || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load your bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [token]);

  // Cancel Booking
  const handleCancelBooking = async (bookingId: string) => {
    if (!token) return;
    if (!window.confirm('Are you sure you want to cancel this booking? This will release your reserved seats.')) {
      return;
    }

    try {
      await cancelBookingApi(bookingId, token);
      setSuccessMsg('Booking cancelled successfully.');
      // Refresh list
      loadBookings();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel booking.');
    }
  };

  // Metrics
  const totalBookingsCount = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const totalSpent = bookings
    .filter((b) => b.status === 'CONFIRMED')
    .reduce((acc, curr) => acc + (curr.totalFare || 0), 0);

  return (
    <div className="admin-layout-wrapper">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <div className="admin-sidebar-title">
            <span style={{ fontSize: '20px' }}>🎫</span>
            <span>Passenger Portal</span>
          </div>
          <p style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {user?.name}
          </p>
        </div>

        <nav className="admin-sidebar-nav">
          <button
            type="button"
            className={`admin-sidebar-btn ${activeTab === 'bookings' ? 'active' : ''}`}
            onClick={() => setActiveTab('bookings')}
          >
            <div className="admin-nav-label-group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="3" rx="2" />
                <path d="M7 7h10" />
                <path d="M7 12h10" />
                <path d="M7 17h10" />
              </svg>
              <span>My Bookings</span>
            </div>
            <span className="admin-sidebar-badge">{bookings.length}</span>
          </button>

          <button
            type="button"
            className={`admin-sidebar-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <div className="admin-nav-label-group">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span>My Profile</span>
            </div>
          </button>
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
          <button
            type="button"
            className="search-submit-btn"
            style={{ height: '42px', fontSize: '13px', borderRadius: '10px' }}
            onClick={onBackToSearch}
          >
            🔍 Book New Bus
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
        {/* TAB 1: MY BOOKINGS                                   */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'bookings' && (
          <div>
            <div className="admin-panel-header">
              <div className="admin-panel-title">
                <h2>My Reserved Trips</h2>
                <p>Track your scheduled bus journeys and seat allocations</p>
              </div>
              <button
                type="button"
                className="admin-btn-primary"
                onClick={loadBookings}
                disabled={loading}
              >
                🔄 Refresh Trips
              </button>
            </div>

            {/* Quick Stat Tiles */}
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
              <div className="admin-stat-tile">
                <div className="stat-tile-top">
                  <span>Total Trips</span>
                  <span>🎫</span>
                </div>
                <span className="stat-tile-value">{totalBookingsCount}</span>
                <span className="stat-tile-sub">All reservations</span>
              </div>

              <div className="admin-stat-tile">
                <div className="stat-tile-top">
                  <span>Confirmed</span>
                  <span>✅</span>
                </div>
                <span className="stat-tile-value" style={{ color: '#059669' }}>
                  {confirmedCount}
                </span>
                <span className="stat-tile-sub">Active seat tickets</span>
              </div>

              <div className="admin-stat-tile">
                <div className="stat-tile-top">
                  <span>Total Fare</span>
                  <span>💵</span>
                </div>
                <span className="stat-tile-value" style={{ fontSize: '24px' }}>
                  Rs. {totalSpent}
                </span>
                <span className="stat-tile-sub">LKR spent</span>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="admin-table-container">
              <div className="admin-table-responsive">
                <table className="admin-data-table">
                  <thead>
                    <tr>
                      <th>Booking Ref</th>
                      <th>Route</th>
                      <th>Bus & Operator</th>
                      <th>Travel Date</th>
                      <th>Seats</th>
                      <th>Fare</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: '44px 20px', color: '#64748b' }}>
                          <p style={{ fontSize: '15px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
                            You have no bus bookings yet.
                          </p>
                          <p style={{ fontSize: '13px', marginBottom: '16px' }}>
                            Ready to travel? Search intercity express routes across Sri Lanka!
                          </p>
                          <button
                            type="button"
                            className="admin-btn-primary"
                            onClick={onBackToSearch}
                          >
                            Find Buses Now
                          </button>
                        </td>
                      </tr>
                    ) : (
                      bookings.map((b) => {
                        const bookingId = b._id || b.id || '';
                        const busObj: any = b.busId || {};
                        const isConfirmed = b.status === 'CONFIRMED';
                        return (
                          <tr key={bookingId}>
                            <td>
                              <strong style={{ color: '#059669', letterSpacing: '0.04em' }}>
                                {b.bookingId}
                              </strong>
                            </td>
                            <td>
                              <strong>{busObj.from || 'Colombo'}</strong>{' '}
                              <span style={{ color: '#059669' }}>→</span>{' '}
                              <strong>{busObj.to || 'Kandy'}</strong>
                            </td>
                            <td>
                              <div>{busObj.operatorName || 'RouteLK Travels'}</div>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                {busObj.busNumber} • {busObj.busType || 'AC'}
                              </span>
                            </td>
                            <td>
                              <strong>{b.travelDate}</strong>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                {busObj.departureTime || '08:00'} - {busObj.arrivalTime || '11:00'}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                                {b.seats.map((seatNum) => (
                                  <span
                                    key={seatNum}
                                    style={{
                                      background: '#e8f8f0',
                                      color: '#059669',
                                      fontWeight: 700,
                                      fontSize: '11px',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    #{seatNum}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <strong>Rs. {b.totalFare}</strong>
                              <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                                (Rs. {b.farePerSeat} × {b.passengerCount})
                              </div>
                            </td>
                            <td>
                              <span
                                className="bus-type-tag"
                                style={{
                                  backgroundColor: isConfirmed ? '#e8f8f0' : '#fef2f2',
                                  color: isConfirmed ? '#059669' : '#dc2626',
                                  fontWeight: 700,
                                }}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td>
                              {isConfirmed ? (
                                <button
                                  type="button"
                                  className="admin-btn-sm-danger"
                                  onClick={() => handleCancelBooking(bookingId)}
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '12px' }}>Cancelled</span>
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

        {/* ---------------------------------------------------- */}
        {/* TAB 2: MY PROFILE                                    */}
        {/* ---------------------------------------------------- */}
        {activeTab === 'profile' && (
          <div>
            <div className="admin-panel-header">
              <div className="admin-panel-title">
                <h2>Account Profile</h2>
                <p>Personal information and registration details</p>
              </div>
            </div>

            <div className="admin-action-card" style={{ maxWidth: '640px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '24px' }}>
                <div
                  className="user-avatar-small"
                  style={{ width: '56px', height: '56px', fontSize: '22px' }}
                >
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0d1926' }}>{user?.name}</h3>
                  <span
                    className="role-badge"
                    style={{
                      background: '#e8f8f0',
                      color: '#059669',
                      fontSize: '11px',
                      marginTop: '4px',
                      display: 'inline-block',
                    }}
                  >
                    {user?.role?.toUpperCase()} ACCOUNT
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Email Address
                  </span>
                  <p style={{ fontSize: '15px', color: '#0d1926', fontWeight: 600, marginTop: '2px' }}>
                    {user?.email}
                  </p>
                </div>

                <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Contact Phone
                  </span>
                  <p style={{ fontSize: '15px', color: '#0d1926', fontWeight: 600, marginTop: '2px' }}>
                    {user?.phone || 'Not provided'}
                  </p>
                </div>

                <div>
                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>
                    Account Security
                  </span>
                  <p style={{ fontSize: '13.5px', color: '#64748b', marginTop: '2px' }}>
                    Your password is encrypted using salted bcrypt hashes. Authenticated using JWT Bearer sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
