import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Skip if context is not HTTP (e.g. Microservice TCP)
    if (!response || typeof response.status !== 'function') {
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: (exception as any)?.message || 'Internal Server Error' };

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      error: typeof message === 'string' ? message : (message as any)?.message || message,
    });
  }
}
