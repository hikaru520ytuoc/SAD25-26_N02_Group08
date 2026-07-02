import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ProjectPeriodRegistrationsController } from './project-period-registrations.controller';
import { ProjectPeriodRegistrationsService } from './project-period-registrations.service';

@Module({
  imports: [JwtModule, AuditLogsModule],
  controllers: [ProjectPeriodRegistrationsController],
  providers: [ProjectPeriodRegistrationsService],
  exports: [ProjectPeriodRegistrationsService],
})
export class ProjectPeriodRegistrationsModule {}
