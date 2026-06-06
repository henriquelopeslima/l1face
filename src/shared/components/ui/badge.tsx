import type { CSSProperties } from 'react';
import { cn } from './utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline';
  className?: string;
  style?: CSSProperties;
}

export function Badge({ children, variant = 'default', className, style }: BadgeProps) {
  const variants = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-[#D5F5ED] text-[#059669] dark:bg-[#0D3A30] dark:text-[#06D6A0]',
    warning: 'bg-[#FFF4D6] text-[#92400E] dark:bg-[#3D2F00] dark:text-[#FFB800]',
    danger: 'bg-[#FEE2E2] text-[#991B1B] dark:bg-[#3D1515] dark:text-[#EF5B5B]',
    info: 'bg-[#E8F2FF] text-[#1E3A8A] dark:bg-[#0D1F3D] dark:text-[#4D8EFF]',
    outline: 'border border-border text-foreground',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
        variants[variant],
        className
      )}
      style={style}
    >
      {children}
    </span>
  );
}
