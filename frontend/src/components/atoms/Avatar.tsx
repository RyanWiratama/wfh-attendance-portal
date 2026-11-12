import React from 'react';
import { cn } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name, className, size = 'md' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  return (
    <div
      className={cn(
        'rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center select-none shrink-0 border border-blue-200',
        sizes[size],
        className,
      )}
    >
      {initials}
    </div>
  );
};
