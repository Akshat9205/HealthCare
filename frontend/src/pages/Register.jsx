import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Check,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Register = () => {
  const { register, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    confirmPassword: false,
  });

  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  // Email validation regex (RFC 5322 compatible format)
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
  };

  // Strong password checks
  const passwordRules = useMemo(() => {
    const pwd = formData.password;
    return {
      minLength: pwd.length >= 8,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecial: /[^A-Za-z0-9]/.test(pwd),
    };
  }, [formData.password]);

  const passedRulesCount = useMemo(() => {
    return Object.values(passwordRules).filter(Boolean).length;
  }, [passwordRules]);

  const isPasswordStrong = passedRulesCount === 5;
  const passwordsMatch = formData.password && formData.password === formData.confirmPassword;

  const getStrengthLabel = () => {
    if (!formData.password) return { label: '', color: 'bg-slate-200' };
    if (passedRulesCount <= 2) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    if (passedRulesCount <= 4) return { label: 'Moderate', color: 'bg-amber-500', text: 'text-amber-600' };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
  };

  const strength = getStrengthLabel();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedName = formData.name.trim();
    const trimmedEmail = formData.email.trim();

    if (!trimmedName || !trimmedEmail || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Full name must be at least 2 characters long.');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address (e.g., user@example.com).');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!isPasswordStrong) {
      setError('Password is too weak. Please fulfill all 5 security requirements shown below.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your confirm password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        name: trimmedName,
        email: trimmedEmail,
        password: formData.password,
      });

      toast.success('Registration successful! Logging you in...');
      try {
        await login({ email: trimmedEmail, password: formData.password });
        navigate('/dashboard', { replace: true });
      } catch {
        navigate('/login', { replace: true });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please check your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex overflow-hidden">
      {/* Left Column Visual */}
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

        <div className="relative z-10 flex items-center gap-3">
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
                Register
              </span>
            </h1>
            <p className="text-xs text-brand-100">User Account Registration</p>
          </div>
        </div>

        <div className="relative z-10 my-auto py-8 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-brand-100 mb-6 border border-white/20 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-teal-300" />
              <span>Secure User Registration</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              Manage Patients & Doctor Directories in One Place.
            </h2>

            <p className="mt-4 text-brand-100 text-sm sm:text-base leading-relaxed">
              Create your account to start maintaining patient profiles, accessing the shared doctor directory, and assigning doctors to patients.
            </p>
          </motion.div>

          <div className="mt-8 space-y-3">
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut' }}
              className="flex items-center gap-3 text-sm text-brand-100 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10"
            >
              <CheckCircle2 className="w-5 h-5 text-teal-300 flex-shrink-0" />
              <span>Full control over your registered patient records</span>
            </motion.div>
            <motion.div
              animate={{ x: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="flex items-center gap-3 text-sm text-brand-100 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10"
            >
              <CheckCircle2 className="w-5 h-5 text-teal-300 flex-shrink-0" />
              <span>Connect and map doctors to patient treatment plans</span>
            </motion.div>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 5.5, ease: 'easeInOut' }}
              className="flex items-center gap-3 text-sm text-brand-100 bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/10"
            >
              <CheckCircle2 className="w-5 h-5 text-teal-300 flex-shrink-0" />
              <span>Enhanced password security with bcrypt hashing</span>
            </motion.div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-brand-200">
          © {new Date().getFullYear()} HealthCare Management Systems.
        </div>
      </div>

      {/* Right Form Column */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md py-6"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-brand-600 text-white flex items-center justify-center shadow-md">
              <Activity className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">HealthCare</h1>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Create an account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Sign up as a user to access the healthcare portal.
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex flex-col gap-2.5"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 flex-shrink-0" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
              {error.toLowerCase().includes('already exists') && (
                <Link
                  to="/login"
                  className="self-start inline-flex items-center gap-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 rounded-lg transition-colors shadow-sm ml-8"
                >
                  Sign In to this Account →
                </Link>
              )}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative rounded-xl shadow-soft-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className="block w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 focus:ring-brand-100 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Email Address
                </label>
                {touched.email && formData.email && (
                  <span className={`text-xs font-medium ${isValidEmail(formData.email) ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {isValidEmail(formData.email) ? 'Valid email format' : 'Invalid email format'}
                  </span>
                )}
              </div>
              <div className="relative rounded-xl shadow-soft-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="user@example.com"
                  className={`block w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 transition-all ${
                    touched.email && formData.email && !isValidEmail(formData.email)
                      ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-brand-100 focus:border-brand-500'
                  }`}
                />
                {formData.email && (
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                    {isValidEmail(formData.email) ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500" />
                    )}
                  </div>
                )}
              </div>
              {touched.email && formData.email && !isValidEmail(formData.email) && (
                <p className="mt-1 text-xs text-rose-500">
                  Please enter a valid email address with a domain (e.g. name@domain.com).
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Password
                </label>
                {formData.password && (
                  <span className={`text-xs font-semibold ${strength.text}`}>
                    Strength: {strength.label}
                  </span>
                )}
              </div>
              <div className="relative rounded-xl shadow-soft-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={() => handleBlur('password')}
                  placeholder="Create a strong password"
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

              {/* Password Strength Progress Bar */}
              {formData.password && (
                <div className="mt-2 space-y-1.5">
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-full flex-1 transition-all duration-300 rounded-full ${
                          passedRulesCount >= level ? strength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Requirements Checklist */}
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      {passwordRules.minLength ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 inline-block" />
                      )}
                      <span className={passwordRules.minLength ? 'text-emerald-700 font-medium' : ''}>
                        At least 8 characters
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {passwordRules.hasUpper ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 inline-block" />
                      )}
                      <span className={passwordRules.hasUpper ? 'text-emerald-700 font-medium' : ''}>
                        One uppercase (A-Z)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {passwordRules.hasLower ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 inline-block" />
                      )}
                      <span className={passwordRules.hasLower ? 'text-emerald-700 font-medium' : ''}>
                        One lowercase (a-z)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {passwordRules.hasNumber ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 inline-block" />
                      )}
                      <span className={passwordRules.hasNumber ? 'text-emerald-700 font-medium' : ''}>
                        One number (0-9)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:col-span-2">
                      {passwordRules.hasSpecial ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 flex-shrink-0 inline-block" />
                      )}
                      <span className={passwordRules.hasSpecial ? 'text-emerald-700 font-medium' : ''}>
                        One special character (@, $, !, %, *, #, etc.)
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">
                  Confirm Password
                </label>
                {formData.confirmPassword && (
                  <span className={`text-xs font-medium ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
                  </span>
                )}
              </div>
              <div className="relative rounded-xl shadow-soft-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur('confirmPassword')}
                  placeholder="Repeat your password"
                  className={`block w-full pl-10 pr-10 py-2.5 bg-white border rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-4 transition-all ${
                    touched.confirmPassword && formData.confirmPassword && !passwordsMatch
                      ? 'border-rose-300 focus:ring-rose-100 focus:border-rose-500'
                      : 'border-slate-200 focus:ring-brand-100 focus:border-brand-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/25 transition-all focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <span>Register User Account</span>
              )}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
