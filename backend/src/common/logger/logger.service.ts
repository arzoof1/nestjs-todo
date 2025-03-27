import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';

interface LogPayload {
  context?: string;
  message: string;
  timestamp?: string;
  level?: string;
  trace?: string;
  additional?: Record<string, any>;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private createLogPayload(
    message: string,
    context?: string,
    trace?: string,
    additional?: Record<string, any>,
  ): LogPayload {
    return {
      message,
      context,
      timestamp: new Date().toISOString(),
      trace,
      additional,
    };
  }

  private formatLog(payload: LogPayload): string {
    return JSON.stringify({
      ...payload,
      level: payload.level,
      service: 'backend',
      environment: process.env.NODE_ENV || 'development',
    });
  }

  log(
    message: string,
    context?: string,
    additional?: Record<string, any>,
  ): void {
    const payload = this.createLogPayload(
      message,
      context,
      undefined,
      additional,
    );
    payload.level = 'info';
    console.log(this.formatLog(payload));
  }

  error(
    message: string,
    trace?: string,
    context?: string,
    additional?: Record<string, any>,
  ): void {
    const payload = this.createLogPayload(message, context, trace, additional);
    payload.level = 'error';
    console.error(this.formatLog(payload));
  }

  warn(
    message: string,
    context?: string,
    additional?: Record<string, any>,
  ): void {
    const payload = this.createLogPayload(
      message,
      context,
      undefined,
      additional,
    );
    payload.level = 'warn';
    console.warn(this.formatLog(payload));
  }

  debug(
    message: string,
    context?: string,
    additional?: Record<string, any>,
  ): void {
    const payload = this.createLogPayload(
      message,
      context,
      undefined,
      additional,
    );
    payload.level = 'debug';
    console.debug(this.formatLog(payload));
  }

  verbose(
    message: string,
    context?: string,
    additional?: Record<string, any>,
  ): void {
    const payload = this.createLogPayload(
      message,
      context,
      undefined,
      additional,
    );
    payload.level = 'verbose';
    console.log(this.formatLog(payload));
  }
}
