import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { RedisService } from './redis.service';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  async getHealth() {
    let databaseStatus = 'ok';
    let redisStatus = 'ok';

    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = 'degraded';
    }

    try {
      const pingRes = await this.redisService.ping();
      if (!pingRes) redisStatus = 'degraded';
    } catch {
      redisStatus = 'degraded';
    }

    const isHealthy = databaseStatus === 'ok';

    return {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      version: '1.0.0',
      services: {
        database: databaseStatus,
        redis: redisStatus,
      },
    };
  }
}
