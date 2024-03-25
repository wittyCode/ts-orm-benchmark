import { Injectable, Scope } from '@nestjs/common';
import {
  createLogger,
  format,
  Logger,
  transports as winstonTransports,
} from 'winston';

const { json, prettyPrint } = format;

/**
 * logger service based on Winston
 */
@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private logger: Logger;
  private context?: string;

  constructor() {
    this.logger = createLogger({
      level: process.env.NODE_ENV == 'production' ? 'info' : 'debug',
      exitOnError: false,
      format:
        process.env.NODE_ENV == 'production'
          ? json()
          : prettyPrint({ colorize: true }),
      transports: new winstonTransports.Console(),
      exceptionHandlers: new winstonTransports.Console(),
    });
  }

  public setContext(context: string): void {
    this.context = context;
  }

  public log(
    message: string,
    data?: Record<string, unknown> & { context?: string },
  ): Logger {
    const context = data?.context ?? this.context;

    return this.logger.info(message, { ...data, context });
  }

  public error(
    message: Error | (object & { message: string }) | string,
    trace?: string,
    data?: Record<string, unknown> & { context?: string },
  ): Logger {
    const context = data?.context ?? this.context;
    delete data?.context;

    if (message instanceof Error) {
      const { message: msg, stack, ...meta } = message;

      return this.logger.error(msg, {
        context,
        stack: [trace || stack],
        ...meta,
        ...data,
      });
    }

    if ('object' === typeof message && message.message) {
      const { message: msg, ...meta } = message;

      return this.logger.error(msg, {
        context,
        stack: [trace],
        ...meta,
        ...data,
      });
    }

    return this.logger.error(message.toString(), {
      context,
      stack: [trace],
      ...data,
    });
  }

  public warn(
    message: string,
    data?: Record<string, unknown> & { context?: string },
  ): Logger {
    const context = data?.context ?? this.context;

    return this.logger.warn(message, { ...data, context });
  }

  public debug(
    message: string,
    data?: Record<string, unknown> & { context?: string },
  ): Logger {
    const context = data?.context ?? this.context;

    return this.logger.debug(message, { ...data, context });
  }
}
