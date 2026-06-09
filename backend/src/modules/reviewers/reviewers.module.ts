import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ReviewersController } from './reviewers.controller';
import { ReviewersService } from './reviewers.service';

@Module({
  imports: [JwtModule, AuditLogsModule, NotificationsModule],
  controllers: [ReviewersController],
  providers: [ReviewersService],
  exports: [ReviewersService],
})
export class ReviewersModule {}
