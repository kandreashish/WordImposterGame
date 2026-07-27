import React from 'react';

interface TimerProps {
  value: number;
  total: number;
}

export const Timer: React.FC<TimerProps> = ({ value, total }) => {
  const percentage = total > 0 ? (value / total) * 100 : 100;
  
  // SVG Circle parameters
  const radius = 24;
  const stroke = 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  // Determine indicator color based on time remaining
  let strokeColor = 'stroke-emerald-400';
  let textColor = 'text-emerald-400';

  if (percentage <= 25) {
    strokeColor = 'stroke-rose-500 animate-pulse';
    textColor = 'text-rose-400';
  } else if (percentage <= 50) {
    strokeColor = 'stroke-amber-400';
    textColor = 'text-amber-400';
  }
  return (
    <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 px-4 py-2 rounded-2xl shadow-inner">
      <div className="relative flex items-center justify-center">
        <svg height={radius * 2} width={radius * 2} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            className="stroke-slate-800"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          {/* Progress circle */}
          <circle
            className={`${strokeColor} transition-all duration-1000 ease-linear`}
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-2xs font-semibold text-slate-500 uppercase tracking-wider leading-none">
          Time Left
        </span>
        <span className={`text-xl font-bold font-mono tracking-tight leading-none ${textColor}`}>
          {value}s
        </span>
      </div>
    </div>
  );
};
