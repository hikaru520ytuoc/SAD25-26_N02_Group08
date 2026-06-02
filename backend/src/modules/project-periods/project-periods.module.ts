import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ProjectPeriodsController } from './project-periods.controller';
import { ProjectPeriodsService } from './project-periods.service';

@Module({
  imports: [JwtModule, AuditLogsModule],
  controllers: [ProjectPeriodsController],
  providers: [ProjectPeriodsService],
  exports: [ProjectPeriodsService],
})
export class ProjectPeriodsModule {}
