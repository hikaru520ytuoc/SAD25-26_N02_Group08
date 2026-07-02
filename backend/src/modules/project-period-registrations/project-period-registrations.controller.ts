import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { RegisterProjectPeriodDto } from './dto/register-project-period.dto';
import { ProjectPeriodRegistrationsService } from './project-period-registrations.service';

@ApiTags('Project Period Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
@Controller('project-period-registrations')
export class ProjectPeriodRegistrationsController {
  constructor(private readonly service: ProjectPeriodRegistrationsService) {}

  @Get('available')
  @ApiOperation({ summary: 'Các đợt đang mở mà sinh viên đủ điều kiện có thể tự chọn' })
  async available(@CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.available(actor), 'Lấy danh sách đợt có thể đăng ký thành công');
  }

  @Get('me')
  async me(@CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findMe(actor), 'Lấy lịch sử đăng ký đợt thành công');
  }

  @Post()
  async register(@Body() dto: RegisterProjectPeriodDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.register(dto, actor), 'Đăng ký đợt đồ án thành công');
  }

  @Patch(':id/cancel')
  async cancel(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.cancel(id, actor), 'Hủy đăng ký đợt đồ án thành công');
  }
}
