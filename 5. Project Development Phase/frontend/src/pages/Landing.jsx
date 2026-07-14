import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Brain, FileText, ChevronRight } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-600/10 blur-[120px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-600/10 blur-[120px] animate-pulse-slow"></div>

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center font-bold text-xl shadow-lg shadow-primary-500/20">A</div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">ANTI DEBT</span>
        </div>
        <div className="space-x-4">
          <Link to="/login" className="text-slate-300 hover:text-white font-medium text-sm transition-colors">Sign In</Link>
          <Link to="/register" className="bg-primary-600 hover:bg-primary-500 text-white font-medium text-sm px-4.5 py-2 rounded-xl transition-all shadow-md shadow-primary-600/20">Get Started</Link>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-7xl mx-auto w-full px-6 flex-1 flex flex-col lg:flex-row items-center justify-center py-12 lg:py-24 gap-12 z-10">
        {/* Left Intro text */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-primary-950/60 border border-primary-500/30 text-primary-400 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-ping"></span>
            <span>AI-POWERED FINANCIAL RESTORATION</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight max-w-2xl mx-auto lg:mx-0">
            Break Free from Debt with <span className="bg-gradient-to-r from-primary-400 to-emerald-400 bg-clip-text text-transparent">Intelligent AI</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-lg mx-auto lg:mx-0">
            Manage loans, analyze your DTI, generate AI settlement recommendations, write professional lender letters, and receive real-time coaching from our financial recovery advisor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto bg-gradient-to-r from-primary-600 to-emerald-500 hover:from-primary-500 hover:to-emerald-400 text-white font-semibold px-8 py-3.5 rounded-xl flex items-center justify-center shadow-lg shadow-primary-600/25 transition-all group"
            >
              Start Free Assessment
              <ChevronRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-8 py-3.5 rounded-xl flex items-center justify-center transition-all"
            >
              Sign In to Dashboard
            </Link>
          </div>
        </div>

        {/* Right Feature grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-xl">
          {/* Card 1 */}
          <div className="bg-slate-800/40 border border-slate-800 backdrop-blur-md p-6 rounded-2xl space-y-4 hover:border-primary-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
              <Brain size={24} />
            </div>
            <h3 className="font-bold text-lg text-white">AI Settlement Recommendation</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Our recommendation engine evaluates debt loads and generates optimal settlement target offers and probability indexes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-slate-800/40 border border-slate-800 backdrop-blur-md p-6 rounded-2xl space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <FileText size={24} />
            </div>
            <h3 className="font-bold text-lg text-white">Lender Negotiation Strategy</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create legal-friendly, empathetic settlement request letters and email templates customized for Chase, discover, and other major lenders.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-slate-800/40 border border-slate-800 backdrop-blur-md p-6 rounded-2xl space-y-4 hover:border-primary-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-white">Financial Health Dashboard</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Aggregate liabilities in real-time, compute DTI stress factors, and map out your recovery path with premium interactive charts.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-slate-800/40 border border-slate-800 backdrop-blur-md p-6 rounded-2xl space-y-4 hover:border-emerald-500/40 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-white">Interactive AI Advisor</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Discuss pay-down methods, consolidation options, or settlement timelines with our automated chatbot that stores history.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 bg-slate-950/60 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs gap-4">
          <p>© 2026 Antigravity. All Rights Reserved. Built for Engineering Capstone.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-slate-400">Terms of Use</a>
            <a href="#" className="hover:text-slate-400">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400">Security Standards</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
