import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MinioService } from './minio.service';

@Module({
  imports: [JwtModule, AuditLogsModule],
  controllers: [FilesController],
  providers: [FilesService, MinioService],
  exports: [FilesService],
})
export class FilesModule {}
