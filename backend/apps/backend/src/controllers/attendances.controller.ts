import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Inject,
  ParseIntPipe,
  BadRequestException,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import * as fs from 'fs';
import { firstValueFrom } from 'rxjs';
import {
  ATTENDANCE_SERVICE,
  EMPLOYEE_SERVICE,
  Role,
  Roles,
  RolesGuard,
  CurrentUser,
  AttendanceStatus,
  STORAGE_SERVICE,
  LocalStorageService,
} from '@app/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Attendances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendances')
export class AttendancesController {
  constructor(
    @Inject(ATTENDANCE_SERVICE)
    private readonly attendanceClient: ClientProxy,
    @Inject(EMPLOYEE_SERVICE)
    private readonly employeeClient: ClientProxy,
    @Inject(STORAGE_SERVICE)
    private readonly storageService: LocalStorageService,
  ) {}

  @Get('today')
  @ApiOperation({ summary: 'Status presensi hari ini untuk user yang login' })
  async getTodayStatus(@CurrentUser('userId') userId: number) {
    const todayStatus = await firstValueFrom(
      this.attendanceClient.send('attendance.today', userId),
    );

    const schedule = {
      workStartTime: '08:00:00',
      workEndTime: '17:00:00',
      lateToleranceMinutes: 15,
    };

    try {
      const employee = await firstValueFrom(
        this.employeeClient.send('employee.find_by_id', userId),
      );
      if (employee?.workStartTime) {
        schedule.workStartTime = employee.workStartTime;
      }
      if (employee?.workEndTime) {
        schedule.workEndTime = employee.workEndTime;
      }
    } catch {
      // fallback
    }

    return {
      ...todayStatus,
      schedule,
    };
  }

  @Post('check-in')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit Check-In WFH dengan upload foto selfie' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' },
        notes: { type: 'string' },
      },
      required: ['photo'],
    },
  })
  async checkIn(
    @CurrentUser('userId') userId: number,
    @UploadedFile() file: any,
    @Body('notes') notes?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Foto selfie bukti WFH wajib diunggah.');
    }

    let workStartTime: string | undefined;
    try {
      const employee = await firstValueFrom(
        this.employeeClient.send('employee.find_by_id', userId),
      );
      if (employee?.workStartTime) {
        workStartTime = employee.workStartTime;
      }
    } catch {
      // fallback
    }

    return firstValueFrom(
      this.attendanceClient.send('attendance.check_in', {
        employeeId: userId,
        photoBuffer: file.buffer,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        notes,
        workStartTime,
      }),
    );
  }

  @Post('check-out')
  @UseInterceptors(FileInterceptor('photo'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Submit Check-Out WFH dengan upload foto selfie' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' },
        notes: { type: 'string' },
      },
      required: ['photo'],
    },
  })
  async checkOut(
    @CurrentUser('userId') userId: number,
    @UploadedFile() file: any,
    @Body('notes') notes?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Foto selfie bukti WFH wajib diunggah.');
    }

    return firstValueFrom(
      this.attendanceClient.send('attendance.check_out', {
        employeeId: userId,
        photoBuffer: file.buffer,
        originalFilename: file.originalname,
        mimeType: file.mimetype,
        notes,
      }),
    );
  }

  @Get('my-history')
  @ApiOperation({ summary: 'Riwayat presensi WFH user yang sedang login' })
  async getMyHistory(
    @CurrentUser('userId') userId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return firstValueFrom(
      this.attendanceClient.send('attendance.my_history', {
        employeeId: userId,
        query: {
          page: page ? Number(page) : 1,
          limit: limit ? Number(limit) : 10,
        },
      }),
    );
  }

  @Get('monitoring')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Monitoring kehadiran seluruh karyawan (HR Admin)' })
  async getMonitoring(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('search') search?: string,
    @Query('status') status?: AttendanceStatus,
  ) {
    const result = await firstValueFrom(
      this.attendanceClient.send('attendance.monitoring', {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 10,
        startDate,
        endDate,
        status,
      }),
    );

    // Populate employee details for display
    if (result && result.items && result.items.length > 0) {
      const enrichedItems = await Promise.all(
        result.items.map(async (item: any) => {
          try {
            const employee = await firstValueFrom(
              this.employeeClient.send('employee.find_by_id', item.employeeId),
            );
            return { ...item, employee };
          } catch {
            return item;
          }
        }),
      );
      result.items = enrichedItems;
    }

    return result;
  }

  @Get('schedules')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Daftar jadwal jam kerja perusahaan' })
  async getSchedules() {
    return firstValueFrom(this.attendanceClient.send('attendance.schedules', {}));
  }

  @Patch('schedules/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Perbarui konfigurasi jadwal kerja dan toleransi' })
  async updateSchedule(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    dto: {
      name?: string;
      workStartTime?: string;
      workEndTime?: string;
      lateToleranceMinutes?: number;
    },
  ) {
    return firstValueFrom(
      this.attendanceClient.send('attendance.update_schedule', {
        id,
        data: dto,
      }),
    );
  }

  @Get('photos/:filename')
  @ApiOperation({ summary: 'Stream foto bukti presensi privat (hanya terotentikasi)' })
  async streamPhoto(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const filePath = this.storageService.getFilePath(filename);

    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    const contentType = (ext && mimeMap[ext]) || 'application/octet-stream';

    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=86400',
    });

    const fileStream = fs.createReadStream(filePath);
    return new StreamableFile(fileStream);
  }
}
