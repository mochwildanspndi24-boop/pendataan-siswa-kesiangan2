export interface Class {
  id: string;
  name: string;
  createdAt?: number;
}

export interface Student {
  id: string;
  name: string;
  classId: string;
  className: string;
  createdAt?: number;
}

export interface AttendanceRecord {
  count: number;
  times: string[];
  studentName: string;
  className: string;
  lastUpdated: number;
}

export interface DailyAttendance {
  [studentId: string]: AttendanceRecord;
}

export interface Settings {
  lateTime: string;
  password: string;
}

export interface ReportRow {
  studentName: string;
  className: string;
  date: string;
  count: number;
  times: string;
}
