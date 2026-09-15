import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TracksModule } from './tracks/tracks.module';
import { PlaylistsModule } from './playlists/playlists.module';
import { LikesModule } from './likes/likes.module';
import { CatalogModule } from './catalog/catalog.module';
import { SearchModule } from './search/search.module';
import { PlaybackModule } from './playback/playback.module';
import { PodcastsModule } from './podcasts/podcasts.module';
import { RoomsModule } from './rooms/rooms.module';
import { StorageModule } from './storage/storage.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrismaService } from './common/prisma.service';
import { RateLimitGuard } from './common/rate-limit.guard';
import { RedisService } from './common/redis.service';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    TracksModule,
    PlaylistsModule,
    LikesModule,
    CatalogModule,
    SearchModule,
    PlaybackModule,
    PodcastsModule,
    RoomsModule,
    StorageModule,
    RecommendationsModule,
    SubscriptionsModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  providers: [
    PrismaService,
    RedisService,
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
})
export class AppModule {}