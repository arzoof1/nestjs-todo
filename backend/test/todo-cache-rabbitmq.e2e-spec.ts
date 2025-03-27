import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { TodosService } from '../src/todos/todos.service';
import { TodoCacheService } from '../src/todos/cache/todo-cache.service';
import { CreateTodoInput } from '../src/todos/dto/todo.dto';
import { Todo } from '../src/todos/todos.schema';

describe('Todo Cache and RabbitMQ E2E Test', () => {
  let app: INestApplication;
  let cacheManager: Cache;
  let todosService: TodosService;
  let todoCacheService: TodoCacheService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    cacheManager = app.get(CACHE_MANAGER);
    todosService = app.get<TodosService>(TodosService);
    todoCacheService = app.get<TodoCacheService>(TodoCacheService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clear cache before each test
    await cacheManager.reset();
  });

  it('should cache a todo when created', async () => {
    // Create a spy on the cache service's cacheTodo method
    const cacheTodoSpy = jest.spyOn(todoCacheService, 'cacheTodo');

    // Create a new todo
    const createTodoInput: CreateTodoInput = {
      title: 'Test Todo',
      description: 'Testing cache functionality',
      completed: false,
    };

    // Send GraphQL mutation to create a todo
    const createMutation = `
      mutation {
        createTodo(createTodoInput: {
          title: "Test Todo",
          description: "Testing cache functionality",
          completed: false
        }) {
          id
          title
          description
          completed
        }
      }
    `;

    const response = await request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: createMutation,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.createTodo).toBeDefined();
    
    const todoId = response.body.data.createTodo.id;
    
    // Verify the cacheTodo method was called
    expect(cacheTodoSpy).toHaveBeenCalled();

    // Verify todo is in cache
    const cachedTodo = await todoCacheService.getCachedTodo(todoId);
    expect(cachedTodo).toBeDefined();
    expect(cachedTodo.title).toBe('Test Todo');
  });

  it('should retrieve a todo from cache', async () => {
    // Create a todo first
    const todo = await todosService.create({
      title: 'Cache Test Todo',
      description: 'This todo should be cached',
      completed: false,
    });

    // Spy on the find method to ensure it's not called when we have a cache hit
    const findByIdSpy = jest.spyOn(todosService['todoModel'], 'findById');

    // Clear the spy call count
    findByIdSpy.mockClear();

    // Get the todo by ID (first call should hit the database and cache the result)
    await todosService.findById(todo.id);

    // Verify findById was called once
    expect(findByIdSpy).toHaveBeenCalledTimes(1);

    // Clear the spy call count again
    findByIdSpy.mockClear();

    // Get the todo by ID again (this should be a cache hit)
    const cachedTodo = await todosService.findById(todo.id);

    // Verify the todo was retrieved
    expect(cachedTodo).toBeDefined();
    expect(cachedTodo.title).toBe('Cache Test Todo');

    // Verify findById was not called (since we got it from cache)
    expect(findByIdSpy).not.toHaveBeenCalled();
  });

  it('should invalidate cache when a todo is updated', async () => {
    // Create a todo
    const todo = await todosService.create({
      title: 'Original Title',
      description: 'Original description',
      completed: false,
    });

    // Verify it's in the cache
    const originalCachedTodo = await todoCacheService.getCachedTodo(todo.id);
    expect(originalCachedTodo).toBeDefined();
    expect(originalCachedTodo.title).toBe('Original Title');

    // Update the todo
    await todosService.update(todo.id, {
      id: todo.id,
      title: 'Updated Title',
    });

    // Get the updated todo from cache
    const updatedCachedTodo = await todoCacheService.getCachedTodo(todo.id);
    
    // Verify cache was updated
    expect(updatedCachedTodo).toBeDefined();
    expect(updatedCachedTodo.title).toBe('Updated Title');
  });

  it('should invalidate cache when a todo is deleted', async () => {
    // Create a todo
    const todo = await todosService.create({
      title: 'Todo to Delete',
      description: 'This todo will be deleted',
      completed: false,
    });

    // Verify it's in the cache
    const cachedTodo = await todoCacheService.getCachedTodo(todo.id);
    expect(cachedTodo).toBeDefined();

    // Delete the todo
    await todosService.delete(todo.id);

    // Try to get from cache
    const deletedCachedTodo = await todoCacheService.getCachedTodo(todo.id);
    
    // Verify it's no longer in cache
    expect(deletedCachedTodo).toBeNull();
  });
}); 