import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { of } from 'rxjs';
import { AuthService } from './auth-service.service';
import { EMPLOYEE_SERVICE } from '@app/common';

describe('AuthService', () => {
  let service: AuthService;
  let mockEmployeeClient: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockEmployeeClient = {
      send: jest.fn(),
    };
    mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: EMPLOYEE_SERVICE,
          useValue: mockEmployeeClient,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should authenticate user with valid credentials and return accessToken', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass#123', 10);
      mockEmployeeClient.send.mockReturnValue(
        of({
          id: 1,
          employeeCode: 'EMP-0001',
          fullName: 'Budi',
          email: 'budi@company.com',
          passwordHash,
          role: 'EMPLOYEE',
        }),
      );

      const result = await service.login({
        email: 'budi@company.com',
        password: 'CorrectPass#123',
      });

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('budi@company.com');
      expect((result.user as any).passwordHash).toBeUndefined();
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      const passwordHash = await bcrypt.hash('CorrectPass#123', 10);
      mockEmployeeClient.send.mockReturnValue(
        of({
          id: 1,
          email: 'budi@company.com',
          passwordHash,
        }),
      );

      await expect(
        service.login({
          email: 'budi@company.com',
          password: 'WrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
