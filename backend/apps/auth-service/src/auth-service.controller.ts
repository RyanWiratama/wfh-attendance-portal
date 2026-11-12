import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth-service.service';

@Controller()
export class AuthServiceController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.login')
  async login(@Payload() credentials: { email: string; password: string }) {
    return this.authService.login(credentials);
  }

  @MessagePattern('auth.validate_token')
  async validateToken(@Payload() token: string) {
    return this.authService.validateToken(token);
  }
}
