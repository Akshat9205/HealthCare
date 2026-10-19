import React from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Key, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, logout } = useAuth();

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="h-32 bg-gradient-to-r from-medical-600 to-teal-500 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="w-20 h-20 rounded-2xl bg-white p-1 shadow-md">
                <div className="w-full h-full bg-medical-50 text-medical-700 rounded-xl flex items-center justify-center font-bold text-2xl border border-medical-100">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-14 pb-8 px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'Healthcare User'}</h2>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user?.email}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Active Session
                </span>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-medical-600" />
              <h3 className="font-semibold text-slate-800">Account Details</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">User ID</label>
                <div className="mt-1 text-sm font-mono text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 break-all">
                  {user?.id || '—'}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="mt-1 text-sm text-slate-800 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  {user?.name || '—'}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="mt-1 text-sm text-slate-800 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  {user?.email || '—'}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Member Since
                </label>
                <div className="mt-1 text-sm text-slate-800 font-medium bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
                  {formattedDate}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4"
          >
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="w-5 h-5 text-teal-600" />
              <h3 className="font-semibold text-slate-800">Security & Authentication</h3>
            </div>

            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <Key className="w-4 h-4 text-medical-600" />
                  JWT Authentication
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Your session is protected with an industry-standard JSON Web Token, securely attached as a Bearer token on every backend request.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-medium text-slate-800">
                  <Shield className="w-4 h-4 text-teal-600" />
                  Access Privileges
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You possess full CRUD access over your registered patient records and patient-doctor assignments. Doctor directory modifications adhere to resource ownership rules.
                </p>
              </div>

              <div className="pt-2">
                <div className="text-xs text-slate-400">
                  Need to change your credentials or report an access issue? Contact your healthcare system administrator.
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default Profile;
