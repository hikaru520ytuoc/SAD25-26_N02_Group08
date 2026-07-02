import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [JwtModule],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
