import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { StudentEligibilitiesController } from './student-eligibilities.controller';
import { StudentEligibilitiesService } from './student-eligibilities.service';

@Module({
  imports: [JwtModule, AuditLogsModule],
  controllers: [StudentEligibilitiesController],
  providers: [StudentEligibilitiesService],
  exports: [StudentEligibilitiesService],
})
export class StudentEligibilitiesModule {}
