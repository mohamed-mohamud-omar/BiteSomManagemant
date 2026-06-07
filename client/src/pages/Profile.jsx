import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { User as UserIcon, Phone, MapPin, CheckCircle, ShieldAlert } from 'lucide-react';
import api from '../services/api.js';
import { updateUserSuccess } from '../features/authSlice.js';
import { useLanguage } from '../context/LanguageContext.jsx';

const Profile = () => {
  const dispatch = useDispatch();
  const { t } = useLanguage();
  const { user } = useSelector((state) => state.auth);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      address: user?.address || '',
      city: user?.city || '',
    }
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (data) => {
    setLoading(true);
    setSuccess(false);
    setError('');

    try {
      const res = await api.put('/auth/profile', data);
      dispatch(updateUserSuccess(res.data.user));
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-black tracking-tight">{t('profile')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Info Card */}
        <div className="glass-card p-6 text-center space-y-4 h-fit">
          <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center font-bold text-2xl mx-auto">
            {user?.fullName.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">{user?.fullName}</h2>
            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-2xs font-extrabold uppercase text-slate-500 mt-1">
              {user?.role}
            </span>
          </div>
          <div className="text-sm text-slate-500 font-mono">
            {user?.email}
          </div>
        </div>

        {/* Form Card */}
        <div className="md:col-span-2 glass-card p-6">
          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-xl flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-sm mb-6">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>Profile updated successfully!</span>
            </div>
          )}

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-sm mb-6">
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  {...register('fullName', { required: 'Full name is required' })}
                  className="pl-10 w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              {errors.fullName && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.fullName.message}</span>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Phone className="w-4 h-4" />
                </span>
                <input
                  type="tel"
                  {...register('phone', { required: 'Phone number is required' })}
                  className="pl-10 w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
              {errors.phone && <span className="text-xs text-rose-500 font-medium mt-1 block">{errors.phone.message}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Default Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    {...register('address')}
                    className="pl-10 w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Default City</label>
                <input
                  type="text"
                  {...register('city')}
                  className="w-full px-4 py-2.5 bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-brand"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand-700 transition disabled:opacity-50"
            >
              {loading ? t('loading') : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
