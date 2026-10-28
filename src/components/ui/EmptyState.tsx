import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: React.ReactNode;
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center rounded-[var(--elizo-radius-card)] bg-[#F7F8FA] dark:bg-[#0E1014]/30 border border-dashed border-[#E5E7EB] dark:border-[#262B35] my-2 transition-colors duration-200 ${className}`}>
      <div className="w-14 h-14 rounded-full bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center mb-4 shadow-sm">
        {icon}
      </div>
      {title && (
        <h4 className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] mb-2 tracking-tight">
          {title}
        </h4>
      )}
      <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
