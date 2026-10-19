import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-lg shadow-slate-100"
      >
        <div className="w-16 h-16 rounded-2xl bg-medical-50 text-medical-600 flex items-center justify-center mx-auto mb-5 border border-medical-100">
          <Activity className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 bg-medical-100 text-medical-700 text-xs font-semibold rounded-full mb-3">
          Error 404
        </span>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-sm text-slate-500 mb-6">
          The healthcare resource or screen you requested does not exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <Link
            to="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-medical-600 hover:bg-medical-700 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
