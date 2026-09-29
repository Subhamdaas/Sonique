import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RoomsService } from './rooms.service';
import { RoomsGateway } from './rooms.gateway';
import { RoomsController } from './rooms.controller';

@Module({
  imports: [JwtModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomsGateway],
  exports: [RoomsService],
})
export class RoomsModule {}
