import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DefenseSchedulesController } from './defense-schedules.controller';
import { DefenseSchedulesService } from './defense-schedules.service';

@Module({
  imports: [JwtModule, AuditLogsModule, NotificationsModule],
  controllers: [DefenseSchedulesController],
  providers: [DefenseSchedulesService],
  exports: [DefenseSchedulesService],
})
export class DefenseSchedulesModule {}
