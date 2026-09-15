import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/auth.guard';
import { UpdateProfileDto } from '../auth/dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@Req() request: Request & { user?: { sub: string } }) { return this.users.getMe(request.user!.sub); }

  @Patch('me')
  update(@Req() request: Request & { user?: { sub: string } }, @Body() dto: UpdateProfileDto) { return this.users.updateMe(request.user!.sub, dto); }
}
