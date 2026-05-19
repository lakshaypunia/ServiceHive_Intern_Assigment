import { forwardRef, type InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon: Icon, className = '', ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
        <div className="relative">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Icon className="h-4.5 w-4.5 text-gray-400" />
            </div>
          )}
          <input
            ref={ref}
            {...props}
            className={`block w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-2.5 border rounded-lg text-sm text-gray-900 placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
              error
                ? 'border-red-400 bg-red-50 focus:ring-red-400'
                : 'border-gray-300 bg-white hover:border-gray-400'
            } ${className}`}
          />
        </div>
        {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
