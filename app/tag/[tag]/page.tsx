'use client';

import * as React from 'react';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Tag, Hash } from 'lucide-react';
import { Todo } from '@/lib/db/types';
import { AppLayout } from '@/components/layout/app-layout';
import { TodoList } from '@/components/todos/todo-list';
import { TodoForm } from '@/components/todos/todo-form';
import { Modal } from '@/components/ui/modal';
import { TagBadge } from '@/components/ui/badge';
import { useTodos } from '@/lib/hooks/use-todos';
import { useTodoShortcuts } from '@/lib/hooks/use-keyboard-shortcuts';
import { useTranslation } from '@/lib/i18n';
import { stringToColor } from '@/lib/utils';

export default function TagPage() {
  const params = useParams();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTodoForm, setShowTodoForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  
  // Get the tag from URL params and decode it
  const tag = Array.isArray(params.tag) ? params.tag[0] : params.tag;
  const decodedTag = tag ? decodeURIComponent(tag) : '';
  
  // Filter todos by tag
  const todoFilter = {
    tag: decodedTag,
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
  } = useTodos({ filter: todoFilter });

  // Separate completed and pending todos
  const pendingTodos = todos.filter(todo => !todo.completed);
  const completedTodos = todos.filter(todo => todo.completed);

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
        // Add the current tag to new todos
        const todoData = {
          ...data,
          tags: [...(data.tags || []), decodedTag].filter(Boolean),
        };
        await createTodo(todoData);
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

  if (!decodedTag) {
    return (
      <AppLayout title=\"Invalid Tag\">
        <div className=\"text-center py-8\">
          <p className=\"text-muted-foreground\">Invalid tag specified.</p>
        </div>
      </AppLayout>
    );
  }

  const tagColor = stringToColor(decodedTag);

  return (
    <AppLayout
      title={
        <div className=\"flex items-center space-x-2\">
          <Hash className=\"h-5 w-5\" />
          <span>{decodedTag}</span>
        </div>
      }
      description={`${todos.length} todos with tag \"${decodedTag}\"`}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      onNewTodo={() => setShowTodoForm(true)}
    >
      {/* Tag header */}
      <div className=\"mb-6\">
        <div className=\"flex items-center space-x-3 mb-2\">
          <TagBadge
            tag={decodedTag}
            className=\"text-lg px-4 py-2\"
          />
          <span className=\"text-sm text-muted-foreground\">
            {todos.length} {todos.length === 1 ? 'todo' : 'todos'}
          </span>
        </div>
        <p className=\"text-sm text-muted-foreground\">
          All todos tagged with \"{decodedTag}\"
        </p>
      </div>

      {/* Pending todos */}
      {pendingTodos.length > 0 && (
        <div className=\"mb-8\">
          <h2 className=\"text-lg font-semibold mb-4 flex items-center space-x-2\">
            <span>{t('todo.pending')} ({pendingTodos.length})</span>
          </h2>
          <TodoList
            todos={pendingTodos}
            loading={false}
            enableBulkActions
            onToggleTodo={toggleTodo}
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo}
            onBulkComplete={bulkComplete}
            onBulkDelete={bulkDelete}
          />
        </div>
      )}

      {/* Completed todos */}
      {completedTodos.length > 0 && (
        <div className=\"mb-8\">
          <h2 className=\"text-lg font-semibold mb-4 flex items-center space-x-2\">
            <span>{t('todo.completed')} ({completedTodos.length})</span>
          </h2>
          <TodoList
            todos={completedTodos}
            loading={false}
            enableBulkActions
            onToggleTodo={toggleTodo}
            onEditTodo={handleEditTodo}
            onDeleteTodo={handleDeleteTodo}
            onBulkComplete={bulkComplete}
            onBulkDelete={bulkDelete}
          />
        </div>
      )}

      {/* Empty state */}
      {todos.length === 0 && !loading && (
        <TodoList
          todos={[]}
          loading={loading}
          error={error}
          emptyMessage={
            searchQuery 
              ? t('messages.noSearchResults') 
              : `No todos with tag \"${decodedTag}\"`
          }
          emptyDescription={
            searchQuery 
              ? t('messages.tryDifferentSearch')
              : `Create your first todo with the \"${decodedTag}\" tag`
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