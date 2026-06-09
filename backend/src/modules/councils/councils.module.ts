import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CouncilsController } from './councils.controller';
import { CouncilsService } from './councils.service';

@Module({
  imports: [JwtModule, AuditLogsModule, NotificationsModule],
  controllers: [CouncilsController],
  providers: [CouncilsService],
  exports: [CouncilsService],
})
export class CouncilsModule {}
