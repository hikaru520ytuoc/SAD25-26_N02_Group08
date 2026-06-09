import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ScoresController } from './scores.controller';
import { ScoresService } from './scores.service';

@Module({
  imports: [JwtModule, AuditLogsModule],
  controllers: [ScoresController],
  providers: [ScoresService],
})
export class ScoresModule {}
