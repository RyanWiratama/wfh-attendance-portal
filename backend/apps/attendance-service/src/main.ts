import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AttendanceServiceModule } from './attendance-service.module';

async function bootstrap() {
  const port = parseInt(process.env.ATTENDANCE_TCP_PORT || '4003', 10);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AttendanceServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port,
      },
    },
  );

  await app.listen();
  console.log(`[AttendanceService] TCP Microservice listening on port ${port}`);
}
bootstrap();
