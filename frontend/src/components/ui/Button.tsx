import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-violet-600 text-white hover:bg-violet-700 disabled:bg-violet-400 focus:ring-violet-500',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 disabled:bg-slate-100 focus:ring-slate-400 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-700 dark:disabled:bg-slate-900 dark:focus:ring-slate-500',
  danger:
    'bg-rose-600 text-white hover:bg-rose-700 disabled:bg-rose-400 focus:ring-rose-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 disabled:text-slate-400 focus:ring-slate-300 dark:text-slate-300 dark:hover:bg-slate-800',
};

export function Button({
  isLoading = false,
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
