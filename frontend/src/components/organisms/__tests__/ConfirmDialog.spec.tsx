import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ConfirmDialog } from '../ConfirmDialog';

describe('ConfirmDialog Organism', () => {
  it('renders confirmation message and buttons', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="Konfirmasi Hapus"
        message="Apakah yakin ingin menghapus data ini?"
        confirmText="Hapus Sekarang"
        cancelText="Batalkan"
      />,
    );

    expect(screen.getByText('Konfirmasi Hapus')).toBeInTheDocument();
    expect(screen.getByText('Apakah yakin ingin menghapus data ini?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hapus sekarang/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /batalkan/i })).toBeInTheDocument();
  });

  it('triggers onConfirm when confirm button clicked', () => {
    const handleConfirm = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={handleConfirm}
        title="Konfirmasi Hapus"
        message="Pesan"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /konfirmasi/i }));
    expect(handleConfirm).toHaveBeenCalledTimes(1);
  });

  it('triggers onClose when cancel button clicked', () => {
    const handleClose = vi.fn();
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={handleClose}
        onConfirm={() => {}}
        title="Konfirmasi Hapus"
        message="Pesan"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /batal/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
