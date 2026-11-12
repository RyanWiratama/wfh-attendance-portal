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
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-primary-950 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <div className="mb-8 text-center flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-xl shadow-primary-500/30 mb-3 border border-primary-400/30">
          <Building2 className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          WFH PORTAL
        </h1>
        <p className="text-xs uppercase tracking-widest text-primary-300 font-medium mt-0.5">
          Attendance & Monitoring System
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          {children}
        </div>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} WFH Attendance & Employee Monitoring Portal
      </p>

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};
