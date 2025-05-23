import React, { forwardRef } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', fullWidth = false, helperText, ...props }, ref) => {
    const inputClasses = `px-3 py-2 bg-white border rounded-md text-sm shadow-sm placeholder-gray-400
      focus:outline-none focus:border-[#00859e] focus:ring-1 focus:ring-[#00859e]
      disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200 disabled:shadow-none
      ${error ? 'border-red-500' : 'border-gray-300'}
      ${fullWidth ? 'w-full' : ''}
      ${className}`;

    return (
      <div className={`${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input className={inputClasses} ref={ref} {...props} />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';