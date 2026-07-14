import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  X,
  CreditCard,
  Building2,
  AlertCircle
} from 'lucide-react';
import api from '../services/api';

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const response = await api.get('/loans', {
        params: {
          status_filter: statusFilter || undefined,
          search: search || undefined
        }
      });
      setLoans(response.data);
    } catch (err) {
      setError('Failed to fetch loans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, [statusFilter, search]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        loan_name: data.loan_name,
        lender_name: data.lender_name,
        loan_type: data.loan_type,
        original_amount: parseFloat(data.original_amount),
        outstanding_amount: parseFloat(data.outstanding_amount),
        interest_rate: parseFloat(data.interest_rate),
        emi: parseFloat(data.emi),
        due_date: data.due_date,
        overdue_months: parseInt(data.overdue_months) || 0,
        status: data.status
      };

      if (editingLoan) {
        await api.put(`/loans/${editingLoan.id}`, payload);
      } else {
        await api.post('/loans', payload);
      }
      setFormOpen(false);
      setEditingLoan(null);
      reset();
      fetchLoans();
    } catch (err) {
      alert('Error saving loan data. Please verify inputs.');
    }
  };

  const handleEdit = (loan) => {
    setEditingLoan(loan);
    setFormOpen(true);
    // Prefill form
    setValue('loan_name', loan.loan_name);
    setValue('lender_name', loan.lender_name);
    setValue('loan_type', loan.loan_type);
    setValue('original_amount', loan.original_amount);
    setValue('outstanding_amount', loan.outstanding_amount);
    setValue('interest_rate', loan.interest_rate);
    setValue('emi', loan.emi);
    setValue('due_date', loan.due_date);
    setValue('overdue_months', loan.overdue_months);
    setValue('status', loan.status);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this loan record? This action is irreversible.')) {
      try {
        await api.delete(`/loans/${id}`);
        fetchLoans();
      } catch (err) {
        alert('Failed to delete loan.');
      }
    }
  };

  const openAddForm = () => {
    setEditingLoan(null);
    reset();
    // Default settings
    setValue('status', 'Active');
    setValue('overdue_months', 0);
    setFormOpen(true);
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 dark:bg-darkBg relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Loan Management</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Maintain liability balances, records, and terms.</p>
        </div>
        <button
          onClick={openAddForm}
          className="bg-primary-600 hover:bg-primary-500 text-white font-bold text-sm px-4.5 py-2.5 rounded-xl shadow-md shadow-primary-600/20 flex items-center transition-all"
        >
          <Plus size={18} className="mr-1.5" /> Add New Loan
        </button>
      </div>

      {/* Filter / Search panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-darkCard p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/50">
        {/* Search */}
        <div className="relative rounded-xl shadow-sm sm:col-span-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl placeholder-slate-400 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            placeholder="Search by loan name, lender, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status selector */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <SlidersHorizontal size={18} />
          </div>
          <select
            className="block w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors appearance-none cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status Categories</option>
            <option value="Active">Active</option>
            <option value="Overdue">Overdue</option>
            <option value="Settled">Settled</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Main Loan List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <p className="text-red-500 text-center py-6">{error}</p>
      ) : loans.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-darkCard border border-slate-100 dark:border-slate-800/50 rounded-2xl space-y-3">
          <CreditCard className="mx-auto text-slate-300 dark:text-slate-600" size={48} />
          <h3 className="font-bold text-lg">No Loans Found</h3>
          <p className="text-slate-400 text-sm max-w-sm mx-auto">There are no loans matching your filters. Add a new liability to populate this ledger.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map(loan => (
            <div key={loan.id} className="glass p-5 rounded-2xl shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-all border border-slate-100 dark:border-slate-800/80">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{loan.loan_name}</h3>
                    <div className="flex items-center space-x-1 text-xs text-slate-400 mt-1">
                      <Building2 size={13} />
                      <span>{loan.lender_name}</span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    loan.status === 'Overdue' 
                      ? 'bg-red-500/10 text-red-500' 
                      : loan.status === 'Settled' 
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-primary-500/10 text-primary-500'
                  }`}>
                    {loan.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-800/50 py-3 text-xs">
                  <div>
                    <p className="text-slate-400">Outstanding Balance</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">${loan.outstanding_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Original Principal</p>
                    <p className="font-semibold text-slate-500 dark:text-slate-300 mt-0.5">${loan.original_amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Monthly EMI</p>
                    <p className="font-bold text-slate-800 dark:text-slate-100 mt-0.5">${loan.emi.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Interest Rate</p>
                    <p className="font-semibold text-slate-500 dark:text-slate-300 mt-0.5">{loan.interest_rate}% APR</p>
                  </div>
                </div>

                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Due Date: {loan.due_date}</span>
                  {loan.status === 'Overdue' && (
                    <span className="text-red-500 font-semibold">{loan.overdue_months} months overdue</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-5 border-t border-slate-100 dark:border-slate-800/30 mt-4">
                <button
                  onClick={() => handleEdit(loan)}
                  className="p-2 text-slate-400 hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all"
                  title="Edit Loan"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDelete(loan.id)}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                  title="Delete Loan"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Drawer Modal Overlay */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
          <div
            className="w-full max-w-lg bg-white dark:bg-darkCard h-full p-6 shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">{editingLoan ? 'Modify Liability Record' : 'Register New Liability'}</h2>
                <button
                  onClick={() => setFormOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Loan Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Loan/Liability Name</label>
                  <input
                    type="text"
                    className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    placeholder="Chase Credit Card"
                    {...register('loan_name', { required: 'Loan Name is required' })}
                  />
                  {errors.loan_name && <p className="text-red-500 text-xs mt-1">{errors.loan_name.message}</p>}
                </div>

                {/* Lender Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Lender Institution</label>
                  <input
                    type="text"
                    className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                    placeholder="Chase Bank"
                    {...register('lender_name', { required: 'Lender is required' })}
                  />
                  {errors.lender_name && <p className="text-red-500 text-xs mt-1">{errors.lender_name.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Loan Type */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</label>
                    <select
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors cursor-pointer"
                      {...register('loan_type', { required: 'Type is required' })}
                    >
                      <option value="Credit Card">Credit Card</option>
                      <option value="Personal Loan">Personal Loan</option>
                      <option value="Student Loan">Student Loan</option>
                      <option value="Auto Loan">Auto Loan</option>
                      <option value="Mortgage">Mortgage</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                    <select
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors cursor-pointer"
                      {...register('status')}
                    >
                      <option value="Active">Active</option>
                      <option value="Overdue">Overdue</option>
                      <option value="Settled">Settled</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Original Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Original Principal ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                      placeholder="15000.00"
                      {...register('original_amount', { required: 'Original amount is required', min: 0 })}
                    />
                  </div>

                  {/* Outstanding Amount */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Balance ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                      placeholder="12500.00"
                      {...register('outstanding_amount', { required: 'Outstanding amount is required', min: 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Interest Rate */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Interest Rate (% APR)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                      placeholder="18.9"
                      {...register('interest_rate', { required: 'Rate is required', min: 0 })}
                    />
                  </div>

                  {/* EMI */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Payment / EMI ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                      placeholder="350.00"
                      {...register('emi', { required: 'EMI is required', min: 0 })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Due Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Monthly Due Date</label>
                    <input
                      type="text"
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                      placeholder="25th of the month"
                      {...register('due_date', { required: 'Due Date is required' })}
                    />
                  </div>

                  {/* Overdue Months */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Overdue Duration (Months)</label>
                    <input
                      type="number"
                      className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                      placeholder="3"
                      {...register('overdue_months', { min: 0 })}
                    />
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex space-x-3 pt-6 border-t border-slate-100 dark:border-slate-800/80 mt-6">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-600/10 transition-all"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loans;
