import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Trang chủ mặc định CMCV
 */
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '64px 24px',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          display: 'inline-block',
          backgroundColor: 'var(--color-primary-container)',
          color: 'var(--color-on-primary-container)',
          fontSize: '13px',
          fontWeight: 600,
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          marginBottom: '24px'
        }}
      >
        Smart Recruitment Platform
      </div>

      <h1
        style={{
          fontSize: '40px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--color-on-surface)',
          maxWidth: '680px',
          marginBottom: '16px',
          lineHeight: 1.2
        }}
      >
        Nền tảng Tuyển dụng & Phân tích CV Thông minh
      </h1>

      <p
        style={{
          fontSize: '18px',
          color: 'var(--color-on-surface-variant)',
          maxWidth: '560px',
          marginBottom: '36px',
          lineHeight: 1.6
        }}
      >
        Kết nối Nhà tuyển dụng – Ứng viên thông qua công nghệ phân tích và đối chiếu CV tự động. Trải nghiệm nhanh, rõ ràng và đáng tin cậy.
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ padding: '12px 24px', fontSize: '15px' }}
          onClick={() => navigate('/register')}
        >
          Bắt đầu ngay
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: '12px 24px', fontSize: '15px' }}
          onClick={() => navigate('/login')}
        >
          Đăng nhập hệ thống
        </button>
      </div>
    </div>
  );
};

export default HomePage;
