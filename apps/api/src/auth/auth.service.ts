import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createHash, randomUUID } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { env } from '../config/env';
import { LoginDto, RegisterDto } from './dto';
import bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private publicUser(user: {
    id: string;
    email: string;
    name: string;
    username: string | null;
    role: string;
    createdAt: Date;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      role: user.role,
      createdAt: user.createdAt,
    };
  }

  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException(
        'An account with this email already exists',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name.trim(),
        passwordHash,
      },
    });

    return this.issueTokens(user.id, this.publicUser(user));
  }

  async login(dto: LoginDto) {
    const email = dto.email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (
      !user ||
      !(await bcrypt.compare(dto.password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.issueTokens(user.id, this.publicUser(user));
  }

  private hashRefreshToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  async issueTokens(
    userId: string,
    user: ReturnType<AuthService['publicUser']>,
  ) {
    const jti = randomUUID();
    const accessToken = await this.jwt.signAsync(
      {
        sub: userId,
        role: user.role,
      },
      {
        secret: env.jwtSecret,
        expiresIn: env.jwtExpiresIn as any,
      },
    );

    const refreshToken = await this.jwt.signAsync(
      {
        sub: userId,
        jti,
        type: 'refresh',
      },
      {
        secret: env.refreshSecret,
        expiresIn: env.refreshExpiresIn as any,
      },
    );

    const refreshExpiresAt = new Date(
      Date.now() + this.parseDurationMs(env.refreshExpiresIn),
    );

    await this.prisma.refreshToken.create({
      data: {
        jti,
        tokenHash: this.hashRefreshToken(refreshToken),
        userId,
        expiresAt: refreshExpiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  private parseDurationMs(value: string) {
    const match = value.trim().match(/^(\d+)\s*(s|m|h|d)$/i);
    if (!match) {
      throw new Error(`Unsupported token duration: ${value}`);
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
  }

  async refresh(refreshToken: string) {
    try {
      const payload = await this.jwt.verifyAsync<{
        sub: string;
        jti: string;
        type: string;
      }>(refreshToken, {
        secret: env.refreshSecret,
      });

      if (payload.type !== 'refresh' || !payload.jti) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const stored = await this.prisma.refreshToken.findUnique({
        where: { jti: payload.jti },
      });

      if (
        !stored ||
        stored.userId !== payload.sub ||
        stored.revokedAt ||
        stored.expiresAt <= new Date() ||
        stored.tokenHash !== this.hashRefreshToken(refreshToken)
      ) {
        throw new UnauthorizedException('Refresh token has been revoked or is invalid');
      }

      const revoked = await this.prisma.refreshToken.updateMany({
        where: { id: stored.id, revokedAt: null },
        data: { revokedAt: new Date() },
      });

      if (revoked.count !== 1) {
        throw new UnauthorizedException('Refresh token has already been used');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return this.issueTokens(user.id, this.publicUser(user));
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
  async getMe(userId: string) {
  const user = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new UnauthorizedException('User not found');
  }

  return user;
   }
}