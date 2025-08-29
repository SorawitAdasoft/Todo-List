import * as React from 'react';
import { Plus } from 'lucide-react';
import { CreateTodoDto } from '@/lib/db/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export interface QuickAddTodoProps {
  onAdd: (data: CreateTodoDto) => Promise<void>;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

const QuickAddTodo: React.FC<QuickAddTodoProps> = ({
  onAdd,
  placeholder,
  className,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSubmitting || isLoading) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onAdd({ title: trimmedTitle });
      setTitle('');
    } catch (error) {
      console.error('Failed to add todo:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('flex space-x-2', className)}>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('todo.addTodo')}
        disabled={isSubmitting || isLoading}
        className=\"flex-1\"
      />
      <Button
        type=\"submit\"
        size=\"icon\"
        disabled={!title.trim() || isSubmitting || isLoading}
        aria-label={t('todo.addTodo')}
      >
        {isSubmitting ? (
          <div className=\"w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin\" />
        ) : (
          <Plus className=\"h-4 w-4\" />
        )}
      </Button>
    </form>
  );
};

QuickAddTodo.displayName = 'QuickAddTodo';

export { QuickAddTodo };"