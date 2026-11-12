import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  Users,
  BarChart3,
  Calendar,
  LogOut,
  Building2,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types/auth.types';
import { Badge } from '../atoms/Badge';
import { Avatar } from '../atoms/Avatar';
import { cn } from '../../lib/utils';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavItem {
  name: string;
  to: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    name: 'Absensi WFH',
    to: '/attendance',
    icon: CalendarCheck,
  },
  {
    name: 'Riwayat Absensi',
    to: '/my-history',
    icon: Clock,
  },
  {
    name: 'Master Karyawan',
    to: '/employees',
    icon: Users,
    adminOnly: true,
  },
  {
    name: 'Monitoring Absensi',
    to: '/monitoring',
    icon: BarChart3,
    adminOnly: true,
  },
  {
    name: 'Jadwal Kerja',
    to: '/schedules',
    icon: Calendar,
    adminOnly: true,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, isHrAdmin, logout } = useAuth();

  const filteredItems = navItems.filter((item) => {
    if (item.adminOnly) {
      return isHrAdmin;
    }
    return true;
  });

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={cn(
          'fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto border-r border-slate-800 shadow-xl lg:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block">
                WFH PORTAL
              </span>
              <span className="text-[10px] tracking-wider uppercase text-slate-400 block -mt-0.5">
                Attendance System
              </span>
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Utama
          </div>
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-primary-600 text-white shadow-sm shadow-primary-600/30 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white',
                  )
                }
              >
                <Icon className="w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Profile & Logout Footer */}
        {user && (
          <div className="p-4 border-t border-slate-800 bg-slate-950/40">
            <div className="flex items-center gap-3 mb-3">
              <Avatar name={user.fullName} size="md" />
              <div className="overflow-hidden flex-1">
                <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{user.employeeCode}</p>
                <div className="mt-1">
                  <Badge variant={user.role === Role.ADMIN ? 'blue' : 'slate'}>
                    {user.role === Role.ADMIN ? 'HR Admin' : 'Karyawan'}
                  </Badge>
                </div>
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors border border-rose-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar Sistem</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
