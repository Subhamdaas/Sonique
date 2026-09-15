import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subService: SubscriptionsService) {}

  @Get('current')
  getCurrent(@Query('userId') userId?: string) {
    return this.subService.getCurrentSubscription(userId);
  }

  @Post('upgrade')
  upgrade(
    @Body() body: { userId: string; plan?: 'MONTHLY' | 'ANNUAL' }
  ) {
    return this.subService.upgradeToPremium(body.userId, body.plan);
  }

  @Post('cancel')
  cancel(@Body() body: { userId: string }) {
    return this.subService.cancelSubscription(body.userId);
  }
}
