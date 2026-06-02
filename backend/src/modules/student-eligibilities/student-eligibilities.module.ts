import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { StudentEligibilitiesController } from './student-eligibilities.controller';
import { StudentEligibilitiesService } from './student-eligibilities.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [StudentEligibilitiesController],
  providers: [StudentEligibilitiesService],
  exports: [StudentEligibilitiesService],
})
export class StudentEligibilitiesModule {}
