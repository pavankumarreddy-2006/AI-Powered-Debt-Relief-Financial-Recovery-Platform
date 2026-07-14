import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [sessionExpired, setSessionExpired] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => {
    if (searchParams.get('expired') === 'true') {
      setSessionExpired(true);
    }
  }, [searchParams]);

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    setSessionExpired(false);
    try {
      const response = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      localStorage.setItem('token', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      if (err.response && err.response.data) {
        setApiError(err.response.data.detail || 'Login failed. Please verify your credentials.');
      } else {
        setApiError('Unable to connect to the backend server. Please verify your API status.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center relative overflow-hidden px-4">
      {/* Background radial glow */}
      <div className="absolute top-[20%] left-[30%] w-[350px] h-[350px] rounded-full bg-primary-600/10 blur-[100px] animate-pulse-slow"></div>

      <div className="absolute top-6 left-6 z-10">
        <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors text-sm font-medium">
          <ArrowLeft size={16} className="mr-1.5" /> Back to Home
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-primary-500/30">A</div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">Sign in to your account</h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-primary-400 hover:text-primary-300">
            register a new recovery profile
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-800/50 backdrop-blur-md py-8 px-6 border border-slate-800/80 shadow-2xl rounded-2xl sm:px-10">
          {sessionExpired && (
            <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start space-x-2.5">
              <AlertCircle className="text-amber-500 shrink-0" size={18} />
              <p className="text-xs text-amber-200">Your session has expired or is invalid. Please log in again to continue.</p>
            </div>
          )}

          {apiError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start space-x-2.5">
              <AlertCircle className="text-red-500 shrink-0" size={18} />
              <p className="text-xs text-red-200">{apiError}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email input */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-300">Email Address</label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-primary-500 focus:ring-primary-500'} rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all`}
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
              {errors.email && <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password input */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-300">Password</label>
              <div className="mt-1.5 relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className={`block w-full pl-10 pr-4 py-2.5 bg-slate-900 border ${errors.password ? 'border-red-500 focus:ring-red-500' : 'border-slate-700 focus:border-primary-500 focus:ring-primary-500'} rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all`}
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogIn size={18} className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick-Fill Box for Testing */}
          <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 block mb-1">Quick Testing Credentials</span>
            <p className="text-xs text-slate-400">Email: <span className="text-slate-200 font-mono">test@example.com</span></p>
            <p className="text-xs text-slate-400">Password: <span className="text-slate-200 font-mono">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
