import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { ApproveRevisionDto } from './dto/approve-revision.dto';
import { CreateRevisionRequestDto } from './dto/create-revision-request.dto';
import { CreateRevisionSubmissionDto } from './dto/create-revision-submission.dto';
import { QueryRevisionDto } from './dto/query-revision.dto';
import { RequestRevisionChangesDto } from './dto/request-revision-changes.dto';
import { RevisionsService } from './revisions.service';

@ApiTags('Sprint 8 - Revisions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('revisions')
export class RevisionsController {
  constructor(private readonly service: RevisionsService) {}

  @Get('me')
  @Roles('STUDENT')
  async findMe(@CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findMe(actor), 'Lấy yêu cầu chỉnh sửa của sinh viên thành công');
  }

  @Get()
  @Roles('FACULTY_MANAGER', 'COUNCIL_SECRETARY', 'SUPERVISOR', 'ADMIN')
  async findAll(@Query() query: QueryRevisionDto) {
    return successResponse(await this.service.findAll(query), 'Lấy danh sách yêu cầu chỉnh sửa thành công');
  }

  @Get(':id')
  @Roles('STUDENT', 'FACULTY_MANAGER', 'COUNCIL_SECRETARY', 'SUPERVISOR', 'ADMIN')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findOne(id, actor), 'Lấy chi tiết yêu cầu chỉnh sửa thành công');
  }

  @Post()
  @Roles('FACULTY_MANAGER', 'COUNCIL_SECRETARY', 'ADMIN')
  async create(@Body() dto: CreateRevisionRequestDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.create(dto, actor), 'Tạo yêu cầu chỉnh sửa thành công');
  }

  @Post(':id/submissions')
  @Roles('STUDENT')
  async submit(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: CreateRevisionSubmissionDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.createSubmission(id, dto, actor), 'Nộp bản chỉnh sửa thành công');
  }

  @Get(':id/submissions')
  @Roles('STUDENT', 'FACULTY_MANAGER', 'COUNCIL_SECRETARY', 'SUPERVISOR', 'ADMIN')
  async submissions(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.submissions(id, actor), 'Lấy lịch sử nộp chỉnh sửa thành công');
  }

  @Patch(':id/approve')
  @Roles('FACULTY_MANAGER', 'COUNCIL_SECRETARY', 'SUPERVISOR', 'ADMIN')
  async approve(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: ApproveRevisionDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.approve(id, dto, actor), 'Duyệt bản chỉnh sửa thành công');
  }

  @Patch(':id/request-changes')
  @Roles('FACULTY_MANAGER', 'COUNCIL_SECRETARY', 'SUPERVISOR', 'ADMIN')
  async requestChanges(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: RequestRevisionChangesDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.requestChanges(id, dto, actor), 'Yêu cầu chỉnh sửa lại thành công');
  }
}
