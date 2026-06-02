import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateProjectPeriodDto } from './dto/create-project-period.dto';
import { QueryProjectPeriodDto } from './dto/query-project-period.dto';
import { UpdateProjectPeriodDto } from './dto/update-project-period.dto';
import { ProjectPeriodsService } from './project-periods.service';

@ApiTags('Project Periods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('project-periods')
export class ProjectPeriodsController {
  constructor(private readonly projectPeriodsService: ProjectPeriodsService) {}

  @Get()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'List project periods' })
  async findAll(@Query() query: QueryProjectPeriodDto) {
    const data = await this.projectPeriodsService.findAll(query);
    return successResponse(data, 'Lấy danh sách đợt đồ án thành công');
  }

  @Get(':id')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get project period detail' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.projectPeriodsService.findOne(id);
    return successResponse(data, 'Lấy chi tiết đợt đồ án thành công');
  }

  @Post()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Create project period' })
  async create(@Body() dto: CreateProjectPeriodDto, @CurrentUser() actor: AuthUser) {
    const data = await this.projectPeriodsService.create(dto, actor);
    return successResponse(data, 'Tạo đợt đồ án thành công');
  }

  @Patch(':id')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Update project period' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateProjectPeriodDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.projectPeriodsService.update(id, dto, actor);
    return successResponse(data, 'Cập nhật đợt đồ án thành công');
  }

  @Patch(':id/open')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Open project period' })
  async open(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.projectPeriodsService.open(id, actor);
    return successResponse(data, 'Mở đợt đồ án thành công');
  }

  @Patch(':id/close')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Close project period' })
  async close(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.projectPeriodsService.close(id, actor);
    return successResponse(data, 'Đóng đợt đồ án thành công');
  }
}
