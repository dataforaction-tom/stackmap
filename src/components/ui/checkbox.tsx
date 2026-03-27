'use client';

import { forwardRef, useId, type InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: string;
  id?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, className = '', id: externalId, ...rest },
  ref,
) {
  const generatedId = useId();
  const id = externalId ?? generatedId;

  return (
    <div className="flex items-start gap-2">
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className={[
          'mt-0.5 h-4 w-4 rounded border-surface-300 text-primary-600',
          'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          className,
        ].join(' ')}
        {...rest}
      />
      <label htmlFor={id} className="text-sm text-primary-900 font-body select-none">
        {label}
      </label>
    </div>
  );
});
