import dayjs from 'dayjs';
import { JakartaClock } from '@app/common';
import { WorkSchedule } from '../entities/work-schedule.entity';

export interface LateEvaluationResult {
  isLate: boolean;
  lateMinutes: number;
  scheduledStartTime: Date;
  actualCheckInTime: Date;
  lateThresholdTime: Date;
}

export function evaluateCheckInLateness(
  actualCheckIn: Date,
  workDateStr: string,
  schedule: WorkSchedule,
): LateEvaluationResult {
  const checkInJakarta = dayjs(actualCheckIn).tz('Asia/Jakarta');

  const scheduledStart = JakartaClock.combineDateAndTime(
    workDateStr,
    schedule.workStartTime,
  );
  const scheduledStartDayjs = dayjs(scheduledStart);

  const lateThreshold = scheduledStartDayjs.add(
    schedule.lateToleranceMinutes,
    'minute',
  );

  const isLate = checkInJakarta.isAfter(lateThreshold);

  let lateMinutes = 0;
  if (isLate) {
    lateMinutes = checkInJakarta.diff(scheduledStartDayjs, 'minute');
  }

  return {
    isLate,
    lateMinutes: Math.max(0, lateMinutes),
    scheduledStartTime: scheduledStart,
    actualCheckInTime: actualCheckIn,
    lateThresholdTime: lateThreshold.toDate(),
  };
}
