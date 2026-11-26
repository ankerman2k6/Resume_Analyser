import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginApi } from '../../services/authService';
import Logo from '../../components/common/Logo';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [role, setRole] = useState('candidate');
  const [showPassword, setShowPassword] = useState(false);

  // State cho form và thông báo
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await loginApi(email, password, role);

      login(data);

      const redirectPath = location.state?.from?.pathname;

      // Quay lại trang người dùng định mở trước khi được yêu cầu đăng nhập
      if (data.role === 'admin') {
        navigate('/admin/companies', { replace: true });
      } else if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (data.role === 'candidate') {
        navigate('/candidate/profile');
      } else if (data.role === 'recruiter') {
        navigate('/hr');
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Link to="/" className="back-button" title="Quay lại trang chủ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </Link>
      <div className="login-container">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Link to="/" title="Về trang chủ KONEK">
            <Logo size="2xl" className="auth-logo-large" />
          </Link>
        </div>
        <h1 className="login-title">Chào mừng trở lại</h1>
        <p className="login-subtitle">Đăng nhập để truy cập công việc và thông tin sơ yếu lý lịch của bạn.</p>
        
        

        <div className="auth-tabs">
          <button type="button" className="auth-tab active">Đăng nhập</button>
          <button type="button" className="auth-tab" onClick={() => navigate('/register')}>Đăng ký</button>
        </div>

        {/* Thông báo lỗi nếu có */}
        {errorMessage && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--status-danger)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {errorMessage}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Địa chỉ Email</label>
            <input 
              type="email" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <div className="password-header">
              <label>Mật khẩu</label>
              <Link to="/forgot-password" className="forgot-password">Quên mật khẩu?</Link>
            </div>
            <div className="password-input-wrapper">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button" 
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Ẩn hiện mật khẩu"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '8px'}}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </form>

        <div className="divider">
        </div>

        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
