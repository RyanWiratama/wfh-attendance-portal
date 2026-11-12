import { evaluateCheckInLateness } from '../attendance.rules';
import { WorkSchedule } from '../../entities/work-schedule.entity';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

describe('Attendance Rules (WIB Work Hours & Late Evaluation)', () => {
  const defaultSchedule: WorkSchedule = {
    id: 1,
    code: 'STANDARD_WFH',
    name: 'Standard WFH Schedule',
    workStartTime: '08:00:00',
    workEndTime: '17:00:00',
    lateToleranceMinutes: 15,
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const workDate = '2026-11-12';

  it('should mark as on-time when checking in before 08:00 WIB', () => {
    const checkIn = dayjs.tz('2026-11-12T07:55:00', 'Asia/Jakarta').toDate();
    const result = evaluateCheckInLateness(checkIn, workDate, defaultSchedule);

    expect(result.isLate).toBe(false);
    expect(result.lateMinutes).toBe(0);
  });

  it('should mark as on-time when checking in within the 15-minute tolerance (e.g. 08:14 WIB)', () => {
    const checkIn = dayjs.tz('2026-11-12T08:14:00', 'Asia/Jakarta').toDate();
    const result = evaluateCheckInLateness(checkIn, workDate, defaultSchedule);

    expect(result.isLate).toBe(false);
    expect(result.lateMinutes).toBe(0);
  });

  it('should mark as on-time exactly at tolerance threshold 08:15:00 WIB', () => {
    const checkIn = dayjs.tz('2026-11-12T08:15:00', 'Asia/Jakarta').toDate();
    const result = evaluateCheckInLateness(checkIn, workDate, defaultSchedule);

    expect(result.isLate).toBe(false);
    expect(result.lateMinutes).toBe(0);
  });

  it('should mark as late when checking in past tolerance (e.g. 08:16 WIB)', () => {
    const checkIn = dayjs.tz('2026-11-12T08:16:00', 'Asia/Jakarta').toDate();
    const result = evaluateCheckInLateness(checkIn, workDate, defaultSchedule);

    expect(result.isLate).toBe(true);
    expect(result.lateMinutes).toBe(16);
  });

  it('should accurately calculate late minutes for late check-in (e.g. 08:45 WIB -> 45 minutes late)', () => {
    const checkIn = dayjs.tz('2026-11-12T08:45:00', 'Asia/Jakarta').toDate();
    const result = evaluateCheckInLateness(checkIn, workDate, defaultSchedule);

    expect(result.isLate).toBe(true);
    expect(result.lateMinutes).toBe(45);
  });
});
