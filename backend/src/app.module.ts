import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { RolesModule } from './modules/roles/roles.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectPeriodsModule } from './modules/project-periods/project-periods.module';
import { StudentEligibilitiesModule } from './modules/student-eligibilities/student-eligibilities.module';
import { TopicsModule } from './modules/topics/topics.module';
import { TopicRegistrationsModule } from './modules/topic-registrations/topic-registrations.module';
import { SupervisorAssignmentsModule } from './modules/supervisor-assignments/supervisor-assignments.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { FilesModule } from './modules/files/files.module';
import { OutlinesModule } from './modules/outlines/outlines.module';
import { ProjectProgressModule } from './modules/project-progress/project-progress.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.example'],
    }),
    PrismaModule,
    HealthModule,
    AuditLogsModule,
    AuthModule,
    UsersModule,
    RolesModule,
    ProjectPeriodsModule,
    StudentEligibilitiesModule,
    TopicsModule,
    TopicRegistrationsModule,
    SupervisorAssignmentsModule,
    NotificationsModule,
    FilesModule,
    OutlinesModule,
    ProjectProgressModule,
  ],
})
export class AppModule {}
