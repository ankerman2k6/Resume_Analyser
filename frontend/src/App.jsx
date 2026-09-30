import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

/**
 * Cấu hình luồng chuyển trang của ứng dụng
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* layout chung */}
        <Route path="/" element={<MainLayout />}>
        {/* các trang con được lắp vào */}
          <Route index element={<HomePage />} />
          {/* Nếu URL là đường dẫn này */}
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          
          
          <Route path="auth/login" element={<Navigate to="/login" replace />} />
          <Route path="auth/register" element={<Navigate to="/register" replace />} />
          
          {/* Catch-all redirect về trang chủ */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;