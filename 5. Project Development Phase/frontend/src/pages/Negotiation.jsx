import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Copy,
  Download,
  Check,
  Building,
  DollarSign,
  Compass,
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import api from '../services/api';

const Negotiation = () => {
  const [loans, setLoans] = useState([]);
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Form states
  const [selectedLoanId, setSelectedLoanId] = useState('');
  const [recipientLender, setRecipientLender] = useState('');
  const [letterType, setLetterType] = useState('Settlement Request Letter');

  const [activeLetter, setActiveLetter] = useState(null);
  const [error, setError] = useState('');

  const fetchLettersData = async () => {
    try {
      const [loansRes, lettersRes] = await Promise.all([
        api.get('/loans'),
        api.get('/negotiation')
      ]);
      // Only choose active or overdue loans for negotiation
      setLoans(loansRes.data.filter(l => l.status === 'Active' || l.status === 'Overdue'));
      setLetters(lettersRes.data);
    } catch (err) {
      setError('Failed to fetch negotiation records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLettersData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedLoanId || !recipientLender) return;
    setGenerating(true);
    setError('');
    setActiveLetter(null);
    try {
      const response = await api.post('/negotiation/generate-letter', {
        loan_id: parseInt(selectedLoanId),
        recipient_lender: recipientLender,
        letter_type: letterType
      });
      setActiveLetter(response.data);
      fetchLettersData(); // Refresh history list
    } catch (err) {
      setError('AI generation timed out or encountered an issue. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!activeLetter) return;
    navigator.clipboard.writeText(activeLetter.generated_content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!activeLetter) return;
    const blob = new Blob([activeLetter.generated_content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `negotiation_letter_${activeLetter.recipient_lender.toLowerCase().replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/negotiation/${id}/status`, { status });
      fetchLettersData();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  const selectedLoanObj = loans.find(l => l.id === parseInt(selectedLoanId));

  useEffect(() => {
    if (selectedLoanObj) {
      setRecipientLender(selectedLoanObj.lender_name);
    }
  }, [selectedLoanId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 dark:bg-darkBg">
        <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 dark:bg-darkBg">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">AI Negotiation Strategist</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Generate customized hardship settlement letters and emails for lender communications.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Setup Parameters Panel */}
        <div className="glass p-5 rounded-2xl shadow-sm space-y-5 lg:col-span-1">
          <div className="flex items-center space-x-2">
            <FileText className="text-primary-600 dark:text-primary-400" size={20} />
            <h3 className="font-bold text-base">Strategy Parameters</h3>
          </div>

          {loans.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <p className="text-xs text-slate-400">All registered accounts are settled or closed. Please add an active loan profile to run negotiation templates.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select Loan */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Account</label>
                <select
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                >
                  <option value="">-- Choose Account --</option>
                  {loans.map(l => (
                    <option key={l.id} value={l.id}>{l.loan_name} (${l.outstanding_amount.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              {/* Recipient Lender */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Lender Institution</label>
                <input
                  type="text"
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                  placeholder="Chase Bank Mitigation Dept."
                  value={recipientLender}
                  onChange={(e) => setRecipientLender(e.target.value)}
                />
              </div>

              {/* Letter Format */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Document Format</label>
                <select
                  className="block w-full mt-1.5 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 cursor-pointer"
                  value={letterType}
                  onChange={(e) => setLetterType(e.target.value)}
                >
                  <option value="Settlement Request Letter">Formal Hardship Letter (PDF Printout)</option>
                  <option value="Email Template">Loss Mitigation Email Template</option>
                </select>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!selectedLoanId || !recipientLender || generating}
                className="w-full py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-sm font-bold shadow-md shadow-primary-600/10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FileText size={16} className="mr-2" />
                    Generate Letter
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* AI Letter Output Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence mode="wait">
            {generating && (
              <div className="glass p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center space-y-4 py-20">
                <div className="w-10 h-10 border-4 border-primary-500/20 border-t-primary-600 rounded-full animate-spin"></div>
                <div>
                  <h3 className="font-bold text-base">Structuring Negotiation Hardship Letter</h3>
                  <p className="text-xs text-slate-400 mt-1">Applying legal and empathetic consumer negotiation rules...</p>
                </div>
              </div>
            )}

            {!generating && !activeLetter && (
              <div className="glass p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center py-24 text-slate-400 space-y-3">
                <Clock size={48} className="text-slate-300 dark:text-slate-600" />
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Awaiting Letter Generation</h3>
                <p className="text-sm max-w-sm leading-relaxed">Choose an active account liability, configure details, and hit Generate to view draft negotiation correspondence.</p>
              </div>
            )}

            {!generating && activeLetter && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {/* Left Side: Negotiation bullet points */}
                <div className="space-y-6">
                  {/* Settlement proposal card */}
                  <div className="glass p-5 rounded-2xl shadow-sm space-y-3 border border-emerald-500/10">
                    <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wide block">Strategic Proposal Summary</span>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-400">Proposed Cash Settlement:</span>
                      <span className="font-bold text-base text-emerald-500">${activeLetter.suggested_settlement_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Payment Plan terms:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{activeLetter.suggested_installments || "Lump-sum within 30 days"}</span>
                    </div>
                  </div>

                  {/* Negotiation bullet items */}
                  <div className="glass p-5 rounded-2xl shadow-sm space-y-3.5">
                    <div className="flex items-center space-x-2 font-bold text-sm">
                      <Compass size={18} className="text-primary-500" />
                      <span>Negotiation Action Points</span>
                    </div>
                    <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0"></div>
                        <p>Highlight immediate net income deficits and hardship indicators (like overdue invoices or job losses).</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0"></div>
                        <p>Request written settlement agreement letter *prior* to sending any funds.</p>
                      </div>
                      <div className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 shrink-0"></div>
                        <p>Request account balance status reporting to bureaus as 'Settled in Full' or 'Paid in Full' to protect credit metrics.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Generated letter preview */}
                <div className="glass p-5 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between">
                  <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-3">
                    <span className="font-bold text-sm">Document Draft Preview</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={handleCopy}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Copy Content"
                      >
                        {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        title="Download Document"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>

                  <textarea
                    readOnly
                    className="w-full flex-1 min-h-[300px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-xs font-mono leading-relaxed focus:outline-none select-text resize-none text-slate-700 dark:text-slate-300"
                    value={activeLetter.generated_content}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Letters History Ledger */}
      <div className="glass p-5 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-bold text-base">Negotiation Ledger History</h3>
        <div className="overflow-x-auto">
          {letters.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No negotiation letters drafted yet.</p>
          ) : (
            <table className="w-full text-left text-xs divide-y divide-slate-100 dark:divide-slate-800">
              <thead>
                <tr className="text-slate-400 font-semibold">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Lender Recipient</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Proposed Sett. Amount</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Update Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {letters.map(letter => (
                  <tr key={letter.id} className="text-slate-600 dark:text-slate-300">
                    <td className="py-3.5">{new Date(letter.created_at).toLocaleDateString()}</td>
                    <td className="py-3.5 font-bold flex items-center space-x-1.5">
                      <Building size={14} className="text-slate-400" />
                      <span>{letter.recipient_lender}</span>
                    </td>
                    <td className="py-3.5">{letter.letter_type}</td>
                    <td className="py-3.5 font-bold text-emerald-500">${letter.suggested_settlement_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="py-3.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                        letter.status === 'Accepted'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : letter.status === 'Rejected'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-primary-500/10 text-primary-500'
                      }`}>
                        {letter.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <select
                        className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[11px] focus:outline-none"
                        value={letter.status}
                        onChange={(e) => handleStatusChange(letter.id, e.target.value)}
                      >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
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

export default Negotiation;
