import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LandingNavbar from '../components/LandingNavbar';
import './MainLayout.css';

/**
 * Main layout wrapper containing the Top Navbar and page outlet
 */
const MainLayout = () => {
  const { pathname } = useLocation();
  return (
    <div className="main-layout">
      {pathname === '/' ? <LandingNavbar /> : <Navbar />}
      <main className="main-content">
        {/* chờ để nhét trang con */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
