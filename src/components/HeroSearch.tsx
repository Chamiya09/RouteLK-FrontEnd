import React, { useState } from 'react';

interface BusResult {
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
  availableSeats: number;
}

export const HeroSearch: React.FC = () => {
  const [fromLocation, setFromLocation] = useState('Colombo');
  const [toLocation, setToLocation] = useState('Kandy');
  const [busType, setBusType] = useState('ALL');
  const [travelDate, setTravelDate] = useState('2026-09-10');

  const [buses, setBuses] = useState<BusResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchError('');

    try {
      const queryParams = new URLSearchParams({
        from: fromLocation,
        to: toLocation,
        travelDate,
        busType,
      });

      const res = await fetch(`http://localhost:5000/api/buses/search?${queryParams.toString()}`);
      const data = await res.json();

      if (data.success) {
        setBuses(data.data || []);
      } else {
        setBuses([]);
        setSearchError(data.message || 'No buses found for this search.');
      }
      setShowModal(true);
    } catch (err: any) {
      // Fallback demo results if backend not started yet
      setBuses([
        {
          id: '1',
          busNumber: 'NB-1234',
          operatorName: 'Sunil Travels',
          busType: 'AC',
          from: fromLocation,
          to: toLocation,
          departureTime: '08:00 AM',
          arrivalTime: '11:00 AM',
          fare: 500,
          totalSeats: 40,
          availableSeats: 36,
        },
        {
          id: '2',
          busNumber: 'NC-5678',
          operatorName: 'Lanka Express',
          busType: 'NON_AC',
          from: fromLocation,
          to: toLocation,
          departureTime: '09:30 AM',
          arrivalTime: '01:00 PM',
          fare: 350,
          totalSeats: 50,
          availableSeats: 48,
        },
      ]);
      setShowModal(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-badge-pill">
            <span>🇱🇰</span>
            <span>Sri Lanka's Next-Gen Transit Network</span>
          </div>

          <h1 className="hero-title">
            Find Your Bus, <br />
            <span className="highlight-green">Reserve Your Seat</span>
          </h1>

          <p className="hero-subtitle">
            Skip the terminal lines. Browse AC & Non-AC intercity express buses, compare live fares, and book verified seats in advance.
          </p>

          {/* Search Card */}
          <div className="search-card-wrapper">
            <form className="search-card-form" onSubmit={handleSearch}>
              <div className="search-inputs-grid">
                {/* From Location */}
                <div className="search-input-group">
                  <label className="input-label">Leaving From</label>
                  <div className="input-field-box">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <select
                      className="custom-select"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                    >
                      <option value="Colombo">Colombo (Fort / Bastian)</option>
                      <option value="Kandy">Kandy (Goods Shed)</option>
                      <option value="Galle">Galle</option>
                      <option value="Matara">Matara</option>
                      <option value="Jaffna">Jaffna</option>
                      <option value="Kurunegala">Kurunegala</option>
                      <option value="Negombo">Negombo</option>
                    </select>
                  </div>
                </div>

                {/* To Location */}
                <div className="search-input-group">
                  <label className="input-label">Going To</label>
                  <div className="input-field-box">
                    <svg className="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2">
                      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <select
                      className="custom-select"
                      value={toLocation}
                      onChange={(e) => setToLocation(e.target.value)}
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

                {/* Travel Date */}
                <div className="search-input-group">
                  <label className="input-label">Date</label>
                  <div className="input-field-box">
                    <input
                      type="date"
                      className="custom-select"
                      style={{ border: 'none', background: 'transparent' }}
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bus Type */}
                <div className="search-input-group">
                  <label className="input-label">Bus Type</label>
                  <div className="input-field-box">
                    <select
                      className="custom-select"
                      value={busType}
                      onChange={(e) => setBusType(e.target.value)}
                    >
                      <option value="ALL">All Types</option>
                      <option value="AC">AC Express</option>
                      <option value="NON_AC">Non-AC</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="search-submit-btn" disabled={isSearching}>
                {isSearching ? (
                  <span>Searching schedule...</span>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <circle cx="11" cy="11" r="8" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <span>Search Available Buses</span>
                  </>
                )}
              </button>

              <div className="trust-badges-row">
                <div className="trust-badge-item">
                  <span>✓</span>
                  <span>Live Date-Specific Seat Map</span>
                </div>
                <div className="trust-badge-item">
                  <span>✓</span>
                  <span>Instant Booking Confirmation</span>
                </div>
                <div className="trust-badge-item">
                  <span>✓</span>
                  <span>Verified Highway Express</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* "The Problem" Section */}
      <section className="problem-section">
        <div className="problem-container">
          <div className="problem-card">
            <span className="problem-badge">THE PROBLEM IN SRI LANKA</span>
            <h2 className="problem-title">
              Public bus travel in Sri Lanka is stressful, unpredictable, and inefficient.
            </h2>
            <p className="problem-description">
              Thousands of daily commuters stand in crowded terminals like Bastian Mawatha with no certainty of getting a seat. RouteLK centralizes schedules, live availability, and direct booking in one accessible web application.
            </p>

            <div className="problem-grid">
              <div className="problem-grid-item">
                <div className="problem-icon-wrapper">
                  <span style={{ fontSize: '20px' }}>⏱️</span>
                </div>
                <h3 className="problem-item-title">No Real-time Schedules</h3>
                <p className="problem-item-desc">
                  Passengers rely on word-of-mouth with no reliable updates on departure or arrival times.
                </p>
              </div>

              <div className="problem-grid-item">
                <div className="problem-icon-wrapper">
                  <span style={{ fontSize: '20px' }}>💺</span>
                </div>
                <h3 className="problem-item-title">Zero Seat Guarantee</h3>
                <p className="problem-item-desc">
                  Passengers often stand for 3+ hours on intercity routes due to overcrowded buses.
                </p>
              </div>

              <div className="problem-grid-item">
                <div className="problem-icon-wrapper">
                  <span style={{ fontSize: '20px' }}>💵</span>
                </div>
                <h3 className="problem-item-title">Unclear Fares</h3>
                <p className="problem-item-desc">
                  Inconsistent fare expectations between AC highway express and regular route buses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* "How It Works" Section */}
      <section className="how-it-works-section">
        <div className="how-it-works-container">
          <div className="section-header-center">
            <h2 className="section-main-title">How RouteLK Works</h2>
            <p className="section-sub-title">Book your next trip in 3 effortless steps</p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-card-top">
                <div className="step-icon-badge">
                  <span>🔍</span>
                </div>
                <span className="step-number-text">01</span>
              </div>
              <h3 className="step-title">Search Routes</h3>
              <p className="step-desc">
                Select your origin, destination, travel date, and preferred bus type (AC or Non-AC).
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-top">
                <div className="step-icon-badge">
                  <span>🎯</span>
                </div>
                <span className="step-number-text">02</span>
              </div>
              <h3 className="step-title">Select Seats</h3>
              <p className="step-desc">
                View the interactive date-specific seat layout and pick your exact seat numbers.
              </p>
            </div>

            <div className="step-card">
              <div className="step-card-top">
                <div className="step-icon-badge">
                  <span>🎫</span>
                </div>
                <span className="step-number-text">03</span>
              </div>
              <h3 className="step-title">Instant Confirmation</h3>
              <p className="step-desc">
                Receive your unique booking reference ID (e.g. RLK-10001) with server-verified fares.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Search Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-route-title">
                  <span>{fromLocation}</span>
                  <span className="route-arrow">→</span>
                  <span>{toLocation}</span>
                </h3>
                <p className="modal-route-sub">
                  Travel Date: <strong>{travelDate}</strong> • Found {buses.length} buses
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              {searchError && (
                <div className="alert-banner alert-error" style={{ marginBottom: '16px' }}>
                  <span>{searchError}</span>
                </div>
              )}

              <div className="bus-list">
                {buses.map((bus) => (
                  <div key={bus.id} className="bus-result-card">
                    <div className="bus-card-left">
                      <div className="bus-operator-badge">
                        <h4>{bus.operatorName}</h4>
                        <span className="bus-type-tag">{bus.busType}</span>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>({bus.busNumber})</span>
                      </div>

                      <div className="bus-schedule-row">
                        <div className="schedule-point">
                          <span className="time">{bus.departureTime}</span>
                          <span className="station">{bus.from}</span>
                        </div>
                        <div className="schedule-duration">
                          <span>Express</span>
                          <div className="duration-line"></div>
                        </div>
                        <div className="schedule-point">
                          <span className="time">{bus.arrivalTime}</span>
                          <span className="station">{bus.to}</span>
                        </div>
                      </div>

                      <div className="features-tags-row">
                        <span className="feat-chip">Comfort Seats</span>
                        <span className="feat-chip">{bus.busType === 'AC' ? 'Air Conditioned' : 'Standard'}</span>
                        <span className="feat-chip">Luggage Space</span>
                      </div>
                    </div>

                    <div className="bus-card-right">
                      <div className="price-tag-group">
                        <span className="price-amount">Rs. {bus.fare}</span>
                        <span className="price-sub">per seat</span>
                      </div>
                      <div className="seats-avail-tag">
                        <span>●</span>
                        <span>{bus.availableSeats} seats left</span>
                      </div>
                      <button
                        className="book-now-btn"
                        onClick={() => {
                          alert(`Booking flow: Selected bus ${bus.busNumber} (${bus.operatorName}) for Rs. ${bus.fare}. Please log in to complete reservation.`);
                        }}
                      >
                        Select Seats
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
