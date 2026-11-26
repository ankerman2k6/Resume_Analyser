import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './common/Logo';
import { Menu, X, ChevronDown, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './LandingNavbar.css';

/**
 * Top Navbar component for KONEK Platform
 * Features:
 * - Official KONEK SVG Logo with responsive sizing and dark/light mode support
 * - Landing section anchor links with smooth scroll
 * - Navigation links to HR and Candidate portals (/hr, /candidate)
 * - "Yêu cầu Demo" CTA button that triggers the Calibration Booking Modal
 * - Authentication action buttons (Đăng nhập & Đăng ký)
 * - Frosted glass backdrop blur on scroll
 * - Mobile responsive drawer menu
 */
const LandingNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const accountName = user?.fullName || user?.email?.split('@')[0] || 'Tài khoản';
  const accountInitials = accountName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  // Listen to scroll to apply frosted glass landing-navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsAccountMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return;
    }

    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = (event) => {
    if (location.pathname === '/') {
      event.preventDefault();
      setIsMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAccountNavigate = () => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    navigate(user?.role === 'recruiter' ? '/hr/settings' : '/candidate/profile');
  };

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  return (
    <header className={`landing-navbar ${isScrolled ? 'landing-navbar-scrolled' : ''}`}>
      <div className="landing-navbar-container">
        {/* Brand / Official KONEK Logo */}
        <Link
          to="/"
          className="landing-navbar-brand"
          aria-label="KONEK Home"
          onClick={handleLogoClick}
        >
          <Logo size="lg" className="landing-navbar-logo" />
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="landing-navbar-links" aria-label="Main navigation">
          <button
            type="button"
            className="landing-navbar-link"
            onClick={() => handleNavClick('features')}
          >
            Tính năng
          </button>
          <button
            type="button"
            className="landing-navbar-link"
            onClick={() => handleNavClick('how-it-works')}
          >
            Cách hoạt động
          </button>
          <button
            type="button"
            className="landing-navbar-link"
            onClick={() => handleNavClick('case-studies')}
          >
            Cơ hội
          </button>
          <button
            type="button"
            className="landing-navbar-link"
            onClick={() => handleNavClick('footer')}
          >
            Về chúng tôi
          </button>
        </nav>

        {/* Action Buttons on the Right */}
        <div className="landing-navbar-actions">


          {isAuthenticated ? (
            <div className="landing-account-menu">
              <button
                type="button"
                className="landing-account-trigger"
                onClick={() => setIsAccountMenuOpen((open) => !open)}
                aria-expanded={isAccountMenuOpen}
                aria-haspopup="menu"
              >
                <span className="landing-account-avatar">{accountInitials}</span>
                <span className="landing-account-name">{accountName}</span>
                <ChevronDown size={16} aria-hidden="true" />
              </button>
              {isAccountMenuOpen && (
                <div className="landing-account-dropdown" role="menu">
                  <button type="button" onClick={handleAccountNavigate} role="menuitem">
                    <UserRound size={16} /> Xem tài khoản
                  </button>
                  <button type="button" onClick={handleLogout} role="menuitem">
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button type="button" className="landing-navbar-btn-auth landing-navbar-btn-login" onClick={() => navigate('/login')}>
                Đăng nhập
              </button>
              <button type="button" className="landing-navbar-btn-auth landing-navbar-btn-register" onClick={() => navigate('/register')}>
                Đăng ký
              </button>
            </>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            className="landing-navbar-mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-800 dark:000000" />
            ) : (
              <Menu className="w-6 h-6 text-slate-800 dark:000000" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="landing-navbar-mobile-menu animate-slide-down">
          <div className="landing-navbar-mobile-links">
            <button
              type="button"
              className="landing-navbar-mobile-link"
              onClick={() => handleNavClick('features')}
            >
              Tính năng
            </button>
            <button
              type="button"
              className="landing-navbar-mobile-link"
              onClick={() => handleNavClick('how-it-works')}
            >
              Cách hoạt động
            </button>
            <button
              type="button"
              className="landing-navbar-mobile-link"
              onClick={() => handleNavClick('case-studies')}
            >
              Cơ hội
            </button>

            <button type="button" className="landing-navbar-mobile-link" onClick={() => handleNavClick('footer')}>
              Về chúng tôi
            </button>
          </div>

          <div className="landing-navbar-mobile-actions">
            {isAuthenticated ? (
              <div className="landing-navbar-mobile-auth-grid">
                <button type="button" className="btn btn-secondary w-full" onClick={handleAccountNavigate}>Xem tài khoản</button>
                <button type="button" className="btn btn-primary w-full" onClick={handleLogout}>Đăng xuất</button>
              </div>
            ) : (
              <div className="landing-navbar-mobile-auth-grid">
                <button type="button" className="btn btn-secondary w-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/login'); }}>Đăng nhập</button>
                <button type="button" className="btn btn-primary w-full" onClick={() => { setIsMobileMenuOpen(false); navigate('/register'); }}>Đăng ký</button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
