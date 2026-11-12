import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttendanceServiceController } from './attendance-service.controller';
import { AttendanceService } from './attendance-service.service';
import { Attendance } from './entities/attendance.entity';
import { AttendanceLog } from './entities/attendance-log.entity';
import { WorkSchedule } from './entities/work-schedule.entity';
import { STORAGE_SERVICE, LocalStorageService } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USERNAME', 'wfh_user'),
        password: config.get<string>('DB_PASSWORD', 'wfh_secret_pass'),
        database: config.get<string>('DB_NAME', 'wfh_attendance'),
        entities: [Attendance, AttendanceLog, WorkSchedule],
        synchronize: true,
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([Attendance, AttendanceLog, WorkSchedule]),
  ],
  controllers: [AttendanceServiceController],
  providers: [
    AttendanceService,
    {
      provide: STORAGE_SERVICE,
      useFactory: () => new LocalStorageService(),
    },
  ],
  exports: [AttendanceService],
})
export class AttendanceServiceModule {}
