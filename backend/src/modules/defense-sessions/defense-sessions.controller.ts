import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateDefenseSessionDto } from './dto/create-defense-session.dto';
import { UpdateDefenseSessionDto } from './dto/update-defense-session.dto';
import { DefenseSessionsService } from './defense-sessions.service';

@ApiTags('Defense Sessions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('defense-sessions')
export class DefenseSessionsController {
  constructor(private readonly defenseSessionsService: DefenseSessionsService) {}

  @Get(':scheduleId')
  @Roles('STUDENT', 'COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'FACULTY_MANAGER', 'ADMIN')
  async getBySchedule(@Param('scheduleId', new ParseUUIDPipe({ version: '4' })) scheduleId: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.defenseSessionsService.getBySchedule(scheduleId, actor), 'Lấy biên bản bảo vệ thành công');
  }

  @Post()
  @Roles('COUNCIL_SECRETARY', 'FACULTY_MANAGER', 'ADMIN')
  async create(@Body() dto: CreateDefenseSessionDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.defenseSessionsService.create(dto, actor), 'Lưu biên bản bảo vệ thành công');
  }

  @Patch(':id')
  @Roles('COUNCIL_SECRETARY', 'FACULTY_MANAGER', 'ADMIN')
  async update(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateDefenseSessionDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.defenseSessionsService.update(id, dto, actor), 'Cập nhật biên bản bảo vệ thành công');
  }
}
