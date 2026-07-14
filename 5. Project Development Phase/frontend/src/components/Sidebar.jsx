import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Activity,
  Sparkles,
  MailQuestion,
  MessageSquare,
  FileDown,
  User,
  LogOut,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Sync dark class on startup
    const isDark = document.body.classList.contains('dark') || localStorage.getItem('theme') === 'dark';
    if (isDark) {
      document.body.classList.add('dark');
      setDarkMode(true);
    } else {
      document.body.classList.remove('dark');
      setDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setDarkMode(false);
    } else {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Loan Management', path: '/loans', icon: FileSpreadsheet },
    { name: 'Financial Health', path: '/analysis', icon: Activity },
    { name: 'AI Recommendations', path: '/recommendations', icon: Sparkles },
    { name: 'Negotiation Strategy', path: '/negotiation', icon: MailQuestion },
    { name: 'AI Financial Advisor', path: '/chat', icon: MessageSquare },
    { name: 'Reports', path: '/reports', icon: FileDown },
    { name: 'Profile & Settings', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-darkCard border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-primary-500/20">A</div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">ANTI DEBT</span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Shell */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-darkCard border-r border-slate-200 dark:border-slate-800 shadow-sm transition-transform duration-300 ease-in-out lg:translate-x-0
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:static'}
      `}>
        {/* Brand */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary-500/30">A</div>
            <div>
              <span className="font-bold text-lg block leading-none tracking-tight bg-gradient-to-r from-primary-600 to-emerald-500 bg-clip-text text-transparent">ANTI DEBT</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest uppercase">Financial Recovery</span>
            </div>
          </div>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/25' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-200'}
                `}
              >
                <Icon size={18} className={`mr-3.5 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500 group-hover:text-primary-500'}`} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer controls (Theme toggle & Logout) */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/50 space-y-2">
          {/* Theme switcher */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-colors"
          >
            <div className="flex items-center">
              {darkMode ? <Sun size={18} className="mr-3.5 text-amber-500" /> : <Moon size={18} className="mr-3.5 text-slate-400" />}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </div>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors duration-200 ${darkMode ? 'bg-primary-500' : 'bg-slate-300'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform duration-200 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors"
          >
            <LogOut size={18} className="mr-3.5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
};

export default Sidebar;
