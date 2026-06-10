import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { ApproveArchiveRecordDto } from './dto/approve-archive-record.dto';
import { CompleteArchiveRecordDto } from './dto/complete-archive-record.dto';
import { CreateArchiveRecordDto } from './dto/create-archive-record.dto';
import { QueryArchiveRecordDto } from './dto/query-archive-record.dto';
import { RequestArchiveSupplementDto } from './dto/request-archive-supplement.dto';
import { ResubmitArchiveRecordDto } from './dto/resubmit-archive-record.dto';
import { ArchivesService } from './archives.service';

@ApiTags('Sprint 8 - Archives')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('archives')
export class ArchivesController {
  constructor(private readonly service: ArchivesService) {}

  @Get('me')
  @Roles('STUDENT')
  async findMe(@CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findMe(actor), 'Lấy hồ sơ lưu trữ của sinh viên thành công');
  }

  @Get()
  @Roles('ARCHIVE_STAFF', 'FACULTY_MANAGER', 'ADMIN')
  async findAll(@Query() query: QueryArchiveRecordDto) {
    return successResponse(await this.service.findAll(query), 'Lấy danh sách hồ sơ lưu trữ thành công');
  }

  @Get(':id')
  @Roles('STUDENT', 'ARCHIVE_STAFF', 'FACULTY_MANAGER', 'ADMIN')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findOne(id, actor), 'Lấy chi tiết hồ sơ lưu trữ thành công');
  }

  @Post()
  @Roles('STUDENT')
  async create(@Body() dto: CreateArchiveRecordDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.create(dto, actor), 'Nộp hồ sơ lưu trữ thành công');
  }

  @Patch(':id/resubmit')
  @Roles('STUDENT')
  async resubmit(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: ResubmitArchiveRecordDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.resubmit(id, dto, actor), 'Bổ sung hồ sơ lưu trữ thành công');
  }

  @Patch(':id/request-supplement')
  @Roles('ARCHIVE_STAFF', 'FACULTY_MANAGER', 'ADMIN')
  async requestSupplement(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: RequestArchiveSupplementDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.requestSupplement(id, dto, actor), 'Yêu cầu bổ sung hồ sơ thành công');
  }

  @Patch(':id/approve')
  @Roles('ARCHIVE_STAFF', 'FACULTY_MANAGER', 'ADMIN')
  async approve(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: ApproveArchiveRecordDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.approve(id, dto, actor), 'Duyệt hồ sơ lưu trữ thành công');
  }

  @Patch(':id/complete')
  @Roles('ARCHIVE_STAFF', 'FACULTY_MANAGER', 'ADMIN')
  async complete(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: CompleteArchiveRecordDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.complete(id, dto, actor), 'Hoàn tất lưu trữ thành công');
  }

  @Patch(':id/lock')
  @Roles('ARCHIVE_STAFF', 'FACULTY_MANAGER', 'ADMIN')
  async lock(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.lock(id, actor), 'Khóa hồ sơ thành công');
  }
}
