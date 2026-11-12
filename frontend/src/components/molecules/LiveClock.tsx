import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import dayjs from 'dayjs';

export interface LiveClockProps {
  variant?: 'card' | 'compact';
}

export const LiveClock: React.FC<LiveClockProps> = ({ variant = 'card' }) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = dayjs();
      setTimeStr(now.format('HH:mm:ss'));
      setDateStr(now.format('dddd, DD MMMM YYYY'));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-mono border border-slate-200">
        <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
        <span className="font-semibold">{timeStr || '--:--:--'} WIB</span>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-blue-800">
      <div className="flex items-center gap-2 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
        <Clock className="w-4 h-4 animate-pulse" />
        <span>Waktu Indonesia Barat (WIB)</span>
      </div>
      <div className="text-3xl font-extrabold font-mono tracking-tight text-white mb-1">
        {timeStr || '--:--:--'}
      </div>
      <div className="text-xs text-blue-200 font-medium">
        {dateStr || 'Memuat tanggal...'}
      </div>
    </div>
  );
};
