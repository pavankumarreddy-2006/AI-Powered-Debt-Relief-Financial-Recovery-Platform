import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  User,
  Mail,
  Phone,
  DollarSign,
  Briefcase,
  Save,
  CheckCircle,
  Shield,
  Key
} from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setProfile(response.data);
        // Pre-fill form
        setValue('full_name', response.data.full_name);
        setValue('phone', response.data.phone || '');
        setValue('monthly_income', response.data.monthly_income);
        setValue('occupation', response.data.occupation || '');
      } catch (err) {
        alert('Failed to load user profile.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const onSubmit = async (data) => {
    setUpdating(true);
    setSuccess(false);
    try {
      const response = await api.put('/auth/profile', {
        full_name: data.full_name,
        phone: data.phone || null,
        monthly_income: parseFloat(data.monthly_income),
        occupation: data.occupation || null,
      });
      setProfile(response.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Failed to update profile settings.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-darkBg">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 dark:bg-darkBg">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Account Profile</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Manage your financial evaluation context, income fields, and account settings.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Form Pane */}
        <div className="glass p-6 rounded-2xl shadow-sm space-y-6 lg:col-span-2">
          <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
            <User className="text-primary-500" size={20} />
            <h3 className="font-bold text-base">Personal Parameters</h3>
          </div>

          {success && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center space-x-2">
              <CheckCircle size={16} />
              <span>Profile parameters saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    {...register('full_name', { required: 'Name is required' })}
                  />
                </div>
                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone size={16} />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    placeholder="Provide mobile number"
                    {...register('phone')}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly Income */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Income ($)</label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <DollarSign size={16} />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    {...register('monthly_income', { required: 'Income is required', min: 0 })}
                  />
                </div>
                {errors.monthly_income && <p className="text-red-500 text-xs mt-1">{errors.monthly_income.message}</p>}
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Occupation</label>
                <div className="mt-1.5 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Briefcase size={16} />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    placeholder="Provide occupation role"
                    {...register('occupation')}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex justify-end">
              <button
                type="submit"
                disabled={updating}
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow-md shadow-primary-600/10 flex items-center transition-all disabled:opacity-50"
              >
                {updating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Save size={16} className="mr-1.5" />
                    Save Parameters
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Overview Pane */}
        <div className="space-y-6 lg:col-span-1">
          {/* Metadata Card */}
          <div className="glass p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <Shield className="text-slate-400" size={18} />
              <span className="font-bold text-sm">Security Profile</span>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Auth Email:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{profile.email}</p>
              </div>
              <div>
                <span className="text-slate-400">Created Date:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-100 mt-0.5">{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
              <div className="pt-2 flex items-center text-slate-400">
                <Key className="text-emerald-500 mr-2" size={16} />
                <span>JWT Secure Hashing Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
