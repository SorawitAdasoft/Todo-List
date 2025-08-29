'use client';

import * as React from 'react';
import { useState } from 'react';
import { CalendarDays, Clock } from 'lucide-react';
import { Todo } from '@/lib/db/types';
import { AppLayout } from '@/components/layout/app-layout';
import { TodoList } from '@/components/todos/todo-list';
import { TodoForm } from '@/components/todos/todo-form';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { useTodayTodos, useTodos } from '@/lib/hooks/use-todos';
import { useTodoShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';
import { useTranslation } from '@/lib/i18n';
import { formatDueDate, isDateToday } from '@/lib/date';

export default function TodayPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  // Get today's todos
  const { todos: todayTodos, loading, error, refresh } = useTodayTodos();
  
  // Get todo management functions
  const {
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    bulkComplete,
    bulkDelete,
  } = useTodos();

  // Filter todos based on search
  const filteredTodos = todayTodos.filter(todo => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      todo.title.toLowerCase().includes(query) ||
      (todo.notes && todo.notes.toLowerCase().includes(query)) ||
      todo.tags.some(tag => tag.toLowerCase().includes(query))
    );
  });

  // Separate overdue and today's todos
  const overdueTodos = filteredTodos.filter(todo => {
    if (!todo.dueDate) return false;
    const dueDateInfo = formatDueDate(todo.dueDate);
    return dueDateInfo.isOverdue;
  });

  const todaysTodos = filteredTodos.filter(todo => {
    if (!todo.dueDate) return false;
    return isDateToday(todo.dueDate);
  });

  // Keyboard shortcuts
  useTodoShortcuts({
    onNewTodo: () => setShowTodoForm(true),
    onEscape: () => {
      setShowTodoForm(false);
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
      } else {
        // Set due date to today for new todos
        const todoData = {
          ...data,
          dueDate: data.dueDate || new Date().toISOString(),
        };
        await createTodo(todoData);
        setShowTodoForm(false);
      }
      await refresh(); // Refresh today's todos
    } catch (error) {
      console.error('Failed to save todo:', error);
    }
  };

  const handleFormCancel = () => {
    setShowTodoForm(false);
    setEditingTodo(null);
  };

  const handleDeleteTodo = async (id: string) => {
    if (window.confirm(t('messages.confirmDelete') || 'Are you sure you want to delete this todo?')) {
      await deleteTodo(id);
      await refresh();
    }
  };

  const handleToggleTodo = async (id: string) => {
    await toggleTodo(id);
    await refresh();
  };

  const handleBulkComplete = async (ids: string[]) => {
    await bulkComplete(ids);
    await refresh();
  };

  const handleBulkDelete = async (ids: string[]) => {
    await bulkDelete(ids);
    await refresh();
  };

  return (
    <AppLayout
      title={t('nav.today')}
      description={`${filteredTodos.length} ${t('todo.pending')}`}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNewTodo={() => setShowTodoForm(true)}
    >
      {/* Statistics */}
      <div className=\"flex flex-wrap gap-2 mb-6\">
        {overdueTodos.length > 0 && (
          <Badge variant=\"destructive\" className=\"flex items-center space-x-1\">
            <Clock className=\"h-3 w-3\" />
            <span>{overdueTodos.length} {t('todo.overdue')}</span>
          </Badge>
        )}
        {todaysTodos.length > 0 && (
          <Badge variant=\"default\" className=\"flex items-center space-x-1\">
            <CalendarDays className=\"h-3 w-3\" />
            <span>{todaysTodos.length} {t('todo.today')}</span>
          </Badge>
        )}
      </div>

      {/* Overdue todos */}
      {overdueTodos.length > 0 && (
        <div className=\"mb-8\">
          <h2 className=\"text-lg font-semibold text-destructive mb-4 flex items-center space-x-2\">
            <Clock className=\"h-5 w-5\" />
            <span>{t('todo.overdue')} ({overdueTodos.length})</span>
          </h2>
          <TodoList
            todos={overdueTodos}
            loading={false}
            enableBulkActions
            onToggleTodo={handleToggleTodo}
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo}
            onBulkComplete={handleBulkComplete}
            onBulkDelete={handleBulkDelete}
          />
        </div>
      )}

      {/* Today's todos */}
      {todaysTodos.length > 0 && (
        <div className=\"mb-8\">
          <h2 className=\"text-lg font-semibold mb-4 flex items-center space-x-2\">
            <CalendarDays className=\"h-5 w-5\" />
            <span>{t('todo.today')} ({todaysTodos.length})</span>
          </h2>
          <TodoList
            todos={todaysTodos}
            loading={false}
            enableBulkActions
            onToggleTodo={handleToggleTodo}
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo}
            onBulkComplete={handleBulkComplete}
            onBulkDelete={handleBulkDelete}
          />
        </div>
      )}

      {/* Empty state */}
      {filteredTodos.length === 0 && !loading && (
        <TodoList
          todos={[]}
          loading={loading}
          error={error}
          emptyMessage={
            searchQuery 
              ? t('messages.noSearchResults') 
              : t('messages.noTodosToday')
          }
          emptyDescription={
            searchQuery 
              ? t('messages.tryDifferentSearch')
              : t('messages.createTodoForToday')
          }
        />
      )}

      {/* Loading state */}
      {loading && (
        <TodoList
          todos={[]}
          loading={true}
        />
      )}

      {/* Todo form modal */}
      <Modal
        isOpen={showTodoForm || editingTodo !== null}
        onClose={handleFormCancel}
        title={editingTodo ? t('todo.editTodo') : t('todo.addTodo')}
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