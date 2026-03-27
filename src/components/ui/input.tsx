'use client';

import { forwardRef, useId, type InputHTMLAttributes } from 'react';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  helperText?: string;
  error?: string;
  id?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, required, className = '', id: externalId, ...rest },
  ref,
) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;

  const describedBy = [helperText ? helperId : null, error ? errorId : null]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-primary-900 font-body">
        {label}
        {required && (
          <span className="text-accent-600 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <input
        ref={ref}
        id={id}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={[
          'rounded-lg border px-3 py-2 text-base font-body text-primary-950 bg-white',
          'placeholder:text-primary-400',
          'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none',
          'transition-colors duration-150',
          error
            ? 'border-red-500 focus-visible:ring-red-500'
            : 'border-surface-300 hover:border-surface-400',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...rest}
      />
      {helperText && !error && (
        <p id={helperId} className="text-sm text-primary-600 font-body">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-sm text-red-600 font-body" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
