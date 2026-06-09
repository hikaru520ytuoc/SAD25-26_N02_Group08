import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { DefenseDocumentsController } from './defense-documents.controller';
import { DefenseDocumentsService } from './defense-documents.service';

@Module({
  imports: [JwtModule, AuditLogsModule, NotificationsModule, FilesModule],
  controllers: [DefenseDocumentsController],
  providers: [DefenseDocumentsService],
  exports: [DefenseDocumentsService],
})
export class DefenseDocumentsModule {}
