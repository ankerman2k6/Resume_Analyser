import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

/**
 * Trang Đăng ký (Placeholder cho phase tiếp theo)
 */
const RegisterPage = () => {
  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-badge">Tạo tài khoản mới</div>
        <h1 className="auth-title">Đây là trang đăng ký</h1>
        <p className="auth-description">
          Chức năng đăng ký tài khoản đang được phát triển theo đúng chuẩn thiết kế CMCV.
        </p>
        <Link to="/" className="auth-back-link">
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
