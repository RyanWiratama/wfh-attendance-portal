import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { AttendanceStatus } from '@app/common';
import { AttendanceLog } from './attendance-log.entity';

@Entity('attendances')
@Index(['employeeId', 'workDate'], { unique: true })
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  employeeId: number;

  @Column({ type: 'date' })
  workDate: string;

  @Column({ type: 'datetime', nullable: true })
  checkInTime?: Date;

  @Column({ type: 'datetime', nullable: true })
  checkOutTime?: Date;

  @Column({ length: 255, nullable: true })
  checkInPhotoPath?: string;

  @Column({ length: 255, nullable: true })
  checkOutPhotoPath?: string;

  @Column({ type: 'text', nullable: true })
  checkInNotes?: string;

  @Column({ type: 'text', nullable: true })
  checkOutNotes?: string;

  @Column({ default: false })
  isLate: boolean;

  @Column({ type: 'int', default: 0 })
  lateMinutes: number;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.PRESENT,
  })
  status: AttendanceStatus;

  @OneToMany(() => AttendanceLog, (log) => log.attendance, { cascade: true })
  logs: AttendanceLog[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
