import React from 'react';
import './index.css';
const HRPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--brand-primary)', marginBottom: '16px' }}>
        Chào mừng Nhà tuyển dụng (Recruiter / HR)!
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
        Xin chào <strong>{user.email || 'HR'}</strong>. Bạn đã đăng nhập vào hệ thống dành cho Nhà tuyển dụng.
      </p>
    </div>
  );
};
export default HRPage;