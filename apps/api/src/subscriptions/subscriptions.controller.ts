import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subService: SubscriptionsService) {}

  @Get('current')
  getCurrent(@Req() req: any, @Query('userId') queryUserId?: string) {
    const authUserId = req.user.sub;
    const targetUserId =
      queryUserId && req.user.role === 'ADMIN' ? queryUserId : authUserId;

    if (queryUserId && queryUserId !== authUserId && req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admins may inspect subscriptions of other users',
      );
    }

    return this.subService.getCurrentSubscription(targetUserId);
  }

  @Post('upgrade')
  upgrade(
    @Req() req: any,
    @Body() body: { userId?: string; plan?: 'MONTHLY' | 'ANNUAL' },
  ) {
    const authUserId = req.user.sub;
    const targetUserId =
      body.userId && req.user.role === 'ADMIN' ? body.userId : authUserId;

    if (body.userId && body.userId !== authUserId && req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admins may modify subscriptions for other users',
      );
    }

    return this.subService.upgradeToPremium(targetUserId, body.plan);
  }

  @Post('cancel')
  cancel(@Req() req: any, @Body() body: { userId?: string }) {
    const authUserId = req.user.sub;
    const targetUserId =
      body?.userId && req.user.role === 'ADMIN' ? body.userId : authUserId;

    if (body?.userId && body.userId !== authUserId && req.user.role !== 'ADMIN') {
      throw new ForbiddenException(
        'Only admins may cancel subscriptions for other users',
      );
    }

    return this.subService.cancelSubscription(targetUserId);
  }
}
