import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'elevated';
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  className,
  children,
  ...props
}) => {
  const baseClasses = 'bg-white rounded-lg border border-neutral-200 overflow-hidden';
  
  const variants = {
    default: 'shadow-sm',
    hover: 'shadow-sm hover:shadow-md hover:border-neutral-300 transition-all duration-200',
    elevated: 'shadow-lg',
  };

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ className, children, ...props }) => (
  <div className={cn('px-6 py-4 bg-neutral-50 border-b border-neutral-200', className)} {...props}>
    {children}
  </div>
);

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ className, children, ...props }) => (
  <div className={cn('p-6', className)} {...props}>
    {children}
  </div>
);

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardFooter: React.FC<CardFooterProps> = ({ className, children, ...props }) => (
  <div className={cn('px-6 py-4 bg-neutral-50 border-t border-neutral-200', className)} {...props}>
    {children}
  </div>
);

export { Card, CardHeader, CardContent, CardFooter };
