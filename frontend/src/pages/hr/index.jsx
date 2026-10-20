import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BarChart3, ArrowRight } from 'lucide-react';
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
          Xin chào <strong>{user.email || 'Nhà tuyển dụng'}</strong>. Đây là trang dành riêng cho Nhà tuyển dụng trong hệ thống KONEK — quản lý tin tuyển dụng và sàng lọc hồ sơ ứng viên bằng AI.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center mt-6">
          <Link
            to="/hr/jobs"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
          >
            <span>Chiến dịch Tuyển dụng (Jobs)</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/hr/candidates"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all active:scale-[0.98]"
          >
            <Users className="w-4 h-4" />
            <span>Quản lý Ứng viên</span>
          </Link>

          <Link
            to="/hr/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-all active:scale-[0.98]"
          >
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard Phân tích</span>
          </Link>
        </div>
      </div>
    </main>
  );
};

export default HRPage;