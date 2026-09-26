import React from 'react';

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: 'success' | 'info' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, type = 'success' }) => {
  return (
    <div
      className={`fixed top-24 right-6 z-50 transform transition-all duration-300 ease-out bg-[#32302c] text-[#f5f0e9] px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-[#dec0ba]/20 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[-20px] opacity-0 pointer-events-none'
      }`}
      role="status"
      aria-live="polite"
    >
      <span className="material-symbols-outlined text-[20px] text-[#fe7e5d]">
        {type === 'error' ? 'error' : 'check_circle'}
      </span>
      <span className="font-['Manrope'] text-[14px] font-medium">{message}</span>
    </div>
  );
};
