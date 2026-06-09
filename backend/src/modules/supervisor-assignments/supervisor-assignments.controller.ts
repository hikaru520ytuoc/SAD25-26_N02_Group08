import { Controller, Get, Param, ParseUUIDPipe, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { QuerySupervisorAssignmentDto } from './dto/query-supervisor-assignment.dto';
import { SupervisorAssignmentsService } from './supervisor-assignments.service';

@ApiTags('Supervisor Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('supervisor-assignments')
export class SupervisorAssignmentsController {
  constructor(private readonly supervisorAssignmentsService: SupervisorAssignmentsService) {}

  @Get()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Faculty lists supervisor assignments' })
  async findAll(@Query() query: QuerySupervisorAssignmentDto) {
    const data = await this.supervisorAssignmentsService.findAll(query);
    return successResponse(data, 'Lấy danh sách phân công GVHD thành công');
  }

  @Get('my-students')
  @Roles('SUPERVISOR')
  @ApiOperation({ summary: 'Supervisor lists assigned students' })
  async findMyStudents(@CurrentUser() actor: AuthUser, @Query() query: QuerySupervisorAssignmentDto) {
    const data = await this.supervisorAssignmentsService.findMyStudents(actor, query);
    return successResponse(data, 'Lấy danh sách sinh viên hướng dẫn thành công');
  }

  @Get('me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Student gets official supervisor assignment' })
  async findMe(@CurrentUser() actor: AuthUser) {
    const data = await this.supervisorAssignmentsService.findMe(actor);
    return successResponse(data, 'Lấy GVHD chính thức của tôi thành công');
  }

  @Get(':id')
  @Roles('STUDENT', 'SUPERVISOR', 'FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get supervisor assignment detail with ownership check' })
  async findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.supervisorAssignmentsService.findOne(id, actor);
    return successResponse(data, 'Lấy chi tiết phân công GVHD thành công');
  }
}
