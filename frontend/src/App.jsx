import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HRPage from './pages/hr/index';
import CandidatePage from './pages/candiate/index';
import CandidateProfile from './pages/candiate/CandidateProfile';
import CVUploadPage from './pages/cv/index';
import RecruiterSettings from './pages/hr/RecruiterSettings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Layout chung có Navbar: chỉ dành cho phân hệ ứng viên hoặc khi chưa đăng nhập */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="candidate" element={<CandidatePage />} />
            <Route path="candidate/profile" element={<CandidateProfile />} />
            <Route path="profile" element={<Navigate to="/candidate/profile" replace />} />
            <Route path="cv" element={<CVUploadPage />} />
            <Route path="candidate/cv" element={<CVUploadPage />} />
          </Route>

          {/* Phân hệ Nhà tuyển dụng: không có Navbar ở trên */}
          <Route path="/hr" element={<HRPage />} />
          <Route path="/hr/settings" element={<RecruiterSettings />} />

          {/* Các trang xác thực độc lập */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/auth/login" element={<Navigate to="/login" replace />} />
          <Route path="/auth/register" element={<Navigate to="/register" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;