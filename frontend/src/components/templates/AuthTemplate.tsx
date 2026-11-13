import React from 'react';
import { Building2 } from 'lucide-react';
import { ToastContainer } from '../molecules/ToastContainer';

export interface AuthTemplateProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthTemplate: React.FC<AuthTemplateProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="mb-6 text-center">
        <div className="inline-flex w-12 h-12 rounded-xl bg-blue-600 items-center justify-center text-white mb-2 shadow-sm">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">WFH Portal</h1>
        <p className="text-xs text-slate-500">Sistem Presensi & Monitoring Karyawan</p>
      </div>

      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="mb-5 text-center">
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>

      <p className="mt-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} WFH Attendance & Monitoring
      </p>

      <ToastContainer />
    </div>
  );
};
