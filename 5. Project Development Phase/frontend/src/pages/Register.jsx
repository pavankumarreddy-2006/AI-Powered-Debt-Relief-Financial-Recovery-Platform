import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Phone, DollarSign, Briefcase, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      await api.post('/auth/register', {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
        phone: data.phone || null,
        monthly_income: parseFloat(data.monthly_income) || 0,
        occupation: data.occupation || null,
      });
      // Redirect to login on success
      navigate('/login?registered=true');
    } catch (err) {
      if (err.response && err.response.data) {
        setApiError(err.response.data.detail || 'Registration failed. Email might already exist.');
      } else {
        setApiError('Unable to connect to the backend server. Please verify your API status.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center relative overflow-y-auto py-12 px-4">
      {/* Background decoration */}
      <div className="absolute top-[10%] right-[20%] w-[350px] h-[350px] rounded-full bg-emerald-600/10 blur-[100px] animate-pulse-slow"></div>

      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft size={16} className="mr-1.5" /> Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/30">A</div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">Create your recovery profile</h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg z-10">
        <div className="bg-slate-800/50 backdrop-blur-md py-8 px-6 border border-slate-800/80 shadow-2xl rounded-2xl sm:px-10">
          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-2.5">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-xs text-red-200">{apiError}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-300">Full Name</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
                    placeholder="John Doe"
                    {...register('full_name', { required: 'Name is required' })}
                  />
                </div>
                {errors.full_name && <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-slate-300">Email Address</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    className="block w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
                    placeholder="name@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-slate-300">Password</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    className="block w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                  />
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-semibold text-slate-300">Phone (Optional)</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Phone size={16} />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
                    placeholder="+1 555-0199"
                    {...register('phone')}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Monthly Income */}
              <div>
                <label className="block text-sm font-semibold text-slate-300">Monthly Net Income ($)</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <DollarSign size={16} />
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    className="block w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
                    placeholder="5000.00"
                    {...register('monthly_income', {
                      required: 'Net income is required',
                      min: { value: 0, message: 'Income must be positive' }
                    })}
                  />
                </div>
                {errors.monthly_income && <p className="mt-1 text-xs text-red-400">{errors.monthly_income.message}</p>}
              </div>

              {/* Occupation */}
              <div>
                <label className="block text-sm font-semibold text-slate-300">Occupation (Optional)</label>
                <div className="mt-1 relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Briefcase size={16} />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-sm"
                    placeholder="Software Engineer"
                    {...register('occupation')}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <UserPlus size={18} className="mr-2" />
                    Register Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
