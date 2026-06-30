import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { RecordLockModule } from '../record-lock/record-lock.module';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';

@Module({
  imports: [JwtModule, AuditLogsModule, RecordLockModule],
  controllers: [ScoresController],
  providers: [ScoresService],
  exports: [ScoresService],
})
export class ScoresModule {}
