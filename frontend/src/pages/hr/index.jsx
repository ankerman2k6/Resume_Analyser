import React from 'react';
import './index.css';

const HRPage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <main className="hr-intro-page">
      <div className="hr-intro-container">
        <span className="hr-intro-badge">Phân hệ Nhà tuyển dụng</span>

        <h1 className="hr-intro-title">
          Không gian dành cho Nhà tuyển dụng (Recruiter / HR)
        </h1>

        <p className="hr-intro-desc">
          Xin chào <strong>{user.email || 'Nhà tuyển dụng'}</strong>. Đây là trang dành riêng cho Nhà tuyển dụng trong hệ thống CMCV — quản lý tin tuyển dụng và sàng lọc hồ sơ ứng viên.
        </p>
      </div>
    </main>
  );
};

export default HRPage;