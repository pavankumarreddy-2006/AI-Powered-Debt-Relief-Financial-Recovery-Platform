import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Home, HelpCircle } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden px-4">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-primary-600/10 blur-[90px] animate-pulse-slow"></div>

      <div className="text-center space-y-6 max-w-md z-10">
        <h1 className="text-8xl font-black text-primary-500 tracking-tight select-none">404</h1>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Page Not Found</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The page you are looking for does not exist, has been moved, or resides behind authentication security.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            to="/dashboard"
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center transition-all shadow-md shadow-primary-600/20"
          >
            <Home size={16} className="mr-1.5" /> Go to Dashboard
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm px-6 py-2.5 rounded-xl flex items-center justify-center transition-all"
          >
            <ArrowLeft size={16} className="mr-1.5" /> Back to Safety
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
