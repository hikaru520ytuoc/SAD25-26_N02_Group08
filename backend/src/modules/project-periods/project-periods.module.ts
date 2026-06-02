import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ProjectPeriodsController } from './project-periods.controller';
import { ProjectPeriodsService } from './project-periods.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [ProjectPeriodsController],
  providers: [ProjectPeriodsService],
  exports: [ProjectPeriodsService],
})
export class ProjectPeriodsModule {}
