import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'bordered';
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  hoverEffect = true,
  className = '',
  ...props
}) => {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-300 bg-white text-slate-900';

  const variantStyles = {
    default: 'border border-teal-100/90 shadow-md shadow-teal-950/5',
    glass: 'bg-white/80 backdrop-blur-md border border-teal-100/80 shadow-lg shadow-teal-900/5',
    bordered: 'border-2 border-teal-600 shadow-md shadow-teal-900/10',
  };

  const hoverStyles = hoverEffect
    ? 'hover:-translate-y-0.5 hover:border-teal-300 hover:shadow-xl hover:shadow-teal-900/10'
    : '';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
};
