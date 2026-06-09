import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateDefenseRegistrationDto } from './dto/create-defense-registration.dto';
import { QueryDefenseRegistrationDto } from './dto/query-defense-registration.dto';
import { ResubmitDefenseRegistrationDto } from './dto/resubmit-defense-registration.dto';
import { SupervisorApproveDefenseDto } from './dto/supervisor-approve-defense.dto';
import { SupervisorRejectDefenseDto } from './dto/supervisor-reject-defense.dto';
import { DefenseRegistrationsService } from './defense-registrations.service';

@ApiTags('Defense Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('defense-registrations')
export class DefenseRegistrationsController {
  constructor(private readonly defenseRegistrationsService: DefenseRegistrationsService) {}

  @Get('me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Student gets own defense registration' })
  async findMe(@CurrentUser() actor: AuthUser) {
    return successResponse(await this.defenseRegistrationsService.findMe(actor), 'Lấy hồ sơ đăng ký bảo vệ thành công');
  }

  @Get('supervisor')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Supervisor gets defense registrations of supervised students' })
  async findSupervisor(@Query() query: QueryDefenseRegistrationDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.defenseRegistrationsService.findSupervisor(actor, query), 'Lấy danh sách đăng ký bảo vệ thành công');
  }

  @Get('faculty')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Faculty gets defense registrations for reviewer assignment' })
  async findFaculty(@Query() query: QueryDefenseRegistrationDto) {
    return successResponse(await this.defenseRegistrationsService.findFaculty(query), 'Lấy danh sách hồ sơ bảo vệ thành công');
  }

  @Get(':id')
  @Roles('STUDENT', 'SUPERVISOR', 'REVIEWER', 'FACULTY_MANAGER', 'ADMIN')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.defenseRegistrationsService.findOne(id, actor), 'Lấy chi tiết đăng ký bảo vệ thành công');
  }

  @Post()
  @Roles('STUDENT')
  async create(@Body() dto: CreateDefenseRegistrationDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.defenseRegistrationsService.create(dto, actor), 'Đăng ký bảo vệ thành công');
  }

  @Patch(':id/resubmit')
  @Roles('STUDENT')
  async resubmit(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ResubmitDefenseRegistrationDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return successResponse(await this.defenseRegistrationsService.resubmit(id, dto, actor), 'Nộp lại hồ sơ bảo vệ thành công');
  }

  @Patch(':id/supervisor/approve')
  @Roles('SUPERVISOR')
  async supervisorApprove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: SupervisorApproveDefenseDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return successResponse(await this.defenseRegistrationsService.supervisorApprove(id, dto, actor), 'GVHD xác nhận đủ điều kiện bảo vệ thành công');
  }

  @Patch(':id/supervisor/reject')
  @Roles('SUPERVISOR')
  async supervisorReject(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: SupervisorRejectDefenseDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return successResponse(await this.defenseRegistrationsService.supervisorReject(id, dto, actor), 'GVHD yêu cầu chỉnh sửa hồ sơ bảo vệ thành công');
  }
}
