import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          let token: string | null = null;
          if (req && req.cookies) {
            token = req.cookies['wfh_session'];
          }
          if (!token && req && req.headers && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && parts[0] === 'Bearer') {
              token = parts[1];
            }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(
        'JWT_SECRET',
        'wfh-production-super-secret-jwt-key-2026-min-32-chars',
      ),
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub || payload.userId,
      employeeCode: payload.employeeCode,
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
    };
  }
}
