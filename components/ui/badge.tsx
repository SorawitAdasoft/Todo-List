import * as React from 'react';
import { X } from 'lucide-react';
import { cn, stringToColor } from '@/lib/utils';
import { Button } from './button';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', removable, onRemove, children, ...props }, ref) => {
    const variants = {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-secondary text-secondary-foreground',
      destructive: 'border-transparent bg-destructive text-destructive-foreground',
      outline: 'text-foreground border-border',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
        {removable && onRemove && (
          <Button
            variant=\"ghost\"
            size=\"icon\"
            onClick={onRemove}
            className=\"ml-1 h-4 w-4 rounded-full p-0 hover:bg-black/10 dark:hover:bg-white/10\"
            aria-label=\"Remove badge\"
          >
            <X className=\"h-3 w-3\" />
          </Button>
        )}
      </div>
    );
  }
);

Badge.displayName = 'Badge';

// Tag Badge Component (for todo tags)
export interface TagBadgeProps {
  tag: string;
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export const TagBadge: React.FC<TagBadgeProps> = ({ 
  tag, 
  removable, 
  onRemove, 
  className 
}) => {
  const backgroundColor = stringToColor(tag);
  
  return (
    <Badge
      variant=\"outline\"
      removable={removable}
      onRemove={onRemove}
      className={cn('text-white border-0', className)}
      style={{ backgroundColor }}
    >
      {tag}
    </Badge>
  );
};

export { Badge };