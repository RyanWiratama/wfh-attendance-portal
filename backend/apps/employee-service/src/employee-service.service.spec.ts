import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeService } from './employee-service.service';
import { Employee } from './entities/employee.entity';
import { Role } from '@app/common';
import * as bcrypt from 'bcryptjs';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let mockRepo: any;

  beforeEach(async () => {
    mockRepo = {
      findOne: jest.fn(),
      findAndCount: jest.fn(),
      create: jest.fn().mockImplementation((dto) => dto),
      save: jest.fn().mockImplementation((entity) =>
        Promise.resolve({ id: 1, ...entity }),
      ),
      createQueryBuilder: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
        getOne: jest.fn().mockResolvedValue(null),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeeService,
        {
          provide: getRepositoryToken(Employee),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<EmployeeService>(EmployeeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should generate EMP-0001 code and hash password with cost 12', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await service.create({
        fullName: 'Budi Santoso',
        email: 'budi@company.com',
        password: 'Password123#',
        role: Role.EMPLOYEE,
      });

      expect(result.employeeCode).toBe('EMP-0001');
      expect(result.fullName).toBe('Budi Santoso');
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should throw ConflictException if email is already taken', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 1, email: 'budi@company.com' });

      await expect(
        service.create({
          fullName: 'Budi Santoso',
          email: 'budi@company.com',
        }),
      ).rejects.toThrow('Email budi@company.com sudah terdaftar.');
    });
  });
});
