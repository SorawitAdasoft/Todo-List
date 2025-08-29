import * as React from 'react';
import { Todo } from '@/lib/db/types';
import { TodoItem } from './todo-item';
import { EmptyState } from '@/components/ui/empty-state';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, ListTodo } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

export interface TodoListProps {
  todos: Todo[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  emptyDescription?: string;
  enableBulkActions?: boolean;
  onToggleTodo?: (id: string) => void;
  onEditTodo?: (todo: Todo) => void;
  onDeleteTodo?: (id: string) => void;
  onBulkComplete?: (ids: string[]) => void;
  onBulkDelete?: (ids: string[]) => void;
  onTodoClick?: (todo: Todo) => void;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  loading = false,
  error,
  emptyMessage,
  emptyDescription,
  enableBulkActions = false,
  onToggleTodo,
  onEditTodo,
  onDeleteTodo,
  onBulkComplete,
  onBulkDelete,
  onTodoClick
}) => {
  const { t } = useTranslation();
  const [selectedTodos, setSelectedTodos] = React.useState<Set<string>>(new Set());
  const [isSelecting, setIsSelecting] = React.useState(false);

  const handleSelectTodo = (id: string, selected: boolean) => {
    setSelectedTodos(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedTodos.size === todos.length) {
      setSelectedTodos(new Set());
    } else {
      setSelectedTodos(new Set(todos.map(todo => todo.id)));
    }
  };

  const handleBulkComplete = () => {
    onBulkComplete?.(Array.from(selectedTodos));
    setSelectedTodos(new Set());
    setIsSelecting(false);
  };

  const handleBulkDelete = () => {
    onBulkDelete?.(Array.from(selectedTodos));
    setSelectedTodos(new Set());
    setIsSelecting(false);
  };

  const toggleBulkMode = () => {
    setIsSelecting(!isSelecting);
    setSelectedTodos(new Set());
  };

  // Loading state
  if (loading) {
    return (
      <div className=\"space-y-4\">
        {[...Array(3)].map((_, i) => (
          <div key={i} className=\"animate-pulse\">
            <div className=\"rounded-lg border p-4\">
              <div className=\"flex items-start space-x-3\">
                <div className=\"w-6 h-6 bg-gray-200 rounded-full\"></div>
                <div className=\"flex-1 space-y-2\">
                  <div className=\"h-4 bg-gray-200 rounded w-3/4\"></div>
                  <div className=\"h-3 bg-gray-200 rounded w-1/2\"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={<ListTodo className=\"h-12 w-12\" />}
        title={t('common.error')}
        description={error}
      />
    );
  }

  // Empty state
  if (todos.length === 0) {
    return (
      <EmptyState
        icon={<ListTodo className=\"h-12 w-12\" />}
        title={emptyMessage || t('todo.noTodos')}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className=\"space-y-4\">
      {/* Bulk actions toolbar */}
      {enableBulkActions && (
        <div className=\"flex items-center justify-between p-4 bg-muted/50 rounded-lg\">
          <div className=\"flex items-center space-x-4\">
            <Button
              variant=\"outline\"
              size=\"sm\"
              onClick={toggleBulkMode}
            >
              {isSelecting ? t('common.cancel') : t('todo.bulkActions')}
            </Button>
            
            {isSelecting && (
              <>
                <Checkbox
                  checked={selectedTodos.size === todos.length}
                  onChange={handleSelectAll}
                  label={selectedTodos.size === todos.length ? t('todo.deselectAll') : t('todo.selectAll')}
                />
                <span className=\"text-sm text-muted-foreground\">
                  {selectedTodos.size} selected
                </span>
              </>
            )}
          </div>

          {isSelecting && selectedTodos.size > 0 && (
            <div className=\"flex items-center space-x-2\">
              <Button
                variant=\"outline\"
                size=\"sm\"
                onClick={handleBulkComplete}
                className=\"text-green-600 hover:text-green-700\"
              >
                <CheckCircle className=\"h-4 w-4 mr-2\" />
                {t('todo.completeSelected')}
              </Button>
              <Button
                variant=\"outline\"
                size=\"sm\"
                onClick={handleBulkDelete}
                className=\"text-destructive hover:text-destructive\"
              >
                <Trash2 className=\"h-4 w-4 mr-2\" />
                {t('todo.deleteSelected')}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Todo list */}
      <div className=\"space-y-2\">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            isSelected={selectedTodos.has(todo.id)}
            isSelecting={isSelecting}
            onToggle={onToggleTodo}
            onEdit={onEditTodo}
            onDelete={onDeleteTodo}
            onSelect={handleSelectTodo}
            onClick={onTodoClick}
          />
        ))}
      </div>
    </div>
  );
};

TodoList.displayName = 'TodoList';

export { TodoList };"