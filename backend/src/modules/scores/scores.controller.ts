import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateReviewerScoreDto } from './dto/create-reviewer-score.dto';
import { CreateSupervisorScoreDto } from './dto/create-supervisor-score.dto';
import { UpdateReviewerScoreDto } from './dto/update-reviewer-score.dto';
import { UpdateSupervisorScoreDto } from './dto/update-supervisor-score.dto';
import { ScoresService } from './scores.service';

@ApiTags('Scores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('scores')
export class ScoresController {
  constructor(private readonly scoresService: ScoresService) {}

  @Post('supervisor')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Supervisor creates or updates supervisor score' })
  async createSupervisorScore(@Body() dto: CreateSupervisorScoreDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.scoresService.createSupervisorScore(dto, actor), 'Lưu điểm hướng dẫn thành công');
  }

  @Patch('supervisor/:id')
  @Roles('SUPERVISOR')
  async updateSupervisorScore(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateSupervisorScoreDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.scoresService.updateSupervisorScore(id, dto, actor), 'Cập nhật điểm hướng dẫn thành công');
  }

  @Get('supervisor/:defenseRegistrationId')
  @Roles('STUDENT', 'SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN')
  async getSupervisorScore(@Param('defenseRegistrationId', new ParseUUIDPipe({ version: '4' })) defenseRegistrationId: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.scoresService.getSupervisorScore(defenseRegistrationId, actor), 'Lấy điểm hướng dẫn thành công');
  }

  @Post('reviewer')
  @Roles('REVIEWER')
  async createReviewerScore(@Body() dto: CreateReviewerScoreDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.scoresService.createReviewerScore(dto, actor), 'Lưu điểm phản biện thành công');
  }

  @Patch('reviewer/:id')
  @Roles('REVIEWER')
  async updateReviewerScore(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateReviewerScoreDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.scoresService.updateReviewerScore(id, dto, actor), 'Cập nhật điểm phản biện thành công');
  }

  @Get('reviewer/:reviewerAssignmentId')
  @Roles('STUDENT', 'SUPERVISOR', 'REVIEWER', 'FACULTY_MANAGER', 'ADMIN')
  async getReviewerScore(@Param('reviewerAssignmentId', new ParseUUIDPipe({ version: '4' })) reviewerAssignmentId: string, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.scoresService.getReviewerScore(reviewerAssignmentId, actor), 'Lấy điểm phản biện thành công');
  }
}
