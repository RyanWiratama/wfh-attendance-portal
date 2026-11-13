import {
  Injectable,
  Inject,
  BadRequestException,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import {
  AttendanceStatus,
  AttendanceType,
  JakartaClock,
  STORAGE_SERVICE,
  LocalStorageService,
  PaginatedResultDto,
} from '@app/common';
import { Attendance } from './entities/attendance.entity';
import { AttendanceLog } from './entities/attendance-log.entity';
import { WorkSchedule } from './entities/work-schedule.entity';
import { evaluateCheckInLateness } from './rules/attendance.rules';

@Injectable()
export class AttendanceService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(Attendance)
    private readonly attendanceRepo: Repository<Attendance>,
    @InjectRepository(AttendanceLog)
    private readonly logRepo: Repository<AttendanceLog>,
    @InjectRepository(WorkSchedule)
    private readonly scheduleRepo: Repository<WorkSchedule>,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: LocalStorageService,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultSchedule();
  }

  async getTodayStatus(employeeId: number) {
    const today = JakartaClock.todayDateString();
    const attendance = await this.attendanceRepo.findOne({
      where: { employeeId, workDate: today },
      relations: { logs: true },
    });

    return {
      hasCheckedIn: !!attendance?.checkInTime,
      hasCheckedOut: !!attendance?.checkOutTime,
      attendance: attendance || null,
    };
  }

  async checkIn(
    employeeId: number,
    photoBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    notes?: string,
    customWorkStartTime?: string,
  ): Promise<Attendance> {
    const today = JakartaClock.todayDateString();
    const now = JakartaClock.now().toDate();

    const schedule = await this.getDefaultSchedule();
    const activeSchedule = customWorkStartTime
      ? { ...schedule, workStartTime: customWorkStartTime }
      : schedule;
    const lateness = evaluateCheckInLateness(now, today, activeSchedule as WorkSchedule);

    // Save photo first
    const photoPath = await this.storageService.saveFile(
      photoBuffer,
      originalFilename,
      mimeType,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Pessimistic write lock to prevent race conditions
      let attendance = await queryRunner.manager.findOne(Attendance, {
        where: { employeeId, workDate: today },
        lock: { mode: 'pessimistic_write' },
      });

      if (attendance && attendance.checkInTime) {
        throw new ConflictException(
          'Anda sudah melakukan Check-In untuk hari ini.',
        );
      }

      if (!attendance) {
        attendance = queryRunner.manager.create(Attendance, {
          employeeId,
          workDate: today,
          status: lateness.isLate ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
        });
      }

      attendance.checkInTime = now;
      attendance.checkInPhotoPath = photoPath;
      attendance.checkInNotes = notes;
      attendance.isLate = lateness.isLate;
      attendance.lateMinutes = lateness.lateMinutes;
      attendance.status = lateness.isLate
        ? AttendanceStatus.LATE
        : AttendanceStatus.PRESENT;

      const savedAttendance = await queryRunner.manager.save(
        Attendance,
        attendance,
      );

      const log = queryRunner.manager.create(AttendanceLog, {
        attendanceId: savedAttendance.id,
        type: AttendanceType.CHECK_IN,
        timestamp: now,
        photoPath,
        notes,
      });
      await queryRunner.manager.save(AttendanceLog, log);

      await queryRunner.commitTransaction();
      return savedAttendance;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await this.storageService.deleteFile(photoPath);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async checkOut(
    employeeId: number,
    photoBuffer: Buffer,
    originalFilename: string,
    mimeType: string,
    notes?: string,
  ): Promise<Attendance> {
    const today = JakartaClock.todayDateString();
    const now = JakartaClock.now().toDate();

    const photoPath = await this.storageService.saveFile(
      photoBuffer,
      originalFilename,
      mimeType,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const attendance = await queryRunner.manager.findOne(Attendance, {
        where: { employeeId, workDate: today },
        lock: { mode: 'pessimistic_write' },
      });

      if (!attendance || !attendance.checkInTime) {
        throw new BadRequestException(
          'Anda belum melakukan Check-In hari ini. Check-In terlebih dahulu.',
        );
      }

      if (attendance.checkOutTime) {
        throw new ConflictException(
          'Anda sudah melakukan Check-Out untuk hari ini.',
        );
      }

      attendance.checkOutTime = now;
      attendance.checkOutPhotoPath = photoPath;
      attendance.checkOutNotes = notes;

      const savedAttendance = await queryRunner.manager.save(
        Attendance,
        attendance,
      );

      const log = queryRunner.manager.create(AttendanceLog, {
        attendanceId: savedAttendance.id,
        type: AttendanceType.CHECK_OUT,
        timestamp: now,
        photoPath,
        notes,
      });
      await queryRunner.manager.save(AttendanceLog, log);

      await queryRunner.commitTransaction();
      return savedAttendance;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      await this.storageService.deleteFile(photoPath);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getMyHistory(
    employeeId: number,
    query: { page?: number; limit?: number },
  ): Promise<PaginatedResultDto<Attendance>> {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.attendanceRepo.findAndCount({
      where: { employeeId },
      order: { workDate: 'DESC' },
      skip,
      take: pageSize,
      relations: { logs: true },
    });

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async getMonitoring(query: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    status?: AttendanceStatus;
  }): Promise<PaginatedResultDto<Attendance>> {
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.max(1, Math.min(100, query.limit || 10));
    const skip = (page - 1) * pageSize;

    const qb = this.attendanceRepo.createQueryBuilder('att');

    if (query.startDate && query.endDate) {
      qb.andWhere('att.workDate BETWEEN :start AND :end', {
        start: query.startDate,
        end: query.endDate,
      });
    } else if (query.startDate) {
      qb.andWhere('att.workDate >= :start', { start: query.startDate });
    } else if (query.endDate) {
      qb.andWhere('att.workDate <= :end', { end: query.endDate });
    }

    if (query.status) {
      qb.andWhere('att.status = :status', { status: query.status });
    }

    qb.orderBy('att.workDate', 'DESC')
      .addOrderBy('att.id', 'DESC')
      .skip(skip)
      .take(pageSize);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize) || 1,
    };
  }

  async getSchedules(): Promise<WorkSchedule[]> {
    return this.scheduleRepo.find({ order: { id: 'ASC' } });
  }

  async updateSchedule(
    id: number,
    data: Partial<WorkSchedule>,
  ): Promise<WorkSchedule> {
    const schedule = await this.scheduleRepo.findOne({ where: { id } });
    if (!schedule) {
      throw new NotFoundException(`Jadwal kerja dengan ID ${id} tidak ditemukan.`);
    }

    Object.assign(schedule, data);
    return this.scheduleRepo.save(schedule);
  }

  private async getDefaultSchedule(): Promise<WorkSchedule> {
    let schedule = await this.scheduleRepo.findOne({
      where: { isDefault: true },
    });
    if (!schedule) {
      schedule = await this.ensureDefaultSchedule();
    }
    return schedule;
  }

  private async ensureDefaultSchedule(): Promise<WorkSchedule> {
    let schedule = await this.scheduleRepo.findOne({
      where: { code: 'STANDARD_WFH' },
    });

    if (!schedule) {
      schedule = this.scheduleRepo.create({
        code: 'STANDARD_WFH',
        name: 'Jam Kerja Standar WFH',
        workStartTime: '08:00:00',
        workEndTime: '17:00:00',
        lateToleranceMinutes: 15,
        isDefault: true,
      });
      await this.scheduleRepo.save(schedule);
    }

    return schedule;
  }
}
