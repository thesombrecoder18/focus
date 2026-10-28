import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'outline' | 'secondary' | 'info' | string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
  icon,
  ...props
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs",
  };

  const variantClasses: Record<string, string> = {
    default: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50",
    success: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/50",
    warning: "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-100 dark:border-amber-900/50",
    danger: "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-900/50",
    info: "bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/30",
    outline: "border border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF] bg-transparent",
    secondary: "bg-[#E5E7EB] dark:bg-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]",
  };

  return (
    <span
      className={twMerge(
        clsx(
          "inline-flex items-center rounded-full font-medium transition-colors duration-200 whitespace-nowrap",
          sizeClasses[size],
          variantClasses[variant],
          className
        )
      )}
      {...props}
    >
      {icon && <span className="mr-1.5 flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};
