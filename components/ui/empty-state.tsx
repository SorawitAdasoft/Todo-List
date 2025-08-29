import * as React from 'react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center p-8', className)}>
      {icon && (
        <div className=\"mb-4 text-muted-foreground\">
          {icon}
        </div>
      )}
      <h3 className=\"text-lg font-semibold mb-2\">{title}</h3>
      {description && (
        <p className=\"text-muted-foreground mb-4 max-w-md\">{description}</p>
      )}
      {action && (
        <div className=\"mt-2\">
          {action}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = 'EmptyState';

export { EmptyState };