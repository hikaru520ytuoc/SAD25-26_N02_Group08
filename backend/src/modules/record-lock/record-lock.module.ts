import { Module } from '@nestjs/common';
import { RecordLockService } from './record-lock.service';

@Module({
  providers: [RecordLockService],
  exports: [RecordLockService],
})
export class RecordLockModule {}
