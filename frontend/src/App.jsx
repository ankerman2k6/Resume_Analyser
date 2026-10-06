import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import HRPage from './pages/hr/index';
import CandidatePage from './pages/candiate/index';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layout chung có Navbar */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          {/* 2 trang theo role */}
          <Route path="hr" element={<HRPage />} />
          <Route path="candidate" element={<CandidatePage />} />
        </Route>

        {/* Các trang xác thực độc lập */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/auth/login" element={<Navigate to="/login" replace />} />
        <Route path="/auth/register" element={<Navigate to="/register" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;