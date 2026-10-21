import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import type { AuthUser } from '../../common/types/auth-user.type';
import { ConfirmGradesDto, PreviewGradesDto } from './softsec-import.dto';
import { SoftsecImportService } from './softsec-import.service';

@ApiTags('Software Security - Safe CSV Grade Import')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('softsec-import')
export class SoftsecImportController {
  constructor(private readonly service: SoftsecImportService) {}

  @Post('preview')
  @Roles('SUPERVISOR', 'REVIEWER', 'COUNCIL_SECRETARY', 'COUNCIL_MEMBER', 'FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Native C CSV validation + read-only database mapping preview' })
  async preview(@Body() body: PreviewGradesDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.preview(body, actor), 'Phân tích và đối chiếu CSV thành công');
  }

  @Post('confirm')
  @Roles('SUPERVISOR', 'REVIEWER')
  @ApiOperation({ summary: 'Atomic write for authorized supervisor OR reviewer scores only. Council import disabled.' })
  async confirm(@Body() body: ConfirmGradesDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.confirm(body, actor), 'Nhập điểm thành công');
  }
}
