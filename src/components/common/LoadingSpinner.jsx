import React from 'react';

export default function LoadingSpinner({ text = 'Chargement...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-10 h-10 border-2 border-neutral-200 border-t-[#111111] rounded-full animate-spin"></div>
      {text && <p className="mt-4 text-xs uppercase tracking-widest text-neutral-500 font-medium">{text}</p>}
    </div>
  );
}
