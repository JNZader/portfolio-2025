import { Check, X } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  success?: boolean;
}

type InputFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaFieldProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Input field con floating label y validación visual
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, success, required, className, id, placeholder, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="relative">
        <input
          ref={ref}
          id={fieldId}
          placeholder={placeholder || ' '}
          className={cn(
            'peer flex h-12 w-full rounded-md border px-3 pt-6 pb-2',
            'bg-background',
            'text-sm',
            'placeholder-transparent',
            'focus-visible:outline-none',
            'focus-visible:ring-[3px]',
            'disabled:cursor-not-allowed',
            'disabled:opacity-50',
            'transition-all duration-200',
            error
              ? 'border-error focus-visible:border-error focus-visible:ring-error/20'
              : success
                ? 'border-success focus-visible:border-success focus-visible:ring-success/20'
                : 'border-input focus-visible:border-primary focus-visible:ring-primary/20',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          required={required}
          {...props}
        />

        {/* Floating Label */}
        <label
          htmlFor={fieldId}
          className={cn(
            'absolute left-3 top-3.5 text-sm font-medium',
            'transition-all duration-200 pointer-events-none',
            'peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base',
            'peer-focus:top-2 peer-focus:text-xs',
            'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs',
            error
              ? 'text-error peer-focus:text-error'
              : success
                ? 'text-success peer-focus:text-success'
                : 'text-muted-foreground peer-focus:text-primary'
          )}
        >
          {label}
          {required && <span className="ml-1">*</span>}
        </label>

        {/* Validation icons */}
        {(error || success) && (
          <div className="absolute right-3 top-4">
            {error ? (
              <X className="w-5 h-5 text-error" />
            ) : (
              <Check className="w-5 h-5 text-success" />
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p
            id={`${fieldId}-error`}
            className="mt-1.5 text-sm text-error flex items-start gap-1"
            role="alert"
          >
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

InputField.displayName = 'InputField';

/**
 * Textarea field con floating label y validación visual
 */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, success, required, className, id, placeholder, ...props }, ref) => {
    const fieldId = id || label.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="relative">
        <textarea
          ref={ref}
          id={fieldId}
          placeholder={placeholder || ' '}
          className={cn(
            'peer flex min-h-[140px] w-full rounded-md border px-3 pt-6 pb-2',
            'bg-background',
            'text-sm',
            'placeholder-transparent',
            'focus-visible:outline-none',
            'focus-visible:ring-[3px]',
            'disabled:cursor-not-allowed',
            'disabled:opacity-50',
            'transition-all duration-200',
            'resize-none',
            error
              ? 'border-error focus-visible:border-error focus-visible:ring-error/20'
              : success
                ? 'border-success focus-visible:border-success focus-visible:ring-success/20'
                : 'border-input focus-visible:border-primary focus-visible:ring-primary/20',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          required={required}
          {...props}
        />

        {/* Floating Label */}
        <label
          htmlFor={fieldId}
          className={cn(
            'absolute left-3 top-3.5 text-sm font-medium',
            'transition-all duration-200 pointer-events-none',
            'peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base',
            'peer-focus:top-2 peer-focus:text-xs',
            'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs',
            error
              ? 'text-error peer-focus:text-error'
              : success
                ? 'text-success peer-focus:text-success'
                : 'text-muted-foreground peer-focus:text-primary'
          )}
        >
          {label}
          {required && <span className="ml-1">*</span>}
        </label>

        {/* Validation icons */}
        {(error || success) && (
          <div className="absolute right-3 top-4">
            {error ? (
              <X className="w-5 h-5 text-error" />
            ) : (
              <Check className="w-5 h-5 text-success" />
            )}
          </div>
        )}

        {/* Error message */}
        {error && (
          <p
            id={`${fieldId}-error`}
            className="mt-1.5 text-sm text-error flex items-start gap-1"
            role="alert"
          >
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';
