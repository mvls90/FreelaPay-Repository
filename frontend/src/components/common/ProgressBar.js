import React from 'react';
import clsx from 'clsx';

export default function ProgressBar({ value = 0, max = 100, label, showPercent = true, color = 'indigo', size = 'md' }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  const colors = {
    indigo: 'bg-indigo-500',
    green:  'bg-green-500',
    blue:   'bg-blue-500',
    yellow: 'bg-yellow-500',
    red:    'bg-red-500',
  };

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-gray-600">{label}</span>}
          {showPercent && <span className="text-xs font-bold text-gray-700">{Math.round(pct)}%</span>}
        </div>
      )}
      <div className={clsx('w-full bg-gray-100 rounded-full overflow-hidden', heights[size])}>
        <div
          className={clsx('rounded-full transition-all duration-500', colors[color], heights[size])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
