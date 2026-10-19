import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  Users,
  Stethoscope,
  Link as LinkIcon,
  User,
  LogOut,
  X,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: Activity },
  { name: 'Patients', to: '/patients', icon: Users },
  { name: 'Doctors', to: '/doctors', icon: Stethoscope },
  { name: 'Assignments', to: '/assignments', icon: LinkIcon },
  { name: 'Profile', to: '/profile', icon: User },
];

export const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();

  const handleNavClick = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-100 shadow-soft-sm select-none">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 6 }}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-brand-500/25 cursor-pointer"
          >
            <Activity className="w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
              Health<span className="text-brand-600">Care</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
              Management Portal
            </p>
          </div>
        </div>
        {setMobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav items with animated active indicator */}
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `relative flex items-center justify-between px-3.5 py-3 text-sm font-medium rounded-xl transition-all group ${
                  isActive
                    ? 'text-brand-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Sliding animated background pill for active state */}
                  {isActive && (
                    <motion.div
                      layoutId="activeSidebarPill"
                      className="absolute inset-0 bg-brand-50 rounded-xl border border-brand-100 shadow-sm"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}

                  <div className="relative z-10 flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                        isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  <ChevronRight
                    className={`relative z-10 w-4 h-4 transition-all duration-200 ${
                      isActive
                        ? 'text-brand-600 opacity-100 translate-x-0'
                        : 'text-slate-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0'
                    }`}
                  />
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User profile & Logout footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/60">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-soft-sm">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold text-xs flex items-center justify-center flex-shrink-0 border border-brand-200">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 z-30">
        {content}
      </aside>

      {/* Mobile Sidebar overlay with smooth backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-72 max-w-[80vw] h-full z-10"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
