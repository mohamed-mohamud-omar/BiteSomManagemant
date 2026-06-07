import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Phone, ArrowRight, ShieldAlert, BadgeInfo } from 'lucide-react';
import { useForm } from 'react-hook-form';
import api from '../services/api.js';
import { authStart, authSuccess, authFailure, clearError } from '../features/authSlice.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { loading, error, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      redirectUser(user.role);
    }
  }, [user]);

  const redirectUser = (role) => {
    switch (role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'restaurant_manager':
        navigate('/restaurant');
        break;
      case 'driver':
        navigate('/driver');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const onSubmit = async (data) => {
    dispatch(authStart());
    try {
      const response = await api.post('/auth/register', {
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role
      });
      dispatch(authSuccess(response.data));
      redirectUser(response.data.user.role);
    } catch (err) {
      dispatch(authFailure(err.response?.data?.message || 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors">
      <div className="max-w-md w-full space-y-6 glass-card p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-brand/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/5 rounded-full blur-2xl"></div>

        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight">{t('register')}</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Join the BiteSom delivery family today!
          </p>
        </div>

        {error && (
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <UserIcon className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Ahmed Ali"
                {...register('fullName', { required: 'Full name is required' })}
                className="pl-10 w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
              />
            </div>
            {errors.fullName && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.fullName.message}</span>}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                placeholder="ahmed@example.com"
                {...register('email', { 
                  required: 'Email address is required',
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                className="pl-10 w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
              />
            </div>
            {errors.email && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.email.message}</span>}
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone Number</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Phone className="w-4 h-4" />
              </span>
              <input
                type="tel"
                placeholder="+25261xxxxxxx"
                {...register('phone', { required: 'Phone number is required' })}
                className="pl-10 w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
              />
            </div>
            {errors.phone && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.phone.message}</span>}
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Register As</label>
            <select
              {...register('role', { required: 'Selecting a role is required' })}
              className="w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
            >
              <option value="customer" className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">Customer (Place Orders)</option>
              <option value="restaurant_manager" className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">Restaurant Manager (Manage Menu & Orders)</option>
              <option value="driver" className="bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100">Delivery Driver (Accept & Carry Deliveries)</option>
            </select>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="pl-10 w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
            {errors.password && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.password.message}</span>}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                {...register('confirmPassword', { 
                  required: 'Confirming your password is required',
                  validate: (value) => value === watch('password') || 'Passwords do not match'
                })}
                className="pl-10 w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
              />
            </div>
            {errors.confirmPassword && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.confirmPassword.message}</span>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 bg-brand text-white font-bold rounded-xl shadow-lg shadow-brand/20 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand transition disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
          >
            {loading ? t('loading') : (
              <>
                <span>Sign Up</span>
                <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-0.5 transition" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand font-bold hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
