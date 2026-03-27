'use client';

import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';

const variantStyles = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus-visible:ring-primary-500',
  secondary:
    'bg-surface-100 text-primary-800 border border-surface-300 hover:bg-surface-200 active:bg-surface-300 focus-visible:ring-primary-500',
  accent:
    'bg-accent-600 text-white hover:bg-accent-700 active:bg-accent-800 focus-visible:ring-accent-500',
  ghost:
    'bg-transparent text-primary-700 hover:bg-surface-100 active:bg-surface-200 focus-visible:ring-primary-500',
} as const;

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

type ButtonVariant = keyof typeof variantStyles;
type ButtonSize = keyof typeof sizeStyles;

interface ButtonBaseProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
}

export type ButtonAsButtonProps = ButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> & {
    as?: 'button';
    href?: never;
  };

export type ButtonAsAnchorProps = ButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps> & {
    as: 'a';
    href: string;
  };

export type ButtonProps = ButtonAsButtonProps | ButtonAsAnchorProps;

function Spinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-2 h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(props, ref) {
    const {
      variant = 'primary',
      size = 'md',
      loading = false,
      children,
      className = '',
      ...rest
    } = props;

    const baseClasses =
      'inline-flex items-center justify-center rounded-lg font-body font-medium transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const classes = [baseClasses, variantStyles[variant], sizeStyles[size], className]
      .filter(Boolean)
      .join(' ');

    if (props.as === 'a') {
      const { as: _, variant: _v, size: _s, loading: _l, ...anchorProps } = rest as Omit<
        ButtonAsAnchorProps,
        'children' | 'className'
      >;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={classes}
          aria-disabled={loading || undefined}
          aria-busy={loading || undefined}
          {...anchorProps}
        >
          {loading && <Spinner />}
          {children}
        </a>
      );
    }

    const { as: _, variant: _v, size: _s, loading: _l, ...buttonProps } = rest as Omit<
      ButtonAsButtonProps,
      'children' | 'className'
    >;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        disabled={(buttonProps as ButtonHTMLAttributes<HTMLButtonElement>).disabled || loading}
        aria-busy={loading || undefined}
        {...buttonProps}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  },
);
