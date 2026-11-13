import React from 'react';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  description?: string;
  color?: 'blue' | 'green' | 'red' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  description,
  color = 'blue',
}) => {
  const iconBgs = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    red: 'bg-rose-50 text-rose-600 border-rose-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 mb-0.5">{title}</p>
        <h3 className="text-xl font-bold text-slate-900">{value}</h3>
        {description && <p className="text-[11px] text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className={cn('w-10 h-10 rounded-lg border flex items-center justify-center shrink-0', iconBgs[color])}>
        {icon}
      </div>
    </div>
  );
};
