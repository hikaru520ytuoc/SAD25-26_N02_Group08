import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateDefenseScheduleDto } from './dto/create-defense-schedule.dto';
import { QueryDefenseScheduleDto } from './dto/query-defense-schedule.dto';
import { UpdateDefenseScheduleDto } from './dto/update-defense-schedule.dto';
import { DefenseSchedulesService } from './defense-schedules.service';

@ApiTags('Sprint 6 - Defense Schedules')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('defense-schedules')
export class DefenseSchedulesController {
  constructor(private readonly service: DefenseSchedulesService) {}

  @Get()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async findAll(@Query() query: QueryDefenseScheduleDto) {
    return successResponse(await this.service.findAll(query), 'Lấy danh sách lịch bảo vệ thành công');
  }

  @Get('me')
  @Roles('STUDENT')
  async findMe(@CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findMe(actor), 'Lấy lịch bảo vệ của sinh viên thành công');
  }

  @Get('council')
  @Roles('COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'ADMIN')
  async findCouncil(@Query() query: QueryDefenseScheduleDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findCouncil(actor, query), 'Lấy lịch bảo vệ của hội đồng thành công');
  }

  @Get(':id')
  @Roles('STUDENT', 'SUPERVISOR', 'REVIEWER', 'COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'FACULTY_MANAGER', 'ADMIN')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findOne(id, actor), 'Lấy chi tiết lịch bảo vệ thành công');
  }

  @Post()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async create(@Body() dto: CreateDefenseScheduleDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.create(dto, actor), 'Tạo lịch bảo vệ thành công');
  }

  @Patch(':id')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async update(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateDefenseScheduleDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.update(id, dto, actor), 'Cập nhật lịch bảo vệ thành công');
  }

  @Patch(':id/cancel')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async cancel(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.cancel(id, actor), 'Hủy lịch bảo vệ thành công');
  }
}
