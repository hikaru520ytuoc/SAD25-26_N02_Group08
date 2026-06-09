import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { FacultyAssignSupervisorDto } from './dto/faculty-assign-supervisor.dto';
import { FacultyConfirmRegistrationDto } from './dto/faculty-confirm-registration.dto';
import { FacultyRejectRegistrationDto } from './dto/faculty-reject-registration.dto';
import { ProposeNewTopicDto } from './dto/propose-new-topic.dto';
import { QueryTopicRegistrationDto } from './dto/query-topic-registration.dto';
import { RegisterExistingTopicDto } from './dto/register-existing-topic.dto';
import { SupervisorResponseDto } from './dto/supervisor-response.dto';
import { TopicRegistrationsService } from './topic-registrations.service';

@ApiTags('Topic Registrations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('topic-registrations')
export class TopicRegistrationsController {
  constructor(private readonly topicRegistrationsService: TopicRegistrationsService) {}

  @Get('me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get current student topic registrations' })
  async findMe(@CurrentUser() actor: AuthUser) {
    const data = await this.topicRegistrationsService.findMe(actor);
    return successResponse(data, 'Lấy đăng ký đề tài của tôi thành công');
  }

  @Get('supervisors')
  @Roles('STUDENT', 'FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'List lecturers for supervisor selection' })
  async listSupervisors() {
    const data = await this.topicRegistrationsService.listSupervisors();
    return successResponse(data, 'Lấy danh sách GVHD thành công');
  }

  @Get('supervisor/pending')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'List pending supervisor requests for current supervisor' })
  async findSupervisorPending(@CurrentUser() actor: AuthUser) {
    const data = await this.topicRegistrationsService.findSupervisorPending(actor);
    return successResponse(data, 'Lấy yêu cầu hướng dẫn thành công');
  }

  @Get('faculty/pending')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'List registrations pending faculty processing' })
  async findFacultyPending(@Query() query: QueryTopicRegistrationDto) {
    const data = await this.topicRegistrationsService.findFacultyPending(query);
    return successResponse(data, 'Lấy đăng ký chờ Khoa xử lý thành công');
  }

  @Get()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'List all topic registrations' })
  async findAll(@Query() query: QueryTopicRegistrationDto) {
    const data = await this.topicRegistrationsService.findAll(query);
    return successResponse(data, 'Lấy danh sách đăng ký đề tài thành công');
  }

  @Get(':id')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get topic registration detail' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.topicRegistrationsService.findOne(id);
    return successResponse(data, 'Lấy chi tiết đăng ký đề tài thành công');
  }

  @Post('register-existing')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Register an existing published topic' })
  async registerExisting(@Body() dto: RegisterExistingTopicDto, @CurrentUser() actor: AuthUser) {
    const data = await this.topicRegistrationsService.registerExisting(dto, actor);
    return successResponse(data, 'Đăng ký đề tài có sẵn thành công');
  }

  @Post('propose-new')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Propose a new topic' })
  async proposeNew(@Body() dto: ProposeNewTopicDto, @CurrentUser() actor: AuthUser) {
    const data = await this.topicRegistrationsService.proposeNew(dto, actor);
    return successResponse(data, 'Đề xuất đề tài mới thành công');
  }

  @Patch(':id/cancel')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Cancel current student registration before official assignment' })
  async cancel(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.topicRegistrationsService.cancel(id, actor);
    return successResponse(data, 'Hủy đăng ký đề tài thành công');
  }

  @Patch(':id/supervisor/accept')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Supervisor accepts requested supervision' })
  async supervisorAccept(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: SupervisorResponseDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.topicRegistrationsService.supervisorAccept(id, dto, actor);
    return successResponse(data, 'Đồng ý hướng dẫn thành công');
  }

  @Patch(':id/supervisor/reject')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Supervisor rejects requested supervision' })
  async supervisorReject(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: SupervisorResponseDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.topicRegistrationsService.supervisorReject(id, dto, actor);
    return successResponse(data, 'Từ chối hướng dẫn thành công');
  }

  @Patch(':id/faculty/assign-supervisor')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Faculty assigns supervisor for a registration' })
  async facultyAssignSupervisor(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: FacultyAssignSupervisorDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.topicRegistrationsService.facultyAssignSupervisor(id, dto, actor);
    return successResponse(data, 'Phân công GVHD thành công');
  }

  @Patch(':id/faculty/confirm')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Faculty confirms official topic and supervisor' })
  async facultyConfirm(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: FacultyConfirmRegistrationDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.topicRegistrationsService.facultyConfirm(id, dto, actor);
    return successResponse(data, 'Xác nhận đề tài và GVHD chính thức thành công');
  }

  @Patch(':id/faculty/reject')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Faculty rejects topic registration/proposal' })
  async facultyReject(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: FacultyRejectRegistrationDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.topicRegistrationsService.facultyReject(id, dto, actor);
    return successResponse(data, 'Từ chối đăng ký đề tài thành công');
  }
}
