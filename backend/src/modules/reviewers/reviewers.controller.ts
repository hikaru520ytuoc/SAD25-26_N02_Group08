import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateReviewerAssignmentDto } from './dto/create-reviewer-assignment.dto';
import { CreateReviewerEvaluationDto } from './dto/create-reviewer-evaluation.dto';
import { QueryReviewerAssignmentDto } from './dto/query-reviewer-assignment.dto';
import { UpdateReviewerAssignmentDto } from './dto/update-reviewer-assignment.dto';
import { UpdateReviewerEvaluationDto } from './dto/update-reviewer-evaluation.dto';
import { ReviewersService } from './reviewers.service';

@ApiTags('Reviewers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reviewers')
export class ReviewersController {
  constructor(private readonly reviewersService: ReviewersService) {}

  @Get('assignments')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Faculty gets reviewer assignments' })
  async findAssignments(@Query() query: QueryReviewerAssignmentDto) {
    return successResponse(await this.reviewersService.findAssignments(query), 'Lấy danh sách phân công phản biện thành công');
  }

  @Get('assignments/me')
  @Roles('REVIEWER')
  @ApiOperation({ summary: 'Reviewer gets own assignments' })
  async findMyAssignments(@Query() query: QueryReviewerAssignmentDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.reviewersService.findMyAssignments(actor, query), 'Lấy danh sách phân công của tôi thành công');
  }

  @Get('assignments/:id')
  @Roles('REVIEWER', 'SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN')
  async findAssignment(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.reviewersService.findAssignment(id, actor), 'Lấy chi tiết phân công phản biện thành công');
  }

  @Post('assignments')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async createAssignment(@Body() dto: CreateReviewerAssignmentDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.reviewersService.createAssignment(dto, actor), 'Phân công GVPB thành công');
  }

  @Patch('assignments/:id')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async updateAssignment(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateReviewerAssignmentDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return successResponse(await this.reviewersService.updateAssignment(id, dto, actor), 'Cập nhật phân công phản biện thành công');
  }

  @Post('evaluations')
  @Roles('REVIEWER')
  async createEvaluation(@Body() dto: CreateReviewerEvaluationDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.reviewersService.createEvaluation(dto, actor), 'Gửi nhận xét phản biện thành công');
  }

  @Get('evaluations/:assignmentId')
  @Roles('REVIEWER', 'SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN')
  async getEvaluation(@Param('assignmentId', new ParseUUIDPipe({ version: '4' })) assignmentId: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.reviewersService.getEvaluation(assignmentId, actor), 'Lấy nhận xét phản biện thành công');
  }

  @Patch('evaluations/:id')
  @Roles('REVIEWER')
  async updateEvaluation(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateReviewerEvaluationDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return successResponse(await this.reviewersService.updateEvaluation(id, dto, actor), 'Cập nhật nhận xét phản biện thành công');
  }
}
