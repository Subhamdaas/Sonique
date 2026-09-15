import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;
  private isConnected = false;

  constructor() {
    this.client = new Redis(
      process.env.REDIS_URL || 'redis://localhost:6379',
      {
        retryStrategy: (times) => {
          if (times > 5) {
            this.logger.warn('Redis reconnection limit reached, falling back to local handlers');
            return null;
          }
          return Math.min(times * 200, 2000);
        },
        maxRetriesPerRequest: 1,
        lazyConnect: true,
      },
    );

    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('Connected to Redis');
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      this.logger.warn(`Redis error: ${err.message}`);
    });

    // Initiate non-blocking connection
    this.client.connect().catch((err) => {
      this.logger.warn(`Initial Redis connection failed: ${err.message}`);
    });
  }

  get isReady(): boolean {
    return this.isConnected;
  }

  async ping(): Promise<string> {
    return this.client.ping();
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.set(key, value, 'EX', ttlSeconds);
        return;
      }
      await this.client.set(key, value);
    } catch (err: any) {
      this.logger.warn(`Redis set failed for key ${key}: ${err.message}`);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (err: any) {
      this.logger.warn(`Redis get failed for key ${key}: ${err.message}`);
      return null;
    }
  }

  async incr(key: string): Promise<number | null> {
    try {
      return await this.client.incr(key);
    } catch (err: any) {
      this.logger.warn(`Redis incr failed for key ${key}: ${err.message}`);
      return null;
    }
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    try {
      const res = await this.client.expire(key, seconds);
      return res === 1;
    } catch (err: any) {
      this.logger.warn(`Redis expire failed for key ${key}: ${err.message}`);
      return false;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err: any) {
      this.logger.warn(`Redis del failed for key ${key}: ${err.message}`);
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      // Ignored during shutdown
    }
  }
}