import React from 'react';
import { BusLogoIcon, TwitterIcon, GithubIcon, MailIcon, BoltBadgeIcon } from './Icons';

interface FooterProps {
  onNavigate?: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="footer-container">
      <div className="footer-inner">
        {/* Left Column: Brand & Info */}
        <div className="footer-col-brand">
          <div className="footer-brand-header">
            <div className="brand-icon-box small">
              <BusLogoIcon size={20} color="#ffffff" />
            </div>
            <span className="footer-brand-name">TransitLK</span>
          </div>
          <p className="footer-brand-desc">
            Making public transport in Sri Lanka simpler. Search bus routes,
            check live seat availability, and book your seat in seconds — no queues, no guesswork.
          </p>
        </div>

        {/* Middle Column: Quick Links */}
        <div className="footer-col-links">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links-list">
            <li>
              <a href="#search" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Search Routes
              </a>
            </li>
            <li>
              <a href="#destinations" onClick={(e) => { e.preventDefault(); onNavigate?.('destinations'); }}>
                Popular Destinations
              </a>
            </li>
            <li>
              <a href="#dashboard" onClick={(e) => { e.preventDefault(); onNavigate?.('dashboard'); }}>
                Operator Dashboard
              </a>
            </li>
            <li>
              <a href="#support" onClick={(e) => { e.preventDefault(); onNavigate?.('support'); }}>
                Help & Support
              </a>
            </li>
          </ul>
        </div>

        {/* Right Column: Connect */}
        <div className="footer-col-connect">
          <h4 className="footer-heading">Connect</h4>
          <div className="footer-social-icons">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="Twitter">
              <TwitterIcon size={18} color="#94A3B8" />
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon-btn" aria-label="GitHub">
              <GithubIcon size={18} color="#94A3B8" />
            </a>
            <a href="mailto:contact@transitlk.com" className="social-icon-btn" aria-label="Email">
              <MailIcon size={18} color="#94A3B8" />
            </a>
          </div>
        </div>
      </div>

      {/* Floating / Bottom "Made in Bolt" badge as seen in screenshots */}
      <div className="bolt-badge-container">
        <a 
          href="https://bolt.new" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="bolt-badge"
        >
          <BoltBadgeIcon size={14} color="#000000" />
          <span>Made in Bolt</span>
        </a>
      </div>
    </footer>
  );
};
