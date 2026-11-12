import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeeServiceController } from './employee-service.controller';
import { EmployeeService } from './employee-service.service';
import { Employee } from './entities/employee.entity';

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
        database: config.get<string>('DB_NAME', 'wfh_employee'),
        entities: [Employee],
        synchronize: true, // Auto-sync table for development
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([Employee]),
  ],
  controllers: [EmployeeServiceController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeServiceModule {}
