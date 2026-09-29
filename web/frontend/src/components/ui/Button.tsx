import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const isButtonLoading = isLoading || loading;
  const baseStyles = `inline-flex items-center justify-center font-bold transition-all duration-200 rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-center active:scale-[0.98] ${
    fullWidth ? 'w-full' : ''
  }`;

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[36px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-6 py-3.5 text-base gap-2.5 min-h-[50px]',
    xl: 'px-8 py-4 text-lg gap-3 min-h-[58px] w-full',
  };

  const variantStyles = {
    primary:
      'bg-teal-700 hover:bg-teal-800 text-white border-2 border-teal-700 focus:ring-4 focus:ring-teal-700/20 shadow-teal-900/10',
    outline:
      'bg-transparent hover:bg-teal-50 text-teal-700 border-2 border-teal-500 focus:ring-4 focus:ring-teal-500/20',
    ghost:
      'bg-transparent hover:bg-teal-50 text-teal-700 border-2 border-transparent focus:ring-4 focus:ring-teal-500/20',
    danger:
      'bg-red-600 hover:bg-red-700 text-white border-2 border-red-600 focus:ring-4 focus:ring-red-600/20',
    secondary:
      'bg-teal-50 hover:bg-teal-100 text-teal-800 border-2 border-teal-200 focus:ring-4 focus:ring-teal-600/20',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-600 focus:ring-4 focus:ring-emerald-600/20',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isButtonLoading}
      {...props}
    >
      {isButtonLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
      ) : (
        leftIcon
      )}
      <span className="truncate">{children}</span>
      {!isButtonLoading && rightIcon}
    </button>
  );
};
