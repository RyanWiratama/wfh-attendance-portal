import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Button } from '../Button';

describe('Button Atom', () => {
  it('renders children correctly', () => {
    render(<Button>Simpan Data</Button>);
    expect(screen.getByRole('button', { name: /simpan data/i })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Klik Saya</Button>);

    fireEvent.click(screen.getByRole('button', { name: /klik saya/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders loading spinner and disables button when isLoading is true', () => {
    render(<Button isLoading>Kirim</Button>);
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Nonaktif</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('applies variant classes correctly', () => {
    const { container: primaryBtn } = render(<Button variant="primary">Primary</Button>);
    expect(primaryBtn.firstChild).toHaveClass('bg-blue-600');

    const { container: dangerBtn } = render(<Button variant="danger">Danger</Button>);
    expect(dangerBtn.firstChild).toHaveClass('bg-red-600');
  });
});
