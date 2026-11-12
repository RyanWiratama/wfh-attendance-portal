export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
}

export enum AttendanceType {
  CHECK_IN = 'CHECK_IN',
  CHECK_OUT = 'CHECK_OUT',
}

export interface WorkSchedule {
  id: number;
  code: string;
  name: string;
  workStartTime: string;
  workEndTime: string;
  lateToleranceMinutes: number;
  isDefault: boolean;
}

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  workDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  checkInPhotoPath?: string;
  checkOutPhotoPath?: string;
  checkInNotes?: string;
  checkOutNotes?: string;
  isLate: boolean;
  lateMinutes: number;
  status: AttendanceStatus;
  employee?: {
    id: number;
    employeeCode: string;
    fullName: string;
    department?: string;
  };
}

export interface TodayAttendance {
  hasCheckedIn: boolean;
  hasCheckedOut: boolean;
  attendance: AttendanceRecord | null;
}
