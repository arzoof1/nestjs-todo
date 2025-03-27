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

export interface TodoEvent {
  type: TodoEventType;
  payload: {
    id: string;
    [key: string]: any;
  };
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

  private async emitTodoEvent(type: TodoEventType, data: any): Promise<void> {
    const event: TodoEvent = {
      type,
      payload: data instanceof Todo ? this.serializeTodo(data) : data,
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

  private serializeTodo(todo: Todo): any {
    // Convert Mongoose document to plain object
    const serialized: any = {
      id: todo.id,
      title: todo.title,
      description: todo.description,
      completed: todo.completed,
    };
    
    // Add timestamps if they exist (from Mongoose)
    const todoObj = todo.toObject ? todo.toObject() : todo;
    if (todoObj.createdAt) serialized.createdAt = todoObj.createdAt;
    if (todoObj.updatedAt) serialized.updatedAt = todoObj.updatedAt;

    return serialized;
  }
} 