import React, { useState } from 'react';
import {
  FileDown,
  FileText,
  Table,
  CheckCircle,
  ShieldAlert,
  Calendar,
  Activity,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

const Reports = () => {
  const [downloadingFormat, setDownloadingFormat] = useState(null);

  const handleDownload = async (format) => {
    setDownloadingFormat(format);
    try {
      const response = await api.get(`/reports/${format}`, {
        responseType: 'blob',
      });
      
      const blobType = format === 'pdf' 
        ? 'application/pdf' 
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      const fileName = format === 'pdf' 
        ? 'financial_recovery_report.pdf' 
        : 'financial_recovery_ledger.xlsx';

      const blob = new Blob([response.data], { type: blobType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Error compiling the ${format.toUpperCase()} report. Ensure database is active.`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const sections = [
    { title: "Client Financial Profile Summary", desc: "Detailed summary of net income, occupation details, and overall stability ratings." },
    { title: "Outstanding Liability Ledger", desc: "A comprehensive breakdown of all credit card, student, auto, and consolidation accounts." },
    { title: "AI Settlement Recommendations", desc: "Target settlement metrics, payment restructuring plans, and acceptance rates." },
    { title: "Historical Recovery Logs", desc: "Auditing records tracking analysis metrics and completed payment stages." }
  ];

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto bg-slate-50 dark:bg-darkBg">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Reports Console</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">Export structured data ledgers and document recommendations for external reference.</p>
      </div>

      {/* Main grid download options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PDF Exporter Card */}
        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Financial Recovery PDF Document</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                Download a print-ready, formatted recovery dossier. Summarizes overall financial health indicators, outstanding loan balances, and priority AI recommendations with disclaimers.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloadingFormat !== null}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-bold shadow-md shadow-red-600/10 flex items-center justify-center transition-all disabled:opacity-50"
          >
            {downloadingFormat === 'pdf' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <FileDown size={18} className="mr-2" />
                Export PDF Report
              </>
            )}
          </button>
        </div>

        {/* Excel Exporter Card */}
        <div className="glass p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Table size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg">Comprehensive Liability Spreadsheet</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                Download a multi-sheet spreadsheet containing raw financial data fields. Sheets include Overview statistics, Loan ledgers with DTI parameters, and AI settlement matrices with expected savings.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleDownload('excel')}
            disabled={downloadingFormat !== null}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/10 flex items-center justify-center transition-all disabled:opacity-50"
          >
            {downloadingFormat === 'excel' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <FileDown size={18} className="mr-2" />
                Export Excel Ledger
              </>
            )}
          </button>
        </div>
      </div>

      {/* Structured report data sections checklist */}
      <div className="glass p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center space-x-2">
          <Activity className="text-primary-500" size={18} />
          <h3 className="font-bold text-base">Compiled Report Structure</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sections.map((sect, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-start space-x-3">
              <CheckCircle className="text-emerald-500 shrink-0 mt-0.5" size={16} />
              <div>
                <h4 className="font-semibold text-xs text-slate-800 dark:text-slate-200">{sect.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{sect.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
