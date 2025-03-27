import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export interface ImageProcessingPayload {
  todoId?: string;
}

@Injectable()
export class RabbitmqService {
  private readonly logger = new Logger(RabbitmqService.name);
  private readonly queueName = 'image_processing_queue';
  private readonly routingKey = 'image_processing';

  constructor(@Inject('RABBITMQ_CLIENT') private readonly client: ClientProxy) {
    this.logger.log('RabbitmqService initialized');
    this.logger.log(
      `Using queue: ${this.queueName} and routing key: ${this.routingKey}`,
    );
  }

  async sendImageProcessingMessage(
    payload: ImageProcessingPayload,
  ): Promise<void> {
    try {
      this.logger.log('Sending image processing message...');
      this.logger.log(
        `Payload: ${JSON.stringify({
          todoId: payload.todoId,
        })}`,
      );

      // Convert the FileUpload to a serializable format
      this.logger.log('Converting FileUpload to serializable format...');

      // Create a serializable payload
      const message = {
        todoId: payload.todoId,
      };

      // Send to the queue
      this.logger.log('Emitting message to RabbitMQ...');
      this.logger.log(`Message structure: ${Object.keys(message).join(', ')}`);
      this.logger.log(
        `Using pattern: "${this.routingKey}" for RabbitMQ message`,
      );

      this.client.emit(this.routingKey, message).subscribe({
        next: () => this.logger.log('Message sent to queue successfully'),
        error: (err) => {
          this.logger.error(`Error sending message to queue: ${err.message}`);
          this.logger.error(`Error stack: ${err.stack}`);
        },
      });

      this.logger.log('Image processing message sent to queue');
    } catch (error) {
      this.logger.error(`Error sending message to RabbitMQ: ${error.message}`);
      this.logger.error(`Stack trace: ${error.stack}`);
      throw error;
    }
  }
}
