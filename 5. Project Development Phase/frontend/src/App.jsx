import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Loans from './pages/Loans';
import Analysis from './pages/Analysis';
import Recommendations from './pages/Recommendations';
import Negotiation from './pages/Negotiation';
import Chat from './pages/Chat';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

const ProtectedLayout = ({ children }) => {
  return (
    <ProtectedRoute>
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-slate-50 dark:bg-darkBg text-slate-800 dark:text-slate-100">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Onboarding & Authentication */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Dashboard Shell */}
        <Route
          path="/dashboard"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />
        <Route
          path="/loans"
          element={
            <ProtectedLayout>
              <Loans />
            </ProtectedLayout>
          }
        />
        <Route
          path="/analysis"
          element={
            <ProtectedLayout>
              <Analysis />
            </ProtectedLayout>
          }
        />
        <Route
          path="/recommendations"
          element={
            <ProtectedLayout>
              <Recommendations />
            </ProtectedLayout>
          }
        />
        <Route
          path="/negotiation"
          element={
            <ProtectedLayout>
              <Negotiation />
            </ProtectedLayout>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedLayout>
              <Chat />
            </ProtectedLayout>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedLayout>
              <Reports />
            </ProtectedLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedLayout>
              <Profile />
            </ProtectedLayout>
          }
        />

        {/* 404 Fallback */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
