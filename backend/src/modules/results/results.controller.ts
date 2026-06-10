import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { ConfirmResultDto } from './dto/confirm-result.dto';
import { QueryResultDto } from './dto/query-result.dto';
import { ResultsService } from './results.service';

@ApiTags('Results')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('results')
export class ResultsController {
  constructor(private readonly resultsService: ResultsService) {}

  @Get()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async findAll(@Query() query: QueryResultDto) {
    return successResponse(await this.resultsService.findAll(query), 'Lấy danh sách kết quả thành công');
  }

  @Get('pending-publication')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async pendingPublication() {
    return successResponse(await this.resultsService.pendingPublication(), 'Lấy danh sách kết quả chờ công bố thành công');
  }

  @Get('me')
  @Roles('STUDENT')
  async getMe(@CurrentUser() actor: AuthUser) {
    return successResponse(await this.resultsService.getMe(actor), 'Lấy kết quả của tôi thành công');
  }

  @Get(':id')
  @Roles('STUDENT', 'FACULTY_MANAGER', 'ADMIN')
  async getById(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.resultsService.getById(id, actor), 'Lấy chi tiết kết quả thành công');
  }

  @Post('generate/:defenseRegistrationId')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async generate(@Param('defenseRegistrationId', new ParseUUIDPipe({ version: '4' })) defenseRegistrationId: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.resultsService.generate(defenseRegistrationId, actor), 'Tạo kết quả thành công');
  }

  @Patch(':id/confirm')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async confirm(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: ConfirmResultDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.resultsService.confirm(id, dto, actor), 'Xác nhận kết quả thành công');
  }

  @Patch(':id/publish')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async publish(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.resultsService.publish(id, actor), 'Công bố kết quả thành công');
  }
}
