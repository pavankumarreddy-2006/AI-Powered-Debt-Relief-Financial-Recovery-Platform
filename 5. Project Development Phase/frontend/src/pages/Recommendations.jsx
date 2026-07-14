import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  AlertTriangle,
  Scale,
  Percent,
  CheckCircle,
  HelpCircle,
  Clock,
  Compass,
  Zap,
  TrendingDown
} from 'lucide-react';
import api from '../services/api';

const Recommendations = () => {
  const [loans, setLoans] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState(0);
  const [error, setError] = useState('');

  const loadingSteps = [
    "Analyzing income-to-debt cash flow structures...",
    "Querying loss mitigation settlement algorithms...",
    "Evaluating creditor risk thresholds & collection posture...",
    "Synthesizing customized recovery plan..."
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loansRes, recsRes] = await Promise.all([
        api.get('/loans?status_filter=Overdue'), // Overdue is priority, fallback to Active
        api.get('/recommend')
      ]);
      
      let overdueList = loansRes.data;
      if (overdueList.length === 0) {
        // Fallback to Active loans if no Overdue loans exist
        const activeRes = await api.get('/loans?status_filter=Active');
        setLoans(activeRes.data);
      } else {
        setLoans(overdueList);
      }
      
      setHistory(recsRes.data);
    } catch (err) {
      setError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Cycle loader steps during generation
  useEffect(() => {
    let interval;
    if (generating) {
      interval = setInterval(() => {
        setGeneratingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    } else {
      setGeneratingStep(0);
    }
    return () => clearInterval(interval);
  }, [generating]);

  const handleGenerate = async () => {
    if (!selectedLoanId) return;
    setGenerating(true);
    setError('');
    setRecommendation(null);
    try {
      const response = await api.post('/recommend', { loan_id: parseInt(selectedLoanId) });
      setRecommendation(response.data);
      fetchData(); // Refresh history
    } catch (err) {
      setError('AI engine timed out or encountered an issue. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-darkBg">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Find target loan details in local array
  const activeSelectedLoan = loans.find(l => l.id === parseInt(selectedLoanId));

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 dark:bg-darkBg">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Settlement Recommendations</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Generate optimized settlement offers using credit loss mitigation algorithms.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Recommendation Setup panel */}
        <div className="glass p-5 rounded-2xl shadow-sm space-y-5 lg:col-span-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-primary-600 dark:text-primary-400" size={20} />
            <h3 className="font-bold text-base">Select Liability Target</h3>
          </div>

          {loans.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400">All registered loans are settled or closed. Add active/overdue loans under Loan Management to run AI analysis.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Account</label>
                <select
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  value={selectedLoanId}
                  onChange={(e) => {
                    setSelectedLoanId(e.target.value);
                    setRecommendation(null);
                  }}
                >
                  <option value="">-- Choose Loan Account --</option>
                  {loans.map(l => (
                    <option key={l.id} value={l.id}>{l.loan_name} (${l.outstanding_amount.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              {activeSelectedLoan && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px] block">Selected Account Overview</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lender:</span>
                    <span className="font-semibold">{activeSelectedLoan.lender_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Outstanding:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">${activeSelectedLoan.outstanding_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly EMI:</span>
                    <span className="font-semibold">${activeSelectedLoan.emi}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interest:</span>
                    <span className="font-semibold">{activeSelectedLoan.interest_rate}%</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!selectedLoanId || generating}
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-600/10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Zap size={16} className="mr-2" />
                    Run AI Review
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* AI Recommendations Output Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {generating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="glass p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 py-20"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin"></div>
                  <Sparkles size={24} className="absolute inset-0 m-auto text-primary-500 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-lg">Gemini Analysis in Progress</h3>
                  <p className="text-slate-400 text-sm max-w-sm h-12 leading-relaxed flex items-center justify-center">
                    {loadingSteps[generatingStep]}
                  </p>
                </div>
              </motion.div>
            )}

            {!generating && !recommendation && (
              <div className="glass p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center py-24 text-slate-400 space-y-3">
                <Compass size={48} className="text-slate-300 dark:text-slate-600" />
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Awaiting Analysis Parameters</h3>
                <p className="text-sm max-w-sm leading-relaxed">Select a target liability account ending from the panel and click Run AI Review to fetch settlement recommendations.</p>
              </div>
            )}

            {!generating && recommendation && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Main Offer recommendation metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {/* Settlement Percentage */}
                  <div className="glass p-5 rounded-2xl border border-emerald-500/20 shadow-sm relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-emerald-500/5 rounded-full blur-xl"></div>
                    <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                      <Percent size={16} />
                      <span>Recommended Target Offer</span>
                    </div>
                    <h3 className="text-3xl font-extrabold mt-2 text-emerald-500">{recommendation.recommended_settlement_pct}%</h3>
                    <p className="text-xs text-slate-400 mt-1">Expected range: {recommendation.expected_range}</p>
                  </div>

                  {/* Monthly Payment */}
                  <div className="glass p-5 rounded-2xl border border-primary-500/20 shadow-sm relative overflow-hidden">
                    <div className="absolute right-[-10px] top-[-10px] w-20 h-20 bg-primary-500/5 rounded-full blur-xl"></div>
                    <div className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 text-xs font-bold uppercase tracking-wider">
                      <DollarSign size={16} />
                      <span>Restructured Installment</span>
                    </div>
                    <h3 className="text-3xl font-extrabold mt-2 text-primary-500">${recommendation.recommended_monthly_payment.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo</h3>
                    <p className="text-xs text-slate-400 mt-1">Or lump-sum proposal option</p>
                  </div>

                  {/* Acceptance Probability */}
                  <div className="glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center space-x-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <Scale size={16} />
                      <span>Acceptance Probability</span>
                    </div>
                    <h3 className="text-3xl font-extrabold mt-2 text-slate-800 dark:text-slate-100">{(recommendation.settlement_probability * 100).toFixed(0)}%</h3>
                    <p className="text-xs text-slate-400 mt-1">Based on collection duration</p>
                  </div>
                </div>

                {/* Recommendation Hardship Assessment Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Strategic advice */}
                  <div className="glass p-5 rounded-2xl shadow-sm space-y-3">
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <Compass size={18} className="text-primary-500" />
                      <span>Strategic Recovery Advice</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{recommendation.recovery_advice}</p>
                  </div>

                  {/* Risk metrics and prioritization */}
                  <div className="glass p-5 rounded-2xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-2 text-xs">
                      <span className="font-semibold text-slate-400">Stress Category:</span>
                      <span className="font-bold text-red-500 uppercase">{recommendation.stress_level}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-2 text-xs">
                      <span className="font-semibold text-slate-400">AI Risk Rating:</span>
                      <span className="font-bold text-orange-500 uppercase">{recommendation.risk_level}</span>
                    </div>
                    <div className="space-y-1.5">
                      <span className="font-semibold text-slate-400 text-xs block">Priority Settlement Accounts:</span>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {recommendation.priority_loans ? (
                          recommendation.priority_loans.split(', ').map(l => (
                            <span key={l} className="text-[10px] font-bold px-2 py-0.5 bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-full">{l}</span>
                          ))
                        ) : (
                          <span className="text-slate-500 text-xs">Chase Card, Student Loan</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Recommendations History Section */}
      <div className="glass p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-bold text-base">Recommendation Log</h3>
        <div className="overflow-x-auto">
          {history.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No recommendations generated yet.</p>
          ) : (
            <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <thead>
                <tr className="text-slate-400 font-semibold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Target Loan ID</th>
                  <th className="pb-3">Recommended Sett. %</th>
                  <th className="pb-3">Monthly Payment Target</th>
                  <th className="pb-3">Acceptance Likelihood</th>
                  <th className="pb-3">Stress Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {history.map(rec => (
                  <tr key={rec.id} className="text-slate-600 dark:text-slate-300">
                    <td className="py-3.5">{new Date(rec.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 font-mono">Account #{rec.loan_id}</td>
                    <td className="py-3.5 font-bold text-emerald-500">{rec.recommended_settlement_pct}%</td>
                    <td className="py-3.5 font-semibold">${rec.recommended_monthly_payment.toLocaleString()}</td>
                    <td className="py-3.5 font-semibold">{(rec.settlement_probability * 100).toFixed(0)}%</td>
                    <td className="py-3.5 uppercase font-bold text-red-500">{rec.stress_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Recommendations;
