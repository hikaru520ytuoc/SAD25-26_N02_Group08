import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '../../common/exceptions/app.exception';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecordLockService {
  constructor(private readonly prisma: PrismaService) {}

  async checkProjectRecordLocked(studentId: string, projectPeriodId: string) {
    const lock = await this.prisma.projectRecordLock.findUnique({
      where: { studentId_projectPeriodId: { studentId, projectPeriodId } },
    });
    if (lock) {
      throw new AppException('PROJECT_RECORD_LOCKED', 'Hồ sơ đã khóa, chỉ được tra cứu', HttpStatus.CONFLICT);
    }
  }
}
