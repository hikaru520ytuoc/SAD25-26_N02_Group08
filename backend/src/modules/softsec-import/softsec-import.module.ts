import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SoftsecImportController } from './softsec-import.controller';
import { SoftsecImportService } from './softsec-import.service';

@Module({
  imports: [JwtModule],
  controllers: [SoftsecImportController],
  providers: [SoftsecImportService],
})
export class SoftsecImportModule {}
