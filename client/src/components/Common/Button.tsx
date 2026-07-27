import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const base =
    'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 ' +
    'transform active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60';

  const variants = {
    primary:
      'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 ' +
      'text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/35 ' +
      'border border-violet-500/25 hover:scale-[1.01]',
    secondary:
      'bg-slate-900/55 hover:bg-slate-900/80 text-slate-200 ' +
      'border border-slate-800 hover:border-slate-700 shadow-md hover:shadow-lg ' +
      'hover:text-white',
    danger:
      'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 ' +
      'text-white shadow-lg shadow-red-600/25 border border-red-500/20 hover:scale-[1.01]',
    success:
      'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 ' +
      'text-white shadow-lg shadow-emerald-600/25 border border-emerald-500/20 hover:scale-[1.01]',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-xs gap-1',
    md: 'px-5 py-2.5 text-sm gap-1.5',
    lg: 'px-7 py-3 text-[15px] gap-2',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
