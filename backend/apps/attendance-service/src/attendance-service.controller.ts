import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AttendanceService } from './attendance-service.service';
import { AttendanceStatus } from '@app/common';
import { WorkSchedule } from './entities/work-schedule.entity';

@Controller()
export class AttendanceServiceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @MessagePattern('attendance.today')
  async getToday(@Payload() employeeId: number) {
    return this.attendanceService.getTodayStatus(employeeId);
  }

  @MessagePattern('attendance.check_in')
  async checkIn(
    @Payload()
    payload: {
      employeeId: number;
      photoBuffer: { type: 'Buffer'; data: number[] };
      originalFilename: string;
      mimeType: string;
      notes?: string;
      workStartTime?: string;
    },
  ) {
    const buffer = Buffer.from(payload.photoBuffer.data);
    return this.attendanceService.checkIn(
      payload.employeeId,
      buffer,
      payload.originalFilename,
      payload.mimeType,
      payload.notes,
      payload.workStartTime,
    );
  }

  @MessagePattern('attendance.check_out')
  async checkOut(
    @Payload()
    payload: {
      employeeId: number;
      photoBuffer: { type: 'Buffer'; data: number[] };
      originalFilename: string;
      mimeType: string;
      notes?: string;
    },
  ) {
    const buffer = Buffer.from(payload.photoBuffer.data);
    return this.attendanceService.checkOut(
      payload.employeeId,
      buffer,
      payload.originalFilename,
      payload.mimeType,
      payload.notes,
    );
  }

  @MessagePattern('attendance.my_history')
  async getMyHistory(
    @Payload()
    payload: {
      employeeId: number;
      query: { page?: number; limit?: number };
    },
  ) {
    return this.attendanceService.getMyHistory(payload.employeeId, payload.query);
  }

  @MessagePattern('attendance.monitoring')
  async getMonitoring(
    @Payload()
    query: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      status?: AttendanceStatus;
    },
  ) {
    return this.attendanceService.getMonitoring(query);
  }

  @MessagePattern('attendance.schedules')
  async getSchedules() {
    return this.attendanceService.getSchedules();
  }

  @MessagePattern('attendance.update_schedule')
  async updateSchedule(
    @Payload()
    payload: {
      id: number;
      data: Partial<WorkSchedule>;
    },
  ) {
    return this.attendanceService.updateSchedule(payload.id, payload.data);
  }
}
