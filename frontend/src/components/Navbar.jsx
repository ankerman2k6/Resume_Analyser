import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import './Navbar.css';

import logoLight from '../assets/transparent-logo 1.svg';
import logoDark from '../assets/transparent-dark.svg';


/**
 * Top Navbar component
 * Features (theo chuẩn ui-ux skill):
 * - Logo sản phẩm bên trái: Biểu tượng ProductMark hình học + Brand name
 * - 2 nút chức năng: 'Tìm việc làm' (navigates /candidate) và 'Tạo CV' (nút Primary duy nhất, navigates /cv)
 * - Đường chia divider mảnh 1px ngăn nhóm chức năng & nhóm tài khoản
 * - Khi chưa đăng nhập: 2 nút điều hướng 'Đăng nhập' (ghost button) & 'Đăng ký' (outline button)
 * - Khi đã đăng nhập: Hình tròn Avatar đại diện cho trang cá nhân, click mở menu & xem trang cá nhân
 * - Switch / toggle Dark & Light mode icon chuẩn
 * - Chiều cao chuẩn h-16 (64px), sticky, border-bottom mỏng, không đổ bóng trong trang (M15)
 */
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [isDark, setIsDark] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setIsDark(!isDark);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  const isCandidateActive = location.pathname.startsWith('/candidate');
  const isCvActive = location.pathname.startsWith('/cv');
  const isHrRoute = location.pathname.startsWith('/hr');

  const handleCreateCvClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cv' } } });
      return;
    }

    navigate('/cv');
  };

  // Chỉ hiển thị Navbar ở phân hệ ứng viên hoặc khi chưa đăng nhập; ẩn ở phân hệ nhà tuyển dụng
  if (isHrRoute) {
    return null;
  }

  return (
    <header className="navbar" role="banner">
      <div className="navbar-container">
        {/* Left: Brand Logo */}
        <Link to="/" className="navbar-brand" aria-label="CMCV Trang chủ">
          <span className="navbar-brand-badge" aria-hidden="true">
            <img
              src={isDark ? logoDark : logoLight}
              alt="CMCV Logo"
              className="logo"
            />
          </span>
        </Link>

        {/* Right: Actions */}
        <nav className="navbar-nav" aria-label="Điều hướng chính và tài khoản">
          {/* Nhóm 2 nút chức năng */}
          <div className="navbar-group navbar-group--features">
            <button
              type="button"
              className={`btn-nav btn-nav--ghost ${isCandidateActive ? 'is-active' : ''}`}
              onClick={() => navigate('/candidate')}
            >
              <svg
                className="btn-nav-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Tìm việc làm</span>
            </button>

            <button
              type="button"
              className={`btn-nav btn-nav--primary ${isCvActive ? 'is-active' : ''}`}
              onClick={handleCreateCvClick}
              aria-current={isCvActive ? 'page' : undefined}
            >
              <svg
                className="btn-nav-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Tạo CV</span>
            </button>
          </div>

          <div className="navbar-divider" aria-hidden="true" />

          {/* Nhóm tài khoản: Avatar Trang cá nhân (nếu đã đăng nhập) hoặc Đăng nhập / Đăng ký (nếu chưa) */}
          <div className="navbar-group navbar-group--auth">
            {isAuthenticated ? (
              <div className="navbar-user-container" ref={menuRef}>
                <button
                  type="button"
                  className="navbar-avatar-btn"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-expanded={isMenuOpen}
                  aria-haspopup="true"
                  aria-label="Menu trang cá nhân"
                  title="Trang cá nhân"
                >
                  <Avatar
                    src={user?.avatarUrl}
                    name={user?.fullName || user?.email || 'Ứng viên'}
                    seed={user?.id || user?.email}
                    size="md"
                    status="online"
                  />
                </button>

                {isMenuOpen && (
                  <div className="navbar-user-dropdown" role="menu">
                    <div className="dropdown-user-header">
                      <Avatar
                        src={user?.avatarUrl}
                        name={user?.fullName || user?.email || 'Ứng viên'}
                        seed={user?.id || user?.email}
                        size="md"
                      />
                      <div className="dropdown-user-info">
                        <span className="dropdown-user-name">
                          {user?.fullName || 'Ứng viên CMCV'}
                        </span>
                        <span className="dropdown-user-email">
                          {user?.email || 'ungvien@example.com'}
                        </span>
                      </div>
                    </div>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/candidate/profile');
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span>Trang cá nhân</span>
                    </button>

                    <button
                      type="button"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/candidate/profile?tab=resumes');
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                      </svg>
                      <span>CV đã tải lên</span>
                    </button>

                    <button
                      type="button"
                      className="dropdown-item"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        navigate('/candidate/profile?tab=applications');
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      <span>Việc làm đã ứng tuyển</span>
                    </button>

                    <div className="dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-item dropdown-item--danger"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false);
                        logout();
                        navigate('/');
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  className="btn-nav btn-nav--ghost"
                  onClick={() => navigate('/login')}
                >
                  <span>Đăng nhập</span>
                </button>

                <button
                  type="button"
                  className="btn-nav btn-nav--outline"
                  onClick={() => navigate('/register')}
                >
                  <span>Đăng ký</span>
                </button>
              </>
            )}
          </div>

          {/* Nút switch Dark / Light mode */}
          <button
            type="button"
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
            title={isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            {isDark ? (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
