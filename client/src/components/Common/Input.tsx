import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = true,
  className = '',
  id,
  ...props
}) => {
  const widthStyle = fullWidth ? 'w-full' : '';
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${widthStyle}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-400 tracking-wider uppercase">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`glass-input px-4 py-2.5 rounded-xl text-slate-100 placeholder-slate-500 font-medium text-sm focus:outline-none ${
          error ? 'border-red-500/50 focus:border-red-500' : ''
        } ${widthStyle} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 font-medium mt-0.5">{error}</span>}
    </div>
  );
};
