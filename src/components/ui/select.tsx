'use client';

import { forwardRef, useId, type SelectHTMLAttributes } from 'react';

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  helperText?: string;
  error?: string;
  id?: string;
  children: React.ReactNode;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, helperText, error, required, className = '', id: externalId, children, ...rest },
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
      <div className="relative">
        <select
          ref={ref}
          id={id}
          required={required}
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={[
            'w-full appearance-none rounded-lg border px-3 py-2 pr-10 text-base font-body text-primary-950 bg-white',
            'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:outline-none',
            'transition-colors duration-150',
            error
              ? 'border-red-500 focus-visible:ring-red-500'
              : 'border-surface-300 hover:border-surface-400',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          ].join(' ')}
          {...rest}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg
            className="h-4 w-4 text-primary-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
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
