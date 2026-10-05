import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      children,
      leftIcon,
      rightIcon,
      fullWidth,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'inline-flex items-center justify-center font-medium rounded-lg',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'active:scale-[0.98]',
    ];

    const variants = {
      primary: [
        'bg-primary-600 text-white',
        'hover:bg-primary-700',
        'focus-visible:ring-primary-500',
        'shadow-sm hover:shadow-md',
      ],
      secondary: [
        'bg-neutral-900 text-white',
        'hover:bg-neutral-800',
        'focus-visible:ring-neutral-500',
      ],
      outline: [
        'border-2 border-neutral-900 text-neutral-900 bg-transparent',
        'hover:bg-neutral-100',
        'focus-visible:ring-neutral-500',
      ],
      ghost: [
        'text-neutral-700',
        'hover:bg-neutral-100',
        'focus-visible:ring-neutral-500',
      ],
      danger: [
        'bg-danger-600 text-white',
        'hover:bg-danger-700',
        'focus-visible:ring-danger-500',
        'shadow-sm hover:shadow-md',
      ],
      success: [
        'bg-success-600 text-white',
        'hover:bg-success-700',
        'focus-visible:ring-success-500',
        'shadow-sm hover:shadow-md',
      ],
    };

    const sizes = {
      xs: 'px-2.5 py-1.5 text-xs gap-1',
      sm: 'px-3 py-2 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-2',
      xl: 'px-8 py-4 text-xl gap-3',
    };

    const width = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          width,
          className
        )}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <Loader2
            className="h-4 w-4 animate-spin"
            aria-hidden="true"
          />
        )}
        {!loading && leftIcon && (
          <span aria-hidden="true">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!loading && rightIcon && (
          <span aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';