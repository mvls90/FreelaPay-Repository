import React from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

export default function LoadingSpinner({ size = 'md', fullPage = false, text }) {
  const sizes = { sm: 16, md: 28, lg: 40 };
  const px    = sizes[size] || sizes.md;

  if (fullPage) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white/80 z-50">
        <Loader2 size={px} className="animate-spin text-indigo-600" />
        {text && <p className="text-sm text-gray-500 mt-3">{text}</p>}
      </div>
    );
  }

  return (
    <div className={clsx('flex flex-col items-center justify-center', fullPage ? 'h-screen' : 'h-40')}>
      <Loader2 size={px} className="animate-spin text-indigo-600" />
      {text && <p className="text-sm text-gray-500 mt-2">{text}</p>}
    </div>
  );
}
