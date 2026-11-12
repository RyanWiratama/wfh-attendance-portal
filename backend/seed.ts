import { DataSource, Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';
import * as bcrypt from 'bcryptjs';

export enum Role {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ length: 20 })
  employeeCode: string;

  @Column({ length: 100 })
  fullName: string;

  @Index({ unique: true })
  @Column({ length: 150 })
  email: string;

  @Column({ length: 255 })
  passwordHash: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.EMPLOYEE,
  })
  role: Role;

  @Column({ length: 100, nullable: true })
  department?: string;

  @Column({ length: 100, nullable: true })
  position?: string;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

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

  // 1. Seed / Update HR Admin
  let admin = await employeeRepo.findOne({
    where: { email: 'admin@company.com' },
  });
  const adminPassHash = await bcrypt.hash('AdminWFH#2026', 12);
  if (!admin) {
    admin = employeeRepo.create({
      employeeCode: 'EMP-0001',
      fullName: 'HR Administrator',
      email: 'admin@company.com',
      passwordHash: adminPassHash,
      role: Role.ADMIN,
      department: 'Human Resources',
      position: 'HR Manager',
      isDeleted: false,
    });
  } else {
    admin.passwordHash = adminPassHash;
    admin.isDeleted = false;
  }
  await employeeRepo.save(admin);
  console.log('✔ HR Admin ready: admin@company.com / AdminWFH#2026 (EMP-0001)');

  // 2. Seed / Update Budi Santoso (Demo Account)
  let budi = await employeeRepo.findOne({
    where: { email: 'budi@company.com' },
  });
  const budiPassHash = await bcrypt.hash('BudiWFH#2026', 12);
  if (!budi) {
    budi = employeeRepo.create({
      employeeCode: 'EMP-0002',
      fullName: 'Budi Santoso',
      email: 'budi@company.com',
      passwordHash: budiPassHash,
      role: Role.EMPLOYEE,
      department: 'Engineering',
      position: 'Software Engineer',
      isDeleted: false,
    });
  } else {
    budi.passwordHash = budiPassHash;
    budi.isDeleted = false;
  }
  await employeeRepo.save(budi);
  console.log('✔ Employee ready: budi@company.com / BudiWFH#2026 (EMP-0002)');

  // 3. Seed / Update Ryan Wiratama
  let ryan = await employeeRepo.findOne({
    where: { email: 'ryanwiratama@gmail.com' },
  });
  const ryanPassHash = await bcrypt.hash('RyanWFH#2026', 12);
  if (!ryan) {
    ryan = employeeRepo.create({
      employeeCode: 'EMP-0003',
      fullName: 'Ryan Wiratama',
      email: 'ryanwiratama@gmail.com',
      passwordHash: ryanPassHash,
      role: Role.EMPLOYEE,
      department: 'Information Technology',
      position: 'Fullstack Web Developer',
      isDeleted: false,
    });
  } else {
    ryan.passwordHash = ryanPassHash;
    ryan.isDeleted = false;
  }
  await employeeRepo.save(ryan);
  console.log('✔ Employee ready: ryanwiratama@gmail.com / RyanWFH#2026 (EMP-0003)');

  await dataSource.destroy();
  console.log('🎉 Seeding completed successfully!');
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
