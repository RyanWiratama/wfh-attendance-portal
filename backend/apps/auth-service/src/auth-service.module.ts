import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthServiceController } from './auth-service.controller';
import { AuthService } from './auth-service.service';
import { EMPLOYEE_SERVICE } from '@app/common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>(
          'JWT_SECRET',
          'wfh-production-super-secret-jwt-key-2026-min-32-chars',
        ),
        signOptions: {
          expiresIn: (config.get('JWT_EXPIRATION') || 86400) as any,
        },
      }),
    }),
    ClientsModule.registerAsync([
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
    ]),
  ],
  controllers: [AuthServiceController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthServiceModule {}
