import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';
import { AuthUser } from '../../common/types/auth-user.type';
import { PrismaService } from '../../prisma/prisma.service';

export type CreateNotificationInput = {
  userId: string;
  title: string;
  message: string;
  type: string;
};

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateNotificationInput) {
    // Không đưa password, token hoặc secret vào message notification.
    return this.prisma.notification.create({ data: input });
  }

  async findMy(actor: AuthUser) {
    return this.prisma.notification.findMany({
      where: { userId: actor.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, actor: AuthUser) {
    const notification = await this.prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.userId !== actor.id) {
      throw new AppException('NOTIFICATION_NOT_FOUND', 'Không tìm thấy thông báo', HttpStatus.NOT_FOUND);
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(actor: AuthUser) {
    await this.prisma.notification.updateMany({
      where: { userId: actor.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return { updated: true };
  }
}
