import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  className?: string;
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  size = 'sm',
  fullWidth = false,
  className,
}: SegmentedControlProps<T>) {
  const sizeClasses = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "inline-flex items-center justify-center rounded-[var(--elizo-radius-xl)] border border-[#E5E7EB] dark:border-[#262B35] bg-white dark:bg-[#161922] shadow-sm",
          fullWidth && "w-full",
          className
        )
      )}
    >
      {options.map((opt) => {
        const isActive = value === opt.value;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={twMerge(
              clsx(
                "relative flex items-center justify-center whitespace-nowrap transition-all duration-200 ease-in-out font-medium",
                sizeClasses[size],
                fullWidth ? "flex-1" : "",
                isActive
                  ? "bg-[#4F46E5] text-white dark:bg-[#818CF8] dark:text-[#0E1014] shadow-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] hover:bg-black/5 dark:hover:bg-white/5 focus:ring-2 focus:ring-transparent"
              )
            )}
          >
            {Icon && <span className={clsx("flex-shrink-0", isActive ? "mr-1" : "mr-1.5")}>{Icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
