import * as React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps extends Toast {
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({
  id,
  type,
  title,
  description,
  duration = 5000,
  onRemove
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    setIsVisible(true);
    
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onRemove(id), 300); // Wait for exit animation
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [id, duration, onRemove]);

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-900/50 dark:text-green-200',
    error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/50 dark:text-red-200',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
    info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        'flex items-start space-x-3 rounded-lg border p-4 shadow-md transition-all duration-300',
        colors[type],
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <Icon className=\"h-5 w-5 flex-shrink-0 mt-0.5\" />
      <div className=\"flex-1 space-y-1\">
        <p className=\"font-medium\">{title}</p>
        {description && (
          <p className=\"text-sm opacity-90\">{description}</p>
        )}
      </div>
      <Button
        variant=\"ghost\"
        size=\"icon\"
        onClick={() => {
          setIsVisible(false);
          setTimeout(() => onRemove(id), 300);
        }}
        className=\"h-6 w-6 flex-shrink-0 hover:bg-black/10 dark:hover:bg-white/10\"
        aria-label=\"Close notification\"
      >
        <X className=\"h-4 w-4\" />
      </Button>
    </div>
  );
};

// Toast Context
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      
      {/* Toast Container */}
      <div className=\"fixed top-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full\">
        {toasts.map(toast => (
          <ToastComponent
            key={toast.id}
            {...toast}
            onRemove={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// Toast Hook
export function useToast() {
  const context = React.useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

// Convenience functions
export function useToastActions() {
  const { addToast } = useToast();
  
  return {
    success: (title: string, description?: string) => 
      addToast({ type: 'success', title, description }),
    error: (title: string, description?: string) => 
      addToast({ type: 'error', title, description }),
    warning: (title: string, description?: string) => 
      addToast({ type: 'warning', title, description }),
    info: (title: string, description?: string) => 
      addToast({ type: 'info', title, description }),
  };
}