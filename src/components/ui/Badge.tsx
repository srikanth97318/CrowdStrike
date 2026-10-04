import React from 'react';

export type BadgeVariant = 'safe' | 'warning' | 'critical' | 'info' | 'neutral' | 'cyan';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  pulse?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  dot = false,
  pulse = false,
  className = '',
  size = 'md',
}) => {
  const variantStyles = {
    safe: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    critical: 'bg-red-500/15 text-red-400 border-red-500/40',
    info: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  }[variant];

  const dotColors = {
    safe: 'bg-emerald-400',
    warning: 'bg-amber-400',
    critical: 'bg-red-400',
    info: 'bg-sky-400',
    cyan: 'bg-cyan-400',
    neutral: 'bg-slate-400',
  }[variant];

  const sizeStyles = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border font-mono tracking-tight ${sizeStyles} ${variantStyles} ${className}`}
    >
      {dot && (
        <span className="relative flex h-2 w-2">
          {pulse && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors}`}
            />
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors}`} />
        </span>
      )}
      {children}
    </span>
  );
};
