import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

/**
 * Top Navbar component
 * Features:
 * - Clean layout with CMCV logo on the left
 * - 2 action buttons on the right: Đăng nhập (Login) and Đăng ký (Register)
 * - Dark mode toggle switch
 * - Sticky at top, 64px height, warm minimal style
 */
const Navbar = () => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check local storage or system preference on mount
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDark(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      setIsDark(false);
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

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
          
          <button 
            type="button" 
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {isDark ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
