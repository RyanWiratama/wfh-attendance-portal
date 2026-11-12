import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AttendanceStatusBadge } from '../AttendanceStatusBadge';
import { AttendanceStatus } from '../../../types/attendance.types';

describe('AttendanceStatusBadge Molecule', () => {
  it('renders "Hadir" for PRESENT status', () => {
    render(<AttendanceStatusBadge status={AttendanceStatus.PRESENT} />);
    expect(screen.getByText('Hadir')).toBeInTheDocument();
  });

  it('renders "Terlambat" for LATE status', () => {
    render(<AttendanceStatusBadge status={AttendanceStatus.LATE} />);
    expect(screen.getByText('Terlambat')).toBeInTheDocument();
  });

  it('renders "Tidak Hadir" for ABSENT status', () => {
    render(<AttendanceStatusBadge status={AttendanceStatus.ABSENT} />);
    expect(screen.getByText('Tidak Hadir')).toBeInTheDocument();
  });
});
