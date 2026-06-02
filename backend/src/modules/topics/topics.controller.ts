import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateTopicDto } from './dto/create-topic.dto';
import { QueryTopicDto } from './dto/query-topic.dto';
import { RejectTopicDto } from './dto/reject-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicsService } from './topics.service';

@ApiTags('Topics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Get()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'List topics for faculty manager' })
  async findAll(@Query() query: QueryTopicDto) {
    const data = await this.topicsService.findAll(query);
    return successResponse(data, 'Lấy danh sách đề tài thành công');
  }

  @Get('published')
  @Roles('STUDENT', 'FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'List published topics for students' })
  async findPublished(@Query() query: QueryTopicDto) {
    const data = await this.topicsService.findPublished(query);
    return successResponse(data, 'Lấy danh sách đề tài đã công bố thành công');
  }

  @Get('my')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'List topics created by current supervisor' })
  async findMy(@CurrentUser() actor: AuthUser, @Query() query: QueryTopicDto) {
    const data = await this.topicsService.findMy(actor, query);
    return successResponse(data, 'Lấy danh sách đề tài của tôi thành công');
  }

  @Get(':id')
  @Roles('SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get topic detail' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.topicsService.findOne(id);
    return successResponse(data, 'Lấy chi tiết đề tài thành công');
  }

  @Post()
  @Roles('SUPERVISOR', 'ADMIN')
  @ApiOperation({ summary: 'Create topic draft' })
  async create(@Body() dto: CreateTopicDto, @CurrentUser() actor: AuthUser) {
    const data = await this.topicsService.create(dto, actor);
    return successResponse(data, 'Tạo đề tài thành công');
  }

  @Patch(':id')
  @Roles('SUPERVISOR', 'ADMIN')
  @ApiOperation({ summary: 'Update topic draft' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateTopicDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.topicsService.update(id, dto, actor);
    return successResponse(data, 'Cập nhật đề tài thành công');
  }

  @Patch(':id/submit')
  @Roles('SUPERVISOR', 'ADMIN')
  @ApiOperation({ summary: 'Submit topic for approval' })
  async submit(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.topicsService.submit(id, actor);
    return successResponse(data, 'Gửi đề tài cho Khoa duyệt thành công');
  }

  @Patch(':id/approve')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Approve submitted topic' })
  async approve(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.topicsService.approve(id, actor);
    return successResponse(data, 'Duyệt đề tài thành công');
  }

  @Patch(':id/reject')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Reject submitted topic' })
  async reject(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RejectTopicDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.topicsService.reject(id, dto, actor);
    return successResponse(data, 'Từ chối đề tài thành công');
  }

  @Patch(':id/publish')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Publish approved topic' })
  async publish(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.topicsService.publish(id, actor);
    return successResponse(data, 'Công bố đề tài thành công');
  }
}
