import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { successResponse } from '../../common/responses/api-response';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check backend and database health' })
  async check() {
    const data = await this.healthService.check();
    return successResponse(data, 'Backend is running');
  }
}
