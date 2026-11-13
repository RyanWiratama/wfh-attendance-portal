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
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono">
        <Clock className="w-3.5 h-3.5 text-blue-600" />
        <span className="font-medium">{timeStr || '--:--:--'} WIB</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 p-4 rounded-xl">
      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
        <Clock className="w-4 h-4 text-blue-600" />
        <span>Waktu Server (WIB)</span>
      </div>
      <div className="text-2xl font-bold font-mono text-slate-900">
        {timeStr || '--:--:--'} WIB
      </div>
      <div className="text-xs text-slate-500 mt-0.5">
        {dateStr}
      </div>
    </div>
  );
};
