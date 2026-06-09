import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { OutlinesController } from './outlines.controller';
import { OutlinesService } from './outlines.service';

@Module({
  imports: [JwtModule, AuditLogsModule, NotificationsModule, FilesModule],
  controllers: [OutlinesController],
  providers: [OutlinesService],
  exports: [OutlinesService],
})
export class OutlinesModule {}
