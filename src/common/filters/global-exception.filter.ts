import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { MongoError } from 'mongodb';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    // Handle HTTP exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
      } else {
        message = exceptionResponse;
        error = exception.name;
      }
    }
    // Handle MongoDB duplicate key error
    else if (exception.code === 11000) {
      status = HttpStatus.CONFLICT;
      error = 'Duplicate Entry';
      
      const field = Object.keys(exception.keyValue)[0];
      const value = exception.keyValue[field];
      
      if (field === 'email') {
        message = 'Email address already exists';
      } else {
        message = `${field} '${value}' already exists`;
      }
    }
    // Handle MongoDB validation errors
    else if (exception.name === 'ValidationError') {
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      const errors = Object.values(exception.errors).map((err: any) => err.message);
      message = errors.join(', ');
    }
    // Handle MongoDB cast errors
    else if (exception.name === 'CastError') {
      status = HttpStatus.BAD_REQUEST;
      error = 'Invalid Data';
      message = `Invalid ${exception.path}: ${exception.value}`;
    }
    // Handle JWT errors
    else if (exception.name === 'JsonWebTokenError') {
      status = HttpStatus.UNAUTHORIZED;
      error = 'Invalid Token';
      message = 'Invalid authentication token';
    }
    else if (exception.name === 'TokenExpiredError') {
      status = HttpStatus.UNAUTHORIZED;
      error = 'Token Expired';
      message = 'Authentication token has expired';
    }
    // Handle other MongoDB errors
    else if (exception instanceof MongoError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';
      message = 'Database operation failed';
    }

    // Log the error for debugging
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception.stack,
    );

    // Send error response
    response.status(status).json({
      success: false,
      statusCode: status,
      error,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}