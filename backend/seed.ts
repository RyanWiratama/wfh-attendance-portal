import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Employee } from './apps/employee-service/src/entities/employee.entity';
import { Role } from './libs/common/src/enums/role.enum';

async function seed() {
  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'wfh_user',
    password: process.env.DB_PASSWORD || 'wfh_secret_pass',
    database: process.env.DB_NAME || 'wfh_employee',
    entities: [Employee],
    synchronize: true,
  });

  await dataSource.initialize();
  console.log('Connected to MySQL wfh_employee for seeding...');

  const employeeRepo = dataSource.getRepository(Employee);

  // 1. Seed HR Admin
  const existingAdmin = await employeeRepo.findOne({
    where: { email: 'admin@company.com' },
  });
  if (!existingAdmin) {
    const adminPassHash = await bcrypt.hash('AdminWFH#2026', 12);
    const admin = employeeRepo.create({
      employeeCode: 'EMP-0001',
      fullName: 'HR Administrator',
      email: 'admin@company.com',
      passwordHash: adminPassHash,
      role: Role.ADMIN,
      department: 'Human Resources',
      position: 'HR Manager',
      isDeleted: false,
    });
    await employeeRepo.save(admin);
    console.log('Seeded HR Admin: admin@company.com / AdminWFH#2026 (EMP-0001)');
  } else {
    console.log('ℹ HR Admin already exists.');
  }

  // 2. Seed Employee - Ryan Wiratama
  const existingRyan = await employeeRepo.findOne({
    where: { email: 'ryanwiratama@gmail.com' },
  });
  if (!existingRyan) {
    const ryanPassHash = await bcrypt.hash('RyanWFH#2026', 12);
    const ryan = employeeRepo.create({
      employeeCode: 'EMP-0002',
      fullName: 'Ryan Wiratama',
      email: 'ryanwiratama@gmail.com',
      passwordHash: ryanPassHash,
      role: Role.EMPLOYEE,
      department: 'Information Technology',
      position: 'Fullstack Web Developer',
      isDeleted: false,
    });
    await employeeRepo.save(ryan);
    console.log('Seeded Employee: ryanwiratama@gmail.com / RyanWFH#2026 (EMP-0002)');
  } else {
    console.log('ℹ Employee Ryan already exists.');
  }

  // 3. Seed Employee - Budi Santoso (Demo Account)
  const existingBudi = await employeeRepo.findOne({
    where: { email: 'budi@company.com' },
  });
  if (!existingBudi) {
    const budiPassHash = await bcrypt.hash('BudiWFH#2026', 12);
    const budi = employeeRepo.create({
      employeeCode: 'EMP-0003',
      fullName: 'Budi Santoso',
      email: 'budi@company.com',
      passwordHash: budiPassHash,
      role: Role.EMPLOYEE,
      department: 'Engineering',
      position: 'Software Engineer',
      isDeleted: false,
    });
    await employeeRepo.save(budi);
    console.log('Seeded Employee: budi@company.com / BudiWFH#2026 (EMP-0003)');
  } else {
    console.log('ℹ Employee Budi already exists.');
  }

  await dataSource.destroy();
  console.log('Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
