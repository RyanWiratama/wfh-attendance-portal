import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { LateBadge } from '../LateBadge';

describe('LateBadge Molecule', () => {
  it('renders "Tepat Waktu" when isLate is false', () => {
    render(<LateBadge isLate={false} />);
    expect(screen.getByText('Tepat Waktu')).toBeInTheDocument();
  });

  it('renders "Terlambat" with late minutes when isLate is true', () => {
    render(<LateBadge isLate={true} lateMinutes={25} />);
    expect(screen.getByText('Terlambat 25 Menit')).toBeInTheDocument();
  });

  it('renders fallback "Terlambat" if lateMinutes is 0 or undefined', () => {
    render(<LateBadge isLate={true} />);
    expect(screen.getByText('Terlambat')).toBeInTheDocument();
  });
});
