import { Injectable, OnModuleInit } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { TodoEventType, TodoEvent } from './todo-events.service';
import { TodoCacheService } from '../cache/todo-cache.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Todo } from '../todos.schema';
import { LoggerService } from '../../common/logger/logger.service';

@Injectable()
export class TodoEventsHandlerService implements OnModuleInit {
  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
    private readonly todoCache: TodoCacheService,
    @InjectModel(Todo.name) private todoModel: Model<Todo>,
    private readonly logger: LoggerService,
  ) {}

  async onModuleInit() {
    try {
      // Try to connect to the message broker
      await this.client.connect();
      this.logger.log('Successfully connected to RabbitMQ', 'TodoEventsHandlerService');
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error.message}`, 'TodoEventsHandlerService');
    }
  }

  /**
   * Process a todo created event
   * This method will be called by the consumer
   */
  async processTodoCreated(event: TodoEvent) {
    try {
      const todoId = event.payload.id;
      this.logger.log(`Processing todo created event for id: ${todoId}`, 'TodoEventsHandlerService');
      
      // Retrieve the latest todo data from the database
      const todo = await this.todoModel.findById(todoId).exec();
      if (!todo) {
        this.logger.warn(`Todo not found for id: ${todoId}`, 'TodoEventsHandlerService');
        return;
      }
      
      // Update the cache with the new todo
      await this.todoCache.cacheTodo(todo);
      
      // Invalidate the list cache as it's now outdated
      await this.todoCache.invalidateListCache();
      
      this.logger.log(`Successfully processed todo created event for id: ${todoId}`, 'TodoEventsHandlerService');
    } catch (error) {
      this.logger.error(`Error processing todo created event: ${error.message}`, 'TodoEventsHandlerService');
    }
  }

  /**
   * Process a todo updated event
   * This method will be called by the consumer
   */
  async processTodoUpdated(event: TodoEvent) {
    try {
      const todoId = event.payload.id;
      this.logger.log(`Processing todo updated event for id: ${todoId}`, 'TodoEventsHandlerService');
      
      // Retrieve the latest todo data from the database
      const todo = await this.todoModel.findById(todoId).exec();
      if (!todo) {
        this.logger.warn(`Todo not found for id: ${todoId}`, 'TodoEventsHandlerService');
        
        // If todo doesn't exist anymore, invalidate its cache entry
        await this.todoCache.invalidateTodo(todoId);
        return;
      }
      
      // Update the cache with the updated todo
      await this.todoCache.cacheTodo(todo);
      
      // Invalidate the list cache as it's now outdated
      await this.todoCache.invalidateListCache();
      
      this.logger.log(`Successfully processed todo updated event for id: ${todoId}`, 'TodoEventsHandlerService');
    } catch (error) {
      this.logger.error(`Error processing todo updated event: ${error.message}`, 'TodoEventsHandlerService');
    }
  }

  /**
   * Process a todo deleted event
   * This method will be called by the consumer
   */
  async processTodoDeleted(event: TodoEvent) {
    try {
      const todoId = event.payload.id;
      this.logger.log(`Processing todo deleted event for id: ${todoId}`, 'TodoEventsHandlerService');
      
      // Invalidate the cache for this todo
      await this.todoCache.invalidateTodo(todoId);
      
      // Invalidate the list cache as it's now outdated
      await this.todoCache.invalidateListCache();
      
      this.logger.log(`Successfully processed todo deleted event for id: ${todoId}`, 'TodoEventsHandlerService');
    } catch (error) {
      this.logger.error(`Error processing todo deleted event: ${error.message}`, 'TodoEventsHandlerService');
    }
  }
} 