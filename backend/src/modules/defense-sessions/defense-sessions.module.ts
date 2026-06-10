import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { DefenseSessionsController } from './defense-sessions.controller';
import { DefenseSessionsService } from './defense-sessions.service';

@Module({
  imports: [JwtModule, AuditLogsModule],
  controllers: [DefenseSessionsController],
  providers: [DefenseSessionsService],
})
export class DefenseSessionsModule {}
