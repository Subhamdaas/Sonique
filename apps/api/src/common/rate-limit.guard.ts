import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { RedisService } from './redis.service';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly windowSec = 60;
  private readonly maxRequests = 100;
  private readonly localFallback = new Map<string, RateLimitEntry>();

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // Skip rate limiting for health check
    if (request.url === '/api/health' || request.url === '/health') {
      return true;
    }

    const ip =
      request.ip ||
      request.socket.remoteAddress ||
      'unknown';

    const key = `ratelimit:${ip}`;

    // Try Redis-backed rate limiting first
    if (this.redisService.isReady) {
      try {
        const count = await this.redisService.incr(key);
        if (count !== null) {
          if (count === 1) {
            await this.redisService.expire(key, this.windowSec);
          }

          if (count > this.maxRequests) {
            throw new HttpException(
              'Too many requests. Please try again later.',
              HttpStatus.TOO_MANY_REQUESTS,
            );
          }

          return true;
        }
      } catch (err) {
        if (err instanceof HttpException) throw err;
        // fallback to memory
      }
    }

    // In-memory fallback
    const now = Date.now();
    const entry = this.localFallback.get(ip);

    if (!entry || now >= entry.resetAt) {
      this.localFallback.set(ip, {
        count: 1,
        resetAt: now + this.windowSec * 1000,
      });
      return true;
    }

    if (entry.count >= this.maxRequests) {
      throw new HttpException(
        'Too many requests. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count += 1;
    return true;
  }
}