import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { QueryDefenseDocumentDto } from './dto/query-defense-document.dto';
import { RequestDefenseDocumentSupplementDto } from './dto/request-defense-document-supplement.dto';
import { ResubmitDefenseDocumentDto } from './dto/resubmit-defense-document.dto';
import { SubmitDefenseDocumentDto } from './dto/submit-defense-document.dto';
import { DefenseDocumentsService } from './defense-documents.service';

@ApiTags('Sprint 6 - Defense Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('defense-documents')
export class DefenseDocumentsController {
  constructor(private readonly service: DefenseDocumentsService) {}

  @Get('me')
  @Roles('STUDENT')
  async findMe(@CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findMe(actor), 'Lấy hồ sơ bảo vệ của sinh viên thành công');
  }

  @Get('secretary')
  @Roles('COUNCIL_SECRETARY', 'ADMIN')
  async findSecretary(@Query() query: QueryDefenseDocumentDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findSecretary(actor, query), 'Lấy hồ sơ bảo vệ cần kiểm tra thành công');
  }

  @Get(':id')
  @Roles('STUDENT', 'COUNCIL_MEMBER', 'COUNCIL_SECRETARY', 'FACULTY_MANAGER', 'ADMIN')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.findOne(id, actor), 'Lấy chi tiết hồ sơ bảo vệ thành công');
  }

  @Post(':scheduleId/submit')
  @Roles('STUDENT')
  async submit(@Param('scheduleId', new ParseUUIDPipe({ version: '4' })) scheduleId: string, @Body() dto: SubmitDefenseDocumentDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.submit(scheduleId, dto, actor), 'Nộp hồ sơ bảo vệ thành công');
  }

  @Patch(':id/request-supplement')
  @Roles('COUNCIL_SECRETARY', 'ADMIN')
  async requestSupplement(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: RequestDefenseDocumentSupplementDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.requestSupplement(id, dto, actor), 'Yêu cầu bổ sung hồ sơ thành công');
  }

  @Patch(':id/resubmit')
  @Roles('STUDENT')
  async resubmit(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: ResubmitDefenseDocumentDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.resubmit(id, dto, actor), 'Bổ sung hồ sơ bảo vệ thành công');
  }

  @Patch(':id/approve')
  @Roles('COUNCIL_SECRETARY', 'ADMIN')
  async approve(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.service.approve(id, actor), 'Xác nhận hồ sơ hợp lệ thành công');
  }
}
