import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, Bell, User, Sparkles } from 'lucide-react';
import HrSidebar from '../components/HrSidebar';
import Logo from '../components/common/Logo';

export const HrLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const location = useLocation();

  // Tiêu đề breadcrumb động dựa trên URL
  const getPageTitle = () => {
    if (location.pathname.includes('/hr/candidates')) return 'Quản lý Ứng viên';
    if (location.pathname.includes('/hr/jobs')) return 'Quản lý Bài tuyển dụng (Jobs)';
    if (location.pathname.includes('/hr/dashboard')) return 'Tổng quan Tuyển dụng (Dashboard)';
    return 'Cổng Nhà tuyển dụng (HR Portal)';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070E18] text-[#051A24] dark:text-[#F8FAFC] flex transition-colors duration-300">
      {/* Sidebar cố định bên trái trên desktop */}
      <HrSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Top Navbar cho Mobile & Header Bar cho HR */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0C1724]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Nút Hamburger menu mở Sidebar trên Mobile */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
              aria-label="Mở Sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-[#2563EB]">
                KONEK ATS // HR PORTAL
              </div>
              <h1 className="text-base font-bold text-[#051A24] dark:text-[#F8FAFC] hidden sm:block">
                {getPageTitle()}
              </h1>
            </div>
          </div>

          {/* User profile & actions ở góc phải */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{user.email || 'recruiter@konek.ai'}</span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-xs">
              {(user.fullName || user.email || 'HR').slice(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page Content Rendered via Outlet */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default HrLayout;
