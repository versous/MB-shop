import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function NotificationBanner({ notification, onClose }) {
  if (!notification) return null;

  const isSuccess = notification.type === 'success';
  const isError = notification.type === 'error';

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md animate-in slide-in-from-top-3 fade-in duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-none shadow-2xl border ${
          isSuccess
            ? 'bg-[#111111] text-white border-black'
            : isError
            ? 'bg-red-950 text-white border-red-800'
            : 'bg-white text-[#111111] border-neutral-300'
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
        {isError && <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />}

        <div className="flex-1 text-sm font-medium leading-snug">
          {notification.message}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
