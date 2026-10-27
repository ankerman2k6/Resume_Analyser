import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Briefcase,
  BarChart3,
  Home,
  LogOut,
  ChevronRight,
  Sun,
  Moon,
  Sparkles,
  ExternalLink,
  X
} from 'lucide-react';
import Logo from './common/Logo';

export const HrSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
      const checkTheme = () => {
        const theme = document.documentElement.getAttribute('data-theme');
        setIsDark(
          theme === 'dark' ||
          document.documentElement.classList.contains('dark') ||
          document.body.classList.contains('dark')
        );
      };
      checkTheme();
      const observer = new MutationObserver(checkTheme);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme']
      });
      return () => observer.disconnect();
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    const themeName = nextTheme ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', themeName);
    if (nextTheme) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
    localStorage.setItem('konek_theme', themeName);
  };

  const menuItems = [
    {
      to: '/hr/dashboard',
      label: 'Tổng quan (Dashboard)',
      icon: BarChart3,
      badge: 'Real-time',
    },
    {
      to: '/hr/jobs',
      label: 'Quản lý Jobs',
      icon: Briefcase,
    },
    {
      to: '/hr/candidates',
      label: 'Quản lý Ứng viên',
      icon: Users,
      badge: 'AI Match',
    },
    {
      to: '/hr',
      label: 'Cổng HR Portal',
      icon: Home,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-[#0C1724] border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Branding Section */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <Link to="/hr" className="flex items-center gap-2.5 group">
            <Logo size="sm" />
            <div>
              <span className="block text-[10px] font-mono font-bold uppercase tracking-wider text-[#2563EB] bg-[#2563EB]/10 dark:bg-[#2563EB]/20 px-1.5 py-0.5 rounded-md w-fit">
                HR ATS
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 md:hidden cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          <div className="px-3 pb-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            ĐIỀU HƯỚNG TUYỂN DỤNG
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/hr'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-slate-400 dark:text-slate-400 group-hover:text-[#2563EB]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md uppercase font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-50 text-[#2563EB] dark:bg-blue-950/60 dark:text-blue-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          {/* Quick link to candidate site */}
          <Link
            to="/"
            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-800/80 text-xs text-slate-600 dark:text-slate-300 transition-colors group"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB]" />
              <span>Xem trang Landing</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* Theme switcher & Logout row */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Giao diện sáng</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-slate-600" />
                  <span>Giao diện tối</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                navigate('/login');
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Đăng xuất"
              aria-label="Đăng xuất"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default HrSidebar;
