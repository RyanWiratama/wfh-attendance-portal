import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { EmployeeServiceModule } from './employee-service.module';

async function bootstrap() {
  const port = parseInt(process.env.EMPLOYEE_TCP_PORT || '4002', 10);
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    EmployeeServiceModule,
    {
      transport: Transport.TCP,
      options: {
        host: '0.0.0.0',
        port,
      },
    },
  );

  await app.listen();
  console.log(`[EmployeeService] TCP Microservice listening on port ${port}`);
}
bootstrap();
