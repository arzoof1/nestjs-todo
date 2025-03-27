import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './todos.schema';
import { TodosService } from './todos.service';
import { TodosResolver } from './todos.resolver';
import { LoggerModule } from '../common/logger/logger.module';
import { TodoCacheService } from './cache/todo-cache.service';
import { TodoEventsService } from './events/todo-events.service';
import { TodoEventsHandlerService } from './events/todo-events-handler.service';
import { CacheModule } from '@nestjs/cache-manager';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Todo.name, schema: TodoSchema }]),
    LoggerModule,
    CacheModule.register({
      ttl: 300, // 5 minutes default TTL
      isGlobal: true,
    }),
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [
              `amqp://${configService.get('RABBITMQ_USER', 'guest')}:${configService.get(
                'RABBITMQ_PASSWORD',
                'guest',
              )}@${configService.get('RABBITMQ_HOST', 'localhost')}:${configService.get(
                'RABBITMQ_PORT',
                5672,
              )}`,
            ],
            queue: configService.get('RABBITMQ_QUEUE', 'todo_queue'),
            queueOptions: {
              durable: true,
            },
          },
        }),
      },
    ]),
  ],
  providers: [
    TodosService, 
    TodosResolver, 
    TodoCacheService, 
    TodoEventsService, 
    TodoEventsHandlerService
  ],
  exports: [TodosService],
})
export class TodosModule {}
