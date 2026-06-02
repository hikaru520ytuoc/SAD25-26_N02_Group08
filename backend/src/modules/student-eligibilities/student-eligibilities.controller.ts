import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateStudentEligibilityDto } from './dto/create-student-eligibility.dto';
import { QueryStudentEligibilityDto } from './dto/query-student-eligibility.dto';
import { UpdateStudentEligibilityDto } from './dto/update-student-eligibility.dto';
import { StudentEligibilitiesService } from './student-eligibilities.service';

@ApiTags('Student Eligibilities')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('student-eligibilities')
export class StudentEligibilitiesController {
  constructor(private readonly service: StudentEligibilitiesService) {}

  @Get()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'List student eligibilities' })
  async findAll(@Query() query: QueryStudentEligibilityDto) {
    const data = await this.service.findAll(query);
    return successResponse(data, 'Lấy danh sách sinh viên đủ điều kiện thành công');
  }

  @Get('me')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get current student eligibility records' })
  async findMe(@CurrentUser() actor: AuthUser) {
    const data = await this.service.findMe(actor);
    return successResponse(data, 'Lấy trạng thái đủ điều kiện của sinh viên thành công');
  }

  @Get(':id')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Get student eligibility detail' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.service.findOne(id);
    return successResponse(data, 'Lấy chi tiết đủ điều kiện thành công');
  }

  @Post()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Create student eligibility record' })
  async create(@Body() dto: CreateStudentEligibilityDto, @CurrentUser() actor: AuthUser) {
    const data = await this.service.create(dto, actor);
    return successResponse(data, 'Thêm sinh viên vào danh sách đủ điều kiện thành công');
  }

  @Patch(':id')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  @ApiOperation({ summary: 'Update student eligibility record' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateStudentEligibilityDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.service.update(id, dto, actor);
    return successResponse(data, 'Cập nhật trạng thái đủ điều kiện thành công');
  }
}
