import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Modal } from '../Modal';

describe('Modal Organism', () => {
  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <div>Konten Modal</div>
      </Modal>,
    );
    expect(screen.queryByText('Konten Modal')).not.toBeInTheDocument();
  });

  it('renders title, description and children when isOpen is true', () => {
    render(
      <Modal
        isOpen={true}
        onClose={() => {}}
        title="Judul Modal"
        description="Deskripsi Modal"
      >
        <div>Konten Modal Aktif</div>
      </Modal>,
    );

    expect(screen.getByText('Judul Modal')).toBeInTheDocument();
    expect(screen.getByText('Deskripsi Modal')).toBeInTheDocument();
    expect(screen.getByText('Konten Modal Aktif')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Modal Test">
        <p>Konten</p>
      </Modal>,
    );

    fireEvent.click(screen.getByRole('button', { name: /tutup/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Escape key is pressed', () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose}>
        <p>Konten</p>
      </Modal>,
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
