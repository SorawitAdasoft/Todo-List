'use client';

import * as React from 'react';
import { useState } from 'react';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { Todo } from '@/lib/db/types';
import { AppLayout } from '@/components/layout/app-layout';
import { TodoList } from '@/components/todos/todo-list';
import { TodoForm } from '@/components/todos/todo-form';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useTodos } from '@/lib/hooks/use-todos';
import { useTodoShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';
import { useTranslation } from '@/lib/i18n';
import { formatRelativeDate } from '@/lib/date';

export default function CompletedPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  // Filter todos to show only completed ones
  const todoFilter = {
    completed: true,
    search: searchQuery.trim() || undefined,
  };
  
  const {
    todos,
    loading,
    error,
    updateTodo,
    deleteTodo,
    toggleTodo,
    bulkDelete,
    stats,
  } = useTodos({ filter: todoFilter });

  // Keyboard shortcuts
  useTodoShortcuts({
    onEscape: () => {
      setEditingTodo(null);
    },
  });

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, data);
        setEditingTodo(null);
      }
    } catch (error) {
      console.error('Failed to save todo:', error);
    }
  };

  const handleFormCancel = () => {
    setEditingTodo(null);
  };

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm(t('messages.confirmDelete') || 'Are you sure you want to delete this todo?')) {
      await deleteTodo(id);
    }
  };

  const handleRestoreTodo = async (id: string) => {
    await toggleTodo(id); // This will mark it as incomplete
  };

  // Bulk restore (mark as incomplete)
  const handleBulkRestore = async (ids: string[]) => {
    try {
      for (const id of ids) {
        await updateTodo(id, { completed: false });
      }
    } catch (error) {
      console.error('Failed to restore todos:', error);
    }
  };

  // Group todos by completion date (for better organization)
  const groupedTodos = React.useMemo(() => {
    const groups: { [key: string]: Todo[] } = {};
    
    todos.forEach(todo => {
      const completedDate = new Date(todo.updatedAt).toDateString();
      if (!groups[completedDate]) {
        groups[completedDate] = [];
      }
      groups[completedDate].push(todo);
    });
    
    return Object.entries(groups).sort(([a], [b]) => 
      new Date(b).getTime() - new Date(a).getTime()
    );
  }, [todos]);

  const actions = (
    <div className=\"flex items-center space-x-2\">
      <span className=\"text-sm text-muted-foreground\">
        {stats.completed} {t('todo.completed')}
      </span>
    </div>
  );

  return (
    <AppLayout
      title={t('nav.completed')}
      description={`${stats.completed} ${t('todo.completed')}`}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      actions={actions}
    >
      {groupedTodos.length > 0 ? (
        <div className=\"space-y-8\">
          {groupedTodos.map(([date, dateTodos]) => (
            <div key={date} className=\"space-y-4\">
              <div className=\"flex items-center space-x-2\">
                <CheckCircle className=\"h-5 w-5 text-green-500\" />
                <h2 className=\"text-lg font-semibold\">
                  {formatRelativeDate(date)}
                </h2>
                <span className=\"text-sm text-muted-foreground\">
                  ({dateTodos.length})
                </span>
              </div>
              
              <div className=\"pl-7\">
                <TodoList
                  todos={dateTodos}
                  loading={false}
                  enableBulkActions
                  onToggleTodo={handleRestoreTodo}
                  onEditTodo={handleEditTodo}
                  onDeleteTodo={handleDeleteTodo}
                  onBulkComplete={handleBulkRestore} // Use as restore function
                  onBulkDelete={bulkDelete}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <TodoList
          todos={[]}
          loading={loading}
          error={error}
          emptyMessage={
            searchQuery 
              ? t('messages.noSearchResults') 
              : t('messages.noCompletedTodos')
          }
          emptyDescription={
            searchQuery 
              ? t('messages.tryDifferentSearch')
              : t('messages.completeFirstTodo')
          }
        />
      )}

      {/* Todo form modal */}
      <Modal
        isOpen={editingTodo !== null}
        onClose={handleFormCancel}
        title={t('todo.editTodo')}
        size=\"lg\"
      >
        <TodoForm
          todo={editingTodo || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      </Modal>
    </AppLayout>
  );
}"