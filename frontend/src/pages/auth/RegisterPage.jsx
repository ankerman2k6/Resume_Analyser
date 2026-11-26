import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Register.css';
import { registerApi } from '../../services/authService';
import Logo from '../../components/common/Logo';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('candidate');
  const [showPassword, setShowPassword] = useState(false);

  // State quản lý form
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [address, setAddress] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Việt Nam');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading || successMessage) return;
    setErrorMessage('');
    setSuccessMessage('');

    if (!fullName.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên.');
      return;
    }
    if(password.length < 6){
      setErrorMessage('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    } 
    const payload = {
      email: email.trim().toLowerCase(), password, role,
      fullName: fullName.trim(), phone: phone.trim(),
      ...(role === 'candidate' ? {
        avatarUrl: avatarUrl.trim(),
        location: {
          address: address.trim(), district: district.trim(),
          city: city.trim(), country: country.trim(),
        },
      } : {}),
    };
    if (role === 'recruiter') {
      navigate('/register/company', { state: { registration: payload } });
      return;
    }
    setLoading(true);

    try{
      //Gửi json sang be
      await registerApi(payload);
      setSuccessMessage('Đăng ký tài khoản thành công! Đang chuyển đến trang đăng nhập...');

      setTimeout(() => {
        navigate('/login')
      }, 1500);
    } catch(err){
      setErrorMessage(err.message || 'Không thể đăng ký tài khoản.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <Link to="/" className="back-button">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
      </Link>
      <div className="register-container">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <Link to="/" title="Về trang chủ KONEK">
            <Logo size="2xl" className="auth-logo-large" />
          </Link>
        </div>
        <h1 className="register-title">Tạo tài khoản</h1>
        <p className="register-subtitle">Đăng ký để khám phá công việc và tối ưu hóa sơ yếu lý lịch của bạn.</p>
        
        <div className="role-selector">
          <span className="role-label">Đăng ký với tư cách:</span>
          <button 
            type="button"
            className={`role-btn ${role === 'candidate' ? 'active' : ''}`}
            onClick={() => {
            setRole('candidate');
             setErrorMessage('');
              }}
          >
            Ứng viên
          </button>
          <span className="role-divider">|</span>
          <button 
            type="button"
            className={`role-btn ${role === 'recruiter' ? 'active' : ''}`}
            onClick={() => {
            setRole('recruiter');
             setErrorMessage('');
              }}
          >
            Nhà tuyển dụng
          </button>
        </div>

        <div className="auth-tabs">
          <button type="button" className="auth-tab" onClick={() => navigate('/login')}>Đăng nhập</button>
          <button type="button" className="auth-tab active">Đăng ký</button>
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
        {/* Thông báo thành công */}
        {successMessage && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--status-success)',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            marginBottom: '16px'
          }}>
            {successMessage}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Họ và tên</label>
            <input 
              type="text" 
              placeholder="Nguyễn Văn A" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required 
            />
          </div>

          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              placeholder="0901234567"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>

          {role === 'candidate' && (
  <>
    <div className="form-group">
      <label>Ảnh đại diện</label>
      <input
        type="url"
        placeholder="https://example.com/avatar.jpg"
        value={avatarUrl}
        onChange={(event) => setAvatarUrl(event.target.value)}
      />
    </div>

    <div className="form-group">
      <label>Địa chỉ</label>
      <input
        placeholder="Số nhà, tên đường"
        value={address}
        onChange={(event) => setAddress(event.target.value)}
      />
    </div>

    <div className="register-grid">
      <div className="form-group">
        <label>Quận/Huyện</label>
        <input
          value={district}
          onChange={(event) => setDistrict(event.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Thành phố</label>
        <input
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
      </div>
    </div>

    <div className="form-group">
      <label>Quốc gia</label>
      <input
        value={country}
        onChange={(event) => setCountry(event.target.value)}
      />
    </div>
  </>
)}

          <div className="form-group">
            <label>Địa chỉ Email</label>
            <input type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required/>
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
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
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                )}
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading || Boolean(successMessage)}>
            Đăng ký
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginLeft: '8px'}}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </button>
        </form>

        <div className="divider">
        </div>

        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
