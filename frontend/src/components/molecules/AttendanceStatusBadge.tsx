import React from 'react';
import { Badge } from '../atoms/Badge';

export interface AttendanceStatusBadgeProps {
  status?: string;
  hasRecord?: boolean;
}

export const AttendanceStatusBadge: React.FC<AttendanceStatusBadgeProps> = ({
  status,
  hasRecord = true,
}) => {
  if (!hasRecord || !status) {
    return <Badge variant="slate">Belum Absen</Badge>;
  }

  switch (status) {
    case 'PRESENT':
      return <Badge variant="green">Hadir</Badge>;
    case 'LATE':
      return <Badge variant="yellow">Terlambat</Badge>;
    case 'ABSENT':
      return <Badge variant="red">Tidak Hadir</Badge>;
    case 'CHECKED_IN':
      return <Badge variant="blue">Sudah Check-In</Badge>;
    case 'COMPLETED':
      return <Badge variant="green">Selesai (Sudah Check-Out)</Badge>;
    default:
      return <Badge variant="slate">{status}</Badge>;
  }
};
