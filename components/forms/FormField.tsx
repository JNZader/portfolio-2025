import { Check, X } from 'lucide-react';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
} from 'react';
import { cn } from '@/lib/utils';

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  success?: boolean;
}

type InputFieldProps = BaseFieldProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaFieldProps = BaseFieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

// Shared classes for both input and textarea
const BASE_FIELD_CLASSES = [
  'peer flex w-full rounded-md border px-3 pt-6 pb-2',
  'bg-background',
  'text-sm',
  'placeholder-transparent',
  'focus-visible:outline-none',
  'focus-visible:ring-[3px]',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
  'transition-all duration-200',
];

const FLOATING_LABEL_CLASSES = [
  'absolute left-3 top-3.5 text-sm font-medium',
  'transition-all duration-200 pointer-events-none',
  'peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base',
  'peer-focus:top-2 peer-focus:text-xs',
  'peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs',
];

// Helper function to get border/ring classes based on validation state
function getInputStateClasses(error?: string, success?: boolean): string {
  if (error) {
    return 'border-error focus-visible:border-error focus-visible:ring-error/20';
  }
  if (success) {
    return 'border-success focus-visible:border-success focus-visible:ring-success/20';
  }
  return 'border-input focus-visible:border-primary focus-visible:ring-primary/20';
}

// Helper function to get label color classes based on validation state
function getLabelStateClasses(error?: string, success?: boolean): string {
  if (error) {
    return 'text-error peer-focus:text-error';
  }
  if (success) {
    return 'text-success peer-focus:text-success';
  }
  return 'text-muted-foreground peer-focus:text-primary';
}

// Generate field ID from label
function generateFieldId(id: string | undefined, label: string): string {
  return id ?? label.toLowerCase().replaceAll(/\s/g, '-');
}

// Shared wrapper for floating label, icons, and error message
interface FieldWrapperProps {
  fieldId: string;
  label: string;
  error?: string;
  success?: boolean;
  required?: boolean;
  children: ReactNode;
}

function FieldWrapper({
  fieldId,
  label,
  error,
  success,
  required,
  children,
}: Readonly<FieldWrapperProps>) {
  return (
    <div className="relative">
      {children}

      {/* Floating Label */}
      <label
        htmlFor={fieldId}
        className={cn(FLOATING_LABEL_CLASSES, getLabelStateClasses(error, success))}
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

/**
 * Input field con floating label y validación visual
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, success, required, className, id, placeholder, ...props }, ref) => {
    const fieldId = generateFieldId(id, label);

    return (
      <FieldWrapper
        fieldId={fieldId}
        label={label}
        error={error}
        success={success}
        required={required}
      >
        <input
          ref={ref}
          id={fieldId}
          placeholder={placeholder ?? ' '}
          className={cn(
            BASE_FIELD_CLASSES,
            'h-12',
            getInputStateClasses(error, success),
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          required={required}
          {...props}
        />
      </FieldWrapper>
    );
  }
);

InputField.displayName = 'InputField';

/**
 * Textarea field con floating label y validación visual
 */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, success, required, className, id, placeholder, ...props }, ref) => {
    const fieldId = generateFieldId(id, label);

    return (
      <FieldWrapper
        fieldId={fieldId}
        label={label}
        error={error}
        success={success}
        required={required}
      >
        <textarea
          ref={ref}
          id={fieldId}
          placeholder={placeholder ?? ' '}
          className={cn(
            BASE_FIELD_CLASSES,
            'min-h-[140px] resize-none',
            getInputStateClasses(error, success),
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          required={required}
          {...props}
        />
      </FieldWrapper>
    );
  }
);

TextareaField.displayName = 'TextareaField';
