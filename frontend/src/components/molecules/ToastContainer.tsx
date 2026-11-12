import React from 'react';
import { useToast } from '@/contexts/ToastContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const styles = {
          success: 'bg-emerald-600 text-white',
          error: 'bg-rose-600 text-white',
          warning: 'bg-amber-500 text-white',
          info: 'bg-blue-600 text-white',
        };

        const icons = {
          success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 shrink-0" />,
          warning: <AlertCircle className="w-5 h-5 shrink-0" />,
          info: <Info className="w-5 h-5 shrink-0" />,
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg transition-all animate-in slide-in-from-bottom-3 ${styles[toast.type]}`}
          >
            <div className="flex items-center gap-2.5 text-sm font-medium">
              {icons[toast.type]}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md hover:bg-black/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
