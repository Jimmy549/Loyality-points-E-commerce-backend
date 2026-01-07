import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private store: RateLimitStore = {};
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes
  private readonly maxRequests = 100; // max requests per window

  use(req: Request, res: Response, next: NextFunction) {
    const key = this.getKey(req);
    const now = Date.now();
    
    // Clean up expired entries
    this.cleanup(now);
    
    if (!this.store[key]) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs
      };
    } else {
      if (now > this.store[key].resetTime) {
        // Reset the counter
        this.store[key] = {
          count: 1,
          resetTime: now + this.windowMs
        };
      } else {
        this.store[key].count++;
        
        if (this.store[key].count > this.maxRequests) {
          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message: 'Too many requests, please try again later.',
              error: 'Too Many Requests'
            },
            HttpStatus.TOO_MANY_REQUESTS
          );
        }
      }
    }
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', this.maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - this.store[key].count));
    res.setHeader('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());
    
    next();
  }

  private getKey(req: Request): string {
    // Use IP address as the key, but could be enhanced with user ID for authenticated requests
    return req.ip || req.connection.remoteAddress || 'unknown';
  }

  private cleanup(now: number) {
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}