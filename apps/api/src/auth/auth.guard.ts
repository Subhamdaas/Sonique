import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { env } from '../config/env';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const header = request.headers.authorization;
    const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
    if (!token) throw new UnauthorizedException('Authorization token is required');
    try {
      request.user = await this.jwt.verifyAsync(token, { secret: env.jwtSecret });
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}

export { JwtAuthGuard as AuthGuard };
