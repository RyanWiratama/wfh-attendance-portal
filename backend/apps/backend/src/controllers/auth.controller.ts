import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  Inject,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { AUTH_SERVICE, CurrentUser } from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authClient: ClientProxy,
  ) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login karyawan atau HR Admin' })
  @ApiResponse({ status: 200, description: 'Login berhasil, cookie sesi dibuat' })
  async login(
    @Body() credentials: { email: string; password: string },
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await firstValueFrom(
      this.authClient.send('auth.login', credentials),
    );

    // Set JWT in httpOnly cookie
    response.cookie('wfh_session', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return {
      message: result.message,
      user: result.user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout dan bersihkan cookie sesi' })
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('wfh_session');
    return { message: 'Logout berhasil.' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Ambil data pengguna yang sedang login' })
  async me(@CurrentUser() user: any) {
    return user;
  }
}
