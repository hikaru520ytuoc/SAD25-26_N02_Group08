import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { FilesModule } from '../files/files.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ProjectProgressController } from './project-progress.controller';
import { ProjectProgressService } from './project-progress.service';

@Module({
  imports: [JwtModule, AuditLogsModule, NotificationsModule, FilesModule],
  controllers: [ProjectProgressController],
  providers: [ProjectProgressService],
})
export class ProjectProgressModule {}
