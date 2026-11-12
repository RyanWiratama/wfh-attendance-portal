import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('work_schedules')
export class WorkSchedule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'time', default: '08:00:00' })
  workStartTime: string;

  @Column({ type: 'time', default: '17:00:00' })
  workEndTime: string;

  @Column({ type: 'int', default: 15 })
  lateToleranceMinutes: number;

  @Column({ default: true })
  isDefault: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
