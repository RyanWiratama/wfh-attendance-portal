import React from 'react';
import { Badge } from '../atoms/Badge';

export interface LateBadgeProps {
  isLate: boolean;
  lateMinutes?: number;
}

export const LateBadge: React.FC<LateBadgeProps> = ({ isLate, lateMinutes = 0 }) => {
  if (!isLate) {
    return <Badge variant="green">Tepat Waktu</Badge>;
  }

  return (
    <Badge variant="red">
      {lateMinutes > 0 ? `Terlambat ${lateMinutes} Menit` : 'Terlambat'}
    </Badge>
  );
};
