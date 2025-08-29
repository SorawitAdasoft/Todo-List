'use client';

import * as React from 'react';
import { useState } from 'react';
import { Todo } from '@/lib/db/types';
import { AppLayout } from '@/components/layout/app-layout';
import { TodoList } from '@/components/todos/todo-list';
import { TodoForm } from '@/components/todos/todo-form';
import { QuickAddTodo } from '@/components/todos/quick-add-todo';
import { Modal } from '@/components/ui/modal';
import { useTodos } from '@/lib/hooks/use-todos';
import { useTodoShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';
import { useTranslation } from '@/lib/i18n';

export default function InboxPage() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  // Filter todos based on search and completion status
  const todoFilter = {
    completed: false,
    search: searchQuery.trim() || undefined,
  };
  
  const {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    bulkComplete,
    bulkDelete,
    stats,
  } = useTodos({ filter: todoFilter });

  // Keyboard shortcuts
  useTodoShortcuts({
    onNewTodo: () => setShowTodoForm(true),
    onSearch: () => {
      // Search input will be focused by AppLayout
    },
    onEscape: () => {
      setShowTodoForm(false);
      setEditingTodo(null);
    },
  });

  const handleQuickAdd = async (data: { title: string }) => {
    const id = await createTodo(data);
    return id !== null;
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo);
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (editingTodo) {
        await updateTodo(editingTodo.id, data);
        setEditingTodo(null);
      } else {
        await createTodo(data);
        setShowTodoForm(false);
      }
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
    }
  };

  return (
    <AppLayout
      title={t('nav.inbox')}
      description={`${stats.pending} ${t('todo.pending')}`}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNewTodo={() => setShowTodoForm(true)}
    >
      {/* Quick add todo */}
      <div className=\"mb-6\">
        <QuickAddTodo
          onAdd={handleQuickAdd}
          placeholder={t('todo.addTodo')}
        />
      </div>

      {/* Todo list */}
      <TodoList
        todos={todos}
        loading={loading}
        error={error}
        emptyMessage={searchQuery ? t('messages.noSearchResults') : t('todo.noTodos')}
        emptyDescription={
          searchQuery 
            ? t('messages.tryDifferentSearch')
            : t('messages.createFirstTodo')
        }
        enableBulkActions
        onToggleTodo={toggleTodo}
        onEditTodo={handleEditTodo}
        onDeleteTodo={handleDeleteTodo}
        onBulkComplete={bulkComplete}
        onBulkDelete={bulkDelete}
      />

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