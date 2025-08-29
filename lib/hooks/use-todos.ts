import { useState, useEffect, useCallback } from 'react';
import { 
  Todo, 
  CreateTodoDto, 
  UpdateTodoDto, 
  TodoFilter,
  TodoNotFoundError,
  DatabaseError 
} from '@/lib/db/types';
import { todoRepository } from '@/lib/db/repo';
import { useToastActions } from '@/components/ui/toast';
import { useTranslation } from '@/lib/i18n';

interface UseTodosOptions {
  filter?: TodoFilter;
  autoRefresh?: boolean;
}

interface UseTodosResult {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  
  // CRUD operations
  createTodo: (data: CreateTodoDto) => Promise<string | null>;
  updateTodo: (id: string, data: UpdateTodoDto) => Promise<boolean>;
  deleteTodo: (id: string) => Promise<boolean>;
  toggleTodo: (id: string) => Promise<boolean>;
  
  // Bulk operations
  bulkComplete: (ids: string[]) => Promise<boolean>;
  bulkDelete: (ids: string[]) => Promise<boolean>;
  
  // Utility operations
  refreshTodos: () => Promise<void>;
  getTodoById: (id: string) => Todo | undefined;
  
  // Statistics
  stats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  };
}

export function useTodos(options: UseTodosOptions = {}): UseTodosResult {
  const { filter, autoRefresh = true } = options;
  const { t } = useTranslation();
  const toast = useToastActions();
  
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  });

  // Load todos
  const loadTodos = useCallback(async () => {
    try {
      setError(null);
      const todosData = await todoRepository.listTodos(filter);
      setTodos(todosData);
      
      // Update stats
      const statsData = await todoRepository.getStats();
      setStats(statsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load todos';
      setError(errorMessage);
      console.error('Failed to load todos:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  // Initial load and auto-refresh
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // Create todo
  const createTodo = useCallback(async (data: CreateTodoDto): Promise<string | null> => {
    try {
      const id = await todoRepository.createTodo(data);
      await loadTodos(); // Refresh list
      toast.success(t('messages.todoAdded'));
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create todo';
      toast.error(t('messages.databaseError'), errorMessage);
      console.error('Failed to create todo:', err);
      return null;
    }
  }, [loadTodos, toast, t]);

  // Update todo
  const updateTodo = useCallback(async (id: string, data: UpdateTodoDto): Promise<boolean> => {
    try {
      await todoRepository.updateTodo(id, data);
      await loadTodos(); // Refresh list
      toast.success(t('messages.todoUpdated'));
      return true;
    } catch (err) {
      if (err instanceof TodoNotFoundError) {
        toast.error('Todo not found');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to update todo';
        toast.error(t('messages.databaseError'), errorMessage);
      }
      console.error('Failed to update todo:', err);
      return false;
    }
  }, [loadTodos, toast, t]);

  // Delete todo
  const deleteTodo = useCallback(async (id: string): Promise<boolean> => {
    try {
      await todoRepository.deleteTodo(id);
      await loadTodos(); // Refresh list
      toast.success(t('messages.todoDeleted'));
      return true;
    } catch (err) {
      if (err instanceof TodoNotFoundError) {
        toast.error('Todo not found');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to delete todo';
        toast.error(t('messages.databaseError'), errorMessage);
      }
      console.error('Failed to delete todo:', err);
      return false;
    }
  }, [loadTodos, toast, t]);

  // Toggle todo completion
  const toggleTodo = useCallback(async (id: string): Promise<boolean> => {
    try {
      await todoRepository.toggleTodo(id);
      await loadTodos(); // Refresh list
      return true;
    } catch (err) {
      if (err instanceof TodoNotFoundError) {
        toast.error('Todo not found');
      } else {
        const errorMessage = err instanceof Error ? err.message : 'Failed to toggle todo';
        toast.error(t('messages.databaseError'), errorMessage);
      }
      console.error('Failed to toggle todo:', err);
      return false;
    }
  }, [loadTodos, toast, t]);

  // Bulk complete todos
  const bulkComplete = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      await todoRepository.bulkComplete(ids);
      await loadTodos(); // Refresh list
      toast.success(t('messages.todosCompleted'));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete todos';
      toast.error(t('messages.databaseError'), errorMessage);
      console.error('Failed to bulk complete todos:', err);
      return false;
    }
  }, [loadTodos, toast, t]);

  // Bulk delete todos
  const bulkDelete = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      await todoRepository.bulkDelete(ids);
      await loadTodos(); // Refresh list
      toast.success(t('messages.todosDeleted'));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete todos';
      toast.error(t('messages.databaseError'), errorMessage);
      console.error('Failed to bulk delete todos:', err);
      return false;
    }
  }, [loadTodos, toast, t]);

  // Refresh todos
  const refreshTodos = useCallback(async () => {
    setLoading(true);
    await loadTodos();
  }, [loadTodos]);

  // Get todo by ID
  const getTodoById = useCallback((id: string): Todo | undefined => {
    return todos.find(todo => todo.id === id);
  }, [todos]);

  return {
    todos,
    loading,
    error,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
    bulkComplete,
    bulkDelete,
    refreshTodos,
    getTodoById,
    stats,
  };
}

// Hook for today's todos
export function useTodayTodos() {
  const [todayTodos, setTodayTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTodayTodos = useCallback(async () => {
    try {
      setError(null);
      const todos = await todoRepository.getTodosForToday();
      setTodayTodos(todos);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load today\\'s todos';
      setError(errorMessage);
      console.error('Failed to load today\\'s todos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodayTodos();
  }, [loadTodayTodos]);

  return {
    todos: todayTodos,
    loading,
    error,
    refresh: loadTodayTodos,
  };
}

// Hook for tags
export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTags = useCallback(async () => {
    try {
      setError(null);
      const tagsData = await todoRepository.getAllTags();
      setTags(tagsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tags';
      setError(errorMessage);
      console.error('Failed to load tags:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  return {
    tags,
    loading,
    error,
    refresh: loadTags,
  };
}"