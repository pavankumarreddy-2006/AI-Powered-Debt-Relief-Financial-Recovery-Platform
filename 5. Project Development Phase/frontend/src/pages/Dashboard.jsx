import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LineChart,
  Line,
  Legend
} from 'recharts';
import {
  TrendingDown,
  DollarSign,
  AlertTriangle,
  HeartPulse,
  PiggyBank,
  ArrowRight,
  Activity,
  Calendar,
  Sparkles
} from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashRes, histRes] = await Promise.all([
          api.get('/dashboard'),
          api.get('/analyze/history')
        ]);
        setData(dashRes.data);
        setHistory(histRes.data);
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-darkBg">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-8 bg-slate-50 dark:bg-darkBg">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 max-w-lg mx-auto text-center">
          <p className="font-bold">Error Loading Dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  const {
    total_debt,
    monthly_income,
    total_emi,
    emi_ratio,
    debt_stress_score,
    settlement_probability,
    monthly_surplus,
    savings_estimate,
    recent_activity,
    upcoming_emis
  } = data;

  // Chart data mappings
  const COLORS = ['#2563eb', '#10b981', '#f97316', '#a855f7', '#06b6d4'];

  const debtDistributionData = upcoming_emis.map(l => ({
    name: l.loan_name,
    value: l.emi
  }));

  const emiComparisonData = upcoming_emis.map(l => ({
    name: l.loan_name,
    emi: l.emi
  }));

  const incomeVsExpensesData = [
    { name: 'Income Flow', Income: monthly_income, EMI: 0, Surplus: 0 },
    { name: 'Allocation', Income: 0, EMI: total_emi, Surplus: monthly_surplus }
  ];

  // Map history reverse to plot chronological trend
  const recoveryTrendData = history.slice().reverse().map((h, index) => ({
    name: `Run ${index + 1}`,
    'Stress Index': parseFloat(h.debt_stress_index.toFixed(1)),
    'Stability Score': parseFloat(h.stability_score.toFixed(1))
  }));

  // Fallback trend if user only has 1 or no runs yet
  const dummyTrendData = [
    { name: 'Start', 'Stress Index': debt_stress_score, 'Stability Score': 100 - debt_stress_score },
    { name: 'Month 1', 'Stress Index': debt_stress_score * 0.9, 'Stability Score': (100 - debt_stress_score) * 1.1 },
    { name: 'Month 2', 'Stress Index': debt_stress_score * 0.8, 'Stability Score': (100 - debt_stress_score) * 1.25 }
  ];

  const actualTrend = recoveryTrendData.length > 1 ? recoveryTrendData : dummyTrendData;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="flex-1 p-6 space-y-8 overflow-y-auto bg-slate-50 dark:bg-darkBg">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Recovery Dashboard</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Track your liability ratios, stress indicators, and AI recommendations.</p>
        </div>
        <div className="inline-flex items-center space-x-2.5 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
          <HeartPulse size={18} />
          <span className="text-sm font-semibold">Active Restructuring Plan</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Debt */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Outstanding Debt</p>
              <h3 className="text-2xl font-bold mt-1.5">${total_debt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2.5 bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-xl">
              <TrendingDown size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="font-semibold text-emerald-500 mr-1">45% reduction</span> potential via AI
          </div>
        </motion.div>

        {/* Monthly Net Income */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Monthly Net Income</p>
              <h3 className="text-2xl font-bold mt-1.5">${monthly_income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span>DTI Limit benchmark is 36%</span>
          </div>
        </motion.div>

        {/* Combined EMIs */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Monthly Total EMI</p>
              <h3 className="text-2xl font-bold mt-1.5">${total_emi.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
            <div className="p-2.5 bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 rounded-xl">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            <span className="font-semibold text-orange-500 mr-1">{(emi_ratio * 100).toFixed(1)}%</span> EMI-to-Income ratio
          </div>
        </motion.div>

        {/* Stress score */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible" className="glass p-5 rounded-2xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Debt Stress Score</p>
              <h3 className="text-2xl font-bold mt-1.5">{debt_stress_score.toFixed(1)} / 100</h3>
            </div>
            <div className={`p-2.5 rounded-xl ${
              debt_stress_score > 60 
                ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400' 
                : debt_stress_score > 30 
                  ? 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-600 dark:text-yellow-400' 
                  : 'bg-green-100 dark:bg-green-950/40 text-green-600 dark:text-green-400'
            }`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-xs text-slate-500">
            Status Category:{' '}
            <span className={`font-semibold ml-1 ${
              debt_stress_score > 60 ? 'text-red-500' : debt_stress_score > 30 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {debt_stress_score > 60 ? 'Critical Red' : debt_stress_score > 30 ? 'Elevated Yellow' : 'Healthy Green'}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Surplus & Savings Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-r from-primary-950 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-md text-slate-100">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <PiggyBank size={16} />
            <span>Monthly Surplus Breakdown</span>
          </div>
          <h2 className="text-3xl font-extrabold">${monthly_surplus.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
          <p className="text-slate-400 text-xs">Remaining monthly surplus flow after all current EMI payments are fulfilled.</p>
        </div>
        <div className="flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800/80 pt-4 md:pt-0 md:pl-6 space-y-3">
          <div>
            <p className="text-slate-400 text-xs">Recommended Settlement Cash Flow Reserve (20%):</p>
            <p className="text-lg font-bold text-emerald-400 mt-1">${savings_estimate.toLocaleString(undefined, { minimumFractionDigits: 2 })} / month</p>
          </div>
          <div className="flex items-center text-slate-400 text-xs">
            <Sparkles className="text-primary-400 mr-2 shrink-0" size={16} />
            <span>AI probability of settlement acceptance is <span className="text-white font-bold">{(settlement_probability * 100).toFixed(0)}%</span></span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Debt Distribution */}
        <div className="glass p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-base mb-4">Debt (EMI) Distribution share</h3>
          <div className="h-64">
            {debtDistributionData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No active loans for distribution mapping</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={debtDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {debtDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2 text-xs">
            {debtDistributionData.map((item, idx) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                <span className="text-slate-500 max-w-[120px] truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Monthly EMI Comparison */}
        <div className="glass p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-base mb-4">Monthly EMI breakdown</h3>
          <div className="h-64">
            {emiComparisonData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">No active loans recorded</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emiComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Bar dataKey="emi" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Income vs Expenses */}
        <div className="glass p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-base mb-4">Income Allocation flows</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={incomeVsExpensesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Area type="monotone" dataKey="Income" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="EMI" stackId="2" stroke="#f97316" fill="#f97316" fillOpacity={0.4} />
                <Area type="monotone" dataKey="Surplus" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Recovery Trend */}
        <div className="glass p-5 rounded-2xl shadow-sm">
          <h3 className="font-bold text-base mb-4">Financial Health Recovery Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={actualTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Stress Index" stroke="#ef4444" strokeWidth={2.5} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Stability Score" stroke="#10b981" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liability ledger and deadlines */}
        <div className="lg:col-span-2 glass p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base">Active liability deadlines</h3>
            <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">Upcoming EMIs</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcoming_emis.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No active or overdue liabilities in ledger.</p>
            ) : (
              upcoming_emis.map(l => (
                <div key={l.id} className="flex justify-between items-center py-3.5">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${l.status === 'Overdue' ? 'bg-red-500 animate-ping' : 'bg-primary-500'}`}></div>
                    <div>
                      <h4 className="font-bold text-sm">{l.loan_name}</h4>
                      <p className="text-xs text-slate-400">{l.lender_name} • Due: {l.due_date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">${l.emi.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 uppercase ${
                      l.status === 'Overdue' 
                        ? 'bg-red-500/10 text-red-500' 
                        : 'bg-primary-500/10 text-primary-500'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent actions / timeline */}
        <div className="glass p-5 rounded-2xl shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-base">Recent actions</h3>
            <Activity size={18} className="text-slate-400" />
          </div>
          <div className="space-y-4">
            {recent_activity.length === 0 ? (
              <p className="text-xs text-slate-400">No actions recorded in log.</p>
            ) : (
              recent_activity.map((act, index) => (
                <div key={index} className="flex space-x-3.5 items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1.5 shrink-0"></div>
                  <div>
                    <p className="text-xs font-medium">{act.action}</p>
                    <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
