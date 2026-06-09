import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SupervisorAssignmentsController } from './supervisor-assignments.controller';
import { SupervisorAssignmentsService } from './supervisor-assignments.service';

@Module({
  imports: [JwtModule],
  controllers: [SupervisorAssignmentsController],
  providers: [SupervisorAssignmentsService],
  exports: [SupervisorAssignmentsService],
})
export class SupervisorAssignmentsModule {}
