'use client';

import { useId, useCallback, type ChangeEvent } from 'react';

export interface CheckboxGroupItem {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface CheckboxGroupProps {
  legend: string;
  items: CheckboxGroupItem[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  required?: boolean;
}

export function CheckboxGroup({
  legend,
  items,
  value,
  onChange,
  error,
  required,
}: CheckboxGroupProps) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const itemValue = e.target.value;
      if (e.target.checked) {
        onChange([...value, itemValue]);
      } else {
        onChange(value.filter((v) => v !== itemValue));
      }
    },
    [value, onChange],
  );

  return (
    <fieldset
      aria-describedby={error ? errorId : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend className="text-sm font-medium text-primary-900 font-body mb-2">
        {legend}
        {required && (
          <span className="text-accent-600 ml-0.5" aria-hidden="true">
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </legend>
      <div className="flex flex-col gap-2" role="group">
        {items.map((item) => {
          const itemId = `${groupId}-${item.value}`;
          const descId = `${itemId}-desc`;
          return (
            <div key={item.value} className="flex items-start gap-2">
              <input
                type="checkbox"
                id={itemId}
                value={item.value}
                checked={value.includes(item.value)}
                onChange={handleChange}
                disabled={item.disabled}
                aria-describedby={item.description ? descId : undefined}
                className="mt-0.5 h-4 w-4 rounded border-surface-300 text-primary-600 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex flex-col">
                <label
                  htmlFor={itemId}
                  className="text-sm text-primary-900 font-body select-none"
                >
                  {item.label}
                </label>
                {item.description && (
                  <span id={descId} className="text-xs text-primary-500 font-body">
                    {item.description}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-600 font-body" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
