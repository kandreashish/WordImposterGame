import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'imposter' | 'majority' | 'primary';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none'
}) => {
  const glowStyles = {
    none: 'shadow-2xl shadow-black/40',
    imposter: 'glow-card-imposter border-red-500/20',
    majority: 'glow-card-majority border-emerald-500/20',
    primary: 'glow-card border-violet-500/20'
  };

  return (
    <div
      className={`glass-panel rounded-3xl p-6 md:p-8 flex flex-col transition-all duration-300 ${glowStyles[glow]} ${className}`}
    >
      {children}
    </div>
  );
};
