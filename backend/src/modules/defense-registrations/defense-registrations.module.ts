import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RecordLockModule } from '../record-lock/record-lock.module';
import { DefenseRegistrationsController } from './defense-registrations.controller';
import { DefenseRegistrationsService } from './defense-registrations.service';

@Module({
  imports: [JwtModule, AuditLogsModule, NotificationsModule, FilesModule, RecordLockModule],
  controllers: [DefenseRegistrationsController],
  providers: [DefenseRegistrationsService],
  exports: [DefenseRegistrationsService],
})
export class DefenseRegistrationsModule {}
