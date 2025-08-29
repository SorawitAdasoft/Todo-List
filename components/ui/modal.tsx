import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  size = 'md'
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className=\"fixed inset-0 z-50 flex items-center justify-center\">
      {/* Backdrop */}
      <div
        className=\"fixed inset-0 bg-black/50 transition-opacity\"
        onClick={onClose}
        aria-hidden=\"true\"
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative w-full mx-4 bg-background rounded-lg shadow-lg animate-slide-up',
          sizeClasses[size],
          className
        )}
        role=\"dialog\"
        aria-modal=\"true\"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        {(title || description) && (
          <div className=\"flex items-start justify-between p-6 border-b\">
            <div className=\"space-y-1\">
              {title && (
                <h2 id=\"modal-title\" className=\"text-lg font-semibold\">
                  {title}
                </h2>
              )}
              {description && (
                <p id=\"modal-description\" className=\"text-sm text-muted-foreground\">
                  {description}
                </p>
              )}
            </div>
            <Button
              variant=\"ghost\"
              size=\"icon\"
              onClick={onClose}
              className=\"h-6 w-6 rounded-md\"
              aria-label=\"Close modal\"
            >
              <X className=\"h-4 w-4\" />
            </Button>
          </div>
        )}
        
        {/* Content */}
        <div className=\"p-6\">
          {children}
        </div>
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

export { Modal };