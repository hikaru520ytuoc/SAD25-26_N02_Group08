import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { AddCouncilMemberDto } from './dto/add-council-member.dto';
import { CreateCouncilDto } from './dto/create-council.dto';
import { QueryCouncilDto } from './dto/query-council.dto';
import { UpdateCouncilMemberDto } from './dto/update-council-member.dto';
import { UpdateCouncilDto } from './dto/update-council.dto';
import { CouncilsService } from './councils.service';

@ApiTags('Sprint 6 - Councils')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('councils')
export class CouncilsController {
  constructor(private readonly councilsService: CouncilsService) {}

  @Get()
  @Roles('FACULTY_MANAGER', 'ADMIN', 'COUNCIL_MEMBER', 'COUNCIL_SECRETARY')
  @ApiOperation({ summary: 'List defense councils' })
  async findAll(@Query() query: QueryCouncilDto) {
    return successResponse(await this.councilsService.findAll(query), 'Lấy danh sách hội đồng thành công');
  }

  @Get(':id')
  @Roles('FACULTY_MANAGER', 'ADMIN', 'COUNCIL_MEMBER', 'COUNCIL_SECRETARY')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return successResponse(await this.councilsService.findOne(id), 'Lấy chi tiết hội đồng thành công');
  }

  @Post()
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async create(@Body() dto: CreateCouncilDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.councilsService.create(dto, actor), 'Tạo hội đồng thành công');
  }

  @Patch(':id')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async update(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: UpdateCouncilDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.councilsService.update(id, dto, actor), 'Cập nhật hội đồng thành công');
  }

  @Post(':id/members')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async addMember(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string, @Body() dto: AddCouncilMemberDto, @CurrentUser() actor: AuthUser) {
    return successResponse(await this.councilsService.addMember(id, dto, actor), 'Thêm thành viên hội đồng thành công');
  }

  @Patch(':id/members/:memberId')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async updateMember(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('memberId', new ParseUUIDPipe({ version: '4' })) memberId: string,
    @Body() dto: UpdateCouncilMemberDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return successResponse(await this.councilsService.updateMember(id, memberId, dto, actor), 'Cập nhật thành viên hội đồng thành công');
  }

  @Delete(':id/members/:memberId')
  @Roles('FACULTY_MANAGER', 'ADMIN')
  async removeMember(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Param('memberId', new ParseUUIDPipe({ version: '4' })) memberId: string,
    @CurrentUser() actor: AuthUser,
  ) {
    return successResponse(await this.councilsService.removeMember(id, memberId, actor), 'Xóa thành viên hội đồng thành công');
  }
}
