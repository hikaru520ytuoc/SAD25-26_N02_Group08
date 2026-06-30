import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { ScoresModule } from '../scores/scores.module';
import { RecordLockModule } from '../record-lock/record-lock.module';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';

@Module({
  imports: [JwtModule, AuditLogsModule, NotificationsModule, ScoresModule, RecordLockModule],
  controllers: [ResultsController],
  providers: [ResultsService],
})
export class ResultsModule {}
