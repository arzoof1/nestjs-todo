import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Todo } from '../todos.schema';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class TodoCacheService {
  private readonly TODOS_KEY = 'todos:all';
  private readonly TODO_KEY_PREFIX = 'todo:';
  private readonly DEFAULT_TTL = 300; // 5 minutes in seconds

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Cache a single todo item
   */
  async cacheTodo(todo: Todo): Promise<void> {
    const key = this.getTodoKey(todo.id);
    await this.cacheManager.set(key, todo, this.DEFAULT_TTL);
    this.logger.log(`Cached todo with key: ${key}`, 'TodoCacheService');
    
    // Also invalidate the list cache since it's now outdated
    await this.invalidateListCache();
  }

  /**
   * Cache a list of todo items
   */
  async cacheTodos(todos: Todo[]): Promise<void> {
    await this.cacheManager.set(this.TODOS_KEY, todos, this.DEFAULT_TTL);
    this.logger.log(`Cached todos list with key: ${this.TODOS_KEY}`, 'TodoCacheService');
  }

  /**
   * Get a cached todo by id
   */
  async getCachedTodo(id: string): Promise<Todo | null> {
    const key = this.getTodoKey(id);
    const cachedTodo = await this.cacheManager.get<Todo>(key);
    
    if (cachedTodo) {
      this.logger.log(`Cache hit for todo: ${key}`, 'TodoCacheService');
      return cachedTodo;
    }
    
    this.logger.log(`Cache miss for todo: ${key}`, 'TodoCacheService');
    return null;
  }

  /**
   * Get cached list of todos
   */
  async getCachedTodos(): Promise<Todo[] | null> {
    const cachedTodos = await this.cacheManager.get<Todo[]>(this.TODOS_KEY);
    
    if (cachedTodos) {
      this.logger.log(`Cache hit for todos list`, 'TodoCacheService');
      return cachedTodos;
    }
    
    this.logger.log(`Cache miss for todos list`, 'TodoCacheService');
    return null;
  }

  /**
   * Invalidate a cached todo by id
   */
  async invalidateTodo(id: string): Promise<void> {
    const key = this.getTodoKey(id);
    await this.cacheManager.del(key);
    this.logger.log(`Invalidated cached todo: ${key}`, 'TodoCacheService');
    
    // Also invalidate the list cache
    await this.invalidateListCache();
  }

  /**
   * Invalidate the list cache
   */
  async invalidateListCache(): Promise<void> {
    await this.cacheManager.del(this.TODOS_KEY);
    this.logger.log(`Invalidated todos list cache`, 'TodoCacheService');
  }

  /**
   * Generate a cache key for a specific todo
   */
  private getTodoKey(id: string): string {
    return `${this.TODO_KEY_PREFIX}${id}`;
  }
} 