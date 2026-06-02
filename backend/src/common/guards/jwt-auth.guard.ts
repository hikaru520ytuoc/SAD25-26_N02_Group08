import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserStatus } from '@prisma/client';
import { Request } from 'express';
import { AppException } from '../exceptions/app.exception';
import { AuthUser } from '../types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';

type JwtPayload = {
  sub: string;
  email: string;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const token = this.extractToken(request);

    if (!token) {
      throw new AppException('AUTH_UNAUTHORIZED', 'Bạn chưa đăng nhập', HttpStatus.UNAUTHORIZED);
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user) {
        throw new AppException('AUTH_UNAUTHORIZED', 'Token không hợp lệ', HttpStatus.UNAUTHORIZED);
      }

      if (user.status === UserStatus.LOCKED) {
        throw new AppException('AUTH_ACCOUNT_LOCKED', 'Tài khoản đã bị khóa', HttpStatus.FORBIDDEN);
      }

      request.user = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        status: user.status,
        roles: user.userRoles.map((userRole) => userRole.role.code),
      };

      return true;
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }

      throw new AppException(
        'AUTH_UNAUTHORIZED',
        'Token không hợp lệ hoặc đã hết hạn',
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  private extractToken(request: Request): string | null {
    const authorization = request.headers.authorization;
    if (!authorization) return null;

    const [type, token] = authorization.split(' ');
    return type === 'Bearer' && token ? token : null;
  }
}
