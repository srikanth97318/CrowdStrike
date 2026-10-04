import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'red' | 'amber' | 'none';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  glow = 'none',
  onClick,
}) => {
  const glowStyles = {
    none: 'border-command-border hover:border-command-muted/40',
    cyan: 'border-accent-cyan/40 shadow-cyan-glow',
    red: 'border-safety-danger/50 shadow-danger-glow',
    amber: 'border-safety-warning/50',
  }[glow];

  return (
    <div
      onClick={onClick}
      className={`bg-command-card rounded-xl border p-4 sm:p-5 transition-all duration-200 ${glowStyles} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, icon, className = '' }) => (
  <div className={`flex items-start justify-between gap-3 mb-4 ${className}`}>
    <div className="flex items-center gap-2.5">
      {icon && <div className="text-accent-cyan p-1.5 rounded-lg bg-command-surface border border-command-border">{icon}</div>}
      <div>
        <h3 className="text-sm font-semibold tracking-wide text-gray-100 uppercase">{title}</h3>
        {subtitle && <p className="text-xs text-command-muted mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {action && <div>{action}</div>}
  </div>
);
