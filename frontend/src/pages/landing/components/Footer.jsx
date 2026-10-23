import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../../components/common/Logo';

export function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-shell landing-footer__inner">
        <div>
          <Logo size="sm" variant="dark" />
          <span>Nền tảng kết nối tín hiệu nghề nghiệp với quyết định tuyển dụng.</span>
        </div>
        <nav aria-label="Liên kết cuối trang">
          <Link to="/candidate">Ứng viên</Link>
          <Link to="/hr">Nhà tuyển dụng</Link>
          <Link to="/login">Đăng nhập</Link>
        </nav>
        <small>© {new Date().getFullYear()} KONEK</small>
      </div>
    </footer>
  );
}
