import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { AttendanceType } from '@app/common';

@Entity('attendance_logs')
export class AttendanceLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  attendanceId: number;

  @Column({
    type: 'enum',
    enum: AttendanceType,
  })
  type: AttendanceType;

  @Column({ type: 'datetime' })
  timestamp: Date;

  @Column({ length: 255 })
  photoPath: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @ManyToOne('Attendance', 'logs', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendanceId' })
  attendance?: any;

  @CreateDateColumn()
  createdAt: Date;
}
