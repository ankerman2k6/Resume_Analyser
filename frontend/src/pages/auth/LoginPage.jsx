import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

/**
 * Trang Đăng nhập (Placeholder cho phase tiếp theo)
 */
const LoginPage = () => {
  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-badge">Xác thực tài khoản</div>
        <h1 className="auth-title">Đây là trang đăng nhập</h1>
        <p className="auth-description">
          Chức năng đăng nhập đang được phát triển theo đúng chuẩn thiết kế CMCV.
        </p>
        <Link to="/" className="auth-back-link">
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
