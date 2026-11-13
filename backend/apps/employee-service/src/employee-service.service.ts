import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Employee } from './entities/employee.entity';
import { Role, PaginatedResultDto } from '@app/common';

@Injectable()
export class EmployeeService implements OnModuleInit {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepo: Repository<Employee>,
  ) {}

  async onModuleInit() {
    await this.ensureSeedData();
  }

  private async ensureSeedData() {
    try {
      const admin = await this.employeeRepo.findOne({
        where: { email: 'admin@company.com' },
      });
      if (!admin) {
        const adminPassHash = await bcrypt.hash('AdminWFH#2026', 12);
        await this.employeeRepo.save(
          this.employeeRepo.create({
            employeeCode: 'EMP-0001',
            fullName: 'HR Administrator',
            email: 'admin@company.com',
            passwordHash: adminPassHash,
            role: Role.ADMIN,
            department: 'Human Resources',
            position: 'HR Manager',
            workStartTime: '08:00:00',
            workEndTime: '17:00:00',
            isDeleted: false,
          }),
        );
      } else if (!admin.workStartTime || !admin.workEndTime) {
        admin.workStartTime = admin.workStartTime || '08:00:00';
        admin.workEndTime = admin.workEndTime || '17:00:00';
        await this.employeeRepo.save(admin);
      }

      const budi = await this.employeeRepo.findOne({
        where: { email: 'budi@company.com' },
      });
      if (!budi) {
        const budiPassHash = await bcrypt.hash('BudiWFH#2026', 12);
        await this.employeeRepo.save(
          this.employeeRepo.create({
            employeeCode: 'EMP-0002',
            fullName: 'Budi Santoso',
            email: 'budi@company.com',
            passwordHash: budiPassHash,
            role: Role.EMPLOYEE,
            department: 'Engineering',
            position: 'Software Engineer',
            workStartTime: '08:00:00',
            workEndTime: '17:00:00',
            isDeleted: false,
          }),
        );
      } else if (!budi.workStartTime || !budi.workEndTime) {
        budi.workStartTime = budi.workStartTime || '08:00:00';
        budi.workEndTime = budi.workEndTime || '17:00:00';
        await this.employeeRepo.save(budi);
      }
    } catch (err) {
      // Ignore during initial table creation or sync
    }
  }

  async create(data: {
    fullName: string;
    email: string;
    password?: string;
    role?: Role;
    department?: string;
    position?: string;
    workStartTime?: string;
    workEndTime?: string;
  }): Promise<Omit<Employee, 'passwordHash'>> {
    const existing = await this.employeeRepo.findOne({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existing) {
      throw new ConflictException(`Email ${data.email} sudah terdaftar.`);
    }

    const employeeCode = await this.generateNextEmployeeCode();
    const defaultPassword = data.password || 'WFH#2026';
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    const employee = this.employeeRepo.create({
      employeeCode,
      fullName: data.fullName.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: data.role || Role.EMPLOYEE,
      department: data.department,
      position: data.position,
      workStartTime: data.workStartTime || '08:00:00',
      workEndTime: data.workEndTime || '17:00:00',
      isDeleted: false,
    });

    const saved = await this.employeeRepo.save(employee);
    const { passwordHash: _, ...result } = saved;
    return result as Omit<Employee, 'passwordHash'>;
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
  }): Promise<PaginatedResultDto<Omit<Employee, 'passwordHash'>>> {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * pageSize;

    const qb = this.employeeRepo.createQueryBuilder('e')
      .where('e.isDeleted = :isDeleted', { isDeleted: false });

    if (query.search) {
      const searchPattern = `%${query.search.trim()}%`;
      qb.andWhere(
        '(e.fullName LIKE :search OR e.employeeCode LIKE :search OR e.email LIKE :search)',
        { search: searchPattern },
      );
    }

    if (query.department) {
      qb.andWhere('e.department = :dept', { dept: query.department.trim() });
    }

    qb.orderBy('e.id', 'DESC').skip(skip).take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    const sanitizedItems = items.map(({ passwordHash: _, ...rest }) => rest);

    return {
      items: sanitizedItems as Omit<Employee, 'passwordHash'>[],
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async findById(id: number): Promise<Omit<Employee, 'passwordHash'>> {
    const employee = await this.employeeRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!employee) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan.`);
    }
    const { passwordHash: _, ...result } = employee;
    return result as Omit<Employee, 'passwordHash'>;
  }

  async findByEmailWithPassword(email: string): Promise<Employee | null> {
    return this.employeeRepo.findOne({
      where: { email: email.toLowerCase().trim(), isDeleted: false },
    });
  }

  async update(
    id: number,
    data: {
      fullName?: string;
      email?: string;
      password?: string;
      role?: Role;
      department?: string;
      position?: string;
      workStartTime?: string;
      workEndTime?: string;
    },
  ): Promise<Omit<Employee, 'passwordHash'>> {
    const employee = await this.employeeRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!employee) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan.`);
    }

    if (data.email && data.email.toLowerCase() !== employee.email.toLowerCase()) {
      const existing = await this.employeeRepo.findOne({
        where: { email: data.email.toLowerCase().trim() },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Email ${data.email} sudah digunakan.`);
      }
      employee.email = data.email.toLowerCase().trim();
    }

    if (data.fullName) employee.fullName = data.fullName.trim();
    if (data.department !== undefined) employee.department = data.department;
    if (data.position !== undefined) employee.position = data.position;
    if (data.role) employee.role = data.role;
    if (data.workStartTime !== undefined) employee.workStartTime = data.workStartTime;
    if (data.workEndTime !== undefined) employee.workEndTime = data.workEndTime;
    if (data.password) {
      employee.passwordHash = await bcrypt.hash(data.password, 12);
    }

    const saved = await this.employeeRepo.save(employee);
    const { passwordHash: _, ...result } = saved;
    return result as Omit<Employee, 'passwordHash'>;
  }

  async softDelete(id: number): Promise<{ success: boolean; message: string }> {
    const employee = await this.employeeRepo.findOne({
      where: { id, isDeleted: false },
    });
    if (!employee) {
      throw new NotFoundException(`Karyawan dengan ID ${id} tidak ditemukan.`);
    }

    employee.isDeleted = true;
    await this.employeeRepo.save(employee);

    return {
      success: true,
      message: `Karyawan ${employee.fullName} (${employee.employeeCode}) berhasil dinonaktifkan.`,
    };
  }

  private async generateNextEmployeeCode(): Promise<string> {
    const last = await this.employeeRepo
      .createQueryBuilder('e')
      .withDeleted()
      .orderBy('e.id', 'DESC')
      .getOne();

    const nextId = (last?.id || 0) + 1;
    return `EMP-${String(nextId).padStart(4, '0')}`;
  }
}
