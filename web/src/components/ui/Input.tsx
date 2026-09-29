'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  prefixText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, prefixText, type = 'text', className = '', id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const effectiveType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-1.5 font-sans">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-slate-700">
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center">
              {leftIcon}
            </div>
          )}

          {prefixText && (
            <div className="absolute left-3.5 text-slate-500 font-bold text-xs pointer-events-none select-none">
              {prefixText}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-all duration-200 outline-none placeholder:text-slate-400 placeholder:font-normal disabled:opacity-50 disabled:bg-slate-50 shadow-xs ${
              leftIcon ? 'pl-10' : prefixText ? 'pl-12' : ''
            } ${isPasswordType || rightIcon ? 'pr-10' : ''} ${
              error
                ? 'border-rose-400 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15'
                : 'border-slate-200 hover:border-slate-300 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/15'
            } ${className}`}
            {...props}
          />

          {isPasswordType ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none p-1 transition cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          ) : (
            rightIcon && (
              <div className="absolute right-3 text-slate-400 pointer-events-none flex items-center">
                {rightIcon}
              </div>
            )
          )}
        </div>

        {error ? (
          <p className="text-xs font-medium text-rose-600">{error}</p>
        ) : helperText ? (
          <p className="text-xs font-normal text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
