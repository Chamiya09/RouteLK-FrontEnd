import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getBusSeatsApi,
  createBookingApi,
  type BusSeatAvailability,
  type CreateBookingResponse,
} from '../services/api';

export interface BusSummary {
  id: string;
  busNumber: string;
  operatorName: string;
  busType: 'AC' | 'NON_AC';
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  fare: number;
  totalSeats: number;
  availableSeats?: number;
}

interface SeatBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus: BusSummary | null;
  travelDate: string;
  onNavigateToDashboard?: () => void;
  onNavigateToLogin?: () => void;
}

export const SeatBookingModal: React.FC<SeatBookingModalProps> = ({
  isOpen,
  onClose,
  bus,
  travelDate,
  onNavigateToDashboard,
  onNavigateToLogin,
}) => {
  const { user, token, isAuthenticated, login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seatData, setSeatData] = useState<BusSeatAvailability | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);

  // Booking states
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<CreateBookingResponse['booking'] | null>(null);

  // Quick inline login state if not logged in
  const [showInlineLogin, setShowInlineLogin] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Fetch real seat availability whenever modal opens for a bus & date
  useEffect(() => {
    if (!isOpen || !bus) return;

    let isMounted = true;
    const fetchSeats = async () => {
      setLoading(true);
      setError('');
      setBookingError('');
      setSelectedSeats([]);
      setConfirmedBooking(null);

      try {
        const res = await getBusSeatsApi(bus.id, travelDate);
        if (isMounted && res.success) {
          setSeatData(res.data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Failed to fetch live seat availability.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSeats();
    return () => {
      isMounted = false;
    };
  }, [isOpen, bus, travelDate]);

  if (!isOpen || !bus) return null;

  // Toggle seat selection
  const handleToggleSeat = (seatNumber: number) => {
    if (confirmedBooking) return; // Locked once booked
    if (seatData?.bookedSeats?.includes(seatNumber)) return; // Cannot select booked seats

    setSelectedSeats((prev) => {
      if (prev.includes(seatNumber)) {
        return prev.filter((s) => s !== seatNumber);
      } else {
        if (prev.length >= 6) {
          alert('You can select a maximum of 6 seats per booking.');
          return prev;
        }
        return [...prev, seatNumber].sort((a, b) => a - b);
      }
    });
  };

  // Confirm Reservation
  const handleConfirmBooking = async () => {
    if (!isAuthenticated || !token) {
      setShowInlineLogin(true);
      return;
    }

    if (selectedSeats.length === 0) {
      setBookingError('Please select at least one seat to reserve.');
      return;
    }

    setIsBooking(true);
    setBookingError('');

    try {
      const res = await createBookingApi(
        {
          busId: bus.id,
          travelDate,
          seats: selectedSeats,
        },
        token
      );

      if (res.success && res.booking) {
        setConfirmedBooking(res.booking);
      } else {
        setBookingError(res.message || 'Booking could not be confirmed.');
      }
    } catch (err: any) {
      setBookingError(err.message || 'Booking reservation failed. Please try again.');
    } finally {
      setIsBooking(false);
    }
  };

  // Quick inline login handler
  const handleInlineLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      await login(loginEmail.trim(), loginPassword);
      setShowInlineLogin(false);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoginLoading(false);
    }
  };

  const totalFareAmount = selectedSeats.length * bus.fare;
  const totalBusSeats = seatData?.totalSeats || bus.totalSeats || 40;
  const bookedSeatSet = new Set(seatData?.bookedSeats || []);

  // Generate rows of seats (2 x 2 layout with center aisle)
  const rowsCount = Math.ceil(totalBusSeats / 4);
  const seatRows: number[][] = [];
  for (let r = 0; r < rowsCount; r++) {
    const rowSeats: number[] = [];
    for (let c = 1; c <= 4; c++) {
      const seatNum = r * 4 + c;
      if (seatNum <= totalBusSeats) {
        rowSeats.push(seatNum);
      }
    }
    seatRows.push(rowSeats);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content-card"
        style={{ maxWidth: '780px', maxHeight: '92vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="bus-type-tag" style={{ margin: 0 }}>
                {bus.busType}
              </span>
              <strong style={{ fontSize: '17px', color: '#0d1926' }}>{bus.operatorName}</strong>
              <span style={{ fontSize: '13px', color: '#64748b' }}>({bus.busNumber})</span>
            </div>
            <p className="modal-route-sub" style={{ margin: 0 }}>
              <span>{bus.from}</span> <span style={{ color: '#059669' }}>→</span> <span>{bus.to}</span> • Travel Date:{' '}
              <strong style={{ color: '#0f172a' }}>{travelDate}</strong> ({bus.departureTime} - {bus.arrivalTime})
            </p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} title="Close">
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {error && (
            <div className="alert-banner alert-error" style={{ marginBottom: '16px' }}>
              <span>{error}</span>
            </div>
          )}

          {bookingError && (
            <div className="alert-banner alert-error" style={{ marginBottom: '16px' }}>
              <span>{bookingError}</span>
            </div>
          )}

          {/* CONFIRMED BOOKING SUCCESS SCREEN */}
          {confirmedBooking ? (
            <div className="booking-success-view">
              <div className="success-icon-circle">✓</div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#0d1926', marginBottom: '4px' }}>
                  Reservation Confirmed!
                </h3>
                <p style={{ color: '#64748b', fontSize: '13.5px' }}>
                  Your seats on {confirmedBooking.bus || bus.busNumber} are officially locked in the database.
                </p>
              </div>

              <div className="ticket-summary-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                  <span style={{ color: '#64748b' }}>Booking Reference:</span>
                  <strong style={{ color: '#059669', letterSpacing: '0.04em' }}>{confirmedBooking.bookingId}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Route:</span>
                  <strong>
                    {confirmedBooking.from || bus.from} → {confirmedBooking.to || bus.to}
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Travel Date:</span>
                  <strong>{confirmedBooking.travelDate}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Reserved Seats:</span>
                  <strong style={{ color: '#059669' }}>
                    {confirmedBooking.seats.map((s) => `#${s}`).join(', ')} ({confirmedBooking.passengerCount} passenger{confirmedBooking.passengerCount > 1 ? 's' : ''})
                  </strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                  <span style={{ color: '#64748b' }}>Total Fare Paid:</span>
                  <strong style={{ fontSize: '16px', color: '#0d1926' }}>Rs. {confirmedBooking.totalFare}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '360px', marginTop: '8px' }}>
                <button
                  type="button"
                  className="nav-link-btn"
                  style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '8px', textAlign: 'center' }}
                  onClick={onClose}
                >
                  Book Another
                </button>
                {onNavigateToDashboard && (
                  <button
                    type="button"
                    className="primary-action-btn"
                    style={{ flex: 1.3, padding: '10px 14px' }}
                    onClick={() => {
                      onClose();
                      onNavigateToDashboard();
                    }}
                  >
                    🎫 View in My Trips
                  </button>
                )}
              </div>
            </div>
          ) : loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
              <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
              <span>Connecting to database & loading date-specific seat layout...</span>
            </div>
          ) : (
            /* INTERACTIVE SEAT SELECTION LAYOUT */
            <div className="seat-booking-modal-grid">
              {/* LEFT: Bus Cabin Graphic */}
              <div>
                <div className="bus-cabin-wrapper">
                  {/* Bus Front Section */}
                  <div className="bus-cabin-front">
                    <div className="bus-entry-indicator">
                      🚪 Entrance Door
                    </div>
                    <div className="bus-driver-indicator">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2v20" />
                        <path d="M2 12h20" />
                      </svg>
                      <span>Driver</span>
                    </div>
                  </div>

                  {/* Seat Grid */}
                  <div className="seat-grid-container">
                    {seatRows.map((row, rIdx) => {
                      const leftPair = row.slice(0, 2);
                      const rightPair = row.slice(2, 4);

                      return (
                        <div key={rIdx} className="seat-row">
                          {/* Left 2 Seats (Window + Aisle) */}
                          <div className="seat-pair">
                            {leftPair.map((seatNum) => {
                              const isBooked = bookedSeatSet.has(seatNum);
                              const isSelected = selectedSeats.includes(seatNum);
                              let seatClass = 'seat-cell available';
                              if (isBooked) seatClass = 'seat-cell booked';
                              else if (isSelected) seatClass = 'seat-cell selected';

                              return (
                                <button
                                  key={seatNum}
                                  type="button"
                                  className={seatClass}
                                  disabled={isBooked}
                                  onClick={() => handleToggleSeat(seatNum)}
                                  title={
                                    isBooked
                                      ? `Seat #${seatNum} is booked`
                                      : isSelected
                                      ? `Seat #${seatNum} selected (click to deselect)`
                                      : `Seat #${seatNum} available (Rs. ${bus.fare})`
                                  }
                                >
                                  {isSelected ? '✓' : seatNum}
                                </button>
                              );
                            })}
                          </div>

                          {/* Aisle Space */}
                          <div className="seat-aisle-spacer">
                            <span>AISLE</span>
                          </div>

                          {/* Right 2 Seats (Aisle + Window) */}
                          <div className="seat-pair">
                            {rightPair.map((seatNum) => {
                              const isBooked = bookedSeatSet.has(seatNum);
                              const isSelected = selectedSeats.includes(seatNum);
                              let seatClass = 'seat-cell available';
                              if (isBooked) seatClass = 'seat-cell booked';
                              else if (isSelected) seatClass = 'seat-cell selected';

                              return (
                                <button
                                  key={seatNum}
                                  type="button"
                                  className={seatClass}
                                  disabled={isBooked}
                                  onClick={() => handleToggleSeat(seatNum)}
                                  title={
                                    isBooked
                                      ? `Seat #${seatNum} is booked`
                                      : isSelected
                                      ? `Seat #${seatNum} selected (click to deselect)`
                                      : `Seat #${seatNum} available (Rs. ${bus.fare})`
                                  }
                                >
                                  {isSelected ? '✓' : seatNum}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="seat-legend-bar">
                    <div className="legend-item">
                      <div className="legend-swatch" style={{ background: '#ffffff', border: '1.5px solid #94a3b8' }} />
                      <span>Available</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-swatch" style={{ background: '#059669' }} />
                      <span>Selected</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-swatch" style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0' }} />
                      <span>Booked</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT: Selection Summary & Checkout */}
              <div className="checkout-sidebar">
                <div className="checkout-summary-card">
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0d1926', margin: 0 }}>
                    Reservation Summary
                  </h4>

                  <div className="checkout-row">
                    <span>Fare Per Seat:</span>
                    <strong>Rs. {bus.fare}</strong>
                  </div>

                  <div>
                    <span style={{ fontSize: '13px', color: '#64748b' }}>Selected Seats:</span>
                    {selectedSeats.length === 0 ? (
                      <p style={{ fontSize: '12.5px', color: '#94a3b8', margin: '4px 0 0' }}>
                        Click on seats in the layout to select
                      </p>
                    ) : (
                      <div className="selected-seats-badge-row">
                        {selectedSeats.map((s) => (
                          <span key={s} className="selected-seat-chip">
                            Seat #{s}
                            <span
                              style={{ cursor: 'pointer', marginLeft: '2px', fontWeight: 'bold' }}
                              onClick={() => handleToggleSeat(s)}
                            >
                              ✕
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="checkout-row total">
                    <span>Total Amount:</span>
                    <span style={{ color: '#059669', fontSize: '19px' }}>
                      Rs. {totalFareAmount}
                    </span>
                  </div>

                  {/* Passenger / Auth Status */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                    {isAuthenticated && user ? (
                      <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '10px', fontSize: '12.5px' }}>
                        <div style={{ fontWeight: 700, color: '#0d1926' }}>
                          Passenger: {user.name}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '11.5px' }}>
                          {user.email} {user.phone ? `• ${user.phone}` : ''}
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          background: '#fffbeb',
                          border: '1px solid #fde68a',
                          borderRadius: '10px',
                          padding: '10px',
                          fontSize: '12.5px',
                          color: '#92400e',
                        }}
                      >
                        <span>Please sign in to link this reservation to your account.</span>
                      </div>
                    )}
                  </div>

                  {/* Main Action Button */}
                  {isAuthenticated ? (
                    <button
                      type="button"
                      className="auth-submit-btn"
                      style={{ marginTop: '6px' }}
                      disabled={selectedSeats.length === 0 || isBooking}
                      onClick={handleConfirmBooking}
                    >
                      {isBooking
                        ? 'Confirming with Database...'
                        : selectedSeats.length === 0
                        ? 'Select Seats to Book'
                        : `Confirm Reservation (Rs. ${totalFareAmount})`}
                    </button>
                  ) : (
                    <div>
                      {!showInlineLogin ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <button
                            type="button"
                            className="auth-submit-btn"
                            style={{ marginTop: '6px' }}
                            onClick={() => setShowInlineLogin(true)}
                          >
                            Sign In to Confirm Booking
                          </button>
                          {onNavigateToLogin && (
                            <button
                              type="button"
                              className="nav-link-btn"
                              style={{ textAlign: 'center', fontSize: '12px' }}
                              onClick={() => {
                                onClose();
                                onNavigateToLogin();
                              }}
                            >
                              Go to full Login page
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Inline Quick Login Box */
                        <form onSubmit={handleInlineLoginSubmit} style={{ marginTop: '8px' }}>
                          {loginError && (
                            <div style={{ color: '#dc2626', fontSize: '12px', marginBottom: '8px' }}>
                              {loginError}
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                              type="email"
                              className="auth-input"
                              placeholder="Email address"
                              style={{ height: '36px', fontSize: '13px', paddingLeft: '10px' }}
                              value={loginEmail}
                              onChange={(e) => setLoginEmail(e.target.value)}
                              required
                            />
                            <input
                              type="password"
                              className="auth-input"
                              placeholder="Password"
                              style={{ height: '36px', fontSize: '13px', paddingLeft: '10px' }}
                              value={loginPassword}
                              onChange={(e) => setLoginPassword(e.target.value)}
                              required
                            />
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                type="button"
                                className="nav-link-btn"
                                style={{ flex: 1, border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px' }}
                                onClick={() => setShowInlineLogin(false)}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                className="auth-submit-btn"
                                style={{ flex: 1.5, marginTop: 0, height: '36px', fontSize: '13px' }}
                                disabled={loginLoading}
                              >
                                {loginLoading ? 'Signing In...' : 'Sign In'}
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
