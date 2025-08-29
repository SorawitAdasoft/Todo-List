import Dexie, { Table } from 'dexie';
import { Todo } from './types';

export class TodoDatabase extends Dexie {
  todos!: Table<Todo>;

  constructor() {
    super('todo-pwa');
    
    // Define schema version 1
    this.version(1).stores({
      todos: '++id, title, completed, dueDate, priority, createdAt, updatedAt, *tags',
    });

    // Hook to auto-update timestamps
    this.todos.hook('creating', (primKey, obj, trans) => {
      const now = new Date().toISOString();
      obj.createdAt = now;
      obj.updatedAt = now;
    });

    this.todos.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date().toISOString();
    });
  }

  // Database initialization and seeding
  async isSeeded(): Promise<boolean> {
    const count = await this.todos.count();
    return count > 0;
  }

  async seedDatabase(): Promise<void> {
    const sampleTodos: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        title: 'Complete the Todo PWA project',
        notes: 'Build an offline-first PWA with Next.js and IndexedDB',
        dueDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        priority: 'high',
        tags: ['work', 'programming'],
        completed: false,
      },
      {
        title: 'Buy groceries',
        notes: 'Milk, bread, eggs, vegetables',
        dueDate: new Date().toISOString(), // Today
        priority: 'normal',
        tags: ['personal', 'shopping'],
        completed: false,
      },
      {
        title: 'Exercise for 30 minutes',
        notes: 'Go for a run or do some yoga',
        priority: 'normal',
        tags: ['health', 'daily'],
        completed: false,
      },
      {
        title: 'Read a book chapter',
        notes: 'Continue reading "Clean Code"',
        priority: 'low',
        tags: ['learning', 'books'],
        completed: true,
      },
      {
        title: 'Plan weekend trip',
        notes: 'Research destinations and book accommodation',
        dueDate: new Date(Date.now() + 172800000).toISOString(), // 2 days from now
        priority: 'low',
        tags: ['travel', 'planning'],
        completed: false,
      },
    ];

    await this.transaction('rw', this.todos, async () => {
      for (const todo of sampleTodos) {
        await this.todos.add({
          ...todo,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    });
  }

  // Clear all data (for testing)
  async clearAll(): Promise<void> {
    await this.todos.clear();
  }
}

// Export singleton instance
export const db = new TodoDatabase();

// Initialize database in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  db.ready().then(async () => {
    const isSeeded = await db.isSeeded();
    if (!isSeeded) {
      console.log('Seeding database with sample data...');
      await db.seedDatabase();
    }
  });
}