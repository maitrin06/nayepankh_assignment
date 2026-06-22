'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardShell from '@/components/DashboardShell';
import { 
  FileText, Download, Table, BarChart2, CheckCircle2, ChevronRight 
} from 'lucide-react';
import axios from 'axios';

export default function ReportsPage() {
  const { user, token } = useAuth();

  const handleExportPDF = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reports/pdf', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'volunteer_report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reports/excel', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'volunteer_roster.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export Excel:', error);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        
        {/* Header Block */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">NGO reports center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Generate high fidelity reports of volunteer rosters, event participant metrics, and performance audit records.</p>
        </div>

        {/* Reports Panel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Card 1: PDF Roster */}
          <div className="p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-56">
            <div className="space-y-3">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 w-fit">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">Generate System PDF Report</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Includes general summary stats (total hours, approved count, pending count) followed by a formatted roster table of names, emails, locations, and hours.
              </p>
            </div>

            <button 
              onClick={handleExportPDF}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF Summary</span>
            </button>
          </div>

          {/* Card 2: Excel Roster */}
          <div className="p-6 bg-white dark:bg-[#0d1321] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between h-56">
            <div className="space-y-3">
              <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500 w-fit">
                <Table className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">Export Spreadsheet Spreadsheet (XLSX)</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Generates a clean spreadsheet workbook featuring comprehensive details including volunteer name, phone, age, skills, interests, and count of campaigns joined.
              </p>
            </div>

            <button 
              onClick={handleExportExcel}
              className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Download className="h-4 w-4" />
              <span>Export Excel Roster</span>
            </button>
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
