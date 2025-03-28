import { Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Todo } from '../todos.schema';
import { LoggerService } from '../../common/logger/logger.service';

export enum TodoEventType {
  CREATED = 'todo.created',
  UPDATED = 'todo.updated',
  DELETED = 'todo.deleted',
}

export interface TodoPayload {
  id: string;
  title?: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface extending the Todo type with Mongoose-specific properties
export interface MongooseTodo extends Todo {
  _id: { toString(): string };
  createdAt?: Date;
  updatedAt?: Date;
  toObject(): MongooseDocumentObject;
}

export interface MongooseDocumentObject {
  _id: { toString(): string };
  id?: string;
  title?: string;
  description?: string;
  completed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TodoEvent {
  type: TodoEventType;
  payload: TodoPayload;
}

@Injectable()
export class TodoEventsService {
  private readonly logger: LoggerService;

  constructor(
    @Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy,
    logger: LoggerService,
  ) {
    this.logger = logger;
  }

  async emitTodoCreated(todo: Todo): Promise<void> {
    await this.emitTodoEvent(TodoEventType.CREATED, todo);
  }

  async emitTodoUpdated(todo: Todo): Promise<void> {
    await this.emitTodoEvent(TodoEventType.UPDATED, todo);
  }

  async emitTodoDeleted(id: string): Promise<void> {
    await this.emitTodoEvent(TodoEventType.DELETED, { id });
  }

  private async emitTodoEvent(type: TodoEventType, data: Todo | TodoPayload): Promise<void> {
    const event: TodoEvent = {
      type,
      payload: data instanceof Todo ? this.serializeTodo(data) : data as TodoPayload,
    };

    this.logger.log(`Emitting event: ${type}`, 'TodoEventsService');
    this.logger.log(`Event payload: ${JSON.stringify(event)}`, 'TodoEventsService');

    try {
      this.client.emit(type, event).subscribe({
        next: () => this.logger.log(`Event ${type} sent successfully`, 'TodoEventsService'),
        error: (err) => {
          this.logger.error(`Error sending event ${type}: ${err.message}`, 'TodoEventsService');
          this.logger.error(`Error stack: ${err.stack}`, 'TodoEventsService');
        },
      });
    } catch (error) {
      this.logger.error(`Failed to emit event ${type}: ${error.message}`, 'TodoEventsService');
      throw error;
    }
  }

  // Type guard to check if a Todo is a MongooseTodo
  private isMongooseTodo(todo: Todo): todo is MongooseTodo {
    return (
      todo !== null &&
      typeof todo === 'object' &&
      '_id' in todo &&
      todo._id !== null &&
      typeof todo._id === 'object' &&
      todo._id !== null &&
      'toString' in todo._id &&
      typeof todo._id.toString === 'function' &&
      'toObject' in todo &&
      typeof todo.toObject === 'function'
    );
  }

  private serializeTodo(todo: Todo): TodoPayload {
    // Create a properly typed payload with default values
    const serialized: TodoPayload = {
      id: '', // Will be populated based on the type
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
    };
    
    // Handle ID and timestamps differently based on the type of todo
    if (this.isMongooseTodo(todo)) {
      // It's a Mongoose document
      serialized.id = todo._id.toString();
      
      // Get the full object with all properties
      const todoObj = todo.toObject();
      
      // Add timestamps if they exist
      if (todoObj.createdAt) serialized.createdAt = todoObj.createdAt;
      if (todoObj.updatedAt) serialized.updatedAt = todoObj.updatedAt;
    } else {
      // It's a plain object or some other implementation
      // Try to get an ID using various possible properties
      if ('id' in todo && todo.id) {
        serialized.id = typeof todo.id === 'string' ? todo.id : String(todo.id);
      }
      
      // Try to get timestamps if they exist
      if ('createdAt' in todo && todo.createdAt) {
        serialized.createdAt = todo.createdAt as Date;
      }
      if ('updatedAt' in todo && todo.updatedAt) {
        serialized.updatedAt = todo.updatedAt as Date;
      }
    }

    return serialized;
  }
} 