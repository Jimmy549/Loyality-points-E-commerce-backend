import { Injectable, LoggerService } from '@nestjs/common';

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

@Injectable()
export class CustomLoggerService implements LoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.printMessage(message, LogLevel.INFO, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.printMessage(message, LogLevel.ERROR, context, trace);
  }

  warn(message: any, context?: string) {
    this.printMessage(message, LogLevel.WARN, context);
  }

  debug(message: any, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage(message, LogLevel.DEBUG, context);
    }
  }

  verbose(message: any, context?: string) {
    if (process.env.NODE_ENV !== 'production') {
      this.printMessage(message, LogLevel.DEBUG, context);
    }
  }

  private printMessage(
    message: any,
    level: LogLevel,
    context?: string,
    trace?: string
  ) {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';
    
    const logObject = {
      timestamp,
      level,
      context: ctx,
      message: typeof message === 'object' ? JSON.stringify(message) : message,
      ...(trace && { trace })
    };

    // In production, you might want to send logs to external service
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(logObject));
    } else {
      // Pretty print for development
      const colorMap = {
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.INFO]: '\x1b[32m',  // Green
        [LogLevel.DEBUG]: '\x1b[36m'  // Cyan
      };
      
      const resetColor = '\x1b[0m';
      const color = colorMap[level] || '';
      
      console.log(
        `${color}[${timestamp}] ${level.toUpperCase()} [${ctx}] ${logObject.message}${resetColor}`
      );
      
      if (trace) {
        console.log(`${color}${trace}${resetColor}`);
      }
    }
  }

  // Additional utility methods
  logApiRequest(method: string, url: string, userId?: string) {
    this.log(`${method} ${url}${userId ? ` - User: ${userId}` : ''}`, 'API');
  }

  logApiResponse(method: string, url: string, statusCode: number, duration: number) {
    this.log(`${method} ${url} - ${statusCode} (${duration}ms)`, 'API');
  }

  logSecurityEvent(event: string, details: any, userId?: string) {
    this.warn(`Security Event: ${event} - ${JSON.stringify(details)}${userId ? ` - User: ${userId}` : ''}`, 'Security');
  }

  logDatabaseQuery(query: string, duration: number) {
    if (process.env.NODE_ENV !== 'production') {
      this.debug(`DB Query (${duration}ms): ${query}`, 'Database');
    }
  }
}