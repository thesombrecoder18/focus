import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  maxHeight = "85vh",
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-in-out"
        onClick={onClose}
      />

      <div
        className={twMerge(
          clsx(
            "fixed bottom-0 left-0 right-0 z-50 w-full max-w-[500px] mx-auto mt-auto rounded-t-[var(--elizo-radius-xl)] bg-white dark:bg-[#161922] border-t border-[#E5E7EB] dark:border-[#262B35] shadow-[var(--elizo-shadow-card)] animate-[slideUp_0.3s_ease-out_forwards]",
            className
          )
        )}
        style={{ maxHeight }}
      >
        <div className="flex justify-center py-3">
          <div className="w-10 h-1.5 rounded-full bg-[#E5E7EB] dark:bg-[#262B35]" />
        </div>

        {title && (
          <div className="px-6 pb-4 border-b border-[#E5E7EB]/50 dark:border-[#262B35]/50">
            <h3 className="text-lg font-semibold text-[#111827] dark:text-[#F3F4F6] tracking-tight">
              {title}
            </h3>
          </div>
        )}

        <div className="px-6 pb-8 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </>
  );
};
