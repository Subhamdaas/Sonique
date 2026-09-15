import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { SubscriptionTier } from '../generated/prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentSubscription(userId?: string) {
    if (!userId) {
      return {
        plan: SubscriptionTier.FREE,
        isActive: true,
        features: {
          audioQuality: 'Standard (160kbps)',
          offlineDownloads: false,
          listenTogetherRooms: 'Limited (3 rooms/day)',
          adFree: false,
        },
      };
    }

    const sub = await this.prisma.subscription.findFirst({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (!sub) {
      return {
        plan: SubscriptionTier.FREE,
        isActive: true,
        features: {
          audioQuality: 'Standard (160kbps)',
          offlineDownloads: false,
          listenTogetherRooms: 'Limited (3 rooms/day)',
          adFree: false,
        },
      };
    }

    return {
      plan: sub.tier,
      isActive: sub.isActive,
      currentPeriodEnd: sub.currentPeriodEnd,
      features: {
        audioQuality:
          sub.tier === SubscriptionTier.PREMIUM
            ? 'Lossless Hi-Fi (320kbps / FLAC)'
            : 'Standard (160kbps)',
        offlineDownloads: sub.tier === SubscriptionTier.PREMIUM,
        listenTogetherRooms:
          sub.tier === SubscriptionTier.PREMIUM
            ? 'Unlimited VIP Rooms'
            : 'Limited (3 rooms/day)',
        adFree: sub.tier === SubscriptionTier.PREMIUM,
      },
    };
  }

  async upgradeToPremium(userId: string, plan: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') {
    const periodDays = plan === 'ANNUAL' ? 365 : 30;
    const currentPeriodEnd = new Date(Date.now() + periodDays * 24 * 60 * 60 * 1000);

    const sub = await this.prisma.subscription.create({
      data: {
        userId,
        tier: SubscriptionTier.PREMIUM,
        isActive: true,
        currentPeriodEnd,
      },
    });

    return {
      success: true,
      message: 'Upgraded to Sonique Premium! Enjoy lossless audio and unlimited collaborative rooms.',
      subscription: sub,
    };
  }

  async cancelSubscription(userId: string) {
    await this.prisma.subscription.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });

    return {
      success: true,
      message: 'Subscription cancelled. You will continue to have access until the end of your billing cycle.',
    };
  }
}
