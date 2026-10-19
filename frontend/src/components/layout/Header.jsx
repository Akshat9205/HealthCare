import React, { useState, useEffect } from 'react';
import { Menu, Activity, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../api/authApi';

export const Header = ({ onMenuClick, title, subtitle }) => {
  const { user } = useAuth();
  const [backendStatus, setBackendStatus] = useState('checking'); // 'healthy' | 'unhealthy' | 'checking'

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await authApi.getHealth();
        if (isMounted) {
          if (res?.status === 'healthy') {
            setBackendStatus('healthy');
          } else {
            setBackendStatus('unhealthy');
          }
        }
      } catch {
        if (isMounted) setBackendStatus('unhealthy');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 sm:px-8 flex items-center justify-between sticky top-0 z-20 transition-all">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {title || 'Overview'}
          </h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-500 hidden sm:block mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Live Backend Connection Indicator */}
        <div
          title={
            backendStatus === 'healthy'
              ? 'PostgreSQL & Backend Online'
              : backendStatus === 'unhealthy'
              ? 'Backend Unreachable'
              : 'Verifying Backend...'
          }
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${
            backendStatus === 'healthy'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : backendStatus === 'unhealthy'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === 'healthy'
                ? 'bg-emerald-500 animate-pulse'
                : backendStatus === 'unhealthy'
                ? 'bg-rose-500'
                : 'bg-amber-500 animate-ping'
            }`}
          />
          <span className="hidden sm:inline">
            {backendStatus === 'healthy' ? 'System Healthy' : backendStatus === 'unhealthy' ? 'Offline' : 'Connecting'}
          </span>
        </div>

        {/* User Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
          <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <span className="text-sm font-semibold text-slate-700 hidden md:block">
            {user?.name || 'User'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
