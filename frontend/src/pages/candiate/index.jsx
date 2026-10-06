import React from 'react';

const CandidatePage = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <h1 style={{ color: 'var(--brand-secondary)', marginBottom: '16px' }}>
        Chào mừng Ứng viên (Candidate)!
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>
        Xin chào <strong>{user.email || 'Ứng viên'}</strong>. Bạn đã đăng nhập vào hệ thống dành cho Ứng viên.
      </p>
    </div>
  );
};

export default CandidatePage;