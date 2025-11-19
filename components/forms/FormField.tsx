import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
}

type InputFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaFieldProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Input field con label y error
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, required, className, id, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-2">
        <label htmlFor={fieldId} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>

        <input
          ref={ref}
          id={fieldId}
          className={cn(
            'flex h-10 w-full rounded-md border px-3 py-2',
            'bg-background',
            'text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed',
            'disabled:opacity-50',
            error
              ? 'border-error focus-visible:ring-error'
              : 'border-input focus-visible:ring-ring',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          required={required}
          {...props}
        />

        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

/**
 * Textarea field con label y error
 */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, required, className, id, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="space-y-2">
        <label htmlFor={fieldId} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-1 text-error">*</span>}
        </label>

        <textarea
          ref={ref}
          id={fieldId}
          className={cn(
            'flex min-h-[120px] w-full rounded-md border px-3 py-2',
            'bg-background',
            'text-sm',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none',
            'focus-visible:ring-2',
            'focus-visible:ring-offset-2',
            'disabled:cursor-not-allowed',
            'disabled:opacity-50',
            error
              ? 'border-error focus-visible:ring-error'
              : 'border-input focus-visible:ring-ring',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          required={required}
          {...props}
        />

        {error && (
          <p id={`${fieldId}-error`} className="text-sm text-error" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';
