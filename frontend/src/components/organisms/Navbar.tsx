import React from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LiveClock } from '../molecules/LiveClock';
import { Role } from '../../types/auth.types';

export interface NavbarProps {
  onToggleSidebar?: () => void;
  title?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, title }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {title ? (
          <h1 className="text-lg font-semibold text-slate-800 tracking-tight hidden sm:block">
            {title}
          </h1>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 text-sm">WFH Attendance Portal</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Live Clock Component */}
        <div className="hidden md:flex items-center">
          <LiveClock variant="compact" />
        </div>

        {/* User preview */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold text-xs flex items-center justify-center">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {user.fullName}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight">
                {user.role === Role.ADMIN ? 'HR Admin' : user.employeeCode}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
