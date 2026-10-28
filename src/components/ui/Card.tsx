import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  colorBar?: string;
  isClickable?: boolean;
  padded?: boolean;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  colorBar,
  isClickable = false,
  padded = true,
  elevated = true,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        clsx(
          "bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] rounded-[var(--elizo-radius-card)] overflow-hidden relative transition-all duration-200 ease-in-out",
          elevated && "shadow-[var(--elizo-shadow-card)]",
          !elevated && "shadow-sm",
          isClickable && "cursor-pointer hover:border-[#4F46E5]/60 dark:hover:border-[#818CF8]/50 active:scale-[0.99]",
          padded && "p-5",
          className
        )
      )}
      {...props}
    >
      {colorBar && (
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: colorBar }}
        />
      )}
      {children}
    </div>
  );
};
