import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { firstValueFrom } from 'rxjs';
import { EMPLOYEE_SERVICE } from '@app/common';

@Injectable()
export class AuthService {
  constructor(
    @Inject(EMPLOYEE_SERVICE)
    private readonly employeeClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await firstValueFrom(
      this.employeeClient.send('employee.find_by_email', email),
    );

    if (!user) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Email atau password salah.');
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(credentials: { email: string; password: string }) {
    const user = await this.validateUser(credentials.email, credentials.password);

    const payload = {
      sub: user.id,
      userId: user.id,
      employeeCode: user.employeeCode,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Login berhasil.',
      accessToken,
      user,
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch {
      throw new UnauthorizedException('Token sesi tidak valid atau telah kedaluwarsa.');
    }
  }
}
