import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { APP_GUARD } from '@nestjs/core';
import {
  AUTH_SERVICE,
  EMPLOYEE_SERVICE,
  ATTENDANCE_SERVICE,
  STORAGE_SERVICE,
  LocalStorageService,
  RolesGuard,
} from '@app/common';
import { AuthController } from './controllers/auth.controller';
import { EmployeesController } from './controllers/employees.controller';
import { AttendancesController } from './controllers/attendances.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_SECRET',
          'wfh-production-super-secret-jwt-key-2026-min-32-chars',
        ),
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => [
        {
          ttl: 60000,
          limit: 100, // 100 requests per minute
        },
      ],
    }),
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('AUTH_TCP_HOST', 'localhost'),
            port: config.get<number>('AUTH_TCP_PORT', 4001),
          },
        }),
      },
      {
        name: EMPLOYEE_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('EMPLOYEE_TCP_HOST', 'localhost'),
            port: config.get<number>('EMPLOYEE_TCP_PORT', 4002),
          },
        }),
      },
      {
        name: ATTENDANCE_SERVICE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.TCP,
          options: {
            host: config.get<string>('ATTENDANCE_TCP_HOST', 'localhost'),
            port: config.get<number>('ATTENDANCE_TCP_PORT', 4003),
          },
        }),
      },
    ]),
  ],
  controllers: [AuthController, EmployeesController, AttendancesController],
  providers: [
    JwtStrategy,
    RolesGuard,
    {
      provide: STORAGE_SERVICE,
      useFactory: () => new LocalStorageService(),
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
