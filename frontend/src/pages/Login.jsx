import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Users,
  Stethoscope,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address (e.g. user@example.com).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(formData);
      toast.success('Welcome back! Login successful.');
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Left Column — Animated Visual Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-teal-700 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated Background Glowing Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, -30, 0],
            y: [0, 25, 0],
          }}
          transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut' }}
          className="absolute -bottom-24 -left-24 w-[30rem] h-[30rem] rounded-full bg-teal-400/20 blur-3xl pointer-events-none"
        />

        {/* Top Brand Logo */}
        <div className="relative z-10 flex items-center gap-3.5">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg shadow-black/10"
          >
            <Activity className="w-7 h-7 text-white" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              HealthCare
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-teal-400/30 text-teal-100 border border-teal-300/30">
                Portal
              </span>
            </h1>
            <p className="text-xs text-brand-100">Patient & Doctor Care System</p>
          </div>
        </div>

        {/* Center Hero Information with Animated Floating Cards */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-brand-100 mb-6 border border-white/20 shadow-sm">
              <Sparkles className="w-4 h-4 text-teal-300 animate-pulse" />
              <span>Smart Healthcare Management</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              A Complete Platform for Patient & Doctor Coordination.
            </h2>

            <p className="mt-4 text-brand-100 text-sm sm:text-base leading-relaxed">
              Manage patient records, maintain verified specialist directories, and coordinate treatment plans with speed, clarity, and security.
            </p>
          </motion.div>

          {/* Interactive Floating Micro-Cards */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
              className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg shadow-black/5 hover:bg-white/15 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-400/20 text-teal-200 flex items-center justify-center mb-3">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Patient Records</h4>
              <p className="text-xs text-brand-100 mt-1 leading-snug">
                Complete demographic tracking, profile updates, and history.
              </p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-lg shadow-black/5 hover:bg-white/15 transition-all"
            >
              <div className="w-9 h-9 rounded-xl bg-teal-400/20 text-teal-200 flex items-center justify-center mb-3">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Doctor Directory</h4>
              <p className="text-xs text-brand-100 mt-1 leading-snug">
                Shared specialist network with one-click patient assignments.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center gap-2 text-xs text-brand-100/80"
          >
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Secured with JWT authentication and salted bcrypt password hashing</span>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-xs text-brand-200 flex items-center justify-between">
          <span>© {new Date().getFullYear()} HealthCare System</span>
          <span className="flex items-center gap-1 text-teal-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            System Live
          </span>
        </div>
      </div>

      {/* Right Login Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md shadow-brand-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 leading-tight">HealthCare</h1>
              <p className="text-xs text-slate-500">Management Portal</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your credentials to access your healthcare portal.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-sm flex items-start gap-3"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-soft-sm group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="user@example.com"
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative rounded-xl shadow-soft-sm group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-600 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/25 transition-all focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Clean User-centric Footer Link */}
          <p className="mt-8 text-center text-sm text-slate-500">
            Don't have an account yet?{' '}
            <Link
              to="/register"
              className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
            >
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
