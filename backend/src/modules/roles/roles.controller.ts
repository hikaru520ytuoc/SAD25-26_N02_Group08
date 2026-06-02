import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { successResponse } from '../../common/responses/api-response';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List roles' })
  async findAll() {
    const data = await this.rolesService.findAll();
    return successResponse(data, 'Lấy danh sách role thành công');
  }

  @Post()
  @ApiOperation({ summary: 'Create role' })
  async create(@Body() dto: CreateRoleDto, @CurrentUser() actor: AuthUser) {
    const data = await this.rolesService.create(dto, actor);
    return successResponse(data, 'Tạo role thành công');
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update role' })
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() actor: AuthUser,
  ) {
    const data = await this.rolesService.update(id, dto, actor);
    return successResponse(data, 'Cập nhật role thành công');
  }
}
