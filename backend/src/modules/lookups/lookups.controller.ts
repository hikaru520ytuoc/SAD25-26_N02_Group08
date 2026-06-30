import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { successResponse } from '../../common/responses/api-response';
import { LookupsService } from './lookups.service';

@ApiTags('Lookups')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('lookups')
export class LookupsController {
  constructor(private readonly lookupsService: LookupsService) {}

  @Get('project-periods')
  @ApiOperation({ summary: 'Lookup project periods' })
  async projectPeriods(@Query('status') status?: string) {
    return successResponse(await this.lookupsService.projectPeriods(status), 'Lấy danh sách đợt đồ án thành công');
  }

  @Get('students')
  async students(@Query('search') search?: string, @Query('projectPeriodId') projectPeriodId?: string) {
    return successResponse(await this.lookupsService.students(search, projectPeriodId), 'Lấy danh sách sinh viên thành công');
  }

  @Get('lecturers')
  async lecturers(@Query('role') role?: string, @Query('search') search?: string, @Query('excludeLecturerId') excludeLecturerId?: string) {
    return successResponse(await this.lookupsService.lecturers(role, search, excludeLecturerId), 'Lấy danh sách giảng viên thành công');
  }

  @Get('supervisors')
  async supervisors(@Query('search') search?: string) {
    return successResponse(await this.lookupsService.supervisors(search), 'Lấy danh sách GVHD thành công');
  }

  @Get('reviewers')
  async reviewers(@Query('search') search?: string, @Query('excludeLecturerId') excludeLecturerId?: string) {
    return successResponse(await this.lookupsService.reviewers(search, excludeLecturerId), 'Lấy danh sách GVPB thành công');
  }

  @Get('topics')
  async topics(@Query('status') status?: string, @Query('projectPeriodId') projectPeriodId?: string) {
    return successResponse(await this.lookupsService.topics(status, projectPeriodId), 'Lấy danh sách đề tài thành công');
  }

  @Get('councils')
  async councils(@Query('status') status?: string, @Query('projectPeriodId') projectPeriodId?: string) {
    return successResponse(await this.lookupsService.councils(status, projectPeriodId), 'Lấy danh sách hội đồng thành công');
  }

  @Get('defense-registrations')
  async defenseRegistrations(@Query('status') status?: string, @Query('projectPeriodId') projectPeriodId?: string) {
    return successResponse(await this.lookupsService.defenseRegistrations(status, projectPeriodId), 'Lấy danh sách hồ sơ bảo vệ thành công');
  }

  @Get('defense-schedules')
  async defenseSchedules(@Query('councilId') councilId?: string, @Query('studentId') studentId?: string, @Query('status') status?: string) {
    return successResponse(await this.lookupsService.defenseSchedules(councilId, studentId, status), 'Lấy danh sách lịch bảo vệ thành công');
  }

  @Get('final-results')
  async finalResults(@Query('resultStatus') resultStatus?: string, @Query('publicationStatus') publicationStatus?: string) {
    return successResponse(await this.lookupsService.finalResults(resultStatus, publicationStatus), 'Lấy danh sách kết quả thành công');
  }

  @Get('archive-records')
  async archiveRecords(@Query('status') status?: string) {
    return successResponse(await this.lookupsService.archiveRecords(status), 'Lấy danh sách hồ sơ lưu trữ thành công');
  }

  @Get('roles')
  async roles() {
    return successResponse(await this.lookupsService.roles(), 'Lấy danh sách vai trò thành công');
  }

  @Get('faculties')
  async faculties() {
    return successResponse(await this.lookupsService.faculties(), 'Lấy danh sách khoa thành công');
  }
}
