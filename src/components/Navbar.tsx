import React from 'react';
import { BusLogoIcon } from './Icons';

interface NavbarProps {
  onNavigate?: (page: string) => void;
  activePage?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage = 'home' }) => {
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand / Logo */}
        <div className="navbar-brand" onClick={() => onNavigate?.('home')} style={{ cursor: 'pointer' }}>
          <div className="brand-icon-box">
            <BusLogoIcon size={24} color="#ffffff" />
          </div>
          <div className="brand-text-group">
            <span className="brand-name">TransitLK</span>
            <span className="brand-tagline">SRI LANKA BUS BOOKING</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="navbar-nav">
          <button 
            className={`nav-link-btn ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => onNavigate?.('home')}
          >
            Home
          </button>
          <button 
            className={`nav-link-btn ${activePage === 'dashboard' ? 'active' : ''}`}
            onClick={() => onNavigate?.('dashboard')}
          >
            Dashboard
          </button>
        </nav>
      </div>
    </header>
  );
};
