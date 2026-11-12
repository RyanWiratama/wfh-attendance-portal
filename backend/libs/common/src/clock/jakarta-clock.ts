import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export const JAKARTA_TZ = 'Asia/Jakarta';

export class JakartaClock {
  static now(): dayjs.Dayjs {
    return dayjs().tz(JAKARTA_TZ);
  }

  static todayDateString(): string {
    return this.now().format('YYYY-MM-DD');
  }

  static nowTimeString(): string {
    return this.now().format('HH:mm:ss');
  }

  static parse(dateStr: string): dayjs.Dayjs {
    return dayjs.tz(dateStr, JAKARTA_TZ);
  }

  static combineDateAndTime(dateStr: string, timeStr: string): Date {
    const cleanTime = timeStr.length === 5 ? `${timeStr}:00` : timeStr;
    const combinedStr = `${dateStr}T${cleanTime}`;
    return dayjs.tz(combinedStr, JAKARTA_TZ).toDate();
  }
}
