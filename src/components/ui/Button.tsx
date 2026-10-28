import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  className,
  disabled,
  loading,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out select-none focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs h-9 min-h-[40px]",
    md: "px-4 py-2.5 text-sm h-11 min-h-[44px]",
    lg: "px-5 py-3 text-base h-12 min-h-[48px]",
  };

  const variantClasses = {
    primary: "bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-sm dark:bg-[#818CF8] dark:hover:bg-[#6366F1] dark:text-[#0E1014] font-semibold focus:ring-indigo-500 dark:focus:ring-offset-[#0F1117] focus:ring-offset-white",
    secondary: "bg-[#E5E7EB] hover:bg-[#D1D5DB] text-[#111827] dark:bg-[#262B35] dark:hover:bg-[#323846] dark:text-[#F3F4F6] focus:ring-gray-400 dark:focus:ring-offset-[#0F1117] focus:ring-offset-white",
    outline: "border border-[#E5E7EB] dark:border-[#262B35] bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#111827] dark:text-[#F3F4F6] focus:ring-indigo-500 dark:focus:ring-offset-[#0F1117] focus:ring-offset-white",
    danger: "bg-[#DC2626] hover:bg-[#B91C1C] text-white shadow-sm dark:bg-[#DC2626] dark:hover:#B91C1C focus:ring-red-500 dark:focus:ring-offset-[#0F1117] focus:ring-offset-white",
    ghost: "bg-transparent hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6] focus:ring-gray-400 dark:focus:ring-offset-[#0F1117] focus:ring-offset-white",
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && "w-full",
          disabled && "opacity-50 cursor-not-allowed",
          loading && "opacity-70 cursor-wait",
          className
        )
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && icon && <span className={clsx(children ? "mr-2" : "", "flex-shrink-0")}>{icon}</span>}
      {!loading && children}
    </button>
  );
};
