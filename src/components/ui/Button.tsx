import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'blue' | 'success' | 'warning' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'btn-primary',
  blue: 'btn-blue',
  success: 'btn-success',
  warning: 'btn-warning',
  danger: 'btn-danger',
  ghost: 'btn-ghost',
};

const sizeClasses = {
  sm: 'px-3 py-2 text-xs min-h-[40px]',
  md: 'px-5 py-3 text-sm min-h-[48px]',
  lg: 'px-6 py-4 text-base min-h-[56px]',
  xl: 'px-8 py-5 text-lg min-h-[64px]',
};

export function Button({
  variant = 'primary', size = 'md', loading, icon, fullWidth, children, className, disabled, ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        'flex items-center justify-center gap-2 font-game tracking-wide',
        className
      )}
      disabled={disabled || loading}
      {...(props as Record<string, unknown>)}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : icon}
      {children}
    </motion.button>
  );
}
