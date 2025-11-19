import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { InputField, TextareaField } from '@/components/forms/FormField';

describe('InputField', () => {
  it('should render with label', () => {
    render(<InputField label="Nombre" />);
    expect(screen.getByLabelText('Nombre')).toBeInTheDocument();
  });

  it('should show required indicator', () => {
    render(<InputField label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('should show error message', () => {
    render(<InputField label="Email" error="Este campo es requerido" />);
    const errorMsg = screen.getByRole('alert');
    expect(errorMsg).toHaveTextContent('Este campo es requerido');
  });

  it('should associate error with input via aria-describedby', () => {
    render(<InputField label="Email" error="Email inválido" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('should handle user input', async () => {
    render(<InputField label="Email" />);
    const input = screen.getByLabelText('Email');

    await userEvent.type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });

  it('should apply error styles', () => {
    render(<InputField label="Email" error="Error" />);
    expect(screen.getByRole('textbox')).toHaveClass('border-error');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<InputField label="Email" disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should generate id from label', () => {
    render(<InputField label="Nombre Completo" />);
    expect(screen.getByLabelText('Nombre Completo')).toHaveAttribute('id', 'nombre-completo');
  });

  it('should use custom id when provided', () => {
    render(<InputField label="Email" id="custom-email" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'custom-email');
  });
});

describe('TextareaField', () => {
  it('should render with label', () => {
    render(<TextareaField label="Mensaje" />);
    expect(screen.getByLabelText('Mensaje')).toBeInTheDocument();
  });

  it('should show error message', () => {
    render(<TextareaField label="Mensaje" error="Mensaje muy corto" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Mensaje muy corto');
  });

  it('should handle user input', async () => {
    render(<TextareaField label="Mensaje" />);
    const textarea = screen.getByLabelText('Mensaje');

    await userEvent.type(textarea, 'Este es mi mensaje');
    expect(textarea).toHaveValue('Este es mi mensaje');
  });

  it('should accept rows prop', () => {
    render(<TextareaField label="Mensaje" rows={10} />);
    expect(screen.getByLabelText('Mensaje')).toHaveAttribute('rows', '10');
  });
});
