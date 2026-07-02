import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { StudentsService } from './students.service';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('academic-eligibility')
  @Roles('ADMIN', 'FACULTY_MANAGER')
  @ApiOperation({ summary: 'Danh sách điều kiện đăng ký đồ án được tính trực tiếp từ hồ sơ sinh viên' })
  async overview(
    @Query('search') search?: string,
    @Query('majorCode') majorCode?: string,
    @Query('eligible') eligible?: string,
  ) {
    const data = await this.studentsService.academicEligibilityOverview({
      search,
      majorCode,
      eligible: eligible === undefined ? undefined : eligible === 'true',
    });
    return successResponse(data, 'Tính điều kiện đăng ký đồ án thành công');
  }

  @Get('me/academic-eligibility')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Điều kiện đăng ký đồ án của sinh viên hiện tại' })
  async me(@CurrentUser() actor: AuthUser) {
    return successResponse(await this.studentsService.myAcademicEligibility(actor), 'Tính điều kiện đăng ký đồ án thành công');
  }
}
