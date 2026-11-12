import React from 'react';
import { Label } from '../atoms/Label';
import { cn } from '@/lib/utils';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  optional,
  error,
  hint,
  className,
  children,
}) => {
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between mb-1">
        <Label required={required}>{label}</Label>
        {optional && (
          <span className="text-[11px] text-slate-400">Opsional</span>
        )}
      </div>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-600 font-medium">{error}</p>}
    </div>
  );
};
