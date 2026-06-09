import { Controller, Get, Param, ParseUUIDPipe, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get notifications of current user' })
  async findMy(@CurrentUser() actor: AuthUser) {
    const data = await this.notificationsService.findMy(actor);
    return successResponse(data, 'Lấy danh sách thông báo thành công');
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@CurrentUser() actor: AuthUser) {
    const data = await this.notificationsService.markAllRead(actor);
    return successResponse(data, 'Đã đánh dấu tất cả thông báo là đã đọc');
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.notificationsService.markRead(id, actor);
    return successResponse(data, 'Đã đánh dấu thông báo là đã đọc');
  }
}
