import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateOutlineDto } from './dto/create-outline.dto';
import { QueryOutlineDto } from './dto/query-outline.dto';
import { RequestOutlineRevisionDto } from './dto/request-outline-revision.dto';
import { ResubmitOutlineDto } from './dto/resubmit-outline.dto';
import { OutlinesService } from './outlines.service';

@ApiTags('Outlines')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('outlines')
export class OutlinesController {
  constructor(private readonly outlinesService: OutlinesService) {}

  @Get('me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get current student outline' })
  async findMe(@CurrentUser() actor: AuthUser) {
    const data = await this.outlinesService.findMe(actor);
    return successResponse(data, 'Lấy đề cương của tôi thành công');
  }

  @Get('supervisor')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Get outlines of students supervised by current supervisor' })
  async findSupervisor(@Query() query: QueryOutlineDto, @CurrentUser() actor: AuthUser) {
    const data = await this.outlinesService.findSupervisor(actor, query);
    return successResponse(data, 'Lấy danh sách đề cương cần duyệt thành công');
  }

  @Get()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get all outlines for faculty/admin overview' })
  async findAll(@Query() query: QueryOutlineDto) {
    const data = await this.outlinesService.findAll(query);
    return successResponse(data, 'Lấy danh sách đề cương thành công');
  }

  @Get(':id')
  @Roles('STUDENT', 'SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get outline detail with ownership check' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.outlinesService.findOne(id, actor);
    return successResponse(data, 'Lấy chi tiết đề cương thành công');
  }

  @Get(':id/history')
  @Roles('STUDENT', 'SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get outline submission history' })
  async getHistory(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.outlinesService.getHistory(id, actor);
    return successResponse(data, 'Lấy lịch sử đề cương thành công');
  }

  @Post()
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Submit outline for current official assignment' })
  async create(@Body() dto: CreateOutlineDto, @CurrentUser() actor: AuthUser) {
    const data = await this.outlinesService.create(dto, actor);
    return successResponse(data, 'Nộp đề cương thành công');
  }

  @Patch(':id/resubmit')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Resubmit outline after supervisor requests revision' })
  async resubmit(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: ResubmitOutlineDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.outlinesService.resubmit(id, dto, actor);
    return successResponse(data, 'Nộp lại đề cương thành công');
  }

  @Patch(':id/approve')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Supervisor approves outline' })
  async approve(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    const data = await this.outlinesService.approve(id, actor);
    return successResponse(data, 'Duyệt đề cương thành công');
  }

  @Patch(':id/request-revision')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Supervisor requests outline revision' })
  async requestRevision(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: RequestOutlineRevisionDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.outlinesService.requestRevision(id, dto, actor);
    return successResponse(data, 'Yêu cầu chỉnh sửa đề cương thành công');
  }
}
