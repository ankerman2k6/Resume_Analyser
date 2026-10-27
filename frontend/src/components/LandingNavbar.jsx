import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Logo from './common/Logo';
import { Sparkles, Sun, Moon, Menu, X, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';
import './LandingNavbar.css';

/**
 * Top Navbar component for KONEK Platform
 * Features:
 * - Official KONEK SVG Logo with responsive sizing and dark/light mode support
 * - Landing section anchor links with smooth scroll (#features, #case-studies, #pricing)
 * - Navigation links to HR and Candidate portals (/hr, /candidate)
 * - "Yêu cầu Demo" CTA button that triggers the Calibration Booking Modal
 * - Authentication action buttons (Đăng nhập & Đăng ký)
 * - Dark / Light theme toggle switch with persistent storage
 * - Frosted glass backdrop blur on scroll
 * - Mobile responsive drawer menu
 */
const LandingNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldBeDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    setIsDark(shouldBeDark);
    if (shouldBeDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
  }, [location.pathname]);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    const themeStr = nextDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeStr);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', themeStr);
  };

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

  const handleOpenDemoModal = () => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/?demo=true');
      return;
    }
    window.dispatchEvent(
      new CustomEvent('konek:open-demo', {
        detail: { plan: 'Phiên Trao đổi Hiệu chỉnh Tổng quan' },
      })
    );
  };

  return (
    <header className={`landing-navbar ${isScrolled ? 'landing-navbar-scrolled' : ''}`}>
      <div className="landing-navbar-container">
        {/* Brand / Official KONEK Logo */}
        <Link to="/" className="landing-navbar-brand" aria-label="KONEK Home">
          <Logo size="md" className="landing-navbar-logo" />
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="landing-navbar-links" aria-label="Main navigation">
          <button
            type="button"
            className="landing-navbar-link"
            onClick={() => handleNavClick('features')}
          >
            Trụ cột Chính
          </button>
          <button
            type="button"
            className="landing-navbar-link"
            onClick={() => handleNavClick('case-studies')}
          >
            Chứng thực
          </button>
          <button
            type="button"
            className="landing-navbar-link"
            onClick={() => handleNavClick('pricing')}
          >
            Bảng giá
          </button>

          <span className="landing-navbar-divider" aria-hidden="true" />

          {/* Quick links to role spaces */}
          <Link to="/hr" className="landing-navbar-link landing-navbar-link-portal">
            Nhà tuyển dụng
          </Link>
          <Link to="/candidate" className="landing-navbar-link landing-navbar-link-portal">
            Ứng viên
          </Link>
        </nav>

        {/* Action Buttons on the Right */}
        <div className="landing-navbar-actions">


          <button
            type="button"
            className="landing-navbar-btn-auth landing-navbar-btn-login"
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </button>

          <button
            type="button"
            className="landing-navbar-btn-auth landing-navbar-btn-register"
            onClick={() => navigate('/register')}
          >
            Đăng ký
          </button>

          {/* Dark Mode Switcher */}
          <button
            type="button"
            className="landing-theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            title={isDark ? 'Chế độ Sáng' : 'Chế độ Tối'}
          >
            {isDark ? (
              <Sun className="w-4.5 h-4.5 text-amber-400 rotate-0 transition-transform" />
            ) : (
              <Moon className="w-4.5 h-4.5 text-slate-700 transition-transform" />
            )}
          </button>

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
              Trụ cột Chính
            </button>
            <button
              type="button"
              className="landing-navbar-mobile-link"
              onClick={() => handleNavClick('case-studies')}
            >
              Chứng thực Thực tế
            </button>
            <button
              type="button"
              className="landing-navbar-mobile-link"
              onClick={() => handleNavClick('pricing')}
            >
              Bảng giá & Gói dịch vụ
            </button>

            <div className="landing-navbar-mobile-divider" />

            <Link
              to="/hr"
              className="landing-navbar-mobile-link text-[#2563EB] font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cổng Nhà tuyển dụng (HR)
            </Link>
            <Link
              to="/candidate"
              className="landing-navbar-mobile-link text-[#2563EB] font-medium"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cổng Ứng viên (Candidate)
            </Link>
          </div>

          <div className="landing-navbar-mobile-actions">
            <button
              type="button"
              className="landing-navbar-mobile-demo-btn"
              onClick={handleOpenDemoModal}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Yêu cầu Demo KONEK
            </button>

            <div className="landing-navbar-mobile-auth-grid">
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/login');
                }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  navigate('/register');
                }}
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default LandingNavbar;
