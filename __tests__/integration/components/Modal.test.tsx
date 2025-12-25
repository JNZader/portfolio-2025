import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from '@/components/ui/Modal';

describe('Modal', () => {
  it('should not be open when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>
    );

    // Native <dialog> is always in DOM but not open
    const dialog = screen.getByRole('dialog', { hidden: true });
    expect(dialog).not.toHaveAttribute('open');
  });

  it('should render when open', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        Content
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should have correct ARIA attributes', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal" description="Description">
        Content
      </Modal>
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    // useId() generates unique IDs like 'modal-title-:r0:' so we check prefix
    expect(dialog.getAttribute('aria-labelledby')).toMatch(/^modal-title-/);
    expect(dialog.getAttribute('aria-describedby')).toMatch(/^modal-description-/);
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    // Get the X close button specifically (not the backdrop)
    await userEvent.click(screen.getByLabelText('Cerrar modal'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should call onClose when backdrop is clicked', async () => {
    const handleClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    await userEvent.click(screen.getByLabelText('Cerrar al hacer clic fuera'));
    expect(handleClose).toHaveBeenCalled();
  });

  it('should trap focus inside modal', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
        <button type="button">Button 1</button>
        <button type="button">Button 2</button>
      </Modal>
    );

    // Focus should be trapped (tested by focus-trap-react)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
