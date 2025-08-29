import { db } from './dexie';
import {
  Todo,
  CreateTodoDto,
  UpdateTodoDto,
  TodoFilter,
  TodoNotFoundError,
  DatabaseError,
} from './types';

/**
 * Repository layer for Todo CRUD operations
 * Provides a clean abstraction over Dexie database operations
 */
export class TodoRepository {
  /**
   * Create a new todo
   */
  async createTodo(dto: CreateTodoDto): Promise<string> {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      
      const todo: Todo = {
        id,
        title: dto.title.trim(),
        notes: dto.notes?.trim(),
        dueDate: dto.dueDate,
        priority: dto.priority || 'normal',
        tags: dto.tags || [],
        completed: false,
        createdAt: now,
        updatedAt: now,
      };

      await db.todos.add(todo);
      return id;
    } catch (error) {
      throw new DatabaseError('Failed to create todo', error as Error);
    }
  }

  /**
   * Get a todo by ID
   */
  async getTodo(id: string): Promise<Todo> {
    try {
      const todo = await db.todos.get(id);
      if (!todo) {
        throw new TodoNotFoundError(id);
      }
      return todo;
    } catch (error) {
      if (error instanceof TodoNotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to get todo ${id}`, error as Error);
    }
  }

  /**
   * List todos with optional filtering
   */
  async listTodos(filter: TodoFilter = {}): Promise<Todo[]> {
    try {
      let collection = db.todos.orderBy('createdAt').reverse();

      // Apply filters
      if (filter.completed !== undefined) {
        collection = collection.filter(todo => todo.completed === filter.completed);
      }

      if (filter.tag) {
        collection = collection.filter(todo => todo.tags.includes(filter.tag!));
      }

      if (filter.priority) {
        collection = collection.filter(todo => todo.priority === filter.priority);
      }

      if (filter.dueBefore) {
        collection = collection.filter(todo => 
          todo.dueDate && todo.dueDate <= filter.dueBefore!
        );
      }

      if (filter.dueAfter) {
        collection = collection.filter(todo => 
          todo.dueDate && todo.dueDate >= filter.dueAfter!
        );
      }

      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        collection = collection.filter(todo => 
          todo.title.toLowerCase().includes(searchTerm) ||
          (todo.notes?.toLowerCase().includes(searchTerm)) ||
          todo.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      return await collection.toArray();
    } catch (error) {
      throw new DatabaseError('Failed to list todos', error as Error);
    }
  }

  /**
   * Get todos due today or overdue
   */
  async getTodosForToday(): Promise<Todo[]> {
    try {
      const today = new Date();
      today.setHours(23, 59, 59, 999); // End of today
      const todayIso = today.toISOString();

      return await db.todos
        .filter(todo => 
          !todo.completed && 
          todo.dueDate && 
          todo.dueDate <= todayIso
        )
        .sortBy('dueDate');
    } catch (error) {
      throw new DatabaseError('Failed to get today\'s todos', error as Error);
    }
  }

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<string[]> {
    try {
      const todos = await db.todos.toArray();
      const tagSet = new Set<string>();
      
      todos.forEach(todo => {
        todo.tags.forEach(tag => tagSet.add(tag));
      });

      return Array.from(tagSet).sort();
    } catch (error) {
      throw new DatabaseError('Failed to get tags', error as Error);
    }
  }

  /**
   * Update a todo
   */
  async updateTodo(id: string, dto: UpdateTodoDto): Promise<void> {
    try {
      const existingTodo = await this.getTodo(id);
      
      const updates: Partial<Todo> = {
        updatedAt: new Date().toISOString(),
      };

      if (dto.title !== undefined) {
        updates.title = dto.title.trim();
      }
      if (dto.notes !== undefined) {
        updates.notes = dto.notes?.trim();
      }
      if (dto.dueDate !== undefined) {
        updates.dueDate = dto.dueDate;
      }
      if (dto.priority !== undefined) {
        updates.priority = dto.priority;
      }
      if (dto.tags !== undefined) {
        updates.tags = dto.tags;
      }
      if (dto.completed !== undefined) {
        updates.completed = dto.completed;
      }

      const result = await db.todos.update(id, updates);
      if (result === 0) {
        throw new TodoNotFoundError(id);
      }
    } catch (error) {
      if (error instanceof TodoNotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to update todo ${id}`, error as Error);
    }
  }

  /**
   * Delete a todo
   */
  async deleteTodo(id: string): Promise<void> {
    try {
      const result = await db.todos.delete(id);
      if (result === 0) {
        throw new TodoNotFoundError(id);
      }
    } catch (error) {
      if (error instanceof TodoNotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to delete todo ${id}`, error as Error);
    }
  }

  /**
   * Bulk complete todos
   */
  async bulkComplete(ids: string[]): Promise<void> {
    try {
      await db.transaction('rw', db.todos, async () => {
        const updates = { 
          completed: true, 
          updatedAt: new Date().toISOString() 
        };
        
        for (const id of ids) {
          await db.todos.update(id, updates);
        }
      });
    } catch (error) {
      throw new DatabaseError('Failed to bulk complete todos', error as Error);
    }
  }

  /**
   * Bulk delete todos
   */
  async bulkDelete(ids: string[]): Promise<void> {
    try {
      await db.transaction('rw', db.todos, async () => {
        for (const id of ids) {
          await db.todos.delete(id);
        }
      });
    } catch (error) {
      throw new DatabaseError('Failed to bulk delete todos', error as Error);
    }
  }

  /**
   * Toggle todo completion status
   */
  async toggleTodo(id: string): Promise<void> {
    try {
      const todo = await this.getTodo(id);
      await this.updateTodo(id, { completed: !todo.completed });
    } catch (error) {
      if (error instanceof TodoNotFoundError) {
        throw error;
      }
      throw new DatabaseError(`Failed to toggle todo ${id}`, error as Error);
    }
  }

  /**
   * Get todo count statistics
   */
  async getStats(): Promise<{
    total: number;
    completed: number;
    pending: number;
    overdue: number;
  }> {
    try {
      const todos = await db.todos.toArray();
      const now = new Date().toISOString();
      
      const completed = todos.filter(todo => todo.completed).length;
      const pending = todos.filter(todo => !todo.completed).length;
      const overdue = todos.filter(todo => 
        !todo.completed && 
        todo.dueDate && 
        todo.dueDate < now
      ).length;

      return {
        total: todos.length,
        completed,
        pending,
        overdue,
      };
    } catch (error) {
      throw new DatabaseError('Failed to get todo statistics', error as Error);
    }
  }

  /**
   * Export all todos as JSON
   */
  async exportTodos(): Promise<string> {
    try {
      const todos = await db.todos.toArray();
      return JSON.stringify(todos, null, 2);
    } catch (error) {
      throw new DatabaseError('Failed to export todos', error as Error);
    }
  }

  /**
   * Import todos from JSON
   */
  async importTodos(jsonData: string, overwrite: boolean = false): Promise<number> {
    try {
      const todos: Todo[] = JSON.parse(jsonData);
      
      if (!Array.isArray(todos)) {
        throw new Error('Invalid JSON format: expected array of todos');
      }

      if (overwrite) {
        await db.todos.clear();
      }

      await db.transaction('rw', db.todos, async () => {
        for (const todo of todos) {
          // Validate todo structure
          if (!todo.id || !todo.title || typeof todo.completed !== 'boolean') {
            throw new Error('Invalid todo format');
          }
          
          await db.todos.put(todo);
        }
      });

      return todos.length;
    } catch (error) {
      throw new DatabaseError('Failed to import todos', error as Error);
    }
  }
}

// Export singleton instance
export const todoRepository = new TodoRepository();