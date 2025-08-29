// Todo types and interfaces
export type Priority = 'low' | 'normal' | 'high';

export interface Todo {
  id: string; // uuid v4
  title: string;
  notes?: string;
  dueDate?: string; // ISO date string
  priority: Priority;
  tags: string[];
  completed: boolean;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreateTodoDto {
  title: string;
  notes?: string;
  dueDate?: string;
  priority?: Priority;
  tags?: string[];
}

export interface UpdateTodoDto {
  title?: string;
  notes?: string;
  dueDate?: string;
  priority?: Priority;
  tags?: string[];
  completed?: boolean;
}

export interface TodoFilter {
  completed?: boolean;
  tag?: string;
  dueBefore?: string;
  dueAfter?: string;
  priority?: Priority;
  search?: string;
}

// Database error types
export class TodoNotFoundError extends Error {
  constructor(id: string) {
    super(`Todo with id ${id} not found`);
    this.name = 'TodoNotFoundError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
    this.cause = cause;
  }
}