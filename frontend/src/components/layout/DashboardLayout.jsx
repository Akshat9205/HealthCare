import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageMeta = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'Overview of patients, doctors, and medical assignments' };
      case '/patients':
        return { title: 'Patients Directory', subtitle: 'Manage, create, and monitor patient profiles' };
      case '/doctors':
        return { title: 'Doctors Directory', subtitle: 'Explore and maintain healthcare specialists' };
      case '/assignments':
        return { title: 'Doctor Assignments', subtitle: 'Manage active patient-doctor care relationships' };
      case '/profile':
        return { title: 'Account Profile', subtitle: 'View your authenticated credentials and session details' };
      default:
        return { title: 'HealthCare Portal', subtitle: 'Management System' };
    }
  };

  const meta = getPageMeta();

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Header
          onMenuClick={() => setMobileOpen(true)}
          title={meta.title}
          subtitle={meta.subtitle}
        />
        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
