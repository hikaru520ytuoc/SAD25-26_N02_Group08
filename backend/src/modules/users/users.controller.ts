import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { AssignRolesDto } from './dto/assign-roles.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users for admin' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const data = await this.usersService.findAll({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      search,
    });
    return successResponse(data, 'Lấy danh sách người dùng thành công');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user detail for admin' })
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.usersService.findOne(id);
    return successResponse(data, 'Lấy thông tin người dùng thành công');
  }

  @Post()
  @ApiOperation({ summary: 'Create user for admin' })
  async create(@Body() dto: CreateUserDto, @CurrentUser() actor: AuthUser) {
    const data = await this.usersService.create(dto, actor);
    return successResponse(data, 'Tạo người dùng thành công');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user for admin' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.usersService.update(id, dto, actor);
    return successResponse(data, 'Cập nhật người dùng thành công');
  }

  @Patch(':id/lock')
  @ApiOperation({ summary: 'Lock user account' })
  async lock(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.usersService.lock(id, actor);
    return successResponse(data, 'Khóa tài khoản thành công');
  }

  @Patch(':id/unlock')
  @ApiOperation({ summary: 'Unlock user account' })
  async unlock(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.usersService.unlock(id, actor);
    return successResponse(data, 'Mở khóa tài khoản thành công');
  }

  @Patch(':id/roles')
  @ApiOperation({ summary: 'Assign roles to user' })
  async assignRoles(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AssignRolesDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.usersService.assignRoles(id, dto, actor);
    return successResponse(data, 'Gán role cho người dùng thành công');
  }
}
