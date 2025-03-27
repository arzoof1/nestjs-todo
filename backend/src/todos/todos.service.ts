import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from './todos.schema';
import { CreateTodoInput, UpdateTodoInput } from './dto/todo.dto';
import { LoggerService } from '../common/logger/logger.service';
import { TodoCacheService } from './cache/todo-cache.service';
import { TodoEventsService } from './events/todo-events.service';

@Injectable()
export class TodosService {
  constructor(
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
    private readonly logger: LoggerService,
    private readonly todoCache: TodoCacheService,
    private readonly todoEvents: TodoEventsService,
  ) {}

  async findAll(): Promise<Todo[]> {
    this.logger.log('Retrieving all todos', 'TodosService');
    
    // Try to get from cache first
    const cachedTodos = await this.todoCache.getCachedTodos();
    if (cachedTodos) {
      this.logger.log('Returning todos from cache', 'TodosService');
      return cachedTodos;
    }

    // If not in cache, get from database
    this.logger.log('Cache miss - retrieving todos from database', 'TodosService');
    const todos = await this.todoModel.find().exec();
    
    // Store in cache for future requests
    await this.todoCache.cacheTodos(todos);
    
    return todos;
  }

  async findById(id: string): Promise<Todo | null> {
    this.logger.log(`Retrieving todo with id: ${id}`, 'TodosService');
    
    // Try to get from cache first
    const cachedTodo = await this.todoCache.getCachedTodo(id);
    if (cachedTodo) {
      this.logger.log(`Returning todo ${id} from cache`, 'TodosService');
      return cachedTodo;
    }
    
    // If not in cache, get from database
    this.logger.log(`Cache miss - retrieving todo ${id} from database`, 'TodosService');
    const todo = await this.todoModel.findById(id).exec();
    
    // Store in cache for future requests (if found)
    if (todo) {
      await this.todoCache.cacheTodo(todo);
    }
    
    return todo;
  }

  async create(createTodoInput: CreateTodoInput): Promise<Todo> {
    this.logger.log(
      `Creating new todo: ${JSON.stringify(createTodoInput)}`,
      'TodosService',
    );
    const newTodo = new this.todoModel(createTodoInput);
    const savedTodo = await newTodo.save();
    this.logger.log(`Todo created with id: ${savedTodo.id}`, 'TodosService');
    
    // Store in cache
    await this.todoCache.cacheTodo(savedTodo);
    
    // Also invalidate the list cache as it's now outdated
    await this.todoCache.invalidateListCache();
    
    // Emit event to RabbitMQ
    await this.todoEvents.emitTodoCreated(savedTodo);
    
    return savedTodo;
  }

  async update(
    id: string,
    updateTodoInput: UpdateTodoInput,
  ): Promise<Todo | null> {
    this.logger.log(
      `Updating todo with id: ${id}, data: ${JSON.stringify(updateTodoInput)}`,
      'TodosService',
    );

    // Remove the id from the update data
    const { id: _id, ...updateData } = updateTodoInput;

    const updatedTodo = await this.todoModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (updatedTodo) {
      this.logger.log(
        `Todo updated successfully: ${updatedTodo.id}`,
        'TodosService',
      );
      
      // Update cache
      await this.todoCache.cacheTodo(updatedTodo);
      
      // Also invalidate the list cache as it's now outdated
      await this.todoCache.invalidateListCache();
      
      // Emit event to RabbitMQ
      await this.todoEvents.emitTodoUpdated(updatedTodo);
    } else {
      this.logger.warn(
        `Todo with id: ${id} not found for update`,
        'TodosService',
      );
    }

    return updatedTodo;
  }

  async delete(id: string): Promise<boolean> {
    this.logger.log(`Deleting todo with id: ${id}`, 'TodosService');

    const result = await this.todoModel.findByIdAndDelete(id).exec();

    if (result) {
      this.logger.log(
        `Todo with id: ${id} deleted successfully`,
        'TodosService',
      );
      
      // Remove from cache
      await this.todoCache.invalidateTodo(id);
      
      // Also invalidate the list cache as it's now outdated
      await this.todoCache.invalidateListCache();
      
      // Emit event to RabbitMQ
      await this.todoEvents.emitTodoDeleted(id);
      
      return true;
    } else {
      this.logger.warn(
        `Todo with id: ${id} not found for deletion`,
        'TodosService',
      );
      return false;
    }
  }
}
