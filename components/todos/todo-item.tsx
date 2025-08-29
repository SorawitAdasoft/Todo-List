import * as React from 'react';
import { 
  Calendar, 
  Clock, 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle,
  Circle
} from 'lucide-react';
import { Todo, Priority } from '@/lib/db/types';
import { formatDueDate } from '@/lib/date';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { TagBadge } from '@/components/ui/badge';
import { useTranslation } from '@/lib/i18n';

export interface TodoItemProps {
  todo: Todo;
  isSelected?: boolean;
  isSelecting?: boolean;
  onToggle?: (id: string) => void;
  onEdit?: (todo: Todo) => void;
  onDelete?: (id: string) => void;
  onSelect?: (id: string, selected: boolean) => void;
  onClick?: (todo: Todo) => void;
}

const priorityColors: Record<Priority, string> = {
  low: 'bg-blue-500',
  normal: 'bg-yellow-500',
  high: 'bg-red-500',
};

const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  isSelected = false,
  isSelecting = false,
  onToggle,
  onEdit,
  onDelete,
  onSelect,
  onClick
}) => {
  const { t } = useTranslation();
  const [showActions, setShowActions] = React.useState(false);
  const dueDateInfo = todo.dueDate ? formatDueDate(todo.dueDate) : null;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle?.(todo.id);
  };

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    onSelect?.(todo.id, e.target.checked);
  };

  const handleItemClick = () => {
    if (!isSelecting) {
      onClick?.(todo);
    }
  };

  return (
    <div
      className={cn(
        'group relative flex items-start space-x-3 rounded-lg border p-4 transition-all hover:shadow-md',
        todo.completed && 'opacity-60',
        isSelected && 'ring-2 ring-primary',
        'cursor-pointer hover:bg-accent/50'
      )}
      onClick={handleItemClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection checkbox (visible during bulk operations) */}
      {isSelecting && (
        <Checkbox
          checked={isSelected}
          onChange={handleSelect}
          onClick={(e) => e.stopPropagation()}
          className=\"mt-1\"
        />
      )}

      {/* Completion toggle */}
      <Button
        variant=\"ghost\"
        size=\"icon\"
        onClick={handleToggle}
        className=\"h-6 w-6 flex-shrink-0 mt-1 p-0\"
        aria-label={todo.completed ? t('todo.markIncomplete') : t('todo.markComplete')}
      >
        {todo.completed ? (
          <CheckCircle className=\"h-5 w-5 text-green-600\" />
        ) : (
          <Circle className=\"h-5 w-5 text-muted-foreground hover:text-foreground\" />
        )}
      </Button>

      {/* Content */}
      <div className=\"flex-1 min-w-0\">
        {/* Title and priority */}
        <div className=\"flex items-start space-x-2\">
          {/* Priority indicator */}
          <div
            className={cn(
              'w-2 h-2 rounded-full flex-shrink-0 mt-2',
              priorityColors[todo.priority]
            )}
            title={t(`priority.${todo.priority}`)}
          />
          
          {/* Title */}
          <h3
            className={cn(
              'text-sm font-medium leading-tight',
              todo.completed && 'line-through text-muted-foreground'
            )}
          >
            {todo.title}
          </h3>
        </div>

        {/* Notes */}
        {todo.notes && (
          <p className=\"mt-1 text-sm text-muted-foreground line-clamp-2\">
            {todo.notes}
          </p>
        )}

        {/* Tags and due date */}
        <div className=\"flex items-center justify-between mt-2\">
          {/* Tags */}
          <div className=\"flex flex-wrap gap-1\">
            {todo.tags.map((tag) => (
              <TagBadge key={tag} tag={tag} className=\"text-xs\" />
            ))}
          </div>

          {/* Due date */}
          {dueDateInfo && dueDateInfo.status !== 'none' && (
            <div
              className={cn(
                'flex items-center space-x-1 text-xs rounded-md px-2 py-1',
                dueDateInfo.status === 'overdue' && 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
                dueDateInfo.status === 'today' && 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
                dueDateInfo.status === 'tomorrow' && 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
                dueDateInfo.status === 'upcoming' && 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              )}
            >
              {dueDateInfo.status === 'overdue' ? (
                <Clock className=\"h-3 w-3\" />
              ) : (
                <Calendar className=\"h-3 w-3\" />
              )}
              <span>{dueDateInfo.formatted}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions menu */}
      {(showActions || showActions) && !isSelecting && (
        <div className=\"flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity\">
          <Button
            variant=\"ghost\"
            size=\"icon\"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(todo);
            }}
            className=\"h-8 w-8\"
            aria-label={t('common.edit')}
          >
            <Edit className=\"h-4 w-4\" />
          </Button>
          <Button
            variant=\"ghost\"
            size=\"icon\"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(todo.id);
            }}
            className=\"h-8 w-8 text-destructive hover:text-destructive\"
            aria-label={t('common.delete')}
          >
            <Trash2 className=\"h-4 w-4\" />
          </Button>
        </div>
      )}
    </div>
  );
};

TodoItem.displayName = 'TodoItem';

export { TodoItem };"