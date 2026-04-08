import React from 'react';
import clsx from 'clsx';

const COLORS = [
  'bg-indigo-100 text-indigo-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
];

function colorFromName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return COLORS[hash % COLORS.length];
}

const SIZES = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-2xl',
};

export default function Avatar({ name = '', src, size = 'md', className }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  const colorCls = colorFromName(name);
  const sizeCls  = SIZES[size] || SIZES.md;

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={clsx('rounded-full object-cover flex-shrink-0', sizeCls, className)}
      />
    );
  }

  return (
    <div className={clsx('rounded-full flex items-center justify-center font-semibold flex-shrink-0', sizeCls, colorCls, className)}>
      {initials || '?'}
    </div>
  );
}
