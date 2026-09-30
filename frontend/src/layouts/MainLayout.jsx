import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import './MainLayout.css';

/**
 * Main layout wrapper containing the Top Navbar and page outlet
 */
const MainLayout = () => {
  return (
    <div className="main-layout">
      <Navbar />
      <main className="main-content">
        {/* chờ để nhét trang con */}
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
