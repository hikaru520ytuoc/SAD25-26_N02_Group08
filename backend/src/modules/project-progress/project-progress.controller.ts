import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateProgressCommentDto } from './dto/create-progress-comment.dto';
import { CreateProjectProgressDto } from './dto/create-project-progress.dto';
import { QueryProjectProgressDto } from './dto/query-project-progress.dto';
import { UpdateProjectProgressDto } from './dto/update-project-progress.dto';
import { ProjectProgressService } from './project-progress.service';

@ApiTags('Project Progress')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('project-progress')
export class ProjectProgressController {
  constructor(private readonly projectProgressService: ProjectProgressService) {}

  @Get('me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get current student progress updates' })
  async findMe(@CurrentUser() actor: AuthUser) {
    const data = await this.projectProgressService.findMe(actor);
    return successResponse(data, 'Lấy tiến độ của tôi thành công');
  }

  @Get('supervisor')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Get progress updates for current supervisor students' })
  async findSupervisor(@Query() query: QueryProjectProgressDto, @CurrentUser() actor: AuthUser) {
    const data = await this.projectProgressService.findSupervisor(actor, query);
    return successResponse(data, 'Lấy tiến độ sinh viên hướng dẫn thành công');
  }

  @Get(':id')
  @Roles('STUDENT', 'SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get progress detail with ownership check' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.projectProgressService.findOne(id, actor);
    return successResponse(data, 'Lấy chi tiết tiến độ thành công');
  }

  @Post()
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Create current student project progress update' })
  async create(@Body() dto: CreateProjectProgressDto, @CurrentUser() actor: AuthUser) {
    const data = await this.projectProgressService.create(dto, actor);
    return successResponse(data, 'Cập nhật tiến độ thành công');
  }

  @Patch(':id')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Update current student project progress' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateProjectProgressDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.projectProgressService.update(id, dto, actor);
    return successResponse(data, 'Cập nhật lại tiến độ thành công');
  }

  @Post(':id/comments')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Supervisor comments on student progress' })
  async addComment(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: CreateProgressCommentDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.projectProgressService.addComment(id, dto, actor);
    return successResponse(data, 'Góp ý tiến độ thành công');
  }

  @Get(':id/comments')
  @Roles('STUDENT', 'SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get progress comments' })
  async getComments(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.projectProgressService.getComments(id, actor);
    return successResponse(data, 'Lấy góp ý tiến độ thành công');
  }
}
