import { Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * Module providing logger implementation
 */
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
