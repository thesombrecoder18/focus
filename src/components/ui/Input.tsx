import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  helpText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helper,
  helpText,
  fullWidth = false,
  className,
  id,
  icon,
  rightAction,
  ...props
}) => {
  const inputId = id || props.name || 'input';
  const hasError = !!error;

  return (
    <div className={clsx("w-full", className)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5 tracking-tight"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7280] dark:text-[#9CA3AF] pointer-events-none">
            {icon}
          </div>
        )}
        {rightAction && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {rightAction}
          </div>
        )}
        <input
          id={inputId}
          className={twMerge(
            clsx(
              "flex h-11 w-full rounded-[var(--elizo-radius-btn)] border px-3 py-2 text-sm text-[#111827] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-1",
              icon && "pl-10",
              rightAction && "pr-10",
              "bg-white dark:bg-[#161922]",
              hasError
                ? "border-red-500 focus:ring-red-500 dark:border-red-500/50"
                : "border-[#E5E7EB] dark:border-[#262B35] focus:border-[#4F46E5] dark:focus:border-[#818CF8] focus:ring-indigo-500 dark:focus:ring-indigo-500",
              "disabled:bg-[#F3F4F6] dark:disabled:bg-[#0E1014] disabled:text-[#6B7280] dark:disabled:text-[#9CA3AF]",
              fullWidth && "w-full"
            ),
            className
          )}
          {...props}
        />
      </div>
      {hasError && (
        <p className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
      )}
      {!hasError && (helper || helpText) && (
        <p className="mt-1 text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
          {helper || helpText}
        </p>
      )}
    </div>
  );
};
