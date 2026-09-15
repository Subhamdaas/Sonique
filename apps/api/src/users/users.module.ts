import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaService } from '../common/prisma.service';
import { JwtAuthGuard } from '../auth/auth.guard';
import { env } from '../config/env';

@Module({
  imports: [
    JwtModule.register({
      secret: env.jwtSecret,
    }),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    PrismaService,
    JwtAuthGuard,
  ],
})
export class UsersModule {}