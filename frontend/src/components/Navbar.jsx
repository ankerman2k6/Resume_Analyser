import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Menu, Monitor, Moon, Sun, X } from 'lucide-react';
import Logo from './common/Logo';
import { useTheme } from '../theme/ThemeProvider';
import './Navbar.css';

const THEME_LABELS = {
  light: 'Sáng',
  dark: 'Tối',
  system: 'Hệ thống',
};

const ThemeIcon = ({ theme }) => {
  if (theme === 'light') return <Sun aria-hidden="true" />;
  if (theme === 'dark') return <Moon aria-hidden="true" />;
  return <Monitor aria-hidden="true" />;
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, cycleTheme } = useTheme();
  const isLanding = location.pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = 0;
      setIsScrolled(window.scrollY > 12);
    };
    const handleScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  const openSection = (sectionId) => {
    setIsMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  };

  const navItems = [
    ['signal', 'Career Signal'],
    ['proof', 'Sản phẩm'],
    ['workspaces', 'Không gian làm việc'],
  ];

  return (
    <header className={`navbar${isScrolled ? ' navbar--scrolled' : ''}${isLanding ? ' navbar--landing' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__brand" aria-label="KONEK — về trang chủ">
          <Logo size="md" variant={isLanding ? 'dark' : undefined} />
        </Link>

        <nav className="navbar__links" aria-label="Điều hướng trang chủ">
          {navItems.map(([id, label]) => (
            <button key={id} type="button" onClick={() => openSection(id)}>
              {label}
            </button>
          ))}
        </nav>

        <div className="navbar__actions">
          {!isLanding && (
            <button
              type="button"
              className="navbar__theme"
              onClick={cycleTheme}
              aria-label={`Chế độ giao diện: ${THEME_LABELS[theme]}. Nhấn để đổi.`}
              title={`Giao diện: ${THEME_LABELS[theme]}`}
            >
              <ThemeIcon theme={theme} />
              <span>{THEME_LABELS[theme]}</span>
            </button>
          )}
          <Link to="/login" className="navbar__login">Đăng nhập</Link>
          <Link to="/register" className="navbar__cta">
            Bắt đầu
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <button
            type="button"
            className="navbar__menu-button"
            onClick={() => setIsMobileMenuOpen((isOpen) => !isOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
          >
            {isMobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav id="mobile-navigation" className="navbar__mobile" aria-label="Điều hướng di động">
          {navItems.map(([id, label]) => (
            <button key={id} type="button" onClick={() => openSection(id)}>
              {label}
            </button>
          ))}
          <div className="navbar__mobile-divider" />
          <Link to="/candidate">Không gian Ứng viên</Link>
          <Link to="/hr">Không gian Nhà tuyển dụng</Link>
          <div className="navbar__mobile-auth">
            <Link to="/login" className="btn btn-secondary">Đăng nhập</Link>
            <Link to="/register" className="btn btn-primary">Tạo tài khoản</Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
