import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Scale,
  Compass,
  Zap,
  TrendingDown,
  ShieldCheck,
  Clock
} from 'lucide-react';
import api from '../services/api';

const Analysis = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      const response = await api.get('/analyze/history');
      setHistory(response.data);
      if (response.data.length > 0) {
        setActiveAnalysis(response.data[0]); // Default to latest run
      }
    } catch (err) {
      setError('Failed to load analysis logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setError('');
    try {
      const response = await api.post('/analyze');
      setActiveAnalysis(response.data);
      fetchHistory(); // Refresh history
    } catch (err) {
      setError('Analysis failed. Please check your liability profiles.');
    } finally {
      setAnalyzing(false);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Financial Health Analysis</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Calculate Debt-to-Income ratios, Stress Scores, and audit your financial stability metrics.</p>
        </div>
        <button
          onClick={handleRunAnalysis}
          disabled={analyzing}
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm px-4.5 py-2.5 rounded-xl shadow-md shadow-primary-600/20 flex items-center transition-all"
        >
          {analyzing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5"></div>
          ) : (
            <Zap size={16} className="mr-1.5" />
          )}
          Trigger Financial Audit
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Main Analysis Display Panel */}
      <AnimatePresence mode="wait">
        {activeAnalysis ? (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left side: Main statistics */}
            <div className="lg:col-span-2 space-y-6">
              {/* Health overview cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* DTI Card */}
                <div className="glass p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Debt-to-Income (DTI) Ratio</span>
                  <h2 className="text-3xl font-extrabold mt-1">{(activeAnalysis.debt_to_income_ratio * 100).toFixed(1)}%</h2>
                  <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-500">
                    <span className={`w-2 h-2 rounded-full ${
                      activeAnalysis.debt_to_income_ratio > 0.5 
                        ? 'bg-red-500 animate-pulse' 
                        : activeAnalysis.debt_to_income_ratio > 0.3 
                          ? 'bg-yellow-500' 
                          : 'bg-green-500'
                    }`}></span>
                    <span>
                      {activeAnalysis.debt_to_income_ratio > 0.5 
                        ? 'Critical Range (>50%): Extreme financial stress' 
                        : activeAnalysis.debt_to_income_ratio > 0.3 
                          ? 'Moderate Range (30-50%): High financial drag' 
                          : 'Healthy Range (<30%): Stable leverage'}
                    </span>
                  </div>
                </div>

                {/* surplus Card */}
                <div className="glass p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Remaining Monthly Disposable Surplus</span>
                  <h2 className="text-3xl font-extrabold mt-1">${activeAnalysis.monthly_surplus.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                  <p className="text-xs text-slate-500 mt-3">Estimated net cash flow remaining for savings or emergency reserves.</p>
                </div>
              </div>

              {/* Stress & stability indicators */}
              <div className="glass p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-6">
                <h3 className="font-bold text-base">Stress & Stability Index</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {/* Stress index */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400">Debt Stress Index:</span>
                      <span className="text-red-500">{activeAnalysis.debt_stress_index.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full rounded-full" style={{ width: `${activeAnalysis.debt_stress_index}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">Represents debt strain based on active interest rates, balances, and overdue durations.</p>
                  </div>

                  {/* Stability score */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-semibold">
                      <span className="text-slate-400">Financial Stability Score:</span>
                      <span className="text-emerald-500">{activeAnalysis.stability_score.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${activeAnalysis.stability_score}%` }}></div>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">Borrower resilience factor. Higher numbers signify greater buffer capacities.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Indicators & details */}
            <div className="space-y-6">
              {/* Hardship Indicator status */}
              <div className={`p-6 rounded-2xl border shadow-sm space-y-4 ${
                activeAnalysis.status_indicator === 'Red'
                  ? 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
                  : activeAnalysis.status_indicator === 'Yellow'
                    ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600 dark:text-yellow-400'
                    : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
              }`}>
                <div className="flex items-center space-x-2.5 border-b border-black/10 dark:border-white/10 pb-3">
                  {activeAnalysis.status_indicator === 'Red' ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                  <span className="font-extrabold text-sm uppercase tracking-wider">Hardship Category Indicator</span>
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-black">{activeAnalysis.status_indicator} Zone Warning</h4>
                  <p className="text-xs leading-relaxed opacity-80">
                    {activeAnalysis.status_indicator === 'Red'
                      ? "High Risk: Your debt obligations have triggered critical constraints. Professional restructuring, consolidation, or creditor settlement requests are strongly advised."
                      : activeAnalysis.status_indicator === 'Yellow'
                        ? "Moderate Risk: Financial commitments are consuming substantial cash reserves. Implement debt pay-down plans to shield credit ratings and prevent collections."
                        : "Low Risk: Financial indicators reflect healthy stability. Maintain a structured budget and payoff targets to secure long-term relief."}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="glass p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col items-center justify-center text-center py-20 text-slate-400 space-y-3">
            <Scale size={48} className="text-slate-300 dark:text-slate-600" />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">No Audits Run Yet</h3>
            <p className="text-sm max-w-sm">Run a financial assessment audit using the trigger button at the top right to calculate your health indices.</p>
          </div>
        )}
      </AnimatePresence>

      {/* Analysis History Logs Timeline */}
      <div className="glass p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Clock className="text-slate-400" size={18} />
          <h3 className="font-bold text-base">Audit History Timeline</h3>
        </div>
        {history.length === 0 ? (
          <p className="text-xs text-slate-400 py-2">No historical audit records available.</p>
        ) : (
          <div className="relative border-l-2 border-slate-100 dark:border-slate-800 pl-4 py-2 space-y-6">
            {history.map((run, idx) => (
              <div
                key={run.id}
                onClick={() => setActiveAnalysis(run)}
                className={`relative flex justify-between items-start cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/30 p-3 rounded-xl transition-all ${
                  activeAnalysis?.id === run.id ? 'bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50' : 'border border-transparent'
                }`}
              >
                {/* Timeline dot */}
                <span className={`absolute left-[-22px] top-4.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-darkBg ${
                  run.status_indicator === 'Red' ? 'bg-red-500' : run.status_indicator === 'Yellow' ? 'bg-yellow-500' : 'bg-emerald-500'
                }`}></span>

                <div>
                  <h4 className="font-bold text-xs">Run #{history.length - idx} • Status Zone: <span className={
                    run.status_indicator === 'Red' ? 'text-red-500' : run.status_indicator === 'Yellow' ? 'text-yellow-500' : 'text-emerald-500'
                  }>{run.status_indicator}</span></h4>
                  <p className="text-[10px] text-slate-400 mt-1">Audit Time: {new Date(run.generated_at).toLocaleString()}</p>
                </div>
                <div className="text-right text-xs">
                  <p className="text-slate-400">Stress Index</p>
                  <p className="font-bold mt-0.5">{run.debt_stress_index.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analysis;
