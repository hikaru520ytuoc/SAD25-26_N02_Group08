import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { TopicRegistrationsController } from './topic-registrations.controller';
import { TopicRegistrationsService } from './topic-registrations.service';

@Module({
  imports: [JwtModule, AuditLogsModule, NotificationsModule],
  controllers: [TopicRegistrationsController],
  providers: [TopicRegistrationsService],
  exports: [TopicRegistrationsService],
})
export class TopicRegistrationsModule {}
