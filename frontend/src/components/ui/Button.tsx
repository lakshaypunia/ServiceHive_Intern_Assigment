import { type ButtonHTMLAttributes, type ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 focus:ring-indigo-500',
  secondary:
    'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:bg-gray-100 focus:ring-gray-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 focus:ring-red-500',
  ghost:
    'bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400 focus:ring-gray-300',
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
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
