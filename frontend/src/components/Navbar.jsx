import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

/**
 * Top Navbar component
 * Features:
 * - Clean layout with CMCV logo on the left
 * - 2 action buttons on the right: Đăng nhập (Login) and Đăng ký (Register)
 * - Sticky at top, 64px height, warm minimal style
 */
const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-badge">CV</div>
          <div>
            <span className="brand-text">CMCV</span>
            <span className="brand-subtitle">— Smart Recruitment</span>
          </div>
        </Link>

        {/* Action Buttons on the Right */}
        <div className="navbar-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/register')}
          >
            Đăng ký
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
