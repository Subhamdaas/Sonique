import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateProfileDto } from '../auth/dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { id: user.id, email: user.email, name: user.name, username: user.username, role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt };
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: dto });
    return { id: user.id, email: user.email, name: user.name, username: user.username, role: user.role, avatarUrl: user.avatarUrl, createdAt: user.createdAt };
  }
}
